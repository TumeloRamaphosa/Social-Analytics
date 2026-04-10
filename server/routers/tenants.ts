/**
 * Tenants Router — White-Label Multi-Tenant Management
 * Handles workspace/tenant creation, branding config, and client portal data.
 */
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { workspaces, workspaceMembers, users } from "../../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";

// ─── PLAN LIMITS ─────────────────────────────────────────────────────────────
const PLAN_FEATURES: Record<string, {
  label: string;
  monthlyPriceZAR: number;
  features: string[];
  maxUsers: number;
  maxIntegrations: number;
}> = {
  starter: {
    label: "Starter",
    monthlyPriceZAR: 2500,
    maxUsers: 2,
    maxIntegrations: 2,
    features: [
      "Facebook & Instagram Analytics",
      "AI Content Generation (50 posts/month)",
      "Basic RAG Knowledge Search",
      "Monthly Performance Report",
      "Email Support",
    ],
  },
  pro: {
    label: "Growth",
    monthlyPriceZAR: 5500,
    maxUsers: 5,
    maxIntegrations: 5,
    features: [
      "Everything in Starter",
      "Higgsfield AI Video Generation",
      "Advanced Analytics & Audience Insights",
      "Content Calendar & Scheduling",
      "WhatsApp Integration",
      "Weekly AI Performance Digest",
      "Priority Support",
    ],
  },
  agency: {
    label: "Command Centre",
    monthlyPriceZAR: 9500,
    maxUsers: 20,
    maxIntegrations: 10,
    features: [
      "Everything in Growth",
      "Full RAG Super Brain (unlimited docs)",
      "9 AI Agents (Research, SEO, Email, Social)",
      "DenchClaw CRM Integration",
      "Virtual Influencer Management",
      "White-Label Client Portals",
      "Custom Brand Voice Library",
      "Dedicated Account Manager",
    ],
  },
};

// ─── DEMO TENANTS ─────────────────────────────────────────────────────────────
const DEMO_TENANTS = [
  {
    name: "Kasi Eats",
    slug: "kasi-eats",
    plan: "pro" as const,
    brandColor: "#f97316",
    logoUrl: null,
    industry: "Food & Beverage",
    location: "Soweto, Johannesburg",
    description: "Township food delivery platform connecting local restaurants to customers",
    metrics: {
      followers: 12400,
      monthlyReach: 89000,
      engagementRate: 4.7,
      contentPosts: 34,
      aiVideos: 8,
    },
  },
  {
    name: "Ubuntu Fintech",
    slug: "ubuntu-fintech",
    plan: "agency" as const,
    brandColor: "#10b981",
    logoUrl: null,
    industry: "Financial Services",
    location: "Cape Town, South Africa",
    description: "Mobile-first savings and investment platform for the African market",
    metrics: {
      followers: 28700,
      monthlyReach: 210000,
      engagementRate: 3.2,
      contentPosts: 67,
      aiVideos: 22,
    },
  },
  {
    name: "Naledi Fashion",
    slug: "naledi-fashion",
    plan: "starter" as const,
    brandColor: "#ec4899",
    logoUrl: null,
    industry: "Fashion & Retail",
    location: "Durban, South Africa",
    description: "Contemporary African fashion brand celebrating heritage through design",
    metrics: {
      followers: 5600,
      monthlyReach: 31000,
      engagementRate: 6.1,
      contentPosts: 18,
      aiVideos: 3,
    },
  },
];

