import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain,
  Bot,
  Sparkles,
  Zap,
  Globe,
  Search,
  Target,
  MessageCircle,
  Image,
  Video,
  DollarSign,
  TrendingUp,
  Users,
  Shield,
  Cpu,
  Rocket,
  Layers,
  Workflow,
  Eye,
  Lightbulb,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  ExternalLink,
  BookOpen
} from "lucide-react";

interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
  icon: React.ReactNode;
  status: "active" | "learning" | "paused";
  tasks: string[];
  capabilities: string[];
}

interface Skill {
  id: string;
  name: string;
  category: "research" | "content" | "marketing" | "sales" | "analytics";
  description: string;
  icon: React.ReactNode;
  prompts: string[];
  enabled: boolean;
}

const AGENTS: Agent[] = [
  {
    id: "naledi",
    name: "Naledi (CMO)",
    role: "Chief Marketing Officer",
    description: "Main WhatsApp agent for customer inquiries, order management, and brand voice",
    icon: <MessageCircle className="w-6 h-6" />,
    status: "active",
    tasks: [
      "Handle WhatsApp customer queries",
      "Process orders via WhatsApp",
      "Share product info and pricing",
      "Send order confirmations"
    ],
    capabilities: [
      "WhatsApp Business API",
      "Order processing",
      "Product catalog lookup",
      "Order tracking"
    ]
  },
  {
    id: "amara",
    name: "Amara",
    role: "Social Media Manager",
    description: "Manages Instagram, Facebook, and cross-posting to all platforms",
    icon: <Image className="w-6 h-6" />,
    status: "active",
    tasks: [
      "Schedule posts across platforms",
      "Generate captions and hashtags",
      "Cross-post to all channels",
      "Track engagement metrics"
    ],
    capabilities: [
      "Multi-platform posting",
      "Caption generation",
      "Hashtag optimization",
      "Engagement tracking"
    ]
  },
  {
    id: "charlie",
    name: "Charlie",
    role: "Voice & Calling Agent",
    description: "Handles voice calls, follows up on leads, and customer service calls",
    icon: <MessageCircle className="w-6 h-6" />,
    status: "learning",
    tasks: [
      "Inbound call handling",
      "Lead follow-up calls",
      "Customer service calls",
      "Order confirmation calls"
    ],
    capabilities: [
      "Voice synthesis",
      "Speech-to-text",
      "Call scheduling",
      "CRM integration"
    ]
  },
  {
    id: "eddie",
    name: "EDDIE",
    role: "Ad Engine",
    description: "5-stage advertising pipeline from creative to posting",
    icon: <Rocket className="w-6 h-6" />,
    status: "active",
    tasks: [
      "Generate ad creatives",
      "A/B test variations",
      "Optimize targeting",
      "Budget allocation"
    ],
    capabilities: [
      "Creative generation",
      "Audience targeting",
      "Budget optimization",
      "Performance tracking"
    ]
  },
  {
    id: "ralf",
    name: "RALF",
    role: "Loop Coordinator",
    description: "Runs the daily automation loop at midnight",
    icon: <RefreshCw className="w-6 h-6" />,
    status: "active",
    tasks: [
      "Daily content generation",
      "Quality audit",
      "Approval routing",
      "Post scheduling"
    ],
    capabilities: [
      "Scheduled execution",
      "Quality scoring",
      "Multi-step workflows",
      "Notification routing"
    ]
  },
  {
    id: "research",
    name: "Research Agent",
    role: "Market Intelligence",
    description: "Competitor monitoring, trend analysis, price tracking",
    icon: <Search className="w-6 h-6" />,
    status: "active",
    tasks: [
      "Competitor price updates",
      "Trend monitoring",
      "Market gap analysis",
      "Daily briefs"
    ],
    capabilities: [
      "Web scraping (Firecrawl)",
      "Price tracking",
      "Trend detection",
      "Report generation"
    ]
  }
];

