import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Cpu, 
  Download, 
  CheckCircle, 
  XCircle, 
  Loader2,
  Zap,
  Image,
  Video,
  Brain,
  Settings,
  Info,
  HardDrive,
  Database
} from "lucide-react";

interface ModelInfo {
  id: string;
  name: string;
  type: "text" | "image" | "video";
  size: string;
  vram: string;
  description: string;
  installed: boolean;
  installing?: boolean;
}

const LOCAL_MODELS: ModelInfo[] = [
  { id: "llama3.2:3b", name: "Llama 3.2 3B", type: "text", size: "2GB", vram: "4GB", description: "Fast text generation, good for prompts", installed: true },
  { id: "gemma2:2b", name: "Gemma 2 2B", type: "text", size: "1.6GB", vram: "3GB", description: "Lightweight text tasks", installed: true },
  { id: "glm-4.7-flash", name: "GLM-4.7 Flash", type: "text", size: "19GB", vram: "20GB", description: "Advanced analysis and reasoning", installed: true },
  { id: "llama3.2:70b", name: "Llama 3.2 70B", type: "text", size: "40GB", vram: "48GB", description: "Most powerful local text model", installed: false },
  { id: "flux-schnell", name: "FLUX.1 Schnell", type: "image", size: "12GB", vram: "16GB", description: "High quality image generation", installed: false },
  { id: "flux-klein", name: "FLUX.2 Klein 4B", type: "image", size: "8GB", vram: "13GB", description: "Fast, efficient image generation", installed: false },
  { id: "sdxl", name: "Stable Diffusion XL", type: "image", size: "6GB", vram: "8GB", description: "Large ecosystem, many variants", installed: false },
  { id: "pixart-sigma", name: "PixArt-Sigma", type: "image", size: "4GB", vram: "6GB", description: "Low VRAM, good quality", installed: false },
  { id: "wan-2.1", name: "WAN 2.1 Video", type: "video", size: "14GB", vram: "16GB", description: "Local video generation", installed: false },
];

const CLOUD_SERVICES = [
  { id: "higgsfield", name: "Higgsfield", status: "connected", description: "AI image & video generation", icon: "🎨" },
  { id: "pollinations", name: "Pollinations", status: "available", description: "Free image generation API", icon: "🌸" },
  { id: "replicate", name: "Replicate", status: "available", description: "Cloud model inference", icon: "☁️" },
  { id: "firecrawl", name: "Firecrawl", status: "connected", description: "Web scraping & research", icon: "🔥" },
];

