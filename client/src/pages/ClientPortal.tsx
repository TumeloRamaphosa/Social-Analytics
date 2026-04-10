/**
 * ClientPortal.tsx
 * White-Label Multi-Tenant Management — StudEx Admin View + Client Portal Demo
 *
 * Shows:
 * 1. Admin view: all tenants, create new, manage branding
 * 2. Client portal preview: what a client sees in their branded instance
 */
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Building2, Users, TrendingUp, Zap, Plus, Eye, Palette, Crown,
  BarChart2, Brain, Film, Sparkles, Globe, CheckCircle2, Star,
  ArrowRight, Activity, Target, MessageSquare, RefreshCw
} from "lucide-react";

// ─── PLAN COLOURS ─────────────────────────────────────────────────────────────
const PLAN_STYLES: Record<string, { badge: string; label: string; price: string }> = {
  starter: { badge: "bg-blue-500/20 text-blue-400 border-blue-500/30", label: "Starter", price: "R2,500/mo" },
  pro:     { badge: "bg-purple-500/20 text-purple-400 border-purple-500/30", label: "Growth", price: "R5,500/mo" },
  agency:  { badge: "bg-amber-500/20 text-amber-400 border-amber-500/30", label: "Command Centre", price: "R9,500/mo" },
};

// ─── DEMO METRICS PER TENANT ──────────────────────────────────────────────────
const DEMO_DATA: Record<string, {
  industry: string; location: string; description: string;
  followers: number; reach: number; engagement: number; posts: number; videos: number;
  recentPosts: { text: string; likes: number; comments: number; platform: string }[];
}> = {
  "kasi-eats": {
    industry: "Food & Beverage", location: "Soweto, Johannesburg",
    description: "Township food delivery platform connecting local restaurants to customers",
    followers: 12400, reach: 89000, engagement: 4.7, posts: 34, videos: 8,
    recentPosts: [
      { text: "🍖 Braai special this weekend! Order now and get 15% off...", likes: 342, comments: 67, platform: "Facebook" },
      { text: "Meet Mama Thandi — the heart behind our best-selling umngqusho...", likes: 891, comments: 134, platform: "Instagram" },
      { text: "We're now delivering to Diepkloof! 🚀 Same-day delivery available...", likes: 156, comments: 23, platform: "Facebook" },
    ],
  },
  "ubuntu-fintech": {
    industry: "Financial Services", location: "Cape Town, South Africa",
    description: "Mobile-first savings and investment platform for the African market",
    followers: 28700, reach: 210000, engagement: 3.2, posts: 67, videos: 22,
    recentPosts: [
      { text: "💰 Did you know? Saving R50/day for 10 years = R182,500 + interest...", likes: 1204, comments: 289, platform: "Facebook" },
      { text: "Our new Stokvels feature is live! Group savings made digital...", likes: 2341, comments: 445, platform: "Instagram" },
      { text: "Financial freedom starts with one step. Here's how Ubuntu helped Sipho...", likes: 876, comments: 167, platform: "Facebook" },
    ],
  },
  "naledi-fashion": {
    industry: "Fashion & Retail", location: "Durban, South Africa",
    description: "Contemporary African fashion brand celebrating heritage through design",
    followers: 5600, reach: 31000, engagement: 6.1, posts: 18, videos: 3,
    recentPosts: [
      { text: "✨ The Zulu Heritage Collection is here. Wearable art for the modern African...", likes: 567, comments: 89, platform: "Instagram" },
      { text: "Behind the seams: watch how our artisans hand-stitch each piece...", likes: 234, comments: 45, platform: "Facebook" },
      { text: "New drop: Ndebele-inspired prints in bold summer colours 🌈", likes: 892, comments: 134, platform: "Instagram" },
    ],
  },
};

