import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { eq, and } from "drizzle-orm";
import { integrations } from "../../drizzle/schema";

const POLLINATIONS_API = "https://gen.pollinations.ai";

export const pollinationsRouter = router({
  // Get connection status
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    
    const integration = await db
      .select()
      .from(integrations)
      .where(and(
        eq(integrations.workspaceId, 1),
        eq(integrations.type, "pollinations")
      ))
      .limit(1);

    return {
      connected: !!(integration.length && integration[0].pollinationsApiKey),
      hasApiKey: !!(integration.length && integration[0].pollinationsApiKey),
    };
  }),

  // Connect Pollinations (optional - works without API key on free tier)
  connect: protectedProcedure
    .input(z.object({
      apiKey: z.string().optional(),
    }).optional())
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const existing = await db
        .select()
        .from(integrations)
        .where(and(
          eq(integrations.workspaceId, 1),
          eq(integrations.type, "pollinations")
        ))
        .limit(1);

      if (existing.length) {
        await db
          .update(integrations)
          .set({
            pollinationsApiKey: input.apiKey || null,
            status: "active",
            updatedAt: new Date(),
          })
          .where(eq(integrations.id, existing[0].id));
      } else {
        await db.insert(integrations).values({
          workspaceId: 1,
          userId: ctx.user?.id || 0,
          type: "pollinations",
          status: "active",
          pollinationsApiKey: input.apiKey || null,
        });
      }

      return { success: true };
    }),

  // Generate image
  generateImage: protectedProcedure
    .input(z.object({
      prompt: z.string().min(1),
      model: z.enum(["flux", "flux-schnell", "flux-dev", "klein", "dalle3", "gptimage"]).default("flux"),
      width: z.number().default(1024),
      height: z.number().default(1024),
      seed: z.number().optional(),
      nologo: z.boolean().default(true),
      private: z.boolean().default(false),
      enhance: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      
      const integration = await db
        .select()
        .from(integrations)
        .where(and(
          eq(integrations.workspaceId, 1),
          eq(integrations.type, "pollinations")
        ))
        .limit(1);

      const apiKey = integration.length ? integration[0].pollinationsApiKey : null;
      
      const params = new URLSearchParams({
        prompt: input.prompt,
        model: input.model,
        width: input.width.toString(),
        height: input.height.toString(),
        nologo: input.nologo.toString(),
        private: input.private.toString(),
        enhance: input.enhance.toString(),
      });

      if (input.seed !== undefined) {
        params.set("seed", input.seed.toString());
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      
      if (apiKey) {
        headers["Authorization"] = `Bearer ${apiKey}`;
      }

      const url = `${POLLINATIONS_API}/image/${input.prompt}?${params.toString()}`;
      
      // Return the URL for client to use
      return {
        success: true,
        imageUrl: url,
        prompt: input.prompt,
        model: input.model,
      };
    }),

  // Generate image (return as base64 for storage)
  generateImageData: protectedProcedure
    .input(z.object({
      prompt: z.string().min(1),
      model: z.enum(["flux", "flux-schnell", "flux-dev", "klein"]).default("flux"),
      width: z.number().default(1024),
      height: z.number().default(1024),
    }))
    .mutation(async ({ input }) => {
      // Use the simple endpoint that returns image directly
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(input.prompt)}?width=${input.width}&height=${input.height}&model=${input.model}`;
      
      try {
        const response = await fetch(url);
        const buffer = await response.arrayBuffer();
        const base64 = Buffer.from(buffer).toString("base64");
        const mimeType = response.headers.get("content-type") || "image/jpeg";
        
        return {
          success: true,
          dataUrl: `data:${mimeType};base64,${base64}`,
          prompt: input.prompt,
        };
      } catch (error) {
        throw new Error(`Failed to generate image: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }),

  // Get available models
  getModels: protectedProcedure.query(async () => {
    return {
      models: [
        { id: "flux", name: "FLUX.1", description: "High quality, default" },
        { id: "flux-schnell", name: "FLUX Schnell", description: "Fast generation" },
        { id: "flux-dev", name: "FLUX Dev", description: "Development version" },
        { id: "klein", name: "FLUX.2 Klein", description: "Small, efficient" },
        { id: "dalle3", name: "DALL-E 3", description: "OpenAI's model" },
        { id: "gptimage", name: "GPT Image", description: "OpenAI's new image model" },
      ],
    };
  }),
});