import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Check, X, Zap, Star, Building2, Crown,
  BarChart2, Bot, Share2, Users, Globe, Shield,
  Sparkles, TrendingUp, FileText, Layers, ChevronDown, ChevronUp
} from "lucide-react";
import { useState as useExpandState } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface PlanTier {
  id: string;
  name: string;
  tagline: string;
  monthlyPrice: number;
  annualPrice: number;
  icon: React.ElementType;
  color: string;
  glowColor: string;
  badge?: string;
  accounts: string;
  features: string[];
  limits: {
    socialAccounts: number | "Unlimited";
    postsPerMonth: number | "Unlimited";
    aiGenerations: number | "Unlimited";
    teamMembers: number | "Unlimited";
    clientPortals: number | "Unlimited";
    analyticsHistory: string;
  };
}

// ── Plan Data ─────────────────────────────────────────────────────────────────
const PLANS: PlanTier[] = [
  {
    id: "starter",
    name: "Starter",
    tagline: "For solo creators and small businesses",
    monthlyPrice: 999,
    annualPrice: 799,
    icon: Zap,
    color: "from-zinc-700 to-zinc-800",
    glowColor: "#71717a",
    accounts: "1 social account",
    features: [
      "1 connected social account",
      "Facebook or Instagram analytics",
      "30-day analytics history",
      "AI content generation (50/mo)",
      "Content calendar (basic)",
      "Manual post scheduling",
      "PDF reports (monthly)",
      "Email support",
    ],
    limits: {
      socialAccounts: 1,
      postsPerMonth: 30,
      aiGenerations: 50,
      teamMembers: 1,
      clientPortals: 0,
      analyticsHistory: "30 days",
    },
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "For growing brands and agencies",
    monthlyPrice: 2499,
    annualPrice: 1999,
    icon: Star,
    color: "from-pink-900/60 to-purple-900/60",
    glowColor: "#ec4899",
    badge: "Most Popular",
    accounts: "Up to 5 social accounts",
    features: [
      "5 connected social accounts",
      "Facebook, Instagram & Google Ads",
      "90-day analytics history",
      "AI content generation (500/mo)",
      "Drag-and-drop content calendar",
      "Multi-platform auto-publishing",
      "Composio integrations (Gmail, Discord, Slack)",
      "1 white-label client portal",
      "Weekly AI strategy reports",
      "Priority email support",
    ],
    limits: {
      socialAccounts: 5,
      postsPerMonth: 200,
      aiGenerations: 500,
      teamMembers: 3,
      clientPortals: 1,
      analyticsHistory: "90 days",
    },
  },
  {
    id: "agency",
    name: "Agency",
    tagline: "For agencies managing multiple clients",
    monthlyPrice: 7999,
    annualPrice: 6399,
    icon: Building2,
    color: "from-blue-900/60 to-cyan-900/60",
    glowColor: "#3b82f6",
    badge: "Best Value",
    accounts: "Up to 20 social accounts",
    features: [
      "20 connected social accounts",
      "All platforms + WhatsApp + LinkedIn",
      "1-year analytics history",
      "Unlimited AI content generation",
      "Full Kanban content calendar",
      "Bulk scheduling & auto-publishing",
      "All Composio integrations",
      "10 white-label client portals",
      "PIN-gated client access",
      "AI agentic strategy advisor",
      "Content Creation Agents pipeline",
      "Custom branding per client portal",
      "Dedicated account manager",
    ],
    limits: {
      socialAccounts: 20,
      postsPerMonth: "Unlimited",
      aiGenerations: "Unlimited",
      teamMembers: 10,
      clientPortals: 10,
      analyticsHistory: "1 year",
    },
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "Full command centre for large organisations",
    monthlyPrice: 0,
    annualPrice: 0,
    icon: Crown,
    color: "from-yellow-900/60 to-orange-900/60",
    glowColor: "#f59e0b",
    accounts: "Unlimited accounts",
    features: [
      "Unlimited social accounts",
      "All platforms + custom integrations",
      "Unlimited analytics history",
      "Unlimited AI generation + fine-tuning",
      "Advanced agentic AI pipeline",
      "Unlimited client portals",
      "Custom MCP server deployment",
      "On-premise or private cloud option",
      "SSO / SAML authentication",
      "SLA guarantee (99.9% uptime)",
      "Dedicated DevOps support team",
      "Custom contract & billing",
      "White-glove onboarding",
    ],
    limits: {
      socialAccounts: "Unlimited",
      postsPerMonth: "Unlimited",
      aiGenerations: "Unlimited",
      teamMembers: "Unlimited",
      clientPortals: "Unlimited",
      analyticsHistory: "Unlimited",
    },
  },
];

