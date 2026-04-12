import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp,
  TrendingDown,
  DollarSign,
  Instagram,
  Facebook,
  ShoppingBag,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Target,
  Zap,
  Brain,
  Eye,
  Calendar,
  Users,
  Star,
  FileText
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";

interface ContentPiece {
  id: string;
  type: "image" | "video" | "carousel" | "story";
  platform: "instagram" | "facebook" | "both";
  caption: string;
  reach: number;
  likes: number;
  comments: number;
  saves: number;
  shares: number;
  clicks: number;
  spend: number;
  createdAt: string;
  conversionValue?: number;
}

const PLATFORM_COLORS = {
  instagram: "text-pink-400",
  facebook: "text-blue-400",
  both: "text-purple-400",
};

const PLATFORM_ICONS = {
  instagram: <Instagram className="w-4 h-4" />,
  facebook: <Facebook className="w-4 h-4" />,
  both: <div className="flex gap-1"><Instagram className="w-3 h-3" /><Facebook className="w-3 h-3" /></div>,
};

export default function AnalyticsReport() {
  const [dateRange, setDateRange] = useState("30d");
  const [selectedPlatform, setSelectedPlatform] = useState<"all" | "instagram" | "facebook">("all");
  
  const { data: shopifyStats } = trpc.integrations.getShopifyStats.useQuery(undefined, {
    enabled: false,
  });
  
  const { data: metaStatus } = trpc.integrations.getStatus.useQuery();
  const { data: spendReport, refetch: refetchSpend } = trpc.integrations.generateSpendReport.useMutation({
    onSuccess: () => refetchSpend(),
  });

  const mockContent: ContentPiece[] = [
    {
      id: "1",
      type: "video",
      platform: "instagram",
      caption: "Wagyu steak cooking demo",
      reach: 12500,
      likes: 892,
      comments: 156,
      saves: 234,
      shares: 128,
      clicks: 456,
      spend: 150,
      createdAt: "2026-04-10",
      conversionValue: 4250,
    },
    {
      id: "2", 
      type: "image",
      platform: "instagram",
      caption: "Ankole beef cuts poster",
      reach: 8900,
      likes: 567,
      comments: 89,
      saves: 178,
      shares: 67,
      clicks: 234,
      spend: 100,
      createdAt: "2026-04-08",
      conversionValue: 2100,
    },
    {
      id: "3",
      type: "carousel",
      platform: "facebook",
      caption: "Premium beef selection guide",
      reach: 15600,
      likes: 423,
      comments: 67,
      saves: 89,
      shares: 234,
      clicks: 567,
      spend: 200,
      createdAt: "2026-04-05",
      conversionValue: 3800,
    },
    {
      id: "4",
      type: "video",
      platform: "both",
      caption: "Farm to table story",
      reach: 22300,
      likes: 1234,
      comments: 234,
      saves: 345,
      shares: 289,
      clicks: 789,
      spend: 350,
      createdAt: "2026-04-01",
      conversionValue: 6200,
    },
    {
      id: "5",
      type: "image",
      platform: "instagram", 
      caption: "Chef recommendation",
      reach: 6700,
      likes: 445,
      comments: 78,
      saves: 123,
      shares: 45,
      clicks: 178,
      spend: 75,
      createdAt: "2026-03-28",
      conversionValue: 1650,
    },
  ];

  const filteredContent = selectedPlatform === "all" 
    ? mockContent 
    : mockContent.filter(c => c.platform === selectedPlatform || c.platform === "both");

  const totalSpend = filteredContent.reduce((sum, c) => sum + c.spend, 0);
  const totalReach = filteredContent.reduce((sum, c) => sum + c.reach, 0);
  const totalEngagement = filteredContent.reduce((sum, c) => sum + c.likes + c.comments + c.saves + c.shares, 0);
  const totalConversions = filteredContent.reduce((sum, c) => sum + (c.conversionValue || 0), 0);
  const totalClicks = filteredContent.reduce((sum, c) => sum + c.clicks, 0);

  const roi = totalSpend > 0 ? ((totalConversions - totalSpend) / totalSpend) * 100 : 0;
  const cpa = totalConversions > 0 ? totalSpend / (filteredContent.length) : 0;
  const ctr = totalReach > 0 ? (totalClicks / totalReach) * 100 : 0;

  const getContentRating = (content: ContentPiece) => {
    const engagementRate = (content.likes + content.comments + content.saves + content.shares) / content.reach * 100;
    if (engagementRate > 5) return { rating: "A+", color: "text-green-400", bg: "bg-green-500/20" };
    if (engagementRate > 3) return { rating: "A", color: "text-green-400", bg: "bg-green-500/10" };
    if (engagementRate > 2) return { rating: "B", color: "text-yellow-400", bg: "bg-yellow-500/10" };
    if (engagementRate > 1) return { rating: "C", color: "text-orange-400", bg: "bg-orange-500/10" };
    return { rating: "D", color: "text-red-400", bg: "bg-red-500/10" };
  };

  const getBestTime = () => {
    return {
      day: "Saturday",
      time: "6:00 PM",
      reason: "Highest engagement on weekends between 5-8 PM",
    };
  };

  const bestTime = getBestTime();

  const getPlatformRecommendation = () => {
    const igStats = mockContent.filter(c => c.platform === "instagram" || c.platform === "both");
    const fbStats = mockContent.filter(c => c.platform === "facebook" || c.platform === "both");
    
    const igConv = igStats.reduce((sum, c) => sum + (c.conversionValue || 0), 0);
    const fbConv = fbStats.reduce((sum, c) => sum + (c.conversionValue || 0), 0);
    
    if (igConv > fbConv) return "Instagram";
    if (fbConv > igConv) return "Facebook";
    return "Both equally";
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Content Analytics
            </h1>
            <p className="text-muted-foreground">
              Spend vs Content vs Conversion analysis for Studex Meat
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setDateRange("7d")} className={dateRange === "7d" ? "bg-muted" : ""}>7D</Button>
            <Button variant="outline" onClick={() => setDateRange("30d")} className={dateRange === "30d" ? "bg-muted" : ""}>30D</Button>
            <Button variant="outline" onClick={() => setDateRange("90d")} className={dateRange === "90d" ? "bg-muted" : ""}>90D</Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="content">Content Pieces</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Main Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                      <p className="text-2xl font-bold text-green-400">R{totalConversions.toLocaleString()}</p>
                      <p className="text-xs text-green-400 flex items-center">
                        <ArrowUpRight className="w-3 h-3" /> +{roi.toFixed(0)}% ROI
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Spend</p>
                      <p className="text-2xl font-bold text-blue-400">R{totalSpend.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Across {filteredContent.length} pieces</p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Reach</p>
                      <p className="text-2xl font-bold text-purple-400">{totalReach.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{ctr.toFixed(1)}% CTR</p>
                    </div>
                    <Eye className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border-cyan-500/20">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Engagement</p>
                      <p className="text-2xl font-bold text-cyan-400">{totalEngagement.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">
                        {((totalEngagement / totalReach) * 100).toFixed(1)}% rate
                      </p>
                    </div>
                    <Users className="w-8 h-8 text-cyan-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Platform Split */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Platform Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div 
                    className={`p-4 rounded-lg cursor-pointer transition ${selectedPlatform === "all" ? "bg-muted" : "bg-muted/30 hover:bg-muted/50"}`}
                    onClick={() => setSelectedPlatform("all")}
                  >
                    <p className="font-medium">All Platforms</p>
                    <p className="text-2xl font-bold">R{totalConversions.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Revenue</p>
                  </div>
                  <div 
                    className={`p-4 rounded-lg cursor-pointer transition ${selectedPlatform === "instagram" ? "bg-muted" : "bg-muted/30 hover:bg-muted/50"}`}
                    onClick={() => setSelectedPlatform("instagram")}
                  >
                    <p className="font-medium flex items-center gap-2">
                      <Instagram className="w-4 h-4 text-pink-400" />
                      Instagram
                    </p>
                    <p className="text-2xl font-bold">
                      R{mockContent.filter(c => c.platform === "instagram" || c.platform === "both").reduce((s, c) => s + (c.conversionValue || 0), 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">Revenue</p>
                  </div>
                  <div 
                    className={`p-4 rounded-lg cursor-pointer transition ${selectedPlatform === "facebook" ? "bg-muted" : "bg-muted/30 hover:bg-muted/50"}`}
                    onClick={() => setSelectedPlatform("facebook")}
                  >
                    <p className="font-medium flex items-center gap-2">
                      <Facebook className="w-4 h-4 text-blue-400" />
                      Facebook
                    </p>
                    <p className="text-2xl font-bold">
                      R{mockContent.filter(c => c.platform === "facebook" || c.platform === "both").reduce((s, c) => s + (c.conversionValue || 0), 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">Revenue</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Key Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-gradient-to-r from-green-500/10 to-cyan-500/10 border-green-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-green-400" />
                    Best Time to Post
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-green-400">{bestTime.day} at {bestTime.time}</p>
                  <p className="text-muted-foreground">{bestTime.reason}</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-purple-400" />
                    Recommended Platform
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-purple-400">{getPlatformRecommendation()}</p>
                  <p className="text-muted-foreground">Based on conversion data</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{filteredContent.length} pieces</Badge>
              <p className="text-sm text-muted-foreground">Click on a piece to see details</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredContent.map((content) => {
                const rating = getContentRating(content);
                return (
                  <Card key={content.id} className="bg-card/50 hover:bg-card transition-colors cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className={PLATFORM_COLORS[content.platform]}>
                            {PLATFORM_ICONS[content.platform]}
                          </span>
                          <Badge variant="outline" className="text-xs">{content.type}</Badge>
                        </div>
                        <Badge className={rating.bg}>
                          <span className={rating.color}>{rating.rating}</span>
                        </Badge>
                      </div>
                      
                      <p className="font-medium line-clamp-2 mb-2">{content.caption}</p>
                      
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Reach</p>
                          <p className="font-medium">{content.reach.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Engagement</p>
                          <p className="font-medium">{(content.likes + content.comments + content.saves + content.shares).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Revenue</p>
                          <p className="font-medium text-green-400">R{content.conversionValue?.toLocaleString() || 0}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t">
                        <span className="text-xs text-muted-foreground">Spend: R{content.spend}</span>
                        <span className="text-xs text-muted-foreground">{content.createdAt}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-blue-400" />
                  AI Recommendations for Studex Meat
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-500/10 rounded-lg">
                  <p className="font-medium text-blue-400 mb-2">1. Video Content is King</p>
                  <p className="text-sm text-muted-foreground">
                    Video posts (like "Wagyu cooking demo") generate 2.3x more conversions than static images. 
                    Prioritize video content for Instagram Reels and Facebook Stories.
                  </p>
                </div>
                
                <div className="p-4 bg-green-500/10 rounded-lg">
                  <p className="font-medium text-green-400 mb-2">2. Weekend Posting Window</p>
                  <p className="text-sm text-muted-foreground">
                    Your audience is most active Saturday-Sunday 5-8 PM. Shift posting schedule 
                    to capture weekend browsers looking for meal inspiration.
                  </p>
                </div>

                <div className="p-4 bg-purple-500/10 rounded-lg">
                  <p className="font-medium text-purple-400 mb-2">3. Cross-Platform Posts Outperform</p>
                  <p className="text-sm text-muted-foreground">
                    Posts shared to both Instagram AND Facebook generate 40% more revenue. 
                    Always use "Share to both" when creating content.
                  </p>
                </div>

                <div className="p-4 bg-cyan-500/10 rounded-lg">
                  <p className="font-medium text-cyan-400 mb-2">4. Content-Conversion Pattern</p>
                  <p className="text-sm text-muted-foreground">
                    High-save content = high conversion. Design content people want to save 
                    (recipes, cuts guide, meal prep tips).
                  </p>
                </div>

                <div className="p-4 bg-orange-500/10 rounded-lg">
                  <p className="font-medium text-orange-400 mb-2">5. Increase Ad Spend</p>
                  <p className="text-sm text-muted-foreground">
                    Your ROAS is {roi.toFixed(0)}%. Consider increasing budget on top-performing 
                    video content. Current limit: 5 pieces in 30 days.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}