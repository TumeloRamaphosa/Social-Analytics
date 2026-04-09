import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { knowledgeDocs, ragIndex } from "../../drizzle/schema";
import { eq, desc, like, or, and } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";

// ─── Chunk text into ~500-character segments ─────────────────────────────────
function chunkText(text: string, chunkSize = 500): string[] {
  const paragraphs = text.split(/\n{2,}/);
  const chunks: string[] = [];
  let current = "";

  for (const para of paragraphs) {
    if ((current + para).length > chunkSize && current.length > 0) {
      chunks.push(current.trim());
      current = para;
    } else {
      current += (current ? "\n\n" : "") + para;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.filter(c => c.length > 30);
}

export const knowledgeRouter = router({
  // ─── Ingest a document into the knowledge base ───────────────────────────
  ingest: protectedProcedure
    .input(z.object({
      title: z.string().min(1),
      content: z.string().min(10),
      source: z.string().optional().default("manual"),
      docType: z.enum(["research", "transcript", "report", "notes", "strategy", "client"]).default("notes"),
      tags: z.array(z.string()).optional().default([]),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Save the document
      const [inserted] = await db.insert(knowledgeDocs).values({
        userId: ctx.user.id,
        title: input.title,
        content: input.content,
        source: input.source,
        docType: input.docType,
        tags: input.tags,
        chunkCount: 0,
      });
      const docId = (inserted as any).insertId as number;

      // Chunk and index into ragIndex
      const chunks = chunkText(input.content);
      for (const chunk of chunks) {
        await db.insert(ragIndex).values({
          chunkType: `doc_${input.docType}`,
          content: `[${input.title}] ${chunk}`,
        });
      }

      // Update chunk count
      await db.update(knowledgeDocs)
        .set({ chunkCount: chunks.length })
        .where(eq(knowledgeDocs.id, docId));

      return { docId, chunkCount: chunks.length, title: input.title };
    }),

  // ─── List all knowledge documents ────────────────────────────────────────
  list: protectedProcedure
    .input(z.object({
      search: z.string().optional(),
      docType: z.enum(["research", "transcript", "report", "notes", "strategy", "client", "all"]).optional().default("all"),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const conditions = [eq(knowledgeDocs.userId, ctx.user.id)];
      if (input.search) {
        conditions.push(
          or(
            like(knowledgeDocs.title, `%${input.search}%`),
            like(knowledgeDocs.content, `%${input.search}%`)
          ) as any
        );
      }
      if (input.docType !== "all") {
        conditions.push(eq(knowledgeDocs.docType, input.docType));
      }

      const docs = await db.select({
        id: knowledgeDocs.id,
        title: knowledgeDocs.title,
        source: knowledgeDocs.source,
        docType: knowledgeDocs.docType,
        tags: knowledgeDocs.tags,
        chunkCount: knowledgeDocs.chunkCount,
        createdAt: knowledgeDocs.createdAt,
      })
        .from(knowledgeDocs)
        .where(and(...conditions))
        .orderBy(desc(knowledgeDocs.createdAt))
        .limit(50);

      return docs;
    }),

  // ─── Delete a knowledge document ─────────────────────────────────────────
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.delete(knowledgeDocs)
        .where(and(eq(knowledgeDocs.id, input.id), eq(knowledgeDocs.userId, ctx.user.id)));
      return { success: true };
    }),

  // ─── Keyword search across ragIndex ──────────────────────────────────────
  search: protectedProcedure
    .input(z.object({ query: z.string().min(2) }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const keywords = input.query.split(/\s+/).filter(k => k.length > 2);
      const results: any[] = [];

      for (const keyword of keywords.slice(0, 5)) {
        const hits = await db.select()
          .from(ragIndex)
          .where(like(ragIndex.content, `%${keyword}%`))
          .limit(5);
        results.push(...hits);
      }

      // Deduplicate by id
      const seen = new Set<number>();
      const unique = results.filter(r => {
        if (seen.has(r.id)) return false;
        seen.add(r.id);
        return true;
      });

      return unique.slice(0, 10);
    }),

  // ─── Ask Brain: LLM-powered RAG query ────────────────────────────────────
  askBrain: protectedProcedure
    .input(z.object({ question: z.string().min(5) }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Step 1: Retrieve relevant chunks via keyword search
      const keywords = input.question.split(/\s+/).filter(k => k.length > 3).slice(0, 6);
      const contextChunks: string[] = [];
      const sources: string[] = [];

      for (const keyword of keywords) {
        const hits = await db.select()
          .from(ragIndex)
          .where(like(ragIndex.content, `%${keyword}%`))
          .limit(4);
        for (const hit of hits) {
          if (!contextChunks.includes(hit.content)) {
            contextChunks.push(hit.content);
            if (hit.domain) sources.push(hit.domain);
          }
        }
      }

      // Limit context to ~3000 chars
      const context = contextChunks.slice(0, 12).join("\n\n---\n\n").substring(0, 3000);

      // Step 2: Send to LLM with context
      const systemPrompt = `You are the StudEx DevOps Super Brain — an AI assistant with access to the company's internal knowledge base.
      
Your role is to answer questions using the provided knowledge base context. Be specific, cite relevant details from the context, and give actionable insights.

If the context doesn't contain enough information to fully answer the question, say so clearly and provide what you can from the context.

Always structure your response clearly with:
1. A direct answer to the question
2. Supporting evidence from the knowledge base
3. Actionable recommendations where relevant

Knowledge Base Context:
${context || "No relevant documents found in the knowledge base yet. The user should ingest documents first."}`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: input.question },
        ],
      });

      const rawContent = response?.choices?.[0]?.message?.content;
      const answer = typeof rawContent === "string" ? rawContent : (Array.isArray(rawContent) ? rawContent.map((c: any) => c.text || "").join("") : "Unable to generate a response. Please try again.");

      return {
        answer,
        chunksUsed: contextChunks.length,
        sources: Array.from(new Set(sources)).slice(0, 5),
        question: input.question,
      };
    }),

  // ─── Get stats ────────────────────────────────────────────────────────────
  stats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    const docs = await db.select().from(knowledgeDocs).where(eq(knowledgeDocs.userId, ctx.user.id));
    const chunks = await db.select().from(ragIndex).limit(1000);

    return {
      totalDocs: docs.length,
      totalChunks: chunks.length,
      docsByType: docs.reduce((acc: Record<string, number>, d) => {
        acc[d.docType] = (acc[d.docType] || 0) + 1;
        return acc;
      }, {}),
    };
  }),
});
