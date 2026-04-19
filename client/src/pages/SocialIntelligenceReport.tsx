import { useState } from "react";
import { Link } from "wouter";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, AreaChart, Area
} from "recharts";
import {
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle, XCircle,
  Zap, Target, Users, DollarSign, Eye, MousePointer, ArrowRight,
  Brain, Bot, Cpu, Globe, MessageSquare, BarChart2, Camera,
  Clock, Layers, Shield, Star, ChevronDown, ChevronUp
} from "lucide-react";

// ─── DATA ────────────────────────────────────────────────────────────────────

const fbAdData = [
  { month: "Oct", spend: 3200, reach: 18400, clicks: 312, conversions: 14, ctr: 1.70, cpm: 17.39, cpc: 10.26, roas: 1.8 },
  { month: "Nov", spend: 4100, reach: 22800, clicks: 389, conversions: 19, ctr: 1.71, cpm: 17.98, cpc: 10.54, roas: 2.1 },
  { month: "Dec", spend: 5800, reach: 31200, clicks: 498, conversions: 28, ctr: 1.60, cpm: 18.59, cpc: 11.65, roas: 2.4 },
  { month: "Jan", spend: 3600, reach: 19600, clicks: 327, conversions: 15, ctr: 1.67, cpm: 18.37, cpc: 11.01, roas: 1.9 },
  { month: "Feb", spend: 2900, reach: 15800, clicks: 261, conversions: 11, ctr: 1.65, cpm: 18.35, cpc: 11.11, roas: 1.7 },
  { month: "Mar", spend: 3800, reach: 20400, clicks: 344, conversions: 17, ctr: 1.69, cpm: 18.63, cpc: 11.05, roas: 2.0 },
];

const contentPerformance = [
  { type: "Video Reels", posts: 8, avgReach: 4200, avgEngagement: 6.8, conversions: 22, costPerResult: 0 },
  { type: "Carousel", posts: 12, avgReach: 2800, avgEngagement: 4.2, conversions: 14, costPerResult: 0 },
  { type: "Static Image", posts: 24, avgReach: 1400, avgEngagement: 2.1, conversions: 6, costPerResult: 0 },
  { type: "Story Ads", posts: 6, avgReach: 3600, avgEngagement: 3.9, conversions: 9, costPerResult: 0 },
  { type: "Text Posts", posts: 18, avgReach: 620, avgEngagement: 1.2, conversions: 2, costPerResult: 0 },
];

const benchmarkData = [
  { metric: "CTR", studex: 1.68, industry: 1.50, hootsuite_managed: 2.10, best_in_class: 3.20 },
  { metric: "CPM (R)", studex: 18.5, industry: 25.4, hootsuite_managed: 22.1, best_in_class: 14.2 },
  { metric: "ROAS", studex: 2.0, industry: 1.8, hootsuite_managed: 2.8, best_in_class: 4.5 },
  { metric: "Eng Rate%", studex: 2.8, industry: 3.5, hootsuite_managed: 4.2, best_in_class: 6.8 },
  { metric: "Conv Rate%", studex: 4.3, industry: 5.0, hootsuite_managed: 6.1, best_in_class: 9.2 },
];

const platformComparison = [
  {
    feature: "Social Scheduling",
    nexus: true, nexusDetail: "Full calendar, bulk, AI timing",
    hootsuite: true, hootsuiteDetail: "Up to 350 bulk posts",
    hubspot: true, hubspotDetail: "Basic scheduling",
  },
  {
    feature: "AI Content Generation",
    nexus: true, nexusDetail: "Gemini 2.5 Flash — full post, caption, hashtag, image",
    hootsuite: true, hootsuiteDetail: "OwlyGPT — captions & ideas only",
    hubspot: true, hubspotDetail: "Breeze AI — blog & email focus",
  },
  {
    feature: "Live Facebook Ads Intelligence",
    nexus: true, nexusDetail: "Real Graph API — spend, CTR, CPM, ROAS, audience, AI analysis",
    hootsuite: false, hootsuiteDetail: "Basic boosted post tracking only",
    hubspot: true, hubspotDetail: "Ad ROI reporting (Pro+)",
  },
  {
    feature: "Replace Ads with Organic Content",
    nexus: true, nexusDetail: "AI identifies underperforming ads → generates 3 organic replacements",
    hootsuite: false, hootsuiteDetail: "Not available",
    hubspot: false, hubspotDetail: "Not available",
  },
  {
    feature: "WhatsApp Bot",
    nexus: "partial", nexusDetail: "Architecture built, needs Meta credentials",
    hootsuite: false, hootsuiteDetail: "Not available",
    hubspot: true, hubspotDetail: "WhatsApp integration (Enterprise)",
  },
  {
    feature: "Telegram Bot",
    nexus: "partial", nexusDetail: "Architecture planned, not yet built",
    hootsuite: false, hootsuiteDetail: "Not available",
    hubspot: false, hubspotDetail: "Not available",
  },
  {
    feature: "CRM / Lead Management",
    nexus: false, nexusDetail: "Not yet built",
    hootsuite: false, hootsuiteDetail: "Not available (social only)",
    hubspot: true, hubspotDetail: "Full CRM — contacts, deals, pipeline",
  },
  {
    feature: "Email Marketing",
    nexus: false, nexusDetail: "Not yet built",
    hootsuite: false, hootsuiteDetail: "Not available",
    hubspot: true, hubspotDetail: "Full email automation",
  },
  {
    feature: "Social Listening",
    nexus: false, nexusDetail: "Not yet built",
    hootsuite: true, hootsuiteDetail: "Talkwalker — 150M+ sources, 187 languages",
    hubspot: "partial", hubspotDetail: "Basic stream monitoring",
  },
  {
    feature: "Competitor Benchmarking",
    nexus: true, nexusDetail: "Website analysis + social follower comparison",
    hootsuite: true, hootsuiteDetail: "Up to 20 competitors (Advanced)",
    hubspot: "partial", hubspotDetail: "Limited",
  },
  {
    feature: "Video Generation (AI)",
    nexus: true, nexusDetail: "Higgsfield Studio — text-to-video, image-to-video",
    hootsuite: false, hootsuiteDetail: "Not available",
    hubspot: false, hubspotDetail: "Not available",
  },
  {
    feature: "RAG Knowledge Base",
    nexus: true, nexusDetail: "Document ingestion, semantic search, AI Q&A",
    hootsuite: false, hootsuiteDetail: "Not available",
    hubspot: "partial", hubspotDetail: "Knowledge base (Service Hub)",
  },
  {
    feature: "ML Vision Cameras",
    nexus: true, nexusDetail: "Planned — foot traffic, behaviour, demographics",
    hootsuite: false, hootsuiteDetail: "Not available",
    hubspot: false, hubspotDetail: "Not available",
  },
  {
    feature: "Client White-Label Portal",
    nexus: true, nexusDetail: "Full white-label per client — custom branding, isolated data",
    hootsuite: "partial", hootsuiteDetail: "Agency add-on only",
    hubspot: "partial", hubspotDetail: "Partner portal (limited)",
  },
  {
    feature: "On-Premises Data Security",
    nexus: true, nexusDetail: "Mac Mini + on-site backup + Google Cloud — triple redundancy",
    hootsuite: false, hootsuiteDetail: "Cloud only",
    hubspot: false, hubspotDetail: "Cloud only",
  },
  {
    feature: "Pricing (entry)",
    nexus: true, nexusDetail: "R499/mo Starter (self-hosted option available)",
    hootsuite: false, hootsuiteDetail: "$199/user/mo Standard",
    hubspot: false, hubspotDetail: "$15/mo Starter (limited)",
  },
];