// ── Feature Comparison Table ──────────────────────────────────────────────────
const COMPARISON_ROWS = [
  { category: "Analytics", features: [
    { name: "Social account analytics", values: [true, true, true, true] },
    { name: "Google Ads analytics", values: [false, true, true, true] },
    { name: "Competitor benchmarking", values: [false, false, true, true] },
    { name: "Custom analytics dashboards", values: [false, false, true, true] },
  ]},
  { category: "Content & Publishing", features: [
    { name: "AI content generation", values: ["50/mo", "500/mo", "Unlimited", "Unlimited"] },
    { name: "Multi-platform publishing", values: [false, true, true, true] },
    { name: "Content calendar", values: ["Basic", "Full", "Full", "Full"] },
    { name: "Bulk scheduling", values: [false, false, true, true] },
  ]},
  { category: "AI & Agents", features: [
    { name: "AI strategy recommendations", values: [false, "Weekly", "Daily", "Real-time"] },
    { name: "Content Creation Agents", values: [false, false, true, true] },
    { name: "Agentic auto-posting", values: [false, false, true, true] },
    { name: "Custom AI fine-tuning", values: [false, false, false, true] },
  ]},
  { category: "Client Portals", features: [
    { name: "White-label portals", values: [false, "1", "10", "Unlimited"] },
    { name: "PIN-gated access", values: [false, false, true, true] },
    { name: "Custom branding per portal", values: [false, false, true, true] },
  ]},
  { category: "Integrations", features: [
    { name: "Composio integrations", values: ["Basic", "Standard", "All", "Custom"] },
    { name: "MCP server access", values: [false, false, true, true] },
    { name: "API access", values: [false, false, true, true] },
  ]},
];

// ── Feature Value Cell ─────────────────────────────────────────────────────────
function FeatureCell({ value }: { value: boolean | string }) {
  if (value === true) return <Check className="h-4 w-4 text-green-400 mx-auto" />;
  if (value === false) return <X className="h-4 w-4 text-zinc-700 mx-auto" />;
  return <span className="text-xs text-zinc-300 font-medium">{value}</span>;
}

