import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { integrations } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

const HF_API = "https://api.higgsfield.ai/v1";

// ─── Higgsfield API helper ────────────────────────────────────────────────────
async function hfPost(path: string, apiKey: string, body: Record<string, unknown>) {
  const res = await fetch(`${HF_API}${path}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Higgsfield API error: ${json?.message || json?.error || res.statusText}`,
    });
  }
  return json;
}

async function hfGet(path: string, apiKey: string) {
  const res = await fetch(`${HF_API}${path}`, {
    headers: { "Authorization": `Bearer ${apiKey}` },
  });
  const json = await res.json();
  if (!res.ok) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Higgsfield API error: ${json?.message || json?.error || res.statusText}`,
    });
  }
  return json;
}

// ─── Get stored integration ───────────────────────────────────────────────────
async function getHfIntegration(userId: number) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

  const rows = await db.select().from(integrations)
    .where(and(eq(integrations.userId, userId), eq(integrations.type, "higgsfield")))
    .limit(1);

  return rows[0] || null;
}

export const higgsfieldRouter = router({

  // ─── Get connection status ────────────────────────────────────────────────
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    const row = await getHfIntegration(ctx.user.id);
    if (!row || !row.higgsfieldApiKey) return { connected: false };
    return {
      connected: true,
      status: row.status,
      username: row.higgsfieldUsername,
      lastSyncedAt: row.lastSyncedAt,
    };
  }),

  // ─── Connect with API key ─────────────────────────────────────────────────
  connect: protectedProcedure
    .input(z.object({
      apiKey: z.string().min(10, "API key must be at least 10 characters"),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Test the API key by fetching user info or a simple endpoint
      let username = "Higgsfield User";
      try {
        // Try to validate the key with a lightweight call
        const testRes = await fetch(`${HF_API}/generations`, {
          method: "GET",
          headers: { "Authorization": `Bearer ${input.apiKey}` },
        });
        if (testRes.status === 401) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid API key — please check your Higgsfield dashboard." });
        }
        // If we get any other response (even 404), the key is valid
      } catch (err: any) {
        if (err instanceof TRPCError) throw err;
        // Network error — still save the key, user can test later
      }

      // Upsert the integration
      const existing = await getHfIntegration(ctx.user.id);
      if (existing) {
        await db.update(integrations)
          .set({
            higgsfieldApiKey: input.apiKey,
            higgsfieldUsername: username,
            status: "active",
            lastSyncedAt: new Date(),
          })
          .where(and(eq(integrations.userId, ctx.user.id), eq(integrations.type, "higgsfield")));
      } else {
        await db.insert(integrations).values({
          userId: ctx.user.id,
          workspaceId: 1,
          type: "higgsfield",
          status: "active",
          higgsfieldApiKey: input.apiKey,
          higgsfieldUsername: username,
          lastSyncedAt: new Date(),
        });
      }

      return { success: true, message: "Higgsfield account connected successfully" };
    }),

  // ─── Disconnect ───────────────────────────────────────────────────────────
  disconnect: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    await db.update(integrations)
      .set({ status: "disconnected", higgsfieldApiKey: null })
      .where(and(eq(integrations.userId, ctx.user.id), eq(integrations.type, "higgsfield")));

    return { success: true };
  }),

  // ─── Test connection ──────────────────────────────────────────────────────
  testConnection: protectedProcedure.mutation(async ({ ctx }) => {
    const row = await getHfIntegration(ctx.user.id);
    if (!row?.higgsfieldApiKey) {
      throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Higgsfield not connected" });
    }

    const res = await fetch(`${HF_API}/generations`, {
      headers: { "Authorization": `Bearer ${row.higgsfieldApiKey}` },
    });

    if (res.status === 401) {
      const db = await getDb();
      if (db) {
        await db.update(integrations)
          .set({ status: "expired" })
          .where(and(eq(integrations.userId, ctx.user.id), eq(integrations.type, "higgsfield")));
      }
      throw new TRPCError({ code: "UNAUTHORIZED", message: "API key is invalid or expired" });
    }

    return { success: true, message: "Connection is active and working" };
  }),

  // ─── Generate image from text ─────────────────────────────────────────────
  generateImage: protectedProcedure
    .input(z.object({
      prompt: z.string().min(3).max(1000),
      model: z.string().default("flux"),
      width: z.number().default(1024),
      height: z.number().default(1024),
      steps: z.number().default(30),
    }))
    .mutation(async ({ ctx, input }) => {
      const row = await getHfIntegration(ctx.user.id);
      if (!row?.higgsfieldApiKey) {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Connect your Higgsfield account first" });
      }

      const result = await hfPost("/generations", row.higgsfieldApiKey, {
        task: "text-to-image",
        model: input.model,
        prompt: input.prompt,
        width: input.width,
        height: input.height,
        steps: input.steps,
      });

      return {
        generationId: result.id,
        status: result.status || "queued",
        message: "Image generation started. Poll for status to get the result.",
      };
    }),

  // ─── Generate video from image ────────────────────────────────────────────
  generateVideo: protectedProcedure
    .input(z.object({
      imageUrl: z.string().url(),
      prompt: z.string().min(3).max(1000),
      duration: z.number().min(3).max(30).default(5),
      motionIntensity: z.enum(["low", "medium", "high"]).default("medium"),
    }))
    .mutation(async ({ ctx, input }) => {
      const row = await getHfIntegration(ctx.user.id);
      if (!row?.higgsfieldApiKey) {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Connect your Higgsfield account first" });
      }

      const result = await hfPost("/generations", row.higgsfieldApiKey, {
        task: "image-to-video",
        model: "default-video-model",
        input_image: input.imageUrl,
        prompt: input.prompt,
        duration: input.duration,
        fps: 30,
        motion_intensity: input.motionIntensity,
      });

      return {
        generationId: result.id,
        status: result.status || "queued",
        message: "Video generation started. This typically takes 30–90 seconds.",
      };
    }),

  // ─── Generate video from text ─────────────────────────────────────────────
  generateTextToVideo: protectedProcedure
    .input(z.object({
      prompt: z.string().min(3).max(1000),
      duration: z.number().min(3).max(30).default(5),
    }))
    .mutation(async ({ ctx, input }) => {
      const row = await getHfIntegration(ctx.user.id);
      if (!row?.higgsfieldApiKey) {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Connect your Higgsfield account first" });
      }

      const result = await hfPost("/generations", row.higgsfieldApiKey, {
        task: "text-to-video",
        prompt: input.prompt,
        duration: input.duration,
        fps: 30,
      });

      return {
        generationId: result.id,
        status: result.status || "queued",
        message: "Video generation started.",
      };
    }),

  // ─── Poll generation status ───────────────────────────────────────────────
  getGenerationStatus: protectedProcedure
    .input(z.object({ generationId: z.string() }))
    .query(async ({ ctx, input }) => {
      const row = await getHfIntegration(ctx.user.id);
      if (!row?.higgsfieldApiKey) {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Higgsfield not connected" });
      }

      const result = await hfGet(`/generations/${input.generationId}`, row.higgsfieldApiKey);

      return {
        id: result.id,
        status: result.status, // "queued" | "processing" | "completed" | "failed"
        outputUrl: result.output_url || result.url || null,
        thumbnailUrl: result.thumbnail_url || null,
        progress: result.progress || 0,
        error: result.error || null,
      };
    }),

  // ─── List recent generations ──────────────────────────────────────────────
  listGenerations: protectedProcedure
    .input(z.object({ limit: z.number().default(20) }))
    .query(async ({ ctx, input }) => {
      const row = await getHfIntegration(ctx.user.id);
      if (!row?.higgsfieldApiKey) return [];

      try {
        const result = await hfGet(`/generations?limit=${input.limit}`, row.higgsfieldApiKey);
        return result.data || result || [];
      } catch {
        return [];
      }
    }),
});
