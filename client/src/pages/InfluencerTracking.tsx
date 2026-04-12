import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users,
  Instagram,
  Youtube,
  MessageCircle,
  TrendingUp,
  DollarSign,
  Star,
  Search,
  Plus,
  ExternalLink,
  ArrowUpRight,
  Zap,
  Crown,
  Handshake,
  Target,
  Copy,
  CheckCircle
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

interface Influencer {
  id: string;
  name: string;
  handle: string;
  platform: "instagram" | "youtube" | "tiktok" | "twitter";
  followers: number;
  engagement: number;
  niche: string;
  tier: "micro" | "mid" | "macro" | "mega";
  audience: string[];
  estimatedCost: number;
  pastPerformance?: {
    posts: number;
    revenue: number;
    roi: number;
  };
  status: "outreach" | "negotiating" | "active" | "completed";
  brand: "studex-meat" | "studex-global" | "studex-devops";
}

const TIER_COLORS = {
  micro: "bg-green-500/20 text-green-400",
  mid: "bg-cyan-500/20 text-cyan-400",
  macro: "bg-purple-500/20 text-purple-400",
  mega: "bg-yellow-500/20 text-yellow-400",
};

const PLATFORM_ICONS = {
  instagram: <Instagram className="w-4 h-4" />,
  youtube: <Youtube className="w-4 h-4" />,
  tiktok: <MessageCircle className="w-4 h-4" />,
  twitter: <MessageCircle className="w-4 h-4" />,
};

const BRAND_NAMES = {
  "studex-meat": "Studex Meat",
  "studex-global": "Studex Global Markets", 
  "studex-devops": "Studex Devops / Agentic Lab",
};

const mockInfluencers: Influencer[] = [
  {
    id: "1",
    name: "Foodie Jozi",
    handle: "@foodiejozisa",
    platform: "instagram",
    followers: 45000,
    engagement: 4.2,
    niche: "Food & Dining",
    audience: ["Johannesburg", "Premium food", "25-45"],
    estimatedCost: 2500,
    pastPerformance: { posts: 3, revenue: 15000, roi: 500 },
    status: "active",
    brand: "studex-meat",
  },
  {
    id: "2",
    name: "Chef Thabo",
    handle: "@chefthabo",
    platform: "youtube",
    followers: 120000,
    engagement: 6.8,
    niche: "Cooking & Recipes",
    audience: ["Home cooks", "Meat lovers", "Male 30-50"],
    estimatedCost: 8000,
    pastPerformance: { posts: 2, revenue: 28000, roi: 250 },
    status: "active",
    brand: "studex-meat",
  },
  {
    id: "3",
    name: "Tech SA",
    handle: "@techsa",
    platform: "twitter",
    followers: 28000,
    engagement: 3.1,
    niche: "Tech & Startups",
    audience: ["Devs", "Startup founders", "Tech ecosystem"],
    estimatedCost: 3500,
    status: "negotiating",
    brand: "studex-devops",
  },
  {
    id: "4",
    name: "Cape Foodie",
    handle: "@capefoodie",
    platform: "instagram",
    followers: 32000,
    engagement: 3.8,
    niche: "Food & Dining",
    audience: ["Cape Town", "Premium dining", "28-45"],
    estimatedCost: 2000,
    status: "outreach",
    brand: "studex-meat",
  },
  {
    id: "5",
    name: "Market Watch SA",
    handle: "@marketwatchsa",
    platform: "twitter",
    followers: 15000,
    engagement: 2.4,
    niche: "Finance & Markets",
    audience: ["Investors", "Traders", "Business"],
    estimatedCost: 5000,
    status: "outreach",
    brand: "studex-global",
  },
  {
    id: "6",
    name: "Biltong King",
    handle: "@biltongking",
    platform: "instagram",
    followers: 18000,
    engagement: 5.2,
    niche: "South African Food",
    audience: ["Biltong lovers", "SA expats", "Premium meat"],
    estimatedCost: 1500,
    pastPerformance: { posts: 5, revenue: 12000, roi: 700 },
    status: "active",
    brand: "studex-meat",
  },
];

