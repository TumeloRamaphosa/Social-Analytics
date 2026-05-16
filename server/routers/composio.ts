import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";

const COMPOSIO_API_KEY = process.env.COMPOSIO_API_KEY || "ak_EBdmBPesM68NJ3DmT6D9";
const COMPOSIO_BASE = "https://backend.composio.dev/api/v1";

async function composioFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${COMPOSIO_BASE}${path}`, {
    ...options,
    headers: {
      "x-api-key": COMPOSIO_API_KEY,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Composio API error ${res.status}: ${text.substring(0, 200)}`,
    });
  }
  return res.json();
}

export const composioRouter = router({
  // Get all connected accounts with status
  getConnections: protectedProcedure.query(async () => {
    const data = await composioFetch("/connectedAccounts?limit=50");
    const items = data.items || [];

    const apps = ["facebook", "instagram", "whatsapp", "gmail", "discord", "elevenlabs", "shopify", "slack", "googledrive", "linkedin", "googleads"];
    const summary: Record<string, { status: string; id: string; entityId: string }[]> = {};

    for (const item of items) {
      const app = item.appName as string;
      if (!summary[app]) summary[app] = [];
      summary[app].push({
        status: item.status,
        id: item.id,
        entityId: item.clientUniqueUserId || "default",
      });
    }

    return {
      total: items.length,
      active: items.filter((i: any) => i.status === "ACTIVE").length,
      expired: items.filter((i: any) => i.status === "EXPIRED").length,
      apps: summary,
      raw: items.map((i: any) => ({
        id: i.id,
        appName: i.appName,
        status: i.status,
        entityId: i.clientUniqueUserId,
        createdAt: i.createdAt,
        updatedAt: i.updatedAt,
      })),
    };
  }),

  // Get OAuth connect URL for an app
  getConnectUrl: protectedProcedure
    .input(z.object({ appName: z.string(), entityId: z.string().optional() }))
    .mutation(async ({ input }) => {
      // Find the integration ID for this app
      const intData = await composioFetch("/integrations?limit=50");
      const integrations = intData.items || [];
      const integration = integrations.find(
        (i: any) => i.appName?.toLowerCase() === input.appName.toLowerCase() && i.authScheme === "OAUTH2"
      );

      if (!integration) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `No OAuth2 integration found for ${input.appName}`,
        });
      }

      // Create a new connection request
      const body = {
        integrationId: integration.id,
        entityId: input.entityId || "studex-main",
        redirectUri: `${process.env.VITE_OAUTH_PORTAL_URL || "https://nexussocail-fypx8oul.manus.space"}/integrations?connected=${input.appName}`,
      };

      const result = await composioFetch("/connectedAccounts", {
        method: "POST",
        body: JSON.stringify(body),
      });

      return {
        connectionId: result.id,
        redirectUrl: result.redirectUrl || result.connectionParams?.redirectUrl,
        status: result.status,
      };
    }),

  // Execute a Composio action (e.g. post to Facebook)
  executeAction: protectedProcedure
    .input(
      z.object({
        action: z.string(), // e.g. "FACEBOOK_CREATE_POST"
        connectedAccountId: z.string(),
        params: z.record(z.string(), z.any()),
      })
    )
    .mutation(async ({ input }) => {
      const result = await composioFetch(`/actions/${input.action}/execute`, {
        method: "POST",
        body: JSON.stringify({
          connectedAccountId: input.connectedAccountId,
          input: input.params,
        }),
      });
      return result;
    }),

  // Get available actions for an app
  getActions: protectedProcedure
    .input(z.object({ appName: z.string() }))
    .query(async ({ input }) => {
      // Use the newer v2 endpoint
      const res = await fetch(`https://backend.composio.dev/api/v2/actions?appNames=${input.appName}&limit=50`, {
        headers: {
          "x-api-key": COMPOSIO_API_KEY,
          Accept: "application/json",
        },
      });
      if (!res.ok) {
        return { items: [], total: 0 };
      }
      const data = await res.json();
      return {
        items: (data.items || []).map((a: any) => ({
          name: a.name,
          displayName: a.displayName || a.name,
          description: a.description,
          appName: a.appName,
        })),
        total: data.totalPages || 0,
      };
    }),

  // Post to Facebook page via Composio
  postToFacebook: protectedProcedure
    .input(
      z.object({
        message: z.string(),
        imageUrl: z.string().optional(),
        connectedAccountId: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // Get the active Facebook connection
      const data = await composioFetch("/connectedAccounts?limit=50");
      const fbAccounts = (data.items || []).filter(
        (i: any) => i.appName === "facebook" && i.status === "ACTIVE"
      );

      if (fbAccounts.length === 0) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "No active Facebook connection found. Please reconnect Facebook in Integrations.",
        });
      }

      const accountId = input.connectedAccountId || fbAccounts[0].id;

      // Try to post using Composio action
      const result = await composioFetch("/actions/FACEBOOK_CREATE_POST/execute", {
        method: "POST",
        body: JSON.stringify({
          connectedAccountId: accountId,
          input: {
            message: input.message,
            ...(input.imageUrl ? { link: input.imageUrl } : {}),
          },
        }),
      });

      return { success: true, result };
    }),

  // Get Facebook page insights via Composio
  getFacebookInsights: protectedProcedure
    .input(z.object({ connectedAccountId: z.string().optional() }))
    .query(async ({ input }) => {
      const data = await composioFetch("/connectedAccounts?limit=50");
      const fbAccounts = (data.items || []).filter(
        (i: any) => i.appName === "facebook" && i.status === "ACTIVE"
      );

      if (fbAccounts.length === 0) {
        return { connected: false, message: "No active Facebook connection" };
      }

      const accountId = input.connectedAccountId || fbAccounts[0].id;

      try {
        const result = await composioFetch("/actions/FACEBOOK_FETCH_PAGE_INSIGHTS/execute", {
          method: "POST",
          body: JSON.stringify({
            connectedAccountId: accountId,
            input: { period: "week" },
          }),
        });
        return { connected: true, data: result };
      } catch (_err) {
        return { connected: true, message: "Insights not available for this connection level" };
      }
    }),

  // Reconnect an expired account
  reconnectAccount: protectedProcedure
    .input(z.object({ connectedAccountId: z.string() }))
    .mutation(async ({ input }) => {
      const result = await composioFetch(`/connectedAccounts/${input.connectedAccountId}/reconnect`, {
        method: "POST",
        body: JSON.stringify({}),
      });
      return {
        redirectUrl: result.redirectUrl || result.connectionParams?.redirectUrl,
        status: result.status,
      };
    }),
});
