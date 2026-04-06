import axios from "axios";
import * as cheerio from "cheerio";
import { invokeLLM } from "./_core/llm";

export interface DomainInfo {
  domain: string;
  registrar?: string;
  createdDate?: string;
  expiresDate?: string;
  updatedDate?: string;
  nameservers?: string[];
  status?: string[];
  country?: string;
  ipAddress?: string;
  dnsRecords?: { type: string; value: string }[];
}

export interface SeoData {
  title?: string;
  description?: string;
  keywords?: string[];
  h1Tags?: string[];
  h2Tags?: string[];
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  robotsMeta?: string;
  schemaTypes?: string[];
  internalLinks?: number;
  externalLinks?: number;
  imageCount?: number;
  imagesWithAlt?: number;
  wordCount?: number;
  loadTimeMs?: number;
  statusCode?: number;
  httpsEnabled?: boolean;
  seoScore?: number;
  performanceScore?: number;
  issues?: string[];
}

export interface SocialProfile {
  platform: string;
  url?: string;
  handle?: string;
  followers?: number;
  detected: boolean;
}

export interface TechStack {
  cms?: string;
  frameworks?: string[];
  hosting?: string;
  cdn?: string;
  analytics?: string[];
  marketing?: string[];
  ecommerce?: string;
  security?: string[];
  fonts?: string[];
  libraries?: string[];
}

// ─── Fetch page with timing ───────────────────────────────────────────────────
export async function fetchPage(url: string): Promise<{ html: string; headers: Record<string, string>; statusCode: number; loadTimeMs: number }> {
  const start = Date.now();
  try {
    const response = await axios.get(url, {
      timeout: 15000,
      maxRedirects: 5,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; NexusBot/1.0; +https://nexussocial.app)",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
    });
    return {
      html: response.data as string,
      headers: response.headers as Record<string, string>,
      statusCode: response.status,
      loadTimeMs: Date.now() - start,
    };
  } catch (err: any) {
    return {
      html: "",
      headers: {},
      statusCode: err?.response?.status || 0,
      loadTimeMs: Date.now() - start,
    };
  }
}

// ─── Extract domain from URL ──────────────────────────────────────────────────
export function extractDomain(url: string): string {
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return url.replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0];
  }
}

// ─── WHOIS lookup via public API ──────────────────────────────────────────────
export async function lookupWhois(domain: string): Promise<DomainInfo> {
  try {
    const response = await axios.get(`https://api.whoisfreaks.com/v1.0/whois?apiKey=free&whois=live&domainName=${domain}`, { timeout: 8000 });
    const data = response.data;
    return {
      domain,
      registrar: data?.registrar_name,
      createdDate: data?.create_date,
      expiresDate: data?.expiry_date,
      updatedDate: data?.update_date,
      nameservers: data?.name_servers,
      status: Array.isArray(data?.domain_status) ? data.domain_status : [data?.domain_status].filter(Boolean),
      country: data?.registrant_info?.country,
    };
  } catch {
    // Fallback: use a different free WHOIS API
    try {
      const r2 = await axios.get(`https://whois.freeaiapi.xyz/?name=${domain}`, { timeout: 8000 });
      return { domain, registrar: r2.data?.registrar, createdDate: r2.data?.created };
    } catch {
      return { domain };
    }
  }
}

// ─── DNS lookup via public API ────────────────────────────────────────────────
export async function lookupDns(domain: string): Promise<{ type: string; value: string }[]> {
  try {
    const [aRes, mxRes, txtRes] = await Promise.allSettled([
      axios.get(`https://dns.google/resolve?name=${domain}&type=A`, { timeout: 5000 }),
      axios.get(`https://dns.google/resolve?name=${domain}&type=MX`, { timeout: 5000 }),
      axios.get(`https://dns.google/resolve?name=${domain}&type=TXT`, { timeout: 5000 }),
    ]);
    const records: { type: string; value: string }[] = [];
    if (aRes.status === "fulfilled") {
      (aRes.value.data?.Answer || []).forEach((r: any) => records.push({ type: "A", value: r.data }));
    }
    if (mxRes.status === "fulfilled") {
      (mxRes.value.data?.Answer || []).forEach((r: any) => records.push({ type: "MX", value: r.data }));
    }
    if (txtRes.status === "fulfilled") {
      (txtRes.value.data?.Answer || []).forEach((r: any) => records.push({ type: "TXT", value: r.data }));
    }
    return records;
  } catch {
    return [];
  }
}

