import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, RefreshCw, CheckCircle2, XCircle, Zap, ExternalLink, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const APP_META: Record<string, { label: string; icon: string; color: string; description: string; features: string[] }> = {
  facebook: {
    label: "Facebook",
    icon: "📘",
    color: "bg-blue-600",
    description: "Post content, read page insights, manage comments",
    features: ["Auto-post content", "Page analytics", "Comment management", "Audience insights"],
  },
  instagram: {
    label: "Instagram",
    icon: "📸",
    color: "bg-gradient-to-r from-purple-500 to-pink-500",
    description: "Publish posts, Reels, Stories and read engagement data",
    features: ["Publish Reels & posts", "Story scheduling", "Engagement analytics", "Hashtag performance"],
  },
  whatsapp: {
    label: "WhatsApp Business",
    icon: "💬",
    color: "bg-green-600",
    description: "Send automated messages, manage customer conversations",
    features: ["AI-powered auto-replies", "Broadcast messages", "Order notifications", "Customer support bot"],
  },
  gmail: {
    label: "Gmail",
    icon: "✉️",
    color: "bg-red-500",
    description: "Send emails, read inbox, manage campaigns",
    features: ["Email campaigns", "Auto-responses", "Lead notifications", "Report delivery"],
  },
  discord: {
    label: "Discord",
    icon: "🎮",
    color: "bg-indigo-600",
    description: "Post to channels, manage server notifications",
    features: ["Channel notifications", "Team alerts", "Bot commands", "Analytics reports"],
  },
  elevenlabs: {
    label: "ElevenLabs",
    icon: "🔊",
    color: "bg-yellow-600",
    description: "AI voice generation for content and ads",
    features: ["Voice-over generation", "Ad narration", "Podcast creation", "Multi-language audio"],
  },
  shopify: {
    label: "Shopify",
    icon: "🛍️",
    color: "bg-green-700",
    description: "Sync products, orders, and customer data",
    features: ["Product sync", "Order tracking", "Customer segments", "Revenue analytics"],
  },
  slack: {
    label: "Slack",
    icon: "💼",
    color: "bg-purple-700",
    description: "Team notifications and workflow alerts",
    features: ["Campaign alerts", "Daily reports", "Team notifications", "Approval workflows"],
  },
  googledrive: {
    label: "Google Drive",
    icon: "📁",
    color: "bg-blue-500",
    description: "Store and access reports, assets, and documents",
    features: ["Report storage", "Asset library", "Shared documents", "Auto-backup"],
  },
  linkedin: {
    label: "LinkedIn",
    icon: "💼",
    color: "bg-blue-700",
    description: "Publish B2B content and track professional engagement",
    features: ["Company page posts", "Article publishing", "Lead generation", "B2B analytics"],
  },
};

