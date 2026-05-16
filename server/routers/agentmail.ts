import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { AgentMailClient } from "agentmail";

function getClient() {
  const apiKey = process.env.AGENTMAIL_API_KEY;
  if (!apiKey) throw new Error("AGENTMAIL_API_KEY is not configured");
  return new AgentMailClient({ apiKey });
}

export const agentmailRouter = router({
  // ── List all inboxes ──────────────────────────────────────────────────────
  listInboxes: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(100).default(20) }).optional())
    .query(async () => {
      const client = getClient();
      const result = await client.inboxes.list({ limit: 50 });
      return result;
    }),

  // ── List messages in an inbox ─────────────────────────────────────────────
  listMessages: protectedProcedure
    .input(z.object({
      inboxId: z.string(),
      limit: z.number().min(1).max(100).default(20),
      pageToken: z.string().optional(),
      labels: z.array(z.string()).optional(),
    }))
    .query(async ({ input }) => {
      const client = getClient();
      const result = await client.inboxes.messages.list(input.inboxId, {
        limit: input.limit,
        pageToken: input.pageToken,
        labels: input.labels,
      });
      return result;
    }),

  // ── Get a single message ──────────────────────────────────────────────────
  getMessage: protectedProcedure
    .input(z.object({ inboxId: z.string(), messageId: z.string() }))
    .query(async ({ input }) => {
      const client = getClient();
      const msg = await client.inboxes.messages.get(input.inboxId, input.messageId);
      return msg;
    }),

  // ── Send a new email ──────────────────────────────────────────────────────
  sendMessage: protectedProcedure
    .input(z.object({
      inboxId: z.string(),
      to: z.array(z.string().email()).min(1),
      subject: z.string().min(1),
      text: z.string(),
      html: z.string().optional(),
      cc: z.array(z.string().email()).optional(),
      bcc: z.array(z.string().email()).optional(),
      labels: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input }) => {
      const client = getClient();
      const sent = await client.inboxes.messages.send(input.inboxId, {
        to: input.to,
        subject: input.subject,
        text: input.text,
        html: input.html,
        cc: input.cc,
        bcc: input.bcc,
        labels: input.labels,
      });
      return { success: true, messageId: (sent as any).messageId ?? (sent as any).id };
    }),

  // ── Reply to a message ────────────────────────────────────────────────────
  replyMessage: protectedProcedure
    .input(z.object({
      inboxId: z.string(),
      messageId: z.string(),
      text: z.string(),
      html: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const client = getClient();
      const reply = await client.inboxes.messages.reply(input.inboxId, input.messageId, {
        text: input.text,
        html: input.html,
      });
      return { success: true, messageId: (reply as any).messageId ?? (reply as any).id };
    }),

  // ── Send bulk campaign ────────────────────────────────────────────────────
  sendCampaign: protectedProcedure
    .input(z.object({
      inboxId: z.string(),
      recipients: z.array(z.string().email()).min(1).max(50),
      subject: z.string().min(1),
      text: z.string(),
      html: z.string().optional(),
      labels: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input }) => {
      const client = getClient();
      // AgentMail supports up to 50 recipients per send
      const sent = await client.inboxes.messages.send(input.inboxId, {
        to: input.recipients,
        subject: input.subject,
        text: input.text,
        html: input.html,
        labels: input.labels ?? ["campaign"],
      });
      return {
        success: true,
        recipientCount: input.recipients.length,
        messageId: (sent as any).messageId ?? (sent as any).id,
      };
    }),

  // ── Create a new inbox ────────────────────────────────────────────────────
  createInbox: protectedProcedure
    .input(z.object({
      username: z.string().optional(),
      displayName: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const client = getClient();
      const inbox = await client.inboxes.create({
        username: input.username,
        displayName: input.displayName,
      });
      return inbox;
    }),

  // ── Test connection ───────────────────────────────────────────────────────
  testConnection: protectedProcedure
    .query(async () => {
      const client = getClient();
      const result = await client.inboxes.list({ limit: 1 });
      return { connected: true, inboxCount: result.count ?? 0 };
    }),
});