// ── Plan Card ─────────────────────────────────────────────────────────────────
function PlanCard({ plan, annual }: { plan: PlanTier; annual: boolean }) {
  const Icon = plan.icon;
  const price = annual ? plan.annualPrice : plan.monthlyPrice;
  const isEnterprise = plan.id === "enterprise";

  return (
    <div
      className={`relative flex flex-col rounded-2xl border p-6 transition-all hover:scale-[1.01] ${
        plan.badge ? "border-pink-500/50" : "border-zinc-800"
      }`}
      style={{
        background: `linear-gradient(135deg, ${plan.glowColor}08, transparent)`,
        boxShadow: plan.badge ? `0 0 30px ${plan.glowColor}20` : undefined,
      }}
    >
      {plan.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-pink-600 text-white px-3 py-0.5 text-xs font-semibold">
            {plan.badge}
          </Badge>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: plan.glowColor + "22" }}
            >
              <Icon className="h-5 w-5" style={{ color: plan.glowColor }} />
            </div>
            <h3 className="text-lg font-bold text-zinc-100">{plan.name}</h3>
          </div>
          <p className="text-xs text-zinc-500">{plan.tagline}</p>
        </div>
      </div>

      {/* Price */}
      <div className="mb-5">
        {isEnterprise ? (
          <div>
            <span className="text-3xl font-bold text-zinc-100">Custom</span>
            <p className="text-xs text-zinc-500 mt-1">Contact us for pricing</p>
          </div>
        ) : (
          <div>
            <div className="flex items-end gap-1">
              <span className="text-xs text-zinc-500 mb-1">R</span>
              <span className="text-4xl font-bold text-zinc-100">{price.toLocaleString()}</span>
              <span className="text-sm text-zinc-500 mb-1">/mo</span>
            </div>
            {annual && (
              <p className="text-xs text-green-400 mt-1">
                Save R{((plan.monthlyPrice - plan.annualPrice) * 12).toLocaleString()}/year
              </p>
            )}
          </div>
        )}
      </div>

      {/* Accounts highlight */}
      <div
        className="text-xs font-semibold px-3 py-1.5 rounded-lg mb-4 text-center"
        style={{ backgroundColor: plan.glowColor + "22", color: plan.glowColor }}
      >
        {plan.accounts}
      </div>

      {/* CTA */}
      <Button
        className="w-full mb-5 font-semibold"
        style={
          plan.badge
            ? { background: "linear-gradient(135deg, #ec4899, #a855f7)", border: "none" }
            : isEnterprise
            ? { background: "linear-gradient(135deg, #f59e0b, #ef4444)", border: "none" }
            : {}
        }
        variant={plan.badge || isEnterprise ? "default" : "outline"}
        onClick={() => toast.info(`${plan.name} plan — contact us at studex@datagenic.co.za`)}
      >
        {isEnterprise ? "Contact Sales" : `Get Started — ${plan.name}`}
      </Button>

      {/* Features */}
      <ul className="flex flex-col gap-2">
        {plan.features.map(f => (
          <li key={f} className="flex items-start gap-2 text-xs text-zinc-400">
            <Check className="h-3.5 w-3.5 text-green-400 shrink-0 mt-0.5" />
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function SaaSPlans() {
  const [annual, setAnnual] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <Badge className="bg-pink-900/50 text-pink-300 border-pink-700/50 text-xs">
            DatAgentic SaaS Platform
          </Badge>
          <h1 className="text-3xl font-bold text-zinc-100">
            Choose Your Intelligence Tier
          </h1>
          <p className="text-zinc-500 max-w-xl mx-auto text-sm">
            From single-account analysis to full enterprise command centres — DatAgentic scales with your ambition.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <span className={`text-sm ${!annual ? "text-zinc-100" : "text-zinc-500"}`}>Monthly</span>
            <Switch checked={annual} onCheckedChange={setAnnual} />
            <span className={`text-sm ${annual ? "text-zinc-100" : "text-zinc-500"}`}>Annual</span>
            {annual && (
              <Badge className="bg-green-900/50 text-green-300 text-xs">Save up to 20%</Badge>
            )}
          </div>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {PLANS.map(plan => (
            <PlanCard key={plan.id} plan={plan} annual={annual} />
          ))}
        </div>

        {/* Limits Summary */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-5 gap-0 text-xs">
            <div className="p-4 bg-zinc-950 border-r border-zinc-800">
              <p className="font-semibold text-zinc-400 uppercase tracking-wider">Limits</p>
            </div>
            {PLANS.map(plan => (
              <div key={plan.id} className="p-4 border-r border-zinc-800 last:border-r-0 text-center">
                <p className="font-semibold text-zinc-200">{plan.name}</p>
              </div>
            ))}
          </div>
          {[
            { label: "Social Accounts", key: "socialAccounts" as const },
            { label: "Posts / Month", key: "postsPerMonth" as const },
            { label: "AI Generations", key: "aiGenerations" as const },
            { label: "Team Members", key: "teamMembers" as const },
            { label: "Client Portals", key: "clientPortals" as const },
            { label: "Analytics History", key: "analyticsHistory" as const },
          ].map((row, i) => (
            <div
              key={row.label}
              className={`grid grid-cols-5 gap-0 text-xs border-t border-zinc-800 ${i % 2 === 0 ? "bg-zinc-950/50" : ""}`}
            >
              <div className="p-3 border-r border-zinc-800 text-zinc-500">{row.label}</div>
              {PLANS.map(plan => {
                const val = plan.limits[row.key];
                return (
                  <div key={plan.id} className="p-3 border-r border-zinc-800 last:border-r-0 text-center">
                    {val === 0 ? (
                      <X className="h-3.5 w-3.5 text-zinc-700 mx-auto" />
                    ) : (
                      <span className="text-zinc-300 font-medium">{val}</span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Feature Comparison Toggle */}
        <div>
          <button
            onClick={() => setShowComparison(!showComparison)}
            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors mx-auto"
          >
            {showComparison ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            {showComparison ? "Hide" : "Show"} full feature comparison
          </button>

          {showComparison && (
            <div className="mt-4 bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="grid grid-cols-5 gap-0 text-xs bg-zinc-950">
                <div className="p-4 border-r border-zinc-800">
                  <p className="font-semibold text-zinc-400 uppercase tracking-wider">Feature</p>
                </div>
                {PLANS.map(plan => {
                  const Icon = plan.icon;
                  return (
                    <div key={plan.id} className="p-4 border-r border-zinc-800 last:border-r-0 text-center">
                      <Icon className="h-4 w-4 mx-auto mb-1" style={{ color: plan.glowColor }} />
                      <p className="font-semibold text-zinc-200">{plan.name}</p>
                    </div>
                  );
                })}
              </div>
              {COMPARISON_ROWS.map(cat => (
                <div key={cat.category}>
                  <div className="px-4 py-2 bg-zinc-800/50 border-t border-zinc-800">
                    <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{cat.category}</p>
                  </div>
                  {cat.features.map((row, i) => (
                    <div
                      key={row.name}
                      className={`grid grid-cols-5 gap-0 text-xs border-t border-zinc-800 ${i % 2 === 0 ? "bg-zinc-950/30" : ""}`}
                    >
                      <div className="p-3 border-r border-zinc-800 text-zinc-500">{row.name}</div>
                      {row.values.map((val, vi) => (
                        <div key={vi} className="p-3 border-r border-zinc-800 last:border-r-0 text-center flex items-center justify-center">
                          <FeatureCell value={val} />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Enterprise CTA */}
        <div
          className="rounded-2xl p-8 text-center border border-yellow-800/30"
          style={{ background: "linear-gradient(135deg, #92400e10, #78350f10)" }}
        >
          <Crown className="h-10 w-10 text-yellow-400 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-zinc-100 mb-2">Need a Custom Solution?</h3>
          <p className="text-sm text-zinc-500 max-w-md mx-auto mb-4">
            Large organisations, government, and enterprise clients get a fully tailored DatAgentic deployment — private cloud, custom integrations, SLA guarantees, and dedicated support.
          </p>
          <Button
            className="font-semibold"
            style={{ background: "linear-gradient(135deg, #f59e0b, #ef4444)", border: "none" }}
            onClick={() => toast.info("Contact us at enterprise@datagenic.co.za")}
          >
            Talk to Enterprise Sales
          </Button>
        </div>

        {/* FAQ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              q: "What counts as a 'social account'?",
              a: "Each connected platform page or profile counts as one account. E.g. one Facebook Page + one Instagram account = 2 accounts.",
            },
            {
              q: "Can I upgrade or downgrade at any time?",
              a: "Yes. Upgrades take effect immediately; downgrades apply at the end of your current billing cycle.",
            },
            {
              q: "What is a white-label client portal?",
              a: "A branded, PIN-gated dashboard you can share with your clients. They see only their own data — no StudEx branding.",
            },
            {
              q: "Does DatAgentic post automatically?",
              a: "On Agency and Enterprise plans, the AI agentic pipeline can draft, schedule, and publish content — but requires your approval before posting.",
            },
          ].map(faq => (
            <div key={faq.q} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <p className="text-sm font-semibold text-zinc-200 mb-1">{faq.q}</p>
              <p className="text-xs text-zinc-500">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