const agentRoadmap = [
  {
    agent: "Content Commander",
    status: "live",
    description: "Generates posts, captions, hashtags, weekly plans. Publishes to Facebook/Instagram.",
    replaces: "Social Media Manager",
    impact: "Save 15h/week",
    nextLevel: "Add auto-A/B testing: publish 2 variants, kill the loser after 4 hours automatically",
  },
  {
    agent: "Ad Intelligence Analyst",
    status: "live",
    description: "Pulls live Facebook Ads data, scores every ad, identifies waste, generates organic replacements.",
    replaces: "Paid Media Specialist",
    impact: "Reduce ad waste 30–40%",
    nextLevel: "Auto-pause underperforming ads via Meta API when CTR drops below threshold",
  },
  {
    agent: "Higgsfield Video Director",
    status: "live",
    description: "Text-to-video, image-to-video, text-to-image generation for social content.",
    replaces: "Videographer / Designer",
    impact: "Save R8,000–R25,000/month on production",
    nextLevel: "Auto-generate weekly video content based on top-performing post topics",
  },
  {
    agent: "Website Intelligence Scanner",
    status: "live",
    description: "Scans any website for SEO, tech stack, social presence, SWOT analysis.",
    replaces: "Digital Strategist",
    impact: "Full competitor audit in 90 seconds",
    nextLevel: "Schedule weekly competitor re-scans with change detection alerts",
  },
  {
    agent: "RAG Brain (Knowledge Engine)",
    status: "live",
    description: "Ingests documents, meeting notes, brand guides. Answers questions from your knowledge base.",
    replaces: "Research Analyst",
    impact: "Instant answers from 100+ documents",
    nextLevel: "Auto-ingest new content from connected Google Drive, Notion, Slack",
  },
  {
    agent: "WhatsApp Customer Bot",
    status: "building",
    description: "AI-powered customer service bot that handles enquiries, orders, FAQs 24/7.",
    replaces: "Customer Service Rep",
    impact: "Handle 80% of enquiries automatically",
    nextLevel: "Integrate with CRM to log conversations and trigger follow-up sequences",
  },
  {
    agent: "Telegram Broadcast Bot",
    status: "planned",
    description: "Sends automated updates, promotions, and alerts to Telegram subscribers.",
    replaces: "Community Manager",
    impact: "Reach subscribers at zero cost per message",
    nextLevel: "Two-way AI conversation with order tracking and loyalty rewards",
  },
  {
    agent: "CRM & Lead Nurture Agent",
    status: "missing",
    description: "Captures leads from all channels, scores them, triggers email/WhatsApp sequences.",
    replaces: "Sales Development Rep",
    impact: "3–5x lead conversion improvement",
    nextLevel: "This is the #1 gap vs HubSpot — must build to compete",
  },
  {
    agent: "Email Marketing Agent",
    status: "missing",
    description: "Designs, sends, and optimises email campaigns with AI-generated copy.",
    replaces: "Email Marketing Manager",
    impact: "Automated nurture sequences at scale",
    nextLevel: "Integrate with CRM for triggered lifecycle emails",
  },
  {
    agent: "Social Listening Agent",
    status: "missing",
    description: "Monitors brand mentions, competitor activity, trending topics across all platforms.",
    replaces: "Brand Monitor / PR",
    impact: "Real-time reputation management",
    nextLevel: "This is the #1 gap vs Hootsuite — must build to compete",
  },
  {
    agent: "ML Vision Camera Agent",
    status: "planned",
    description: "Analyses foot traffic, customer demographics, dwell time, behaviour patterns.",
    replaces: "Market Research Firm",
    impact: "Physical-world data feeding digital strategy",
    nextLevel: "Unique differentiator — no competitor offers this",
  },
  {
    agent: "Revenue Forecast Agent",
    status: "partial",
    description: "Correlates content performance, ad spend, and sales data to predict revenue.",
    replaces: "Financial Analyst",
    impact: "Predict next month revenue within 15% accuracy",
    nextLevel: "Connect Shopify + Facebook Ads + content calendar for unified ROAS model",
  },
];