export default function LocalModels() {
  const [models, setModels] = useState<ModelInfo[]>(LOCAL_MODELS);
  const [selectedTab, setSelectedTab] = useState("local");
  const [loading, setLoading] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState<{running: boolean, models: number}>({ running: true, models: 3 });

  useEffect(() => {
    checkOllamaStatus();
  }, []);

  const checkOllamaStatus = async () => {
    try {
      const response = await fetch('http://localhost:11434/api/tags');
      if (response.ok) {
        const data = await response.json();
        setOllamaStatus({ running: true, models: data.models?.length || 0 });
        
        // Update installed status based on actual Ollama models
        const installedIds = data.models?.map((m: any) => m.name) || [];
        setModels(prev => prev.map(m => ({
          ...m,
          installed: m.type === 'text' && installedIds.some((id: string) => id.startsWith(m.id.split(':')[0]))
        })));
      }
    } catch {
      setOllamaStatus({ running: false, models: 0 });
    }
  };

  const handleInstall = async (modelId: string) => {
    if (!ollamaStatus.running) {
      alert("Ollama is not running. Start it first: ollama serve");
      return;
    }
    
    setModels(prev => prev.map(m => m.id === modelId ? { ...m, installing: true } : m));
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:11434/api/pull', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: modelId })
      });
      
      if (response.ok) {
        setModels(prev => prev.map(m => m.id === modelId ? { ...m, installed: true, installing: false } : m));
      }
    } catch (error) {
      console.error("Failed to install model:", error);
    }
    
    setLoading(false);
  };

  const handleUninstall = async (modelId: string) => {
    setModels(prev => prev.map(m => m.id === modelId ? { ...m, installed: false } : m));
  };

  const installedModels = models.filter(m => m.installed);
  const availableModels = models.filter(m => !m.installed);

  // Your Mac's specs
  const hardwareSpecs = {
    chip: "Apple M1 Max",
    cpu: "10-core CPU",
    gpu: "32-core GPU",
    memory: "32GB Unified Memory",
    storage: "512GB SSD",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Local AI Models
            </h1>
            <p className="text-muted-foreground">Run AI models on your Mac - no cloud needed</p>
          </div>
        </div>

        {/* Hardware Specs */}
        <Card className="bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border-orange-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-orange-400" />
              Your Hardware
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
              <div className="p-3 bg-background/50 rounded-lg">
                <p className="text-muted-foreground">Chip</p>
                <p className="font-medium">{hardwareSpecs.chip}</p>
              </div>
              <div className="p-3 bg-background/50 rounded-lg">
                <p className="text-muted-foreground">CPU</p>
                <p className="font-medium">{hardwareSpecs.cpu}</p>
              </div>
              <div className="p-3 bg-background/50 rounded-lg">
                <p className="text-muted-foreground">GPU</p>
                <p className="font-medium">{hardwareSpecs.gpu}</p>
              </div>
              <div className="p-3 bg-background/50 rounded-lg">
                <p className="text-muted-foreground">Memory</p>
                <p className="font-medium">{hardwareSpecs.memory}</p>
              </div>
              <div className="p-3 bg-background/50 rounded-lg">
                <p className="text-muted-foreground">Storage</p>
                <p className="font-medium">{hardwareSpecs.storage}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Model Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Installed</p>
                  <p className="text-2xl font-bold">{installedModels.length}</p>
                  <p className="text-xs text-muted-foreground">models ready to use</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Can Install</p>
                  <p className="text-2xl font-bold">{availableModels.length}</p>
                  <p className="text-xs text-muted-foreground">additional models</p>
                </div>
                <Download className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Cloud Services</p>
                  <p className="text-2xl font-bold">4</p>
                  <p className="text-xs text-muted-foreground">connected & available</p>
                </div>
                <Zap className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="local">Local Models</TabsTrigger>
            <TabsTrigger value="cloud">Cloud Services</TabsTrigger>
            <TabsTrigger value="install">Install New</TabsTrigger>
          </TabsList>

          {/* Local Models Tab */}
          <TabsContent value="local" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {installedModels.map((model) => (
                <Card key={model.id} className="bg-card/50">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-green-500/20">
                        {model.type === "text" ? <Brain className="w-5 h-5 text-green-400" /> : 
                         model.type === "image" ? <Image className="w-5 h-5 text-green-400" /> :
                         <Video className="w-5 h-5 text-green-400" />}
                      </div>
                      <div>
                        <p className="font-semibold">{model.name}</p>
                        <p className="text-xs text-muted-foreground">{model.size}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{model.description}</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Settings className="w-4 h-4 mr-1" />
                        Configure
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleUninstall(model.id)}>
                        Uninstall
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Cloud Services Tab */}
          <TabsContent value="cloud" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CLOUD_SERVICES.map((service) => (
                <Card key={service.id} className={service.status === "connected" ? "bg-green-500/5 border-green-500/20" : ""}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{service.icon}</span>
                        <div>
                          <p className="font-semibold">{service.name}</p>
                          <p className="text-xs text-muted-foreground">{service.description}</p>
                        </div>
                      </div>
                      <Badge variant={service.status === "connected" ? "default" : "secondary"} className={service.status === "connected" ? "bg-green-500" : ""}>
                        {service.status === "connected" ? "Connected" : "Available"}
                      </Badge>
                    </div>
                    {service.status !== "connected" && (
                      <Button size="sm" className="w-full mt-4">
                        Connect
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Install New Tab */}
          <TabsContent value="install" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableModels.map((model) => (
                <Card key={model.id} className="bg-card/50 hover:bg-card/80 transition-colors">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-blue-500/20">
                        {model.type === "text" ? <Brain className="w-5 h-5 text-blue-400" /> : 
                         model.type === "image" ? <Image className="w-5 h-5 text-blue-400" /> :
                         <Video className="w-5 h-5 text-blue-400" />}
                      </div>
                      <div>
                        <p className="font-semibold">{model.name}</p>
                        <p className="text-xs text-muted-foreground">{model.size} • {model.vram} VRAM</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{model.description}</p>
                    <Button 
                      size="sm" 
                      className="w-full" 
                      onClick={() => handleInstall(model.id)}
                      disabled={model.installing}
                    >
                      {model.installing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Installing...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Install
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* How to Install More */}
        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              How to Install More Models
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <Badge variant="outline">1</Badge>
              <p>Install <code className="bg-background px-1 py-0.5 rounded">pip install ollamadiffuser</code> for image models</p>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="outline">2</Badge>
              <p>Run <code className="bg-background px-1 py-0.5 rounded">ollamadiffuser pull flux-schnell</code> to install FLUX models</p>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="outline">3</Badge>
              <p>For full local image generation, install ComfyUI: <code className="bg-background px-1 py-0.5 rounded">git clone https://github.com/comfyanonymous/ComfyUI</code></p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}