// ─── SEO Analysis ─────────────────────────────────────────────────────────────
export function analyzeSeo(html: string, url: string, loadTimeMs: number, statusCode: number): SeoData {
  const $ = cheerio.load(html);
  const issues: string[] = [];

  const title = $("title").first().text().trim();
  const description = $('meta[name="description"]').attr("content") || "";
  const keywords = ($('meta[name="keywords"]').attr("content") || "").split(",").map(k => k.trim()).filter(Boolean);
  const h1Tags = $("h1").map((_, el) => $(el).text().trim()).get().slice(0, 5);
  const h2Tags = $("h2").map((_, el) => $(el).text().trim()).get().slice(0, 10);
  const canonicalUrl = $('link[rel="canonical"]').attr("href") || "";
  const ogTitle = $('meta[property="og:title"]').attr("content") || "";
  const ogDescription = $('meta[property="og:description"]').attr("content") || "";
  const ogImage = $('meta[property="og:image"]').attr("content") || "";
  const robotsMeta = $('meta[name="robots"]').attr("content") || "";

  const schemaTypes: string[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const data = JSON.parse($(el).html() || "{}");
      if (data["@type"]) schemaTypes.push(data["@type"]);
    } catch {}
  });

  const allLinks = $("a[href]");
  let internalLinks = 0, externalLinks = 0;
  allLinks.each((_, el) => {
    const href = $(el).attr("href") || "";
    if (href.startsWith("http") && !href.includes(extractDomain(url))) externalLinks++;
    else if (href.startsWith("/") || href.includes(extractDomain(url))) internalLinks++;
  });

  const images = $("img");
  const imageCount = images.length;
  const imagesWithAlt = images.filter((_, el) => !!$(el).attr("alt")).length;
  const wordCount = $("body").text().replace(/\s+/g, " ").trim().split(" ").length;
  const httpsEnabled = url.startsWith("https");

  // Score calculation
  let seoScore = 100;
  if (!title) { issues.push("Missing page title"); seoScore -= 15; }
  else if (title.length < 30 || title.length > 60) { issues.push("Title length not optimal (30-60 chars)"); seoScore -= 5; }
  if (!description) { issues.push("Missing meta description"); seoScore -= 10; }
  else if (description.length < 120 || description.length > 160) { issues.push("Meta description length not optimal (120-160 chars)"); seoScore -= 5; }
  if (h1Tags.length === 0) { issues.push("No H1 tag found"); seoScore -= 10; }
  if (h1Tags.length > 1) { issues.push("Multiple H1 tags found"); seoScore -= 5; }
  if (!canonicalUrl) { issues.push("No canonical URL set"); seoScore -= 5; }
  if (!httpsEnabled) { issues.push("Site not using HTTPS"); seoScore -= 15; }
  if (imageCount > 0 && imagesWithAlt < imageCount * 0.8) { issues.push("Many images missing alt text"); seoScore -= 5; }
  if (schemaTypes.length === 0) { issues.push("No structured data (Schema.org) found"); seoScore -= 5; }
  if (ogTitle === "") { issues.push("Missing Open Graph title"); seoScore -= 3; }
  if (ogImage === "") { issues.push("Missing Open Graph image"); seoScore -= 3; }

  // Performance score
  let performanceScore = 100;
  if (loadTimeMs > 3000) { performanceScore -= 30; }
  else if (loadTimeMs > 2000) { performanceScore -= 15; }
  else if (loadTimeMs > 1000) { performanceScore -= 5; }
  if (statusCode >= 400) performanceScore -= 50;

  return {
    title, description, keywords, h1Tags, h2Tags, canonicalUrl,
    ogTitle, ogDescription, ogImage, robotsMeta, schemaTypes,
    internalLinks, externalLinks, imageCount, imagesWithAlt,
    wordCount, loadTimeMs, statusCode, httpsEnabled,
    seoScore: Math.max(0, seoScore),
    performanceScore: Math.max(0, performanceScore),
    issues,
  };
}

