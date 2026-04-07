import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, CheckCircle2, XCircle, RefreshCw, ShoppingBag, Facebook, BarChart3, MessageCircle, HardDrive, Zap } from "lucide-react";

export default function Integrations() {
  const [shopifyDomain, setShopifyDomain] = useState("");
  const [shopifyToken, setShopifyToken] = useState("");
  const [metaToken, setMetaToken] = useState("");
  const [metaPageId, setMetaPageId] = useState("");
  const [metaBusinessId, setMetaBusinessId] = useState("");
  const [metaAdAccountId, setMetaAdAccountId] = useState("");

  const { data: status, refetch: refetchStatus } = trpc.integrations.getStatus.useQuery();
  const { data: shopifyStats, refetch: refetchStats } = trpc.integrations.getShopifyStats.useQuery();

  const connectShopify = trpc.integrations.connectShopify.useMutation({
    onSuccess: (data) => { toast.success(data.message); refetchStatus(); refetchStats(); },
    onError: (err) => toast.error(err.message),
  });

  const connectMeta = trpc.integrations.connectMeta.useMutation({
    onSuccess: (data) => { toast.success(data.message); refetchStatus(); },
    onError: (err) => toast.error(err.message),
  });

  const syncOrders = trpc.integrations.syncShopifyOrders.useMutation({
    onSuccess: (data) => { toast.success(data.message); refetchStats(); },
    onError: (err) => toast.error(err.message),
  });

  const syncProducts = trpc.integrations.syncShopifyProducts.useMutation({
    onSuccess: (data) => { toast.success(`Synced ${data.synced} products`); },
    onError: (err) => toast.error(err.message),
  });

  const generateReport = trpc.integrations.generateSpendReport.useMutation({
    onSuccess: (data) => {
      toast.success("Spend optimisation report generated!");
      // Open in new tab or show in modal
      const blob = new Blob([String(data.report)], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    },
    onError: (err) => toast.error(err.message),
  });

  const StatusBadge = ({ connected }: { connected: boolean }) => (
    <Badge className={connected
      ? "bg-green-500/20 text-green-300 border-green-500/30"
      : "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }>
      {connected ? <><CheckCircle2 className="w-3 h-3 mr-1" />Connected</> : <><XCircle className="w-3 h-3 mr-1" />Not Connected</>}
    </Badge>
  );

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Zap className="w-8 h-8 text-yellow-400" />
            Integrations
          </h1>
          <p className="text-gray-400 mt-1">Connect your business platforms for unified analytics and automation</p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Shopify", icon: <ShoppingBag className="w-5 h-5" />, connected: !!status?.shopify, color: "text-green-400" },
            { label: "Facebook / Meta", icon: <Facebook className="w-5 h-5" />, connected: !!status?.facebook, color: "text-blue-400" },
            { label: "Google Ads", icon: <BarChart3 className="w-5 h-5" />, connected: !!status?.googleAds, color: "text-yellow-400" },
            { label: "WhatsApp", icon: <MessageCircle className="w-5 h-5" />, connected: !!status?.whatsapp, color: "text-green-400" },
          ].map((item) => (
            <Card key={item.label} className="bg-gray-900/50 border-gray-700">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`${item.color} opacity-80`}>{item.icon}</div>
                <div>
                  <p className="text-white text-sm font-medium">{item.label}</p>
                  <StatusBadge connected={item.connected} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Shopify Integration */}
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-6 h-6 text-green-400" />
                <div>
                  <CardTitle className="text-white">Shopify Store</CardTitle>
                  <CardDescription className="text-gray-400">Sync orders, products, and revenue data</CardDescription>
                </div>
              </div>
              <StatusBadge connected={!!status?.shopify} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {status?.shopify ? (
              <div className="space-y-4">
                {/* Stats */}
                {shopifyStats && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: "Total Revenue", value: `R${shopifyStats.totalRevenue.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}` },
                      { label: "Total Orders", value: shopifyStats.totalOrders.toString() },
                      { label: "Avg Order Value", value: `R${shopifyStats.avgOrderValue.toFixed(2)}` },
                      { label: "Conversion Rate", value: `${shopifyStats.conversionRate.toFixed(1)}%` },
                    ].map((stat) => (
                      <div key={stat.label} className="bg-gray-800/50 rounded-lg p-3">
                        <p className="text-gray-400 text-xs">{stat.label}</p>
                        <p className="text-white font-bold text-lg">{stat.value}</p>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-3">
                  <Button onClick={() => syncOrders.mutate()} disabled={syncOrders.isPending} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                    {syncOrders.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                    Sync Orders
                  </Button>
                  <Button onClick={() => syncProducts.mutate()} disabled={syncProducts.isPending} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                    {syncProducts.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                    Sync Products
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Shopify Store Domain</Label>
                  <Input
                    value={shopifyDomain}
                    onChange={(e) => setShopifyDomain(e.target.value)}
                    placeholder="your-store.myshopify.com"
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Admin API Access Token</Label>
                  <Input
                    type="password"
                    value={shopifyToken}
                    onChange={(e) => setShopifyToken(e.target.value)}
                    placeholder="shpat_..."
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <Button
                    onClick={() => connectShopify.mutate({ shopifyDomain, shopifyAccessToken: shopifyToken })}
                    disabled={connectShopify.isPending || !shopifyDomain || !shopifyToken}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {connectShopify.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ShoppingBag className="w-4 h-4 mr-2" />}
                    Connect Shopify
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Facebook / Meta Integration */}
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Facebook className="w-6 h-6 text-blue-400" />
                <div>
                  <CardTitle className="text-white">Facebook / Meta</CardTitle>
                  <CardDescription className="text-gray-400">Connect your Facebook Page, Instagram, and Ad Account</CardDescription>
                </div>
              </div>
              <StatusBadge connected={!!status?.facebook} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {status?.facebook ? (
              <div className="space-y-3">
                <div className="bg-gray-800/50 rounded-lg p-4 space-y-2">
                  <p className="text-green-400 text-sm font-medium">✓ Meta account connected</p>
                  {status.facebook.metaPageId && <p className="text-gray-400 text-xs">Page ID: {status.facebook.metaPageId}</p>}
                  {status.facebook.metaAdAccountId && <p className="text-gray-400 text-xs">Ad Account: {status.facebook.metaAdAccountId}</p>}
                  {status.facebook.lastSyncedAt && <p className="text-gray-400 text-xs">Last synced: {new Date(status.facebook.lastSyncedAt).toLocaleString()}</p>}
                </div>
                <Button
                  onClick={() => generateReport.mutate({ totalSpend: 715469.87, followers: 85208, platform: "facebook" })}
                  disabled={generateReport.isPending}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  {generateReport.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <BarChart3 className="w-4 h-4 mr-2" />}
                  Generate Spend Optimisation Report
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Meta Access Token</Label>
                  <Input
                    type="password"
                    value={metaToken}
                    onChange={(e) => setMetaToken(e.target.value)}
                    placeholder="EAA..."
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Facebook Page ID</Label>
                  <Input
                    value={metaPageId}
                    onChange={(e) => setMetaPageId(e.target.value)}
                    placeholder="108934711902801"
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Business ID (optional)</Label>
                  <Input
                    value={metaBusinessId}
                    onChange={(e) => setMetaBusinessId(e.target.value)}
                    placeholder="599570915061463"
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Ad Account ID (optional)</Label>
                  <Input
                    value={metaAdAccountId}
                    onChange={(e) => setMetaAdAccountId(e.target.value)}
                    placeholder="act_1069308327357613"
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <Button
                    onClick={() => connectMeta.mutate({ metaAccessToken: metaToken, metaPageId, metaBusinessId, metaAdAccountId })}
                    disabled={connectMeta.isPending || !metaToken}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {connectMeta.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Facebook className="w-4 h-4 mr-2" />}
                    Connect Facebook
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Google Ads - Coming Soon */}
        <Card className="bg-gray-900/50 border-gray-700 opacity-75">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-yellow-400" />
                <div>
                  <CardTitle className="text-white">Google Ads</CardTitle>
                  <CardDescription className="text-gray-400">Connect your Google Ads account for campaign analytics</CardDescription>
                </div>
              </div>
              <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">Coming Soon</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 text-sm">Google Ads OAuth integration is in development. You will be able to sync campaigns, ad sets, spend, ROAS, and conversion data directly into your dashboard.</p>
          </CardContent>
        </Card>

        {/* WhatsApp - Coming Soon */}
        <Card className="bg-gray-900/50 border-gray-700 opacity-75">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageCircle className="w-6 h-6 text-green-400" />
                <div>
                  <CardTitle className="text-white">WhatsApp Business API</CardTitle>
                  <CardDescription className="text-gray-400">Send reports and content via WhatsApp</CardDescription>
                </div>
              </div>
              <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">Coming Soon</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 text-sm">WhatsApp Cloud API integration coming soon. Send automated reports, content previews, and performance alerts directly to your WhatsApp.</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
