import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Sparkles, Brain, Star, Target, Lightbulb, CheckCircle2, Mail, ArrowRight } from "lucide-react";

// ── Helper components ──────────────────────────────────────────────────────────

function Section({ title, icon, items, iconClass }: {
  title: string;
  icon: React.ReactNode;
  items: string[];
  iconClass?: string;
}) {
  if (items.length === 0) return null;
  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-3">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="font-display font-semibold text-foreground text-sm">{title}</h3>
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${iconClass ?? "text-primary"}`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ScoreBadge({ score }: { score: number }) {
  return (
    <div className="flex-shrink-0 text-center">
      <div className="w-24 h-24 rounded-full border-4 border-primary/30 bg-card flex flex-col items-center justify-center">
        <span className="font-display text-2xl font-bold text-primary">{score}</span>
        <span className="text-xs text-muted-foreground">/100</span>
      </div>
      <p className="text-xs text-muted-foreground mt-1">Digital Score</p>
    </div>
  );
}

// ── Lead type ─────────────────────────────────────────────────────────────────

type LeadData = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  businessName: string;
  aiAnalysis: string | null;
  aiStrategy: string | null;
  analysisScore: number | null;
  proposedPricing: string | null;
  status: string;
  industry: string | null;
};

// ── Main portal content ───────────────────────────────────────────────────────

function PortalContent({ token }: { token: string }) {
  const { data, isLoading, error } = trpc.clientPortal.accessPortal.useQuery({ token });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading your portal…</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 max-w-sm mx-auto px-6">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <span className="text-2xl">🔒</span>
          </div>
          <h1 className="font-display text-xl font-bold text-foreground">Access Denied</h1>
          <p className="text-muted-foreground text-sm">{error?.message ?? "This invite link is invalid or has expired."}</p>
          <a href="/get-started" className="inline-flex items-center gap-2 text-primary hover:underline text-sm">
            Request a new invite <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  }

  const lead = (data.lead as unknown) as LeadData | null;
  if (!lead) return null;

  const aiAnalysis: string = typeof lead.aiAnalysis === "string" ? lead.aiAnalysis : "";
  const proposedPricing: string = typeof lead.proposedPricing === "string" ? lead.proposedPricing : "";
  const score: number | null = typeof lead.analysisScore === "number" ? lead.analysisScore : null;

  let strategyData: Record<string, unknown> = {};
  try { strategyData = lead.aiStrategy ? JSON.parse(lead.aiStrategy as string) : {}; } catch { /* ignore */ }

  const strengths = Array.isArray(strategyData.strengths) ? (strategyData.strengths as string[]) : [];
  const gaps = Array.isArray(strategyData.gaps) ? (strategyData.gaps as string[]) : [];
  const opportunities = Array.isArray(strategyData.opportunities) ? (strategyData.opportunities as string[]) : [];
  const services = Array.isArray(strategyData.recommendedServices) ? (strategyData.recommendedServices as string[]) : [];
  const estimatedROI: string = typeof strategyData.estimatedROI === "string" ? strategyData.estimatedROI : "";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <span className="font-display font-bold text-foreground text-base">DatAgentic</span>
              <span className="ml-2 text-xs text-muted-foreground">Client Portal</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-foreground">{lead.businessName}</p>
            <p className="text-xs text-muted-foreground">{lead.email}</p>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">
        {/* Welcome */}
        <div className="bg-brand-gradient rounded-2xl border border-border p-8">
          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="pill-pink mb-3">Your Personalised Strategy</div>
              <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                Welcome, {lead.firstName}!
              </h1>
              <p className="text-muted-foreground max-w-lg">
                Here's your AI-powered digital strategy for{" "}
                <strong className="text-foreground">{lead.businessName}</strong>.
                Our team has analysed your digital presence and prepared a custom growth plan.
              </p>
            </div>
            {score !== null ? <ScoreBadge score={score} /> : null}
          </div>
        </div>

        {/* AI Analysis */}
        {aiAnalysis !== "" ? (
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              <h2 className="font-display text-lg font-semibold text-foreground">AI Analysis</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">{aiAnalysis}</p>
          </div>
        ) : null}

        {/* SWOT-style grid */}
        {(strengths.length > 0 || gaps.length > 0 || opportunities.length > 0) ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Section
              title="Strengths"
              icon={<Star className="w-4 h-4 text-primary" />}
              items={strengths}
            />
            <Section
              title="Areas to Improve"
              icon={<Target className="w-4 h-4 text-[oklch(0.52_0.18_300)]" />}
              items={gaps}
              iconClass="text-[oklch(0.52_0.18_300)]"
            />
            <Section
              title="Opportunities"
              icon={<Lightbulb className="w-4 h-4 text-amber-500" />}
              items={opportunities}
              iconClass="text-amber-500"
            />
          </div>
        ) : null}

        {/* Recommended services */}
        {services.length > 0 ? (
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="font-display text-lg font-semibold text-foreground">Recommended Services</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {services.map((s, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-pink-tint border border-primary/10">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </div>
                  <span className="text-sm text-foreground font-medium">{s}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Pricing + CTA */}
        {proposedPricing !== "" ? (
          <div className="bg-brand-gradient border border-border rounded-2xl p-8 text-center space-y-4">
            <div className="pill-pink mx-auto w-fit">Custom Proposal</div>
            <h2 className="font-display text-2xl font-bold text-foreground">
              Proposed Investment: <span className="gradient-text">{proposedPricing}</span>
            </h2>
            {estimatedROI !== "" ? (
              <p className="text-muted-foreground">
                Estimated ROI: <strong className="text-foreground">{estimatedROI}</strong>
              </p>
            ) : null}
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Ready to get started? Reply to the proposal email or contact our team directly to discuss next steps.
            </p>
            <a
              href={`mailto:hello@studexdevops.co.za?subject=Ready to start — ${lead.businessName}`}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors"
            >
              <Mail className="w-4 h-4" />
              Contact Our Team
            </a>
          </div>
        ) : null}
      </div>
    </div>
  );
}

// ── Page entry ────────────────────────────────────────────────────────────────

export default function ClientPortal() {
  const [location] = useLocation();
  const params = new URLSearchParams(location.split("?")[1] ?? "");
  const token = params.get("token") ?? "";

  if (!token) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 max-w-sm mx-auto px-6">
          <h1 className="font-display text-xl font-bold text-foreground">No Access Token</h1>
          <p className="text-muted-foreground text-sm">
            Please use the invite link sent to your email to access your portal.
          </p>
          <a href="/get-started" className="inline-flex items-center gap-2 text-primary hover:underline text-sm">
            Request access <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  }

  return <PortalContent token={token} />;
}
