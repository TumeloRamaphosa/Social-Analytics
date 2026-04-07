import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Cpu, Code2, Zap, Globe, CheckCircle2, Copy, Github,
  BarChart3, MessageSquare, ShoppingBag, Brain, Network,
  ArrowRight, Terminal, Play, RefreshCw, Shield
} from "lucide-react";

const mcpTools = [
  { name: "get_facebook_analytics", category: "Analytics", desc: "Retrieve Facebook page insights, reach, engagement, and audience demographics", status: "ready", color: "text-blue-400" },
  { name: "get_instagram_analytics", category: "Analytics", desc: "Pull Instagram follower growth, top posts, engagement rate, and story metrics", status: "ready", color: "text-pink-400" },
  { name: "get_ad_campaigns", category: "Ads", desc: "Fetch all Facebook/Instagram ad campaigns with spend, ROAS, impressions, and clicks", status: "ready", color: "text-purple-400" },
  { name: "generate_post", category: "Content", desc: "AI-generate a social media post with caption, hashtags, and image prompt", status: "ready", color: "text-emerald-400" },
  { name: "publish_to_facebook", category: "Publishing", desc: "Post content directly to Facebook page via Graph API", status: "ready", color: "text-blue-400" },
  { name: "publish_to_instagram", category: "Publishing", desc: "Publish image or carousel post to Instagram Business account", status: "ready", color: "text-pink-400" },
  { name: "send_whatsapp_message", category: "Messaging", desc: "Send a WhatsApp message via Business API to a phone number", status: "ready", color: "text-green-400" },
  { name: "get_shopify_orders", category: "Shopify", desc: "Retrieve recent Shopify orders, revenue, and product performance", status: "ready", color: "text-orange-400" },
  { name: "analyse_website", category: "Intelligence", desc: "Run full business intelligence analysis on any website URL", status: "ready", color: "text-cyan-400" },
  { name: "search_knowledge_base", category: "RAG", desc: "Semantic search across all indexed business data and past analyses", status: "ready", color: "text-violet-400" },
  { name: "get_spend_report", category: "Ads", desc: "Generate AI-powered spend optimisation report with ROAS recommendations", status: "ready", color: "text-yellow-400" },
  { name: "export_to_drive", category: "Export", desc: "Export any report or dataset to Google Drive as structured markdown", status: "ready", color: "text-teal-400" },
];

const githubIntegrations = [
  { repo: "nexus-social/mcp-server", desc: "Core MCP server exposing all Nexus Social tools", status: "connected", branch: "main" },
  { repo: "nexus-social/chatbot-engine", desc: "WhatsApp and Instagram chatbot DeepSeek integration", status: "connected", branch: "main" },
  { repo: "nexus-social/analytics-pipeline", desc: "Facebook and Google Ads data ingestion pipeline", status: "pending", branch: "develop" },
  { repo: "your-org/custom-integration", desc: "Connect your own GitHub repository to extend the platform", status: "add", branch: "" },
];

const mcpConfig = `{
  "mcpServers": {
    "nexus-social": {
      "command": "node",
      "args": ["/path/to/nexus-mcp-server/server.js"],
      "env": {
        "NEXUS_API_KEY": "your-api-key-here",
        "WORKSPACE_ID": "your-workspace-id",
        "FB_ACCESS_TOKEN": "your-facebook-token",
        "SHOPIFY_API_KEY": "your-shopify-key",
        "WHATSAPP_TOKEN": "your-whatsapp-token"
      }
    }
  }
}`;

const categoryColors: Record<string, string> = {
  Analytics: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Ads: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  Content: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  Publishing: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  Messaging: "bg-green-500/20 text-green-400 border-green-500/30",
  Shopify: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  Intelligence: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  RAG: "bg-violet-500/20 text-violet-400 border-violet-500/30",
  Export: "bg-teal-500/20 text-teal-400 border-teal-500/30",
};

