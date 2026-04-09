import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, boolean, float, bigint } from "drizzle-orm/mysql-core";

// ─── USERS ───────────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── WORKSPACES (Multi-tenant SaaS) ──────────────────────────────────────────
export const workspaces = mysqlTable("workspaces", {
  id: int("id").autoincrement().primaryKey(),
  ownerId: int("ownerId").notNull(),
  name: varchar("name", { length: 256 }).notNull(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  plan: mysqlEnum("plan", ["starter", "pro", "agency"]).default("starter").notNull(),
  logoUrl: varchar("logoUrl", { length: 2048 }),
  brandColor: varchar("brandColor", { length: 16 }).default("#2563eb"),
  isWhiteLabel: boolean("isWhiteLabel").default(false),
  planExpiresAt: timestamp("planExpiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Workspace = typeof workspaces.$inferSelect;
export type InsertWorkspace = typeof workspaces.$inferInsert;

// ─── WORKSPACE MEMBERS ───────────────────────────────────────────────────────
export const workspaceMembers = mysqlTable("workspaceMembers", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  userId: int("userId").notNull(),
  role: mysqlEnum("role", ["owner", "admin", "member", "viewer"]).default("member").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── INTEGRATIONS (Shopify, Google Ads, Facebook, etc.) ──────────────────────
export const integrations = mysqlTable("integrations", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["shopify", "google_ads", "facebook", "instagram", "whatsapp", "google_drive"]).notNull(),
  status: mysqlEnum("status", ["active", "expired", "error", "disconnected"]).default("active").notNull(),
  // Shopify fields
  shopifyDomain: varchar("shopifyDomain", { length: 256 }),
  shopifyAccessToken: varchar("shopifyAccessToken", { length: 512 }),
  // Google Ads fields
  googleAdsCustomerId: varchar("googleAdsCustomerId", { length: 64 }),
  googleRefreshToken: text("googleRefreshToken"),
  googleAccessToken: text("googleAccessToken"),
  googleTokenExpiresAt: timestamp("googleTokenExpiresAt"),
  // Facebook / Meta fields
  metaAccessToken: text("metaAccessToken"),
  metaPageId: varchar("metaPageId", { length: 64 }),
  metaBusinessId: varchar("metaBusinessId", { length: 64 }),
  metaAdAccountId: varchar("metaAdAccountId", { length: 64 }),
  metaInstagramId: varchar("metaInstagramId", { length: 64 }),
  // WhatsApp
  whatsappPhoneNumberId: varchar("whatsappPhoneNumberId", { length: 64 }),
  whatsappAccessToken: text("whatsappAccessToken"),
  // Google Drive
  googleDriveFolderId: varchar("googleDriveFolderId", { length: 128 }),
  // Generic metadata
  metadata: json("metadata"),
  lastSyncedAt: timestamp("lastSyncedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Integration = typeof integrations.$inferSelect;
export type InsertIntegration = typeof integrations.$inferInsert;

// ─── SHOPIFY SYNC DATA ────────────────────────────────────────────────────────
export const shopifyOrders = mysqlTable("shopifyOrders", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  shopifyOrderId: varchar("shopifyOrderId", { length: 64 }).notNull(),
  totalPrice: float("totalPrice"),
  currency: varchar("currency", { length: 8 }),
  financialStatus: varchar("financialStatus", { length: 64 }),
  fulfillmentStatus: varchar("fulfillmentStatus", { length: 64 }),
  customerId: varchar("customerId", { length: 64 }),
  lineItems: json("lineItems"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  shopifyCreatedAt: timestamp("shopifyCreatedAt"),
});

export const shopifyProducts = mysqlTable("shopifyProducts", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  shopifyProductId: varchar("shopifyProductId", { length: 64 }).notNull(),
  title: varchar("title", { length: 512 }),
  description: text("description"),
  productType: varchar("productType", { length: 256 }),
  tags: json("tags"),
  variants: json("variants"),
  images: json("images"),
  status: varchar("status", { length: 32 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── GOOGLE ADS SYNC DATA ─────────────────────────────────────────────────────
export const googleAdsCampaigns = mysqlTable("googleAdsCampaigns", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  campaignId: varchar("campaignId", { length: 64 }).notNull(),
  campaignName: varchar("campaignName", { length: 512 }),
  status: varchar("status", { length: 32 }),
  budget: float("budget"),
  impressions: int("impressions"),
  clicks: int("clicks"),
  cost: float("cost"),
  conversions: float("conversions"),
  ctr: float("ctr"),
  cpc: float("cpc"),
  roas: float("roas"),
  date: timestamp("date"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── CONTENT MANAGEMENT ───────────────────────────────────────────────────────
export const contentPosts = mysqlTable("contentPosts", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 512 }),
  caption: text("caption"),
  hashtags: text("hashtags"),
  imageUrl: varchar("imageUrl", { length: 2048 }),
  imagePrompt: text("imagePrompt"),
  platform: mysqlEnum("platform", ["facebook", "instagram", "whatsapp", "all"]).default("all").notNull(),
  status: mysqlEnum("status", ["draft", "scheduled", "published", "failed"]).default("draft").notNull(),
  scheduledAt: timestamp("scheduledAt"),
  publishedAt: timestamp("publishedAt"),
  // Performance metrics (filled after publishing)
  likes: int("likes").default(0),
  comments: int("comments").default(0),
  shares: int("shares").default(0),
  reach: int("reach").default(0),
  impressions: int("impressions").default(0),
  engagementRate: float("engagementRate"),
  // AI generation metadata
  aiGenerated: boolean("aiGenerated").default(false),
  aiModel: varchar("aiModel", { length: 64 }),
  contentBrief: text("contentBrief"),
  brandVoice: text("brandVoice"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ContentPost = typeof contentPosts.$inferSelect;
export type InsertContentPost = typeof contentPosts.$inferInsert;

// ─── CONTENT CALENDAR ─────────────────────────────────────────────────────────
export const contentCalendar = mysqlTable("contentCalendar", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  postId: int("postId"),
  title: varchar("title", { length: 512 }).notNull(),
  description: text("description"),
  platform: mysqlEnum("platform", ["facebook", "instagram", "whatsapp", "all"]).default("all").notNull(),
  contentType: mysqlEnum("contentType", ["product", "educational", "promotional", "ugc", "behind_scenes", "testimonial"]).default("product").notNull(),
  scheduledDate: timestamp("scheduledDate").notNull(),
  status: mysqlEnum("status", ["planned", "draft", "ready", "published"]).default("planned").notNull(),
  color: varchar("color", { length: 16 }).default("#2563eb"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CalendarEntry = typeof contentCalendar.$inferSelect;

// ─── BRAND VOICE LIBRARY ──────────────────────────────────────────────────────
export const brandVoices = mysqlTable("brandVoices", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  name: varchar("name", { length: 256 }).notNull(),
  tone: varchar("tone", { length: 256 }),
  audience: text("audience"),
  keyMessages: json("keyMessages"),
  avoidWords: json("avoidWords"),
  examplePosts: json("examplePosts"),
  isDefault: boolean("isDefault").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── AD PERFORMANCE REPORTS ───────────────────────────────────────────────────
export const adReports = mysqlTable("adReports", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  reportType: mysqlEnum("reportType", ["weekly", "monthly", "custom", "spend_optimisation"]).default("weekly").notNull(),
  platform: mysqlEnum("platform", ["facebook", "instagram", "google_ads", "shopify", "all"]).default("all").notNull(),
  dateFrom: timestamp("dateFrom").notNull(),
  dateTo: timestamp("dateTo").notNull(),
  totalSpend: float("totalSpend"),
  totalRevenue: float("totalRevenue"),
  roas: float("roas"),
  impressions: int("impressions"),
  clicks: int("clicks"),
  conversions: int("conversions"),
  reportData: json("reportData"),
  aiInsights: text("aiInsights"),
  recommendations: json("recommendations"),
  reportMarkdown: text("reportMarkdown"),
  reportPdfUrl: varchar("reportPdfUrl", { length: 2048 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AdReport = typeof adReports.$inferSelect;

// ─── BUSINESS ANALYSIS (existing) ────────────────────────────────────────────
export const analyses = mysqlTable("analyses", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  workspaceId: int("workspaceId"),
  url: varchar("url", { length: 2048 }).notNull(),
  domain: varchar("domain", { length: 512 }).notNull(),
  companyName: varchar("companyName", { length: 512 }),
  status: mysqlEnum("status", ["pending", "running", "completed", "failed"]).default("pending").notNull(),
  whoisData: json("whoisData"),
  dnsRecords: json("dnsRecords"),
  registrationDetails: json("registrationDetails"),
  seoData: json("seoData"),
  performanceScore: int("performanceScore"),
  seoScore: int("seoScore"),
  socialProfiles: json("socialProfiles"),
  totalSocialFollowers: int("totalSocialFollowers"),
  techStack: json("techStack"),
  competitiveData: json("competitiveData"),
  aiSummary: text("aiSummary"),
  industryCategory: varchar("industryCategory", { length: 256 }),
  reportMarkdown: text("reportMarkdown"),
  reportPdfUrl: varchar("reportPdfUrl", { length: 2048 }),
  googleDriveUrl: varchar("googleDriveUrl", { length: 2048 }),
  cachedAt: timestamp("cachedAt"),
  isCached: boolean("isCached").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Analysis = typeof analyses.$inferSelect;
export type InsertAnalysis = typeof analyses.$inferInsert;

// ─── ANALYSIS CACHE ───────────────────────────────────────────────────────────
export const analysisCache = mysqlTable("analysisCache", {
  id: int("id").autoincrement().primaryKey(),
  domain: varchar("domain", { length: 512 }).notNull().unique(),
  rawHtml: text("rawHtml"),
  headers: json("headers"),
  technologies: json("technologies"),
  metaTags: json("metaTags"),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AnalysisCache = typeof analysisCache.$inferSelect;

// ─── RAG INDEX ────────────────────────────────────────────────────────────────
export const ragIndex = mysqlTable("ragIndex", {
  id: int("id").autoincrement().primaryKey(),
  analysisId: int("analysisId"),           // nullable — not all chunks come from analyses
  domain: varchar("domain", { length: 512 }),
  chunkType: varchar("chunkType", { length: 64 }).notNull(),
  content: text("content").notNull(),
  embedding: json("embedding"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RagIndex = typeof ragIndex.$inferSelect;

// ─── KNOWLEDGE DOCUMENTS ─────────────────────────────────────────────────────
export const knowledgeDocs = mysqlTable("knowledgeDocs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 512 }).notNull(),
  source: varchar("source", { length: 256 }).default("manual"),
  docType: mysqlEnum("docType", ["research", "transcript", "report", "notes", "strategy", "client"]).default("notes").notNull(),
  content: text("content").notNull(),
  tags: json("tags"),
  chunkCount: int("chunkCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type KnowledgeDoc = typeof knowledgeDocs.$inferSelect;
export type InsertKnowledgeDoc = typeof knowledgeDocs.$inferInsert;
