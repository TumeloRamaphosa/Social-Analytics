import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart3, TrendingUp, TrendingDown, Target, Brain, Zap,
  DollarSign, Users, Eye, AlertTriangle, ArrowRight, Download,
  RefreshCw, Sparkles, Globe, Clock
} from "lucide-react";
import { useEffect, useRef } from "react";

declare const Chart: any;

const METRICS = [
  { label: "Est. Monthly Reach", value: "12,400", change: "+8%", trend: "up", icon: Eye, color: "text-blue-400" },
  { label: "Avg Engagement Rate", value: "1.8%", change: "SA avg: 3.2%", trend: "down", icon: TrendingUp, color: "text-pink-400" },
  { label: "Monthly Ad Spend", value: "R4,200", change: "unchanged", trend: "neutral", icon: DollarSign, color: "text-yellow-400" },
  { label: "Est. ROAS", value: "1.4x", change: "Target: 4x+", trend: "down", icon: Target, color: "text-red-400" },
  { label: "Post Frequency", value: "3/week", change: "Optimal: 5–7", trend: "neutral", icon: Clock, color: "text-purple-400" },
  { label: "Follower Growth", value: "+2.1%", change: "MoM", trend: "up", icon: Users, color: "text-green-400" },
];

const GAPS = [
  { title: "Boosted Posts vs Campaigns", severity: "critical", impact: "Wasting 60–70% of ad budget on boosted posts instead of structured campaigns. Switch to Traffic + Conversion campaigns immediately.", saving: "R2,520/month" },
  { title: "No Facebook Pixel Installed", severity: "critical", impact: "Cannot track website conversions, cannot build retargeting audiences, cannot optimise for purchases. Install Pixel today.", saving: "Unlocks retargeting" },
  { title: "Posting Frequency Too Low", severity: "high", impact: "3 posts/week vs optimal 5–7. Algorithm deprioritises low-frequency pages. More content = more organic reach = less ad spend needed.", saving: "R800–1,200/month" },
  { title: "No A/B Testing", severity: "high", impact: "Running single ad variants with no testing. Industry standard is 3–5 variants per campaign. Testing improves CTR by 40–60% on average.", saving: "R1,400/month" },
  { title: "Content Mix Imbalanced", severity: "medium", impact: "90% product posts, 0% educational content. Optimal mix: 40% educational, 30% product, 20% UGC, 10% promotional.", saving: "Organic reach +35%" },
  { title: "No Retargeting Funnel", severity: "medium", impact: "No warm audience retargeting. Spending all budget on cold audiences. Retargeting converts 3–5x better at 50% lower cost.", saving: "R1,800/month" },
];

const PLATFORM_COMPARISON = [
  { feature: "AI-generated content from ad insights", us: true, hootsuite: false, hubspot: false },
  { feature: "On-premises data sovereignty (Mac Mini)", us: true, hootsuite: false, hubspot: false },
  { feature: "Multi-platform publishing", us: true, hootsuite: true, hubspot: false },
  { feature: "CRM + social in one platform", us: true, hootsuite: false, hubspot: true },
  { feature: "AI video generation (Higgsfield)", us: true, hootsuite: false, hubspot: false },
  { feature: "Social media scheduling", us: true, hootsuite: true, hubspot: true },
  { feature: "RAG knowledge base + brand brain", us: true, hootsuite: false, hubspot: false },
  { feature: "Custom ML cameras + behaviour analysis", us: true, hootsuite: false, hubspot: false },
  { feature: "Ad spend intelligence & ROAS tracking", us: true, hootsuite: true, hubspot: false },
  { feature: "WhatsApp + Telegram AI chatbots", us: true, hootsuite: false, hubspot: false },
];