export default function MCPServer() {
  const copyConfig = () => {
    navigator.clipboard.writeText(mcpConfig);
    toast.success("MCP config copied to clipboard!");
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Cpu className="w-8 h-8 text-purple-400" />
              MCP Server & GitHub Integration
            </h1>
            <p className="text-gray-400 mt-1">Connect AI agents to all your Nexus Social tools via the Model Context Protocol</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-gray-600 text-gray-300 hover:text-white gap-2">
              <Github className="w-4 h-4" />
              Connect GitHub
            </Button>
            <Button className="bg-purple-600 hover:bg-purple-500 text-white gap-2">
              <Play className="w-4 h-4" />
              Start MCP Server
            </Button>
          </div>
        </div>

        {/* Status Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "MCP Tools Available", value: "12", icon: Zap, color: "text-purple-400" },
            { label: "GitHub Repos Connected", value: "2", icon: Github, color: "text-white" },
            { label: "API Calls Today", value: "1,247", icon: BarChart3, color: "text-blue-400" },
            { label: "Server Status", value: "Ready", icon: Shield, color: "text-green-400" },
          ].map((stat) => (
            <Card key={stat.label} className="bg-gray-900/30 border-gray-700/50">
              <CardContent className="p-4 flex items-center gap-3">
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
                <div>
                  <div className="text-xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-gray-400">{stat.label}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* MCP Tools Grid */}
        <Card className="bg-gray-900/30 border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Terminal className="w-5 h-5 text-purple-400" />
              Available MCP Tools
            </CardTitle>
            <CardDescription className="text-gray-400">
              These tools are exposed via the MCP server and can be called by any AI agent (Manus, Claude, GPT-4, etc.)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {mcpTools.map((tool) => (
                <div
                  key={tool.name}
                  className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/30 hover:border-gray-600/50 transition-all group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <code className={`text-sm font-mono font-bold ${tool.color}`}>{tool.name}()</code>
                    <Badge className={`text-xs ${categoryColors[tool.category] || "bg-gray-500/20 text-gray-400"}`}>
                      {tool.category}
                    </Badge>
                  </div>
                  <p className="text-gray-400 text-xs leading-relaxed">{tool.desc}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                    <span className="text-xs text-green-400">Ready</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Config + GitHub */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* MCP Config */}
          <Card className="bg-gray-900/30 border-gray-700/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-cyan-400" />
                  MCP Configuration
                </CardTitle>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-gray-400 hover:text-white gap-1"
                  onClick={copyConfig}
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </Button>
              </div>
              <CardDescription className="text-gray-400">
                Add this to your Claude Desktop, Manus, or any MCP-compatible AI client
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-950/80 rounded-xl p-4 text-xs text-green-400 font-mono overflow-auto border border-gray-700/30 leading-relaxed">
                {mcpConfig}
              </pre>
              <div className="mt-4 space-y-2">
                <p className="text-xs text-gray-500 font-medium">Compatible with:</p>
                <div className="flex flex-wrap gap-2">
                  {["Manus AI", "Claude Desktop", "GPT-4 Agents", "OpenClaw", "Custom Agents"].map((agent) => (
                    <Badge key={agent} className="bg-gray-700/50 text-gray-300 border-gray-600/30 text-xs">
                      {agent}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* GitHub Integration */}
          <Card className="bg-gray-900/30 border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Github className="w-5 h-5 text-white" />
                GitHub Repository Connections
              </CardTitle>
              <CardDescription className="text-gray-400">
                Connect GitHub repos to extend the MCP server with custom tools and integrations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {githubIntegrations.map((repo) => (
                <div
                  key={repo.repo}
                  className={`p-3 rounded-xl border transition-all ${
                    repo.status === "add"
                      ? "border-dashed border-gray-600/50 bg-gray-800/20 hover:border-purple-500/50 cursor-pointer"
                      : "border-gray-700/30 bg-gray-800/40"
                  }`}
                  onClick={() => repo.status === "add" && toast.info("GitHub OAuth integration coming soon!")}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Github className="w-4 h-4 text-gray-400" />
                      <code className="text-sm text-white font-mono">{repo.repo}</code>
                    </div>
                    {repo.status === "connected" && (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">● Connected</Badge>
                    )}
                    {repo.status === "pending" && (
                      <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">⏳ Pending</Badge>
                    )}
                    {repo.status === "add" && (
                      <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">+ Add Repo</Badge>
                    )}
                  </div>
                  <p className="text-gray-400 text-xs mt-1">{repo.desc}</p>
                  {repo.branch && (
                    <div className="flex items-center gap-1 mt-1">
                      <div className="w-2 h-2 rounded-full bg-green-400" />
                      <span className="text-xs text-gray-500">branch: {repo.branch}</span>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* OpenClaw Integration */}
        <Card className="bg-gradient-to-r from-violet-900/20 to-purple-900/20 border-violet-500/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center flex-shrink-0">
                <Network className="w-6 h-6 text-violet-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-white font-bold text-lg">OpenClaw Integration</h3>
                  <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30">Coming Soon</Badge>
                </div>
                <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                  OpenClaw is an open-source AI agent orchestration platform. By connecting Nexus Social's MCP server to OpenClaw, you can build complex multi-agent workflows where AI agents collaborate to analyse your social media, generate content, optimise ad spend, and publish — all autonomously.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {[
                    { icon: Brain, title: "Multi-Agent Workflows", desc: "Chain multiple AI agents together — analyst → content creator → publisher" },
                    { icon: RefreshCw, title: "Autonomous Loops", desc: "Set goals and let agents work continuously without manual intervention" },
                    { icon: Globe, title: "Cross-Platform Actions", desc: "Agents can act across Facebook, Instagram, WhatsApp, Shopify simultaneously" },
                  ].map((item) => (
                    <div key={item.title} className="p-3 rounded-xl bg-gray-800/40 border border-gray-700/30">
                      <item.icon className="w-5 h-5 text-violet-400 mb-2" />
                      <div className="text-white text-sm font-medium mb-1">{item.title}</div>
                      <div className="text-gray-400 text-xs">{item.desc}</div>
                    </div>
                  ))}
                </div>
                <div className="p-3 rounded-xl bg-gray-900/50 border border-gray-700/30 font-mono text-xs mb-4">
                  <p className="text-gray-500 mb-1"># How to connect OpenClaw to Nexus Social MCP</p>
                  <p className="text-green-400">1. Install OpenClaw: <span className="text-cyan-400">npm install -g openclaw</span></p>
                  <p className="text-green-400">2. Add MCP server: <span className="text-cyan-400">openclaw add-mcp nexus-social --config mcp_config.json</span></p>
                  <p className="text-green-400">3. Create agent: <span className="text-cyan-400">openclaw create-agent social-media-manager</span></p>
                  <p className="text-green-400">4. Run workflow: <span className="text-cyan-400">openclaw run --goal "Analyse and post daily content"</span></p>
                </div>
                <Button
                  className="bg-violet-600 hover:bg-violet-500 text-white gap-2"
                  onClick={() => toast.info("OpenClaw integration is in development. Check back soon!")}
                >
                  <ArrowRight className="w-4 h-4" />
                  Get Notified When Available
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
