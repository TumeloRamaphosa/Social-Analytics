import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { integrations } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

const FB_API = "https://graph.facebook.com/v19.0";

// ─── Graph API helper ─────────────────────────────────────────────────────────
async function fbGet(path: string, token: string, params: Record<string, string> = {}) {
  const url = new URL(`${FB_API}${path}`);
  url.searchParams.set("access_token", token);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  const res = await fetch(url.toString());
  const json = await res.json();
  if (json.error) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Facebook API error: ${json.error.message} (code ${json.error.code})`,
    });
  }
  return json;
}

// ─── Get Facebook integration for the current user ────────────────────────────
async function getFbIntegration(userId: number) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

  const rows = await db.select().from(integrations)
    .where(and(eq(integrations.userId, userId), eq(integrations.type, "facebook")))
    .limit(1);

  if (!rows.length || !rows[0].metaAccessToken) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "Facebook not connected. Please connect your Facebook page in Settings → Integrations.",
    });
  }
  return rows[0];
}

// ─── Date helpers ─────────────────────────────────────────────────────────────
function sinceDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return Math.floor(d.getTime() / 1000).toString();
}

function untilDate(): string {
  return Math.floor(Date.now() / 1000).toString();
}

export const facebookRouter = router({

  // ─── Page summary (fans, name, category) ─────────────────────────────────
  getPageSummary: protectedProcedure.query(async ({ ctx }) => {
    const integration = await getFbIntegration(ctx.user.id);
    const token = integration.metaAccessToken!;

    // If no page ID stored, fetch the first managed page
    let pageId = integration.metaPageId;
    let pageToken = token;

    if (!pageId) {
      // Try to get pages managed by this user token
      const pagesData = await fbGet("/me/accounts", token, { fields: "id,name,access_token,fan_count,category" });
      if (pagesData.data && pagesData.data.length > 0) {
        const page = pagesData.data[0];
        pageId = page.id;
        pageToken = page.access_token || token;

        // Save the page ID for future calls
        const db = await getDb();
        if (db) {
          await db.update(integrations)
            .set({ metaPageId: pageId })
            .where(and(eq(integrations.userId, ctx.user.id), eq(integrations.type, "facebook")));
        }

        return {
          pageId,
          name: page.name,
          category: page.category,
          fanCount: page.fan_count || 0,
          hasPageToken: !!page.access_token,
        };
      }
    }

    if (!pageId) {
      // Fall back to user profile data
      const me = await fbGet("/me", token, { fields: "id,name" });
      return {
        pageId: me.id,
        name: me.name,
        category: "Personal Profile",
        fanCount: 0,
        hasPageToken: false,
      };
    }

    // Get page details with page token
    const page = await fbGet(`/${pageId}`, pageToken, {
      fields: "id,name,category,fan_count,followers_count,website,about",
    });

    return {
      pageId: page.id,
      name: page.name,
      category: page.category,
      fanCount: page.fan_count || page.followers_count || 0,
      followersCount: page.followers_count || 0,
      website: page.website,
      about: page.about,
      hasPageToken: true,
    };
  }),

  // ─── Page insights (reach, impressions, engagement over time) ────────────
  getPageInsights: protectedProcedure
    .input(z.object({
      period: z.enum(["day", "week", "days_28"]).default("day"),
      days: z.number().min(7).max(90).default(28),
    }))
    .query(async ({ ctx, input }) => {
      const integration = await getFbIntegration(ctx.user.id);
      const token = integration.metaAccessToken!;
      const pageId = integration.metaPageId;

      if (!pageId) {
        return { metrics: [], summary: { totalReach: 0, totalImpressions: 0, avgEngagement: 0 } };
      }

      // Get page token
      let pageToken = token;
      try {
        const pagesData = await fbGet("/me/accounts", token, { fields: "id,access_token" });
        const page = pagesData.data?.find((p: any) => p.id === pageId);
        if (page?.access_token) pageToken = page.access_token;
      } catch {
        // Use user token as fallback
      }

      const metrics = [
        "page_impressions",
        "page_reach",
        "page_engaged_users",
        "page_post_engagements",
        "page_fan_adds",
        "page_views_total",
      ].join(",");

      const data = await fbGet(`/${pageId}/insights`, pageToken, {
        metric: metrics,
        period: input.period,
        since: sinceDate(input.days),
        until: untilDate(),
      });

      // Reshape into time-series by date
      const byDate: Record<string, Record<string, number>> = {};

      for (const metricData of (data.data || [])) {
        const metricName = metricData.name as string;
        for (const point of (metricData.values || [])) {
          const date = point.end_time?.split("T")[0] || new Date().toISOString().split("T")[0];
          if (!byDate[date]) byDate[date] = {};
          byDate[date][metricName] = typeof point.value === "number" ? point.value : 0;
        }
      }

      const series = Object.entries(byDate)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, vals]) => ({
          date,
          label: new Date(date).toLocaleDateString("en-ZA", { weekday: "short", month: "short", day: "numeric" }),
          reach: vals["page_reach"] || 0,
          impressions: vals["page_impressions"] || 0,
          engaged: vals["page_engaged_users"] || 0,
          engagements: vals["page_post_engagements"] || 0,
          newFans: vals["page_fan_adds"] || 0,
          pageViews: vals["page_views_total"] || 0,
        }));

      const totalReach = series.reduce((s, d) => s + d.reach, 0);
      const totalImpressions = series.reduce((s, d) => s + d.impressions, 0);
      const totalEngaged = series.reduce((s, d) => s + d.engaged, 0);
      const avgEngagement = totalReach > 0 ? (totalEngaged / totalReach) * 100 : 0;

      return {
        metrics: series,
        summary: {
          totalReach,
          totalImpressions,
          avgEngagement: Math.round(avgEngagement * 10) / 10,
          totalNewFans: series.reduce((s, d) => s + d.newFans, 0),
          totalPageViews: series.reduce((s, d) => s + d.pageViews, 0),
        },
      };
    }),

  // ─── Top posts ────────────────────────────────────────────────────────────
  getTopPosts: protectedProcedure
    .input(z.object({ limit: z.number().min(5).max(25).default(10) }))
    .query(async ({ ctx, input }) => {
      const integration = await getFbIntegration(ctx.user.id);
      const token = integration.metaAccessToken!;
      const pageId = integration.metaPageId;

      if (!pageId) return [];

      // Get page token
      let pageToken = token;
      try {
        const pagesData = await fbGet("/me/accounts", token, { fields: "id,access_token" });
        const page = pagesData.data?.find((p: any) => p.id === pageId);
        if (page?.access_token) pageToken = page.access_token;
      } catch {}

      const postsData = await fbGet(`/${pageId}/posts`, pageToken, {
        fields: "id,message,story,created_time,full_picture,attachments,insights.metric(post_impressions,post_reach,post_engaged_users,post_reactions_like_total,post_reactions_total)",
        limit: String(input.limit),
      });

      const posts = (postsData.data || []).map((post: any) => {
        const insightsMap: Record<string, number> = {};
        for (const metric of (post.insights?.data || [])) {
          insightsMap[metric.name] = metric.values?.[0]?.value || 0;
        }

        const reach = insightsMap["post_reach"] || 0;
        const engaged = insightsMap["post_engaged_users"] || 0;
        const engagementRate = reach > 0 ? Math.round((engaged / reach) * 1000) / 10 : 0;

        return {
          id: post.id,
          message: post.message || post.story || "(No caption)",
          createdAt: post.created_time,
          picture: post.full_picture,
          reach,
          impressions: insightsMap["post_impressions"] || 0,
          engaged,
          reactions: insightsMap["post_reactions_total"] || insightsMap["post_reactions_like_total"] || 0,
          engagementRate,
          type: post.attachments?.data?.[0]?.type || "status",
        };
      });

      // Sort by reach descending
      return posts.sort((a: any, b: any) => b.reach - a.reach);
    }),

  // ─── Audience demographics ────────────────────────────────────────────────
  getAudienceDemographics: protectedProcedure.query(async ({ ctx }) => {
    const integration = await getFbIntegration(ctx.user.id);
    const token = integration.metaAccessToken!;
    const pageId = integration.metaPageId;

    if (!pageId) return { ageGender: [], countries: [], cities: [] };

    let pageToken = token;
    try {
      const pagesData = await fbGet("/me/accounts", token, { fields: "id,access_token" });
      const page = pagesData.data?.find((p: any) => p.id === pageId);
      if (page?.access_token) pageToken = page.access_token;
    } catch {}

    const [ageGenderData, countriesData, citiesData] = await Promise.allSettled([
      fbGet(`/${pageId}/insights`, pageToken, {
        metric: "page_fans_gender_age",
        period: "lifetime",
      }),
      fbGet(`/${pageId}/insights`, pageToken, {
        metric: "page_fans_country",
        period: "lifetime",
      }),
      fbGet(`/${pageId}/insights`, pageToken, {
        metric: "page_fans_city",
        period: "lifetime",
      }),
    ]);

    // Process age/gender
    const ageGenderRaw = ageGenderData.status === "fulfilled"
      ? ageGenderData.value?.data?.[0]?.values?.[0]?.value || {}
      : {};

    const ageGroups: Record<string, { male: number; female: number; unknown: number }> = {};
    for (const [key, count] of Object.entries(ageGenderRaw)) {
      const [gender, age] = (key as string).split(".");
      if (!ageGroups[age]) ageGroups[age] = { male: 0, female: 0, unknown: 0 };
      if (gender === "M") ageGroups[age].male += count as number;
      else if (gender === "F") ageGroups[age].female += count as number;
      else ageGroups[age].unknown += count as number;
    }

    const ageGender = Object.entries(ageGroups)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([age, counts]) => ({ age, ...counts }));

    // Process countries
    const countriesRaw = countriesData.status === "fulfilled"
      ? countriesData.value?.data?.[0]?.values?.[0]?.value || {}
      : {};
    const countries = Object.entries(countriesRaw)
      .map(([country, count]) => ({ country, count: count as number }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Process cities
    const citiesRaw = citiesData.status === "fulfilled"
      ? citiesData.value?.data?.[0]?.values?.[0]?.value || {}
      : {};
    const cities = Object.entries(citiesRaw)
      .map(([city, count]) => ({ city, count: count as number }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return { ageGender, countries, cities };
  }),

  // ─── Recent posts (for content calendar view) ─────────────────────────────
  getRecentActivity: protectedProcedure
    .input(z.object({ days: z.number().default(30) }))
    .query(async ({ ctx, input }) => {
      const integration = await getFbIntegration(ctx.user.id);
      const token = integration.metaAccessToken!;
      const pageId = integration.metaPageId;

      if (!pageId) return { posts: [], totalPosts: 0 };

      let pageToken = token;
      try {
        const pagesData = await fbGet("/me/accounts", token, { fields: "id,access_token" });
        const page = pagesData.data?.find((p: any) => p.id === pageId);
        if (page?.access_token) pageToken = page.access_token;
      } catch {}

      const since = new Date();
      since.setDate(since.getDate() - input.days);

      const postsData = await fbGet(`/${pageId}/posts`, pageToken, {
        fields: "id,message,created_time,attachments",
        since: Math.floor(since.getTime() / 1000).toString(),
        limit: "50",
      });

      const posts = (postsData.data || []).map((post: any) => ({
        id: post.id,
        message: (post.message || post.story || "").substring(0, 100),
        createdAt: post.created_time,
        type: post.attachments?.data?.[0]?.type || "status",
      }));

      return { posts, totalPosts: posts.length };
    }),

  // ─── Connection status check ──────────────────────────────────────────────
  getConnectionStatus: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    const rows = await db.select({
      id: integrations.id,
      status: integrations.status,
      metaPageId: integrations.metaPageId,
      metaInstagramId: integrations.metaInstagramId,
      lastSyncedAt: integrations.lastSyncedAt,
      hasToken: integrations.metaAccessToken,
    }).from(integrations)
      .where(and(eq(integrations.userId, ctx.user.id), eq(integrations.type, "facebook")))
      .limit(1);

    if (!rows.length) return { connected: false };

    return {
      connected: !!rows[0].hasToken,
      status: rows[0].status,
      pageId: rows[0].metaPageId,
      instagramId: rows[0].metaInstagramId,
      lastSyncedAt: rows[0].lastSyncedAt,
    };
  }),
});
