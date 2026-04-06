import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useLocation, useParams } from "wouter";
import { getLoginUrl } from "@/const";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Globe, BarChart3, Share2, Cpu, TrendingUp, Brain,
  ArrowLeft, Download, ExternalLink, CheckCircle, XCircle,
  Loader2, Shield, Zap, Users, AlertTriangle
} from "lucide-react";
import { Streamdown } from "streamdown";

function ScoreRing({ score, label, color }: { score: number; label: string; color: string }) {
  return (
    <div className="text-center">
      <div className={`text-3xl font-bold ${color}`}>{score}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

export default function Report() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id || "0");

  const { data: analysis, isLoading } = trpc.analysis.getById.useQuery(
    { id },
    { enabled: !!id && isAuthenticated }
  );

  if (loading || isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Sign in to view reports</h2>
          <Button asChild><a href={getLoginUrl()}>Sign In</a></Button>
        </div>
      </div>
    );
  }

  if (!analysis) return (
    <DashboardLayout>
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Report not found.</p>
        <Button onClick={() => navigate("/history")} className="mt-4" variant="outline">Back to History</Button>
      </div>
    </DashboardLayout>
  );

  const seoData = analysis.seoData ? JSON.parse(analysis.seoData as string) : {};
  const techStack = analysis.techStack ? JSON.parse(analysis.techStack as string) : {};
  const socialProfiles = analysis.socialProfiles ? JSON.parse(analysis.socialProfiles as string) : [];
  const whoisData = analysis.whoisData ? JSON.parse(analysis.whoisData as string) : {};
  const competitive = analysis.competitiveData ? JSON.parse(analysis.competitiveData as string) : {};
  const dnsRecords = analysis.dnsRecords ? JSON.parse(analysis.dnsRecords as string) : [];

  const detectedSocials = socialProfiles.filter((s: any) => s.detected);

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/history")} className="gap-1">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{analysis.domain}</h1>
              <p className="text-muted-foreground text-sm">{analysis.industryCategory} · {new Date(analysis.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={() => {
              const blob = new Blob([analysis.reportMarkdown || ""], { type: "text/markdown" });
              const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
              a.download = `${analysis.domain}-report.md`; a.click();
            }}>
              <Download className="w-4 h-4" /> Download Report
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href={analysis.url} target="_blank" rel="noopener noreferrer" className="gap-2 flex items-center">
                <ExternalLink className="w-4 h-4" /> Visit Site
              </a>
            </Button>
          </div>
        </div>

        {/* AI Summary */}
        {analysis.aiSummary && (
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <Brain className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-semibold mb-2">AI Business Summary</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{analysis.aiSummary}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Score Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-card border-border text-center p-4">
            <ScoreRing score={analysis.seoScore || 0} label="SEO Score" color={analysis.seoScore && analysis.seoScore >= 70 ? "text-green-400" : analysis.seoScore && analysis.seoScore >= 40 ? "text-yellow-400" : "text-red-400"} />
          </Card>
          <Card className="bg-card border-border text-center p-4">
            <ScoreRing score={analysis.performanceScore || 0} label="Performance" color={analysis.performanceScore && analysis.performanceScore >= 70 ? "text-green-400" : analysis.performanceScore && analysis.performanceScore >= 40 ? "text-yellow-400" : "text-red-400"} />
          </Card>
          <Card className="bg-card border-border text-center p-4">
            <div className="text-3xl font-bold text-blue-400">{detectedSocials.length}</div>
            <div className="text-xs text-muted-foreground mt-1">Social Platforms</div>
          </Card>
          <Card className="bg-card border-border text-center p-4">
            <div className="text-3xl font-bold text-purple-400">
              {[...(techStack.frameworks || []), ...(techStack.analytics || []), ...(techStack.marketing || [])].length}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Technologies</div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Domain Info */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" /> Domain & Registration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {[
                ["Domain", whoisData.domain || analysis.domain],
                ["Registrar", whoisData.registrar || "N/A"],
                ["Created", whoisData.createdDate || "N/A"],
                ["Expires", whoisData.expiresDate || "N/A"],
                ["Country", whoisData.country || "N/A"],
                ["HTTPS", seoData.httpsEnabled ? "Yes ✓" : "No ✗"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-muted-foreground">{k}</span>
                  <span className="font-medium text-right max-w-[60%] truncate">{v}</span>
                </div>
              ))}
              {dnsRecords.slice(0, 3).map((r: any, i: number) => (
                <div key={i} className="flex justify-between">
                  <span className="text-muted-foreground">DNS {r.type}</span>
                  <span className="font-mono text-xs text-right max-w-[60%] truncate">{r.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* SEO Details */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" /> SEO Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {seoData.title && (
                <div>
                  <span className="text-muted-foreground text-xs">Page Title</span>
                  <p className="font-medium truncate">{seoData.title}</p>
                </div>
              )}
              {seoData.description && (
                <div>
                  <span className="text-muted-foreground text-xs">Meta Description</span>
                  <p className="text-xs leading-relaxed line-clamp-2">{seoData.description}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                {[
                  ["Load Time", `${seoData.loadTimeMs}ms`],
                  ["Word Count", seoData.wordCount],
                  ["Int. Links", seoData.internalLinks],
                  ["Ext. Links", seoData.externalLinks],
                ].map(([k, v]) => (
                  <div key={k} className="bg-muted/30 rounded p-2">
                    <div className="text-muted-foreground text-xs">{k}</div>
                    <div className="font-medium">{v}</div>
                  </div>
                ))}
              </div>
              {seoData.issues?.length > 0 && (
                <div>
                  <span className="text-muted-foreground text-xs">Issues ({seoData.issues.length})</span>
                  <div className="space-y-1 mt-1">
                    {seoData.issues.slice(0, 4).map((issue: string) => (
                      <div key={issue} className="flex items-center gap-1.5 text-xs text-yellow-400">
                        <AlertTriangle className="w-3 h-3 shrink-0" /> {issue}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Social Media */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Share2 className="w-4 h-4 text-primary" /> Social Media Presence
              </CardTitle>
            </CardHeader>
            <CardContent>
              {detectedSocials.length === 0 ? (
                <p className="text-muted-foreground text-sm">No social profiles detected on this page.</p>
              ) : (
                <div className="space-y-2">
                  {detectedSocials.map((s: any) => (
                    <div key={s.platform} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-sm font-medium">{s.platform}</span>
                      </div>
                      {s.url && (
                        <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline truncate max-w-[150px]">
                          {s.handle || "View Profile"}
                        </a>
                      )}
                    </div>
                  ))}
                  {socialProfiles.filter((s: any) => !s.detected).map((s: any) => (
                    <div key={s.platform} className="flex items-center gap-2 opacity-40">
                      <XCircle className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{s.platform}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tech Stack */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Cpu className="w-4 h-4 text-primary" /> Technology Stack
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {techStack.cms && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">CMS</span>
                  <Badge variant="secondary">{techStack.cms}</Badge>
                </div>
              )}
              {techStack.hosting && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hosting</span>
                  <Badge variant="secondary">{techStack.hosting}</Badge>
                </div>
              )}
              {techStack.cdn && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">CDN</span>
                  <Badge variant="secondary">{techStack.cdn}</Badge>
                </div>
              )}
              {techStack.ecommerce && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">E-commerce</span>
                  <Badge variant="secondary">{techStack.ecommerce}</Badge>
                </div>
              )}
              {techStack.frameworks?.length > 0 && (
                <div>
                  <span className="text-muted-foreground text-xs">Frameworks</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {techStack.frameworks.map((f: string) => <Badge key={f} variant="outline" className="text-xs">{f}</Badge>)}
                  </div>
                </div>
              )}
              {techStack.analytics?.length > 0 && (
                <div>
                  <span className="text-muted-foreground text-xs">Analytics</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {techStack.analytics.map((a: string) => <Badge key={a} variant="outline" className="text-xs">{a}</Badge>)}
                  </div>
                </div>
              )}
              {techStack.marketing?.length > 0 && (
                <div>
                  <span className="text-muted-foreground text-xs">Marketing</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {techStack.marketing.map((m: string) => <Badge key={m} variant="outline" className="text-xs">{m}</Badge>)}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Competitive Analysis */}
        {competitive && Object.keys(competitive).length > 0 && (
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" /> Competitive Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                {competitive.strengths?.length > 0 && (
                  <div>
                    <h4 className="font-medium text-green-400 mb-2">Strengths</h4>
                    <ul className="space-y-1">
                      {competitive.strengths.map((s: string) => <li key={s} className="text-muted-foreground flex items-start gap-1.5"><CheckCircle className="w-3 h-3 text-green-400 mt-0.5 shrink-0" />{s}</li>)}
                    </ul>
                  </div>
                )}
                {competitive.weaknesses?.length > 0 && (
                  <div>
                    <h4 className="font-medium text-red-400 mb-2">Weaknesses</h4>
                    <ul className="space-y-1">
                      {competitive.weaknesses.map((w: string) => <li key={w} className="text-muted-foreground flex items-start gap-1.5"><XCircle className="w-3 h-3 text-red-400 mt-0.5 shrink-0" />{w}</li>)}
                    </ul>
                  </div>
                )}
                {competitive.opportunities?.length > 0 && (
                  <div>
                    <h4 className="font-medium text-blue-400 mb-2">Opportunities</h4>
                    <ul className="space-y-1">
                      {competitive.opportunities.map((o: string) => <li key={o} className="text-muted-foreground flex items-start gap-1.5"><Zap className="w-3 h-3 text-blue-400 mt-0.5 shrink-0" />{o}</li>)}
                    </ul>
                  </div>
                )}
              </div>
              {competitive.recommendedActions?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <h4 className="font-medium mb-2 text-sm">Recommended Actions</h4>
                  <ol className="space-y-1">
                    {competitive.recommendedActions.map((a: string, i: number) => (
                      <li key={a} className="text-muted-foreground text-sm flex items-start gap-2">
                        <span className="text-primary font-bold shrink-0">{i + 1}.</span>{a}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Full Markdown Report */}
        {analysis.reportMarkdown && (
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" /> Full Intelligence Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm prose-invert max-w-none">
                <Streamdown>{analysis.reportMarkdown}</Streamdown>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