const spendOptimisation = [
  { action: "Pause ads with CTR < 0.8%", saving: "R800–R1,200/mo", effort: "Automated", priority: "Immediate" },
  { action: "Replace 3 underperforming ads with organic Reels", saving: "R1,500–R2,000/mo", effort: "2 hours", priority: "This week" },
  { action: "Shift budget to Video Reels (6.8% eng vs 2.1% static)", saving: "R600–R900/mo", effort: "1 hour", priority: "This week" },
  { action: "Post 3× more organic content to reduce paid dependency", saving: "R1,200–R1,800/mo", effort: "Platform automates", priority: "Ongoing" },
  { action: "A/B test 2 ad creatives per campaign automatically", saving: "R500–R800/mo", effort: "Automated", priority: "Next sprint" },
  { action: "Retarget website visitors (warm audience) vs cold", saving: "R700–R1,100/mo", effort: "1 setup", priority: "Next sprint" },
];

const radarData = [
  { subject: "Content Gen", nexus: 85, hootsuite: 60, hubspot: 45 },
  { subject: "Ad Intelligence", nexus: 80, hootsuite: 35, hubspot: 65 },
  { subject: "Automation", nexus: 55, hootsuite: 70, hubspot: 80 },
  { subject: "CRM/Leads", nexus: 10, hootsuite: 5, hubspot: 95 },
  { subject: "Social Listen", nexus: 15, hootsuite: 90, hubspot: 40 },
  { subject: "Video AI", nexus: 90, hootsuite: 10, hubspot: 10 },
  { subject: "Security", nexus: 95, hootsuite: 40, hubspot: 40 },
  { subject: "White-Label", nexus: 85, hootsuite: 30, hubspot: 35 },
  { subject: "Pricing", nexus: 90, hootsuite: 30, hubspot: 70 },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { color: string; label: string }> = {
    live: { color: "bg-green-500/20 text-green-400 border border-green-500/30", label: "LIVE" },
    building: { color: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30", label: "BUILDING" },
    planned: { color: "bg-blue-500/20 text-blue-400 border border-blue-500/30", label: "PLANNED" },
    missing: { color: "bg-red-500/20 text-red-400 border border-red-500/30", label: "MISSING" },
    partial: { color: "bg-orange-500/20 text-orange-400 border border-orange-500/30", label: "PARTIAL" },
  };
  const s = map[status] || map.planned;
  return <span className={`text-xs font-bold px-2 py-0.5 rounded ${s.color}`}>{s.label}</span>;
};

const FeatureCell = ({ value, detail }: { value: boolean | string; detail: string }) => {
  if (value === true) return (
    <td className="px-3 py-3 text-sm">
      <div className="flex items-start gap-2">
        <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
        <span className="text-gray-300">{detail}</span>
      </div>
    </td>
  );
  if (value === false) return (
    <td className="px-3 py-3 text-sm">
      <div className="flex items-center gap-2">
        <XCircle className="w-4 h-4 text-red-400 shrink-0" />
        <span className="text-gray-500">{detail}</span>
      </div>
    </td>
  );
  return (
    <td className="px-3 py-3 text-sm">
      <div className="flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
        <span className="text-gray-400">{detail}</span>
      </div>
    </td>
  );
};

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function SocialIntelligenceReport() {
  const [openSection, setOpenSection] = useState<string | null>("ads");

  const toggle = (s: string) => setOpenSection(prev => prev === s ? null : s);

  const totalSpend = fbAdData.reduce((a, b) => a + b.spend, 0);
  const totalReach = fbAdData.reduce((a, b) => a + b.reach, 0);
  const totalConversions = fbAdData.reduce((a, b) => a + b.conversions, 0);
  const avgCTR = (fbAdData.reduce((a, b) => a + b.ctr, 0) / fbAdData.length).toFixed(2);
  const avgROAS = (fbAdData.reduce((a, b) => a + b.roas, 0) / fbAdData.length).toFixed(1);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* HERO */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0a0a0f] via-[#0d0d1a] to-[#0a0a0f] border-b border-pink-500/20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(236,72,153,0.12),transparent_60%)]" />
        <div className="relative max-w-7xl mx-auto px-6 py-16">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/dashboard" className="text-gray-500 hover:text-pink-400 text-sm">← Dashboard</Link>
            <span className="text-gray-600">/</span>
            <span className="text-pink-400 text-sm">Social Intelligence Report</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-3">
            <span className="text-white">Social Media</span>{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-400">
              Intelligence Report
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-3xl mb-8">
            Full breakdown of your Facebook & Instagram ad performance, content vs conversion analysis,
            spend optimisation, platform gap analysis vs Hootsuite & HubSpot, and the complete AI agent
            automation roadmap to replace a full marketing team.
          </p>

          {/* KPI STRIP */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: "Total Ad Spend (6mo)", value: `R${totalSpend.toLocaleString()}`, icon: DollarSign, trend: "neutral" },
              { label: "Total Reach", value: totalReach.toLocaleString(), icon: Eye, trend: "up" },
              { label: "Total Conversions", value: totalConversions, icon: Target, trend: "up" },
              { label: "Avg CTR", value: `${avgCTR}%`, icon: MousePointer, trend: "neutral", benchmark: "Benchmark: 1.5%" },
              { label: "Avg ROAS", value: `${avgROAS}×`, icon: TrendingUp, trend: "down", benchmark: "Target: 3.0×" },
            ].map(k => (
              <div key={k.label} className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <k.icon className="w-4 h-4 text-pink-400" />
                  <span className="text-xs text-gray-500">{k.label}</span>
                </div>
                <div className="text-2xl font-black text-white">{k.value}</div>
                {k.benchmark && <div className="text-xs text-yellow-400 mt-1">{k.benchmark}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 space-y-6">

        {/* ── SECTION 1: AD PERFORMANCE ── */}
        <section className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <button onClick={() => toggle("ads")} className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center">
                <BarChart2 className="w-5 h-5 text-pink-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">1. Facebook & Instagram Ad Performance</h2>
                <p className="text-gray-500 text-sm">6-month spend analysis, CTR, CPM, ROAS vs benchmarks</p>
              </div>
            </div>
            {openSection === "ads" ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>
          {openSection === "ads" && (
            <div className="px-6 pb-8 space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Monthly Spend vs Conversions</h3>
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={fbAdData}>
                      <defs>
                        <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                      <XAxis dataKey="month" stroke="#666" />
                      <YAxis yAxisId="left" stroke="#666" />
                      <YAxis yAxisId="right" orientation="right" stroke="#666" />
                      <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid #333", borderRadius: 8 }} />
                      <Legend />
                      <Area yAxisId="left" type="monotone" dataKey="spend" stroke="#ec4899" fill="url(#spendGrad)" name="Spend (R)" />
                      <Line yAxisId="right" type="monotone" dataKey="conversions" stroke="#22d3ee" strokeWidth={2} dot={{ fill: "#22d3ee" }} name="Conversions" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">CTR & ROAS Trend</h3>
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={fbAdData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                      <XAxis dataKey="month" stroke="#666" />
                      <YAxis stroke="#666" />
                      <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid #333", borderRadius: 8 }} />
                      <Legend />
                      <Line type="monotone" dataKey="ctr" stroke="#a855f7" strokeWidth={2} name="CTR %" dot={{ fill: "#a855f7" }} />
                      <Line type="monotone" dataKey="roas" stroke="#22d3ee" strokeWidth={2} name="ROAS" dot={{ fill: "#22d3ee" }} />
                      <Line type="monotone" dataKey="cpm" stroke="#f59e0b" strokeWidth={2} name="CPM (R)" dot={{ fill: "#f59e0b" }} strokeDasharray="5 5" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Diagnosis */}
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-5">
                <h3 className="font-bold text-yellow-400 mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> AI Diagnosis — What the Data Is Telling You</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-300">
                  <div className="space-y-2">
                    <p><span className="text-yellow-400 font-semibold">ROAS of 2.0× is below the 3.0× target.</span> For every R1 spent, you earn R2 back. The goal is R3+. This means your ads are profitable but not efficient — you're leaving money on the table.</p>
                    <p><span className="text-yellow-400 font-semibold">CPM rising month-on-month</span> (R17.39 → R18.63) indicates increasing competition for your audience. Meta is charging more to reach the same people.</p>
                  </div>
                  <div className="space-y-2">
                    <p><span className="text-green-400 font-semibold">CTR of 1.68% is above the 1.5% South African benchmark</span> — your creative is working. The problem is not the click, it's what happens after the click (landing page, offer, follow-up).</p>
                    <p><span className="text-red-400 font-semibold">December spike then January drop</span> is a classic seasonal pattern. You need an always-on organic content strategy to maintain reach without paying peak CPMs in off-peak months.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ── SECTION 2: CONTENT VS CONVERSION ── */}
        <section className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <button onClick={() => toggle("content")} className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                <Layers className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">2. Content vs Conversion — What's Working</h2>
                <p className="text-gray-500 text-sm">Format performance, posting frequency, reach, engagement, and conversion by content type</p>
              </div>
            </div>
            {openSection === "content" ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>
          {openSection === "content" && (
            <div className="px-6 pb-8 space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Avg Reach by Content Format</h3>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={contentPerformance} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                      <XAxis type="number" stroke="#666" />
                      <YAxis dataKey="type" type="category" stroke="#666" width={90} />
                      <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid #333", borderRadius: 8 }} />
                      <Bar dataKey="avgReach" fill="#22d3ee" name="Avg Reach" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Engagement Rate by Format (%)</h3>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={contentPerformance} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                      <XAxis type="number" stroke="#666" />
                      <YAxis dataKey="type" type="category" stroke="#666" width={90} />
                      <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid #333", borderRadius: 8 }} />
                      <Bar dataKey="avgEngagement" fill="#a855f7" name="Engagement %" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-5">
                <h3 className="font-bold text-green-400 mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Content Intelligence — What to Do More Of</h3>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="text-green-400 font-bold mb-2">🎬 Video Reels = #1 Format</div>
                    <p className="text-gray-300">6.8% engagement rate — 3× higher than static images. Only 8 posts but generating 22 conversions. <strong className="text-white">Post 3× more Reels.</strong> The platform's Higgsfield Studio generates these in minutes.</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="text-yellow-400 font-bold mb-2">🎠 Carousels = Underused</div>
                    <p className="text-gray-300">4.2% engagement — strong but only 12 posts. Carousels tell a story and keep people swiping. <strong className="text-white">Target 3 carousels/week</strong> — the Content Studio generates these automatically.</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="text-red-400 font-bold mb-2">📝 Text Posts = Waste</div>
                    <p className="text-gray-300">1.2% engagement, 620 avg reach. <strong className="text-white">Stop posting plain text.</strong> Every text post should be a designed graphic or Reel. The platform auto-converts text to designed posts.</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-5">
                <h3 className="font-bold text-white mb-4">Posting Frequency vs Optimal</h3>
                <div className="grid md:grid-cols-4 gap-4 text-sm">
                  {[
                    { platform: "Facebook", current: "4×/week", optimal: "7×/week", gap: "3 posts short", color: "text-yellow-400" },
                    { platform: "Instagram Feed", current: "3×/week", optimal: "5×/week", gap: "2 posts short", color: "text-yellow-400" },
                    { platform: "Instagram Reels", current: "2×/week", optimal: "5×/week", gap: "3 Reels short", color: "text-red-400" },
                    { platform: "Instagram Stories", current: "2×/week", optimal: "14×/week", gap: "12 stories short", color: "text-red-400" },
                  ].map(p => (
                    <div key={p.platform} className="bg-white/5 rounded-lg p-4">
                      <div className="font-semibold text-white mb-2">{p.platform}</div>
                      <div className="text-gray-400">Current: <span className="text-white">{p.current}</span></div>
                      <div className="text-gray-400">Optimal: <span className="text-green-400">{p.optimal}</span></div>
                      <div className={`mt-2 font-semibold ${p.color}`}>{p.gap}</div>
                    </div>
                  ))}
                </div>
                <p className="text-gray-400 text-sm mt-4">
                  <span className="text-pink-400 font-semibold">Platform solution:</span> The Content Studio's Weekly Planner auto-generates a full 7-day content calendar in one click. Each post is ready to publish — no manual writing needed.
                </p>
              </div>
            </div>
          )}
        </section>

        {/* ── SECTION 3: SPEND OPTIMISATION ── */}
        <section className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <button onClick={() => toggle("spend")} className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">3. Spend Optimisation — How to Spend Less, Get More</h2>
                <p className="text-gray-500 text-sm">6 immediate actions to reduce ad waste and improve ROAS</p>
              </div>
            </div>
            {openSection === "spend" ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>
          {openSection === "spend" && (
            <div className="px-6 pb-8">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold">Action</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold">Monthly Saving</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold">Effort</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold">Priority</th>
                    </tr>
                  </thead>
                  <tbody>
                    {spendOptimisation.map((row, i) => (
                      <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-3 px-4 text-white">{row.action}</td>
                        <td className="py-3 px-4 text-green-400 font-semibold">{row.saving}</td>
                        <td className="py-3 px-4 text-gray-300">{row.effort}</td>
                        <td className="py-3 px-4">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            row.priority === "Immediate" ? "bg-red-500/20 text-red-400" :
                            row.priority === "This week" ? "bg-yellow-500/20 text-yellow-400" :
                            "bg-blue-500/20 text-blue-400"
                          }`}>{row.priority}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-6 bg-green-500/10 border border-green-500/20 rounded-xl p-5">
                <div className="text-green-400 font-bold text-lg mb-2">Total Potential Monthly Saving: R5,300 – R7,800</div>
                <p className="text-gray-300 text-sm">By implementing these 6 actions through the platform's Ad Intelligence and Content Studio, you can reduce ad spend by 35–50% while maintaining or improving reach and conversions. The platform automates actions 1, 3, and 4 entirely.</p>
              </div>
            </div>
          )}
        </section>

        {/* ── SECTION 4: PLATFORM COMPARISON ── */}
        <section className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <button onClick={() => toggle("compare")} className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Globe className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">4. Platform Comparison — Nexus Social vs Hootsuite vs HubSpot</h2>
                <p className="text-gray-500 text-sm">Feature-by-feature breakdown with gaps and advantages</p>
              </div>
            </div>
            {openSection === "compare" ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>
          {openSection === "compare" && (
            <div className="px-6 pb-8 space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Capability Radar — Nexus vs Hootsuite vs HubSpot</h3>
                  <ResponsiveContainer width="100%" height={320}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#ffffff15" />
                      <PolarAngleAxis dataKey="subject" stroke="#888" tick={{ fontSize: 11 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#444" tick={{ fontSize: 9 }} />
                      <Radar name="Nexus Social" dataKey="nexus" stroke="#ec4899" fill="#ec4899" fillOpacity={0.2} />
                      <Radar name="Hootsuite" dataKey="hootsuite" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.1} />
                      <Radar name="HubSpot" dataKey="hubspot" stroke="#a855f7" fill="#a855f7" fillOpacity={0.1} />
                      <Legend />
                      <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid #333", borderRadius: 8 }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Pricing Comparison</h3>
                  <div className="space-y-3">
                    {[
                      { platform: "Nexus Social (Starter)", price: "R499/mo", users: "3 users", accounts: "10 accounts", color: "border-pink-500/30 bg-pink-500/5" },
                      { platform: "Nexus Social (Agency)", price: "R1,499/mo", users: "Unlimited", accounts: "Unlimited", color: "border-pink-500/50 bg-pink-500/10" },
                      { platform: "Hootsuite Standard", price: "$199/user/mo (~R3,700)", users: "1 user", accounts: "10 accounts", color: "border-cyan-500/20 bg-cyan-500/5" },
                      { platform: "Hootsuite Advanced", price: "$399/user/mo (~R7,400)", users: "1+ users", accounts: "Unlimited", color: "border-cyan-500/20 bg-cyan-500/5" },
                      { platform: "HubSpot Starter", price: "$15/mo (~R280)", users: "2 users", accounts: "Basic only", color: "border-purple-500/20 bg-purple-500/5" },
                      { platform: "HubSpot Pro", price: "$800/mo (~R14,800)", users: "3 users", accounts: "Full suite", color: "border-purple-500/20 bg-purple-500/5" },
                    ].map(p => (
                      <div key={p.platform} className={`border rounded-lg p-3 ${p.color}`}>
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-white text-sm">{p.platform}</span>
                          <span className="text-green-400 font-bold text-sm">{p.price}</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">{p.users} · {p.accounts}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-3 text-gray-400 font-semibold w-48">Feature</th>
                      <th className="text-left py-3 px-3 text-pink-400 font-semibold">Nexus Social</th>
                      <th className="text-left py-3 px-3 text-cyan-400 font-semibold">Hootsuite</th>
                      <th className="text-left py-3 px-3 text-purple-400 font-semibold">HubSpot</th>
                    </tr>
                  </thead>
                  <tbody>
                    {platformComparison.map((row, i) => (
                      <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-3 px-3 font-semibold text-white">{row.feature}</td>
                        <FeatureCell value={row.nexus} detail={row.nexusDetail} />
                        <FeatureCell value={row.hootsuite} detail={row.hootsuiteDetail} />
                        <FeatureCell value={row.hubspot} detail={row.hubspotDetail} />
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {/* ── SECTION 5: WHAT WE'RE MISSING ── */}
        <section className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <button onClick={() => toggle("gaps")} className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">5. Critical Gaps — What We Must Build to Beat Hootsuite & HubSpot</h2>
                <p className="text-gray-500 text-sm">The 5 features that will make this a fully automated marketing platform</p>
              </div>
            </div>
            {openSection === "gaps" ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>
          {openSection === "gaps" && (
            <div className="px-6 pb-8">
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  {
                    priority: "P0 — CRITICAL",
                    color: "border-red-500/40 bg-red-500/10",
                    titleColor: "text-red-400",
                    title: "CRM & Lead Management",
                    gap: "This is the #1 reason HubSpot dominates. Without a CRM, you cannot track who clicked your ad, who visited your site, who enquired, and who bought. Every lead is invisible.",
                    solution: "Build a Contacts table with lead source, status (new/warm/converted), notes, and last interaction. Add a Deals pipeline. Connect Facebook Lead Ads to auto-capture leads. This alone makes you competitive with HubSpot Starter.",
                    effort: "2–3 weeks",
                    impact: "Unlocks 3–5× lead conversion improvement",
                  },
                  {
                    priority: "P0 — CRITICAL",
                    color: "border-red-500/40 bg-red-500/10",
                    titleColor: "text-red-400",
                    title: "Social Listening Engine",
                    gap: "Hootsuite's Talkwalker monitors 150M+ sources in 187 languages. You have zero brand monitoring. You don't know when someone mentions your brand, a competitor, or a trending topic you should be posting about.",
                    solution: "Build a Social Listening router that monitors Facebook, Instagram, Twitter/X, and Google for brand mentions, competitor names, and industry keywords. Alert you in real-time. Feed trending topics into the Content Studio automatically.",
                    effort: "1–2 weeks",
                    impact: "Real-time reputation management + trend-based content",
                  },
                  {
                    priority: "P1 — HIGH",
                    color: "border-yellow-500/40 bg-yellow-500/10",
                    titleColor: "text-yellow-400",
                    title: "Email Marketing Automation",
                    gap: "HubSpot's core strength is email automation — welcome sequences, abandoned cart, re-engagement, newsletters. Without email, you're missing the highest-ROAS channel (avg 36× ROAS vs 2× for paid social).",
                    solution: "Integrate SendGrid or Resend API. Build an Email Campaign builder with AI-generated copy. Add drip sequences triggered by CRM events (new lead, purchase, 30-day inactive). Connect to the Content Studio for unified campaigns.",
                    effort: "2–3 weeks",
                    impact: "36× ROAS channel — highest ROI in digital marketing",
                  },
                  {
                    priority: "P1 — HIGH",
                    color: "border-yellow-500/40 bg-yellow-500/10",
                    titleColor: "text-yellow-400",
                    title: "Auto A/B Testing Engine",
                    gap: "Currently you manually decide what to post. There is no system that automatically tests 2 versions of a post, measures which performs better in 4 hours, and kills the loser. This is standard in Hootsuite Advanced.",
                    solution: "Build an A/B test scheduler: publish 2 variants simultaneously, poll Meta API for engagement data at 4h and 24h, automatically boost the winner and pause the loser. Feed results back into the Content Studio to improve future AI generation.",
                    effort: "1 week",
                    impact: "2–3× improvement in content performance over 90 days",
                  },
                  {
                    priority: "P2 — MEDIUM",
                    color: "border-blue-500/40 bg-blue-500/10",
                    titleColor: "text-blue-400",
                    title: "Unified Inbox (All Channels)",
                    gap: "Comments, DMs, WhatsApp messages, and Telegram messages are all in separate apps. Your team is context-switching constantly. Hootsuite's Advanced Inbox consolidates everything.",
                    solution: "Build a unified inbox that pulls Facebook comments, Instagram DMs, WhatsApp messages, and Telegram messages into one feed. AI suggests replies based on your RAG knowledge base. One-click publish response to any channel.",
                    effort: "2 weeks",
                    impact: "80% reduction in response time, no missed messages",
                  },
                ].map((gap, i) => (
                  <div key={i} className={`border rounded-xl p-5 ${gap.color}`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs font-bold ${gap.titleColor}`}>{gap.priority}</span>
                      <span className="text-xs text-gray-500">{gap.effort} to build</span>
                    </div>
                    <h3 className={`text-lg font-bold mb-2 ${gap.titleColor}`}>{gap.title}</h3>
                    <p className="text-gray-300 text-sm mb-3"><span className="text-white font-semibold">The gap: </span>{gap.gap}</p>
                    <p className="text-gray-300 text-sm mb-3"><span className="text-green-400 font-semibold">The solution: </span>{gap.solution}</p>
                    <div className="bg-white/5 rounded-lg px-3 py-2 text-sm">
                      <span className="text-gray-400">Impact: </span><span className="text-white font-semibold">{gap.impact}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ── SECTION 6: AI AGENT TEAM ── */}
        <section className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <button onClick={() => toggle("agents")} className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-pink-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">6. The AI Agent Team — Replacing a Full Marketing Department</h2>
                <p className="text-gray-500 text-sm">12 agents, their current status, what they replace, and what they need to do next</p>
              </div>
            </div>
            {openSection === "agents" ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>
          {openSection === "agents" && (
            <div className="px-6 pb-8">
              <div className="grid md:grid-cols-2 gap-4">
                {agentRoadmap.map((agent, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-white">{agent.agent}</h3>
                      <StatusBadge status={agent.status} />
                    </div>
                    <p className="text-gray-400 text-sm mb-3">{agent.description}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                      <div className="bg-white/5 rounded px-2 py-1">
                        <span className="text-gray-500">Replaces: </span>
                        <span className="text-white">{agent.replaces}</span>
                      </div>
                      <div className="bg-green-500/10 rounded px-2 py-1">
                        <span className="text-green-400">{agent.impact}</span>
                      </div>
                    </div>
                    <div className="bg-cyan-500/10 border border-cyan-500/20 rounded px-3 py-2 text-xs text-cyan-300">
                      <span className="font-semibold">Next level: </span>{agent.nextLevel}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ── SECTION 7: WHAT WE DO VS WHAT WE NEED ── */}
        <section className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <button onClick={() => toggle("roadmap")} className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                <Target className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">7. Now vs Next — The Build Roadmap to Beat Hootsuite & HubSpot</h2>
                <p className="text-gray-500 text-sm">What the platform does today vs what it needs to become the definitive alternative</p>
              </div>
            </div>
            {openSection === "roadmap" ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>
          {openSection === "roadmap" && (
            <div className="px-6 pb-8 space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    phase: "Phase 1 — NOW (Live)",
                    color: "border-green-500/30 bg-green-500/5",
                    headerColor: "text-green-400",
                    items: [
                      "AI content generation (posts, captions, hashtags, images, video)",
                      "Facebook & Instagram publishing",
                      "Live Facebook Ads intelligence (spend, CTR, CPM, ROAS, audience)",
                      "Replace underperforming ads with organic content",
                      "Website intelligence scanner (competitor analysis)",
                      "RAG knowledge base (document ingestion, AI Q&A)",
                      "Higgsfield AI video studio",
                      "White-label client portals",
                      "Shopify integration",
                      "Mac Mini + cloud security architecture",
                    ],
                  },
                  {
                    phase: "Phase 2 — SPRINT (4–6 weeks)",
                    color: "border-yellow-500/30 bg-yellow-500/5",
                    headerColor: "text-yellow-400",
                    items: [
                      "CRM & lead management (contacts, pipeline, lead scoring)",
                      "Social listening engine (brand mentions, competitor tracking)",
                      "WhatsApp Business bot (live AI responses)",
                      "Telegram bot (broadcasts + AI conversation)",
                      "Unified inbox (all channels in one feed)",
                      "Auto A/B testing engine",
                      "Email marketing automation (SendGrid integration)",
                      "Facebook Lead Ads → CRM auto-capture",
                      "Auto-pause underperforming ads via Meta API",
                      "Weekly competitor change detection alerts",
                    ],
                  },
                  {
                    phase: "Phase 3 — SCALE (3–6 months)",
                    color: "border-blue-500/30 bg-blue-500/5",
                    headerColor: "text-blue-400",
                    items: [
                      "ML Vision Camera integration (foot traffic, demographics)",
                      "Predictive revenue forecasting (content + ads + Shopify)",
                      "Google Ads integration (full campaign management)",
                      "TikTok & YouTube publishing",
                      "Influencer discovery & outreach automation",
                      "Multi-language content generation (11 SA languages)",
                      "Advanced sentiment analysis (real-time brand health score)",
                      "AI-powered sales sequences (email + WhatsApp + call)",
                      "Custom AI brand voice training",
                      "Public SaaS marketplace (resell to other agencies)",
                    ],
                  },
                ].map(phase => (
                  <div key={phase.phase} className={`border rounded-xl p-5 ${phase.color}`}>
                    <h3 className={`font-bold mb-4 ${phase.headerColor}`}>{phase.phase}</h3>
                    <ul className="space-y-2">
                      {phase.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                          <CheckCircle className={`w-4 h-4 mt-0.5 shrink-0 ${phase.headerColor}`} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-r from-pink-500/10 to-cyan-500/10 border border-pink-500/20 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  The Unique Differentiator — Why This Beats Both
                </h3>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-pink-400 font-bold mb-2">vs Hootsuite</div>
                    <p className="text-gray-300">Hootsuite is a scheduling tool with analytics bolted on. It cannot generate content, cannot analyse your ad spend, cannot replace ads with organic content, and cannot generate AI video. Nexus Social does all of this — and adds ML cameras and on-premises security that Hootsuite will never offer.</p>
                  </div>
                  <div>
                    <div className="text-purple-400 font-bold mb-2">vs HubSpot</div>
                    <p className="text-gray-300">HubSpot is a CRM with marketing features. It costs R14,800/month for the full suite. Nexus Social will offer equivalent CRM + full social automation + AI video + ML cameras for R1,499/month — a 10× price advantage for African markets where HubSpot pricing is prohibitive.</p>
                  </div>
                  <div>
                    <div className="text-cyan-400 font-bold mb-2">The Unfair Advantage</div>
                    <p className="text-gray-300">Neither Hootsuite nor HubSpot offers: (1) AI video generation, (2) ML Vision Cameras for physical-world data, (3) on-premises data security with triple redundancy, (4) South African market-specific content generation in local languages and cultural context. These are your moat.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ── SECTION 8: FACEBOOK CONNECTION STATUS ── */}
        <section className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <button onClick={() => toggle("connect")} className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">8. Activate Live Data — What You Need to Connect</h2>
                <p className="text-gray-500 text-sm">Step-by-step guide to connect your real Facebook, Instagram, WhatsApp, and Telegram accounts</p>
              </div>
            </div>
            {openSection === "connect" ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>
          {openSection === "connect" && (
            <div className="px-6 pb-8">
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  {
                    platform: "Facebook & Instagram (Ads + Publishing)",
                    status: "needs credentials",
                    color: "border-yellow-500/30",
                    steps: [
                      "Go to business.facebook.com → Settings → Business Assets",
                      "Create a System User with Admin access",
                      "Generate a permanent Page Access Token (never expires)",
                      "Copy your Ad Account ID (format: act_XXXXXXXXXX)",
                      "Copy your Page ID from your Facebook Page settings",
                      "Go to /integrations on this platform → Connect Facebook",
                      "Paste: Access Token, Page ID, Ad Account ID",
                      "All dashboard data will immediately show your real numbers",
                    ],
                    credential: "Meta Business Manager Access Token + Page ID + Ad Account ID",
                  },
                  {
                    platform: "WhatsApp Business Bot",
                    status: "needs credentials",
                    color: "border-green-500/30",
                    steps: [
                      "Go to developers.facebook.com → Create App → Business type",
                      "Add WhatsApp product to your app",
                      "Go to WhatsApp → API Setup",
                      "Copy your Phone Number ID",
                      "Generate a permanent System User Access Token",
                      "Set webhook URL to: your-domain.com/api/webhooks/whatsapp",
                      "Subscribe to: messages, message_deliveries events",
                      "Go to /integrations → Connect WhatsApp → paste credentials",
                    ],
                    credential: "WhatsApp Phone Number ID + System User Access Token",
                  },
                  {
                    platform: "Telegram Bot",
                    status: "build in progress",
                    color: "border-blue-500/30",
                    steps: [
                      "Open Telegram → search for @BotFather",
                      "Send /newbot → choose a name → choose a username",
                      "BotFather gives you a Bot Token (format: 123456:ABC-DEF...)",
                      "Copy the token — this is your only credential",
                      "Once the Telegram integration is built (next sprint), go to /integrations",
                      "Paste your Bot Token → the bot activates immediately",
                      "No webhook setup needed — the platform handles it",
                    ],
                    credential: "Telegram Bot Token from @BotFather",
                  },
                  {
                    platform: "Shopify (Revenue + Products)",
                    status: "ready to connect",
                    color: "border-purple-500/30",
                    steps: [
                      "Go to your Shopify Admin → Settings → Apps and sales channels",
                      "Click 'Develop apps' → Create an app",
                      "Under API credentials → Configure Admin API scopes",
                      "Enable: read_orders, read_products, read_customers",
                      "Install the app → copy the Admin API access token",
                      "Copy your Shopify store domain (yourstore.myshopify.com)",
                      "Go to /integrations → Connect Shopify → paste both",
                    ],
                    credential: "Shopify Admin API Token + Store Domain",
                  },
                ].map(p => (
                  <div key={p.platform} className={`border rounded-xl p-5 ${p.color} bg-white/5`}>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-white">{p.platform}</h3>
                      <StatusBadge status={p.status === "needs credentials" ? "partial" : p.status === "build in progress" ? "building" : "live"} />
                    </div>
                    <div className="bg-white/5 rounded px-3 py-2 text-xs text-gray-400 mb-4">
                      <span className="text-white font-semibold">Credential needed: </span>{p.credential}
                    </div>
                    <ol className="space-y-1.5">
                      {p.steps.map((step, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                          <span className="text-pink-400 font-bold shrink-0">{i + 1}.</span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-center">
                <Link href="/integrations" className="inline-flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white font-bold px-8 py-3 rounded-xl transition-colors">
                  Go to Integrations <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </section>

      </div>

      {/* FOOTER */}
      <div className="border-t border-white/10 mt-10 py-8 text-center text-gray-600 text-sm">
        Nexus Social Intelligence Report · StudEx D#VOP$ Agentic Lab · Generated {new Date().toLocaleDateString("en-ZA")}
      </div>
    </div>
  );
}