export const tenantsRouter = router({
  // ─── LIST ALL TENANTS (admin only) ─────────────────────────────────────────
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    const allWorkspaces = await db
      .select()
      .from(workspaces)
      .orderBy(desc(workspaces.createdAt));

    return allWorkspaces.map((ws: typeof workspaces.$inferSelect) => ({
      ...ws,
      planInfo: PLAN_FEATURES[ws.plan],
    }));
  }),

  // ─── GET SINGLE TENANT ─────────────────────────────────────────────────────
  get: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const [ws] = await db
        .select()
        .from(workspaces)
        .where(eq(workspaces.slug, input.slug))
        .limit(1);

      if (!ws) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Workspace not found" });
      }

      return {
        ...ws,
        planInfo: PLAN_FEATURES[ws.plan as keyof typeof PLAN_FEATURES],
      };
    }),

  // ─── CREATE TENANT ─────────────────────────────────────────────────────────
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(2).max(256),
      slug: z.string().min(2).max(128).regex(/^[a-z0-9-]+$/),
      plan: z.enum(["starter", "pro", "agency"]),
      brandColor: z.string().default("#2563eb"),
      logoUrl: z.string().url().optional(),
      isWhiteLabel: z.boolean().default(true),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      // Check slug uniqueness
      const [existing] = await db
        .select({ id: workspaces.id })
        .from(workspaces)
        .where(eq(workspaces.slug, input.slug))
        .limit(1);

      if (existing) {
        throw new TRPCError({ code: "CONFLICT", message: "A workspace with this slug already exists" });
      }

      const [created] = await db
        .insert(workspaces)
        .values({
          ownerId: ctx.user.id,
          name: input.name,
          slug: input.slug,
          plan: input.plan,
          brandColor: input.brandColor,
          logoUrl: input.logoUrl ?? null,
          isWhiteLabel: input.isWhiteLabel,
        });

      return { success: true, id: (created as { insertId: number }).insertId };
    }),

  // ─── UPDATE TENANT BRANDING ────────────────────────────────────────────────
  updateBranding: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().min(2).max(256).optional(),
      brandColor: z.string().optional(),
      logoUrl: z.string().url().optional().nullable(),
      plan: z.enum(["starter", "pro", "agency"]).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const { id, ...updates } = input;
      await db
        .update(workspaces)
        .set(updates)
        .where(eq(workspaces.id, id));

      return { success: true };
    }),

  // ─── SEED DEMO TENANTS ─────────────────────────────────────────────────────
  seedDemo: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    let created = 0;
    for (const demo of DEMO_TENANTS) {
      const [existing] = await db
        .select({ id: workspaces.id })
        .from(workspaces)
        .where(eq(workspaces.slug, demo.slug))
        .limit(1);

      if (!existing) {
        await (db).insert(workspaces).values({
          ownerId: ctx.user.id,
          name: demo.name,
          slug: demo.slug,
          plan: demo.plan,
          brandColor: demo.brandColor,
          logoUrl: null,
          isWhiteLabel: true,
        });
        created++;
      }
    }
    return { success: true, created, total: DEMO_TENANTS.length };
  }),

  // ─── GET DEMO METRICS (simulated live data per tenant) ─────────────────────
  getDemoMetrics: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const demo = DEMO_TENANTS.find(d => d.slug === input.slug);
      if (!demo) {
        // Return generic metrics for real tenants
        return {
          followers: Math.floor(Math.random() * 10000) + 1000,
          monthlyReach: Math.floor(Math.random() * 50000) + 5000,
          engagementRate: parseFloat((Math.random() * 5 + 1).toFixed(1)),
          contentPosts: Math.floor(Math.random() * 50) + 5,
          aiVideos: Math.floor(Math.random() * 10),
          industry: "General",
          location: "South Africa",
          description: "Your business powered by Nexus Social AI",
        };
      }
      return {
        ...demo.metrics,
        industry: demo.industry,
        location: demo.location,
        description: demo.description,
      };
    }),

  // ─── GET PLAN INFO ─────────────────────────────────────────────────────────
  getPlanInfo: protectedProcedure.query(() => {
    return PLAN_FEATURES;
  }),

  // ─── DELETE TENANT ─────────────────────────────────────────────────────────
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      await db
        .delete(workspaces)
        .where(eq(workspaces.id, input.id));
      return { success: true };
    }),
});