const SKILLS: Skill[] = [
  // Research Skills
  {
    id: "competitor-watch",
    name: "Competitor Watch",
    category: "research",
    description: "Track rival brands, pricing, products, and marketing",
    icon: <Eye className="w-5 h-5" />,
    prompts: [
      "Who are competitors in premium beef?",
      "What does [competitor] charge for wagyu?",
      "Analyze [competitor] Instagram strategy"
    ],
    enabled: true
  },
  {
    id: "price-intel",
    name: "Price Intelligence",
    category: "research",
    description: "Monitor market pricing and find price opportunities",
    icon: <DollarSign className="w-5 h-5" />,
    prompts: [
      "Market average for premium beef?",
      "Find pricing gaps in SA market",
      "Optimize my pricing strategy"
    ],
    enabled: true
  },
  {
    id: "trend-scanner",
    name: "Trend Scanner",
    category: "research",
    description: "Spot emerging trends and consumer interests",
    icon: <TrendingUp className="w-5 h-5" />,
    prompts: [
      "What's trending in SA meat industry?",
      "Emerging beef trends 2026",
      "Consumer sentiment on grass-fed"
    ],
    enabled: true
  },
  {
    id: "market-gap",
    name: "Market Gap Finder",
    category: "research",
    description: "Find underserved segments and white space",
    icon: <Lightbulb className="w-5 h-5" />,
    prompts: [
      "Gaps in premium beef market?",
      "Underserved customer segments",
      "White space opportunities"
    ],
    enabled: true
  },
  // Content Skills
  {
    id: "copywriting",
    name: "Copywriting",
    category: "content",
    description: "Write compelling marketing copy",
    icon: <Sparkles className="w-5 h-5" />,
    prompts: [
      "Write hero section for wagyu",
      "Create productDescriptions",
      "Improve CTAs"
    ],
    enabled: true
  },
  {
    id: "image-gen",
    name: "Image Generation",
    category: "content",
    description: "Generate images via Higgsfield/Pollinations",
    icon: <Image className="w-5 h-5" />,
    prompts: [
      "Generate beef product image",
      "Create lifestyle photo",
      "Make recipe image"
    ],
    enabled: true
  },
  {
    id: "video-gen",
    name: "Video Generation",
    category: "content",
    description: "Generate videos via Higgsfield",
    icon: <Video className="w-5 h-5" />,
    prompts: [
      "Create cooking demo video",
      "Generate product video",
      "Make story reel"
    ],
    enabled: true
  },
  // Marketing Skills
  {
    id: "content-strategy",
    name: "Content Strategy",
    category: "marketing",
    description: "Plan content calendar and topics",
    icon: <Layers className="w-5 h-5" />,
    prompts: [
      "Plan content calendar",
      "Create content pillars",
      "What topics for beef?"
    ],
    enabled: true
  },
  {
    id: "seo-audit",
    name: "SEO Audit",
    category: "marketing",
    description: "Audit and fix website SEO",
    icon: <Search className="w-5 h-5" />,
    prompts: [
      "Audit studexmeat.com SEO",
      "What keywords to target?",
      "Fix technical SEO"
    ],
    enabled: true
  },
  {
    id: "paid-ads",
    name: "Paid Ads",
    category: "marketing",
    description: "Create and optimize ad campaigns",
    icon: <Target className="w-5 h-5" />,
    prompts: [
      "Create Instagram ads",
      "Optimize Meta campaigns",
      "Set up conversion tracking"
    ],
    enabled: true
  },
  {
    id: "influencer-outreach",
    name: "Influencer Outreach",
    category: "marketing",
    description: "Find and approach influencers",
    icon: <Users className="w-5 h-5" />,
    prompts: [
      "Find food influencers SA",
      "Micro-influencer recommendations",
      "Outreach templates"
    ],
    enabled: true
  },
  // Sales Skills
  {
    id: "pricing-strategy",
    name: "Pricing Strategy",
    category: "sales",
    description: "Optimize pricing and packaging",
    icon: <DollarSign className="w-5 h-5" />,
    prompts: [
      "Pricing for premium wagyu?",
      "Create pricing tiers",
      "Analyze competitor pricing"
    ],
    enabled: true
  },
  {
    id: "email-sequence",
    name: "Email Sequence",
    category: "sales",
    description: "Drip campaigns and automation",
    icon: <MessageCircle className="w-5 h-5" />,
    prompts: [
      "Welcome sequence",
      "Abandoned cart emails",
      "Re-engagement campaign"
    ],
    enabled: true
  }
];

