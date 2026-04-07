import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import {
  MessageSquare, Bot, Zap, Settings, Play, Pause, BarChart3,
  Users, CheckCircle2, Clock, ArrowRight, Phone, Instagram,
  Send, RefreshCw, Brain, Sparkles
} from "lucide-react";

const bots = [
  {
    id: "whatsapp",
    name: "WhatsApp Sales Bot",
    platform: "WhatsApp",
    icon: Phone,
    color: "text-green-400",
    bgColor: "bg-green-500/10 border-green-500/20",
    status: "active",
    stats: { conversations: 247, leads: 38, sales: 12, responseTime: "< 30s" },
    description: "Handles product enquiries, qualifies leads, and drives sales via WhatsApp Business API",
    model: "DeepSeek Intelligence",
  },
  {
    id: "instagram",
    name: "Instagram DM Bot",
    platform: "Instagram",
    icon: Instagram,
    color: "text-pink-400",
    bgColor: "bg-pink-500/10 border-pink-500/20",
    status: "paused",
    stats: { conversations: 183, leads: 21, sales: 7, responseTime: "< 45s" },
    description: "Auto-replies to DMs, story mentions, and comment threads with AI-powered responses",
    model: "DeepSeek Intelligence",
  },
];

const conversationFlow = [
  { step: 1, trigger: "Customer sends message", action: "Bot receives via WhatsApp/Instagram API", type: "input" },
  { step: 2, trigger: "Intent detection", action: "DeepSeek analyses message intent and context", type: "ai" },
  { step: 3, trigger: "Knowledge base lookup", action: "RAG searches product info, FAQs, and past conversations", type: "rag" },
  { step: 4, trigger: "Response generation", action: "DeepSeek generates personalised, brand-aligned reply", type: "ai" },
  { step: 5, trigger: "Lead qualification", action: "If buying intent detected, capture contact and notify sales team", type: "action" },
  { step: 6, trigger: "Auto-reply sent", action: "Response delivered via API with < 30s latency", type: "output" },
];

const sampleConversations = [
  {
    platform: "WhatsApp",
    customer: "Hi, do you have wagyu beef available?",
    bot: "Hi! 👋 Yes, we have premium Wagyu beef available! We stock A5 grade Wagyu ribeye, striploin, and burger patties. All Halal-certified and freshly sourced. Would you like to know more about pricing or place an order?",
    time: "2 min ago",
    status: "lead",
  },
  {
    platform: "Instagram",
    customer: "How much for bulk orders?",
    bot: "Great question! 🥩 For bulk orders (5kg+) we offer special pricing. Our bulk packs start from R450/kg for premium cuts. I can connect you with our sales team for a custom quote — just share your WhatsApp number and they'll reach out within 1 hour!",
    time: "15 min ago",
    status: "qualified",
  },
  {
    platform: "WhatsApp",
    customer: "What's your delivery area?",
    bot: "We deliver across Johannesburg, Pretoria, and surrounding areas! 🚚 Same-day delivery available for orders placed before 12pm. Free delivery on orders over R500. Would you like to place an order today?",
    time: "1 hr ago",
    status: "info",
  },
];

