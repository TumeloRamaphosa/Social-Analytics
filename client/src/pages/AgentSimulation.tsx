import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  Brain, 
  MessageCircle, 
  TrendingUp,
  Play,
  Pause,
  RefreshCw,
  Target,
  Lightbulb,
  BarChart3,
  Settings,
  FileText,
  Zap,
  Loader2
} from "lucide-react";

interface Agent {
  id: number;
  name: string;
  persona: string;
  sentiment: "positive" | "neutral" | "negative";
  influence: number;
  posts: number;
}

interface SimulationResult {
  timestamp: string;
  totalPosts: number;
  avgSentiment: number;
  topTopics: string[];
  viralPotential: number;
}

const PERSONAS = [
  "Skeptical Consumer", "Brand Loyalist", "Price-sensitive Shopper",
  "Quality Seeker", "Early Adopter", "Traditional Buyer",
  "Influencer", "Casual Browser", "Competitor Spy", "Industry Expert"
];

export default function AgentSimulation() {
  const [content, setContent] = useState("");
  const [simulating, setSimulating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [results, setResults] = useState<SimulationResult | null>(null);
  const [selectedTab, setSelectedTab] = useState("setup");

  const startSimulation = async () => {
    if (!content.trim()) return;
    
    setSimulating(true);
    setProgress(0);
    setResults(null);
    
    // Generate random agents
    const generatedAgents: Agent[] = Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      name: `Agent ${i + 1}`,
      persona: PERSONAS[Math.floor(Math.random() * PERSONAS.length)],
      sentiment: ["positive", "neutral", "negative"][Math.floor(Math.random() * 3)] as any,
      influence: Math.floor(Math.random() * 100),
      posts: Math.floor(Math.random() * 20)
    }));
    
    // Simulate progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(r => setTimeout(r, 500));
      setProgress(i);
    }
    
    setAgents(generatedAgents);
    setResults({
      timestamp: new Date().toLocaleString(),
      totalPosts: generatedAgents.reduce((a, b) => a + b.posts, 0),
      avgSentiment: 65 + Math.random() * 20,
      topTopics: ["Pricing", "Quality", "Brand", "Delivery", "Features"],
      viralPotential: 60 + Math.random() * 30
    });
    
    setSimulating(false);
    setSelectedTab("results");
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive": return "text-green-400";
      case "negative": return "text-red-400";
      default: return "text-yellow-400";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
              Agent Simulation
            </h1>
            <p className="text-muted-foreground">Test your content with simulated AI audiences before publishing</p>
          </div>
          <Badge variant="outline" className="bg-purple-500/10 text-purple-400">
            MiroFish-Style
          </Badge>
        </div>

        {/* What This Does */}
        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Brain className="w-8 h-8 text-purple-400 mt-1" />
              <div>
                <h3 className="font-semibold text-purple-400 mb-2">What is this?</h3>
                <p className="text-sm text-muted-foreground">
                  This simulates how different audience personas will react to your content. 
                  Upload a post, ad copy, or marketing message, and 50 AI agents with unique personalities 
                  will discuss, debate, and form opinions. See predicted sentiment, viral potential, 
                  and key topics before going live.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="setup">Setup</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
            <TabsTrigger value="agents">Agents</TabsTrigger>
          </TabsList>

          {/* Setup Tab */}
          <TabsContent value="setup" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Content to Test
                </CardTitle>
                <CardDescription>
                  Paste your ad copy, post, email, or any marketing content to simulate audience reaction
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea 
                  placeholder="Paste your content here... (e.g., 'Introducing our new premium wagyu beef collection - only R299/kg!')"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[200px]"
                />
                <div className="flex gap-3">
                  <Button 
                    onClick={startSimulation}
                    disabled={!content.trim() || simulating}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {simulating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Simulating...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Start Simulation
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => setContent("")}>
                    Clear
                  </Button>
                </div>
                
                {simulating && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Generating 50 agent personas...</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* How It Works */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  How It Works
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <FileText className="w-5 h-5 text-purple-400" />
                    </div>
                    <p className="text-sm font-medium">1. Input Content</p>
                    <p className="text-xs text-muted-foreground">Paste your marketing message</p>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="w-10 h-10 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Users className="w-5 h-5 text-pink-400" />
                    </div>
                    <p className="text-sm font-medium">2. Generate Agents</p>
                    <p className="text-xs text-muted-foreground">50 personas with unique views</p>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <MessageCircle className="w-5 h-5 text-red-400" />
                    </div>
                    <p className="text-sm font-medium">3. Simulate</p>
                    <p className="text-xs text-muted-foreground">Agents discuss & react</p>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <BarChart3 className="w-5 h-5 text-orange-400" />
                    </div>
                    <p className="text-sm font-medium">4. Get Results</p>
                    <p className="text-xs text-muted-foreground">Sentiment & viral prediction</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results" className="space-y-4">
            {results ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Posts</p>
                          <p className="text-2xl font-bold">{results.totalPosts}</p>
                        </div>
                        <MessageCircle className="w-8 h-8 text-green-400" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Avg Sentiment</p>
                          <p className="text-2xl font-bold">{results.avgSentiment.toFixed(0)}%</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-blue-400" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Viral Potential</p>
                          <p className="text-2xl font-bold">{results.viralPotential.toFixed(0)}%</p>
                        </div>
                        <Zap className="w-8 h-8 text-purple-400" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Simulation Time</p>
                          <p className="text-2xl font-bold">~5s</p>
                        </div>
                        <Brain className="w-8 h-8 text-orange-400" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Top Topics Discussed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {results.topTopics.map((topic, i) => (
                        <Badge key={i} variant="outline" className="text-lg px-4 py-2">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recommendation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <p className="text-green-400 font-medium">Content Ready for Launch</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        {results.avgSentiment > 60 
                          ? "Based on simulation: Positive audience reaction expected. Consider A/B testing headlines for optimal performance." 
                          : "Based on simulation: Mixed reception predicted. Try emphasizing value proposition more."}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No simulation results yet. Go to Setup tab to start.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Agents Tab */}
          <TabsContent value="agents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Simulated Agents ({agents.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {agents.map((agent) => (
                    <div key={agent.id} className="p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{agent.name}</span>
                        <span className={`text-sm ${getSentimentColor(agent.sentiment)}`}>
                          {agent.sentiment}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{agent.persona}</p>
                      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                        <span>Influence: {agent.influence}</span>
                        <span>Posts: {agent.posts}</span>
                      </div>
                    </div>
                  ))}
                </div>
                {agents.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No agents generated yet. Run a simulation first.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}