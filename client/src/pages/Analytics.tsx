import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Facebook, Download, RefreshCw, Zap, Target,
  BarChart3, FileText, Globe, AlertCircle, Loader2,
  ThumbsUp, MapPin, Calendar, ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";

const NEON_PINK = "#ff00cc";
const NEON_CYAN = "#00ffff";
const NEON_PURPLE = "#9900ff";
const NEON_GREEN = "#00ff88";
const NEON_YELLOW = "#ffcc00";
const FB_BLUE = "#1877F2";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-ZA", { day: "numeric", month: "short" });
}

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color, loading }: {
  icon: any; label: string; value: string; sub?: string; color: string; loading?: boolean;
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
        {sub && (
          <Badge className="text-xs font-rajdhani" style={{ background: `${color}20`, color }}>
            {sub}
          </Badge>
        )}
      </div>
      {loading ? (
        <div className="h-8 w-20 bg-white/5 animate-pulse rounded" />
      ) : (
        <div className="font-orbitron text-2xl font-black" style={{ color }}>{value}</div>
      )}
      <div className="text-gray-400 text-xs mt-1 font-rajdhani">{label}</div>
    </motion.div>
  );
}

// ─── Not Connected Banner ─────────────────────────────────────────────────────
function NotConnectedBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-8 text-center"
    >
      <AlertCircle className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
      <h3 className="font-orbitron text-white font-black text-lg mb-2">Facebook Not Connected</h3>
      <p className="text-gray-400 font-rajdhani text-sm mb-6 max-w-md mx-auto">
        Connect your Facebook Page to see live reach, engagement, audience demographics, and top posts pulled directly from the Graph API.
      </p>
      <Link href="/integrations">
        <Button className="font-rajdhani" style={{ background: "linear-gradient(135deg, #1877F2, #9900ff)" }}>
          <Facebook className="w-4 h-4 mr-2" />
          Connect Facebook Page
        </Button>
      </Link>
    </motion.div>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
function ChartSkeleton({ height = 280 }: { height?: number }) {
  return (
    <div className="animate-pulse" style={{ height }}>
      <div className="h-full bg-white/5 rounded-lg flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-600" />
      </div>
    </div>
  );
}

