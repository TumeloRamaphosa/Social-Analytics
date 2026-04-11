import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { eq, and, gte, lte, desc, sql, sum } from "drizzle-orm";
import { tokenUsage } from "../../drizzle/schema";

// Token pricing (USD per 1M tokens)
const TOKEN_PRICING: Record<string, { input: number; output: number }> = {
  "claude-3-5-sonnet": { input: 3.0, output: 15.0 },
  "claude-3-5-haiku": { input: 0.8, output: 4.0 },
  "claude-3-opus": { input: 15.0, output: 75.0 },
  "gpt-4o": { input: 2.5, output: 10.0 },
  "gpt-4o-mini": { input: 0.15, output: 0.6 },
  "gpt-image-1": { input: 3.0, output: 0 },
  "higgsfield-image": { input: 0, output: 0 },
  "higgsfield-video": { input: 0, output: 0 },
  "pollinations": { input: 0, output: 0 },
  "firecrawl": { input: 0, output: 0 },
  "default": { input: 1.0, output: 5.0 },
};

function calculateCost(service: string, model: string, inputTokens: number, outputTokens: number): number {
  const pricing = TOKEN_PRICING[model] || TOKEN_PRICING.default;
  const inputCost = (inputTokens / 1_000_000) * pricing.input;
  const outputCost = (outputTokens / 1_000_000) * pricing.output;
  return inputCost + outputCost;
}

