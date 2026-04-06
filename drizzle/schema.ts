import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, boolean, float } from "drizzle-orm/mysql-core";

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

// Business Analysis table — stores full analysis results per URL
export const analyses = mysqlTable("analyses", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  url: varchar("url", { length: 2048 }).notNull(),
  domain: varchar("domain", { length: 512 }).notNull(),
  companyName: varchar("companyName", { length: 512 }),
  status: mysqlEnum("status", ["pending", "running", "completed", "failed"]).default("pending").notNull(),

  // Domain & WHOIS
  whoisData: json("whoisData"),
  dnsRecords: json("dnsRecords"),
  registrationDetails: json("registrationDetails"),

  // SEO & Performance
  seoData: json("seoData"),
  performanceScore: int("performanceScore"),
  seoScore: int("seoScore"),

  // Social Media
  socialProfiles: json("socialProfiles"),
  totalSocialFollowers: int("totalSocialFollowers"),

  // Tech Stack
  techStack: json("techStack"),

  // Competitive Analysis
  competitiveData: json("competitiveData"),

  // Summary
  aiSummary: text("aiSummary"),
  industryCategory: varchar("industryCategory", { length: 256 }),

  // Report
  reportMarkdown: text("reportMarkdown"),
  reportPdfUrl: varchar("reportPdfUrl", { length: 2048 }),
  googleDriveUrl: varchar("googleDriveUrl", { length: 2048 }),

  // Cache control
  cachedAt: timestamp("cachedAt"),
  isCached: boolean("isCached").default(false),

  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Analysis = typeof analyses.$inferSelect;
export type InsertAnalysis = typeof analyses.$inferInsert;

// Analysis cache — stores raw scraped data per domain for fast re-analysis
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

// RAG index — stores vectorized analysis chunks for semantic search
export const ragIndex = mysqlTable("ragIndex", {
  id: int("id").autoincrement().primaryKey(),
  analysisId: int("analysisId").notNull(),
  domain: varchar("domain", { length: 512 }).notNull(),
  chunkType: varchar("chunkType", { length: 64 }).notNull(), // 'seo', 'social', 'tech', 'competitive', 'summary'
  content: text("content").notNull(),
  embedding: json("embedding"), // stored as array of floats
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RagIndex = typeof ragIndex.$inferSelect;
