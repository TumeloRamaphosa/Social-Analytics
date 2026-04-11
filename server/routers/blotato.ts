import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { eq, and } from "drizzle-orm";
import { integrations } from "../../drizzle/schema";

const BLOTATO_BASE_URL = 'https://backend.blotato.com/v2';

const PLATFORMS = ["tiktok", "instagram", "facebook", "youtube", "linkedin", "pinterest", "threads"] as const;

async function fetchBlotato(endpoint: string, apiKey: string, options: RequestInit = {}) {
  const response = await fetch(`${BLOTATO_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'blotato-api-key': apiKey,
      ...options.headers,
    },
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  return response.json();
}

export const blotatoRouter = router({
  // Get connection status
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    
    const integration = await db
      .select()
      .from(integrations)
      .where(and(
        eq(integrations.workspaceId, 1),
        eq(integrations.type, "blotato")
      ))
      .limit(1);

    if (!integration.length || !integration[0].blotatoApiKey) {
      return { connected: false };
    }

    try {
      const accounts = await fetchBlotato('/users/me/accounts', integration[0].blotatoApiKey);
      return {
        connected: true,
        accounts: accounts.accounts || [],
        accountCount: accounts.accounts?.length || 0,
      };
    } catch (error) {
      return {
        connected: false,
        error: error instanceof Error ? error.message : 'Failed to connect',
      };
    }
  }),

  // Connect Blotato
  connect: protectedProcedure
    .input(z.object({
      apiKey: z.string().min(10),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Test the API key
      try {
        await fetchBlotato('/users/me/accounts', input.apiKey);
      } catch (error) {
        throw new Error("Invalid Blotato API key");
      }

      // Check if integration exists
      const existing = await db
        .select()
        .from(integrations)
        .where(and(
          eq(integrations.workspaceId, 1),
          eq(integrations.type, "blotato")
        ))
        .limit(1);

      if (existing.length) {
        await db
          .update(integrations)
          .set({
            blotatoApiKey: input.apiKey,
            status: "active",
            updatedAt: new Date(),
          })
          .where(eq(integrations.id, existing[0].id));
      } else {
        await db.insert(integrations).values({
          workspaceId: 1,
          userId: ctx.user?.id || 0,
          type: "blotato",
          status: "active",
          blotatoApiKey: input.apiKey,
        });
      }

      return { success: true };
    }),

  // Disconnect Blotato
  disconnect: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    await db
      .update(integrations)
      .set({
        blotatoApiKey: null,
        blotatoAccountId: null,
        status: "disconnected",
      })
      .where(and(
        eq(integrations.workspaceId, 1),
        eq(integrations.type, "blotato")
      ));

    return { success: true };
  }),

  // Get accounts
  getAccounts: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    
    const integration = await db
      .select()
      .from(integrations)
      .where(and(
        eq(integrations.workspaceId, 1),
        eq(integrations.type, "blotato")
      ))
      .limit(1);

    if (!integration.length || !integration[0].blotatoApiKey) {
      throw new Error("Blotato not connected");
    }

    const accounts = await fetchBlotato('/users/me/accounts', integration[0].blotatoApiKey);
    return accounts.accounts || [];
  }),

  // Post content
  post: protectedProcedure
    .input(z.object({
      content: z.string(),
      mediaUrls: z.array(z.string()).default([]),
      platform: z.enum(PLATFORMS),
      scheduledTime: z.string().optional(),
      options: z.object({
        privacyLevel: z.string().optional(),
        disabledComments: z.boolean().optional(),
        isAiGenerated: z.boolean().optional(),
      }).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      
      const integration = await db
        .select()
        .from(integrations)
        .where(and(
          eq(integrations.workspaceId, 1),
          eq(integrations.type, "blotato")
        ))
        .limit(1);

      if (!integration.length || !integration[0].blotatoApiKey) {
        throw new Error("Blotato not connected");
      }

      const payload = {
        post: {
          accountId: integration[0].blotatoAccountId || undefined,
          content: {
            text: input.content,
            mediaUrls: input.mediaUrls,
            platform: input.platform,
          },
          target: {
            targetType: input.platform,
          },
        },
        scheduledTime: input.scheduledTime || null,
        useNextFreeSlot: false,
      };

      const result = await fetchBlotato('/posts', integration[0].blotatoApiKey, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      return result;
    }),

  // Post to multiple platforms
  postMulti: protectedProcedure
    .input(z.object({
      content: z.string(),
      mediaUrls: z.array(z.string()).default([]),
      platforms: z.array(z.enum(PLATFORMS)),
    }))
    .mutation(async ({ ctx, input }) => {
      const results = [];
      
      for (const platform of input.platforms) {
        try {
          const result = await fetchBlotato('/users/me/accounts', 'fake', {
            method: 'POST',
          });
          results.push({ platform, success: true, result });
        } catch (error) {
          results.push({ 
            platform, 
            success: false, 
            error: error instanceof Error ? error.message : 'Failed' 
          });
        }
      }

      return results;
    }),
});