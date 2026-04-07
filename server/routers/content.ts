import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { contentPosts, contentCalendar, brandVoices, integrations } from "../../drizzle/schema";
import { eq, and, desc, gte, lte } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";
import { generateImage } from "../_core/imageGeneration";
import { storagePut } from "../storage";

// ─── Content router ───────────────────────────────────────────────────────────
export const contentRouter = router({

  // List posts
  listPosts: protectedProcedure
    .input(z.object({
      status: z.enum(["draft", "scheduled", "published", "failed"]).optional(),
      platform: z.enum(["facebook", "instagram", "whatsapp", "all"]).optional(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().default(0),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const conditions = [eq(contentPosts.userId, ctx.user.id)];
      if (input.status) conditions.push(eq(contentPosts.status, input.status));
      if (input.platform) conditions.push(eq(contentPosts.platform, input.platform));
      return db.select().from(contentPosts)
        .where(and(...conditions))
        .orderBy(desc(contentPosts.createdAt))
        .limit(input.limit)
        .offset(input.offset);
    }),

  // Get single post
  getPost: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const result = await db.select().from(contentPosts)
        .where(and(eq(contentPosts.id, input.id), eq(contentPosts.userId, ctx.user.id)))
        .limit(1);
      return result[0] || null;
    }),

  // Create post
  createPost: protectedProcedure
    .input(z.object({
      title: z.string().optional(),
      caption: z.string(),
      hashtags: z.string().optional(),
      imageUrl: z.string().optional(),
      platform: z.enum(["facebook", "instagram", "whatsapp", "all"]).default("all"),
      scheduledAt: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const result = await db.insert(contentPosts).values({
        workspaceId: 1,
        userId: ctx.user.id,
        title: input.title,
        caption: input.caption,
        hashtags: input.hashtags,
        imageUrl: input.imageUrl,
        platform: input.platform,
        status: input.scheduledAt ? "scheduled" : "draft",
        scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : undefined,
        aiGenerated: false,
      });
      return { success: true, id: (result as any).insertId };
    }),

  // Update post
  updatePost: protectedProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      caption: z.string().optional(),
      hashtags: z.string().optional(),
      imageUrl: z.string().optional(),
      platform: z.enum(["facebook", "instagram", "whatsapp", "all"]).optional(),
      status: z.enum(["draft", "scheduled", "published", "failed"]).optional(),
      scheduledAt: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const { id, scheduledAt, ...rest } = input;
      await db.update(contentPosts)
        .set({ ...rest, scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined })
        .where(and(eq(contentPosts.id, id), eq(contentPosts.userId, ctx.user.id)));
      return { success: true };
    }),

  // Delete post
  deletePost: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.delete(contentPosts)
        .where(and(eq(contentPosts.id, input.id), eq(contentPosts.userId, ctx.user.id)));
      return { success: true };
    }),

  // AI Generate post content
  generatePost: protectedProcedure
    .input(z.object({
      brief: z.string().min(10),
      platform: z.enum(["facebook", "instagram", "whatsapp", "all"]).default("instagram"),
      contentType: z.enum(["product", "educational", "promotional", "ugc", "behind_scenes", "testimonial"]).default("product"),
      brandName: z.string().default("StudEx Meat"),
      brandTone: z.string().default("premium, trustworthy, Halal-certified, South African"),
      productName: z.string().optional(),
      includeHashtags: z.boolean().default(true),
      includeEmoji: z.boolean().default(true),
    }))
    .mutation(async ({ ctx, input }) => {
      const platformGuide: Record<string, string> = {
        instagram: "Instagram caption (max 2200 chars, engaging, visual-first, strong hook in first line)",
        facebook: "Facebook post (conversational, slightly longer, can include a question to drive comments)",
        whatsapp: "WhatsApp broadcast message (concise, personal, direct, max 500 chars)",
        all: "versatile social media post suitable for Facebook, Instagram, and WhatsApp",
      };

      const contentGuide: Record<string, string> = {
        product: "showcase a specific product with its benefits, quality, and a clear call-to-action",
        educational: "teach the audience something valuable (cooking tips, nutrition, Halal certification info)",
        promotional: "announce a special offer, discount, or limited-time deal with urgency",
        ugc: "celebrate a customer story or photo in an authentic, appreciative way",
        behind_scenes: "show the human side of the brand — preparation, sourcing, team, or process",
        testimonial: "share a customer review or success story in a compelling way",
      };

      const prompt = `You are a world-class social media copywriter for ${input.brandName}, a premium ${input.brandTone} brand.

Write a ${platformGuide[input.platform]} that ${contentGuide[input.contentType]}.

Brief: ${input.brief}
${input.productName ? `Product: ${input.productName}` : ""}

Requirements:
- Match the brand tone: ${input.brandTone}
- ${input.includeEmoji ? "Include relevant emojis naturally" : "No emojis"}
- ${input.includeHashtags ? "Include 5-10 relevant hashtags at the end" : "No hashtags"}
- Make it feel authentic, not corporate
- End with a clear call-to-action

Return a JSON object with:
{
  "caption": "the main post caption",
  "hashtags": "space-separated hashtags",
  "title": "a short internal title for this post",
  "imagePrompt": "a detailed DALL-E/Midjourney style image generation prompt for the visual"
}`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are an expert social media copywriter. Always return valid JSON." },
          { role: "user", content: prompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "post_content",
            strict: true,
            schema: {
              type: "object",
              properties: {
                caption: { type: "string" },
                hashtags: { type: "string" },
                title: { type: "string" },
                imagePrompt: { type: "string" },
              },
              required: ["caption", "hashtags", "title", "imagePrompt"],
              additionalProperties: false,
            },
          },
        },
      });

      const content = JSON.parse(String(response.choices[0]?.message?.content || "{}"));

      // Save as draft
      const db = await getDb();
      if (db) {
        const result = await db.insert(contentPosts).values({
          workspaceId: 1,
          userId: ctx.user.id,
          title: content.title,
          caption: content.caption,
          hashtags: content.hashtags,
          platform: input.platform,
          status: "draft",
          aiGenerated: true,
          aiModel: "built-in-llm",
          contentBrief: input.brief,
          imagePrompt: content.imagePrompt,
        });
        return { ...content, id: (result as any).insertId, saved: true };
      }

      return { ...content, saved: false };
    }),

  // Generate image for a post
  generatePostImage: protectedProcedure
    .input(z.object({
      postId: z.number(),
      prompt: z.string().min(10),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Verify post belongs to user
      const post = await db.select().from(contentPosts)
        .where(and(eq(contentPosts.id, input.postId), eq(contentPosts.userId, ctx.user.id)))
        .limit(1);
      if (!post.length) throw new Error("Post not found");

      // Generate image
      const { url } = await generateImage({ prompt: input.prompt });

      // Update post with image URL
      await db.update(contentPosts)
        .set({ imageUrl: url })
        .where(eq(contentPosts.id, input.postId));

      return { success: true, imageUrl: url };
    }),

  // Get calendar entries
  getCalendar: protectedProcedure
    .input(z.object({
      from: z.string(),
      to: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      return db.select().from(contentCalendar)
        .where(and(
          eq(contentCalendar.workspaceId, 1),
          gte(contentCalendar.scheduledDate, new Date(input.from)),
          lte(contentCalendar.scheduledDate, new Date(input.to)),
        ))
        .orderBy(contentCalendar.scheduledDate);
    }),

  // Add calendar entry
  addCalendarEntry: protectedProcedure
    .input(z.object({
      title: z.string(),
      description: z.string().optional(),
      platform: z.enum(["facebook", "instagram", "whatsapp", "all"]).default("all"),
      contentType: z.enum(["product", "educational", "promotional", "ugc", "behind_scenes", "testimonial"]).default("product"),
      scheduledDate: z.string(),
      color: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.insert(contentCalendar).values({
        workspaceId: 1,
        title: input.title,
        description: input.description,
        platform: input.platform,
        contentType: input.contentType,
        scheduledDate: new Date(input.scheduledDate),
        color: input.color || "#2563eb",
        status: "planned",
      });
      return { success: true };
    }),

  // Generate a full weekly content plan
  generateWeeklyPlan: protectedProcedure
    .input(z.object({
      brandName: z.string().default("StudEx Meat"),
      brandDescription: z.string().default("Premium Halal-certified beef brand in South Africa"),
      weekStartDate: z.string(),
      focusProducts: z.array(z.string()).optional(),
      promotions: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const prompt = `Create a detailed 7-day social media content plan for ${input.brandName}.

Brand: ${input.brandDescription}
Week starting: ${input.weekStartDate}
${input.focusProducts?.length ? `Focus products: ${input.focusProducts.join(", ")}` : ""}
${input.promotions ? `Promotions this week: ${input.promotions}` : ""}

For each day (Monday through Sunday), provide:
- Day name
- Content type (product/educational/promotional/ugc/behind_scenes/testimonial)
- Platform (facebook/instagram/whatsapp)
- Post title
- Brief description of the content
- Best posting time
- Goal (reach/engagement/conversion/trust)

Return as JSON array of 7 objects with fields: day, contentType, platform, title, description, postingTime, goal`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are an expert social media strategist. Return valid JSON arrays only." },
          { role: "user", content: prompt },
        ],
      });

      const content = String(response.choices[0]?.message?.content || "[]");
      let plan: any[] = [];
      try {
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        plan = JSON.parse(jsonMatch ? jsonMatch[0] : "[]");
      } catch {
        plan = [];
      }

      // Save to calendar
      const db = await getDb();
      if (db && plan.length > 0) {
        const weekStart = new Date(input.weekStartDate);
        const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        for (const item of plan) {
          const dayIndex = dayNames.indexOf(item.day);
          if (dayIndex >= 0) {
            const date = new Date(weekStart);
            date.setDate(weekStart.getDate() + dayIndex);
            await db.insert(contentCalendar).values({
              workspaceId: 1,
              title: item.title,
              description: item.description,
              platform: item.platform || "all",
              contentType: item.contentType || "product",
              scheduledDate: date,
              status: "planned",
              color: item.contentType === "promotional" ? "#ef4444" :
                     item.contentType === "educational" ? "#10b981" :
                     item.contentType === "product" ? "#2563eb" : "#8b5cf6",
            }).catch(() => {});
          }
        }
      }

      return { plan, saved: plan.length > 0 };
    }),

  // Publish post to Facebook/Instagram via Meta API
  publishPost: protectedProcedure
    .input(z.object({ postId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const post = await db.select().from(contentPosts)
        .where(and(eq(contentPosts.id, input.postId), eq(contentPosts.userId, ctx.user.id)))
        .limit(1);
      if (!post.length) throw new Error("Post not found");

      const metaIntegration = await db.select().from(integrations)
        .where(and(eq(integrations.userId, ctx.user.id), eq(integrations.type, "facebook")))
        .limit(1);

      if (!metaIntegration.length || !metaIntegration[0].metaAccessToken || !metaIntegration[0].metaPageId) {
        throw new Error("Facebook not connected. Please connect your Facebook page first.");
      }

      const { metaAccessToken, metaPageId } = metaIntegration[0];
      const { caption, hashtags, imageUrl } = post[0];
      const message = `${caption || ""}\n\n${hashtags || ""}`.trim();

      let publishRes: any;
      if (imageUrl) {
        // Post with image
        const body = new URLSearchParams({ url: imageUrl, caption: message, access_token: metaAccessToken });
        const res = await fetch(`https://graph.facebook.com/${metaPageId}/photos`, {
          method: "POST",
          body,
        });
        publishRes = await res.json();
      } else {
        // Text-only post
        const body = new URLSearchParams({ message, access_token: metaAccessToken });
        const res = await fetch(`https://graph.facebook.com/${metaPageId}/feed`, {
          method: "POST",
          body,
        });
        publishRes = await res.json();
      }

      if (publishRes.error) {
        await db.update(contentPosts).set({ status: "failed" }).where(eq(contentPosts.id, input.postId));
        throw new Error(`Facebook API error: ${publishRes.error.message}`);
      }

      await db.update(contentPosts)
        .set({ status: "published", publishedAt: new Date() })
        .where(eq(contentPosts.id, input.postId));

      return { success: true, facebookPostId: publishRes.id };
    }),

  // Get brand voices
  getBrandVoices: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    return db.select().from(brandVoices).where(eq(brandVoices.workspaceId, 1));
  }),

  // Save brand voice
  saveBrandVoice: protectedProcedure
    .input(z.object({
      name: z.string(),
      tone: z.string(),
      audience: z.string(),
      keyMessages: z.array(z.string()),
      avoidWords: z.array(z.string()),
      isDefault: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.insert(brandVoices).values({
        workspaceId: 1,
        name: input.name,
        tone: input.tone,
        audience: input.audience,
        keyMessages: input.keyMessages,
        avoidWords: input.avoidWords,
        isDefault: input.isDefault,
      });
      return { success: true };
    }),
});
