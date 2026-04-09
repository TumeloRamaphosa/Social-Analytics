import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Video, Image, Zap, Link2, CheckCircle2, XCircle,
  Loader2, Eye, Download, RefreshCw, Sparkles, Film,
  AlertCircle, ExternalLink, Key, TestTube2, Unplug
} from "lucide-react";
import { toast } from "sonner";

const NEON_PINK = "#ff00cc";
const NEON_CYAN = "#00ffff";
const NEON_PURPLE = "#9900ff";
const NEON_GREEN = "#00ff88";
const NEON_YELLOW = "#ffcc00";

// ─── Generation result card ───────────────────────────────────────────────────
function GenerationCard({ id, status, outputUrl, thumbnailUrl, prompt, type, onPoll }: {
  id: string; status: string; outputUrl: string | null; thumbnailUrl: string | null;
  prompt: string; type: string; onPoll: () => void;
}) {
  const isComplete = status === "completed";
  const isFailed = status === "failed";
  const isProcessing = !isComplete && !isFailed;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border p-4 space-y-3"
      style={{ background: "rgba(5,0,8,0.8)", borderColor: isComplete ? `${NEON_GREEN}40` : isFailed ? "#ff444440" : `${NEON_PINK}40` }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {type === "image" ? <Image className="w-4 h-4 text-pink-400" /> : <Video className="w-4 h-4 text-cyan-400" />}
          <span className="text-white font-rajdhani text-sm font-bold capitalize">{type} Generation</span>
        </div>
        <div className="flex items-center gap-2">
          {isProcessing && (
            <button onClick={onPoll} className="text-gray-500 hover:text-pink-400 transition-colors">
              <RefreshCw className="w-3 h-3" />
            </button>
          )}
          <Badge
            className="text-xs font-rajdhani"
            style={{
              background: isComplete ? `${NEON_GREEN}20` : isFailed ? "#ff444420" : `${NEON_YELLOW}20`,
              color: isComplete ? NEON_GREEN : isFailed ? "#ff4444" : NEON_YELLOW
            }}
          >
            {isProcessing && <Loader2 className="w-2 h-2 mr-1 animate-spin inline" />}
            {status}
          </Badge>
        </div>
      </div>

      <p className="text-gray-400 font-rajdhani text-xs line-clamp-2">{prompt}</p>

      {/* Output preview */}
      {isComplete && outputUrl && (
        <div className="space-y-2">
          {type === "image" ? (
            <img src={outputUrl} alt={prompt} className="w-full rounded-lg max-h-64 object-cover" />
          ) : (
            <video src={outputUrl} controls className="w-full rounded-lg max-h-64" poster={thumbnailUrl || undefined} />
          )}
          <div className="flex gap-2">
            <a href={outputUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
              <Button size="sm" variant="outline" className="w-full font-rajdhani border-green-500/30 text-green-400 hover:bg-green-500/10">
                <ExternalLink className="w-3 h-3 mr-1" /> Open
              </Button>
            </a>
            <a href={outputUrl} download className="flex-1">
              <Button size="sm" variant="outline" className="w-full font-rajdhani border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10">
                <Download className="w-3 h-3 mr-1" /> Download
              </Button>
            </a>
          </div>
        </div>
      )}

      {isFailed && (
        <div className="flex items-center gap-2 text-red-400 text-xs font-rajdhani">
          <XCircle className="w-3 h-3" /> Generation failed. Try again with a different prompt.
        </div>
      )}

      <div className="text-gray-600 text-xs font-rajdhani">ID: {id}</div>
    </motion.div>
  );
}

// ─── Connect panel ────────────────────────────────────────────────────────────
function ConnectPanel({ onConnected }: { onConnected: () => void }) {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);

  const connectMutation = trpc.higgsfield.connect.useMutation({
    onSuccess: () => {
      toast.success("Higgsfield account connected!");
      onConnected();
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-lg mx-auto space-y-6"
    >
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #ff00cc20, #9900ff20)", border: "1px solid #ff00cc40" }}>
          <Film className="w-8 h-8" style={{ color: NEON_PINK }} />
        </div>
        <h2 className="font-orbitron text-white text-xl font-black mb-2">Connect Higgsfield AI</h2>
        <p className="text-gray-400 font-rajdhani text-sm">
          Higgsfield is an AI video and image generation platform. Connect your account to generate
          cinematic videos, animate images, and create AI visuals directly from this dashboard.
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {[
          { step: "1", text: "Go to cloud.higgsfield.ai and sign in", link: "https://cloud.higgsfield.ai" },
          { step: "2", text: "Navigate to Settings → API Keys" },
          { step: "3", text: "Create a new API key and copy it" },
          { step: "4", text: "Paste it below and click Connect" },
        ].map(({ step, text, link }) => (
          <div key={step} className="flex items-center gap-3 p-3 rounded-lg border border-white/10 bg-white/5">
            <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 font-orbitron text-xs font-black"
              style={{ background: `${NEON_PINK}20`, color: NEON_PINK }}>
              {step}
            </div>
            <span className="text-gray-300 font-rajdhani text-sm flex-1">{text}</span>
            {link && (
              <a href={link} target="_blank" rel="noopener noreferrer" className="text-pink-400 hover:text-pink-300">
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        ))}
      </div>

      {/* API Key input */}
      <div className="space-y-2">
        <label className="text-gray-400 font-rajdhani text-sm font-bold flex items-center gap-2">
          <Key className="w-3 h-3" /> Higgsfield API Key
        </label>
        <div className="relative">
          <Input
            type={showKey ? "text" : "password"}
            placeholder="hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="font-mono text-sm bg-black/50 border-pink-500/30 text-white pr-16"
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-xs font-rajdhani"
          >
            {showKey ? "Hide" : "Show"}
          </button>
        </div>
        <p className="text-gray-600 text-xs font-rajdhani">
          Your API key is stored securely and never exposed to the browser after saving.
        </p>
      </div>

      <Button
        onClick={() => connectMutation.mutate({ apiKey })}
        disabled={!apiKey || connectMutation.isPending}
        className="w-full font-rajdhani font-bold"
        style={{ background: "linear-gradient(135deg, #ff00cc, #9900ff)" }}
      >
        {connectMutation.isPending ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Connecting...</>
        ) : (
          <><Link2 className="w-4 h-4 mr-2" /> Connect Higgsfield Account</>
        )}
      </Button>
    </motion.div>
  );
}

// ─── Main Studio Page ─────────────────────────────────────────────────────────
export default function HiggsfieldStudio() {
  const [activeTab, setActiveTab] = useState("text-to-image");
  const [generations, setGenerations] = useState<Array<{
    id: string; status: string; outputUrl: string | null; thumbnailUrl: string | null;
    prompt: string; type: string;
  }>>([]);

  // Form state
  const [imagePrompt, setImagePrompt] = useState("");
  const [imageModel, setImageModel] = useState("flux");
  const [videoImageUrl, setVideoImageUrl] = useState("");
  const [videoPrompt, setVideoPrompt] = useState("");
  const [videoDuration, setVideoDuration] = useState(5);
  const [motionIntensity, setMotionIntensity] = useState<"low" | "medium" | "high">("medium");
  const [t2vPrompt, setT2vPrompt] = useState("");
  const [pollingIds, setPollingIds] = useState<Set<string>>(new Set());

  const utils = trpc.useUtils();

  // ─── Status query ─────────────────────────────────────────────────────────
  const { data: status, isLoading: statusLoading, refetch: refetchStatus } =
    trpc.higgsfield.getStatus.useQuery();

  const isConnected = status?.connected === true;

  // ─── Mutations ────────────────────────────────────────────────────────────
  const disconnectMutation = trpc.higgsfield.disconnect.useMutation({
    onSuccess: () => { toast.success("Higgsfield disconnected"); refetchStatus(); },
    onError: (err) => toast.error(err.message),
  });

  const testMutation = trpc.higgsfield.testConnection.useMutation({
    onSuccess: (data) => toast.success(data.message),
    onError: (err) => toast.error(err.message),
  });

  const generateImageMutation = trpc.higgsfield.generateImage.useMutation({
    onSuccess: (data) => {
      toast.success("Image generation queued!");
      setGenerations(prev => [{
        id: data.generationId, status: data.status, outputUrl: null,
        thumbnailUrl: null, prompt: imagePrompt, type: "image"
      }, ...prev]);
      setPollingIds(prev => new Set(Array.from(prev).concat(data.generationId)));
      setImagePrompt("");
    },
    onError: (err) => toast.error(err.message),
  });

  const generateVideoMutation = trpc.higgsfield.generateVideo.useMutation({
    onSuccess: (data) => {
      toast.success("Video generation queued! This takes 30–90 seconds.");
      setGenerations(prev => [{
        id: data.generationId, status: data.status, outputUrl: null,
        thumbnailUrl: null, prompt: videoPrompt, type: "video"
      }, ...prev]);
      setPollingIds(prev => new Set(Array.from(prev).concat(data.generationId)));
      setVideoPrompt(""); setVideoImageUrl("");
    },
    onError: (err) => toast.error(err.message),
  });

  const generateT2VMutation = trpc.higgsfield.generateTextToVideo.useMutation({
    onSuccess: (data) => {
      toast.success("Text-to-video generation queued!");
      setGenerations(prev => [{
        id: data.generationId, status: data.status, outputUrl: null,
        thumbnailUrl: null, prompt: t2vPrompt, type: "video"
      }, ...prev]);
      setPollingIds(prev => new Set(Array.from(prev).concat(data.generationId)));
      setT2vPrompt("");
    },
    onError: (err) => toast.error(err.message),
  });

  // ─── Poll for generation status ───────────────────────────────────────────
  const pollGeneration = async (genId: string) => {
    try {
      const result = await utils.higgsfield.getGenerationStatus.fetch({ generationId: genId });
      setGenerations(prev => prev.map(g =>
        g.id === genId ? { ...g, status: result.status, outputUrl: result.outputUrl, thumbnailUrl: result.thumbnailUrl } : g
      ));
      if (result.status === "completed" || result.status === "failed") {
        setPollingIds(prev => { const s = new Set(Array.from(prev)); s.delete(genId); return s; });
        if (result.status === "completed") toast.success("Generation complete!");
      }
    } catch {
      // Silently fail on poll errors
    }
  };

  // Auto-poll every 5 seconds for pending generations
  useEffect(() => {
    if (pollingIds.size === 0) return;
    const interval = setInterval(() => {
      Array.from(pollingIds).forEach(id => pollGeneration(id));
    }, 5000);
    return () => clearInterval(interval);
  }, [pollingIds]);

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <DashboardLayout>
      <div className="p-6 space-y-6" style={{ background: "rgba(5,0,8,0.95)", minHeight: "100vh" }}>

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-orbitron text-2xl font-black text-white">
              Higgsfield <span style={{ color: NEON_PINK }}>AI Studio</span>
            </h1>
            <p className="text-gray-400 font-rajdhani mt-1">
              Generate cinematic AI videos and images — powered by Higgsfield
            </p>
          </div>
          {isConnected && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-green-500/30 bg-green-500/10">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-green-400 font-rajdhani text-sm font-bold">Connected</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => testMutation.mutate()}
                disabled={testMutation.isPending}
                className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 font-rajdhani"
              >
                <TestTube2 className="w-3 h-3 mr-1" />
                Test
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => disconnectMutation.mutate()}
                disabled={disconnectMutation.isPending}
                className="border-red-500/30 text-red-400 hover:bg-red-500/10 font-rajdhani"
              >
                <Unplug className="w-3 h-3 mr-1" />
                Disconnect
              </Button>
            </div>
          )}
        </div>

        {/* Not connected */}
        {!statusLoading && !isConnected && (
          <ConnectPanel onConnected={() => refetchStatus()} />
        )}

        {/* Loading */}
        {statusLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-pink-400" />
          </div>
        )}

        {/* Studio — connected */}
        {isConnected && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Left: Generation controls */}
            <div className="space-y-4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-black/50 border border-pink-500/20 w-full">
                  <TabsTrigger value="text-to-image" className="flex-1 font-rajdhani data-[state=active]:bg-pink-500/20 data-[state=active]:text-pink-400">
                    <Image className="w-3 h-3 mr-1" /> Text → Image
                  </TabsTrigger>
                  <TabsTrigger value="image-to-video" className="flex-1 font-rajdhani data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
                    <Film className="w-3 h-3 mr-1" /> Image → Video
                  </TabsTrigger>
                  <TabsTrigger value="text-to-video" className="flex-1 font-rajdhani data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
                    <Video className="w-3 h-3 mr-1" /> Text → Video
                  </TabsTrigger>
                </TabsList>

                {/* TEXT TO IMAGE */}
                <TabsContent value="text-to-image">
                  <Card className="border-pink-500/20 bg-black/40">
                    <CardHeader>
                      <CardTitle className="font-orbitron text-white text-sm flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-pink-400" />
                        Generate Image from Text
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-gray-400 font-rajdhani text-xs font-bold">PROMPT</label>
                        <Textarea
                          placeholder="A cinematic shot of a futuristic Johannesburg skyline at golden hour, ultra-realistic, 8K..."
                          value={imagePrompt}
                          onChange={(e) => setImagePrompt(e.target.value)}
                          className="bg-black/50 border-pink-500/20 text-white font-rajdhani text-sm min-h-24 resize-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-gray-400 font-rajdhani text-xs font-bold">MODEL</label>
                        <select
                          value={imageModel}
                          onChange={(e) => setImageModel(e.target.value)}
                          className="w-full bg-black/50 border border-pink-500/20 text-white font-rajdhani text-sm rounded-lg p-2"
                        >
                          <option value="flux">FLUX (High Quality)</option>
                          <option value="flux-pro">FLUX Pro (Professional)</option>
                          <option value="sdxl">SDXL (Fast)</option>
                        </select>
                      </div>
                      <Button
                        onClick={() => generateImageMutation.mutate({ prompt: imagePrompt, model: imageModel })}
                        disabled={!imagePrompt || generateImageMutation.isPending}
                        className="w-full font-rajdhani font-bold"
                        style={{ background: "linear-gradient(135deg, #ff00cc, #9900ff)" }}
                      >
                        {generateImageMutation.isPending ? (
                          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                        ) : (
                          <><Sparkles className="w-4 h-4 mr-2" /> Generate Image</>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* IMAGE TO VIDEO */}
                <TabsContent value="image-to-video">
                  <Card className="border-cyan-500/20 bg-black/40">
                    <CardHeader>
                      <CardTitle className="font-orbitron text-white text-sm flex items-center gap-2">
                        <Film className="w-4 h-4 text-cyan-400" />
                        Animate Image into Video
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-gray-400 font-rajdhani text-xs font-bold">IMAGE URL</label>
                        <Input
                          placeholder="https://example.com/your-image.jpg"
                          value={videoImageUrl}
                          onChange={(e) => setVideoImageUrl(e.target.value)}
                          className="bg-black/50 border-cyan-500/20 text-white font-rajdhani text-sm"
                        />
                        <p className="text-gray-600 text-xs font-rajdhani">
                          Paste a direct URL to your image (JPEG or PNG, publicly accessible)
                        </p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-gray-400 font-rajdhani text-xs font-bold">MOTION PROMPT</label>
                        <Textarea
                          placeholder="Camera slowly pans right, clouds move across the sky, gentle wind effect..."
                          value={videoPrompt}
                          onChange={(e) => setVideoPrompt(e.target.value)}
                          className="bg-black/50 border-cyan-500/20 text-white font-rajdhani text-sm min-h-20 resize-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <label className="text-gray-400 font-rajdhani text-xs font-bold">DURATION (seconds)</label>
                          <Input
                            type="number" min={3} max={30}
                            value={videoDuration}
                            onChange={(e) => setVideoDuration(Number(e.target.value))}
                            className="bg-black/50 border-cyan-500/20 text-white font-rajdhani text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-gray-400 font-rajdhani text-xs font-bold">MOTION INTENSITY</label>
                          <select
                            value={motionIntensity}
                            onChange={(e) => setMotionIntensity(e.target.value as any)}
                            className="w-full bg-black/50 border border-cyan-500/20 text-white font-rajdhani text-sm rounded-lg p-2"
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                          </select>
                        </div>
                      </div>
                      <Button
                        onClick={() => generateVideoMutation.mutate({
                          imageUrl: videoImageUrl, prompt: videoPrompt,
                          duration: videoDuration, motionIntensity
                        })}
                        disabled={!videoImageUrl || !videoPrompt || generateVideoMutation.isPending}
                        className="w-full font-rajdhani font-bold"
                        style={{ background: "linear-gradient(135deg, #00ffff40, #0099ff)", color: "#000" }}
                      >
                        {generateVideoMutation.isPending ? (
                          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating Video...</>
                        ) : (
                          <><Film className="w-4 h-4 mr-2" /> Animate to Video</>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* TEXT TO VIDEO */}
                <TabsContent value="text-to-video">
                  <Card className="border-purple-500/20 bg-black/40">
                    <CardHeader>
                      <CardTitle className="font-orbitron text-white text-sm flex items-center gap-2">
                        <Video className="w-4 h-4 text-purple-400" />
                        Generate Video from Text
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-gray-400 font-rajdhani text-xs font-bold">VIDEO PROMPT</label>
                        <Textarea
                          placeholder="A drone shot flying over Cape Town at sunset, the ocean glistening, cinematic colour grade..."
                          value={t2vPrompt}
                          onChange={(e) => setT2vPrompt(e.target.value)}
                          className="bg-black/50 border-purple-500/20 text-white font-rajdhani text-sm min-h-28 resize-none"
                        />
                        <p className="text-gray-600 text-xs font-rajdhani">
                          Be descriptive — include camera movement, lighting, mood, and subject
                        </p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-gray-400 font-rajdhani text-xs font-bold">DURATION (seconds)</label>
                        <Input
                          type="number" min={3} max={15}
                          value={videoDuration}
                          onChange={(e) => setVideoDuration(Number(e.target.value))}
                          className="bg-black/50 border-purple-500/20 text-white font-rajdhani text-sm"
                        />
                      </div>
                      <Button
                        onClick={() => generateT2VMutation.mutate({ prompt: t2vPrompt, duration: videoDuration })}
                        disabled={!t2vPrompt || generateT2VMutation.isPending}
                        className="w-full font-rajdhani font-bold"
                        style={{ background: "linear-gradient(135deg, #9900ff, #ff00cc)" }}
                      >
                        {generateT2VMutation.isPending ? (
                          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating Video...</>
                        ) : (
                          <><Video className="w-4 h-4 mr-2" /> Generate Video</>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Tips */}
              <Card className="border-white/10 bg-black/20">
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <div className="text-gray-500 font-rajdhani text-xs font-bold">PROMPT TIPS</div>
                    {[
                      "Be specific about lighting: 'golden hour', 'neon-lit night', 'overcast'",
                      "Include camera movement: 'slow dolly in', 'aerial drone shot', 'tracking shot'",
                      "Specify style: 'cinematic', 'documentary', 'hyperrealistic', '8K'",
                      "For brand content: include your product name and key visual elements",
                    ].map((tip, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Zap className="w-3 h-3 text-pink-400 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-500 font-rajdhani text-xs">{tip}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right: Generation results */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-orbitron text-white text-sm">
                  Generation Queue
                  {pollingIds.size > 0 && (
                    <span className="ml-2 font-rajdhani text-yellow-400 text-xs">
                      <Loader2 className="w-3 h-3 inline animate-spin mr-1" />
                      {pollingIds.size} processing...
                    </span>
                  )}
                </h3>
              </div>

              {generations.length === 0 ? (
                <div className="rounded-xl border border-white/10 bg-black/20 p-12 text-center">
                  <Film className="w-10 h-10 mx-auto mb-3 text-gray-700" />
                  <div className="text-gray-500 font-rajdhani text-sm">
                    Your generated images and videos will appear here
                  </div>
                  <p className="text-gray-700 text-xs font-rajdhani mt-1">
                    Start by entering a prompt and clicking Generate
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                  {generations.map(gen => (
                    <GenerationCard
                      key={gen.id}
                      {...gen}
                      onPoll={() => pollGeneration(gen.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