// ─── CLIENT PORTAL PREVIEW ────────────────────────────────────────────────────
function ClientPortalPreview({ tenant }: { tenant: { name: string; slug: string; plan: string; brandColor: string | null } }) {
  const color = tenant.brandColor || "#2563eb";
  const data = DEMO_DATA[tenant.slug];
  const planStyle = PLAN_STYLES[tenant.plan];
  const metricsQuery = trpc.tenants.getDemoMetrics.useQuery({ slug: tenant.slug });
  const metrics = metricsQuery.data;

  const features = {
    starter: ["Analytics", "Content Studio", "AI Posts"],
    pro: ["Analytics", "Content Studio", "AI Posts", "Higgsfield Video", "Calendar", "WhatsApp"],
    agency: ["Analytics", "Content Studio", "AI Posts", "Higgsfield Video", "Calendar", "WhatsApp", "Super Brain", "AI Agents", "CRM"],
  }[tenant.plan] || [];

  return (
    <div className="rounded-xl border border-border overflow-hidden bg-background">
      {/* Client portal header — branded with their colour */}
      <div
        className="px-6 py-4 flex items-center justify-between"
        style={{ background: `linear-gradient(135deg, ${color}22, ${color}11)`, borderBottom: `2px solid ${color}44` }}
      >
        <div className="flex items-center gap-3">
          <div
            className="h-9 w-9 rounded-lg flex items-center justify-center text-white font-bold text-sm"
            style={{ background: color }}
          >
            {tenant.name.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-sm">{tenant.name}</p>
            <p className="text-xs text-muted-foreground">Powered by Nexus Social</p>
          </div>
        </div>
        <Badge className={`text-xs border ${planStyle.badge}`}>{planStyle.label}</Badge>
      </div>

      {/* Client dashboard body */}
      <div className="p-4 space-y-4">
        {/* KPI row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Followers", value: metrics ? metrics.followers.toLocaleString() : "...", icon: Users, color: "#3b82f6" },
            { label: "Monthly Reach", value: metrics ? metrics.monthlyReach.toLocaleString() : "...", icon: Globe, color },
            { label: "Engagement", value: metrics ? `${metrics.engagementRate}%` : "...", icon: TrendingUp, color: "#10b981" },
            { label: "AI Posts", value: metrics ? metrics.contentPosts.toString() : "...", icon: Sparkles, color: "#8b5cf6" },
          ].map(kpi => (
            <div key={kpi.label} className="rounded-lg border border-border bg-card p-3">
              <div className="flex items-center gap-2 mb-1">
                <kpi.icon className="h-3.5 w-3.5" style={{ color: kpi.color }} />
                <span className="text-xs text-muted-foreground">{kpi.label}</span>
              </div>
              <p className="text-lg font-semibold">{kpi.value}</p>
            </div>
          ))}
        </div>

        {/* Recent posts */}
        {data && (
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm font-medium mb-3 flex items-center gap-2">
              <Activity className="h-4 w-4" style={{ color }} />
              Recent AI-Generated Posts
            </p>
            <div className="space-y-2">
              {data.recentPosts.map((post, i) => (
                <div key={i} className="flex items-start gap-3 p-2 rounded-lg bg-muted/30">
                  <div
                    className="h-6 w-6 rounded-full flex items-center justify-center text-white text-xs shrink-0 mt-0.5"
                    style={{ background: color }}
                  >
                    {post.platform === "Instagram" ? "IG" : "FB"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground truncate">{post.text}</p>
                    <div className="flex gap-3 mt-1">
                      <span className="text-xs text-muted-foreground">❤️ {post.likes.toLocaleString()}</span>
                      <span className="text-xs text-muted-foreground">💬 {post.comments}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Available features */}
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm font-medium mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            Active Features ({planStyle.label} Plan)
          </p>
          <div className="flex flex-wrap gap-2">
            {features.map(f => (
              <Badge key={f} variant="secondary" className="text-xs">{f}</Badge>
            ))}
          </div>
        </div>

        {/* Industry info */}
        {data && (
          <div className="text-xs text-muted-foreground bg-muted/30 rounded-lg p-3">
            <span className="font-medium text-foreground">{data.industry}</span> · {data.location} · {data.description}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── CREATE TENANT FORM ───────────────────────────────────────────────────────
function CreateTenantDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", plan: "starter", brandColor: "#2563eb" });

  const createMutation = trpc.tenants.create.useMutation({
    onSuccess: () => {
      toast.success("Client workspace created successfully");
      setOpen(false);
      onCreated();
    },
    onError: (e) => toast.error(e.message),
  });

  const handleNameChange = (name: string) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    setForm(f => ({ ...f, name, slug }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          New Client Workspace
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Client Workspace</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Client / Company Name</Label>
            <Input
              placeholder="e.g. Kasi Eats"
              value={form.name}
              onChange={e => handleNameChange(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Workspace Slug (URL identifier)</Label>
            <Input
              placeholder="e.g. kasi-eats"
              value={form.slug}
              onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") }))}
            />
            <p className="text-xs text-muted-foreground">Only lowercase letters, numbers, and hyphens</p>
          </div>
          <div className="space-y-2">
            <Label>Subscription Plan</Label>
            <Select value={form.plan} onValueChange={v => setForm(f => ({ ...f, plan: v }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="starter">Starter — R2,500/month</SelectItem>
                <SelectItem value="pro">Growth — R5,500/month</SelectItem>
                <SelectItem value="agency">Command Centre — R9,500/month</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Brand Colour</Label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={form.brandColor}
                onChange={e => setForm(f => ({ ...f, brandColor: e.target.value }))}
                className="h-10 w-16 rounded-md border border-border cursor-pointer bg-transparent"
              />
              <Input
                value={form.brandColor}
                onChange={e => setForm(f => ({ ...f, brandColor: e.target.value }))}
                className="font-mono text-sm"
                maxLength={7}
              />
              <div
                className="h-10 w-10 rounded-lg border border-border shrink-0"
                style={{ background: form.brandColor }}
              />
            </div>
          </div>
          <Button
            className="w-full"
            onClick={() => createMutation.mutate({
              name: form.name,
              slug: form.slug,
              plan: form.plan as "starter" | "pro" | "agency",
              brandColor: form.brandColor,
              isWhiteLabel: true,
            })}
            disabled={!form.name || !form.slug || createMutation.isPending}
          >
            {createMutation.isPending ? "Creating..." : "Create Workspace"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function ClientPortal() {
  const [selectedTenant, setSelectedTenant] = useState<string | null>(null);
  const utils = trpc.useUtils();

  const tenantsQuery = trpc.tenants.list.useQuery();
  const seedMutation = trpc.tenants.seedDemo.useMutation({
    onSuccess: (data) => {
      toast.success(`Seeded ${data.created} demo client workspaces`);
      utils.tenants.list.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.tenants.delete.useMutation({
    onSuccess: () => {
      toast.success("Workspace deleted");
      setSelectedTenant(null);
      utils.tenants.list.invalidate();
    },
  });

  const tenants = tenantsQuery.data ?? [];
  const selected = tenants.find(t => t.slug === selectedTenant);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Building2 className="h-6 w-6 text-primary" />
              Client Portals
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage white-label workspaces for your clients — each with their own branding and data
            </p>
          </div>
          <div className="flex items-center gap-2">
            {tenants.length === 0 && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => seedMutation.mutate()}
                disabled={seedMutation.isPending}
              >
                <RefreshCw className={`h-4 w-4 ${seedMutation.isPending ? "animate-spin" : ""}`} />
                Load Demo Clients
              </Button>
            )}
            <CreateTenantDialog onCreated={() => utils.tenants.list.invalidate()} />
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Clients", value: tenants.length, icon: Building2, color: "text-blue-400" },
            { label: "Starter", value: tenants.filter(t => t.plan === "starter").length, icon: Star, color: "text-blue-400" },
            { label: "Growth", value: tenants.filter(t => t.plan === "pro").length, icon: TrendingUp, color: "text-purple-400" },
            { label: "Command Centre", value: tenants.filter(t => t.plan === "agency").length, icon: Crown, color: "text-amber-400" },
          ].map(stat => (
            <Card key={stat.label} className="border-border/50">
              <CardContent className="p-4 flex items-center gap-3">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="clients">
          <TabsList>
            <TabsTrigger value="clients">Client Workspaces</TabsTrigger>
            <TabsTrigger value="preview">Portal Preview</TabsTrigger>
            <TabsTrigger value="plans">Plan Comparison</TabsTrigger>
          </TabsList>

          {/* ── CLIENT LIST TAB ─────────────────────────────────────────────── */}
          <TabsContent value="clients" className="space-y-4 mt-4">
            {tenantsQuery.isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-48 rounded-xl bg-muted/30 animate-pulse" />
                ))}
              </div>
            ) : tenants.length === 0 ? (
              <Card className="border-dashed border-2 border-border/50">
                <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
                  <Building2 className="h-12 w-12 text-muted-foreground/40" />
                  <div className="text-center">
                    <p className="font-medium">No client workspaces yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Load the demo clients to see how the platform looks, or create your first real client workspace.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => seedMutation.mutate()} disabled={seedMutation.isPending}>
                      {seedMutation.isPending ? "Loading..." : "Load Demo Clients"}
                    </Button>
                    <CreateTenantDialog onCreated={() => utils.tenants.list.invalidate()} />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tenants.map(tenant => {
                  const planStyle = PLAN_STYLES[tenant.plan];
                  const color = tenant.brandColor || "#2563eb";
                  const demoData = DEMO_DATA[tenant.slug];
                  return (
                    <Card
                      key={tenant.id}
                      className={`border-border/50 cursor-pointer transition-all hover:border-primary/40 hover:shadow-md ${selectedTenant === tenant.slug ? "border-primary/60 shadow-md" : ""}`}
                      onClick={() => setSelectedTenant(tenant.slug)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold"
                              style={{ background: color }}
                            >
                              {tenant.name.charAt(0)}
                            </div>
                            <div>
                              <CardTitle className="text-base">{tenant.name}</CardTitle>
                              {demoData && (
                                <p className="text-xs text-muted-foreground">{demoData.industry}</p>
                              )}
                            </div>
                          </div>
                          <Badge className={`text-xs border ${planStyle.badge}`}>{planStyle.label}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0 space-y-3">
                        {demoData && (
                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="bg-muted/30 rounded-lg p-2">
                              <p className="text-sm font-semibold">{(demoData.followers / 1000).toFixed(1)}K</p>
                              <p className="text-xs text-muted-foreground">Followers</p>
                            </div>
                            <div className="bg-muted/30 rounded-lg p-2">
                              <p className="text-sm font-semibold">{demoData.engagement}%</p>
                              <p className="text-xs text-muted-foreground">Engagement</p>
                            </div>
                            <div className="bg-muted/30 rounded-lg p-2">
                              <p className="text-sm font-semibold">{demoData.posts}</p>
                              <p className="text-xs text-muted-foreground">AI Posts</p>
                            </div>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground font-mono">/{tenant.slug}</span>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-xs gap-1"
                              onClick={(e) => { e.stopPropagation(); setSelectedTenant(tenant.slug); }}
                            >
                              <Eye className="h-3 w-3" />
                              Preview
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* ── PORTAL PREVIEW TAB ──────────────────────────────────────────── */}
          <TabsContent value="preview" className="mt-4">
            {tenants.length === 0 ? (
              <Card className="border-dashed border-2 border-border/50">
                <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
                  <Eye className="h-12 w-12 text-muted-foreground/40" />
                  <p className="text-muted-foreground">Load demo clients first to preview the portal</p>
                  <Button variant="outline" onClick={() => seedMutation.mutate()} disabled={seedMutation.isPending}>
                    Load Demo Clients
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {/* Tenant selector */}
                <div className="flex items-center gap-3">
                  <Label className="text-sm whitespace-nowrap">Preview client:</Label>
                  <div className="flex gap-2 flex-wrap">
                    {tenants.map(t => (
                      <Button
                        key={t.slug}
                        size="sm"
                        variant={selectedTenant === t.slug ? "default" : "outline"}
                        className="gap-2 h-8"
                        onClick={() => setSelectedTenant(t.slug)}
                        style={selectedTenant === t.slug ? { background: t.brandColor || "#2563eb" } : {}}
                      >
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ background: t.brandColor || "#2563eb" }}
                        />
                        {t.name}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Portal preview */}
                {selected ? (
                  <ClientPortalPreview tenant={selected} />
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    Select a client above to preview their portal
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* ── PLAN COMPARISON TAB ─────────────────────────────────────────── */}
          <TabsContent value="plans" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  key: "starter", label: "Starter", price: "R2,500", usd: "$130",
                  color: "#3b82f6", description: "Perfect for small businesses getting started with social AI",
                  features: [
                    "Facebook & Instagram Analytics",
                    "AI Content Generation (50 posts/month)",
                    "Basic RAG Knowledge Search",
                    "Monthly Performance Report",
                    "Email Support",
                    "2 Team Members",
                  ],
                  missing: ["Higgsfield Video", "WhatsApp", "AI Agents", "CRM Integration"],
                },
                {
                  key: "pro", label: "Growth", price: "R5,500", usd: "$290",
                  color: "#8b5cf6", description: "For growing brands that want AI video and advanced analytics",
                  features: [
                    "Everything in Starter",
                    "Higgsfield AI Video Generation",
                    "Advanced Audience Demographics",
                    "Content Calendar & Scheduling",
                    "WhatsApp Business Integration",
                    "Weekly AI Performance Digest",
                    "Priority Support",
                    "5 Team Members",
                  ],
                  missing: ["AI Agents", "CRM Integration", "Virtual Influencers"],
                },
                {
                  key: "agency", label: "Command Centre", price: "R9,500", usd: "$500",
                  color: "#f59e0b", description: "The full platform — everything, for agencies and enterprises",
                  features: [
                    "Everything in Growth",
                    "Full RAG Super Brain (unlimited docs)",
                    "9 AI Agents (Research, SEO, Email, Social)",
                    "DenchClaw CRM Integration",
                    "Virtual Influencer Management",
                    "White-Label Client Portals",
                    "Custom Brand Voice Library",
                    "Meeting Transcript Storage",
                    "Dedicated Account Manager",
                    "20 Team Members",
                  ],
                  missing: [],
                },
              ].map(plan => (
                <Card
                  key={plan.key}
                  className={`border-border/50 relative ${plan.key === "agency" ? "border-amber-500/40 shadow-amber-500/10 shadow-lg" : ""}`}
                >
                  {plan.key === "agency" && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-amber-500 text-black text-xs px-3">Most Popular</Badge>
                    </div>
                  )}
                  <CardHeader>
                    <div
                      className="h-10 w-10 rounded-lg flex items-center justify-center mb-2"
                      style={{ background: `${plan.color}22`, border: `1px solid ${plan.color}44` }}
                    >
                      {plan.key === "starter" ? <Star className="h-5 w-5" style={{ color: plan.color }} /> :
                       plan.key === "pro" ? <Zap className="h-5 w-5" style={{ color: plan.color }} /> :
                       <Crown className="h-5 w-5" style={{ color: plan.color }} />}
                    </div>
                    <CardTitle className="text-lg">{plan.label}</CardTitle>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold">{plan.price}</span>
                      <span className="text-sm text-muted-foreground">/month</span>
                      <span className="text-xs text-muted-foreground">({plan.usd})</span>
                    </div>
                    <CardDescription className="text-xs">{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-1.5">
                      {plan.features.map(f => (
                        <div key={f} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                    {plan.missing.length > 0 && (
                      <div className="pt-2 border-t border-border/50 space-y-1.5">
                        {plan.missing.map(f => (
                          <div key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="h-3.5 w-3.5 rounded-full border border-muted-foreground/30 shrink-0" />
                            <span>{f}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <Button
                      className="w-full mt-4 gap-2"
                      style={{ background: plan.color }}
                      onClick={() => toast.info(`Create a new client workspace and select ${plan.label} plan`)}
                    >
                      Create {plan.label} Client
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Competitor comparison note */}
            <Card className="mt-4 border-border/50 bg-muted/20">
              <CardContent className="p-4">
                <p className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  How This Compares to International Platforms
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  {[
                    { name: "HubSpot Professional", price: "R15,200/mo", gap: "3x more expensive" },
                    { name: "GoHighLevel SaaS Pro", price: "R9,943/mo", gap: "Similar price, fewer features" },
                    { name: "Sprout Social Advanced", price: "R9,120/mo", gap: "No AI agents or RAG" },
                    { name: "Hootsuite Enterprise", price: "R11,400/mo", gap: "No video generation" },
                  ].map(comp => (
                    <div key={comp.name} className="bg-background rounded-lg p-3 border border-border/50">
                      <p className="font-medium text-foreground">{comp.name}</p>
                      <p className="text-muted-foreground mt-1">{comp.price}</p>
                      <p className="text-amber-500 mt-1">{comp.gap}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
