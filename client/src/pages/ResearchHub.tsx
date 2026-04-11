import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Globe, 
  TrendingUp, 
  Zap, 
  Brain, 
  BarChart2,
  ExternalLink,
  Loader2,
  FileText,
  Link2,
  Target,
  Lightbulb
} from "lucide-react";
import { useServerAction } from "@/hooks/useServerAction";

interface ResearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
}

interface CompetitorData {
  name: string;
  followers: string;
  posts: string;
  engagement: string;
  topContent: string[];
}

interface TrendData {
  topic: string;
  volume: string;
  sentiment: "positive" | "neutral" | "negative";
  opportunity: string;
}

export default function ResearchHub() {
  const [query, setQuery] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ResearchResult[]>([]);
  const [competitors, setCompetitors] = useState<CompetitorData[]>([]);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [activeTab, setActiveTab] = useState("search");

  // Mock data for demonstration
  const mockResults: ResearchResult[] = [
    { title: "Premium Meat Trends 2026", url: "https://example.com/meat-trends", snippet: "Consumer demand for premium, ethically-sourced meat continues to grow...", source: "Food Industry Weekly" },
    { title: "Wagyu Beef Market Analysis", url: "https://example.com/wagyu-analysis", snippet: "Global wagyu market projected to reach $15B by 2028...", source: "Market Watch" },
    { title: "South African Beef Industry Report", url: "https://example.com/sa-beef", snippet: "Halaal-certified beef sees 40% growth in export markets...", source: "Agri Business SA" },
  ];

  const mockCompetitors: CompetitorData[] = [
    { name: "Premium Beef Co", followers: "45K", posts: "320", engagement: "4.2%", topContent: ["Ribeye recipes", "Farm stories", "Cooking tips"] },
    { name: "Artisan Meats", followers: "28K", posts: "180", engagement: "3.8%", topContent: ["Product launches", "Chef collaborations", "Behind scenes"] },
    { name: "Farm to Table SA", followers: "62K", posts: "450", engagement: "5.1%", topContent: ["Sustainability", "Origin stories", "Recipes"] },
  ];

  const mockTrends: TrendData[] = [
    { topic: "Halaal Premium", volume: "High", sentiment: "positive", opportunity: "Growing demand in Middle East markets" },
    { topic: "Sustainable Farming", volume: "Very High", sentiment: "positive", opportunity: "Premium pricing for ethical sourcing" },
    { topic: "Ankole Beef", volume: "Growing", sentiment: "neutral", opportunity: "Unique selling point in luxury segment" },
    { topic: "Direct to Consumer", volume: "High", sentiment: "positive", opportunity: "Subscription boxes and online store" },
  ];

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    
    // Simulate search delay
    await new Promise(r => setTimeout(r, 1500));
    setResults(mockResults);
    setLoading(false);
  };

  const handleAnalyzeUrl = async () => {
    if (!url.trim()) return;
    setLoading(true);
    
    // Simulate URL analysis
    await new Promise(r => setTimeout(r, 2000));
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Research Hub
            </h1>
            <p className="text-muted-foreground">AI-powered market research and competitive analysis</p>
          </div>
          <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">
            <Zap className="w-3 h-3 mr-1" />
            Firecrawl Connected
          </Badge>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border-cyan-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Searches Left</p>
                  <p className="text-2xl font-bold">450K</p>
                  <p className="text-xs text-muted-foreground">of 500K credits</p>
                </div>
                <Globe className="w-8 h-8 text-cyan-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Competitors</p>
                  <p className="text-2xl font-bold">{competitors.length || 3}</p>
                  <p className="text-xs text-muted-foreground">tracked</p>
                </div>
                <Target className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Trends</p>
                  <p className="text-2xl font-bold">{trends.length || 4}</p>
                  <p className="text-xs text-muted-foreground">analyzed</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Insights</p>
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-xs text-muted-foreground">generated</p>
                </div>
                <Lightbulb className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl">
            <TabsTrigger value="search" className="gap-2">
              <Search className="w-4 h-4" />
              Search
            </TabsTrigger>
            <TabsTrigger value="competitors" className="gap-2">
              <Target className="w-4 h-4" />
              Competitors
            </TabsTrigger>
            <TabsTrigger value="trends" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Trends
            </TabsTrigger>
            <TabsTrigger value="insights" className="gap-2">
              <Brain className="w-4 h-4" />
              AI Insights
            </TabsTrigger>
          </TabsList>

          {/* Search Tab */}
          <TabsContent value="search" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <Input 
                    placeholder="Search topics, keywords, competitors..." 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="flex-1"
                  />
                  <Button onClick={handleSearch} disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    Search
                  </Button>
                </div>
              </CardContent>
            </Card>

            {results.length > 0 && (
              <div className="space-y-3">
                {results.map((result, i) => (
                  <Card key={i} className="hover:bg-card/80 transition-colors">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{result.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{result.snippet}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">{result.source}</Badge>
                            <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 flex items-center gap-1 hover:underline">
                              <ExternalLink className="w-3 h-3" />
                              Visit
                            </a>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Competitors Tab */}
          <TabsContent value="competitors" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Competitor Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {mockCompetitors.map((comp, i) => (
                    <div key={i} className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">{comp.name}</h3>
                        <Badge>{comp.followers} followers</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Posts</p>
                          <p className="font-medium">{comp.posts}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Engagement</p>
                          <p className="font-medium text-green-400">{comp.engagement}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Top Content</p>
                          <p className="font-medium">{comp.topContent[0]}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Market Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockTrends.map((trend, i) => (
                    <div key={i} className="p-4 bg-muted/50 rounded-lg flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{trend.topic}</h3>
                        <p className="text-sm text-muted-foreground">{trend.opportunity}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={trend.sentiment === "positive" ? "default" : "secondary"} className={trend.sentiment === "positive" ? "bg-green-500" : ""}>
                          {trend.sentiment}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">{trend.volume} volume</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="insights" className="space-y-4">
            <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-400" />
                  AI-Generated Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-background/50 rounded-lg">
                  <h4 className="font-semibold text-purple-400 mb-2">Content Strategy</h4>
                  <p className="text-sm">Focus on "farm-to-table" narratives. Competitors with highest engagement use authenticity and behind-the-scenes content. Naledi's lifestyle content should emphasize the premium, self-care angle.</p>
                </div>
                <div className="p-4 bg-background/50 rounded-lg">
                  <h4 className="font-semibold text-purple-400 mb-2">Posting Times</h4>
                  <p className="text-sm">Best times for meat/food content: 6-7 PM (dinner prep), 12-1 PM (lunch), weekends 10 AM-2 PM. Engagement drops 40% after 9 PM.</p>
                </div>
                <div className="p-4 bg-background/50 rounded-lg">
                  <h4 className="font-semibold text-purple-400 mb-2">Platform Priority</h4>
                  <p className="text-sm">Instagram Reels &gt; TikTok &gt; Facebook for your target demographic. TikTok is growing but lower conversion. Focus on IG for direct sales.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* URL Analysis Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Analyze Website
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input 
                placeholder="Enter website URL to analyze..." 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleAnalyzeUrl} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BarChart2 className="w-4 h-4" />}
                Analyze
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Enter a competitor's website to extract their content strategy, posting frequency, and top-performing posts.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}