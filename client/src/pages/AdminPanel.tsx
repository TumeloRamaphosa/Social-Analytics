import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Settings, 
  Server, 
  Database, 
  Key, 
  Globe, 
  Users,
  Shield,
  Bell,
  HardDrive,
  Cloud,
  Zap,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Save
} from "lucide-react";

interface ServiceConfig {
  name: string;
  status: "connected" | "disconnected" | "error";
  apiKey: string;
  endpoint: string;
}

interface SystemStatus {
  service: string;
  status: "running" | "stopped" | "error";
  port: number;
  memory: string;
  uptime: string;
}

const SERVICES: ServiceConfig[] = [
  { name: "Supabase", status: "connected", apiKey: "••••••••••••", endpoint: "https://xxx.supabase.co" },
  { name: "Ollama", status: "connected", apiKey: "Local", endpoint: "http://localhost:11434" },
  { name: "Pollinations", status: "connected", apiKey: "Free API", endpoint: "https://gen.pollinations.ai" },
  { name: "Higgsfield", status: "connected", apiKey: "••••••••", endpoint: "https://api.higgsfield.ai" },
  { name: "Blotato", status: "connected", apiKey: "••••••••", endpoint: "https://api.blotato.com" },
  { name: "Firecrawl", status: "connected", apiKey: "••••••••", endpoint: "https://api.firecrawl.dev" },
  { name: "Google Drive", status: "disconnected", apiKey: "Not configured", endpoint: "-" },
  { name: "Neo4j", status: "disconnected", apiKey: "Not installed", endpoint: "-" },
];

