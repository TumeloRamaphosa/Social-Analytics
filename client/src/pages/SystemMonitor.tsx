import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity, 
  Network, 
  HardDrive, 
  Cpu, 
  Wifi,
  Server,
  Globe,
  RefreshCw,
  Clock,
  Zap,
  Terminal
} from "lucide-react";

interface PortInfo {
  port: number;
  process: string;
  pid: number;
  status: string;
  type: string;
  description: string;
}

interface NetworkConnection {
  local: string;
  remote: string;
  state: string;
}

interface DiskInfo {
  filesystem: string;
  size: string;
  used: string;
  available: string;
  percent: number;
  mounted: string;
}

interface SystemInfo {
  hostname: string;
  os: string;
  uptime: string;
  cpu: string;
  memory: string;
}

// Simulated data - in production would call actual system APIs
const SAMPLE_PORTS: PortInfo[] = [
  { port: 3456, process: "node (Social Analytics)", pid: 1386, status: "LISTEN", type: "TCP", description: "Platform server" },
  { port: 3458, process: "node (n8n)", pid: 17845, status: "LISTEN", type: "TCP", description: "Automation workflow" },
  { port: 49489, process: "Ollama", pid: 133, status: "LISTEN", type: "TCP", description: "Local AI models API" },
  { port: 18789, process: "ClawX (OpenClaw)", pid: 860, status: "LISTEN", type: "TCP", description: "MCP server" },
  { port: 61822, process: "node", pid: 22387, status: "LISTEN", type: "TCP", description: "Other service" },
  { port: 7000, process: "ControlCenter", pid: 1049, status: "LISTEN", type: "TCP", description: "AirPlay receiver" },
  { port: 5000, process: "ControlCenter", pid: 1049, status: "LISTEN", type: "TCP", description: "AirPlay" },
  { port: 6463, process: "Discord", pid: 1662, status: "LISTEN", type: "TCP", description: "Discord client" },
];

const SAMPLE_CONNECTIONS: NetworkConnection[] = [
  { local: "192.168.1.93:52003", remote: "github.com:443", state: "ESTABLISHED" },
  { local: "192.168.1.93:51923", remote: "api.telegram.org:443", state: "ESTABLISHED" },
  { local: "127.0.0.1:49489", remote: "127.0.0.1:51941", state: "ESTABLISHED" },
  { local: "192.168.1.93:51982", remote: "google.com:443", state: "ESTABLISHED" },
];

const SAMPLE_DISKS: DiskInfo[] = [
  { filesystem: "/dev/disk3s1", size: "926Gi", used: "800Gi", available: "126Gi", percent: 86, mounted: "/" },
  { filesystem: "/dev/disk1s2", size: "500Mi", used: "19Mi", available: "481Mi", percent: 4, mounted: "/System/Volumes/xarts" },
  { filesystem: "/dev/disk3s5", size: "926Gi", size: "738Gi", available: "126Gi", percent: 86, mounted: "/System/Volumes/Data" },
];

const SAMPLE_SYSTEM: SystemInfo = {
  hostname: "Tumelos-Mac-Mini",
  os: "macOS 14.4 (Sonoma)",
  uptime: "5 days, 14 hours",
  cpu: "Apple M4 Pro",
  memory: "16GB Unified Memory",
};

