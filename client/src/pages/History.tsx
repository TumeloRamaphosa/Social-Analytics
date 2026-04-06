import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import DashboardLayout from "@/components/DashboardLayout";
import { toast } from "sonner";
import {
  Search, Globe, Loader2, CheckCircle, XCircle,
  Plus, Trash2, ExternalLink, BarChart3, ArrowRight
} from "lucide-react";

function StatusBadge({ status }: { status: string }) {
  if (status === "completed") return <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-xs"><CheckCircle className="w-3 h-3 mr-1" />Done</Badge>;
  if (status === "running") return <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs"><Loader2 className="w-3 h-3 mr-1 animate-spin" />Running</Badge>;
  if (status === "failed") return <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-xs"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
  return <Badge variant="secondary" className="text-xs">{status}</Badge>;
}

export default function History() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const limit = 20;

  const utils = trpc.useUtils();

  const { data: analyses, isLoading } = trpc.analysis.getHistory.useQuery(
    { limit, offset: page * limit, search: search || undefined },
    { enabled: isAuthenticated }
  );

  const deleteMutation = trpc.analysis.delete.useMutation({
    onSuccess: () => {
      toast.success("Analysis deleted");
      utils.analysis.getHistory.invalidate();
    },
    onError: () => toast.error("Failed to delete"),
  });

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Sign in to view history</h2>
          <Button asChild><a href={getLoginUrl()}>Sign In</a></Button>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold">Analysis History</h1>
            <p className="text-muted-foreground text-sm mt-1">All your previous website analyses</p>
          </div>
          <Button onClick={() => navigate("/analyze")} className="gap-2">
            <Plus className="w-4 h-4" /> New Analysis
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            placeholder="Search by domain..."
            className="pl-10 bg-card"
          />
        </div>

        {/* Table */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              {analyses?.length || 0} {search ? "results" : "analyses"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : !analyses || analyses.length === 0 ? (
              <div className="text-center py-12">
                <Globe className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-40" />
                <p className="text-muted-foreground text-sm">
                  {search ? "No analyses matching your search." : "No analyses yet. Start by analysing a website."}
                </p>
                {!search && (
                  <Button onClick={() => navigate("/analyze")} className="mt-4 gap-2" variant="outline">
                    <Plus className="w-4 h-4" /> Analyse Your First Website
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {analyses.map((analysis) => (
                  <div
                    key={analysis.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/20 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Globe className="w-4 h-4 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-sm truncate">{analysis.domain}</p>
                          <StatusBadge status={analysis.status} />
                          {analysis.industryCategory && (
                            <Badge variant="outline" className="text-xs hidden sm:flex">{analysis.industryCategory}</Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground text-xs mt-0.5">
                          {new Date(analysis.createdAt).toLocaleString()} · {analysis.isCached ? "Cached" : "Live"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      {analysis.seoScore != null && (
                        <div className="hidden md:flex items-center gap-1 text-xs text-muted-foreground">
                          <BarChart3 className="w-3 h-3" /> {analysis.seoScore}/100
                        </div>
                      )}
                      {analysis.status === "completed" && (
                        <Button
                          variant="ghost" size="sm"
                          onClick={() => navigate(`/report/${analysis.id}`)}
                          className="gap-1 text-xs"
                        >
                          View <ArrowRight className="w-3 h-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost" size="sm"
                        onClick={() => deleteMutation.mutate({ id: analysis.id })}
                        className="text-muted-foreground hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {analyses && analyses.length === limit && (
              <div className="flex justify-center mt-4">
                <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)}>
                  Load More
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
