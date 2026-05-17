import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Sparkles, Send, Calendar, ImageIcon, Loader2, Facebook,
  Instagram, MessageCircle, Globe, Trash2, Eye, TrendingDown,
  DollarSign, Brain, Zap, AlertTriangle, BarChart3, RefreshCw,
  Mail, Hash, CheckSquare, Square, Linkedin, Twitter
} from "lucide-react";
import { Streamdown } from "streamdown";

const platformIcons: Record<string, React.ReactNode> = {
  facebook: <Facebook className="w-4 h-4 text-blue-500" />,
  instagram: <Instagram className="w-4 h-4 text-pink-500" />,
  whatsapp: <MessageCircle className="w-4 h-4 text-green-500" />,
  all: <Globe className="w-4 h-4 text-purple-500" />,
};

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground border border-border",
  scheduled: "bg-yellow-50 text-yellow-700 border border-yellow-200",
  published: "bg-green-50 text-green-700 border border-green-200",
  failed: "bg-red-50 text-red-700 border border-red-200",
};

const contentTypeColors: Record<string, string> = {
  product: "bg-blue-50 text-blue-700",
  educational: "bg-green-50 text-green-700",
  promotional: "bg-red-50 text-red-700",
  ugc: "bg-purple-50 text-purple-700",
  behind_scenes: "bg-orange-50 text-orange-700",
  testimonial: "bg-yellow-50 text-yellow-700",
};

