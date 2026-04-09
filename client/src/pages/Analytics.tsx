import { useState } from "react";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area
} from "recharts";
import {
  TrendingUp, Users, Heart, MessageSquare, Share2, Eye,
  Instagram, Facebook, Download, RefreshCw, Zap, Target,
  BarChart3, FileText, Brain, Globe
} from "lucide-react";
import { toast } from "sonner";

const NEON_PINK = "#ff00cc";
const NEON_CYAN = "#00ffff";
const NEON_PURPLE = "#9900ff";
const NEON_GREEN = "#00ff88";

// Mock data representing live Facebook/Instagram data from StudEx Meat
const fbPageData = {
  name: "StudEx Meat",
  followers: 2524,
  reach: 18420,
  impressions: 34800,
  engagement: 4.2,
  posts: 47,
};

const igData = {
  username: "@ramaphosatumelo",
  followers: 85208,
  following: 1240,
  posts: 1809,
  reach: 124500,
  impressions: 287000,
  engagement: 3.8,
};

const weeklyReach = [
  { day: "Mon", facebook: 2100, instagram: 14200 },
  { day: "Tue", facebook: 3400, instagram: 18900 },
  { day: "Wed", facebook: 2800, instagram: 22100 },
  { day: "Thu", facebook: 4200, instagram: 19800 },
  { day: "Fri", facebook: 5100, instagram: 31200 },
  { day: "Sat", facebook: 6800, instagram: 42000 },
  { day: "Sun", facebook: 4900, instagram: 28700 },
];

const engagementBreakdown = [
  { name: "Likes", value: 68, color: NEON_PINK },
  { name: "Comments", value: 14, color: NEON_CYAN },
  { name: "Shares", value: 10, color: NEON_PURPLE },
  { name: "Saves", value: 8, color: NEON_GREEN },
];

const topPosts = [
  { title: "Wagyu Beef Launch", platform: "Instagram", reach: 42100, engagement: 8.4, type: "Reel" },
  { title: "Halal Certification", platform: "Facebook", reach: 18200, engagement: 6.1, type: "Image" },
  { title: "Behind the Scenes", platform: "Instagram", reach: 31400, engagement: 7.2, type: "Story" },
  { title: "Product Range", platform: "Instagram", reach: 28900, engagement: 5.8, type: "Carousel" },
  { title: "Braai Season Promo", platform: "Facebook", reach: 14700, engagement: 4.9, type: "Video" },
];

const audienceDemographics = [
  { age: "18-24", male: 12, female: 18 },
  { age: "25-34", male: 22, female: 28 },
  { age: "35-44", male: 18, female: 14 },
  { age: "45-54", male: 10, female: 8 },
  { age: "55+", male: 5, female: 3 },
];

const contentCalendar = [
  { week: "W1", reels: 3, carousels: 2, stories: 7, posts: 2 },
  { week: "W2", reels: 4, carousels: 3, stories: 9, posts: 3 },
  { week: "W3", reels: 2, carousels: 4, stories: 6, posts: 2 },
  { week: "W4", reels: 5, carousels: 2, stories: 8, posts: 4 },
];

function StatCard({ icon: Icon, label, value, change, color }: {
  icon: any; label: string; value: string; change?: string; color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border p-4"
      style={{ background: "rgba(5,0,8,0.8)", borderColor: `${color}40` }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 rounded-lg" style={{ background: `${color}20` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        {change && (
          <Badge className="text-xs" style={{ background: `${color}20`, color }}>
            {change}
          </Badge>
        )}
      </div>
      <div className="font-orbitron text-2xl font-black" style={{ color }}>{value}</div>
      <div className="text-gray-400 text-xs mt-1 font-rajdhani">{label}</div>
    </motion.div>
  );
}

