import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import {
  Search, Clock, Globe, TrendingUp, BarChart3,
  Plus, ArrowRight, Zap, CheckCircle, XCircle, Loader2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/DashboardLayout";

function StatusBadge({ status }: { status: string }) {
  if (status === "completed") return <Badge className="bg-green-500/10 text-green-400 border-green-500/20"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
  if (status === "running") return <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20"><Loader2 className="w-3 h-3 mr-1 animate-spin" />Running</Badge>;
  if (status === "failed") return <Badge className="bg-red-500/10 text-red-400 border-red-500/20"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
  return <Badge variant="secondary">{status}</Badge>;
}

export default function Dashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();

  const { data: history } = trpc.analysis.getHistory.useQuery(
    { limit: 5 },
    { enabled: isAuthenticated }
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Sign in to access your dashboard</h2>
          <Button asChild><a href={getLoginUrl()}>Sign In</a></Button>
        </div>
      </div>
    );
  }

  const recentAnalyses = history || [];
  const completed = recentAnalyses.filter(a => a.status === "completed").length;

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {user?.name?.split(" ")[0] || "there"}</h1>
            <p className="text-muted-foreground text-sm mt-1">Your business intelligence command centre</p>
          </div>
          <Button onClick={() => navigate("/analyze")} className="gap-2">
            <Plus className="w-4 h-4" /> New Analysis
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Globe, label: "Total Analyses", value: recentAnalyses.length, color: "text-blue-400" },
            { icon: CheckCircle, label: "Completed", value: completed, color: "text-green-400" },
            { icon: TrendingUp, label: "Avg SEO Score", value: recentAnalyses.filter(a => a.seoScore).length > 0 ? Math.round(recentAnalyses.filter(a => a.seoScore).reduce((s, a) => s + (a.seoScore || 0), 0) / recentAnalyses.filter(a => a.seoScore).length) + "/100" : "N/A", color: "text-purple-400" },
            { icon: BarChart3, label: "Domains Tracked", value: new Set(recentAnalyses.map(a => a.domain)).size, color: "text-orange-400" },
          ].map(({ icon: Icon, label, value, color }) => (
            <Card key={label} className="bg-card border-border">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">{label}</p>
                    <p className="text-2xl font-bold">{value}</p>
                  </div>
                  <Icon className={`w-8 h-8 ${color} opacity-70`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Analyze */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg mb-1">Analyse a New Website</h3>
                <p className="text-muted-foreground text-sm">Paste any URL to generate a full business intelligence report</p>
              </div>
              <Button onClick={() => navigate("/analyze")} size="lg" className="gap-2 shrink-0">
                <Search className="w-5 h-5" /> Analyze Now
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Analyses */}
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-base font-semibold">Recent Analyses</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate("/history")} className="gap-1 text-xs">
              View All <ArrowRight className="w-3 h-3" />
            </Button>
          </CardHeader>
          <CardContent>
            {recentAnalyses.length === 0 ? (
              <div className="text-center py-12">
                <Globe className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-40" />
                <p className="text-muted-foreground text-sm">No analyses yet. Start by analysing a website.</p>
                <Button onClick={() => navigate("/analyze")} className="mt-4 gap-2" variant="outline">
                  <Plus className="w-4 h-4" /> Analyse Your First Website
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentAnalyses.map((analysis) => (
                  <div
                    key={analysis.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 cursor-pointer transition-colors"
                    onClick={() => analysis.status === "completed" && navigate(`/report/${analysis.id}`)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Globe className="w-4 h-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{analysis.domain}</p>
                        <p className="text-muted-foreground text-xs">{new Date(analysis.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {analysis.seoScore && (
                        <span className="text-xs text-muted-foreground hidden sm:block">SEO: {analysis.seoScore}/100</span>
                      )}
                      <StatusBadge status={analysis.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