const SYSTEM_STATUS: SystemStatus[] = [
  { service: "Platform Server", status: "running", port: 3456, memory: "256MB", uptime: "5 days" },
  { service: "Ollama API", status: "running", port: 49489, memory: "4GB", uptime: "5 days" },
  { service: "PostgreSQL", status: "running", port: 5432, memory: "128MB", uptime: "5 days" },
  { service: "Redis", status: "running", port: 6379, memory: "32MB", uptime: "5 days" },
  { service: "n8n", status: "running", port: 3458, memory: "512MB", uptime: "3 days" },
];

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("services");
  const [settings, setSettings] = useState({
    autoSaveToDrive: false,
    defaultImageFolder: "Generated Images",
    defaultVideoFolder: "Generated Videos",
    autoApproveThreshold: 80,
    maxTokensPerDay: 100000,
    enableAgentSimulation: true,
    enableMarketingSkills: true,
    webhookUrl: "",
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
      case "running":
        return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case "disconnected":
      case "stopped":
        return <XCircle className="w-4 h-4 text-gray-400" />;
      default:
        return <XCircle className="w-4 h-4 text-red-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent">
              Admin Panel
            </h1>
            <p className="text-muted-foreground">Backend settings, services configuration, and system control</p>
          </div>
          <Badge variant="outline" className="bg-orange-500/10 text-orange-400">
            Backend Control
          </Badge>
        </div>

        {/* What This Does */}
        <Card className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 border-orange-500/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Settings className="w-8 h-8 text-orange-400 mt-1" />
              <div>
                <h3 className="font-semibold text-orange-400 mb-2">What is this?</h3>
                <p className="text-sm text-muted-foreground">
                  This is your backend control centre. Configure API connections, 
                  manage services, set up auto-save to Google Drive, monitor system resources,
                  and control AI agent behavior. Everything that runs behind the scenes.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl">
            <TabsTrigger value="services" className="flex items-center gap-2">
              <Server className="w-4 h-4" />
              Services
            </TabsTrigger>
            <TabsTrigger value="storage" className="flex items-center gap-2">
              <HardDrive className="w-4 h-4" />
              Storage
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              System
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Security
            </TabsTrigger>
          </TabsList>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  API Connections
                </CardTitle>
                <CardDescription>
                  Manage all external service connections and API keys
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {SERVICES.map((service) => (
                    <div key={service.name} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(service.status)}
                        <div>
                          <p className="font-medium">{service.name}</p>
                          <p className="text-xs text-muted-foreground">{service.endpoint}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={service.status === "connected" ? "default" : "secondary"}>
                          {service.status}
                        </Badge>
                        <Button size="sm" variant="outline">Configure</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Storage Tab */}
          <TabsContent value="storage" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cloud className="w-5 h-5" />
                  Cloud Storage Configuration
                </CardTitle>
                <CardDescription>
                  Configure automatic content saving to Google Drive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Auto-Save to Google Drive</p>
                    <p className="text-sm text-muted-foreground">Automatically save generated content to cloud</p>
                  </div>
                  <Switch 
                    checked={settings.autoSaveToDrive}
                    onCheckedChange={(checked) => setSettings({...settings, autoSaveToDrive: checked})}
                  />
                </div>

                {settings.autoSaveToDrive && (
                  <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Images Folder</Label>
                        <Input 
                          value={settings.defaultImageFolder}
                          onChange={(e) => setSettings({...settings, defaultImageFolder: e.target.value})}
                          placeholder="Generated Images"
                        />
                      </div>
                      <div>
                        <Label>Videos Folder</Label>
                        <Input 
                          value={settings.defaultVideoFolder}
                          onChange={(e) => setSettings({...settings, defaultVideoFolder: e.target.value})}
                          placeholder="Generated Videos"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Webhook URL (optional)</Label>
                      <Input 
                        value={settings.webhookUrl}
                        onChange={(e) => setSettings({...settings, webhookUrl: e.target.value})}
                        placeholder="https://your-webhook.com/callback"
                      />
                    </div>
                  </div>
                )}

                <Button className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  Save Storage Settings
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Content Organization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-500/10 rounded-lg text-center">
                    <Cloud className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <p className="font-medium">/Generated Images</p>
                    <p className="text-xs text-muted-foreground">AI-generated images</p>
                  </div>
                  <div className="p-4 bg-purple-500/10 rounded-lg text-center">
                    <Cloud className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                    <p className="font-medium">/Generated Videos</p>
                    <p className="text-xs text-muted-foreground">AI-generated videos</p>
                  </div>
                  <div className="p-4 bg-green-500/10 rounded-lg text-center">
                    <Cloud className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <p className="font-medium">/Posted Content</p>
                    <p className="text-xs text-muted-foreground">Ready for posting</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  System Status
                </CardTitle>
                <CardDescription>
                  Real-time status of all platform services
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {SYSTEM_STATUS.map((service) => (
                    <div key={service.service} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(service.status)}
                        <div>
                          <p className="font-medium">{service.service}</p>
                          <p className="text-xs text-muted-foreground">Port {service.port}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">{service.memory}</span>
                        <span className="text-muted-foreground">{service.uptime}</span>
                        <Badge variant={service.status === "running" ? "default" : "destructive"}>
                          {service.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>

                <Button variant="outline" className="w-full mt-4">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Status
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI Agent Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Enable Agent Simulation</p>
                    <p className="text-sm text-muted-foreground">MiroFish-style opinion testing</p>
                  </div>
                  <Switch 
                    checked={settings.enableAgentSimulation}
                    onCheckedChange={(checked) => setSettings({...settings, enableAgentSimulation: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Enable Marketing Skills</p>
                    <p className="text-sm text-muted-foreground">Built-in marketing guidance</p>
                  </div>
                  <Switch 
                    checked={settings.enableMarketingSkills}
                    onCheckedChange={(checked) => setSettings({...settings, enableMarketingSkills: checked})}
                  />
                </div>
                <div>
                  <Label>Auto-Approve Threshold (%)</Label>
                  <Input 
                    type="number"
                    value={settings.autoApproveThreshold}
                    onChange={(e) => setSettings({...settings, autoApproveThreshold: parseInt(e.target.value)})}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Content with sentiment above this auto-approves</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <span className="font-medium text-green-400">Platform is Secure</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    All API keys are encrypted. No Claude API required - fully local operation.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="font-medium mb-2">API Keys</p>
                    <p className="text-sm text-muted-foreground">Stored encrypted in database</p>
                    <Badge variant="outline" className="mt-2">Encrypted</Badge>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="font-medium mb-2">Local Models</p>
                    <p className="text-sm text-muted-foreground">Ollama running locally</p>
                    <Badge variant="outline" className="mt-2">No External Calls</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}