export default function SystemMonitor() {
  const [ports, setPorts] = useState<PortInfo[]>(SAMPLE_PORTS);
  const [connections, setConnections] = useState<NetworkConnection[]>(SAMPLE_CONNECTIONS);
  const [disks, setDisks] = useState<DiskInfo[]>(SAMPLE_DISKS);
  const [system, setSystem] = useState<SystemInfo>(SAMPLE_SYSTEM);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [loading, setLoading] = useState(false);

  // Real implementation would use child_process to run actual system commands
  const refreshData = async () => {
    setLoading(true);
    // Simulate API call - in production would call backend to run system commands
    await new Promise(r => setTimeout(r, 500));
    setLastUpdate(new Date());
    setLoading(false);
  };

  useEffect(() => {
    refreshData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getPortIcon = (process: string) => {
    if (process.includes("node") && process.includes("Social Analytics")) return <Server className="w-4 h-4 text-green-400" />;
    if (process.includes("node") && process.includes("n8n")) return <Zap className="w-4 h-4 text-yellow-400" />;
    if (process.includes("Ollama")) return <Cpu className="w-4 h-4 text-blue-400" />;
    if (process.includes("Claw")) return <Globe className="w-4 h-4 text-purple-400" />;
    if (process.includes("Discord")) return <Globe className="w-4 h-4 text-indigo-400" />;
    return <Terminal className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              System Monitor
            </h1>
            <p className="text-muted-foreground">Real-time system status and network activity</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              Last updated: {lastUpdate.toLocaleTimeString()}
            </div>
            <button 
              onClick={refreshData}
              disabled={loading}
              className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* System Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Server className="w-8 h-8 text-green-400" />
                <div>
                  <p className="text-sm text-muted-foreground">Hostname</p>
                  <p className="font-semibold">{system.hostname}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Cpu className="w-8 h-8 text-blue-400" />
                <div>
                  <p className="text-sm text-muted-foreground">CPU</p>
                  <p className="font-semibold">{system.cpu}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Activity className="w-8 h-8 text-purple-400" />
                <div>
                  <p className="text-sm text-muted-foreground">Memory</p>
                  <p className="font-semibold">{system.memory}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-orange-400" />
                <div>
                  <p className="text-sm text-muted-foreground">Uptime</p>
                  <p className="font-semibold">{system.uptime}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="ports" className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl">
            <TabsTrigger value="ports" className="flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              Ports
            </TabsTrigger>
            <TabsTrigger value="network" className="flex items-center gap-2">
              <Network className="w-4 h-4" />
              Network
            </TabsTrigger>
            <TabsTrigger value="disk" className="flex items-center gap-2">
              <HardDrive className="w-4 h-4" />
              Disk
            </TabsTrigger>
            <TabsTrigger value="services" className="flex items-center gap-2">
              <Server className="w-4 h-4" />
              Services
            </TabsTrigger>
          </TabsList>

          {/* Ports Tab */}
          <TabsContent value="ports">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="w-5 h-5" />
                  Active Ports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {ports.map((port) => (
                    <div 
                      key={port.port}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {getPortIcon(port.process)}
                        <div>
                          <p className="font-medium">{port.port}</p>
                          <p className="text-sm text-muted-foreground">{port.process}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={port.status === "LISTEN" ? "default" : "secondary"}>
                          {port.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{port.type}</span>
                        <span className="text-sm text-muted-foreground max-w-xs truncate">
                          {port.description}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Network Tab */}
          <TabsContent value="network">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="w-5 h-5" />
                  Active Connections
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {connections.map((conn, i) => (
                    <div 
                      key={i}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                    >
                      <div className="flex items-center gap-3">
                        <Wifi className="w-4 h-4 text-green-400" />
                        <div>
                          <p className="font-medium">{conn.local}</p>
                          <p className="text-sm text-muted-foreground">→ {conn.remote}</p>
                        </div>
                      </div>
                      <Badge variant={conn.state === "ESTABLISHED" ? "default" : "secondary"}>
                        {conn.state}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Disk Tab */}
          <TabsContent value="disk">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="w-5 h-5" />
                  Disk Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {disks.filter(d => d.size).map((disk) => (
                    <div key={disk.mounted} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{disk.mounted}</span>
                        <span className="text-sm text-muted-foreground">
                          {disk.used} / {disk.size}
                        </span>
                      </div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all ${
                            disk.percent > 90 ? 'bg-red-500' : 
                            disk.percent > 70 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${disk.percent}%` }}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">{disk.percent}% used</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="w-5 h-5" />
                  Platform Services
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="font-medium">Social Analytics</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Port 3456 • Running</p>
                    <p className="text-xs text-muted-foreground mt-1">Main platform server</p>
                  </div>

                  <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                      <span className="font-medium">Ollama</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Port 49489 • Running</p>
                    <p className="text-xs text-muted-foreground mt-1">Local AI models</p>
                  </div>

                  <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                      <span className="font-medium">OpenClaw MCP</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Port 18789 • Running</p>
                    <p className="text-xs text-muted-foreground mt-1">AI agent tools</p>
                  </div>

                  <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      <span className="font-medium">n8n</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Port 3458 • Running</p>
                    <p className="text-xs text-muted-foreground mt-1">Workflow automation</p>
                  </div>

                  <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-orange-500" />
                      <span className="font-medium">ComfyUI</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Not installed</p>
                    <p className="text-xs text-muted-foreground mt-1">Install for local image generation</p>
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