export default function Chatbots() {
  const [activeBot, setActiveBot] = useState("whatsapp");
  const [testMessage, setTestMessage] = useState("");
  const [testResponse, setTestResponse] = useState("");
  const [testing, setTesting] = useState(false);

  const handleTest = async () => {
    if (!testMessage.trim()) return;
    setTesting(true);
    await new Promise(r => setTimeout(r, 1500));
    setTestResponse(`Hi! Thanks for reaching out to StudEx Meat. 🥩 I'm here to help with product enquiries, pricing, and orders. You asked: "${testMessage}" — Let me connect you with the right information. Our premium Halal-certified beef is available for delivery across Johannesburg. Would you like to see our current product catalogue?`);
    setTesting(false);
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Bot className="w-8 h-8 text-purple-400" />
              AI Chatbot Command Centre
            </h1>
            <p className="text-gray-400 mt-1">Manage your WhatsApp and Instagram AI chatbots powered by DeepSeek Intelligence</p>
          </div>
          <Button className="bg-purple-600 hover:bg-purple-500 text-white gap-2">
            <Sparkles className="w-4 h-4" />
            Configure New Bot
          </Button>
        </div>

        {/* Bot Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bots.map((bot) => (
            <Card
              key={bot.id}
              className={`cursor-pointer transition-all border-2 ${activeBot === bot.id ? "border-purple-500/50 bg-purple-900/10" : "border-gray-700/50 bg-gray-900/30 hover:border-gray-600"}`}
              onClick={() => setActiveBot(bot.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${bot.bgColor} border flex items-center justify-center`}>
                      <bot.icon className={`w-5 h-5 ${bot.color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-white text-base">{bot.name}</CardTitle>
                      <CardDescription className="text-gray-400 text-xs">{bot.model}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={bot.status === "active" ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"}>
                      {bot.status === "active" ? "● Live" : "⏸ Paused"}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-gray-400 hover:text-white"
                      onClick={(e) => { e.stopPropagation(); toast.success(`${bot.status === "active" ? "Paused" : "Activated"} ${bot.name}`); }}
                    >
                      {bot.status === "active" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-400 text-sm">{bot.description}</p>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: "Conversations", value: bot.stats.conversations, icon: MessageSquare },
                    { label: "Leads", value: bot.stats.leads, icon: Users },
                    { label: "Sales", value: bot.stats.sales, icon: Zap },
                    { label: "Avg Response", value: bot.stats.responseTime, icon: Clock },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center">
                      <div className="text-lg font-bold text-white">{stat.value}</div>
                      <div className="text-xs text-gray-500">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Conversation Flow */}
        <Card className="bg-gray-900/30 border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              How the AI Chatbot Works — DeepSeek Intelligence Pipeline
            </CardTitle>
            <CardDescription className="text-gray-400">
              Every message goes through a 6-step AI pipeline powered by DeepSeek and your RAG knowledge base
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {conversationFlow.map((step, i) => (
                <div key={step.step} className="relative">
                  <div className={`p-3 rounded-xl border text-center ${
                    step.type === "ai" ? "bg-purple-900/20 border-purple-500/30" :
                    step.type === "rag" ? "bg-blue-900/20 border-blue-500/30" :
                    step.type === "action" ? "bg-orange-900/20 border-orange-500/30" :
                    step.type === "output" ? "bg-green-900/20 border-green-500/30" :
                    "bg-gray-800/50 border-gray-600/30"
                  }`}>
                    <div className={`text-xs font-bold mb-1 ${
                      step.type === "ai" ? "text-purple-400" :
                      step.type === "rag" ? "text-blue-400" :
                      step.type === "action" ? "text-orange-400" :
                      step.type === "output" ? "text-green-400" :
                      "text-gray-400"
                    }`}>Step {step.step}</div>
                    <div className="text-white text-xs font-medium mb-1">{step.trigger}</div>
                    <div className="text-gray-400 text-xs">{step.action}</div>
                  </div>
                  {i < conversationFlow.length - 1 && (
                    <ArrowRight className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 z-10" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Live Conversations + Test Bot */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Conversations */}
          <Card className="bg-gray-900/30 border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-green-400" />
                Recent Conversations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {sampleConversations.map((conv, i) => (
                <div key={i} className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge className={`text-xs ${conv.platform === "WhatsApp" ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-pink-500/20 text-pink-400 border-pink-500/30"}`}>
                      {conv.platform}
                    </Badge>
                    <div className="flex items-center gap-2">
                      <Badge className={`text-xs ${conv.status === "lead" ? "bg-yellow-500/20 text-yellow-400" : conv.status === "qualified" ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}`}>
                        {conv.status === "lead" ? "🎯 Lead" : conv.status === "qualified" ? "✅ Qualified" : "ℹ️ Info"}
                      </Badge>
                      <span className="text-xs text-gray-500">{conv.time}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Users className="w-3 h-3 text-gray-300" />
                      </div>
                      <p className="text-gray-300 text-sm bg-gray-700/50 rounded-lg px-3 py-2">{conv.customer}</p>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <p className="text-white text-sm bg-purple-900/40 border border-purple-500/20 rounded-lg px-3 py-2 max-w-xs">{conv.bot}</p>
                      <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Bot className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Test Bot */}
          <Card className="bg-gray-900/30 border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                Test Your Bot
              </CardTitle>
              <CardDescription className="text-gray-400">
                Send a test message to see how the DeepSeek AI would respond
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/30 min-h-[200px]">
                {testResponse ? (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
                        <Users className="w-3 h-3 text-gray-300" />
                      </div>
                      <p className="text-gray-300 text-sm bg-gray-700/50 rounded-lg px-3 py-2">{testMessage}</p>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <p className="text-white text-sm bg-purple-900/40 border border-purple-500/20 rounded-lg px-3 py-2">{testResponse}</p>
                      <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                    <div className="text-center">
                      <Bot className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p>Send a test message to see the AI response</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Input
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  placeholder="e.g. Do you have wagyu beef available?"
                  className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-500"
                  onKeyDown={(e) => e.key === "Enter" && handleTest()}
                />
                <Button
                  onClick={handleTest}
                  disabled={testing || !testMessage.trim()}
                  className="bg-purple-600 hover:bg-purple-500 text-white gap-2 flex-shrink-0"
                >
                  {testing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-gray-500">Quick test messages:</p>
                <div className="flex flex-wrap gap-2">
                  {["What products do you have?", "How much does delivery cost?", "Do you offer bulk discounts?", "Are you Halal certified?"].map((msg) => (
                    <button
                      key={msg}
                      onClick={() => setTestMessage(msg)}
                      className="text-xs px-2 py-1 rounded-lg bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white transition-colors"
                    >
                      {msg}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-gray-700/30">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <CheckCircle2 className="w-3 h-3 text-green-400" />
                  Powered by DeepSeek Intelligence + StudEx Meat RAG knowledge base
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Setup Guide */}
        <Card className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
                <Settings className="w-5 h-5 text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold mb-1">Connect Your Chatbots</h3>
                <p className="text-gray-400 text-sm mb-4">
                  To activate live chatbots, you need to connect your WhatsApp Business API and Instagram Graph API credentials. The bots use DeepSeek Intelligence and your RAG knowledge base to generate contextual, brand-aligned responses.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700/30">
                    <div className="text-green-400 font-medium text-sm mb-2 flex items-center gap-2">
                      <Phone className="w-4 h-4" /> WhatsApp Business API
                    </div>
                    <ol className="text-gray-400 text-xs space-y-1 list-decimal list-inside">
                      <li>Go to Meta Business Suite → WhatsApp</li>
                      <li>Create a WhatsApp Business App</li>
                      <li>Get your Phone Number ID and Access Token</li>
                      <li>Set webhook URL to your Nexus Social endpoint</li>
                      <li>Paste credentials in Integrations page</li>
                    </ol>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700/30">
                    <div className="text-pink-400 font-medium text-sm mb-2 flex items-center gap-2">
                      <Instagram className="w-4 h-4" /> Instagram Graph API
                    </div>
                    <ol className="text-gray-400 text-xs space-y-1 list-decimal list-inside">
                      <li>Connect Instagram Business account to Facebook Page</li>
                      <li>Go to Graph API Explorer → select your app</li>
                      <li>Add instagram_manage_messages permission</li>
                      <li>Generate long-lived access token</li>
                      <li>Paste token in Integrations page</li>
                    </ol>
                  </div>
                </div>
                <Button
                  className="mt-4 bg-purple-600 hover:bg-purple-500 text-white gap-2"
                  onClick={() => toast.info("Navigate to Integrations to connect your chatbot credentials")}
                >
                  <Settings className="w-4 h-4" />
                  Go to Integrations
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
