import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Zap, Building2, Users, Globe, BarChart3, Sparkles, MessageCircle, ShoppingBag, Brain } from "lucide-react";
import { toast } from "sonner";

const plans = [
  {
    name: "Starter",
    price: "R 999",
    period: "/month",
    description: "Perfect for small businesses getting started with social media analytics",
    color: "border-gray-600",
    badge: null,
    features: [
      "5 website analyses per month",
      "Facebook & Instagram analytics",
      "Basic content generation (10 posts/month)",
      "Content calendar",
      "PDF reports",
      "1 workspace",
      "Email support",
    ],
    cta: "Get Started",
    ctaClass: "bg-gray-700 hover:bg-gray-600 text-white",
  },
  {
    name: "Pro",
    price: "R 2,499",
    period: "/month",
    description: "For growing brands that need full analytics, automation, and content tools",
    color: "border-purple-500",
    badge: "Most Popular",
    features: [
      "Unlimited website analyses",
      "Facebook, Instagram & Google Ads",
      "Shopify integration & sync",
      "Unlimited AI content generation",
      "Weekly AI content planner",
      "Auto-publish to Facebook/Instagram",
      "Spend optimisation reports",
      "RAG knowledge base",
      "3 workspaces",
      "Priority support",
    ],
    cta: "Start Pro Trial",
    ctaClass: "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white",
  },
  {
    name: "Agency",
    price: "R 7,999",
    period: "/month",
    description: "For agencies managing multiple clients with white-label capabilities",
    color: "border-yellow-500",
    badge: "Best Value",
    features: [
      "Everything in Pro",
      "Unlimited workspaces & clients",
      "White-label dashboard",
      "Custom branding & domain",
      "Client reporting portal",
      "WhatsApp automation",
      "Google Drive auto-export",
      "MCP server access",
      "API access",
      "Dedicated account manager",
    ],
    cta: "Contact Sales",
    ctaClass: "bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white",
  },
];

const features = [
  { icon: <BarChart3 className="w-6 h-6 text-blue-400" />, title: "Business Intelligence", desc: "Deep analysis of any website — SEO, tech stack, social presence, competitive positioning" },
  { icon: <Sparkles className="w-6 h-6 text-purple-400" />, title: "AI Content Studio", desc: "Generate platform-perfect posts, images, and weekly content plans with one click" },
  { icon: <ShoppingBag className="w-6 h-6 text-green-400" />, title: "Shopify Integration", desc: "Sync orders, products, and revenue data to correlate ad spend with actual sales" },
  { icon: <BarChart3 className="w-6 h-6 text-yellow-400" />, title: "Ad Spend Optimisation", desc: "AI-powered recommendations to reduce wasted spend and improve ROAS" },
  { icon: <Brain className="w-6 h-6 text-pink-400" />, title: "RAG Knowledge Base", desc: "All your business data indexed for semantic search and AI-powered insights" },
  { icon: <MessageCircle className="w-6 h-6 text-green-400" />, title: "WhatsApp Automation", desc: "Send reports, alerts, and content previews directly to WhatsApp" },
  { icon: <Globe className="w-6 h-6 text-blue-400" />, title: "Google Drive Export", desc: "Auto-export all reports and analyses to organised Google Drive folders" },
  { icon: <Users className="w-6 h-6 text-orange-400" />, title: "Multi-Tenant SaaS", desc: "Manage multiple clients with separate workspaces, branding, and reporting" },
];

export default function SaaS() {
  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-sm px-4 py-1">
            🚀 Nexus Social — AI Marketing Intelligence Platform
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            The Complete AI-Powered<br />
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Social Media Intelligence Platform
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Analyse competitors, generate content, optimise ad spend, and automate your entire social media workflow — all in one platform powered by AI.
          </p>
        </div>

        {/* Feature Grid */}
        <div>
          <h2 className="text-2xl font-bold text-white text-center mb-6">Everything You Need to Dominate Your Market</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f) => (
              <Card key={f.title} className="bg-gray-900/50 border-gray-700 hover:border-gray-500 transition-colors">
                <CardContent className="p-4 space-y-2">
                  <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center">{f.icon}</div>
                  <h3 className="text-white font-semibold text-sm">{f.title}</h3>
                  <p className="text-gray-400 text-xs">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <div>
          <h2 className="text-2xl font-bold text-white text-center mb-2">Simple, Transparent Pricing</h2>
          <p className="text-gray-400 text-center mb-8">All prices in South African Rand. Cancel anytime.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card key={plan.name} className={`bg-gray-900/50 border-2 ${plan.color} relative`}>
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-purple-600 text-white border-0 px-3 py-1">{plan.badge}</Badge>
                  </div>
                )}
                <CardHeader className="pb-2">
                  <CardTitle className="text-white">{plan.name}</CardTitle>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-white">{plan.price}</span>
                    <span className="text-gray-400 text-sm">{plan.period}</span>
                  </div>
                  <CardDescription className="text-gray-400 text-sm">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-gray-300">
                        <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full font-semibold ${plan.ctaClass}`}
                    onClick={() => toast.info("Billing integration coming soon! Contact us to get started.")}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* MCP Integration Section */}
        <Card className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-purple-500/30">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">Developer Feature</Badge>
                <h3 className="text-2xl font-bold text-white">MCP Server Integration</h3>
                <p className="text-gray-300">
                  Connect Nexus Social directly to your AI agents via the Model Context Protocol. 
                  Expose all your analytics, content generation, and publishing tools as callable functions 
                  that any AI assistant can invoke.
                </p>
                <ul className="space-y-2">
                  {["get_facebook_analytics", "generate_post", "publish_to_facebook", "get_shopify_stats", "analyse_website", "get_spend_report"].map((tool) => (
                    <li key={tool} className="flex items-center gap-2 text-sm text-gray-300">
                      <code className="bg-gray-800 px-2 py-0.5 rounded text-purple-300 text-xs">{tool}()</code>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-gray-900/70 rounded-xl p-6 font-mono text-sm">
                <p className="text-gray-500 mb-2">// mcp_config.json</p>
                <pre className="text-green-400 text-xs overflow-auto">{`{
  "mcpServers": {
    "nexus-social": {
      "command": "node",
      "args": ["server.js"],
      "env": {
        "API_KEY": "your-api-key",
        "WORKSPACE_ID": "your-workspace"
      }
    }
  }
}`}</pre>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center space-y-4 py-8">
          <h2 className="text-3xl font-bold text-white">Ready to Transform Your Marketing?</h2>
          <p className="text-gray-400">Join forward-thinking South African brands using AI to outperform their competition.</p>
          <Button
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold px-8 py-6 text-lg"
            onClick={() => toast.info("Contact us at hello@nexussocial.co.za to get started!")}
          >
            <Zap className="w-5 h-5 mr-2" />
            Start Your Free Trial
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
