import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import {
  UserCheck, Mail, Globe, Instagram, Facebook, Clock,
  CheckCircle2, XCircle, Loader2, Eye, Send, ChevronDown,
  ChevronUp, Sparkles, TrendingUp, Users, Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Lead = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  businessName: string;
  industry: string | null;
  websiteUrl: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  tiktokUrl: string | null;
  monthlyBudget: string | null;
  primaryGoal: string | null;
  currentChallenges: string | null;
  facebookFollowers: number | null;
  instagramFollowers: number | null;
  tiktokFollowers: number | null;
  status: string;
  aiAnalysis: string | null;
  analysisScore: number | null;
  proposedPricing: string | null;
  createdAt: string | number | Date;
};

const STATUS_COLORS: Record<string, string> = {
  submitted: "bg-blue-50 text-blue-700 border-blue-200",
  analysing: "bg-yellow-50 text-yellow-700 border-yellow-200",
  proposal_sent: "bg-purple-50 text-purple-700 border-purple-200",
  approved: "bg-green-50 text-green-700 border-green-200",
  active: "bg-primary/10 text-primary border-primary/20",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

function LeadCard({ lead, onRefresh }: { lead: Lead; onRefresh: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [analysing, setAnalysing] = useState(false);
  const [inviting, setInviting] = useState(false);

  const analyseLeadMutation = trpc.clientPortal.analyseLead.useMutation({
    onSuccess: () => {
      toast.success("AI analysis complete!");
      onRefresh();
    },
    onError: (err: { message: string }) => toast.error(err.message),
  });

  const inviteClientMutation = trpc.clientPortal.approveLead.useMutation({
    onSuccess: (res: { portalUrl: string }) => {
      toast.success(`Invite sent to ${lead.email}`);
      navigator.clipboard.writeText(res.portalUrl).catch(() => {});
      onRefresh();
    },
    onError: (err: { message: string }) => toast.error(err.message),
  });

  const handleAnalyse = async () => {
    setAnalysing(true);
    try {
      await analyseLeadMutation.mutateAsync({ leadId: lead.id });
    } finally {
      setAnalysing(false);
    }
  };

  const handleInvite = async () => {
    setInviting(true);
    try {
      await inviteClientMutation.mutateAsync({ leadId: lead.id });
    } finally {
      setInviting(false);
    }
  };

  const statusClass = STATUS_COLORS[lead.status] ?? "bg-muted text-muted-foreground border-border";
  const date = new Date(lead.createdAt).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="bg-white border border-border rounded-2xl overflow-hidden card-hover">
      {/* Card header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-pink-tint border border-primary/10 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-foreground text-base">{lead.businessName}</h3>
              <p className="text-sm text-muted-foreground">{lead.firstName} {lead.lastName} · {lead.email}</p>
              {lead.industry ? <p className="text-xs text-muted-foreground mt-0.5">{lead.industry}</p> : null}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {lead.analysisScore !== null ? (
              <div className="flex items-center gap-1.5 bg-pink-tint border border-primary/10 rounded-full px-2.5 py-1">
                <TrendingUp className="w-3 h-3 text-primary" />
                <span className="text-xs font-semibold text-primary">{lead.analysisScore}/100</span>
              </div>
            ) : null}
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${statusClass}`}>
              {lead.status.replace("_", " ")}
            </span>
          </div>
        </div>

        {/* Quick info row */}
        <div className="flex flex-wrap gap-3 mt-4">
          {lead.websiteUrl ? (
            <a href={lead.websiteUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
              <Globe className="w-3.5 h-3.5" /> Website
            </a>
          ) : null}
          {lead.facebookUrl ? (
            <a href={lead.facebookUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
              <Facebook className="w-3.5 h-3.5" /> Facebook
            </a>
          ) : null}
          {lead.instagramUrl ? (
            <a href={lead.instagramUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
              <Instagram className="w-3.5 h-3.5" /> Instagram
            </a>
          ) : null}
          {(lead.facebookFollowers ?? lead.instagramFollowers ?? lead.tiktokFollowers) ? (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="w-3.5 h-3.5" />
              {[lead.facebookFollowers, lead.instagramFollowers, lead.tiktokFollowers].filter(Boolean).reduce((a, b) => (a ?? 0) + (b ?? 0), 0)?.toLocaleString()} followers
            </span>
          ) : null}
          {lead.monthlyBudget ? (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              Budget: {lead.monthlyBudget}
            </span>
          ) : null}
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground ml-auto">
            <Clock className="w-3.5 h-3.5" /> {date}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-4">
          {lead.status === "submitted" ? (
            <Button size="sm" onClick={handleAnalyse} disabled={analysing} className="gap-1.5">
              {analysing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              {analysing ? "Analysing…" : "Run AI Analysis"}
            </Button>
          ) : null}
          {(lead.status === "analysing" || lead.status === "proposal_sent" || lead.status === "approved") ? (
            <Button size="sm" onClick={handleInvite} disabled={inviting} className="gap-1.5">
              {inviting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              {inviting ? "Sending…" : "Send Invite & Proposal"}
            </Button>
          ) : null}
          {lead.aiAnalysis ? (
            <Button size="sm" variant="outline" onClick={() => setExpanded(e => !e)} className="gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              {expanded ? "Hide" : "View"} Analysis
              {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </Button>
          ) : null}
        </div>
      </div>

      {/* Expanded analysis */}
      {expanded && lead.aiAnalysis ? (
        <div className="border-t border-border bg-muted/30 p-5 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <h4 className="font-display font-semibold text-foreground text-sm">AI Analysis</h4>
            {lead.proposedPricing ? (
              <span className="ml-auto text-sm font-semibold text-primary">Proposed: {lead.proposedPricing}</span>
            ) : null}
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{lead.aiAnalysis}</p>
        </div>
      ) : null}
    </div>
  );
}

export default function ClientSubmissions() {
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data, isLoading, refetch } = trpc.clientPortal.listLeads.useQuery({ status: statusFilter as "all" });

  const leads = (data as unknown as Lead[]) ?? [];

  const counts = {
    all: leads.length,
    submitted: leads.filter(l => l.status === "submitted").length,
    analysing: leads.filter(l => l.status === "analysing").length,
    proposal_sent: leads.filter(l => l.status === "proposal_sent").length,
    active: leads.filter(l => l.status === "active").length,
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <UserCheck className="w-5 h-5 text-primary" />
              <h1 className="font-display text-2xl font-bold text-foreground">Client Submissions</h1>
            </div>
            <p className="text-muted-foreground text-sm">
              Review incoming leads, run AI analysis, and send personalised proposals.
            </p>
          </div>
          <a
            href="/get-started"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            <Globe className="w-3.5 h-3.5" /> View onboarding page
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Leads", value: counts.all, color: "text-foreground" },
            { label: "New", value: counts.submitted, color: "text-blue-600" },
            { label: "Proposals Sent", value: counts.proposal_sent, color: "text-purple-600" },
            { label: "Active Clients", value: counts.active, color: "text-primary" },
          ].map(stat => (
            <div key={stat.label} className="bg-white border border-border rounded-xl p-4">
              <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
              <p className={`font-display text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap">
          {["all", "submitted", "analysing", "proposal_sent", "approved", "active", "rejected"].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
                statusFilter === s
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-white text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
              }`}
            >
              {s === "all" ? "All" : s.replace("_", " ")}
              {s === "all" ? ` (${counts.all})` : ""}
            </button>
          ))}
        </div>

        {/* Lead list */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : leads.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto">
              <UserCheck className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-display font-semibold text-foreground">No submissions yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Share the <a href="/get-started" className="text-primary hover:underline">onboarding page</a> with potential clients to start receiving submissions.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {leads.map(lead => (
              <LeadCard key={lead.id} lead={lead} onRefresh={() => refetch()} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
