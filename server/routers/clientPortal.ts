import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { clientLeads, clientPortalSessions, type ClientLead } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";
import { notifyOwner } from "../_core/notification";
import crypto from "crypto";

const AGENTMAIL_API_KEY = process.env.AGENTMAIL_API_KEY;
const AGENTMAIL_BASE = "https://api.agentmail.to/v0";

async function sendEmail(to: string, subject: string, body: string) {
  if (!AGENTMAIL_API_KEY) {
    console.warn("[AgentMail] No API key — skipping email send");
    return null;
  }
  try {
    const inboxRes = await fetch(`${AGENTMAIL_BASE}/inboxes`, {
      headers: { Authorization: `Bearer ${AGENTMAIL_API_KEY}` },
    });
    const inboxData = await inboxRes.json() as { inboxes?: Array<{ id: string }> };
    const inboxId = inboxData.inboxes?.[0]?.id;
    if (!inboxId) return null;

    const res = await fetch(`${AGENTMAIL_BASE}/inboxes/${inboxId}/messages/send`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AGENTMAIL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ to, subject, body }),
    });
    return res.ok ? await res.json() : null;
  } catch (e) {
    console.error("[AgentMail] Send error:", e);
    return null;
  }
}

export const clientPortalRouter = router({
  // ── Public: Submit onboarding form ──────────────────────────────────────────
  submitLead: publicProcedure
    .input(z.object({
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      email: z.string().email(),
      phone: z.string().optional(),
      businessName: z.string().min(1),
      industry: z.string().optional(),
      websiteUrl: z.string().optional(),
      facebookUrl: z.string().optional(),
      instagramUrl: z.string().optional(),
      tiktokUrl: z.string().optional(),
      linkedinUrl: z.string().optional(),
      youtubeUrl: z.string().optional(),
      facebookFollowers: z.number().optional(),
      instagramFollowers: z.number().optional(),
      tiktokFollowers: z.number().optional(),
      monthlyBudget: z.string().optional(),
      primaryGoal: z.string().optional(),
      currentChallenges: z.string().optional(),
      targetAudience: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const dbConn = await getDb();
      if (!dbConn) throw new Error("Database unavailable");
      const [lead] = await dbConn.insert(clientLeads).values({
        ...input,
        status: "submitted",
      });

      await notifyOwner({
        title: `New Client Lead: ${input.businessName}`,
        content: `${input.firstName} ${input.lastName} (${input.email}) submitted an onboarding request.\n\nGoal: ${input.primaryGoal || "Not specified"}\nBudget: ${input.monthlyBudget || "Not specified"}`,
      });

      return { success: true, leadId: (lead as unknown as Record<string, unknown>).insertId };
    }),

  // ── Public: Check lead status by email ──────────────────────────────────────
  checkStatus: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .query(async ({ input }) => {
      const dbConn = await getDb();
      if (!dbConn) throw new Error("Database unavailable");
      const leads = await dbConn
        .select({
          id: clientLeads.id,
          businessName: clientLeads.businessName,
          status: clientLeads.status,
          createdAt: clientLeads.createdAt,
          proposalSentAt: clientLeads.proposalSentAt,
        })
        .from(clientLeads)
        .where(eq(clientLeads.email, input.email))
        .orderBy(desc(clientLeads.createdAt))
        .limit(1);
      return leads[0] || null;
    }),

  // ── Public: Access client portal via invite token ────────────────────────────
  accessPortal: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const dbConn = await getDb();
      if (!dbConn) throw new Error("Database unavailable");
      const sessions = await dbConn
        .select()
        .from(clientPortalSessions)
        .where(eq(clientPortalSessions.token, input.token))
        .limit(1);

      const session = sessions[0];
      if (!session || !session.isActive) {
        throw new Error("Invalid or expired invite link");
      }
      if (new Date(session.expiresAt) < new Date()) {
        throw new Error("This invite link has expired");
      }

      await dbConn
        .update(clientPortalSessions)
        .set({ lastAccessedAt: new Date() })
        .where(eq(clientPortalSessions.id, session.id));

      const leads = await dbConn
        .select()
        .from(clientLeads)
        .where(eq(clientLeads.id, session.leadId))
        .limit(1);

      const rawLead = leads[0];
      const leadResult = rawLead ? {
        id: rawLead.id,
        firstName: rawLead.firstName,
        lastName: rawLead.lastName,
        email: rawLead.email,
        businessName: rawLead.businessName,
        aiAnalysis: rawLead.aiAnalysis ?? null,
        aiStrategy: rawLead.aiStrategy ?? null,
        analysisScore: rawLead.analysisScore ?? null,
        proposedPricing: rawLead.proposedPricing ?? null,
        status: rawLead.status,
        industry: rawLead.industry ?? null,
      } : null;
      return { session, lead: leadResult };
    }),

  // ── Protected (owner): List all leads ───────────────────────────────────────
  listLeads: protectedProcedure
    .input(z.object({
      status: z.enum(["submitted", "analysing", "proposal_sent", "approved", "rejected", "active", "all"]).optional(),
    }))
    .query(async ({ input }) => {
      const dbConn = await getDb();
      if (!dbConn) throw new Error("Database unavailable");
      const leads = await dbConn.select().from(clientLeads).orderBy(desc(clientLeads.createdAt));
      if (input.status && input.status !== "all") {
        return leads.filter((l) => l.status === input.status);
      }
      return leads;
    }),

  // ── Protected (owner): Run AI analysis on a lead ────────────────────────────
  analyseLead: protectedProcedure
    .input(z.object({ leadId: z.number() }))
    .mutation(async ({ input }) => {
      const dbConn = await getDb();
      if (!dbConn) throw new Error("Database unavailable");
      const leads = await dbConn
        .select()
        .from(clientLeads)
        .where(eq(clientLeads.id, input.leadId))
        .limit(1);
      const lead = leads[0];
      if (!lead) throw new Error("Lead not found");

      await dbConn.update(clientLeads).set({ status: "analysing" }).where(eq(clientLeads.id, input.leadId));

      const context = [
        `Business: ${lead.businessName}`,
        `Industry: ${lead.industry || "Unknown"}`,
        `Website: ${lead.websiteUrl || "None provided"}`,
        `Facebook: ${lead.facebookUrl || "None"} (${lead.facebookFollowers || 0} followers)`,
        `Instagram: ${lead.instagramUrl || "None"} (${lead.instagramFollowers || 0} followers)`,
        `TikTok: ${lead.tiktokUrl || "None"} (${lead.tiktokFollowers || 0} followers)`,
        `LinkedIn: ${lead.linkedinUrl || "None"}`,
        `YouTube: ${lead.youtubeUrl || "None"}`,
        `Monthly Budget: ${lead.monthlyBudget || "Not specified"}`,
        `Primary Goal: ${lead.primaryGoal || "Not specified"}`,
        `Current Challenges: ${lead.currentChallenges || "Not specified"}`,
        `Target Audience: ${lead.targetAudience || "Not specified"}`,
      ].join("\n");

      const analysisResponse = await invokeLLM({
        messages: [
          {
            role: "system",
            content: "You are DatAgentic's senior AI strategist. Analyse the client's digital presence and provide a detailed assessment. Be specific, data-driven, and actionable. Format your response as JSON.",
          },
          {
            role: "user",
            content: `Analyse this client's digital presence:\n\n${context}\n\nReturn JSON with: { "analysis": "detailed analysis", "strengths": ["..."], "gaps": ["..."], "opportunities": ["..."], "strategy": "detailed 90-day strategy", "recommendedServices": ["..."], "estimatedROI": "...", "score": 75, "proposedPricing": "R 2,500/month" }`,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "client_analysis",
            strict: true,
            schema: {
              type: "object",
              properties: {
                analysis: { type: "string" },
                strengths: { type: "array", items: { type: "string" } },
                gaps: { type: "array", items: { type: "string" } },
                opportunities: { type: "array", items: { type: "string" } },
                strategy: { type: "string" },
                recommendedServices: { type: "array", items: { type: "string" } },
                estimatedROI: { type: "string" },
                score: { type: "number" },
                proposedPricing: { type: "string" },
              },
              required: ["analysis", "strengths", "gaps", "opportunities", "strategy", "recommendedServices", "estimatedROI", "score", "proposedPricing"],
              additionalProperties: false,
            },
          },
        },
      });

      const raw = analysisResponse.choices[0]?.message?.content || "{}";
      let parsed: Record<string, unknown> = {};
      try { parsed = JSON.parse(typeof raw === "string" ? raw : JSON.stringify(raw)); } catch { parsed = { analysis: String(raw), score: 70, proposedPricing: "R 2,500/month" }; }

      await dbConn.update(clientLeads).set({
        aiAnalysis: String(parsed.analysis || ""),
        aiStrategy: JSON.stringify({ strategy: parsed.strategy, strengths: parsed.strengths, gaps: parsed.gaps, opportunities: parsed.opportunities, recommendedServices: parsed.recommendedServices, estimatedROI: parsed.estimatedROI }),
        analysisScore: Number(parsed.score) || 70,
        proposedPricing: String(parsed.proposedPricing || "R 2,500/month"),
        status: "proposal_sent",
        proposalSentAt: new Date(),
      }).where(eq(clientLeads.id, input.leadId));

      const services = Array.isArray(parsed.recommendedServices) ? (parsed.recommendedServices as string[]) : [];
      const emailBody = [
        `Hi ${lead.firstName},`,
        "",
        `Thank you for submitting your details to DatAgentic — AI Social Intelligence by StudEx DevOps.`,
        "",
        `We've completed our AI-powered analysis of ${lead.businessName}'s digital presence.`,
        "",
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        `YOUR DIGITAL PRESENCE SCORE: ${parsed.score}/100`,
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        "",
        String(parsed.analysis || ""),
        "",
        "WHAT WE RECOMMEND:",
        ...services.map((s: string, i: number) => `${i + 1}. ${s}`),
        "",
        `PROPOSED INVESTMENT: ${parsed.proposedPricing}`,
        `ESTIMATED ROI: ${parsed.estimatedROI}`,
        "",
        "Reply to this email to discuss further.",
        "",
        "Best regards,",
        "The DatAgentic Team — StudEx DevOps",
      ].join("\n");

      await sendEmail(lead.email, `Your DatAgentic Strategy Report — ${lead.businessName}`, emailBody);

      return { success: true, analysis: parsed };
    }),

  // ── Protected (owner): Approve lead and send invite ──────────────────────────
  approveLead: protectedProcedure
    .input(z.object({ leadId: z.number() }))
    .mutation(async ({ input }) => {
      const dbConn = await getDb();
      if (!dbConn) throw new Error("Database unavailable");
      const leads = await dbConn.select().from(clientLeads).where(eq(clientLeads.id, input.leadId)).limit(1);
      const lead = leads[0];
      if (!lead) throw new Error("Lead not found");

      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      await dbConn.insert(clientPortalSessions).values({
        leadId: input.leadId,
        token,
        email: lead.email,
        expiresAt,
        isActive: true,
      });

      await dbConn.update(clientLeads).set({
        status: "approved",
        approvedAt: new Date(),
        inviteToken: token,
        inviteExpiresAt: expiresAt,
      }).where(eq(clientLeads.id, input.leadId));

      const portalUrl = `https://nexussocail-fypx8oul.manus.space/client-portal?token=${token}`;
      const emailBody = [
        `Hi ${lead.firstName},`,
        "",
        "Great news — your DatAgentic client portal is ready!",
        "",
        "You now have access to your personalised dashboard where you can:",
        "✓ View your complete AI strategy report",
        "✓ See your content calendar and recommendations",
        "✓ Track your campaign performance",
        "✓ Access your dedicated analytics",
        "",
        "Click the link below to access your portal:",
        portalUrl,
        "",
        "This link is valid for 30 days.",
        "",
        "Welcome to DatAgentic!",
        "",
        "Best regards,",
        "The DatAgentic Team — StudEx DevOps",
      ].join("\n");

      await sendEmail(lead.email, "Your DatAgentic Client Portal is Ready!", emailBody);

      return { success: true, token, portalUrl };
    }),

  // ── Protected (owner): Reject lead ──────────────────────────────────────────
  rejectLead: protectedProcedure
    .input(z.object({ leadId: z.number(), reason: z.string().optional() }))
    .mutation(async ({ input }) => {
      const dbConn = await getDb();
      if (!dbConn) throw new Error("Database unavailable");
      const leads = await dbConn.select().from(clientLeads).where(eq(clientLeads.id, input.leadId)).limit(1);
      const lead = leads[0];
      if (!lead) throw new Error("Lead not found");

      await dbConn.update(clientLeads).set({ status: "rejected" }).where(eq(clientLeads.id, input.leadId));

      if (input.reason) {
        await sendEmail(lead.email, "Regarding your DatAgentic application", `Hi ${lead.firstName},\n\nThank you for your interest in DatAgentic.\n\n${input.reason}\n\nBest regards,\nThe DatAgentic Team`);
      }

      return { success: true };
    }),

  // ── Protected (owner): Get single lead detail ────────────────────────────────
  getLead: protectedProcedure
    .input(z.object({ leadId: z.number() }))
    .query(async ({ input }) => {
      const dbConn = await getDb();
      if (!dbConn) throw new Error("Database unavailable");
      const leads = await dbConn.select().from(clientLeads).where(eq(clientLeads.id, input.leadId)).limit(1);
      return leads[0] || null;
    }),
});
