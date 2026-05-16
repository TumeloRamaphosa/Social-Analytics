import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import {
  Facebook, Instagram, Mail, Hash, Send, Loader2,
  ImageIcon, CheckCircle2, XCircle, Globe, Sparkles,
  Clock, CheckSquare, Square, Zap, BarChart3, Calendar
} from "lucide-react";

const PLATFORMS = [
  {
    id: "facebook", label: "Facebook", icon: Facebook,
    color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30",
    description: "Post to your Facebook Page",
    features: ["Text posts", "Photo posts", "Link sharing"],
  },
  {
    id: "instagram", label: "Instagram", icon: Instagram,
    color: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/30",
    description: "Publish to Instagram Business",
    features: ["Feed posts", "Carousel", "Reels (via Higgsfield)"],
  },
  {
    id: "discord", label: "Discord", icon: Hash,
    color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/30",
    description: "Send to Discord channels",
    features: ["Channel messages", "Announcements", "Team updates"],
  },
  {
    id: "gmail", label: "Gmail", icon: Mail,
    color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30",
    description: "Send as email newsletter",
    features: ["Email campaigns", "Newsletters", "Notifications"],
  },
];

type PublishResult = { success: boolean; id?: string; error?: string };

export default function MultiPublisher() {
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["facebook"]);
  const [publishResults, setPublishResults] = useState<Record<string, PublishResult> | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");

  const { data: connections } = trpc.composio.getConnections.useQuery(undefined, { refetchInterval: 30000 });

  const createPostMutation = trpc.content.createPost.useMutation();
  const publishPostMutation = trpc.content.publishPost.useMutation({
    onSuccess: (data: any) => {
      setPublishResults(data.results || {});
      setIsPublishing(false);
      const successes = Object.entries(data.results || {}).filter(([, r]: any) => r.success).map(([p]) => p);
      const failures = Object.entries(data.results || {}).filter(([, r]: any) => !r.success).map(([p]) => p);
      if (successes.length) toast.success(`✓ Published to: ${successes.join(", ")}`);
      if (failures.length) toast.error(`✗ Failed on: ${failures.join(", ")}`);
    },
    onError: (err) => {
      setIsPublishing(false);
      toast.error(err.message);
    },
  });

  const generateMutation = trpc.content.generatePost.useMutation({
    onSuccess: (data: any) => {
      setCaption(data.caption || "");
      setHashtags(data.hashtags || "");
      toast.success("AI content generated!");
    },
    onError: (err) => toast.error(err.message),
  });

  const togglePlatform = (id: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const getConnectionStatus = (platformId: string) => {
    if (!connections?.apps) return "unknown";
    const conns = connections.apps[platformId] || [];
    if (conns.some((c: any) => c.status === "ACTIVE")) return "active";
    if (conns.some((c: any) => c.status === "EXPIRED")) return "expired";
    return "not_connected";
  };

  const handlePublish = async () => {
    if (!caption.trim()) { toast.error("Please enter content to publish"); return; }
    if (selectedPlatforms.length === 0) { toast.error("Select at least one platform"); return; }
    setIsPublishing(true);
    setPublishResults(null);

    try {
      // Create a draft post first
      const post = await createPostMutation.mutateAsync({
        caption,
        hashtags,
        imageUrl: imageUrl || undefined,
        platform: selectedPlatforms.includes("facebook") ? "facebook" : selectedPlatforms[0] as any,
      });

      // Then publish via Composio
      publishPostMutation.mutate({
        postId: (post as any).id,
        platforms: selectedPlatforms as any,
      });
    } catch (e: any) {
      setIsPublishing(false);
      toast.error(e.message);
    }
  };

  const handleAiGenerate = () => {
    if (!aiPrompt.trim()) { toast.error("Enter a content brief first"); return; }
    generateMutation.mutate({
      brief: aiPrompt,
      platform: selectedPlatforms[0] as any || "facebook",
      contentType: "product",
    });
  };

  const totalActive = connections?.active || 0;
  const totalConnections = connections?.total || 0;

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Globe className="w-8 h-8 text-cyan-400" />
              Multi-Platform Publisher
            </h1>
            <p className="text-gray-400 mt-1">
              Write once, publish everywhere — powered by Composio
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
              {totalActive}/{totalConnections} Connected
            </Badge>
            <Button
              variant="outline"
              size="sm"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
              onClick={() => window.location.href = "/composio"}
            >
              <Zap className="w-4 h-4 mr-1 text-yellow-400" />
              Manage Connections
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left — Platform Selector */}
          <div className="space-y-4">
            <h2 className="text-white font-semibold text-sm uppercase tracking-wide">Select Platforms</h2>
            {PLATFORMS.map(p => {
              const status = getConnectionStatus(p.id);
              const isSelected = selectedPlatforms.includes(p.id);
              const Icon = p.icon;
              return (
                <button
                  key={p.id}
                  onClick={() => status === "active" ? togglePlatform(p.id) : window.location.href = "/composio"}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    isSelected && status === "active"
                      ? `${p.bg} ${p.border} ring-1 ring-current`
                      : "bg-gray-900/50 border-gray-700 hover:border-gray-600"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${p.bg}`}>
                      <Icon className={`w-5 h-5 ${p.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-white font-medium text-sm">{p.label}</span>
                        <div className="flex items-center gap-1">
                          {isSelected && status === "active" && (
                            <CheckSquare className="w-4 h-4 text-green-400" />
                          )}
                          {!isSelected && <Square className="w-4 h-4 text-gray-600" />}
                        </div>
                      </div>
                      <p className="text-gray-500 text-xs mt-0.5">{p.description}</p>
                      <div className="flex items-center gap-1 mt-2">
                        {status === "active" && (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs px-1.5 py-0">
                            ● Connected
                          </Badge>
                        )}
                        {status === "expired" && (
                          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs px-1.5 py-0">
                            ⚠ Expired — Reconnect
                          </Badge>
                        )}
                        {status === "not_connected" && (
                          <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30 text-xs px-1.5 py-0">
                            + Connect
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}

            {/* Stats */}
            <Card className="bg-gray-900/50 border-gray-700">
              <CardContent className="p-4 space-y-3">
                <h3 className="text-gray-400 text-xs font-medium uppercase tracking-wide">Publishing Stats</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{selectedPlatforms.length}</p>
                    <p className="text-gray-500 text-xs">Selected</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-cyan-400">{totalActive}</p>
                    <p className="text-gray-500 text-xs">Active</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Centre — Content Composer */}
          <div className="lg:col-span-2 space-y-4">
            {/* AI Generator */}
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  AI Content Generator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g. Promote our weekend special — 20% off all cuts..."
                    className="bg-gray-800 border-gray-600 text-white text-sm"
                    onKeyDown={(e) => e.key === "Enter" && handleAiGenerate()}
                  />
                  <Button
                    onClick={handleAiGenerate}
                    disabled={generateMutation.isPending}
                    className="bg-purple-600 hover:bg-purple-700 text-white shrink-0"
                    size="sm"
                  >
                    {generateMutation.isPending
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Sparkles className="w-4 h-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Composer */}
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Send className="w-4 h-4 text-cyan-400" />
                  Compose Post
                </CardTitle>
                <CardDescription className="text-gray-400 text-xs">
                  Content will be automatically formatted for each platform's character limits and style
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-gray-300 text-sm">Caption</Label>
                  <Textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Write your post content here..."
                    className="bg-gray-800 border-gray-600 text-white min-h-[140px] resize-none text-sm"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{caption.length} characters</span>
                    <span className={caption.length > 2200 ? "text-red-400" : "text-gray-500"}>
                      {caption.length > 2200 ? "⚠ Exceeds Instagram limit" : "✓ Within all platform limits"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300 text-sm">Hashtags</Label>
                    <Input
                      value={hashtags}
                      onChange={(e) => setHashtags(e.target.value)}
                      placeholder="#brand #marketing #southafrica"
                      className="bg-gray-800 border-gray-600 text-white text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300 text-sm">Image URL (optional)</Label>
                    <Input
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://..."
                      className="bg-gray-800 border-gray-600 text-white text-sm"
                    />
                  </div>
                </div>

                {/* Platform preview badges */}
                {selectedPlatforms.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedPlatforms.map(pid => {
                      const p = PLATFORMS.find(x => x.id === pid);
                      if (!p) return null;
                      const Icon = p.icon;
                      return (
                        <Badge key={pid} className={`${p.bg} ${p.color} ${p.border} text-xs`}>
                          <Icon className="w-3 h-3 mr-1" />
                          {p.label}
                        </Badge>
                      );
                    })}
                  </div>
                )}

                <Button
                  onClick={handlePublish}
                  disabled={isPublishing || !caption.trim() || selectedPlatforms.length === 0}
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold"
                >
                  {isPublishing ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Publishing to {selectedPlatforms.length} platform{selectedPlatforms.length > 1 ? "s" : ""}...</>
                  ) : (
                    <><Send className="w-4 h-4 mr-2" />Publish to {selectedPlatforms.length} Platform{selectedPlatforms.length > 1 ? "s" : ""}</>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Publish Results */}
            {publishResults && (
              <Card className="bg-gray-900/50 border-gray-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-green-400" />
                    Publish Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(publishResults).map(([platform, result]) => {
                      const p = PLATFORMS.find(x => x.id === platform);
                      const Icon = p?.icon || Globe;
                      return (
                        <div
                          key={platform}
                          className={`flex items-center gap-3 p-3 rounded-lg border ${
                            result.success
                              ? "bg-green-500/10 border-green-500/30"
                              : "bg-red-500/10 border-red-500/30"
                          }`}
                        >
                          <Icon className={`w-4 h-4 ${p?.color || "text-gray-400"}`} />
                          <span className="text-white text-sm capitalize font-medium">{platform}</span>
                          {result.success ? (
                            <div className="flex items-center gap-1 ml-auto">
                              <CheckCircle2 className="w-4 h-4 text-green-400" />
                              <span className="text-green-400 text-xs">Published</span>
                              {result.id && <span className="text-gray-500 text-xs ml-1">#{result.id}</span>}
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 ml-auto">
                              <XCircle className="w-4 h-4 text-red-400" />
                              <span className="text-red-400 text-xs">{result.error || "Failed"}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Platform Tips */}
            <Card className="bg-gray-900/30 border-gray-800">
              <CardContent className="p-4">
                <h3 className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-3">Platform Best Practices</h3>
                <div className="grid grid-cols-2 gap-3 text-xs text-gray-500">
                  <div>
                    <p className="text-blue-400 font-medium mb-1">Facebook</p>
                    <p>50–150 words, end with a question, no hashtags, use emojis sparingly</p>
                  </div>
                  <div>
                    <p className="text-pink-400 font-medium mb-1">Instagram</p>
                    <p>Max 2,200 chars, 3–5 hashtags, friendly tone, line breaks for readability</p>
                  </div>
                  <div>
                    <p className="text-indigo-400 font-medium mb-1">Discord</p>
                    <p>Casual, community-focused, use @mentions and channel links</p>
                  </div>
                  <div>
                    <p className="text-red-400 font-medium mb-1">Gmail</p>
                    <p>Subject under 60 chars, clear CTA, mobile-optimised format</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