// ─── Social Media Detection ───────────────────────────────────────────────────
export function detectSocialProfiles(html: string, domain: string): SocialProfile[] {
  const $ = cheerio.load(html);
  const pageText = html.toLowerCase();
  const allLinks = $("a[href]").map((_, el) => $(el).attr("href") || "").get();

  const platforms = [
    { platform: "Facebook", patterns: ["facebook.com/", "fb.com/"] },
    { platform: "Instagram", patterns: ["instagram.com/"] },
    { platform: "LinkedIn", patterns: ["linkedin.com/company/", "linkedin.com/in/"] },
    { platform: "Twitter", patterns: ["twitter.com/", "x.com/"] },
    { platform: "TikTok", patterns: ["tiktok.com/@"] },
    { platform: "YouTube", patterns: ["youtube.com/channel/", "youtube.com/@", "youtube.com/c/"] },
    { platform: "Pinterest", patterns: ["pinterest.com/"] },
    { platform: "WhatsApp", patterns: ["wa.me/", "whatsapp.com/"] },
  ];

  return platforms.map(({ platform, patterns }) => {
    const found = allLinks.find(link => patterns.some(p => link.includes(p)));
    return {
      platform,
      url: found || undefined,
      handle: found ? found.split("/").filter(Boolean).pop() : undefined,
      detected: !!found || patterns.some(p => pageText.includes(p)),
    };
  });
}

// ─── Technology Stack Detection ───────────────────────────────────────────────
export function detectTechStack(html: string, headers: Record<string, string>): TechStack {
  const $ = cheerio.load(html);
  const pageText = html.toLowerCase();
  const scripts = $("script[src]").map((_, el) => $(el).attr("src") || "").get().join(" ").toLowerCase();
  const allHtml = html.toLowerCase();

  const stack: TechStack = {
    frameworks: [],
    analytics: [],
    marketing: [],
    security: [],
    fonts: [],
    libraries: [],
  };

  // CMS
  if (allHtml.includes("wp-content") || allHtml.includes("wp-includes")) stack.cms = "WordPress";
  else if (allHtml.includes("shopify")) stack.cms = "Shopify";
  else if (allHtml.includes("squarespace")) stack.cms = "Squarespace";
  else if (allHtml.includes("wix.com") || allHtml.includes("wixsite")) stack.cms = "Wix";
  else if (allHtml.includes("webflow")) stack.cms = "Webflow";
  else if (allHtml.includes("ghost")) stack.cms = "Ghost";
  else if (allHtml.includes("drupal")) stack.cms = "Drupal";
  else if (allHtml.includes("joomla")) stack.cms = "Joomla";

  // Frameworks
  if (scripts.includes("react") || allHtml.includes("__react")) stack.frameworks!.push("React");
  if (scripts.includes("vue") || allHtml.includes("__vue")) stack.frameworks!.push("Vue.js");
  if (scripts.includes("angular") || allHtml.includes("ng-version")) stack.frameworks!.push("Angular");
  if (scripts.includes("next") || allHtml.includes("__next")) stack.frameworks!.push("Next.js");
  if (scripts.includes("nuxt") || allHtml.includes("__nuxt")) stack.frameworks!.push("Nuxt.js");
  if (scripts.includes("svelte")) stack.frameworks!.push("Svelte");
  if (scripts.includes("jquery")) stack.libraries!.push("jQuery");
  if (scripts.includes("bootstrap")) stack.libraries!.push("Bootstrap");
  if (scripts.includes("tailwind")) stack.libraries!.push("Tailwind CSS");

  // Analytics
  if (allHtml.includes("google-analytics") || allHtml.includes("gtag") || allHtml.includes("ga.js")) stack.analytics!.push("Google Analytics");
  if (allHtml.includes("googletagmanager")) stack.analytics!.push("Google Tag Manager");
  if (allHtml.includes("hotjar")) stack.analytics!.push("Hotjar");
  if (allHtml.includes("mixpanel")) stack.analytics!.push("Mixpanel");
  if (allHtml.includes("segment.com")) stack.analytics!.push("Segment");
  if (allHtml.includes("clarity.ms")) stack.analytics!.push("Microsoft Clarity");
  if (allHtml.includes("facebook.net/en_US/fbevents")) stack.analytics!.push("Facebook Pixel");

  // Marketing
  if (allHtml.includes("hubspot")) stack.marketing!.push("HubSpot");
  if (allHtml.includes("mailchimp")) stack.marketing!.push("Mailchimp");
  if (allHtml.includes("klaviyo")) stack.marketing!.push("Klaviyo");
  if (allHtml.includes("intercom")) stack.marketing!.push("Intercom");
  if (allHtml.includes("drift.com")) stack.marketing!.push("Drift");
  if (allHtml.includes("crisp.chat")) stack.marketing!.push("Crisp");
  if (allHtml.includes("zendesk")) stack.marketing!.push("Zendesk");

  // CDN
  if (allHtml.includes("cloudflare") || headers["cf-ray"]) stack.cdn = "Cloudflare";
  else if (allHtml.includes("fastly")) stack.cdn = "Fastly";
  else if (allHtml.includes("amazonaws.com")) stack.cdn = "AWS CloudFront";
  else if (allHtml.includes("akamai")) stack.cdn = "Akamai";

  // Hosting
  const server = (headers["server"] || "").toLowerCase();
  if (server.includes("vercel") || allHtml.includes("vercel")) stack.hosting = "Vercel";
  else if (server.includes("netlify") || allHtml.includes("netlify")) stack.hosting = "Netlify";
  else if (allHtml.includes("heroku")) stack.hosting = "Heroku";
  else if (server.includes("apache")) stack.hosting = "Apache";
  else if (server.includes("nginx")) stack.hosting = "Nginx";
  else if (allHtml.includes("amazonaws.com")) stack.hosting = "AWS";
  else if (allHtml.includes("azure")) stack.hosting = "Microsoft Azure";
  else if (allHtml.includes("googlecloud") || allHtml.includes("gcp")) stack.hosting = "Google Cloud";

  // E-commerce
  if (allHtml.includes("shopify")) stack.ecommerce = "Shopify";
  else if (allHtml.includes("woocommerce")) stack.ecommerce = "WooCommerce";
  else if (allHtml.includes("magento")) stack.ecommerce = "Magento";
  else if (allHtml.includes("bigcommerce")) stack.ecommerce = "BigCommerce";

  // Security
  if (headers["strict-transport-security"]) stack.security!.push("HSTS");
  if (headers["content-security-policy"]) stack.security!.push("CSP");
  if (headers["x-frame-options"]) stack.security!.push("X-Frame-Options");
  if (allHtml.includes("recaptcha")) stack.security!.push("reCAPTCHA");

  // Fonts
  if (allHtml.includes("fonts.googleapis.com")) stack.fonts!.push("Google Fonts");
  if (allHtml.includes("typekit") || allHtml.includes("use.typekit")) stack.fonts!.push("Adobe Fonts");
  if (allHtml.includes("fonts.bunny.net")) stack.fonts!.push("Bunny Fonts");

  return stack;
}

