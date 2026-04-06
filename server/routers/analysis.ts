import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { analyses, analysisCache, ragIndex } from "../../drizzle/schema";
import { eq, desc, and, like } from "drizzle-orm";
import {
  fetchPage,
  extractDomain,
  lookupWhois,
  lookupDns,
  analyzeSeo,
  detectSocialProfiles,
  detectTechStack,
  generateAiSummary,
  generateMarkdownReport,
} from "../analysisEngine";

export const analysisRouter = router({
  // Start a new analysis
  analyze: protectedProcedure
    .input(z.object({ url: z.string().url() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const domain = extractDomain(input.url);
      const normalizedUrl = input.url.startsWith("http") ? input.url : `https://${input.url}`;

      // Check cache (24h)
      const cached = await db.select().from(analysisCache).where(eq(analysisCache.domain, domain)).limit(1);
      const now = new Date();
      const useCache = cached.length > 0 && new Date(cached[0].expiresAt) > now;

      // Create analysis record
      const [inserted] = await db.insert(analyses).values({
        userId: ctx.user.id,
        url: normalizedUrl,
        domain,
        status: "running",
        isCached: useCache,
      });

      const analysisId = (inserted as any).insertId as number;

      // Run analysis asynchronously (fire and forget, update DB when done)
      runAnalysis(db, analysisId, normalizedUrl, domain, useCache ? cached[0] : null).catch(console.error);

      return { analysisId, domain, status: "running" };
    }),

  // Get analysis by ID (poll for status)
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const result = await db.select().from(analyses)
        .where(and(eq(analyses.id, input.id), eq(analyses.userId, ctx.user.id)))
        .limit(1);
      return result[0] || null;
    }),

  // Get analysis history for current user
  getHistory: protectedProcedure
    .input(z.object({ limit: z.number().default(20), offset: z.number().default(0), search: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const conditions = [eq(analyses.userId, ctx.user.id)];
      if (input.search) conditions.push(like(analyses.domain, `%${input.search}%`));
      const results = await db.select().from(analyses)
        .where(and(...conditions))
        .orderBy(desc(analyses.createdAt))
        .limit(input.limit)
        .offset(input.offset);
      return results;
    }),

  // Delete analysis
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.delete(analyses).where(and(eq(analyses.id, input.id), eq(analyses.userId, ctx.user.id)));
      return { success: true };
    }),

  // Search RAG index
  searchRag: protectedProcedure
    .input(z.object({ query: z.string().min(3) }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      // Simple keyword search (full vector search would need external service)
      const results = await db.select().from(ragIndex)
        .where(like(ragIndex.content, `%${input.query}%`))
        .limit(10);
      return results;
    }),
});

// ─── Background analysis runner ───────────────────────────────────────────────
async function runAnalysis(db: any, analysisId: number, url: string, domain: string, cachedData: any) {
  try {
    let html = cachedData?.rawHtml || "";
    let headers: Record<string, string> = cachedData?.headers || {};
    let loadTimeMs = 0;
    let statusCode = 200;

    if (!html) {
      const fetched = await fetchPage(url);
      html = fetched.html;
      headers = fetched.headers;
      loadTimeMs = fetched.loadTimeMs;
      statusCode = fetched.statusCode;

      // Save to cache (24h)
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await db.insert(analysisCache).values({
        domain,
        rawHtml: html.substring(0, 65000), // MySQL TEXT limit
        headers: JSON.stringify(headers),
        technologies: JSON.stringify({}),
        metaTags: JSON.stringify({}),
        expiresAt,
      }).onDuplicateKeyUpdate({
        set: {
          rawHtml: html.substring(0, 65000),
          headers: JSON.stringify(headers),
          expiresAt,
        },
      });
    }

    // Run all analyses in parallel
    const [whoisData, dnsRecords, seoData, socialProfiles, techStack] = await Promise.all([
      lookupWhois(domain),
      lookupDns(domain),
      Promise.resolve(analyzeSeo(html, url, loadTimeMs, statusCode)),
      Promise.resolve(detectSocialProfiles(html, domain)),
      Promise.resolve(detectTechStack(html, headers)),
    ]);

    // AI summary
    const aiResult = await generateAiSummary(domain, seoData, techStack, socialProfiles);

    // Generate markdown report
    const reportMarkdown = generateMarkdownReport(
      domain, whoisData, seoData, socialProfiles, techStack, aiResult,
      new Date().toISOString().split("T")[0]
    );

    const totalFollowers = socialProfiles.reduce((sum, s) => sum + (s.followers || 0), 0);

    // Update analysis record
    await db.update(analyses).set({
      status: "completed",
      companyName: seoData.title?.split("|")[0]?.split("-")[0]?.trim() || domain,
      whoisData: JSON.stringify(whoisData),
      dnsRecords: JSON.stringify(dnsRecords),
      seoData: JSON.stringify(seoData),
      performanceScore: seoData.performanceScore,
      seoScore: seoData.seoScore,
      socialProfiles: JSON.stringify(socialProfiles),
      totalSocialFollowers: totalFollowers,
      techStack: JSON.stringify(techStack),
      competitiveData: JSON.stringify(aiResult.competitive),
      aiSummary: aiResult.summary,
      industryCategory: aiResult.industry,
      reportMarkdown,
      cachedAt: new Date(),
    }).where(eq(analyses.id, analysisId));

    // Index into RAG
    const ragChunks = [
      { chunkType: "summary", content: `${domain}: ${aiResult.summary}` },
      { chunkType: "seo", content: `${domain} SEO: Score ${seoData.seoScore}/100. Title: ${seoData.title}. Description: ${seoData.description}. Issues: ${seoData.issues?.join(", ")}` },
      { chunkType: "tech", content: `${domain} Tech Stack: CMS: ${techStack.cms || "unknown"}, Frameworks: ${techStack.frameworks?.join(", ")}, Hosting: ${techStack.hosting}` },
      { chunkType: "social", content: `${domain} Social Media: ${socialProfiles.filter(s => s.detected).map(s => s.platform).join(", ")}` },
      { chunkType: "competitive", content: `${domain} Competitive: Industry: ${aiResult.industry}. Strengths: ${aiResult.competitive?.strengths?.join(", ")}. Weaknesses: ${aiResult.competitive?.weaknesses?.join(", ")}` },
    ];

    for (const chunk of ragChunks) {
      await db.insert(ragIndex).values({
        analysisId,
        domain,
        chunkType: chunk.chunkType,
        content: chunk.content,
      });
    }

  } catch (err) {
    console.error("[Analysis] Failed:", err);
    await db.update(analyses).set({ status: "failed" }).where(eq(analyses.id, analysisId));
  }
}
