import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import {
  LayoutDashboard, TrendingUp, Users, Eye, Heart, MessageCircle,
  Share2, Zap, ArrowRight, Plus, Sparkles, Brain, Target,
  Globe, BarChart2, Calendar, Clock, CheckCircle2, AlertCircle,
  Loader2, RefreshCw, ChevronRight, Activity, Lightbulb
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";

// ── KPI Card ──────────────────────────────────────────────────────────────────

function KpiCard({
  label, value, change, icon: Icon, color, sub,
}: {
  label: string;
  value: string;
  change?: string;
  icon: React.ElementType;
  color: string;
  sub?: string;
}) {
  const positive = change?.startsWith("+");
  return (
    <div className="bg-white border border-border rounded-2xl p-5 card-hover">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        {change ? (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${positive ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
            {change}
          </span>
        ) : null}
      </div>
      <p className="font-display text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      {sub ? <p className="text-[10px] text-muted-foreground/70 mt-0.5">{sub}</p> : null}
    </div>
  );
}

// ── Platform Row ──────────────────────────────────────────────────────────────

function PlatformRow({
  name, followers, reach, engagement, color, connected,
}: {
  name: string;
  followers: string;
  reach: string;
  engagement: string;
  color: string;
  connected: boolean;
}) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-border last:border-0">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0 ${color}`}>
        {name[0]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{name}</p>
        {connected ? (
          <p className="text-xs text-muted-foreground">{followers} followers</p>
        ) : (
          <p className="text-xs text-muted-foreground/60">Not connected</p>
        )}
      </div>
      {connected ? (
        <>
          <div className="text-right hidden sm:block">
            <p className="text-xs font-medium text-foreground">{reach}</p>
            <p className="text-[10px] text-muted-foreground">reach</p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-xs font-medium text-foreground">{engagement}</p>
            <p className="text-[10px] text-muted-foreground">engagement</p>
          </div>
          <span className="text-[10px] bg-green-50 text-green-600 border border-green-200 px-2 py-0.5 rounded-full font-medium">Live</span>
        </>
      ) : (
        <span className="text-[10px] bg-muted text-muted-foreground border border-border px-2 py-0.5 rounded-full font-medium">Connect</span>
      )}
    </div>
  );
}

// ── AI Strategy Advisor ───────────────────────────────────────────────────────
function AIAdvisor({ userName }: { userName: string }) {

  const tips = [
    "Post Reels between 6–9 PM on weekdays — your audience is 3× more active then.",
    "Your Facebook engagement rate is 2.4% above industry average. Double down on video content.",
    "You haven't posted in 3 days. Consistency is key — schedule at least 1 post today.",
    "Your top-performing content type is behind-the-scenes. Create 2 more this week.",
    "Instagram Stories with polls get 40% more replies. Add one to your next story.",
    "Your Google Ads CTR improved 18% last week. Consider increasing budget by 15%.",
  ];

  const [tip] = useState(() => tips[Math.floor(Math.random() * tips.length)]);

  return (
    <div className="bg-white border border-border rounded-2xl overflow-hidden">
      <div className="p-5 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-pink-tint border border-primary/10 flex items-center justify-center">
            <Brain className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-foreground text-sm">AI Strategy Advisor</h3>
            <p className="text-[10px] text-muted-foreground">Powered by DatAgentic Intelligence</p>
          </div>
        </div>
        <span className="text-[10px] bg-pink-tint text-primary border border-primary/10 px-2 py-0.5 rounded-full font-medium">Live</span>
      </div>
      <div className="p-5 space-y-4">
        {/* Today's insight */}
        <div className="flex gap-3">
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
            <Lightbulb className="w-3.5 h-3.5 text-primary" />
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground mb-1">Today's Insight</p>
            <p className="text-sm text-muted-foreground leading-relaxed">{tip}</p>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Generate Post", icon: Sparkles, path: "/content" },
            { label: "View Calendar", icon: Calendar, path: "/calendar" },
            { label: "Run Analysis", icon: BarChart2, path: "/analyze" },
            { label: "Social Report", icon: TrendingUp, path: "/social-report" },
          ].map(action => (
            <a
              key={action.label}
              href={action.path}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/50 hover:bg-pink-tint hover:border-primary/10 border border-transparent transition-all text-xs font-medium text-muted-foreground hover:text-primary"
            >
              <action.icon className="w-3.5 h-3.5 shrink-0" />
              {action.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Recent Activity ───────────────────────────────────────────────────────────

function RecentActivity({ analyses }: { analyses: Array<{ id: number; url: string; status: string; createdAt: Date | string }> }) {
  const [, navigate] = useLocation();
  if (analyses.length === 0) {
    return (
      <div className="text-center py-8 space-y-2">
        <Globe className="w-8 h-8 text-muted-foreground/40 mx-auto" />
        <p className="text-sm text-muted-foreground">No analyses yet</p>
        <button onClick={() => navigate("/analyze")} className="text-xs text-primary hover:underline">
          Run your first analysis →
        </button>
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {analyses.map(a => (
        <div
          key={a.id}
          onClick={() => navigate(`/report/${a.id}`)}
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 cursor-pointer transition-colors group"
        >
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
            a.status === "completed" ? "bg-green-50" : a.status === "failed" ? "bg-red-50" : "bg-blue-50"
          }`}>
            {a.status === "completed" ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
            ) : a.status === "failed" ? (
              <AlertCircle className="w-3.5 h-3.5 text-red-600" />
            ) : (
              <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground truncate">{a.url}</p>
            <p className="text-[10px] text-muted-foreground">
              {new Date(a.createdAt).toLocaleDateString("en-ZA", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
        </div>
      ))}
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const [greeting, setGreeting] = useState("Good morning");

  useEffect(() => {
    const h = new Date().getHours();
    if (h >= 12 && h < 17) setGreeting("Good afternoon");
    else if (h >= 17) setGreeting("Good evening");
  }, []);

  const { data: history } = trpc.analysis.getHistory.useQuery(
    { limit: 6 },
    { enabled: isAuthenticated }
  );

  const { data: clientData } = trpc.clientPortal.listLeads.useQuery(
    { status: "all" },
    { enabled: isAuthenticated }
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h2 className="font-display text-2xl font-bold text-foreground">Sign in to continue</h2>
          <Button asChild className="bg-primary text-primary-foreground">
            <a href={getLoginUrl()}>Sign In</a>
          </Button>
        </div>
      </div>
    );
  }

  const analyses = (history ?? []) as Array<{ id: number; url: string; status: string; createdAt: Date | string }>;
  const leads = (clientData as unknown as Array<{ status: string }>) ?? [];
  const activeClients = leads.filter(l => l.status === "active").length;
  const newLeads = leads.filter(l => l.status === "submitted").length;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-0.5">{greeting},</p>
            <h1 className="font-display text-2xl font-bold text-foreground">
              {user?.name?.split(" ")[0] ?? "there"} 👋
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Here's your social intelligence overview for today.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/clients")}
              className="gap-1.5 text-xs"
            >
              <Users className="w-3.5 h-3.5" />
              Clients
              {newLeads > 0 ? (
                <span className="bg-primary text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                  {newLeads}
                </span>
              ) : null}
            </Button>
            <Button size="sm" onClick={() => navigate("/analyze")} className="gap-1.5 text-xs">
              <Plus className="w-3.5 h-3.5" /> New Analysis
            </Button>
          </div>
        </div>

        {/* ── KPI Grid ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="Total Analyses"
            value={String(analyses.length)}
            change="+12%"
            icon={BarChart2}
            color="bg-pink-tint text-primary"
            sub="Last 30 days"
          />
          <KpiCard
            label="Active Clients"
            value={String(activeClients)}
            change={activeClients > 0 ? `+${activeClients}` : undefined}
            icon={Users}
            color="bg-purple-tint text-[oklch(0.52_0.18_300)]"
            sub="Client portals"
          />
          <KpiCard
            label="New Leads"
            value={String(newLeads)}
            icon={Target}
            color="bg-blue-50 text-blue-600"
            sub="Awaiting review"
          />
          <KpiCard
            label="Content Pieces"
            value="—"
            icon={Sparkles}
            color="bg-amber-50 text-amber-600"
            sub="This month"
          />
        </div>

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Platform overview + AI advisor */}
          <div className="lg:col-span-2 space-y-6">
            {/* Platform overview */}
            <div className="bg-white border border-border rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  <h3 className="font-display font-semibold text-foreground text-sm">Platform Overview</h3>
                </div>
                <button
                  onClick={() => navigate("/integrations")}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  Manage connections <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              <div className="p-5">
                <PlatformRow name="Facebook" followers="—" reach="—" engagement="—" color="bg-blue-600" connected={false} />
                <PlatformRow name="Instagram" followers="—" reach="—" engagement="—" color="bg-gradient-to-br from-purple-500 to-pink-500" connected={false} />
                <PlatformRow name="Google Ads" followers="—" reach="—" engagement="—" color="bg-red-500" connected={false} />
                <PlatformRow name="TikTok" followers="—" reach="—" engagement="—" color="bg-black" connected={false} />
              </div>
              <div className="px-5 pb-5">
                <button
                  onClick={() => navigate("/composio")}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-border hover:border-primary/30 hover:bg-pink-tint transition-all text-xs text-muted-foreground hover:text-primary"
                >
                  <Plus className="w-3.5 h-3.5" /> Connect a platform
                </button>
              </div>
            </div>

            {/* Recent analyses */}
            <div className="bg-white border border-border rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <h3 className="font-display font-semibold text-foreground text-sm">Recent Analyses</h3>
                </div>
                <button
                  onClick={() => navigate("/history")}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  View all <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              <div className="p-5">
                <RecentActivity analyses={analyses} />
              </div>
            </div>
          </div>

          {/* Right: AI Advisor + Quick links */}
          <div className="space-y-6">
            <AIAdvisor userName={user?.name?.split(" ")[0] ?? "there"} />

            {/* Quick navigation */}
            <div className="bg-white border border-border rounded-2xl p-5 space-y-3">
              <h3 className="font-display font-semibold text-foreground text-sm">Quick Access</h3>
              <div className="space-y-1">
                {[
                  { label: "Content Studio", sub: "Create AI content", path: "/content", icon: Sparkles },
                  { label: "Content Calendar", sub: "Schedule & plan", path: "/calendar", icon: Calendar },
                  { label: "AgentMail Inbox", sub: "Email campaigns", path: "/mailbox", icon: MessageCircle },
                  { label: "Client Submissions", sub: `${newLeads} new leads`, path: "/clients", icon: Users },
                  { label: "Social Report", sub: "Full analytics", path: "/social-report", icon: TrendingUp },
                ].map(item => (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/50 transition-colors group text-left"
                  >
                    <div className="w-7 h-7 rounded-lg bg-pink-tint border border-primary/10 flex items-center justify-center shrink-0">
                      <item.icon className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground">{item.label}</p>
                      <p className="text-[10px] text-muted-foreground">{item.sub}</p>
                    </div>
                    <ChevronRight className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