const ROADMAP = [
  { phase: "Phase 1 — Now to Month 2", color: "bg-red-500", items: ["Install Facebook Pixel", "Stop boosting posts", "Set up 3 campaign types", "Connect Composio OAuth", "Launch Content Studio publishing"] },
  { phase: "Phase 2 — Month 3 to 6", color: "bg-yellow-500", items: ["A/B test 3 ad variants per campaign", "Build retargeting audiences", "Launch WhatsApp chatbot", "Implement weekly AI content calendar", "Add Instagram Reels via Higgsfield"] },
  { phase: "Phase 3 — Month 7 to 12", color: "bg-green-500", items: ["Full autonomous posting (Naledi agents)", "Predictive spend optimisation", "Multi-client portal rollout", "ML camera behaviour analysis", "Replace full marketing team with agents"] },
];

export default function SocialIntelligenceReport() {
  const spendChartRef = useRef<HTMLCanvasElement>(null);
  const contentMixRef = useRef<HTMLCanvasElement>(null);
  const roasRef = useRef<HTMLCanvasElement>(null);
  const projectionRef = useRef<HTMLCanvasElement>(null);
  const chartsInitialised = useRef(false);

  useEffect(() => {
    if (chartsInitialised.current) return;
    const existing = document.getElementById("chartjs-cdn");
    if (existing) { initCharts(); return; }
    const script = document.createElement("script");
    script.id = "chartjs-cdn";
    script.src = "https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js";
    script.onload = () => { chartsInitialised.current = true; initCharts(); };
    document.head.appendChild(script);
  }, []);

  const initCharts = () => {
    if (typeof Chart === "undefined") return;
    Chart.defaults.color = "#9ca3af";
    Chart.defaults.borderColor = "#374151";

    if (spendChartRef.current) {
      new Chart(spendChartRef.current, {
        type: "doughnut",
        data: {
          labels: ["Boosted Posts (wasted)", "Campaign Ads", "Retargeting (missing)"],
          datasets: [{ data: [70, 30, 0], backgroundColor: ["#ef4444", "#3b82f6", "#10b981"], borderWidth: 0 }],
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom", labels: { font: { size: 11 } } } } },
      });
    }

    if (contentMixRef.current) {
      new Chart(contentMixRef.current, {
        type: "bar",
        data: {
          labels: ["Product", "Educational", "UGC", "Promotional", "Behind Scenes"],
          datasets: [
            { label: "Current %", data: [90, 5, 0, 5, 0], backgroundColor: "#ef4444" },
            { label: "Optimal %", data: [30, 40, 20, 10, 10], backgroundColor: "#10b981" },
          ],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          scales: { y: { beginAtZero: true, max: 100, ticks: { callback: (v: any) => v + "%" } } },
          plugins: { legend: { position: "top" } },
        },
      });
    }

    if (roasRef.current) {
      new Chart(roasRef.current, {
        type: "bar",
        data: {
          labels: ["Current", "Industry Avg", "With Pixel", "With Retargeting", "Full Optimisation"],
          datasets: [{
            label: "ROAS (x)",
            data: [1.4, 2.8, 3.2, 4.1, 6.5],
            backgroundColor: ["#ef4444", "#f59e0b", "#3b82f6", "#8b5cf6", "#10b981"],
          }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          scales: { y: { beginAtZero: true } },
          plugins: { legend: { display: false } },
        },
      });
    }

    if (projectionRef.current) {
      const months = ["M1","M2","M3","M4","M5","M6","M7","M8","M9","M10","M11","M12"];
      new Chart(projectionRef.current, {
        type: "line",
        data: {
          labels: months,
          datasets: [
            { label: "Current (R)", data: [18000,18500,19000,19200,19500,20000,20200,20500,21000,21200,21500,22000], borderColor: "#ef4444", backgroundColor: "rgba(239,68,68,0.1)", tension: 0.4, fill: true },
            { label: "With Nexus (R)", data: [18000,22000,27000,33000,40000,48000,57000,67000,78000,90000,103000,117000], borderColor: "#10b981", backgroundColor: "rgba(16,185,129,0.1)", tension: 0.4, fill: true },
          ],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          scales: { y: { ticks: { callback: (v: any) => "R" + (v/1000).toFixed(0) + "k" } } },
          plugins: { legend: { position: "top" } },
        },
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-cyan-400" />
              Social Intelligence Report
            </h1>
            <p className="text-gray-400 mt-1">Facebook & Instagram performance analysis — StudEx Meat | May 2026</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-700">
              <RefreshCw className="w-4 h-4 mr-1" />Refresh
            </Button>
            <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700 text-white">
              <Download className="w-4 h-4 mr-1" />Export PDF
            </Button>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {METRICS.map((m) => {
            const Icon = m.icon;
            return (
              <Card key={m.label} className="bg-gray-900/50 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={`w-4 h-4 ${m.color}`} />
                    {m.trend === "up" && <TrendingUp className="w-3 h-3 text-green-400" />}
                    {m.trend === "down" && <TrendingDown className="w-3 h-3 text-red-400" />}
                  </div>
                  <p className="text-2xl font-bold text-white">{m.value}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{m.label}</p>
                  <p className={`text-xs mt-1 ${m.trend === "up" ? "text-green-400" : m.trend === "down" ? "text-yellow-400" : "text-gray-500"}`}>{m.change}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-yellow-400" />Ad Spend Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ height: "220px" }}><canvas ref={spendChartRef}></canvas></div>
              <p className="text-red-400 text-xs mt-3 text-center">⚠ 70% wasted on boosted posts — switch to structured campaigns</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-purple-400" />Content Mix — Current vs Optimal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ height: "220px" }}><canvas ref={contentMixRef}></canvas></div>
              <p className="text-yellow-400 text-xs mt-3 text-center">Shift 60% of posts to educational + UGC to reduce ad dependency</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Target className="w-4 h-4 text-green-400" />ROAS — Current vs Achievable
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ height: "220px" }}><canvas ref={roasRef}></canvas></div>
              <p className="text-green-400 text-xs mt-3 text-center">Full optimisation achieves 6.5x ROAS — 4.6x improvement on current 1.4x</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />12-Month Revenue Projection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ height: "220px" }}><canvas ref={projectionRef}></canvas></div>
              <p className="text-cyan-400 text-xs mt-3 text-center">Nexus trajectory: R22k → R117k/month by Month 12</p>
            </CardContent>
          </Card>
        </div>

        {/* Critical Gaps */}
        <div>
          <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />Critical Gaps — What's Costing You Money Right Now
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {GAPS.map((gap) => (
              <Card key={gap.title} className={`border ${gap.severity === "critical" ? "bg-red-950/20 border-red-900/40" : gap.severity === "high" ? "bg-yellow-950/20 border-yellow-900/40" : "bg-gray-900/50 border-gray-700"}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-white font-semibold text-sm">{gap.title}</h3>
                    <Badge className={`text-xs shrink-0 ml-2 ${gap.severity === "critical" ? "bg-red-500/20 text-red-400 border-red-500/30" : gap.severity === "high" ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" : "bg-gray-500/20 text-gray-400 border-gray-500/30"}`}>
                      {gap.severity}
                    </Badge>
                  </div>
                  <p className="text-gray-400 text-xs mb-2">{gap.impact}</p>
                  <p className="text-green-400 text-xs font-medium">💰 Potential saving: {gap.saving}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Platform Comparison */}
        <div>
          <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-cyan-400" />StudEx Nexus vs Hootsuite vs HubSpot
          </h2>
          <Card className="bg-gray-900/50 border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left p-4 text-gray-400 font-medium">Feature</th>
                    <th className="text-center p-4 text-cyan-400 font-bold">StudEx Nexus<br /><span className="text-xs text-cyan-600">Your Platform</span></th>
                    <th className="text-center p-4 text-gray-400 font-medium">Hootsuite<br /><span className="text-xs text-gray-600">$99/mo</span></th>
                    <th className="text-center p-4 text-gray-400 font-medium">HubSpot<br /><span className="text-xs text-gray-600">$800/mo</span></th>
                  </tr>
                </thead>
                <tbody>
                  {PLATFORM_COMPARISON.map((row, i) => (
                    <tr key={i} className={`border-b border-gray-800 ${i % 2 === 0 ? "bg-gray-900/20" : ""}`}>
                      <td className="p-4 text-gray-300 text-xs">{row.feature}</td>
                      <td className="p-4 text-center"><span className="text-green-400 font-bold text-base">✓</span></td>
                      <td className="p-4 text-center"><span className={row.hootsuite ? "text-green-400 font-bold text-base" : "text-red-400 text-base"}>{row.hootsuite ? "✓" : "✗"}</span></td>
                      <td className="p-4 text-center"><span className={row.hubspot ? "text-green-400 font-bold text-base" : "text-red-400 text-base"}>{row.hubspot ? "✓" : "✗"}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-cyan-500/5 border-t border-cyan-500/20">
              <p className="text-cyan-400 text-xs text-center font-medium">StudEx Nexus wins on 8/10 features — at a fraction of HubSpot's cost</p>
            </div>
          </Card>
        </div>

        {/* Roadmap */}
        <div>
          <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />12-Month Roadmap to Full Automation
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ROADMAP.map((phase) => (
              <Card key={phase.phase} className="bg-gray-900/50 border-gray-700">
                <CardHeader className="pb-3">
                  <div className={`w-3 h-3 rounded-full ${phase.color} mb-2`}></div>
                  <CardTitle className="text-white text-sm">{phase.phase}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {phase.items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-gray-400 text-xs">
                        <ArrowRight className="w-3 h-3 text-gray-600 mt-0.5 shrink-0" />{item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* AI Agent Team */}
        <Card className="bg-gradient-to-r from-purple-950/30 to-cyan-950/30 border-purple-900/40">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Brain className="w-8 h-8 text-purple-400 shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-white font-bold text-lg mb-2">The Naledi AI Agent Team — Replace Your Marketing Department</h3>
                <p className="text-gray-400 text-sm mb-4">A full marketing team costs R124,000–R185,000/month. The Naledi system runs 9 specialist AI agents 24/7 at a fraction of that cost.</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { name: "Naledi Prime", role: "Strategy Director", task: "Analyses all data, sets weekly strategy" },
                    { name: "ContentBot", role: "Content Writer", task: "Generates posts, captions, scripts" },
                    { name: "AdOptimiser", role: "Media Buyer", task: "Manages campaigns, adjusts bids" },
                    { name: "AudienceAI", role: "Research Analyst", task: "Monitors trends, competitor moves" },
                    { name: "EngageBot", role: "Community Manager", task: "Responds to comments, DMs" },
                    { name: "ReportBot", role: "Analytics Manager", task: "Weekly reports, insights, alerts" },
                  ].map((agent) => (
                    <div key={agent.name} className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
                      <p className="text-purple-400 font-semibold text-xs">{agent.name}</p>
                      <p className="text-gray-400 text-xs">{agent.role}</p>
                      <p className="text-gray-600 text-xs mt-1">{agent.task}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="bg-gradient-to-r from-cyan-950/40 to-blue-950/40 border-cyan-900/40">
          <CardContent className="p-6 text-center">
            <Sparkles className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
            <h3 className="text-white font-bold text-xl mb-2">Ready to Activate Full Intelligence?</h3>
            <p className="text-gray-400 text-sm mb-4 max-w-xl mx-auto">
              Connect your Facebook token via Composio to replace all benchmark data with your real numbers — and let the Naledi agents start optimising your campaigns automatically.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Button className="bg-cyan-600 hover:bg-cyan-700 text-white" onClick={() => window.location.href = "/composio"}>
                <Zap className="w-4 h-4 mr-2" />Connect Facebook Now
              </Button>
              <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700" onClick={() => window.location.href = "/content"}>
                <Sparkles className="w-4 h-4 mr-2" />Open Content Studio
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
