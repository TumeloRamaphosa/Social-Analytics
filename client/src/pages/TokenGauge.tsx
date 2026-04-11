import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Zap, 
  Brain, 
  Image, 
  Video, 
  Search,
  RefreshCw
} from "lucide-react";
import { useState } from "react";

// Service icons and colors
const serviceConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  claude: { icon: <Brain className="w-4 h-4" />, color: "bg-orange-500", label: "Claude AI" },
  openai: { icon: <Zap className="w-4 h-4" />, color: "bg-green-500", label: "OpenAI" },
  anthropic: { icon: <Brain className="w-4 h-4" />, color: "bg-orange-600", label: "Anthropic" },
  higgsfield: { icon: <Image className="w-4 h-4" />, color: "bg-purple-500", label: "Higgsfield AI" },
  pollinations: { icon: <Image className="w-4 h-4" />, color: "bg-pink-500", label: "Pollinations" },
  firecrawl: { icon: <Search className="w-4 h-4" />, color: "bg-blue-500", label: "Firecrawl" },
};

function formatNumber(num: number): string {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(2) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return num.toLocaleString();
}

function formatCurrency(num: number): string {
  return "$" + num.toFixed(4);
}

export default function TokenGauge() {
  const [refreshing, setRefreshing] = useState(false);
  
  const { data: summary, isLoading: summaryLoading, refetch: refetchSummary } = trpc.token.getSummary.useQuery();
  const { data: projection, isLoading: projectionLoading, refetch: refetchProjection } = trpc.token.getProjection.useQuery();
  const { data: recent, isLoading: recentLoading, refetch: refetchRecent } = trpc.token.getRecent.useQuery({ limit: 20 });

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchSummary(), refetchProjection(), refetchRecent()]);
    setRefreshing(false);
  };

  const overall = summary?.overall || { totalTokens: 0, totalCost: 0, count: 0 };
  const proj = projection || { currentMonth: { cost: 0, tokens: 0 }, lastMonth: { cost: 0, tokens: 0 }, projected: { cost: 0, tokens: 0 } };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Token Gauge
            </h1>
            <p className="text-muted-foreground">Track AI usage and costs across all services</p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Tokens</p>
                  <p className="text-2xl font-bold">{formatNumber(overall.totalTokens)}</p>
                </div>
                <Wallet className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Cost</p>
                  <p className="text-2xl font-bold">{formatCurrency(overall.totalCost)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">API Calls</p>
                  <p className="text-2xl font-bold">{overall.count.toLocaleString()}</p>
                </div>
                <Zap className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Projected Monthly</p>
                  <p className="text-2xl font-bold">{formatCurrency(proj.projected.cost)}</p>
                  {proj.lastMonth.cost > 0 && (
                    <p className={`text-xs ${proj.projected.cost > proj.lastMonth.cost ? 'text-red-400' : 'text-green-400'}`}>
                      {proj.projected.cost > proj.lastMonth.cost ? '+' : ''}
                      {((proj.projected.cost - proj.lastMonth.cost) / proj.lastMonth.cost * 100).toFixed(1)}% vs last month
                    </p>
                  )}
                </div>
                <TrendingUp className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="services">By Service</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Current vs Last Month */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Monthly Comparison</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm text-muted-foreground">This Month</span>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(proj.currentMonth.cost)}</p>
                      <p className="text-xs text-muted-foreground">{formatNumber(proj.currentMonth.tokens)} tokens</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm text-muted-foreground">Last Month</span>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(proj.lastMonth.cost)}</p>
                      <p className="text-xs text-muted-foreground">{formatNumber(proj.lastMonth.tokens)} tokens</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-500/20">
                    <span className="text-sm font-medium">Projected (30 days)</span>
                    <div className="text-right">
                      <p className="font-bold text-purple-400">{formatCurrency(proj.projected.cost)}</p>
                      <p className="text-xs text-muted-foreground">{formatNumber(proj.projected.tokens)} tokens</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Cost Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Cost Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  {summary?.byService && summary.byService.length > 0 ? (
                    <div className="space-y-3">
                      {summary.byService.map((service) => {
                        const config = serviceConfig[service.service] || { icon: <Zap className="w-4 h-4" />, color: "bg-gray-500", label: service.service };
                        const percentage = overall.totalCost > 0 ? (service.totalCost / overall.totalCost * 100) : 0;
                        return (
                          <div key={service.service} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className={`w-3 h-3 rounded-full ${config.color}`} />
                                <span className="text-sm font-medium">{config.label}</span>
                              </div>
                              <div className="text-right">
                                <span className="font-bold">{formatCurrency(service.totalCost)}</span>
                                <span className="text-xs text-muted-foreground ml-2">({formatNumber(service.totalTokens)} tokens)</span>
                              </div>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${config.color}`} 
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Wallet className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No token usage recorded yet</p>
                      <p className="text-sm">Usage will appear as you use AI features</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="services" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {summary?.byService?.map((service) => {
                const config = serviceConfig[service.service] || { icon: <Zap className="w-4 h-4" />, color: "bg-gray-500", label: service.service };
                return (
                  <Card key={service.service} className="border-l-4" style={{ borderLeftColor: config.color.replace('bg-', '').replace('-500', '').replace('-600', '') }}>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`p-2 rounded-lg ${config.color}`}>
                          {config.icon}
                        </div>
                        <div>
                          <p className="font-bold">{config.label}</p>
                          <p className="text-xs text-muted-foreground capitalize">{service.service}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Total Cost</span>
                          <span className="font-bold">{formatCurrency(service.totalCost)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Total Tokens</span>
                          <span className="font-bold">{formatNumber(service.totalTokens)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              {!summary?.byService?.length && (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  <p>No services used yet</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="recent" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent API Calls</CardTitle>
              </CardHeader>
              <CardContent>
                {recent && recent.length > 0 ? (
                  <div className="space-y-3">
                    {recent.map((entry) => {
                      const config = serviceConfig[entry.service] || { icon: <Zap className="w-4 h-4" />, color: "bg-gray-500", label: entry.service };
                      return (
                        <div key={entry.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${config.color}`}>
                              {config.icon}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{entry.operation}</p>
                              <p className="text-xs text-muted-foreground">
                                {entry.model || entry.service} • {new Date(entry.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-sm">{formatCurrency(entry.costUsd)}</p>
                            <p className="text-xs text-muted-foreground">{formatNumber(entry.totalTokens)} tokens</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No recent API calls</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Pricing Info */}
        <Card className="bg-muted/30">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-4">Token Pricing Reference</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="p-3 bg-background rounded-lg">
                <p className="text-muted-foreground">Claude Sonnet</p>
                <p className="font-bold">$3.00 / $15.00</p>
                <p className="text-xs text-muted-foreground">input / 1M output</p>
              </div>
              <div className="p-3 bg-background rounded-lg">
                <p className="text-muted-foreground">Claude Haiku</p>
                <p className="font-bold">$0.80 / $4.00</p>
                <p className="text-xs text-muted-foreground">input / 1M output</p>
              </div>
              <div className="p-3 bg-background rounded-lg">
                <p className="text-muted-foreground">GPT-4o</p>
                <p className="font-bold">$2.50 / $10.00</p>
                <p className="text-xs text-muted-foreground">input / 1M output</p>
              </div>
              <div className="p-3 bg-background rounded-lg">
                <p className="text-muted-foreground">Higgsfield</p>
                <p className="font-bold text-green-500">Free</p>
                <p className="text-xs text-muted-foreground">with API key</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}