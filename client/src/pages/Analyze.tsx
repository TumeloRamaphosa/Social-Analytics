import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Search, Globe, Loader2, ArrowRight,
  Shield, BarChart3, Share2, Cpu, TrendingUp, Brain
} from "lucide-react";

const analysisSteps = [
  { icon: Globe, label: "Fetching website..." },
  { icon: Shield, label: "WHOIS & DNS lookup..." },
  { icon: BarChart3, label: "Analysing SEO & performance..." },
  { icon: Share2, label: "Detecting social profiles..." },
  { icon: Cpu, label: "Identifying tech stack..." },
  { icon: TrendingUp, label: "Running competitive analysis..." },
  { icon: Brain, label: "Generating AI insights..." },
];

export default function Analyze() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const [url, setUrl] = useState("");
  const [analysisId, setAnalysisId] = useState<number | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeMutation = trpc.analysis.analyze.useMutation({
    onSuccess: (data) => {
      setAnalysisId(data.analysisId);
      setIsAnalyzing(true);
    },
    onError: (err) => {
      toast.error("Analysis failed: " + err.message);
      setIsAnalyzing(false);
    },
  });

  // Poll for completion
  const { data: analysisStatus } = trpc.analysis.getById.useQuery(
    { id: analysisId! },
    {
      enabled: !!analysisId && isAnalyzing,
      refetchInterval: (query) => {
        const d = query.state.data;
        if (d?.status === "completed" || d?.status === "failed") return false;
        return 2000;
      },
    }
  );

  // Animate steps
  useEffect(() => {
    if (!isAnalyzing) return;
    const interval = setInterval(() => {
      setStepIndex(i => Math.min(i + 1, analysisSteps.length - 1));
    }, 3000);
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  // Navigate when done
  useEffect(() => {
    if (analysisStatus?.status === "completed") {
      toast.success("Analysis complete!");
      navigate(`/report/${analysisId}`);
    } else if (analysisStatus?.status === "failed") {
      toast.error("Analysis failed. Please try again.");
      setIsAnalyzing(false);
      setAnalysisId(null);
    }
  }, [analysisStatus?.status]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith("http")) normalizedUrl = `https://${normalizedUrl}`;
    setStepIndex(0);
    analyzeMutation.mutate({ url: normalizedUrl });
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Sign in to analyse websites</h2>
          <Button asChild><a href={getLoginUrl()}>Sign In</a></Button>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Analyse a Website</h1>
          <p className="text-muted-foreground">Enter any website URL to generate a comprehensive business intelligence report.</p>
        </div>

        {/* URL Input Form */}
        <Card className="bg-card border-border mb-8">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Website URL</label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={url}
                      onChange={e => setUrl(e.target.value)}
                      placeholder="https://example.com"
                      className="pl-10 bg-background"
                      disabled={isAnalyzing}
                    />
                  </div>
                  <Button type="submit" disabled={isAnalyzing || !url.trim()} className="gap-2 shrink-0">
                    {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    {isAnalyzing ? "Analysing..." : "Analyse"}
                  </Button>
                </div>
                <p className="text-muted-foreground text-xs mt-2">
                  Supports any public website. Analysis takes 15–30 seconds.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Analysis Progress */}
        {isAnalyzing && (
          <Card className="bg-card border-primary/20 border">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span className="font-medium">Analysing {url}</span>
              </div>
              <div className="space-y-3">
                {analysisSteps.map(({ icon: Icon, label }, i) => (
                  <div key={label} className={`flex items-center gap-3 transition-all duration-300 ${i <= stepIndex ? "opacity-100" : "opacity-30"}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${i < stepIndex ? "bg-green-500/20" : i === stepIndex ? "bg-primary/20" : "bg-muted"}`}>
                      {i < stepIndex ? (
                        <div className="w-2 h-2 rounded-full bg-green-400" />
                      ) : i === stepIndex ? (
                        <Loader2 className="w-3 h-3 animate-spin text-primary" />
                      ) : (
                        <Icon className="w-3 h-3 text-muted-foreground" />
                      )}
                    </div>
                    <span className={`text-sm ${i === stepIndex ? "text-foreground font-medium" : "text-muted-foreground"}`}>{label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* What you'll get */}
        {!isAnalyzing && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wide">What you'll receive</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                "Domain & WHOIS registration data",
                "SEO score with detailed issues list",
                "Performance & page speed metrics",
                "Social media profiles & follower counts",
                "Technology stack identification",
                "AI-powered competitive analysis",
                "Downloadable PDF report",
                "Auto-indexed into RAG knowledge base",
              ].map(item => (
                <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ArrowRight className="w-3 h-3 text-primary shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