// ─── Main Analytics Page ──────────────────────────────────────────────────────
export default function Analytics() {
  const [activeTab, setActiveTab] = useState("overview");
  const [insightDays, setInsightDays] = useState<28 | 7 | 90>(28);

  // ─── Data queries ─────────────────────────────────────────────────────────
  const { data: connectionStatus, isLoading: statusLoading } = trpc.facebook.getConnectionStatus.useQuery();

  const isConnected = connectionStatus?.connected === true;

  const { data: pageSummary, isLoading: summaryLoading, refetch: refetchSummary } =
    trpc.facebook.getPageSummary.useQuery(undefined, { enabled: isConnected });

  const { data: insights, isLoading: insightsLoading, refetch: refetchInsights } =
    trpc.facebook.getPageInsights.useQuery(
      { period: "day", days: insightDays },
      { enabled: isConnected }
    );

  const { data: topPosts, isLoading: postsLoading, refetch: refetchPosts } =
    trpc.facebook.getTopPosts.useQuery({ limit: 10 }, { enabled: isConnected });

  const { data: demographics, isLoading: demoLoading, refetch: refetchDemo } =
    trpc.facebook.getAudienceDemographics.useQuery(undefined, { enabled: isConnected });

  const { data: recentActivity, isLoading: activityLoading } =
    trpc.facebook.getRecentActivity.useQuery({ days: 30 }, { enabled: isConnected });

  // ─── Derived data ─────────────────────────────────────────────────────────
  const engagementBreakdown = useMemo(() => {
    if (!topPosts || topPosts.length === 0) return [];
    const totalReactions = topPosts.reduce((s: number, p: any) => s + p.reactions, 0);
    const totalEngaged = topPosts.reduce((s: number, p: any) => s + p.engaged, 0);
    return [
      { name: "Reactions", value: Math.round((totalReactions / Math.max(totalEngaged, 1)) * 100), color: NEON_PINK },
      { name: "Other", value: Math.round(((totalEngaged - totalReactions) / Math.max(totalEngaged, 1)) * 100), color: NEON_CYAN },
    ].filter(d => d.value > 0);
  }, [topPosts]);

  const handleRefreshAll = async () => {
    toast.info("Refreshing live data from Facebook Graph API...");
    await Promise.all([refetchSummary(), refetchInsights(), refetchPosts(), refetchDemo()]);
    toast.success("Live data refreshed successfully");
  };

  const handleExportReport = () => {
    toast.success("Generating deep intelligence report... Feature coming soon.");
  };

  const isAnyLoading = statusLoading || summaryLoading || insightsLoading;

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <DashboardLayout>
      <div className="p-6 space-y-6" style={{ background: "rgba(5,0,8,0.95)", minHeight: "100vh" }}>

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-orbitron text-2xl font-black text-white">
              Social Intelligence <span style={{ color: NEON_PINK }}>Command Centre</span>
            </h1>
            <p className="text-gray-400 font-rajdhani mt-1">
              {isConnected && pageSummary
                ? `Live data — ${pageSummary.name} • ${fmtNum(pageSummary.fanCount)} followers`
                : "Connect your Facebook page to see live analytics"}
            </p>
          </div>
          <div className="flex gap-3">
            {isConnected && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshAll}
                disabled={isAnyLoading}
                className="border-pink-500/30 text-pink-400 hover:bg-pink-500/10 font-rajdhani"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isAnyLoading ? "animate-spin" : ""}`} />
                Refresh Live Data
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleExportReport}
              className="font-rajdhani"
              style={{ background: "linear-gradient(135deg, #ff00cc, #9900ff)" }}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Connection status badge */}
        {isConnected && pageSummary && (
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10">
              <Facebook className="w-4 h-4 text-blue-400" />
              <span className="text-blue-400 font-rajdhani text-sm font-bold">
                {pageSummary.name} • {fmtNum(pageSummary.fanCount)} Fans
              </span>
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            </div>
            {connectionStatus?.lastSyncedAt && (
              <span className="text-gray-500 text-xs font-rajdhani">
                Last synced: {new Date(connectionStatus.lastSyncedAt).toLocaleString("en-ZA")}
              </span>
            )}
          </div>
        )}

        {/* Not connected state */}
        {!statusLoading && !isConnected && <NotConnectedBanner />}

        {/* Main content — only show if connected */}
        {isConnected && (
          <>
            {/* Date range selector */}
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-xs font-rajdhani">PERIOD:</span>
              {([7, 28, 90] as const).map(d => (
                <button
                  key={d}
                  onClick={() => setInsightDays(d)}
                  className={`px-3 py-1 rounded-lg text-xs font-rajdhani font-bold transition-all ${
                    insightDays === d
                      ? "bg-pink-500/20 text-pink-400 border border-pink-500/40"
                      : "text-gray-500 border border-white/10 hover:text-gray-300"
                  }`}
                >
                  {d === 7 ? "7 Days" : d === 28 ? "28 Days" : "90 Days"}
                </button>
              ))}
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-black/50 border border-pink-500/20">
                {[
                  { id: "overview", label: "Overview" },
                  { id: "reach", label: "Reach & Impressions" },
                  { id: "posts", label: "Top Posts" },
                  { id: "audience", label: "Audience" },
                  { id: "activity", label: "Activity" },
                ].map(tab => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="font-rajdhani data-[state=active]:bg-pink-500/20 data-[state=active]:text-pink-400"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* ── OVERVIEW TAB ─────────────────────────────────────────── */}
              <TabsContent value="overview" className="space-y-6">
                {/* KPI Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard
                    icon={Users}
                    label="Page Fans"
                    value={summaryLoading ? "—" : fmtNum(pageSummary?.fanCount || 0)}
                    color={NEON_PINK}
                    loading={summaryLoading}
                  />
                  <StatCard
                    icon={Eye}
                    label={`Total Reach (${insightDays}d)`}
                    value={insightsLoading ? "—" : fmtNum(insights?.summary.totalReach || 0)}
                    color={NEON_CYAN}
                    loading={insightsLoading}
                  />
                  <StatCard
                    icon={TrendingUp}
                    label="Avg Engagement Rate"
                    value={insightsLoading ? "—" : `${insights?.summary.avgEngagement || 0}%`}
                    color={NEON_PURPLE}
                    loading={insightsLoading}
                  />
                  <StatCard
                    icon={BarChart3}
                    label={`Total Impressions (${insightDays}d)`}
                    value={insightsLoading ? "—" : fmtNum(insights?.summary.totalImpressions || 0)}
                    color={NEON_GREEN}
                    loading={insightsLoading}
                  />
                </div>

                {/* Secondary KPIs */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <StatCard
                    icon={Users}
                    label={`New Fans (${insightDays}d)`}
                    value={insightsLoading ? "—" : fmtNum(insights?.summary.totalNewFans || 0)}
                    color={NEON_YELLOW}
                    loading={insightsLoading}
                  />
                  <StatCard
                    icon={Globe}
                    label={`Page Views (${insightDays}d)`}
                    value={insightsLoading ? "—" : fmtNum(insights?.summary.totalPageViews || 0)}
                    color={FB_BLUE}
                    loading={insightsLoading}
                  />
                  <StatCard
                    icon={FileText}
                    label="Posts This Month"
                    value={activityLoading ? "—" : String(recentActivity?.totalPosts || 0)}
                    color={NEON_PINK}
                    loading={activityLoading}
                  />
                </div>

                {/* Reach over time chart */}
                <Card className="border-pink-500/20 bg-black/40">
                  <CardHeader>
                    <CardTitle className="font-orbitron text-white text-sm flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-pink-400" />
                      Daily Reach — Last {insightDays} Days
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {insightsLoading ? <ChartSkeleton /> : (
                      <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={insights?.metrics || []}>
                          <defs>
                            <linearGradient id="reachGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={NEON_PINK} stopOpacity={0.4} />
                              <stop offset="95%" stopColor={NEON_PINK} stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="engagedGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={NEON_CYAN} stopOpacity={0.4} />
                              <stop offset="95%" stopColor={NEON_CYAN} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="label" stroke="#666" tick={{ fill: "#999", fontSize: 10 }} interval="preserveStartEnd" />
                          <YAxis stroke="#666" tick={{ fill: "#999", fontSize: 10 }} tickFormatter={fmtNum} />
                          <Tooltip
                            contentStyle={{ background: "#0a0010", border: "1px solid #ff00cc40", borderRadius: "8px", fontFamily: "Rajdhani" }}
                            formatter={(v: number, name: string) => [fmtNum(v), name]}
                          />
                          <Area type="monotone" dataKey="reach" stroke={NEON_PINK} fill="url(#reachGrad)" strokeWidth={2} name="Reach" />
                          <Area type="monotone" dataKey="engaged" stroke={NEON_CYAN} fill="url(#engagedGrad)" strokeWidth={2} name="Engaged Users" />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ── REACH & IMPRESSIONS TAB ──────────────────────────────── */}
              <TabsContent value="reach" className="space-y-6">
                <Card className="border-cyan-500/20 bg-black/40">
                  <CardHeader>
                    <CardTitle className="font-orbitron text-white text-sm flex items-center gap-2">
                      <Eye className="w-4 h-4 text-cyan-400" />
                      Impressions vs Reach vs Engaged Users
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {insightsLoading ? <ChartSkeleton height={320} /> : (
                      <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={insights?.metrics || []}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="label" stroke="#666" tick={{ fill: "#999", fontSize: 10 }} interval="preserveStartEnd" />
                          <YAxis stroke="#666" tick={{ fill: "#999", fontSize: 10 }} tickFormatter={fmtNum} />
                          <Tooltip
                            contentStyle={{ background: "#0a0010", border: "1px solid #00ffff40", borderRadius: "8px", fontFamily: "Rajdhani" }}
                            formatter={(v: number, name: string) => [fmtNum(v), name]}
                          />
                          <Bar dataKey="impressions" fill={NEON_PURPLE} name="Impressions" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="reach" fill={NEON_CYAN} name="Reach" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="engaged" fill={NEON_GREEN} name="Engaged" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border-green-500/20 bg-black/40">
                    <CardHeader>
                      <CardTitle className="font-orbitron text-white text-sm flex items-center gap-2">
                        <Users className="w-4 h-4 text-green-400" />
                        New Fans Over Time
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {insightsLoading ? <ChartSkeleton height={200} /> : (
                        <ResponsiveContainer width="100%" height={200}>
                          <LineChart data={insights?.metrics || []}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="label" stroke="#666" tick={{ fill: "#999", fontSize: 10 }} interval="preserveStartEnd" />
                            <YAxis stroke="#666" tick={{ fill: "#999", fontSize: 10 }} />
                            <Tooltip contentStyle={{ background: "#0a0010", border: "1px solid #00ff8840", borderRadius: "8px" }} />
                            <Line type="monotone" dataKey="newFans" stroke={NEON_GREEN} strokeWidth={2} dot={false} name="New Fans" />
                          </LineChart>
                        </ResponsiveContainer>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border-blue-500/20 bg-black/40">
                    <CardHeader>
                      <CardTitle className="font-orbitron text-white text-sm flex items-center gap-2">
                        <Globe className="w-4 h-4 text-blue-400" />
                        Page Views Over Time
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {insightsLoading ? <ChartSkeleton height={200} /> : (
                        <ResponsiveContainer width="100%" height={200}>
                          <LineChart data={insights?.metrics || []}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="label" stroke="#666" tick={{ fill: "#999", fontSize: 10 }} interval="preserveStartEnd" />
                            <YAxis stroke="#666" tick={{ fill: "#999", fontSize: 10 }} tickFormatter={fmtNum} />
                            <Tooltip contentStyle={{ background: "#0a0010", border: "1px solid #1877F240", borderRadius: "8px" }} />
                            <Line type="monotone" dataKey="pageViews" stroke={FB_BLUE} strokeWidth={2} dot={false} name="Page Views" />
                          </LineChart>
                        </ResponsiveContainer>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* ── TOP POSTS TAB ────────────────────────────────────────── */}
              <TabsContent value="posts" className="space-y-4">
                {postsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-24 bg-white/5 animate-pulse rounded-xl" />
                    ))}
                  </div>
                ) : !topPosts || topPosts.length === 0 ? (
                  <div className="text-center py-12 border border-white/10 rounded-xl">
                    <FileText className="w-10 h-10 mx-auto mb-3 text-gray-600" />
                    <div className="text-gray-400 font-rajdhani">No posts found for this page</div>
                    <p className="text-gray-600 text-sm font-rajdhani mt-1">
                      Posts may require a Page access token with sufficient permissions
                    </p>
                  </div>
                ) : (
                  topPosts.map((post: any, i: number) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex gap-4 p-4 rounded-xl border border-white/10 bg-black/40 hover:bg-white/5 transition-all"
                    >
                      {/* Rank */}
                      <div className="font-orbitron text-2xl font-black flex-shrink-0 w-8 text-center"
                        style={{ color: i === 0 ? NEON_YELLOW : i === 1 ? "#C0C0C0" : i === 2 ? "#CD7F32" : "#444" }}>
                        {i + 1}
                      </div>

                      {/* Post image */}
                      {post.picture && (
                        <img src={post.picture} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                      )}

                      {/* Post content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-200 font-rajdhani text-sm line-clamp-2 mb-2">
                          {post.message}
                        </p>
                        <div className="flex items-center gap-4 flex-wrap">
                          <div className="flex items-center gap-1 text-pink-400">
                            <Eye className="w-3 h-3" />
                            <span className="text-xs font-rajdhani">{fmtNum(post.reach)} reach</span>
                          </div>
                          <div className="flex items-center gap-1 text-cyan-400">
                            <Users className="w-3 h-3" />
                            <span className="text-xs font-rajdhani">{fmtNum(post.engaged)} engaged</span>
                          </div>
                          <div className="flex items-center gap-1 text-purple-400">
                            <ThumbsUp className="w-3 h-3" />
                            <span className="text-xs font-rajdhani">{fmtNum(post.reactions)} reactions</span>
                          </div>
                          <Badge className="text-xs font-rajdhani" style={{ background: "#ff00cc20", color: NEON_PINK }}>
                            {post.engagementRate}% eng.
                          </Badge>
                          <span className="text-gray-600 text-xs font-rajdhani ml-auto">
                            {fmtDate(post.createdAt)}
                          </span>
                        </div>
                      </div>

                      {/* External link */}
                      <a
                        href={`https://www.facebook.com/${post.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 text-gray-600 hover:text-blue-400 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </motion.div>
                  ))
                )}
              </TabsContent>

              {/* ── AUDIENCE TAB ─────────────────────────────────────────── */}
              <TabsContent value="audience" className="space-y-6">
                {demoLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ChartSkeleton height={300} />
                    <ChartSkeleton height={300} />
                  </div>
                ) : (
                  <>
                    {/* Age/Gender chart */}
                    {demographics?.ageGender && demographics.ageGender.length > 0 ? (
                      <Card className="border-purple-500/20 bg-black/40">
                        <CardHeader>
                          <CardTitle className="font-orbitron text-white text-sm flex items-center gap-2">
                            <Users className="w-4 h-4 text-purple-400" />
                            Audience Age & Gender Breakdown
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={demographics.ageGender}>
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                              <XAxis dataKey="age" stroke="#666" tick={{ fill: "#999", fontSize: 12 }} />
                              <YAxis stroke="#666" tick={{ fill: "#999", fontSize: 12 }} />
                              <Tooltip contentStyle={{ background: "#0a0010", border: "1px solid #9900ff40", borderRadius: "8px" }} />
                              <Bar dataKey="male" fill={FB_BLUE} name="Male" radius={[4, 4, 0, 0]} />
                              <Bar dataKey="female" fill={NEON_PINK} name="Female" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="p-6 rounded-xl border border-purple-500/20 bg-purple-500/5 text-center">
                        <Users className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                        <div className="text-gray-400 font-rajdhani text-sm">
                          Age/gender data requires a Page with sufficient followers and a Page access token
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Top Countries */}
                      <Card className="border-green-500/20 bg-black/40">
                        <CardHeader>
                          <CardTitle className="font-orbitron text-white text-sm flex items-center gap-2">
                            <Globe className="w-4 h-4 text-green-400" />
                            Top Countries
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {demographics?.countries && demographics.countries.length > 0 ? (
                            <div className="space-y-2">
                              {demographics.countries.map((c, i) => {
                                const total = demographics.countries.reduce((s, x) => s + x.count, 0);
                                const pct = total > 0 ? Math.round((c.count / total) * 100) : 0;
                                return (
                                  <div key={c.country} className="flex items-center gap-3">
                                    <span className="text-gray-500 text-xs w-4 font-rajdhani">{i + 1}</span>
                                    <span className="text-white font-rajdhani text-sm flex-1">{c.country}</span>
                                    <div className="flex items-center gap-2">
                                      <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: NEON_GREEN }} />
                                      </div>
                                      <span className="text-green-400 text-xs font-rajdhani w-8">{pct}%</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="text-gray-500 text-sm font-rajdhani text-center py-4">
                              Country data not available yet
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Top Cities */}
                      <Card className="border-yellow-500/20 bg-black/40">
                        <CardHeader>
                          <CardTitle className="font-orbitron text-white text-sm flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-yellow-400" />
                            Top Cities
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {demographics?.cities && demographics.cities.length > 0 ? (
                            <div className="space-y-2">
                              {demographics.cities.map((c, i) => {
                                const total = demographics.cities.reduce((s, x) => s + x.count, 0);
                                const pct = total > 0 ? Math.round((c.count / total) * 100) : 0;
                                return (
                                  <div key={c.city} className="flex items-center gap-3">
                                    <span className="text-gray-500 text-xs w-4 font-rajdhani">{i + 1}</span>
                                    <span className="text-white font-rajdhani text-sm flex-1">{c.city}</span>
                                    <div className="flex items-center gap-2">
                                      <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: NEON_YELLOW }} />
                                      </div>
                                      <span className="text-yellow-400 text-xs font-rajdhani w-8">{pct}%</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="text-gray-500 text-sm font-rajdhani text-center py-4">
                              City data not available yet
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </>
                )}
              </TabsContent>

              {/* ── ACTIVITY TAB ─────────────────────────────────────────── */}
              <TabsContent value="activity" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-orbitron text-white text-sm">
                    Recent Posts — Last 30 Days
                    {recentActivity && (
                      <span className="ml-2 font-rajdhani text-pink-400">({recentActivity.totalPosts} posts)</span>
                    )}
                  </h3>
                </div>

                {activityLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="h-16 bg-white/5 animate-pulse rounded-xl" />
                    ))}
                  </div>
                ) : !recentActivity?.posts.length ? (
                  <div className="text-center py-12 border border-white/10 rounded-xl">
                    <Calendar className="w-10 h-10 mx-auto mb-3 text-gray-600" />
                    <div className="text-gray-400 font-rajdhani">No recent posts found</div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recentActivity.posts.map((post: any, i: number) => (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="flex items-center gap-4 p-3 rounded-xl border border-white/10 bg-black/40"
                      >
                        <div className="p-2 rounded-lg bg-blue-500/10 flex-shrink-0">
                          <Facebook className="w-3 h-3 text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-300 font-rajdhani text-sm truncate">{post.message || "(No caption)"}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge className="text-xs font-rajdhani" style={{ background: "#1877F220", color: FB_BLUE }}>
                              {post.type}
                            </Badge>
                            <span className="text-gray-600 text-xs font-rajdhani">{fmtDate(post.createdAt)}</span>
                          </div>
                        </div>
                        <a
                          href={`https://www.facebook.com/${post.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-600 hover:text-blue-400 transition-colors flex-shrink-0"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </motion.div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