// ─── AI Summary & Competitive Analysis ───────────────────────────────────────
export async function generateAiSummary(domain: string, seoData: SeoData, techStack: TechStack, socialProfiles: SocialProfile[]): Promise<{ summary: string; industry: string; competitive: any }> {
  const detectedSocials = socialProfiles.filter(s => s.detected).map(s => s.platform).join(", ");
  const techSummary = [
    techStack.cms ? `CMS: ${techStack.cms}` : "",
    techStack.frameworks?.length ? `Frameworks: ${techStack.frameworks.join(", ")}` : "",
    techStack.hosting ? `Hosting: ${techStack.hosting}` : "",
    techStack.analytics?.length ? `Analytics: ${techStack.analytics.join(", ")}` : "",
  ].filter(Boolean).join("; ");

  const prompt = `You are a business intelligence analyst. Analyze this website and provide structured insights.

Domain: ${domain}
Page Title: ${seoData.title || "Unknown"}
Description: ${seoData.description || "None"}
SEO Score: ${seoData.seoScore}/100
Performance Score: ${seoData.performanceScore}/100
Tech Stack: ${techSummary || "Unknown"}
Social Media Presence: ${detectedSocials || "None detected"}
Word Count: ${seoData.wordCount}
HTTPS: ${seoData.httpsEnabled ? "Yes" : "No"}

Respond in JSON format with these exact fields:
{
  "summary": "3-4 sentence business intelligence summary",
  "industry": "single industry category (e.g. E-commerce, SaaS, Healthcare, Finance, Media, etc.)",
  "marketPosition": "brief market positioning statement",
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2", "weakness3"],
  "opportunities": ["opportunity1", "opportunity2"],
  "benchmarkComparison": "how this site compares to industry average",
  "recommendedActions": ["action1", "action2", "action3"]
}`;

  try {
    const response = await invokeLLM({
      messages: [{ role: "user", content: prompt }],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "business_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              summary: { type: "string" },
              industry: { type: "string" },
              marketPosition: { type: "string" },
              strengths: { type: "array", items: { type: "string" } },
              weaknesses: { type: "array", items: { type: "string" } },
              opportunities: { type: "array", items: { type: "string" } },
              benchmarkComparison: { type: "string" },
              recommendedActions: { type: "array", items: { type: "string" } },
            },
            required: ["summary", "industry", "marketPosition", "strengths", "weaknesses", "opportunities", "benchmarkComparison", "recommendedActions"],
            additionalProperties: false,
          },
        },
      },
    });
    const content = response.choices[0].message.content as string;
    const parsed = JSON.parse(content);
    return {
      summary: parsed.summary,
      industry: parsed.industry,
      competitive: parsed,
    };
  } catch {
    return {
      summary: `Analysis of ${domain} completed. The site uses ${techStack.cms || "an unknown CMS"} and has an SEO score of ${seoData.seoScore}/100.`,
      industry: "General Business",
      competitive: {},
    };
  }
}

