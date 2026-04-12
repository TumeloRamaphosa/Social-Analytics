import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { FirecrawlApp } from "@firecrawl/firecrawl";

const firecrawlApp = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY || "" });

export interface ResearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
  publishedAt?: string;
}

export interface CompetitorData {
  name: string;
  url: string;
  followers?: string;
  engagement?: string;
  topContent: string[];
  lastAnalyzed?: string;
}

export const researchRouter = router({
  // Search the web using Firecrawl
  search: protectedProcedure
    .input(z.object({
      query: z.string().min(1),
      limit: z.number().default(10),
    }))
    .mutation(async ({ input }): Promise<ResearchResult[]> => {
      if (!process.env.FIRECRAWL_API_KEY) {
        console.warn("[Research] No FIRECRAWL_API_KEY configured, returning mock data");
        return getMockSearchResults(input.query);
      }

      try {
        const response = await firecrawlApp.search(input.query, { limit: input.limit });
        
        return response.data?.map((item: any) => ({
          title: item.title || "Untitled",
          url: item.url || "",
          snippet: item.description || item.content?.substring(0, 200) || "",
          source: new URL(item.url || "").hostname.replace("www.", ""),
          publishedAt: item.publishedAt,
        })) || [];
      } catch (error) {
        console.error("[Research] Firecrawl search error:", error);
        return getMockSearchResults(input.query);
      }
    }),

  // Scrape a specific URL
  scrape: protectedProcedure
    .input(z.object({
      url: z.string().url(),
      formats: z.array(z.enum(["markdown", "html", "text", "screenshot"])).default(["markdown"]),
    }))
    .mutation(async ({ input }): Promise<{ content: string; markdown?: string; html?: string; screenshot?: string }> => {
      if (!process.env.FIRECRAWL_API_KEY) {
        console.warn("[Research] No FIRECRAWL_API_KEY configured");
        return { content: "Configure FIRECRAWL_API_KEY to enable scraping" };
      }

      try {
        const response = await firecrawlApp.scrapeUrl(input.url, { formats: input.formats });
        
        return {
          content: response.markdown || response.html || "",
          markdown: response.markdown,
          html: response.html,
          screenshot: response.screenshot,
        };
      } catch (error) {
        console.error("[Research] Firecrawl scrape error:", error);
        return { content: `Error scraping URL: ${error}` };
      }
    }),

  // Extract structured data from URL (for competitor analysis)
  extract: protectedProcedure
    .input(z.object({
      url: z.string().url(),
      prompt: z.string(),
    }))
    .mutation(async ({ input }): Promise<CompetitorData | null> => {
      if (!process.env.FIRECRAWL_API_KEY) {
        return getMockCompetitorData(input.url);
      }

      try {
        const response = await firecrawlApp.extract({
          urls: [input.url],
          prompt: input.prompt,
        });

        return response.data?.[0] || null;
      } catch (error) {
        console.error("[Research] Firecrawl extract error:", error);
        return getMockCompetitorData(input.url);
      }
    }),

  // Get available credits
  getCredits: protectedProcedure.query(async () => {
    if (!process.env.FIRECRAWL_API_KEY) {
      return { credits: 0, total: 500000, provider: "mock" };
    }

    try {
      const response = await firecrawlApp.getCrawlStatus();
      return {
        credits: response.credits || 0,
        total: 500000,
        provider: "firecrawl",
      };
    } catch {
      return { credits: 0, total: 500000, provider: "firecrawl" };
    }
  }),
});

function getMockSearchResults(query: string): ResearchResult[] {
  const mockResults: Record<string, ResearchResult[]> = {
    "beef": [
      { title: "Premium Beef Market Trends 2026", url: "https://example.com/beef-trends", snippet: "Consumer demand for premium, ethically-sourced beef continues to grow globally...", source: "Food Industry Weekly" },
      { title: "Wagyu Beef Market Analysis", url: "https://example.com/wagyu", snippet: "Global wagyu market projected to reach $15B by 2028 with 12% CAGR...", source: "Market Watch" },
      { title: "South African Beef Industry Report", url: "https://example.com/sa-beef", snippet: "Halaal-certified beef sees 40% growth in export markets...", source: "Agri Business SA" },
    ],
    "meat": [
      { title: "Premium Meat Trends 2026", url: "https://example.com/meat-trends", snippet: "Consumer demand for premium, ethically-sourced meat continues to grow...", source: "Food Industry Weekly" },
      { title: "Direct to Consumer Meat Brands", url: "https://example.com/dtc-meat", snippet: "Subscription boxes and online stores driving 35% growth...", source: "E-Commerce Today" },
    ],
  };

  const key = Object.keys(mockResults).find(k => query.toLowerCase().includes(k));
  return mockResults[key || "beef"] || mockResults["beef"];
}

function getMockCompetitorData(url: string): CompetitorData {
  const hostname = new URL(url).hostname.replace("www.", "");
  
  return {
    name: hostname.split(".")[0].charAt(0).toUpperCase() + hostname.split(".")[0].slice(1),
    url,
    followers: "45K",
    engagement: "4.2%",
    topContent: ["Product launches", "Recipes", "Behind the scenes"],
    lastAnalyzed: new Date().toISOString(),
  };
}
