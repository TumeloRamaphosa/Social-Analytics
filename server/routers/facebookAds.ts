import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { integrations } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";

// ─── Facebook Graph API helper ───────────────────────────────────────────────
async function fbGet(path: string, token: string, params: Record<string, string> = {}) {
  const url = new URL(`https://graph.facebook.com/v19.0${path}`);
  url.searchParams.set("access_token", token);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url.toString());
  const json = await res.json();
  if (json.error) throw new Error(`Facebook API: ${json.error.message} (code ${json.error.code})`);
  return json;
}

// ─── Get stored Meta integration for current user ────────────────────────────
async function getMetaIntegration(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const rows = await db.select().from(integrations)
    .where(and(eq(integrations.userId, userId), eq(integrations.type, "facebook")))
    .limit(1);
  if (!rows.length || !rows[0].metaAccessToken) {
    throw new Error("Facebook not connected. Please connect your Meta account in Integrations first.");
  }
  return rows[0];
}

export const facebookAdsRouter = router({

  // ── 1. Get ad account overview ─────────────────────────────────────────────
  getAdAccounts: protectedProcedure.query(async ({ ctx }) => {
    const meta = await getMetaIntegration(ctx.user.id);
    const token = meta.metaAccessToken!;

    // Get all ad accounts the token has access to
    const data = await fbGet("/me/adaccounts", token, {
      fields: "id,name,account_status,currency,amount_spent,balance,spend_cap",
    });
    return { accounts: data.data || [] };
  }),

  // ── 2. Get campaigns for an ad account ────────────────────────────────────
  getCampaigns: protectedProcedure
    .input(z.object({
      adAccountId: z.string(),
      datePreset: z.enum(["today", "yesterday", "last_7d", "last_30d", "last_90d", "this_month", "last_month"]).default("last_30d"),
    }))
    .query(async ({ ctx, input }) => {
      const meta = await getMetaIntegration(ctx.user.id);
      const token = meta.metaAccessToken!;
      const accountId = input.adAccountId.startsWith("act_") ? input.adAccountId : `act_${input.adAccountId}`;

      const data = await fbGet(`/${accountId}/campaigns`, token, {
        fields: "id,name,status,objective,daily_budget,lifetime_budget,start_time,stop_time",
        effective_status: '["ACTIVE","PAUSED","ARCHIVED"]',
        limit: "50",
      });

      // Get insights for each campaign
      const insightsData = await fbGet(`/${accountId}/insights`, token, {
        fields: "campaign_id,campaign_name,impressions,clicks,spend,reach,cpm,cpc,ctr,actions,cost_per_action_type,frequency",
        level: "campaign",
        date_preset: input.datePreset,
        limit: "50",
      });

      const insightMap: Record<string, any> = {};
      for (const row of (insightsData.data || [])) {
        insightMap[row.campaign_id] = row;
      }

      const campaigns = (data.data || []).map((c: any) => ({
        ...c,
        insights: insightMap[c.id] || null,
      }));

      return { campaigns };
    }),

  // ── 3. Get top-performing and worst-performing ads ─────────────────────────
  getAdPerformance: protectedProcedure
    .input(z.object({
      adAccountId: z.string(),
      datePreset: z.enum(["today", "yesterday", "last_7d", "last_30d", "last_90d", "this_month", "last_month"]).default("last_30d"),
    }))
    .query(async ({ ctx, input }) => {
      const meta = await getMetaIntegration(ctx.user.id);
      const token = meta.metaAccessToken!;
      const accountId = input.adAccountId.startsWith("act_") ? input.adAccountId : `act_${input.adAccountId}`;

      const data = await fbGet(`/${accountId}/insights`, token, {
        fields: "ad_id,ad_name,adset_name,campaign_name,impressions,clicks,spend,reach,cpm,cpc,ctr,actions,cost_per_action_type,frequency,video_play_actions,video_thruplay_watched_actions",
        level: "ad",
        date_preset: input.datePreset,
        sort: '["spend_descending"]',
        limit: "25",
      });

      const ads = data.data || [];

      // Calculate ROAS where possible
      const enriched = ads.map((ad: any) => {
        const purchaseActions = (ad.actions || []).find((a: any) => a.action_type === "purchase");
        const purchaseValue = (ad.cost_per_action_type || []).find((a: any) => a.action_type === "purchase");
        const spend = parseFloat(ad.spend || "0");
        const clicks = parseInt(ad.clicks || "0");
        const impressions = parseInt(ad.impressions || "0");
        const ctr = parseFloat(ad.ctr || "0");
        const cpm = parseFloat(ad.cpm || "0");
        const cpc = parseFloat(ad.cpc || "0");

        // Performance score: lower CPM + higher CTR = better
        const performanceScore = ctr > 0 && cpm > 0
          ? Math.min(100, Math.round((ctr * 100 / cpm) * 1000))
          : 0;

        return {
          ...ad,
          spend,
          clicks,
          impressions,
          ctr,
          cpm,
          cpc,
          purchaseCount: purchaseActions ? parseInt(purchaseActions.value) : 0,
          performanceScore,
          status: performanceScore > 60 ? "performing" : performanceScore > 30 ? "average" : "underperforming",
        };
      });

      const performing = enriched.filter((a: any) => a.status === "performing").slice(0, 5);
      const underperforming = enriched.filter((a: any) => a.status === "underperforming").slice(0, 5);

      return { ads: enriched, performing, underperforming };
    }),

  // ── 4. Get spend summary and budget analysis ───────────────────────────────
  getSpendSummary: protectedProcedure
    .input(z.object({
      adAccountId: z.string(),
      datePreset: z.enum(["today", "yesterday", "last_7d", "last_30d", "last_90d", "this_month", "last_month"]).default("last_30d"),
    }))
    .query(async ({ ctx, input }) => {
      const meta = await getMetaIntegration(ctx.user.id);
      const token = meta.metaAccessToken!;
      const accountId = input.adAccountId.startsWith("act_") ? input.adAccountId : `act_${input.adAccountId}`;

      // Account-level summary
      const account = await fbGet(`/${accountId}`, token, {
        fields: "name,currency,amount_spent,balance,spend_cap,account_status",
      });

      // Daily spend breakdown
      const daily = await fbGet(`/${accountId}/insights`, token, {
        fields: "spend,impressions,clicks,reach,cpm,cpc,ctr,actions",
        time_increment: "1",
        date_preset: input.datePreset,
      });

      // Breakdown by objective
      const byObjective = await fbGet(`/${accountId}/insights`, token, {
        fields: "spend,impressions,clicks,reach,objective",
        breakdowns: "objective",
        date_preset: input.datePreset,
      });

      return {
        account,
        dailyBreakdown: daily.data || [],
        byObjective: byObjective.data || [],
      };
    }),

  // ── 5. Get audience insights ───────────────────────────────────────────────
  getAudienceInsights: protectedProcedure
    .input(z.object({
      adAccountId: z.string(),
      datePreset: z.enum(["last_7d", "last_30d", "last_90d"]).default("last_30d"),
    }))
    .query(async ({ ctx, input }) => {
      const meta = await getMetaIntegration(ctx.user.id);
      const token = meta.metaAccessToken!;
      const accountId = input.adAccountId.startsWith("act_") ? input.adAccountId : `act_${input.adAccountId}`;

      // Age and gender breakdown
      const ageGender = await fbGet(`/${accountId}/insights`, token, {
        fields: "spend,impressions,clicks,reach,ctr",
        breakdowns: "age,gender",
        date_preset: input.datePreset,
      });

      // Region breakdown
      const region = await fbGet(`/${accountId}/insights`, token, {
        fields: "spend,impressions,clicks,reach",
        breakdowns: "region",
        date_preset: input.datePreset,
        sort: '["spend_descending"]',
        limit: "15",
      });

      // Device breakdown
      const device = await fbGet(`/${accountId}/insights`, token, {
        fields: "spend,impressions,clicks,reach",
        breakdowns: "device_platform",
        date_preset: input.datePreset,
      });

      return {
        ageGender: ageGender.data || [],
        region: region.data || [],
        device: device.data || [],
      };
    }),

  // ── 6. AI-powered ad analysis and content recommendations ─────────────────
  analyzeAdsWithAI: protectedProcedure
    .input(z.object({
      adAccountId: z.string(),
      datePreset: z.enum(["last_7d", "last_30d", "last_90d"]).default("last_30d"),
      businessContext: z.string().optional().default("South African business"),
    }))
    .mutation(async ({ ctx, input }) => {
      const meta = await getMetaIntegration(ctx.user.id);
      const token = meta.metaAccessToken!;
      const accountId = input.adAccountId.startsWith("act_") ? input.adAccountId : `act_${input.adAccountId}`;

      // Pull all data in parallel
      const [adsData, spendData, audienceData] = await Promise.all([
        fbGet(`/${accountId}/insights`, token, {
          fields: "campaign_name,ad_name,impressions,clicks,spend,reach,cpm,cpc,ctr,actions,frequency",
          level: "ad",
          date_preset: input.datePreset,
          sort: '["spend_descending"]',
          limit: "20",
        }),
        fbGet(`/${accountId}`, token, {
          fields: "name,currency,amount_spent,spend_cap",
        }),
        fbGet(`/${accountId}/insights`, token, {
          fields: "spend,impressions,clicks,reach",
          breakdowns: "age,gender",
          date_preset: input.datePreset,
        }),
      ]);

      const totalSpend = parseFloat(spendData.amount_spent || "0") / 100;
      const ads = adsData.data || [];
      const audience = audienceData.data || [];

      // Build AI prompt
      const prompt = `You are a senior Facebook Ads strategist and content director for ${input.businessContext}.

Here is the real ad performance data for the past ${input.datePreset.replace("last_", "").replace("d", " days")}:

TOTAL ACCOUNT SPEND: R${totalSpend.toFixed(2)} (${spendData.currency})

TOP ADS BY SPEND:
${ads.slice(0, 10).map((a: any, i: number) => `
${i + 1}. "${a.ad_name || a.campaign_name}"
   - Spend: R${parseFloat(a.spend || 0).toFixed(2)}
   - Impressions: ${parseInt(a.impressions || 0).toLocaleString()}
   - Clicks: ${parseInt(a.clicks || 0).toLocaleString()}
   - CTR: ${parseFloat(a.ctr || 0).toFixed(2)}%
   - CPM: R${parseFloat(a.cpm || 0).toFixed(2)}
   - CPC: R${parseFloat(a.cpc || 0).toFixed(2)}
   - Reach: ${parseInt(a.reach || 0).toLocaleString()}
   - Frequency: ${parseFloat(a.frequency || 0).toFixed(1)}x
`).join("")}

AUDIENCE BREAKDOWN (top segments by spend):
${audience.slice(0, 8).map((a: any) => `- ${a.age || "?"} ${a.gender || "?"}: R${parseFloat(a.spend || 0).toFixed(2)} spend, ${parseInt(a.impressions || 0).toLocaleString()} impressions, ${parseFloat(a.ctr || 0).toFixed(2)}% CTR`).join("\n")}

Based on this REAL data, provide:

## 1. SPEND EFFICIENCY VERDICT
Rate the overall spend efficiency (Poor/Fair/Good/Excellent) and explain why in 2-3 sentences.

## 2. TOP 3 WASTED SPEND AREAS
For each: what is being wasted, how much (estimate R amount), and why.

## 3. AUDIENCE INSIGHTS
Which age/gender segment is performing best? Which is wasting money? What does this tell us about the target market?

## 4. CONTENT RECOMMENDATIONS (5 specific posts to create)
For each post, provide:
- Post type (Reel/Carousel/Static/Story)
- Platform (Facebook/Instagram/Both)
- Hook (first line that stops the scroll)
- Core message (2 sentences)
- Call to action
- Why this will outperform current ads organically
- Estimated reach if boosted at R50/day

## 5. BUDGET REALLOCATION PLAN
How to spend the same budget more efficiently. Be specific with percentages.

## 6. 30-DAY ACTION PLAN
Week-by-week actions to reduce spend by 20-30% while maintaining or improving results.

Be specific, data-driven, and South African market aware. Use Rand (R) for all currency.`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are a world-class Facebook Ads strategist with deep expertise in South African digital marketing. Always cite specific numbers from the data provided." },
          { role: "user", content: prompt },
        ],
      });

      const analysis = response.choices[0]?.message?.content || "Analysis unavailable";

      return {
        analysis,
        totalSpend,
        currency: spendData.currency,
        adCount: ads.length,
        topAd: ads[0] || null,
        worstAd: ads[ads.length - 1] || null,
        datePreset: input.datePreset,
        generatedAt: new Date().toISOString(),
      };
    }),

  // ── 7. Generate organic content to replace underperforming ads ────────────
  generateOrganicReplacement: protectedProcedure
    .input(z.object({
      adName: z.string(),
      adSpend: z.number(),
      adCtr: z.number(),
      adCpm: z.number(),
      adObjective: z.string().optional(),
      businessContext: z.string().default("South African business"),
      platform: z.enum(["facebook", "instagram", "both"]).default("both"),
    }))
    .mutation(async ({ ctx, input }) => {
      const prompt = `You are a social media content strategist. An ad called "${input.adName}" spent R${input.adSpend.toFixed(2)} with a ${input.adCtr.toFixed(2)}% CTR and R${input.adCpm.toFixed(2)} CPM — this is ${input.adCtr < 1 ? "underperforming (below 1% CTR benchmark)" : "average performance"}.

Create 3 organic ${input.platform} posts that target the same audience this ad was reaching, but organically — no ad spend needed.

For each post provide:
1. **Format**: (Reel script / Carousel slides / Static post / Story sequence)
2. **Hook**: The exact first line (make it stop-scroll worthy)
3. **Body**: Full post copy (ready to publish)
4. **Hashtags**: 10-15 relevant South African hashtags
5. **Best posting time**: Day and time for maximum organic reach
6. **Why it works**: How this replaces the paid ad's objective organically

Business context: ${input.businessContext}
Platform: ${input.platform}`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are an expert organic social media strategist for South African brands. Write content that feels authentic, not like an ad." },
          { role: "user", content: prompt },
        ],
      });

      return {
        content: response.choices[0]?.message?.content || "",
        adName: input.adName,
        adSpend: input.adSpend,
        platform: input.platform,
      };
    }),
});