function AppCard({
  appName,
  connections,
  onConnect,
  onReconnect,
  isConnecting,
}: {
  appName: string;
  connections: { status: string; id: string; entityId: string }[];
  onConnect: (app: string) => void;
  onReconnect: (id: string) => void;
  isConnecting: string | null;
}) {
  const meta = APP_META[appName] || {
    label: appName.charAt(0).toUpperCase() + appName.slice(1),
    icon: "🔌",
    color: "bg-gray-600",
    description: "Connected application",
    features: [],
  };

  const activeConn = connections.find((c) => c.status === "ACTIVE");
  const expiredConns = connections.filter((c) => c.status === "EXPIRED");
  const isActive = !!activeConn;
  const hasExpired = expiredConns.length > 0;

  return (
    <Card className="border border-white/10 bg-white/5 hover:bg-white/8 transition-all">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${meta.color} flex items-center justify-center text-xl`}>
              {meta.icon}
            </div>
            <div>
              <CardTitle className="text-white text-base">{meta.label}</CardTitle>
              <p className="text-xs text-white/50 mt-0.5">{meta.description}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            {isActive ? (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Active
              </Badge>
            ) : hasExpired ? (
              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
                <AlertTriangle className="w-3 h-3 mr-1" /> Expired
              </Badge>
            ) : (
              <Badge className="bg-white/10 text-white/40 border-white/10 text-xs">
                <XCircle className="w-3 h-3 mr-1" /> Not Connected
              </Badge>
            )}
            {connections.length > 1 && (
              <span className="text-xs text-white/30">{connections.length} connections</span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {meta.features.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {meta.features.map((f) => (
              <span key={f} className="text-xs bg-white/5 text-white/40 px-2 py-0.5 rounded-full">
                {f}
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          {!isActive && (
            <Button
              size="sm"
              className="flex-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30"
              onClick={() => onConnect(appName)}
              disabled={isConnecting === appName}
            >
              {isConnecting === appName ? (
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              ) : (
                <Zap className="w-3 h-3 mr-1" />
              )}
              Connect
            </Button>
          )}
          {hasExpired && expiredConns[0] && (
            <Button
              size="sm"
              variant="outline"
              className="flex-1 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
              onClick={() => onReconnect(expiredConns[0].id)}
              disabled={isConnecting === expiredConns[0].id}
            >
              {isConnecting === expiredConns[0].id ? (
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              ) : (
                <RefreshCw className="w-3 h-3 mr-1" />
              )}
              Reconnect
            </Button>
          )}
          {isActive && (
            <div className="flex-1 flex items-center justify-center text-xs text-green-400/70">
              <CheckCircle2 className="w-3 h-3 mr-1" /> Ready to use
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function ComposioIntegrations() {
  const [connectingApp, setConnectingApp] = useState<string | null>(null);

  const { data: connections, isLoading, refetch } = trpc.composio.getConnections.useQuery(undefined, {
    refetchInterval: 30000,
  });

  const connectMutation = trpc.composio.getConnectUrl.useMutation({
    onSuccess: (data) => {
      setConnectingApp(null);
      if (data.redirectUrl) {
        window.open(data.redirectUrl, "_blank", "width=600,height=700");
        toast.success("OAuth window opened — complete the connection in the popup, then refresh.");
      }
    },
    onError: (err) => {
      setConnectingApp(null);
      toast.error(`Connection failed: ${err.message}`);
    },
  });

  const reconnectMutation = trpc.composio.reconnectAccount.useMutation({
    onSuccess: (data) => {
      setConnectingApp(null);
      if (data.redirectUrl) {
        window.open(data.redirectUrl, "_blank", "width=600,height=700");
        toast.success("Reconnect window opened — complete the flow in the popup.");
      }
    },
    onError: (err) => {
      setConnectingApp(null);
      toast.error(`Reconnect failed: ${err.message}`);
    },
  });

  const handleConnect = (appName: string) => {
    setConnectingApp(appName);
    connectMutation.mutate({ appName });
  };

  const handleReconnect = (id: string) => {
    setConnectingApp(id);
    reconnectMutation.mutate({ connectedAccountId: id });
  };

  const appsToShow = Object.keys(APP_META);
  const allApps = connections?.apps || {};

  // Add apps from Composio that aren't in our meta list
  Object.keys(allApps).forEach((app) => {
    if (!appsToShow.includes(app)) appsToShow.push(app);
  });

  const activeCount = connections?.active || 0;
  const totalCount = connections?.total || 0;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-white">Composio Integrations</h1>
            <p className="text-white/50 text-sm mt-1">
              One-click OAuth connections to all your apps — powered by Composio
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-white/20 text-white/60 hover:text-white"
            onClick={() => refetch()}
          >
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh Status
          </Button>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-4 gap-4 mt-4">
          {[
            { label: "Active Connections", value: activeCount, color: "text-green-400" },
            { label: "Total Connections", value: totalCount, color: "text-cyan-400" },
            { label: "Expired (need reconnect)", value: connections?.expired || 0, color: "text-yellow-400" },
            { label: "Apps Available", value: appsToShow.length, color: "text-purple-400" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/5 rounded-lg p-3 border border-white/10">
              <div className={`text-2xl font-bold ${stat.color}`}>{isLoading ? "..." : stat.value}</div>
              <div className="text-xs text-white/40 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Priority Apps */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">
          Social Media & Marketing
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {["facebook", "instagram", "whatsapp"].map((app) => (
            <AppCard
              key={app}
              appName={app}
              connections={allApps[app] || []}
              onConnect={handleConnect}
              onReconnect={handleReconnect}
              isConnecting={connectingApp}
            />
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">
          Communication & Productivity
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {["gmail", "slack", "discord"].map((app) => (
            <AppCard
              key={app}
              appName={app}
              connections={allApps[app] || []}
              onConnect={handleConnect}
              onReconnect={handleReconnect}
              isConnecting={connectingApp}
            />
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">
          Business & Commerce
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {["shopify", "googledrive", "elevenlabs"].map((app) => (
            <AppCard
              key={app}
              appName={app}
              connections={allApps[app] || []}
              onConnect={handleConnect}
              onReconnect={handleReconnect}
              isConnecting={connectingApp}
            />
          ))}
        </div>
      </div>

      {/* Composio link */}
      <div className="mt-8 p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-lg flex items-center justify-between">
        <div>
          <p className="text-sm text-white/70 font-medium">Manage all connections on Composio dashboard</p>
          <p className="text-xs text-white/40 mt-0.5">View logs, revoke access, add new apps, and manage entities</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
          onClick={() => window.open("https://app.composio.dev/connections", "_blank")}
        >
          <ExternalLink className="w-4 h-4 mr-2" /> Open Composio
        </Button>
      </div>
    </div>
  );
}
