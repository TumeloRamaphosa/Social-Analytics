import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { integrations, shopifyOrders, shopifyProducts, googleAdsCampaigns, workspaces, workspaceMembers } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";

// ─── Shopify API helper ───────────────────────────────────────────────────────
async function shopifyFetch(domain: string, token: string, endpoint: string) {
  const url = `https://${domain}/admin/api/2024-01${endpoint}`;
  const res = await fetch(url, {
    headers: {
      "X-Shopify-Access-Token": token,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error(`Shopify API error: ${res.status} ${res.statusText}`);
  return res.json();
}

// ─── Integration router ───────────────────────────────────────────────────────
export const integrationsRouter = router({

  // Get all integrations for the current user
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    return db.select().from(integrations).where(eq(integrations.userId, ctx.user.id));
  }),

  // Connect Shopify store
  connectShopify: protectedProcedure
    .input(z.object({
      shopifyDomain: z.string().min(3),
      shopifyAccessToken: z.string().min(10),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Verify the token works
      try {
        await shopifyFetch(input.shopifyDomain, input.shopifyAccessToken, "/shop.json");
      } catch {
        throw new Error("Invalid Shopify credentials. Please check your domain and access token.");
      }

      // Get or create workspace
      let workspaceId = 1;
      const existing = await db.select().from(integrations)
        .where(and(eq(integrations.userId, ctx.user.id), eq(integrations.type, "shopify")))
        .limit(1);

      if (existing.length > 0) {
        // Update existing
        await db.update(integrations)
          .set({
            shopifyDomain: input.shopifyDomain,
            shopifyAccessToken: input.shopifyAccessToken,
            status: "active",
            lastSyncedAt: new Date(),
          })
          .where(eq(integrations.id, existing[0].id));
        return { success: true, message: "Shopify reconnected successfully" };
      }

      // Create new integration
      await db.insert(integrations).values({
        workspaceId,
        userId: ctx.user.id,
        type: "shopify",
        status: "active",
        shopifyDomain: input.shopifyDomain,
        shopifyAccessToken: input.shopifyAccessToken,
        lastSyncedAt: new Date(),
      });

      return { success: true, message: "Shopify connected successfully" };
    }),

  // Connect Facebook / Meta
  connectMeta: protectedProcedure
    .input(z.object({
      metaAccessToken: z.string().min(10),
      metaPageId: z.string().optional(),
      metaBusinessId: z.string().optional(),
      metaAdAccountId: z.string().optional(),
      metaInstagramId: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Verify token
      const verifyRes = await fetch(`https://graph.facebook.com/me?access_token=${input.metaAccessToken}`);
      if (!verifyRes.ok) throw new Error("Invalid Meta access token");

      const existing = await db.select().from(integrations)
        .where(and(eq(integrations.userId, ctx.user.id), eq(integrations.type, "facebook")))
        .limit(1);

      const values = {
        workspaceId: 1,
        userId: ctx.user.id,
        type: "facebook" as const,
        status: "active" as const,
        metaAccessToken: input.metaAccessToken,
        metaPageId: input.metaPageId,
        metaBusinessId: input.metaBusinessId,
        metaAdAccountId: input.metaAdAccountId,
        metaInstagramId: input.metaInstagramId,
        lastSyncedAt: new Date(),
      };

      if (existing.length > 0) {
        await db.update(integrations).set(values).where(eq(integrations.id, existing[0].id));
      } else {
        await db.insert(integrations).values(values);
      }

      return { success: true, message: "Meta/Facebook connected successfully" };
    }),

  // Sync Shopify orders
  syncShopifyOrders: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    const integration = await db.select().from(integrations)
      .where(and(eq(integrations.userId, ctx.user.id), eq(integrations.type, "shopify")))
      .limit(1);

    if (!integration.length || !integration[0].shopifyDomain || !integration[0].shopifyAccessToken) {
      throw new Error("Shopify not connected. Please connect your Shopify store first.");
    }

    const { shopifyDomain, shopifyAccessToken, workspaceId } = integration[0];
    const data = await shopifyFetch(shopifyDomain, shopifyAccessToken, "/orders.json?limit=250&status=any");
    const orders = data.orders || [];

    let synced = 0;
    for (const order of orders) {
      await db.insert(shopifyOrders).values({
        workspaceId: workspaceId || 1,
        shopifyOrderId: String(order.id),
        totalPrice: parseFloat(order.total_price || "0"),
        currency: order.currency,
        financialStatus: order.financial_status,
        fulfillmentStatus: order.fulfillment_status,
        customerId: order.customer ? String(order.customer.id) : null,
        lineItems: order.line_items,
        shopifyCreatedAt: new Date(order.created_at),
      }).catch(() => {}); // ignore duplicates
      synced++;
    }

    // Update last synced
    await db.update(integrations).set({ lastSyncedAt: new Date() }).where(eq(integrations.id, integration[0].id));

    return { success: true, synced, message: `Synced ${synced} orders from Shopify` };
  }),

  // Sync Shopify products
  syncShopifyProducts: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    const integration = await db.select().from(integrations)
      .where(and(eq(integrations.userId, ctx.user.id), eq(integrations.type, "shopify")))
      .limit(1);

    if (!integration.length || !integration[0].shopifyDomain || !integration[0].shopifyAccessToken) {
      throw new Error("Shopify not connected");
    }

    const { shopifyDomain, shopifyAccessToken, workspaceId } = integration[0];
    const data = await shopifyFetch(shopifyDomain, shopifyAccessToken, "/products.json?limit=250");
    const products = data.products || [];

    for (const product of products) {
      await db.insert(shopifyProducts).values({
        workspaceId: workspaceId || 1,
        shopifyProductId: String(product.id),
        title: product.title,
        description: product.body_html?.replace(/<[^>]*>/g, ""),
        productType: product.product_type,
        tags: product.tags ? product.tags.split(",").map((t: string) => t.trim()) : [],
        variants: product.variants,
        images: product.images,
        status: product.status,
      }).catch(() => {});
    }

    return { success: true, synced: products.length };
  }),

  // Get Shopify dashboard stats
  getShopifyStats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    const integration = await db.select().from(integrations)
      .where(and(eq(integrations.userId, ctx.user.id), eq(integrations.type, "shopify")))
      .limit(1);

    if (!integration.length) return null;

    const orders = await db.select().from(shopifyOrders)
      .where(eq(shopifyOrders.workspaceId, integration[0].workspaceId || 1));

    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const paidOrders = orders.filter(o => o.financialStatus === "paid").length;

    return {
      totalRevenue,
      totalOrders,
      avgOrderValue,
      paidOrders,
      conversionRate: totalOrders > 0 ? (paidOrders / totalOrders) * 100 : 0,
      lastSyncedAt: integration[0].lastSyncedAt,
      shopifyDomain: integration[0].shopifyDomain,
    };
  }),

  // Get products list
  getProducts: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    const integration = await db.select().from(integrations)
      .where(and(eq(integrations.userId, ctx.user.id), eq(integrations.type, "shopify")))
      .limit(1);
    if (!integration.length) return [];
    return db.select().from(shopifyProducts)
      .where(eq(shopifyProducts.workspaceId, integration[0].workspaceId || 1))
      .limit(50);
  }),

  // Get integration status overview
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    const all = await db.select().from(integrations).where(eq(integrations.userId, ctx.user.id));
    return {
      shopify: all.find(i => i.type === "shopify") || null,
      facebook: all.find(i => i.type === "facebook") || null,
      googleAds: all.find(i => i.type === "google_ads") || null,
      whatsapp: all.find(i => i.type === "whatsapp") || null,
    };
  }),

  // Generate AI spend optimisation report
  generateSpendReport: protectedProcedure
    .input(z.object({
      totalSpend: z.number(),
      followers: z.number().optional(),
      platform: z.string().default("facebook"),
    }))
    .mutation(async ({ ctx, input }) => {
      const prompt = `You are a senior digital marketing strategist specialising in South African food brands and e-commerce.

A brand has spent R${input.totalSpend.toLocaleString()} on ${input.platform} advertising and has ${input.followers?.toLocaleString() || "unknown"} followers.

Generate a detailed spend optimisation report with:
1. Key observations about their current spend efficiency
2. Top 5 specific actions to reduce wasted spend (with estimated % savings for each)
3. Audience targeting recommendations
4. Content strategy to improve organic reach and reduce paid dependency
5. A weekly content calendar template (Mon-Sun)
6. KPIs to track going forward

Format as a structured report with clear headings. Be specific, actionable, and tailored to a premium Halal meat brand in South Africa.`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are an expert digital marketing strategist for South African food and e-commerce brands." },
          { role: "user", content: prompt },
        ],
      });

      const report = response.choices[0]?.message?.content || "Report generation failed";
      return { report, generatedAt: new Date() };
    }),
});