export const tokenRouter = router({
  // Log a token usage entry
  log: protectedProcedure
    .input(z.object({
      service: z.string(),
      operation: z.string(),
      inputTokens: z.number().default(0),
      outputTokens: z.number().default(0),
      totalTokens: z.number().default(0),
      model: z.string().optional(),
      prompt: z.string().optional(),
      response: z.string().optional(),
      metadata: z.any().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      
      const workspaceId = ctx.user?.id ? 1 : 1; // Use default workspace for now
      const cost = calculateCost(input.service, input.model || "default", input.inputTokens, input.outputTokens);
      
      await db.insert(tokenUsage).values({
        workspaceId,
        userId: ctx.user?.id || 0,
        service: input.service,
        operation: input.operation,
        inputTokens: input.inputTokens,
        outputTokens: input.outputTokens,
        totalTokens: input.totalTokens,
        costUsd: cost,
        model: input.model,
        prompt: input.prompt,
        response: input.response,
        metadata: input.metadata,
      });
      
      return { success: true, cost };
    }),

  // Get token usage summary
  getSummary: protectedProcedure
    .input(z.object({
      startDate: z.date().optional(),
      endDate: z.date().optional(),
      service: z.string().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      
      const workspaceId = ctx.user?.id ? 1 : 1;
      const conditions = [eq(tokenUsage.workspaceId, workspaceId)];
      
      if (input?.startDate) {
        conditions.push(gte(tokenUsage.createdAt, input.startDate));
      }
      if (input?.endDate) {
        conditions.push(lte(tokenUsage.createdAt, input.endDate));
      }
      if (input?.service) {
        conditions.push(eq(tokenUsage.service, input.service));
      }

      // Get total by service
      const byService = await db
        .select({
          service: tokenUsage.service,
          totalTokens: sum(tokenUsage.totalTokens),
          totalCost: sum(tokenUsage.costUsd),
        })
        .from(tokenUsage)
        .where(and(...conditions))
        .groupBy(tokenUsage.service);

      // Get overall totals
      const overall = await db
        .select({
          totalTokens: sum(tokenUsage.totalTokens),
          totalCost: sum(tokenUsage.costUsd),
          count: sql<number>`count(*)`,
        })
        .from(tokenUsage)
        .where(and(...conditions));

      // Get daily breakdown (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const dailyBreakdown = await db
        .select({
          date: tokenUsage.createdAt,
          service: tokenUsage.service,
          tokens: sum(tokenUsage.totalTokens),
          cost: sum(tokenUsage.costUsd),
        })
        .from(tokenUsage)
        .where(and(
          eq(tokenUsage.workspaceId, workspaceId),
          gte(tokenUsage.createdAt, thirtyDaysAgo)
        ))
        .groupBy(tokenUsage.createdAt, tokenUsage.service)
        .orderBy(desc(tokenUsage.createdAt));

      return {
        byService: byService.map((s) => ({
          service: s.service,
          totalTokens: Number(s.totalTokens || 0),
          totalCost: Number(s.totalCost || 0),
        })),
        overall: {
          totalTokens: Number(overall[0]?.totalTokens || 0),
          totalCost: Number(overall[0]?.totalCost || 0),
          count: Number(overall[0]?.count || 0),
        },
        dailyBreakdown: dailyBreakdown.map((d) => ({
          date: d.date,
          service: d.service,
          tokens: Number(d.tokens || 0),
          cost: Number(d.cost || 0),
        })),
      };
    }),

  // Get recent usage entries
  getRecent: protectedProcedure
    .input(z.object({
      limit: z.number().default(50),
      service: z.string().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      
      const workspaceId = ctx.user?.id ? 1 : 1;
      const conditions = [eq(tokenUsage.workspaceId, workspaceId)];
      if (input?.service) {
        conditions.push(eq(tokenUsage.service, input.service));
      }

      const entries = await db
        .select({
          id: tokenUsage.id,
          service: tokenUsage.service,
          operation: tokenUsage.operation,
          inputTokens: tokenUsage.inputTokens,
          outputTokens: tokenUsage.outputTokens,
          totalTokens: tokenUsage.totalTokens,
          costUsd: tokenUsage.costUsd,
          model: tokenUsage.model,
          createdAt: tokenUsage.createdAt,
        })
        .from(tokenUsage)
        .where(and(...conditions))
        .orderBy(desc(tokenUsage.createdAt))
        .limit(input?.limit || 50);

      return entries.map((e) => ({
        ...e,
        inputTokens: Number(e.inputTokens),
        outputTokens: Number(e.outputTokens),
        totalTokens: Number(e.totalTokens),
        costUsd: Number(e.costUsd),
      }));
    }),

  // Get projections (monthly estimate)
  getProjection: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    
    const workspaceId = ctx.user?.id ? 1 : 1;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Get current month totals
    const currentMonth = await db
      .select({
        totalCost: sum(tokenUsage.costUsd),
        totalTokens: sum(tokenUsage.totalTokens),
      })
      .from(tokenUsage)
      .where(and(
        eq(tokenUsage.workspaceId, workspaceId),
        gte(tokenUsage.createdAt, startOfMonth)
      ));

    // Get last month for comparison
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    
    const lastMonth = await db
      .select({
        totalCost: sum(tokenUsage.costUsd),
        totalTokens: sum(tokenUsage.totalTokens),
      })
      .from(tokenUsage)
      .where(and(
        eq(tokenUsage.workspaceId, workspaceId),
        gte(tokenUsage.createdAt, lastMonthStart),
        lte(tokenUsage.createdAt, lastMonthEnd)
      ));

    const daysInMonth = now.getDate();
    const projectedMonthlyCost = Number(currentMonth[0]?.totalCost || 0) / daysInMonth * 30;
    const projectedMonthlyTokens = Number(currentMonth[0]?.totalTokens || 0) / daysInMonth * 30;

    return {
      currentMonth: {
        cost: Number(currentMonth[0]?.totalCost || 0),
        tokens: Number(currentMonth[0]?.totalTokens || 0),
      },
      lastMonth: {
        cost: Number(lastMonth[0]?.totalCost || 0),
        tokens: Number(lastMonth[0]?.totalTokens || 0),
      },
      projected: {
        cost: projectedMonthlyCost,
        tokens: projectedMonthlyTokens,
      },
      daysElapsed: daysInMonth,
    };
  }),
});