export default function InfluencerTracking() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<"all" | "studex-meat" | "studex-global" | "studex-devops">("all");
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredInfluencers = mockInfluencers.filter((inf) => {
    const matchesSearch = inf.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inf.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inf.niche.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBrand = selectedBrand === "all" || inf.brand === selectedBrand;
    return matchesSearch && matchesBrand;
  });

  const getInfluencersByStatus = (status: Influencer["status"]) => 
    filteredInfluencers.filter((i) => i.status === status).length;

  const getTotalSpend = () => 
    filteredInfluencers.reduce((sum, i) => sum + i.estimatedCost, 0);

  const getProjectedRevenue = () => 
    filteredInfluencers.reduce((sum, i) => sum + (i.pastPerformance?.revenue || i.estimatedCost * 3), 0);

  const getActiveInfluencers = () => 
    filteredInfluencers.filter((i) => i.status === "active");

  const getStatusBadge = (status: Influencer["status"]) => {
    switch (status) {
      case "active": return "bg-green-500/20 text-green-400";
      case "negotiating": return "bg-yellow-500/20 text-yellow-400";
      case "outreach": return "bg-blue-500/20 text-blue-400";
      case "completed": return "bg-gray-500/20 text-gray-400";
    }
  };

  const getTamplate = (influencer: Influencer) => {
    const brandName = BRAND_NAMES[influencer.brand];
    return `Hey ${influencer.name.split(" ")[0]}! 

We're ${brandName} - premium South African beef (Wagyu & Ankole). 
Love your content about ${influencer.niche}.

We'd love to send you some samples and collaborate. 
What's your rate for:
- 1 in-feed post with story
- Product inclusion

Let us know!
- ${brandName}`;
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Influencer Tracking
            </h1>
            <p className="text-muted-foreground">
              Manage influencer partnerships across Studex brands
            </p>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Influencer
          </Button>
        </div>

        <Tabs defaultValue="pipeline" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
            <TabsTrigger value="active">Active ({getInfluencersByStatus("active")})</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="pipeline" className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active</p>
                      <p className="text-2xl font-bold text-green-400">{getInfluencersByStatus("active")}</p>
                    </div>
                    <Handshake className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Negotiating</p>
                      <p className="text-2xl font-bold text-yellow-400">{getInfluencersByStatus("negotiating")}</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Outreach</p>
                      <p className="text-2xl font-bold text-blue-400">{getInfluencersByStatus("outreach")}</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Projected Revenue</p>
                      <p className="text-2xl font-bold text-purple-400">R{getProjectedRevenue().toLocaleString()}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search influencers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant={selectedBrand === "all" ? "default" : "outline"} 
                  onClick={() => setSelectedBrand("all")}
                  size="sm"
                >
                  All
                </Button>
                <Button 
                  variant={selectedBrand === "studex-meat" ? "default" : "outline"} 
                  onClick={() => setSelectedBrand("studex-meat")}
                  size="sm"
                >
                  Meat
                </Button>
                <Button 
                  variant={selectedBrand === "studex-global" ? "default" : "outline"} 
                  onClick={() => setSelectedBrand("studex-global")}
                  size="sm"
                >
                  Global
                </Button>
                <Button 
                  variant={selectedBrand === "studex-devops" ? "default" : "outline"} 
                  onClick={() => setSelectedBrand("studex-devops")}
                  size="sm"
                >
                  Devops
                </Button>
              </div>
            </div>

            {/* Influencer List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredInfluencers.map((influencer) => (
                <Card key={influencer.id} className="bg-card/50 hover:bg-card transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-white font-bold">
                          {influencer.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{influencer.name}</p>
                          <p className="text-sm text-muted-foreground">{influencer.handle}</p>
                        </div>
                      </div>
                      <Badge className={getStatusBadge(influencer.status)}>
                        {influencer.status}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 mb-3">
                      <Badge variant="outline" className={PLATFORM_ICONS[influencer.platform] ? "" : ""}>
                        {PLATFORM_ICONS[influencer.platform]}
                        <span className="ml-1">{influencer.platform}</span>
                      </Badge>
                      <Badge className={TIER_COLORS[influencer.tier]}>
                        {influencer.tier}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {influencer.followers.toLocaleString()} followers
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {influencer.audience.map((a) => (
                        <Badge key={a} variant="outline" className="text-xs">
                          {a}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t">
                      <div>
                        <p className="text-sm text-muted-foreground">Estimated Cost</p>
                        <p className="font-medium">R{influencer.estimatedCost.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Brand</p>
                        <Badge variant="outline">{BRAND_NAMES[influencer.brand]}</Badge>
                      </div>
                      {influencer.pastPerformance && (
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">ROI</p>
                          <p className="font-medium text-green-400">{(influencer.pastPerformance.roi / 100).toFixed(0)}%</p>
                        </div>
                      )}
                    </div>

                    {influencer.status === "outreach" && (
                      <div className="mt-3 pt-3 border-t">
                        <Button variant="outline" size="sm" className="w-full">
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Outreach Template
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Active Partnerships</CardTitle>
                <CardDescription>
                  {getActiveInfluencers().length} currently promoting Studex brands
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getActiveInfluencers().map((inf) => (
                    <div key={inf.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-white text-sm">
                          {inf.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{inf.name}</p>
                          <p className="text-sm text-muted-foreground">{inf.handle}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">ROI</p>
                          <p className="font-medium text-green-400">{(inf.pastPerformance?.roi || 0) / 100}%</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Revenue</p>
                          <p className="font-medium">R{inf.pastPerformance?.revenue?.toLocaleString() || 0}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Posts</p>
                          <p className="font-medium">{inf.pastPerformance?.posts || 0}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Total Investment</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">R{getTotalSpend().toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Across {filteredInfluencers.length} influencers</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Projected Return</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-green-400">R{getProjectedRevenue().toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Based on historical ROI</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Average ROAS</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-purple-400">4.2x</p>
                  <p className="text-sm text-muted-foreground">Return on ad spend</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 border-pink-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-pink-400" />
                  Recommended influencer mix for Studex Meat
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-pink-500/10 rounded-lg">
                  <p className="font-medium text-pink-400 mb-2">Tier 1: Mega Influencer (R15K)</p>
                  <p className="text-sm text-muted-foreground">
                    1 celebrity chef or food personality with 500K+ followers. 
                    Creates 1 hero video showcasing Wagyu or Ankole.
                  </p>
                </div>
                
                <div className="p-4 bg-purple-500/10 rounded-lg">
                  <p className="font-medium text-purple-400 mb-2">Tier 2: Macro (R8K x 3)</p>
                  <p className="text-sm text-muted-foreground">
                    3 food bloggers with 50K-200K followers. 
                    Each creates 2 posts + 3 stories featuring products.
                  </p>
                </div>

                <div className="p-4 bg-cyan-500/10 rounded-lg">
                  <p className="font-medium text-cyan-400 mb-2">Tier 3: Micro (R2K x 10)</p>
                  <p className="text-sm text-muted-foreground">
                    10 micro-influencers (10K-50K) for authentic reach. 
                    GIVES samples, asks for honest content.
                  </p>
                </div>

                <div className="p-4 bg-green-500/10 rounded-lg">
                  <p className="font-medium text-green-400 mb-2">Total Budget: R53K</p>
                  <p className="text-sm text-muted-foreground">
                    Expected reach: 2M+ / Expected revenue: R200K+ 
                    (3.8x ROAS)
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