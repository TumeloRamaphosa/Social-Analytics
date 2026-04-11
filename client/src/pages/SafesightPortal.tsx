import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Streamdown } from "streamdown";
import {
  Eye, Zap, TrendingUp, TrendingDown, DollarSign, Users,
  BarChart3, Brain, RefreshCw, Loader2, AlertTriangle,
  CheckCircle2, Target, Sparkles, ArrowRight, ExternalLink,
  Activity, MousePointerClick, Megaphone, Calendar
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";

// ─── Brand colours ────────────────────────────────────────────────────────────
const TEAL = "#0ABFBC";
const TEAL_DARK = "#078d8b";
const GOLD = "#E8B86D";
const DARK = "#0a1628";
const CARD_BG = "#0d1f3c";
const BORDER = "#1a3a5c";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmt(n: number | string | undefined, prefix = "") {
  const v = parseFloat(String(n || 0));
  if (isNaN(v)) return `${prefix}0`;
  if (v >= 1_000_000) return `${prefix}${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${prefix}${(v / 1_000).toFixed(1)}K`;
  return `${prefix}${v.toFixed(2)}`;
}
function fmtR(n: number | string | undefined) {
  return `R${fmt(n)}`;
}
function pct(n: number | string | undefined) {
  return `${parseFloat(String(n || 0)).toFixed(2)}%`;
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color = TEAL, trend }: {
  icon: any; label: string; value: string; sub?: string; color?: string; trend?: "up" | "down" | "neutral";
}) {
  return (
    <div style={{ background: CARD_BG, border: `1px solid ${BORDER}` }} className="rounded-xl p-5 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#8aa0c0" }}>{label}</span>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <div className="text-2xl font-bold" style={{ color }}>{value}</div>
      {sub && (
        <div className="flex items-center gap-1 text-xs" style={{ color: "#8aa0c0" }}>
          {trend === "up" && <TrendingUp className="w-3 h-3 text-green-400" />}
          {trend === "down" && <TrendingDown className="w-3 h-3 text-red-400" />}
          {sub}
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function SafesightPortal() {
  const [datePreset, setDatePreset] = useState<"last_7d" | "last_30d" | "last_90d" | "this_month" | "last_month">("last_30d");
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // ── Data queries ────────────────────────────────────────────────────────────
  const { data: accountsData, isLoading: loadingAccounts, error: accountsError } =
    trpc.facebookAds.getAdAccounts.useQuery();

  // Auto-select first account when data loads
  if (accountsData?.accounts?.length && !selectedAccount) {
    setSelectedAccount(accountsData.accounts[0].id);
  }

  const { data: spendData, isLoading: loadingSpend } =
    trpc.facebookAds.getSpendSummary.useQuery(
      { adAccountId: selectedAccount, datePreset },
      { enabled: !!selectedAccount }
    );

  const { data: campaignsData, isLoading: loadingCampaigns } =
    trpc.facebookAds.getCampaigns.useQuery(
      { adAccountId: selectedAccount, datePreset },
      { enabled: !!selectedAccount }
    );

  const { data: adsData, isLoading: loadingAds } =
    trpc.facebookAds.getAdPerformance.useQuery(
      { adAccountId: selectedAccount, datePreset },
      { enabled: !!selectedAccount }
    );

  const { data: audienceData, isLoading: loadingAudience } =
    trpc.facebookAds.getAudienceInsights.useQuery(
      { adAccountId: selectedAccount, datePreset: datePreset === "this_month" || datePreset === "last_month" ? "last_30d" : datePreset },
      { enabled: !!selectedAccount }
    );

  const analyzeAds = trpc.facebookAds.analyzeAdsWithAI.useMutation({
    onSuccess: (data: any) => {
      const content = data.analysis;
      setAiAnalysis(typeof content === "string" ? content : JSON.stringify(content));
      setIsAnalyzing(false);
      toast.success("AI analysis complete");
    },
    onError: (err) => {
      setIsAnalyzing(false);
      toast.error(err.message);
    },
  });

  const handleAnalyze = () => {
    if (!selectedAccount) return toast.error("Select an ad account first");
    setIsAnalyzing(true);
    setActiveTab("ai");
    analyzeAds.mutate({
      adAccountId: selectedAccount,
      datePreset: datePreset === "this_month" || datePreset === "last_month" ? "last_30d" : datePreset,
      businessContext: "Safesight Eye Clinic and LAISA Aesthetics — premium eye care and aesthetic treatments in Pretoria, South Africa",
    });
  };

  // ── Derived data ────────────────────────────────────────────────────────────
  const account = spendData?.account;
  const totalSpend = parseFloat(account?.amount_spent || "0") / 100;
  const dailyData = (spendData?.dailyBreakdown || []).map((d: any) => ({
    date: d.date_start?.slice(5) || "",
    spend: parseFloat(d.spend || 0),
    impressions: parseInt(d.impressions || 0),
    clicks: parseInt(d.clicks || 0),
    reach: parseInt(d.reach || 0),
  }));

  const totalImpressions = dailyData.reduce((s: number, d: any) => s + d.impressions, 0);
  const totalClicks = dailyData.reduce((s: number, d: any) => s + d.clicks, 0);
  const totalReach = dailyData.reduce((s: number, d: any) => s + d.reach, 0);
  const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

  // Age/gender chart data
  const ageGenderData = (audienceData?.ageGender || [])
    .filter((d: any) => d.gender === "female" || d.gender === "male")
    .reduce((acc: any[], d: any) => {
      const existing = acc.find(a => a.age === d.age);
      if (existing) {
        existing[d.gender] = parseFloat(d.spend || 0);
      } else {
        acc.push({ age: d.age, [d.gender]: parseFloat(d.spend || 0) });
      }
      return acc;
    }, []);

  // Device pie data
  const deviceData = (audienceData?.device || []).map((d: any) => ({
    name: d.device_platform || "Other",
    value: parseFloat(d.spend || 0),
  }));

  const PIE_COLORS = [TEAL, GOLD, "#6366f1", "#ec4899", "#f97316"];

  const isLoading = loadingAccounts || loadingSpend || loadingCampaigns || loadingAds;

  // ── Not connected state ─────────────────────────────────────────────────────
  if (accountsError || (!loadingAccounts && !accountsData?.accounts?.length)) {
    return (
      <div style={{ background: DARK, minHeight: "100vh" }} className="flex flex-col items-center justify-center p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-12">
          <Eye className="w-8 h-8" style={{ color: TEAL }} />
          <div>
            <div className="text-xl font-bold text-white">Safesight · LAISA</div>
            <div className="text-xs" style={{ color: TEAL }}>Digital Intelligence Portal</div>
          </div>
        </div>
        <div style={{ background: CARD_BG, border: `1px solid ${BORDER}` }} className="rounded-2xl p-8 max-w-md w-full text-center">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4" style={{ color: GOLD }} />
          <h2 className="text-xl font-bold text-white mb-2">Facebook Ads Not Connected</h2>
          <p className="text-sm mb-6" style={{ color: "#8aa0c0" }}>
            To view live ad performance, spend analysis, and AI recommendations, connect your Meta Business account in the Integrations page.
          </p>
          <a href="/integrations">
            <Button style={{ background: TEAL, color: "#000" }} className="w-full font-bold">
              Connect Meta / Facebook <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </a>
          <p className="text-xs mt-4" style={{ color: "#8aa0c0" }}>
            You'll need a Meta Business Manager access token and your Ad Account ID.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: DARK, minHeight: "100vh", color: "white" }}>
      {/* ── Top nav ─────────────────────────────────────────────────────────── */}
      <nav style={{ background: "#060f1e", borderBottom: `1px solid ${BORDER}` }} className="sticky top-0 z-50 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Eye className="w-6 h-6" style={{ color: TEAL }} />
          <div>
            <span className="font-bold text-white text-sm">Safesight · LAISA</span>
            <span className="text-xs ml-2" style={{ color: TEAL }}>Ads Intelligence Portal</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Account selector */}
          {accountsData?.accounts && accountsData.accounts.length > 1 && (
            <Select value={selectedAccount} onValueChange={setSelectedAccount}>
              <SelectTrigger className="w-48 text-xs h-8" style={{ background: CARD_BG, border: `1px solid ${BORDER}`, color: "white" }}>
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
                {accountsData.accounts.map((a: any) => (
                  <SelectItem key={a.id} value={a.id} className="text-white text-xs">{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {/* Date range */}
          <Select value={datePreset} onValueChange={(v: any) => setDatePreset(v)}>
            <SelectTrigger className="w-36 text-xs h-8" style={{ background: CARD_BG, border: `1px solid ${BORDER}`, color: "white" }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
              {[
                { value: "last_7d", label: "Last 7 days" },
                { value: "last_30d", label: "Last 30 days" },
                { value: "last_90d", label: "Last 90 days" },
                { value: "this_month", label: "This month" },
                { value: "last_month", label: "Last month" },
              ].map(o => (
                <SelectItem key={o.value} value={o.value} className="text-white text-xs">{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !selectedAccount}
            size="sm"
            style={{ background: isAnalyzing ? "#1a3a5c" : TEAL, color: "#000" }}
            className="font-bold text-xs h-8"
          >
            {isAnalyzing ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Brain className="w-3 h-3 mr-1" />}
            {isAnalyzing ? "Analysing..." : "AI Analysis"}
          </Button>
        </div>
      </nav>

      <div className="px-6 py-6 max-w-7xl mx-auto">
        {/* ── KPI strip ────────────────────────────────────────────────────── */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{ background: CARD_BG, border: `1px solid ${BORDER}` }} className="rounded-xl p-5 h-24 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard icon={DollarSign} label="Total Spend" value={fmtR(totalSpend)} sub={`${account?.currency || "ZAR"} · ${datePreset.replace("last_", "Last ").replace("d", " days")}`} color={GOLD} />
            <StatCard icon={Users} label="Total Reach" value={fmt(totalReach)} sub="Unique people reached" color={TEAL} trend="up" />
            <StatCard icon={Activity} label="Impressions" value={fmt(totalImpressions)} sub="Total ad views" color="#6366f1" />
            <StatCard icon={MousePointerClick} label="Avg CTR" value={pct(avgCtr)} sub={`${fmt(totalClicks)} total clicks`} color={avgCtr >= 1 ? "#22c55e" : avgCtr >= 0.5 ? GOLD : "#ef4444"} trend={avgCtr >= 1 ? "up" : "down"} />
          </div>
        )}

        {/* ── Tabs ─────────────────────────────────────────────────────────── */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList style={{ background: CARD_BG, border: `1px solid ${BORDER}` }} className="mb-6">
            {[
              { value: "overview", label: "Overview", icon: BarChart3 },
              { value: "campaigns", label: "Campaigns", icon: Megaphone },
              { value: "ads", label: "Ad Performance", icon: Target },
              { value: "audience", label: "Audience", icon: Users },
              { value: "ai", label: "AI Insights", icon: Brain },
            ].map(t => (
              <TabsTrigger key={t.value} value={t.value} className="text-xs data-[state=active]:text-white" style={{ color: "#8aa0c0" }}>
                <t.icon className="w-3 h-3 mr-1" />{t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ── Overview tab ─────────────────────────────────────────────── */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Daily spend chart */}
              <div style={{ background: CARD_BG, border: `1px solid ${BORDER}` }} className="rounded-xl p-5">
                <h3 className="text-sm font-semibold mb-4" style={{ color: TEAL }}>Daily Ad Spend (R)</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={dailyData}>
                    <defs>
                      <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={GOLD} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={GOLD} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
                    <XAxis dataKey="date" tick={{ fill: "#8aa0c0", fontSize: 10 }} />
                    <YAxis tick={{ fill: "#8aa0c0", fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: DARK, border: `1px solid ${BORDER}`, color: "white", fontSize: 12 }} />
                    <Area type="monotone" dataKey="spend" stroke={GOLD} fill="url(#spendGrad)" strokeWidth={2} name="Spend (R)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Daily reach + clicks */}
              <div style={{ background: CARD_BG, border: `1px solid ${BORDER}` }} className="rounded-xl p-5">
                <h3 className="text-sm font-semibold mb-4" style={{ color: TEAL }}>Daily Reach vs Clicks</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
                    <XAxis dataKey="date" tick={{ fill: "#8aa0c0", fontSize: 10 }} />
                    <YAxis tick={{ fill: "#8aa0c0", fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: DARK, border: `1px solid ${BORDER}`, color: "white", fontSize: 12 }} />
                    <Bar dataKey="reach" fill={TEAL} name="Reach" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="clicks" fill={GOLD} name="Clicks" radius={[2, 2, 0, 0]} />
                    <Legend wrapperStyle={{ fontSize: 11, color: "#8aa0c0" }} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Spend by objective */}
            {spendData?.byObjective && spendData.byObjective.length > 0 && (
              <div style={{ background: CARD_BG, border: `1px solid ${BORDER}` }} className="rounded-xl p-5">
                <h3 className="text-sm font-semibold mb-4" style={{ color: TEAL }}>Spend by Campaign Objective</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {spendData.byObjective.map((o: any, i: number) => (
                    <div key={i} style={{ background: DARK, border: `1px solid ${BORDER}` }} className="rounded-lg p-3">
                      <div className="text-xs mb-1" style={{ color: "#8aa0c0" }}>{o.objective || "Unknown"}</div>
                      <div className="text-lg font-bold" style={{ color: GOLD }}>R{parseFloat(o.spend || 0).toFixed(2)}</div>
                      <div className="text-xs" style={{ color: "#8aa0c0" }}>{parseInt(o.impressions || 0).toLocaleString()} impr.</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* ── Campaigns tab ────────────────────────────────────────────── */}
          <TabsContent value="campaigns" className="space-y-4">
            {loadingCampaigns ? (
              <div className="text-center py-12" style={{ color: "#8aa0c0" }}>
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" style={{ color: TEAL }} />
                Loading campaigns...
              </div>
            ) : campaignsData?.campaigns?.length === 0 ? (
              <div className="text-center py-12" style={{ color: "#8aa0c0" }}>No campaigns found for this period.</div>
            ) : (
              <div className="space-y-3">
                {(campaignsData?.campaigns || []).map((c: any) => {
                  const ins = c.insights;
                  const spend = parseFloat(ins?.spend || 0);
                  const ctr = parseFloat(ins?.ctr || 0);
                  const status = c.status === "ACTIVE" ? "active" : c.status === "PAUSED" ? "paused" : "archived";
                  return (
                    <div key={c.id} style={{ background: CARD_BG, border: `1px solid ${BORDER}` }} className="rounded-xl p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="font-semibold text-white text-sm">{c.name}</div>
                          <div className="text-xs mt-1" style={{ color: "#8aa0c0" }}>{c.objective} · {c.id}</div>
                        </div>
                        <Badge style={{
                          background: status === "active" ? "rgba(34,197,94,0.15)" : status === "paused" ? "rgba(234,179,8,0.15)" : "rgba(107,114,128,0.15)",
                          color: status === "active" ? "#22c55e" : status === "paused" ? "#eab308" : "#9ca3af",
                          border: "none",
                        }}>
                          {c.status}
                        </Badge>
                      </div>
                      {ins && (
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                          {[
                            { label: "Spend", value: fmtR(spend) },
                            { label: "Reach", value: fmt(ins.reach) },
                            { label: "Impressions", value: fmt(ins.impressions) },
                            { label: "Clicks", value: fmt(ins.clicks) },
                            { label: "CTR", value: pct(ctr) },
                            { label: "CPM", value: fmtR(ins.cpm) },
                          ].map((m, i) => (
                            <div key={i} className="text-center">
                              <div className="text-xs mb-1" style={{ color: "#8aa0c0" }}>{m.label}</div>
                              <div className="text-sm font-bold" style={{ color: i === 0 ? GOLD : TEAL }}>{m.value}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* ── Ad Performance tab ───────────────────────────────────────── */}
          <TabsContent value="ads" className="space-y-6">
            {loadingAds ? (
              <div className="text-center py-12" style={{ color: "#8aa0c0" }}>
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" style={{ color: TEAL }} />
                Loading ad performance...
              </div>
            ) : (
              <>
                {adsData?.performing && adsData.performing.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: "#22c55e" }}>
                      <CheckCircle2 className="w-4 h-4" /> Top Performing Ads
                    </h3>
                    <div className="space-y-2">
                      {adsData.performing.map((ad: any) => (
                        <AdRow key={ad.ad_id} ad={ad} color="#22c55e" />
                      ))}
                    </div>
                  </div>
                )}
                {adsData?.underperforming && adsData.underperforming.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: "#ef4444" }}>
                      <AlertTriangle className="w-4 h-4" /> Underperforming Ads (Wasting Spend)
                    </h3>
                    <div className="space-y-2">
                      {adsData.underperforming.map((ad: any) => (
                        <AdRow key={ad.ad_id} ad={ad} color="#ef4444" />
                      ))}
                    </div>
                  </div>
                )}
                {adsData?.ads && adsData.ads.length === 0 && (
                  <div className="text-center py-12" style={{ color: "#8aa0c0" }}>No ad data found for this period.</div>
                )}
              </>
            )}
          </TabsContent>

          {/* ── Audience tab ─────────────────────────────────────────────── */}
          <TabsContent value="audience" className="space-y-6">
            {loadingAudience ? (
              <div className="text-center py-12" style={{ color: "#8aa0c0" }}>
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" style={{ color: TEAL }} />
                Loading audience data...
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Age/gender spend */}
                <div style={{ background: CARD_BG, border: `1px solid ${BORDER}` }} className="rounded-xl p-5">
                  <h3 className="text-sm font-semibold mb-4" style={{ color: TEAL }}>Spend by Age & Gender</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={ageGenderData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
                      <XAxis dataKey="age" tick={{ fill: "#8aa0c0", fontSize: 10 }} />
                      <YAxis tick={{ fill: "#8aa0c0", fontSize: 10 }} />
                      <Tooltip contentStyle={{ background: DARK, border: `1px solid ${BORDER}`, color: "white", fontSize: 12 }} />
                      <Bar dataKey="female" fill="#ec4899" name="Female" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="male" fill={TEAL} name="Male" radius={[2, 2, 0, 0]} />
                      <Legend wrapperStyle={{ fontSize: 11, color: "#8aa0c0" }} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Device breakdown */}
                <div style={{ background: CARD_BG, border: `1px solid ${BORDER}` }} className="rounded-xl p-5">
                  <h3 className="text-sm font-semibold mb-4" style={{ color: TEAL }}>Spend by Device</h3>
                  {deviceData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie data={deviceData} cx="50%" cy="50%" outerRadius={80} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                          {deviceData.map((_: any, i: number) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ background: DARK, border: `1px solid ${BORDER}`, color: "white", fontSize: 12 }} formatter={(v: any) => [`R${parseFloat(v).toFixed(2)}`, "Spend"]} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center py-12 text-sm" style={{ color: "#8aa0c0" }}>No device data available</div>
                  )}
                </div>

                {/* Top regions */}
                {audienceData?.region && audienceData.region.length > 0 && (
                  <div style={{ background: CARD_BG, border: `1px solid ${BORDER}` }} className="rounded-xl p-5 lg:col-span-2">
                    <h3 className="text-sm font-semibold mb-4" style={{ color: TEAL }}>Top Regions by Spend</h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {audienceData.region.slice(0, 10).map((r: any, i: number) => (
                        <div key={i} style={{ background: DARK, border: `1px solid ${BORDER}` }} className="rounded-lg p-3 text-center">
                          <div className="text-xs mb-1 truncate" style={{ color: "#8aa0c0" }}>{r.region || "Unknown"}</div>
                          <div className="text-sm font-bold" style={{ color: GOLD }}>R{parseFloat(r.spend || 0).toFixed(2)}</div>
                          <div className="text-xs" style={{ color: "#8aa0c0" }}>{parseInt(r.reach || 0).toLocaleString()} reach</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* ── AI Insights tab ───────────────────────────────────────────── */}
          <TabsContent value="ai" className="space-y-4">
            {isAnalyzing ? (
              <div className="text-center py-16">
                <Brain className="w-12 h-12 mx-auto mb-4 animate-pulse" style={{ color: TEAL }} />
                <div className="text-white font-semibold mb-2">AI is analysing your ad data...</div>
                <div className="text-sm" style={{ color: "#8aa0c0" }}>
                  Reviewing campaigns, spend efficiency, audience segments, and generating content recommendations.
                </div>
              </div>
            ) : aiAnalysis ? (
              <div style={{ background: CARD_BG, border: `1px solid ${BORDER}` }} className="rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="w-5 h-5" style={{ color: TEAL }} />
                  <h3 className="font-semibold text-white">AI Ad Intelligence Report</h3>
                  <Badge style={{ background: "rgba(10,191,188,0.15)", color: TEAL, border: "none" }} className="text-xs">
                    Live Data · {new Date().toLocaleDateString("en-ZA")}
                  </Badge>
                </div>
                <div className="prose prose-invert max-w-none text-sm" style={{ color: "#c8d8e8" }}>
                  <Streamdown>{aiAnalysis}</Streamdown>
                </div>
                <div className="mt-6 flex gap-3">
                  <Button
                    onClick={handleAnalyze}
                    size="sm"
                    style={{ background: TEAL, color: "#000" }}
                    className="font-bold text-xs"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" /> Re-analyse
                  </Button>
                  <a href="/content">
                    <Button size="sm" variant="outline" style={{ border: `1px solid ${BORDER}`, color: TEAL }} className="text-xs">
                      <Sparkles className="w-3 h-3 mr-1" /> Generate Content
                    </Button>
                  </a>
                </div>
              </div>
            ) : (
              <div style={{ background: CARD_BG, border: `1px solid ${BORDER}` }} className="rounded-xl p-10 text-center">
                <Brain className="w-12 h-12 mx-auto mb-4" style={{ color: TEAL }} />
                <h3 className="text-lg font-bold text-white mb-2">AI Ads Intelligence</h3>
                <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: "#8aa0c0" }}>
                  Click "AI Analysis" to get a full breakdown of your ad spend efficiency, wasted budget, audience insights, and 5 specific organic content pieces that can replace your underperforming ads.
                </p>
                <Button
                  onClick={handleAnalyze}
                  disabled={!selectedAccount}
                  style={{ background: TEAL, color: "#000" }}
                  className="font-bold"
                >
                  <Brain className="w-4 h-4 mr-2" /> Run AI Analysis
                </Button>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                  {[
                    { icon: DollarSign, title: "Spend Efficiency", desc: "Identifies wasted budget and recommends reallocation" },
                    { icon: Target, title: "Content Recommendations", desc: "5 specific posts to replace underperforming ads organically" },
                    { icon: TrendingUp, title: "30-Day Action Plan", desc: "Week-by-week steps to reduce spend while growing results" },
                  ].map((f, i) => (
                    <div key={i} style={{ background: DARK, border: `1px solid ${BORDER}` }} className="rounded-lg p-4">
                      <f.icon className="w-5 h-5 mb-2" style={{ color: TEAL }} />
                      <div className="text-sm font-semibold text-white mb-1">{f.title}</div>
                      <div className="text-xs" style={{ color: "#8aa0c0" }}>{f.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer style={{ borderTop: `1px solid ${BORDER}` }} className="mt-12 px-6 py-4 flex items-center justify-between">
        <div className="text-xs" style={{ color: "#8aa0c0" }}>
          Powered by <span style={{ color: TEAL }}>StudEx Digital Intelligence</span> · Data sourced live from Meta Graph API
        </div>
        <div className="flex items-center gap-4">
          <a href="/content" className="text-xs flex items-center gap-1 hover:opacity-80" style={{ color: TEAL }}>
            <Sparkles className="w-3 h-3" /> Content Studio
          </a>
          <a href="/higgsfield" className="text-xs flex items-center gap-1 hover:opacity-80" style={{ color: TEAL }}>
            <Zap className="w-3 h-3" /> Video Studio
          </a>
          <a href="/integrations" className="text-xs flex items-center gap-1 hover:opacity-80" style={{ color: TEAL }}>
            <ExternalLink className="w-3 h-3" /> Integrations
          </a>
        </div>
      </footer>
    </div>
  );
}

// ─── Ad row component ─────────────────────────────────────────────────────────
function AdRow({ ad, color }: { ad: any; color: string }) {
  return (
    <div style={{ background: CARD_BG, border: `1px solid ${BORDER}` }} className="rounded-lg p-4">
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="text-sm font-semibold text-white">{ad.ad_name || "Unnamed Ad"}</div>
          <div className="text-xs" style={{ color: "#8aa0c0" }}>{ad.campaign_name} · {ad.adset_name}</div>
        </div>
        <Badge style={{ background: `${color}20`, color, border: "none" }} className="text-xs">
          Score {ad.performanceScore}/100
        </Badge>
      </div>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-3">
        {[
          { label: "Spend", value: fmtR(ad.spend) },
          { label: "Reach", value: fmt(ad.reach) },
          { label: "Impressions", value: fmt(ad.impressions) },
          { label: "Clicks", value: fmt(ad.clicks) },
          { label: "CTR", value: pct(ad.ctr) },
          { label: "CPM", value: fmtR(ad.cpm) },
        ].map((m, i) => (
          <div key={i} className="text-center">
            <div className="text-xs mb-1" style={{ color: "#8aa0c0" }}>{m.label}</div>
            <div className="text-xs font-bold" style={{ color: i === 0 ? GOLD : "white" }}>{m.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