// ─── Generate Markdown Report ─────────────────────────────────────────────────
export function generateMarkdownReport(domain: string, whois: DomainInfo, seo: SeoData, social: SocialProfile[], tech: TechStack, aiResult: any, analysisDate: string): string {
  const socialTable = social.filter(s => s.detected).map(s => `| ${s.platform} | ${s.url || "Detected"} | ${s.followers?.toLocaleString() || "N/A"} |`).join("\n");

  return `# Business Intelligence Report: ${domain}
**Analysis Date:** ${analysisDate}
**Generated by:** Nexus Social Intelligence Platform

---

## Executive Summary
${aiResult.summary || "Analysis completed."}

**Industry:** ${aiResult.industry || "General Business"}
**Market Position:** ${aiResult.marketPosition || "N/A"}

---

## 1. Domain & Registration
| Field | Value |
|---|---|
| Domain | ${domain} |
| Registrar | ${whois.registrar || "N/A"} |
| Created | ${whois.createdDate || "N/A"} |
| Expires | ${whois.expiresDate || "N/A"} |
| Country | ${whois.country || "N/A"} |
| Nameservers | ${whois.nameservers?.join(", ") || "N/A"} |

---

## 2. SEO & Performance
| Metric | Score |
|---|---|
| SEO Score | ${seo.seoScore}/100 |
| Performance Score | ${seo.performanceScore}/100 |
| Page Load Time | ${seo.loadTimeMs}ms |
| HTTPS | ${seo.httpsEnabled ? "Yes" : "No"} |
| Word Count | ${seo.wordCount} |
| Internal Links | ${seo.internalLinks} |
| External Links | ${seo.externalLinks} |

**Page Title:** ${seo.title || "None"}
**Meta Description:** ${seo.description || "None"}
**H1 Tags:** ${seo.h1Tags?.join(", ") || "None"}
**Schema Types:** ${seo.schemaTypes?.join(", ") || "None"}

### SEO Issues
${seo.issues?.map(i => `- ${i}`).join("\n") || "No major issues found."}

---

## 3. Social Media Presence
| Platform | URL | Followers |
|---|---|---|
${socialTable || "| No social profiles detected | | |"}

---

## 4. Technology Stack
| Category | Technology |
|---|---|
| CMS | ${tech.cms || "Unknown"} |
| Frameworks | ${tech.frameworks?.join(", ") || "None detected"} |
| Hosting | ${tech.hosting || "Unknown"} |
| CDN | ${tech.cdn || "None detected"} |
| Analytics | ${tech.analytics?.join(", ") || "None detected"} |
| Marketing | ${tech.marketing?.join(", ") || "None detected"} |
| E-commerce | ${tech.ecommerce || "None"} |
| Security | ${tech.security?.join(", ") || "None detected"} |

---

## 5. Competitive Analysis
**Strengths:**
${aiResult.strengths?.map((s: string) => `- ${s}`).join("\n") || "- N/A"}

**Weaknesses:**
${aiResult.weaknesses?.map((s: string) => `- ${s}`).join("\n") || "- N/A"}

**Opportunities:**
${aiResult.opportunities?.map((s: string) => `- ${s}`).join("\n") || "- N/A"}

**Industry Benchmark:** ${aiResult.benchmarkComparison || "N/A"}

---

## 6. Recommended Actions
${aiResult.recommendedActions?.map((a: string, i: number) => `${i + 1}. ${a}`).join("\n") || "No recommendations available."}

---
*Report generated by Nexus Social Intelligence Platform*
`;
}