export default function Analytics() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Data refreshed from Facebook & Instagram APIs");
    }, 2000);
  };

  const handleExportReport = () => {
    toast.success("Generating deep intelligence report... PDF will download shortly.");
    // In production: call trpc.export.generateReport
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6" style={{ background: "rgba(5,0,8,0.95)", minHeight: "100vh" }}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-orbitron text-2xl font-black text-white">
              Social Intelligence <span style={{ color: NEON_PINK }}>Command Centre</span>
            </h1>
            <p className="text-gray-400 font-rajdhani mt-1">
              Live data from StudEx Meat Facebook & Instagram • Updated 2 mins ago
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="border-pink-500/30 text-pink-400 hover:bg-pink-500/10 font-rajdhani"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh Live Data
            </Button>
            <Button
              size="sm"
              onClick={handleExportReport}
              className="font-rajdhani"
              style={{ background: "linear-gradient(135deg, #ff00cc, #9900ff)" }}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Deep Report
            </Button>
          </div>
        </div>

        {/* Platform Badges */}
        <div className="flex gap-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10">
            <Facebook className="w-4 h-4 text-blue-400" />
            <span className="text-blue-400 font-rajdhani text-sm font-bold">StudEx Meat • 2,524 Followers</span>
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-pink-500/30 bg-pink-500/10">
            <Instagram className="w-4 h-4 text-pink-400" />
            <span className="text-pink-400 font-rajdhani text-sm font-bold">@ramaphosatumelo • 85,208 Followers</span>
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-black/50 border border-pink-500/20">
            {["overview", "facebook", "instagram", "content", "audience", "reports"].map(tab => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="font-rajdhani capitalize data-[state=active]:bg-pink-500/20 data-[state=active]:text-pink-400"
              >
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-6">
            {/* KPI Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={Users} label="Total Audience" value="87,732" change="+12.4%" color={NEON_PINK} />
              <StatCard icon={Eye} label="Weekly Reach" value="142.9K" change="+8.7%" color={NEON_CYAN} />
              <StatCard icon={Heart} label="Avg Engagement" value="4.0%" change="+0.6%" color={NEON_PURPLE} />
              <StatCard icon={BarChart3} label="Content Pieces" value="1,856" change="+47 this mo" color={NEON_GREEN} />
            </div>

            {/* Reach Chart */}
            <Card className="border-pink-500/20 bg-black/40">
              <CardHeader>
                <CardTitle className="font-orbitron text-white text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-pink-400" />
                  Weekly Reach — Facebook vs Instagram
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={weeklyReach}>
                    <defs>
                      <linearGradient id="fbGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4267B2" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#4267B2" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="igGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={NEON_PINK} stopOpacity={0.4} />
                        <stop offset="95%" stopColor={NEON_PINK} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="day" stroke="#666" tick={{ fill: "#999", fontSize: 12 }} />
                    <YAxis stroke="#666" tick={{ fill: "#999", fontSize: 12 }} />
                    <Tooltip contentStyle={{ background: "#0a0010", border: "1px solid #ff00cc40", borderRadius: "8px" }} />
                    <Area type="monotone" dataKey="facebook" stroke="#4267B2" fill="url(#fbGrad)" strokeWidth={2} name="Facebook" />
                    <Area type="monotone" dataKey="instagram" stroke={NEON_PINK} fill="url(#igGrad)" strokeWidth={2} name="Instagram" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Engagement + Top Posts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-pink-500/20 bg-black/40">
                <CardHeader>
                  <CardTitle className="font-orbitron text-white text-sm flex items-center gap-2">
                    <Heart className="w-4 h-4 text-pink-400" />
                    Engagement Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={engagementBreakdown} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value">
                        {engagementBreakdown.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: "#0a0010", border: "1px solid #ff00cc40", borderRadius: "8px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {engagementBreakdown.map(e => (
                      <div key={e.name} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ background: e.color }} />
                        <span className="text-gray-400 text-xs font-rajdhani">{e.name} — {e.value}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-pink-500/20 bg-black/40">
                <CardHeader>
                  <CardTitle className="font-orbitron text-white text-sm flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    Top Performing Content
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {topPosts.map((post, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                      <div className="flex items-center gap-3">
                        <div className="font-orbitron text-xs text-gray-500">#{i + 1}</div>
                        <div>
                          <div className="text-white text-xs font-rajdhani font-bold">{post.title}</div>
                          <div className="text-gray-500 text-xs">{post.platform} • {post.type}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-pink-400 text-xs font-bold">{post.reach.toLocaleString()} reach</div>
                        <div className="text-green-400 text-xs">{post.engagement}% eng.</div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* FACEBOOK TAB */}
          <TabsContent value="facebook" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={Users} label="Page Followers" value="2,524" change="+124 this mo" color="#4267B2" />
              <StatCard icon={Eye} label="Monthly Reach" value="18,420" change="+22%" color={NEON_CYAN} />
              <StatCard icon={Heart} label="Engagement Rate" value="4.2%" change="+0.8%" color={NEON_PINK} />
              <StatCard icon={FileText} label="Posts Published" value="47" change="this month" color={NEON_GREEN} />
            </div>
            <Card className="border-blue-500/20 bg-black/40">
              <CardHeader>
                <CardTitle className="font-orbitron text-white text-sm">Facebook Page Intelligence</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <div className="text-blue-400 font-rajdhani text-xs mb-1">Page Category</div>
                    <div className="text-white font-bold">Brand — Halal Beef Products</div>
                  </div>
                  <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <div className="text-blue-400 font-rajdhani text-xs mb-1">Best Posting Time</div>
                    <div className="text-white font-bold">Friday 6–8 PM (SAST)</div>
                  </div>
                  <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <div className="text-blue-400 font-rajdhani text-xs mb-1">Top Content Format</div>
                    <div className="text-white font-bold">Video Posts (6.1% avg eng.)</div>
                  </div>
                  <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <div className="text-blue-400 font-rajdhani text-xs mb-1">Audience Location</div>
                    <div className="text-white font-bold">Johannesburg, Cape Town, Durban</div>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-400 font-rajdhani font-bold text-sm">AI Insight</span>
                  </div>
                  <p className="text-gray-300 text-sm font-rajdhani">
                    Your Facebook page has strong engagement on video content but low follower growth (4.9% MoM). 
                    Recommend increasing Reel cross-posting from Instagram and running a targeted follower campaign 
                    targeting Johannesburg food enthusiasts aged 25–44. Your Halal certification content drives 3x 
                    higher engagement than product posts — lead with trust-building content.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* INSTAGRAM TAB */}
          <TabsContent value="instagram" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={Users} label="Followers" value="85,208" change="+2.1K this mo" color={NEON_PINK} />
              <StatCard icon={Eye} label="Monthly Reach" value="124,500" change="+18%" color={NEON_CYAN} />
              <StatCard icon={Heart} label="Engagement Rate" value="3.8%" change="+0.4%" color={NEON_PURPLE} />
              <StatCard icon={FileText} label="Total Posts" value="1,809" change="+47 this mo" color={NEON_GREEN} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-pink-500/20 bg-black/40">
                <CardHeader>
                  <CardTitle className="font-orbitron text-white text-sm">Content Mix Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={contentCalendar}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="week" stroke="#666" tick={{ fill: "#999", fontSize: 12 }} />
                      <YAxis stroke="#666" tick={{ fill: "#999", fontSize: 12 }} />
                      <Tooltip contentStyle={{ background: "#0a0010", border: "1px solid #ff00cc40", borderRadius: "8px" }} />
                      <Bar dataKey="reels" fill={NEON_PINK} name="Reels" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="carousels" fill={NEON_CYAN} name="Carousels" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="stories" fill={NEON_PURPLE} name="Stories" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card className="border-pink-500/20 bg-black/40">
                <CardHeader>
                  <CardTitle className="font-orbitron text-white text-sm">AI Content Direction</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { icon: "🎬", label: "Reels", insight: "Highest reach format. Post 4–5/week at 6PM Fri–Sun.", score: 94 },
                    { icon: "🖼️", label: "Carousels", insight: "Best for product education. 3 saves per 100 views.", score: 78 },
                    { icon: "📖", label: "Stories", insight: "Daily engagement driver. Use polls and Q&A stickers.", score: 71 },
                    { icon: "📸", label: "Static Posts", insight: "Lower reach. Use for announcements only.", score: 45 },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
                      <span className="text-lg">{item.icon}</span>
                      <div className="flex-1">
                        <div className="text-white text-xs font-bold font-rajdhani">{item.label}</div>
                        <div className="text-gray-400 text-xs">{item.insight}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-orbitron text-sm font-black" style={{ color: item.score > 80 ? NEON_GREEN : item.score > 60 ? NEON_CYAN : "#888" }}>
                          {item.score}
                        </div>
                        <div className="text-gray-500 text-xs">score</div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* AUDIENCE TAB */}
          <TabsContent value="audience" className="space-y-6">
            <Card className="border-pink-500/20 bg-black/40">
              <CardHeader>
                <CardTitle className="font-orbitron text-white text-sm">Audience Demographics</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={audienceDemographics} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis type="number" stroke="#666" tick={{ fill: "#999", fontSize: 12 }} />
                    <YAxis dataKey="age" type="category" stroke="#666" tick={{ fill: "#999", fontSize: 12 }} />
                    <Tooltip contentStyle={{ background: "#0a0010", border: "1px solid #ff00cc40", borderRadius: "8px" }} />
                    <Bar dataKey="male" fill={NEON_CYAN} name="Male" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="female" fill={NEON_PINK} name="Female" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: "Top City", value: "Johannesburg", sub: "34% of audience", color: NEON_PINK },
                { label: "Peak Age Group", value: "25–34", sub: "50% of total audience", color: NEON_CYAN },
                { label: "Gender Split", value: "58% Female", sub: "42% Male", color: NEON_PURPLE },
              ].map(item => (
                <div key={item.label} className="p-4 rounded-xl border bg-black/40" style={{ borderColor: `${item.color}30` }}>
                  <div className="text-gray-400 text-xs font-rajdhani mb-1">{item.label}</div>
                  <div className="font-orbitron text-xl font-black" style={{ color: item.color }}>{item.value}</div>
                  <div className="text-gray-500 text-xs mt-1">{item.sub}</div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* CONTENT TAB */}
          <TabsContent value="content" className="space-y-6">
            <Card className="border-pink-500/20 bg-black/40">
              <CardHeader>
                <CardTitle className="font-orbitron text-white text-sm flex items-center gap-2">
                  <Target className="w-4 h-4 text-pink-400" />
                  Content Strategy Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    priority: "HIGH",
                    title: "Increase Reel Frequency",
                    detail: "Your Reels average 3.2x more reach than static posts. Target 5 Reels/week. Focus on 15–30 second product showcases with trending audio.",
                    impact: "Est. +40% reach",
                    color: NEON_GREEN,
                  },
                  {
                    priority: "HIGH",
                    title: "Cross-Post Facebook ↔ Instagram",
                    detail: "Only 23% of your Instagram content is being shared to Facebook. Cross-posting Reels to Facebook as native videos increases page reach by 2.4x.",
                    impact: "Est. +2.4x FB reach",
                    color: NEON_PINK,
                  },
                  {
                    priority: "MED",
                    title: "Halal & Trust Content Pillar",
                    detail: "Posts featuring your Halal certification, sourcing story, and quality standards receive 3x higher engagement. Build a weekly 'Behind the Brand' series.",
                    impact: "Est. +3x engagement",
                    color: NEON_CYAN,
                  },
                  {
                    priority: "MED",
                    title: "User-Generated Content (UGC)",
                    detail: "Encourage customers to tag @ramaphosatumelo. Repost UGC with permission. UGC posts average 4.8% engagement vs 3.8% for branded content.",
                    impact: "Est. +1% eng. rate",
                    color: NEON_PURPLE,
                  },
                  {
                    priority: "LOW",
                    title: "Optimise Posting Schedule",
                    detail: "Current best window: Friday–Sunday 6–8 PM SAST. Avoid Monday–Wednesday morning posts which show 40% lower reach.",
                    impact: "Est. +15% reach",
                    color: "#888",
                  },
                ].map((rec, i) => (
                  <div key={i} className="p-4 rounded-xl border bg-white/5" style={{ borderColor: `${rec.color}30` }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge style={{ background: `${rec.color}20`, color: rec.color }} className="text-xs font-rajdhani">
                          {rec.priority}
                        </Badge>
                        <span className="text-white font-bold text-sm font-rajdhani">{rec.title}</span>
                      </div>
                      <span className="text-xs font-orbitron" style={{ color: rec.color }}>{rec.impact}</span>
                    </div>
                    <p className="text-gray-400 text-xs font-rajdhani">{rec.detail}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* REPORTS TAB */}
          <TabsContent value="reports" className="space-y-6">
            <Card className="border-pink-500/20 bg-black/40">
              <CardHeader>
                <CardTitle className="font-orbitron text-white text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-pink-400" />
                  Deep Intelligence Reports
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { title: "Monthly Social Performance Report", date: "April 2026", status: "Ready", type: "PDF" },
                  { title: "Content Strategy Analysis — Q1 2026", date: "March 2026", status: "Ready", type: "PDF" },
                  { title: "Audience Growth Intelligence", date: "March 2026", status: "Ready", type: "PDF" },
                  { title: "Competitor Benchmarking Report", date: "February 2026", status: "Ready", type: "PDF" },
                  { title: "Instagram Reel Performance Deep Dive", date: "February 2026", status: "Ready", type: "PDF" },
                ].map((report, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-pink-500/10">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-pink-500/10">
                        <FileText className="w-4 h-4 text-pink-400" />
                      </div>
                      <div>
                        <div className="text-white text-sm font-rajdhani font-bold">{report.title}</div>
                        <div className="text-gray-500 text-xs">{report.date} • {report.type}</div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-pink-500/30 text-pink-400 hover:bg-pink-500/10 text-xs font-rajdhani"
                      onClick={() => toast.success(`Downloading ${report.title}...`)}
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </Button>
                  </div>
                ))}
                <Button
                  className="w-full mt-4 font-rajdhani"
                  style={{ background: "linear-gradient(135deg, #ff00cc, #9900ff)" }}
                  onClick={handleExportReport}
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Generate New AI Intelligence Report
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