export default function ContentStudio() {
  const [activeTab, setActiveTab] = useState("generate");
  const [brief, setBrief] = useState("");
  const [platform, setPlatform] = useState<"facebook" | "instagram" | "whatsapp" | "all">("instagram");
  const [contentType, setContentType] = useState<"product" | "educational" | "promotional" | "ugc" | "behind_scenes" | "testimonial">("product");
  const [generatedPost, setGeneratedPost] = useState<any>(null);
  const [weekStart, setWeekStart] = useState(new Date().toISOString().split("T")[0]);
  const [weeklyPlan, setWeeklyPlan] = useState<any[]>([]);
  const [publishPlatforms, setPublishPlatforms] = useState<string[]>(["facebook"]);
  const [publishResults, setPublishResults] = useState<Record<string, { success: boolean; error?: string }> | null>(null);

  // Ads intelligence state
  const [selectedAdAccount, setSelectedAdAccount] = useState("");
  const [adDatePreset, setAdDatePreset] = useState<"last_7d" | "last_30d" | "last_90d">("last_30d");
  const [replacementContent, setReplacementContent] = useState<Record<string, string>>({});
  const [loadingReplacement, setLoadingReplacement] = useState<Record<string, boolean>>({});

  const { data: posts, refetch: refetchPosts } = trpc.content.listPosts.useQuery({ limit: 20, offset: 0 });

  // Ad accounts
  const { data: accountsData } = trpc.facebookAds.getAdAccounts.useQuery();
  if (accountsData?.accounts?.length && !selectedAdAccount) {
    setSelectedAdAccount(accountsData.accounts[0].id);
  }

  // Underperforming ads
  const { data: adsData, isLoading: loadingAds, refetch: refetchAds } = trpc.facebookAds.getAdPerformance.useQuery(
    { adAccountId: selectedAdAccount, datePreset: adDatePreset },
    { enabled: !!selectedAdAccount }
  );

  const generateMutation = trpc.content.generatePost.useMutation({
    onSuccess: (data) => {
      setGeneratedPost(data);
      toast.success("Post generated successfully!");
      refetchPosts();
    },
    onError: (err) => toast.error(err.message),
  });

  const generateImageMutation = trpc.content.generatePostImage.useMutation({
    onSuccess: (data) => {
      setGeneratedPost((prev: any) => ({ ...prev, imageUrl: data.imageUrl }));
      toast.success("Image generated!");
      refetchPosts();
    },
    onError: (err) => toast.error(err.message),
  });

  const publishMutation = trpc.content.publishPost.useMutation({
    onSuccess: (data: any) => {
      setPublishResults(data.results || {});
      const successes = Object.entries(data.results || {}).filter(([, r]: any) => r.success).map(([p]) => p);
      const failures = Object.entries(data.results || {}).filter(([, r]: any) => !r.success).map(([p]) => p);
      if (successes.length) toast.success(`Published to: ${successes.join(", ")}`);
      if (failures.length) toast.error(`Failed on: ${failures.join(", ")}`);
      refetchPosts();
    },
    onError: (err) => toast.error(err.message),
  });

  const togglePublishPlatform = (p: string) => {
    setPublishPlatforms(prev =>
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    );
  };

  const deleteMutation = trpc.content.deletePost.useMutation({
    onSuccess: () => { toast.success("Post deleted"); refetchPosts(); },
    onError: (err) => toast.error(err.message),
  });

  const weeklyPlanMutation = trpc.content.generateWeeklyPlan.useMutation({
    onSuccess: (data) => {
      setWeeklyPlan(data.plan);
      toast.success(`Generated ${data.plan.length}-day content plan!`);
    },
    onError: (err) => toast.error(err.message),
  });

  const replaceAdMutation = trpc.facebookAds.generateOrganicReplacement.useMutation({
    onSuccess: (data: any) => {
      const content = typeof data.content === "string" ? data.content : JSON.stringify(data.content);
      setReplacementContent(prev => ({ ...prev, [data.adName]: content }));
      setLoadingReplacement(prev => ({ ...prev, [data.adName]: false }));
      toast.success("Organic replacement content generated!");
    },
    onError: (err, variables) => {
      setLoadingReplacement(prev => ({ ...prev, [variables.adName]: false }));
      toast.error(err.message);
    },
  });

  const handleGenerate = () => {
    if (!brief.trim()) { toast.error("Please enter a content brief"); return; }
    generateMutation.mutate({ brief, platform, contentType });
  };

  const handleGenerateImage = () => {
    if (!generatedPost?.id || !generatedPost?.imagePrompt) return;
    generateImageMutation.mutate({ postId: generatedPost.id, prompt: generatedPost.imagePrompt });
  };

  const handleReplaceAd = (ad: any) => {
    setLoadingReplacement(prev => ({ ...prev, [ad.ad_name]: true }));
    replaceAdMutation.mutate({
      adName: ad.ad_name || "Unnamed Ad",
      adSpend: ad.spend,
      adCtr: ad.ctr,
      adCpm: ad.cpm,
      businessContext: "South African business",
      platform: "both",
    });
  };

  const handleGenerateFromAd = (ad: any) => {
    setBrief(
      `Replace this underperforming ad: "${ad.ad_name || ad.campaign_name}". ` +
      `It spent R${ad.spend?.toFixed(2)} with only ${ad.ctr?.toFixed(2)}% CTR. ` +
      `Create organic content that achieves the same goal (${ad.campaign_name}) without paid spend.`
    );
    setActiveTab("generate");
    toast.info("Brief pre-filled from ad data. Click Generate Post.");
  };

  const underperformingAds = adsData?.underperforming || [];
  const allAds = adsData?.ads || [];

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-purple-400" />
              Content Studio
            </h1>
            <p className="text-muted-foreground mt-1">AI-powered content generation, scheduling, publishing, and ad replacement</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-muted/40 border border-border">
            <TabsTrigger value="generate" className="data-[state=active]:bg-purple-600">
              <Sparkles className="w-3 h-3 mr-1" />Generate
            </TabsTrigger>
            <TabsTrigger value="ads_replace" className="data-[state=active]:bg-red-600">
              <TrendingDown className="w-3 h-3 mr-1" />Replace Ads
            </TabsTrigger>
            <TabsTrigger value="posts" className="data-[state=active]:bg-purple-600">
              <Eye className="w-3 h-3 mr-1" />Posts Library
            </TabsTrigger>
            <TabsTrigger value="weekly" className="data-[state=active]:bg-purple-600">
              <Calendar className="w-3 h-3 mr-1" />Weekly Planner
            </TabsTrigger>
          </TabsList>

          {/* ── Generate Tab ─────────────────────────────────────────────── */}
          <TabsContent value="generate" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Input Panel */}
              <Card className="bg-white/50 border-border">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    AI Content Generator
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">Describe your content and let AI craft the perfect post</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-foreground/80">Content Brief</Label>
                    <Textarea
                      value={brief}
                      onChange={(e) => setBrief(e.target.value)}
                      placeholder="e.g. Promote LASIK eye surgery, emphasise pain-free procedure and same-day results, target professionals aged 25–45 in Pretoria..."
                      className="bg-muted border-border/60 text-foreground min-h-[120px] resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-foreground/80">Platform</Label>
                      <Select value={platform} onValueChange={(v: any) => setPlatform(v)}>
                        <SelectTrigger className="bg-muted border-border/60 text-foreground">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-muted border-border">
                          <SelectItem value="instagram">Instagram</SelectItem>
                          <SelectItem value="facebook">Facebook</SelectItem>
                          <SelectItem value="whatsapp">WhatsApp</SelectItem>
                          <SelectItem value="all">All Platforms</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-foreground/80">Content Type</Label>
                      <Select value={contentType} onValueChange={(v: any) => setContentType(v)}>
                        <SelectTrigger className="bg-muted border-border/60 text-foreground">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-muted border-border">
                          <SelectItem value="product">Product Showcase</SelectItem>
                          <SelectItem value="educational">Educational</SelectItem>
                          <SelectItem value="promotional">Promotional</SelectItem>
                          <SelectItem value="ugc">User Generated</SelectItem>
                          <SelectItem value="behind_scenes">Behind the Scenes</SelectItem>
                          <SelectItem value="testimonial">Testimonial</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    onClick={handleGenerate}
                    disabled={generateMutation.isPending}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-foreground font-semibold"
                  >
                    {generateMutation.isPending ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</>
                    ) : (
                      <><Sparkles className="w-4 h-4 mr-2" />Generate Post</>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Output Panel */}
              <Card className="bg-white/50 border-border">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    {generatedPost ? platformIcons[platform] : <Eye className="w-5 h-5 text-muted-foreground" />}
                    {generatedPost ? "Generated Post" : "Preview"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!generatedPost ? (
                    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                      <Sparkles className="w-12 h-12 mb-3 opacity-30" />
                      <p>Your generated post will appear here</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {generatedPost.imageUrl && (
                        <img src={generatedPost.imageUrl} alt="Generated" className="w-full rounded-lg object-cover max-h-48" />
                      )}
                      <div className="bg-muted rounded-lg p-4">
                        <p className="text-foreground text-sm whitespace-pre-wrap">{generatedPost.caption}</p>
                        {generatedPost.hashtags && (
                          <p className="text-blue-400 text-sm mt-2">{generatedPost.hashtags}</p>
                        )}
                      </div>
                      {generatedPost.imagePrompt && (
                        <div className="bg-muted/40 rounded-lg p-3">
                          <p className="text-muted-foreground text-xs font-medium mb-1">Image Prompt:</p>
                          <p className="text-foreground/80 text-xs">{generatedPost.imagePrompt}</p>
                        </div>
                      )}
                      {/* Multi-platform publish */}
                      <div className="space-y-3">
                        <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">Publish To</p>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { id: "facebook", label: "Facebook", icon: <Facebook className="w-3 h-3" />, color: "text-blue-400" },
                            { id: "instagram", label: "Instagram", icon: <Instagram className="w-3 h-3" />, color: "text-pink-400" },
                            { id: "discord", label: "Discord", icon: <Hash className="w-3 h-3" />, color: "text-indigo-400" },
                            { id: "gmail", label: "Gmail", icon: <Mail className="w-3 h-3" />, color: "text-red-400" },
                          ].map(p => (
                            <button
                              key={p.id}
                              onClick={() => togglePublishPlatform(p.id)}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                                publishPlatforms.includes(p.id)
                                  ? "bg-muted/60 border-border/40 text-foreground"
                                  : "bg-muted/40 border-border text-muted-foreground hover:border-border/60"
                              }`}
                            >
                              {publishPlatforms.includes(p.id)
                                ? <CheckSquare className="w-3 h-3 text-green-400" />
                                : <Square className="w-3 h-3" />}
                              <span className={p.color}>{p.icon}</span>
                              {p.label}
                            </button>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleGenerateImage}
                            disabled={generateImageMutation.isPending || !generatedPost.id}
                            className="flex-1 border-border/60 text-foreground/80 hover:bg-muted/60"
                          >
                            {generateImageMutation.isPending ?
                              <Loader2 className="w-4 h-4 mr-1 animate-spin" /> :
                              <ImageIcon className="w-4 h-4 mr-1" />}
                            Image
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => generatedPost.id && publishMutation.mutate({
                              postId: generatedPost.id,
                              platforms: publishPlatforms as any,
                            })}
                            disabled={publishMutation.isPending || !generatedPost.id || publishPlatforms.length === 0}
                            className="flex-1 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-foreground"
                          >
                            {publishMutation.isPending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Send className="w-4 h-4 mr-1" />}
                            Publish ({publishPlatforms.length})
                          </Button>
                        </div>
                        {publishResults && (
                          <div className="space-y-1">
                            {Object.entries(publishResults).map(([platform, result]: [string, any]) => (
                              <div key={platform} className={`flex items-center gap-2 text-xs px-2 py-1 rounded ${
                                result.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                              }`}>
                                <span className="capitalize font-medium">{platform}:</span>
                                <span>{result.success ? "✓ Published" : `✗ ${result.error}`}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── Replace Ads Tab ───────────────────────────────────────────── */}
          <TabsContent value="ads_replace" className="space-y-6">
            {/* Header */}
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-red-100">
                    <TrendingDown className="w-6 h-6 text-red-400" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-foreground mb-1">Replace Underperforming Ads with Free Organic Content</h2>
                    <p className="text-muted-foreground text-sm">
                      This tab identifies ads that are wasting your budget (CTR below 1%, high CPM) and generates
                      organic posts that achieve the same goal — at zero ad spend. Connect your Facebook Ads account
                      in Integrations to get started.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Controls */}
            <div className="flex items-center gap-4">
              {accountsData?.accounts && accountsData.accounts.length > 1 && (
                <Select value={selectedAdAccount} onValueChange={setSelectedAdAccount}>
                  <SelectTrigger className="w-48 bg-muted border-border text-foreground text-sm">
                    <SelectValue placeholder="Select ad account" />
                  </SelectTrigger>
                  <SelectContent className="bg-muted border-border">
                    {accountsData.accounts.map((a: any) => (
                      <SelectItem key={a.id} value={a.id} className="text-foreground text-sm">{a.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Select value={adDatePreset} onValueChange={(v: any) => setAdDatePreset(v)}>
                <SelectTrigger className="w-36 bg-muted border-border text-foreground text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-muted border-border">
                  <SelectItem value="last_7d" className="text-foreground text-sm">Last 7 days</SelectItem>
                  <SelectItem value="last_30d" className="text-foreground text-sm">Last 30 days</SelectItem>
                  <SelectItem value="last_90d" className="text-foreground text-sm">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
              <Button
                size="sm"
                variant="outline"
                onClick={() => refetchAds()}
                className="border-border text-foreground/80"
              >
                <RefreshCw className="w-3 h-3 mr-1" /> Refresh
              </Button>
            </div>

            {/* No connection */}
            {!selectedAdAccount && (
              <div className="text-center py-16">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">Connect your Facebook Ads account to see underperforming ads</p>
                <a href="/integrations">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-foreground">
                    <Facebook className="w-4 h-4 mr-2" /> Connect Facebook Ads
                  </Button>
                </a>
              </div>
            )}

            {/* Loading */}
            {loadingAds && selectedAdAccount && (
              <div className="text-center py-12 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-purple-400" />
                Loading ad performance data...
              </div>
            )}

            {/* Underperforming ads */}
            {!loadingAds && selectedAdAccount && underperformingAds.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-red-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  {underperformingAds.length} Underperforming Ads — Wasting Your Budget
                </h3>
                {underperformingAds.map((ad: any) => (
                  <Card key={ad.ad_id} className="bg-white/50 border-red-900/30">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="font-semibold text-foreground">{ad.ad_name || "Unnamed Ad"}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{ad.campaign_name}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-red-500/20 text-red-300 border-none text-xs">
                            Score {ad.performanceScore}/100
                          </Badge>
                          <Badge className="bg-red-500/20 text-red-300 border-none text-xs">
                            Underperforming
                          </Badge>
                        </div>
                      </div>

                      {/* Metrics */}
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-4">
                        {[
                          { label: "Spend", value: `R${ad.spend?.toFixed(2)}`, warn: true },
                          { label: "CTR", value: `${ad.ctr?.toFixed(2)}%`, warn: ad.ctr < 1 },
                          { label: "CPM", value: `R${ad.cpm?.toFixed(2)}`, warn: ad.cpm > 50 },
                          { label: "CPC", value: `R${ad.cpc?.toFixed(2)}`, warn: false },
                          { label: "Reach", value: ad.reach?.toLocaleString(), warn: false },
                          { label: "Impressions", value: ad.impressions?.toLocaleString(), warn: false },
                        ].map((m, i) => (
                          <div key={i} className="text-center">
                            <div className="text-xs text-muted-foreground mb-1">{m.label}</div>
                            <div className={`text-sm font-bold ${m.warn ? "text-red-400" : "text-foreground"}`}>{m.value}</div>
                          </div>
                        ))}
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleReplaceAd(ad)}
                          disabled={loadingReplacement[ad.ad_name]}
                          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-foreground text-xs"
                        >
                          {loadingReplacement[ad.ad_name] ? (
                            <><Loader2 className="w-3 h-3 mr-1 animate-spin" />Generating...</>
                          ) : (
                            <><Brain className="w-3 h-3 mr-1" />Replace with Organic Content</>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleGenerateFromAd(ad)}
                          className="border-border text-foreground/80 text-xs"
                        >
                          <Zap className="w-3 h-3 mr-1" />Quick Generate
                        </Button>
                      </div>

                      {/* Replacement content */}
                      {replacementContent[ad.ad_name] && (
                        <div className="mt-4 bg-muted/40 rounded-lg p-4 border border-purple-500/20">
                          <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="w-4 h-4 text-purple-400" />
                            <span className="text-sm font-semibold text-purple-300">Organic Replacement Content</span>
                            <Badge className="bg-green-500/20 text-green-300 border-none text-xs">
                              R0 spend
                            </Badge>
                          </div>
                          <div className="text-sm text-foreground/80">
                            <Streamdown>{replacementContent[ad.ad_name]}</Streamdown>
                          </div>
                          <div className="mt-3 flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => {
                                setBrief(replacementContent[ad.ad_name].substring(0, 300));
                                setActiveTab("generate");
                                toast.info("Content loaded into generator");
                              }}
                              className="bg-purple-600 hover:bg-purple-700 text-foreground text-xs"
                            >
                              <Sparkles className="w-3 h-3 mr-1" />Use in Generator
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* All ads summary */}
            {!loadingAds && selectedAdAccount && allAds.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  All Ads — Performance Overview
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        {["Ad Name", "Campaign", "Spend", "CTR", "CPM", "Score", "Status"].map(h => (
                          <th key={h} className="text-left py-2 px-3 text-xs text-muted-foreground font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {allAds.map((ad: any) => (
                        <tr key={ad.ad_id} className="border-b border-border hover:bg-muted/30">
                          <td className="py-2 px-3 text-foreground text-xs max-w-[200px] truncate">{ad.ad_name || "Unnamed"}</td>
                          <td className="py-2 px-3 text-muted-foreground text-xs max-w-[150px] truncate">{ad.campaign_name}</td>
                          <td className="py-2 px-3 text-yellow-400 text-xs font-medium">R{ad.spend?.toFixed(2)}</td>
                          <td className={`py-2 px-3 text-xs font-medium ${ad.ctr < 1 ? "text-red-400" : "text-green-400"}`}>{ad.ctr?.toFixed(2)}%</td>
                          <td className="py-2 px-3 text-foreground/80 text-xs">R{ad.cpm?.toFixed(2)}</td>
                          <td className="py-2 px-3 text-xs">
                            <span className={`font-bold ${ad.performanceScore > 60 ? "text-green-400" : ad.performanceScore > 30 ? "text-yellow-400" : "text-red-400"}`}>
                              {ad.performanceScore}
                            </span>
                          </td>
                          <td className="py-2 px-3">
                            <Badge className={`text-xs border-none ${
                              ad.status === "performing" ? "bg-green-50 text-green-700" :
                              ad.status === "average" ? "bg-yellow-50 text-yellow-700" :
                              "bg-red-50 text-red-700"
                            }`}>{ad.status}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {!loadingAds && selectedAdAccount && allAds.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No ad data found for this period. Try a longer date range.</p>
              </div>
            )}
          </TabsContent>

          {/* ── Posts Library Tab ─────────────────────────────────────────── */}
          <TabsContent value="posts" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {!posts?.length ? (
                <div className="col-span-3 text-center py-16 text-muted-foreground">
                  <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No posts yet. Generate your first post above.</p>
                </div>
              ) : posts.map((post) => (
                <Card key={post.id} className="bg-white/50 border-border hover:border-border/40 transition-colors">
                  <CardContent className="p-4 space-y-3">
                    {post.imageUrl && (
                      <img src={post.imageUrl} alt="" className="w-full h-32 object-cover rounded-lg" />
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {platformIcons[post.platform]}
                        <Badge className={`text-xs ${statusColors[post.status]}`}>{post.status}</Badge>
                        {post.aiGenerated && <Badge className="text-xs bg-purple-500/20 text-purple-300 border-purple-500/30">AI</Badge>}
                      </div>
                    </div>
                    <p className="text-foreground/80 text-sm line-clamp-3">{post.caption}</p>
                    {post.hashtags && <p className="text-blue-400 text-xs line-clamp-1">{post.hashtags}</p>}
                    <div className="flex gap-2 pt-1">
                      {post.status === "draft" && (
                        <Button
                          size="sm"
                          onClick={() => publishMutation.mutate({ postId: post.id })}
                          disabled={publishMutation.isPending}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-foreground text-xs"
                        >
                          <Send className="w-3 h-3 mr-1" />Publish to Facebook
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteMutation.mutate({ id: post.id })}
                        className="border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ── Weekly Planner Tab ────────────────────────────────────────── */}
          <TabsContent value="weekly" className="space-y-6">
            <Card className="bg-white/50 border-border">
              <CardHeader>
                <CardTitle className="text-foreground">AI Weekly Content Planner</CardTitle>
                <CardDescription className="text-muted-foreground">Generate a full 7-day content strategy in seconds</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-foreground/80">Week Start Date</Label>
                    <Input
                      type="date"
                      value={weekStart}
                      onChange={(e) => setWeekStart(e.target.value)}
                      className="bg-muted border-border/60 text-foreground"
                    />
                  </div>
                </div>
                <Button
                  onClick={() => weeklyPlanMutation.mutate({ weekStartDate: weekStart })}
                  disabled={weeklyPlanMutation.isPending}
                  className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-foreground"
                >
                  {weeklyPlanMutation.isPending ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Planning your week...</>
                  ) : (
                    <><Sparkles className="w-4 h-4 mr-2" />Generate Weekly Plan</>
                  )}
                </Button>
              </CardContent>
            </Card>

            {weeklyPlan.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {weeklyPlan.map((item, i) => (
                  <Card key={i} className="bg-white/50 border-border">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground">{item.day}</span>
                        {platformIcons[item.platform] || platformIcons.all}
                      </div>
                      <Badge className={`text-xs ${contentTypeColors[item.contentType] || "bg-gray-500/20 text-foreground/80"}`}>
                        {item.contentType?.replace("_", " ")}
                      </Badge>
                      <p className="text-foreground text-sm font-medium">{item.title}</p>
                      <p className="text-muted-foreground text-xs">{item.description}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>⏰ {item.postingTime}</span>
                        <span>🎯 {item.goal}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setBrief(`${item.title}: ${item.description}`);
                          setPlatform(item.platform === "all" ? "instagram" : item.platform);
                          setActiveTab("generate");
                        }}
                        className="w-full border-border text-foreground/80 text-xs mt-1"
                      >
                        <Sparkles className="w-3 h-3 mr-1" />Generate This Post
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