const CATEGORY_COLORS: Record<string, string> = {
  research: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  content: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  marketing: "bg-green-500/20 text-green-400 border-green-500/30",
  sales: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  analytics: "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

export default function SkillsAndAgents() {
  const [activeTab, setActiveTab] = useState("agents");

  const getStatusBadge = (status: Agent["status"]) => {
    switch (status) {
      case "active": return <Badge className="bg-green-500/20 text-green-400"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
      case "learning": return <Badge className="bg-yellow-500/20 text-yellow-400"><Clock className="w-3 h-3 mr-1" />Learning</Badge>;
      case "paused": return <Badge className="bg-gray-500/20 text-gray-400"><XCircle className="w-3 h-3 mr-1" />Paused</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Skills & Agents
            </h1>
            <p className="text-muted-foreground">
              All AI capabilities explained - know what each agent and skill does
            </p>
          </div>
          <Badge variant="outline" className="bg-purple-500/10 text-purple-400">
            {AGENTS.length} Agents • {SKILLS.length} Skills
          </Badge>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-400">{AGENTS.filter(a => a.status === "active").length}</p>
                <p className="text-xs text-muted-foreground">Active Agents</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-400">{SKILLS.filter(s => s.enabled).length}</p>
                <p className="text-xs text-muted-foreground">Enabled Skills</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-400">6</p>
                <p className="text-xs text-muted-foreground">Studex Agents</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border-cyan-500/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-cyan-400">24/7</p>
                <p className="text-xs text-muted-foreground">Active Hours</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="agents" className="gap-2">
              <Bot className="w-4 h-4" />
              Agents
            </TabsTrigger>
            <TabsTrigger value="skills" className="gap-2">
              <Brain className="w-4 h-4" />
              Skills
            </TabsTrigger>
          </TabsList>

          {/* AGENTS TAB */}
          <TabsContent value="agents" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {AGENTS.map((agent) => (
                <Card key={agent.id} className="bg-card/50 hover:bg-card transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center text-pink-400">
                          {agent.icon}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{agent.name}</CardTitle>
                          <CardDescription className="text-xs">{agent.role}</CardDescription>
                        </div>
                      </div>
                      {getStatusBadge(agent.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{agent.description}</p>
                    
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">TASKS</p>
                      <ul className="space-y-1">
                        {agent.tasks.slice(0, 3).map((task, i) => (
                          <li key={i} className="text-xs flex items-center gap-2">
                            <Sparkles className="w-3 h-3 text-purple-400" />
                            {task}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">CAPABILITIES</p>
                      <div className="flex flex-wrap gap-1">
                        {agent.capabilities.slice(0, 4).map((cap, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {cap}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* SKILLS TAB */}
          <TabsContent value="skills" className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {["research", "content", "marketing", "sales"].map((cat) => (
                <Badge 
                  key={cat} 
                  variant="outline" 
                  className={CATEGORY_COLORS[cat]}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </Badge>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {SKILLS.map((skill) => (
                <Card key={skill.id} className="bg-card/50 hover:bg-card transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={CATEGORY_COLORS[skill.category].split(" ")[1]}>
                          {skill.icon}
                        </span>
                        <CardTitle className="text-base">{skill.name}</CardTitle>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {skill.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">{skill.description}</p>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">EXAMPLE PROMPTS</p>
                      <ul className="space-y-1">
                        {skill.prompts.slice(0, 2).map((prompt, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                            <Sparkles className="w-3 h-3 text-cyan-400 mt-0.5" />
                            {prompt}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}