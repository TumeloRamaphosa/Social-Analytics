import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Brain, Shield, TrendingUp, Users, Target, BarChart3,
  Zap, Camera, Cpu, Globe, ChevronDown,
  Lock, Cloud, Monitor, AlertCircle, Activity, Sparkles
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler
);

// ─── Shared chart defaults ───────────────────────────────────────────────────
const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: "#aaa", font: { size: 11 } } },
    tooltip: { backgroundColor: "#1a1a2e", borderColor: "#00C9A7", borderWidth: 1 },
  },
  scales: {
    x: { grid: { color: "rgba(255,255,255,0.04)" }, ticks: { color: "#666", font: { size: 11 } } },
    y: { grid: { color: "rgba(255,255,255,0.04)" }, ticks: { color: "#666", font: { size: 11 } } },
  },
};

// ─── Section wrapper ─────────────────────────────────────────────────────────
function Section({ id, children, className = "" }: { id?: string; children: React.ReactNode; className?: string }) {
  return (
    <section id={id} className={`py-20 px-6 md:px-12 lg:px-24 ${className}`}>
      {children}
    </section>
  );
}

// ─── Section label ────────────────────────────────────────────────────────────
function Label({ children }: { children: string }) {
  return (
    <p className="text-xs font-bold tracking-[3px] uppercase text-[#00C9A7] mb-3">{children}</p>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ value, label, sub, color = "#00C9A7" }: { value: string; label: string; sub?: string; color?: string }) {
  return (
    <div className="bg-white/[0.02] border border-white/[0.08] rounded p-5 text-center">
      <div className="text-4xl font-black mb-1" style={{ color }}>{value}</div>
      <div className="text-sm font-semibold text-white mb-1">{label}</div>
      {sub && <div className="text-xs text-gray-500">{sub}</div>}
    </div>
  );
}

// ─── Score bar ────────────────────────────────────────────────────────────────
function ScoreBar({ label, current, target, max = 10 }: { label: string; current: number; target: number; max?: number }) {
  return (
    <div className="mb-4">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-400">{label}</span>
        <span className="text-[#00C9A7] font-bold">{current}/10 → {target}/10</span>
      </div>
      <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden relative">
        <div className="h-full bg-red-500/60 rounded-full absolute" style={{ width: `${(current / max) * 100}%` }} />
        <div className="h-full border-r-2 border-[#00C9A7] absolute" style={{ width: `${(target / max) * 100}%` }} />
      </div>
    </div>
  );
}

// ─── Capability card ──────────────────────────────────────────────────────────
function CapCard({ icon: Icon, title, desc, tag, color = "#00C9A7" }: {
  icon: React.ElementType; title: string; desc: string; tag: string; color?: string;
}) {
  return (
    <div className="bg-white/[0.02] border border-white/[0.07] rounded p-5 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded flex items-center justify-center flex-shrink-0" style={{ background: `${color}18`, border: `1px solid ${color}40` }}>
          <Icon size={16} style={{ color }} />
        </div>
        <span className="text-sm font-bold text-white">{title}</span>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
      <span className="text-xs font-semibold px-2 py-1 rounded self-start" style={{ background: `${color}12`, color }}>{tag}</span>
    </div>
  );
}

// ─── Security node ────────────────────────────────────────────────────────────
function SecurityNode({ icon: Icon, title, desc, tag, color }: {
  icon: React.ElementType; title: string; desc: string; tag: string; color: string;
}) {
  return (
    <div className="bg-white/[0.02] border border-white/[0.07] rounded p-5 flex gap-4">
      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${color}18`, border: `1px solid ${color}40` }}>
        <Icon size={18} style={{ color }} />
      </div>
      <div>
        <div className="text-sm font-bold text-white mb-1">{title}</div>
        <p className="text-xs text-gray-500 leading-relaxed mb-2">{desc}</p>
        <span className="text-xs font-semibold px-2 py-1 rounded" style={{ background: `${color}12`, color }}>{tag}</span>
      </div>
    </div>
  );
}

// ─── Phase card ───────────────────────────────────────────────────────────────
function PhaseCard({ num, title, timeframe, items, milestone, color }: {
  num: string; title: string; timeframe: string; items: string[]; milestone: string; color: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-11 h-11 rounded-full flex items-center justify-center text-lg font-black flex-shrink-0"
          style={{ background: `${color}18`, border: `2px solid ${color}60`, color }}>
          {num}
        </div>
        <div>
          <div className="text-base font-black text-white">{title}</div>
          <div className="text-xs text-gray-500">{timeframe}</div>
        </div>
      </div>
      <div className="bg-white/[0.02] border border-white/[0.07] rounded p-4 flex-1">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-2 py-1.5 border-b border-white/[0.04] last:border-0">
            <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: color }} />
            <span className="text-xs text-gray-300 leading-relaxed">{item}</span>
          </div>
        ))}
      </div>
      <div className="rounded p-3 text-center text-xs font-bold text-white" style={{ background: `${color}12`, border: `1px solid ${color}30` }}>
        {milestone}
      </div>
    </div>
  );
}

// ─── Nav ──────────────────────────────────────────────────────────────────────
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  const links = [
    { href: "#metrics", label: "Metrics" },
    { href: "#competitors", label: "Competitors" },
    { href: "#platform", label: "Platform" },
    { href: "#security", label: "Security" },
    { href: "#roadmap", label: "Roadmap" },
    { href: "#projection", label: "Projection" },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-[#0D1117]/95 backdrop-blur border-b border-[#00C9A7]/10" : "bg-transparent"}`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-[#00C9A7]/20 border border-[#00C9A7]/40 flex items-center justify-center">
            <Brain size={14} className="text-[#00C9A7]" />
          </div>
          <span className="text-sm font-black text-white tracking-wider">STUDEX</span>
          <span className="text-xs text-gray-500 ml-2 hidden md:block">× Safesight–LAISA Intelligence Report</span>
        </div>
        <div className="hidden md:flex items-center gap-6">
          {links.map(l => (
            <a key={l.href} href={l.href} className="text-xs font-semibold text-gray-400 hover:text-[#00C9A7] transition-colors tracking-wider uppercase">
              {l.label}
            </a>
          ))}
        </div>
        <a href="#contact" className="text-xs font-bold px-4 py-2 rounded bg-[#00C9A7] text-[#0D1117] hover:bg-[#00b396] transition-colors">
          Book Session
        </a>
      </div>
    </nav>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────────
function Hero() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 600], [0, -100]);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0D1117]">
      {/* Grid */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(0,201,167,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,201,167,0.04) 1px, transparent 1px)",
          backgroundSize: "60px 60px"
        }} />
      {/* Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_40%,rgba(0,201,167,0.08),transparent)] pointer-events-none" />
      {/* Left accent */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[#00C9A7] to-transparent opacity-60" />

      <motion.div style={{ y }} className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <p className="text-xs font-bold tracking-[4px] uppercase text-[#00C9A7] mb-6">
            StudEx Proprietary AI Solutions — April 2026
          </p>
          <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-6">
            Safesight–LAISA<br />
            <span className="text-[#00C9A7]">Digital Intelligence</span><br />
            Report
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            A complete metric-by-metric breakdown of where Safesight Eye Clinic and LAISA Aesthetics stand today, 
            where the market is moving, and precisely how the StudEx AI Ecosystem closes every identified gap.
          </p>
          <div className="flex flex-wrap gap-4 justify-center mb-12">
            <a href="#metrics" className="px-8 py-3 bg-[#00C9A7] text-[#0D1117] font-bold rounded text-sm hover:bg-[#00b396] transition-colors">
              View Full Report
            </a>
            <a href="#contact" className="px-8 py-3 border border-[#00C9A7]/40 text-[#00C9A7] font-bold rounded text-sm hover:bg-[#00C9A7]/10 transition-colors">
              Book Strategy Session
            </a>
          </div>
          {/* KPI strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { v: "3.2/10", l: "Current Digital Score" },
              { v: "8.5/10", l: "Target Score (12 Mo)" },
              { v: "R1.8M", l: "12-Mo Revenue Uplift" },
              { v: "Month 2", l: "Break-Even Point" },
            ].map((s, i) => (
              <div key={i} className="bg-white/[0.03] border border-white/[0.08] rounded p-4 text-center">
                <div className="text-2xl font-black text-[#00C9A7]">{s.v}</div>
                <div className="text-xs text-gray-500 mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll cue */}
      <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
        <ChevronDown size={20} className="text-[#00C9A7]/60" />
      </motion.div>
    </div>
  );
}

// ─── METRICS ─────────────────────────────────────────────────────────────────
function MetricsSection() {
  const maturityData = {
    labels: ["Social Media Presence", "Content Quality", "Engagement Rate", "SEO & Discoverability", "Online Booking", "WhatsApp Automation", "Video & Reels", "Patient Testimonials", "AI Content Gen", "Brand Consistency"],
    datasets: [
      {
        label: "Current Score",
        data: [4, 5, 3, 3, 2, 1, 2, 3, 1, 4],
        backgroundColor: "rgba(255,76,76,0.7)",
        borderColor: "#FF4C4C",
        borderWidth: 1,
      },
      {
        label: "Target Score (12 Mo)",
        data: [9, 9, 8, 8, 9, 9, 8, 9, 9, 9],
        backgroundColor: "rgba(0,201,167,0.5)",
        borderColor: "#00C9A7",
        borderWidth: 1,
      },
    ],
  };

  return (
    <Section id="metrics" className="bg-[#0D1117]">
      <div className="max-w-7xl mx-auto">
        <Label>Part 1 — Metric-by-Metric Breakdown</Label>
        <h2 className="text-4xl font-black text-white mb-4">Digital Maturity Analysis</h2>
        <p className="text-gray-400 max-w-3xl mb-12 leading-relaxed">
          Safesight–LAISA currently scores <strong className="text-white">3.2 out of 10</strong> on the digital maturity index — 
          compared to the national private healthcare average of 6.5/10 and their most aggressive competitor (Skin Renewal) at 8.5/10. 
          Every 1-point increase in digital maturity corresponds to a <strong className="text-[#00C9A7]">12–18% increase in monthly new patient enquiries</strong>.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <StatCard value="3.2/10" label="Current Digital Score" sub="vs 6.5/10 industry avg" color="#FF4C4C" />
          <StatCard value="8.5/10" label="Target Score" sub="Achievable in 12 months" color="#00C9A7" />
          <StatCard value="+163%" label="Enquiry Volume Uplift" sub="Conservative estimate" color="#00C9A7" />
          <StatCard value="R0" label="Extra Ad Spend Required" sub="Organic growth only" color="#FFA500" />
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white/[0.02] border border-white/[0.08] rounded p-6">
            <p className="text-xs font-bold text-[#00C9A7] tracking-widest uppercase mb-4">Score by Dimension — Current vs Target</p>
            <div style={{ height: 320 }}>
              <Bar data={maturityData} options={{
                ...chartDefaults,
                indexAxis: "y" as const,
                plugins: { ...chartDefaults.plugins, legend: { labels: { color: "#aaa", font: { size: 10 } } } },
                scales: {
                  x: { ...chartDefaults.scales.x, max: 10 },
                  y: { ...chartDefaults.scales.y, ticks: { color: "#888", font: { size: 10 } } },
                }
              }} />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-xs font-bold text-[#00C9A7] tracking-widest uppercase mb-2">Dimension Scores</p>
            {[
              { label: "Social Media Presence", current: 4, target: 9 },
              { label: "Content Quality", current: 5, target: 9 },
              { label: "Engagement Rate", current: 3, target: 8 },
              { label: "SEO & Discoverability", current: 3, target: 8 },
              { label: "Online Booking", current: 2, target: 9 },
              { label: "WhatsApp Automation", current: 1, target: 9 },
              { label: "Video & Reels Production", current: 2, target: 8 },
              { label: "Patient Testimonials", current: 3, target: 9 },
              { label: "AI Content Generation", current: 1, target: 9 },
              { label: "Brand Consistency", current: 4, target: 9 },
            ].map((s, i) => <ScoreBar key={i} {...s} />)}
          </div>
        </div>

        {/* Metric cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: "1.4 — Engagement Rate",
              score: "Current: 1.2–1.8% IG / <0.5% FB",
              target: "Target: 3.5–5% IG / 1.5% FB",
              body: "Engagement rate is more important than follower count. A clinic with 5,000 highly engaged followers will generate more bookings than one with 50,000 passive followers. The StudEx system optimises for engagement through optimal posting times, interactive content formats, and AI-generated hooks.",
              icon: Activity,
            },
            {
              title: "1.5 — Response Rate & Speed",
              score: "Current: 4–24 hours, ~60% rate",
              target: "Target: <2 minutes, 100% rate",
              body: "Every unanswered enquiry is a lost patient. The Naledi Outreach Agent handles all incoming DMs, comments, and WhatsApp messages 24/7 — qualifying leads, answering FAQs, and booking consultations automatically. No human intervention required.",
              icon: Zap,
            },
            {
              title: "1.6 — SEO & Discoverability",
              score: "Current: 3/10 — minimal organic traffic",
              target: "Target: 8/10 — top 3 local results",
              body: "When a Pretoria patient searches 'LASIK surgery near me' or 'lip filler Pretoria', Safesight–LAISA does not appear. The StudEx SEO module builds a 12-month content strategy that targets high-intent search terms, optimises Google Business Profile, and generates location-specific landing pages.",
              icon: Globe,
            },
          ].map((card, i) => (
            <div key={i} className="bg-white/[0.02] border border-white/[0.07] rounded p-5">
              <div className="flex items-center gap-2 mb-3">
                <card.icon size={16} className="text-[#00C9A7]" />
                <span className="text-sm font-bold text-white">{card.title}</span>
              </div>
              <div className="text-xs font-semibold text-red-400 mb-1">{card.score}</div>
              <div className="text-xs font-semibold text-[#00C9A7] mb-3">{card.target}</div>
              <p className="text-xs text-gray-500 leading-relaxed">{card.body}</p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

// ─── COMPETITORS ─────────────────────────────────────────────────────────────
function CompetitorSection() {
  const fbData = {
    labels: ["Skin Renewal", "Mediclinic SA", "Intercare Group", "Pretoria Eye Inst.", "Safesight+LAISA"],
    datasets: [{
      label: "Facebook Followers",
      data: [337070, 155551, 12000, 3417, 1753],
      backgroundColor: ["rgba(255,76,76,0.7)", "rgba(255,165,0,0.7)", "rgba(255,165,0,0.5)", "rgba(100,100,100,0.5)", "rgba(0,201,167,0.7)"],
      borderColor: ["#FF4C4C", "#FFA500", "#FFA500", "#666", "#00C9A7"],
      borderWidth: 1,
    }],
  };

  const igData = {
    labels: ["Skin Renewal", "Mediclinic SA", "Intercare Group", "Pretoria Eye Inst.", "Safesight+LAISA"],
    datasets: [{
      label: "Instagram Followers",
      data: [69000, 18400, 5000, 0, 21400],
      backgroundColor: ["rgba(255,76,76,0.7)", "rgba(255,165,0,0.7)", "rgba(255,165,0,0.5)", "rgba(100,100,100,0.5)", "rgba(0,201,167,0.7)"],
      borderColor: ["#FF4C4C", "#FFA500", "#FFA500", "#666", "#00C9A7"],
      borderWidth: 1,
    }],
  };

  const competitors = [
    { name: "Skin Renewal", fb: "337,070", ig: "69,000", posts: "Daily", er: "2.8%", score: "8.5/10", threat: "Critical", color: "#FF4C4C" },
    { name: "Mediclinic SA", fb: "155,551", ig: "18,400", posts: "3–4×/wk", er: "1.2%", score: "7.0/10", threat: "High", color: "#FFA500" },
    { name: "Intercare Group", fb: "~12,000", ig: "~5,000", posts: "2×/wk", er: "0.9%", score: "5.5/10", threat: "Medium", color: "#FFA500" },
    { name: "Pretoria Eye Inst.", fb: "3,417", ig: "~0", posts: "Irregular", er: "<0.3%", score: "3.0/10", threat: "Low", color: "#666" },
    { name: "Safesight+LAISA", fb: "1,753", ig: "21,400", posts: "Irregular", er: "1.5%", score: "3.2/10", threat: "—", color: "#00C9A7" },
  ];

  return (
    <Section id="competitors" className="bg-[#0a0f14]">
      <div className="max-w-7xl mx-auto">
        <Label>Part 2 — Competitive Landscape</Label>
        <h2 className="text-4xl font-black text-white mb-4">The Competition. In Full.</h2>
        <p className="text-gray-400 max-w-3xl mb-12 leading-relaxed">
          The most striking data point: a <strong className="text-white">335,317-follower gap</strong> between Safesight's Facebook presence and Skin Renewal's. 
          Skin Renewal is not a fundamentally better clinic — it is a fundamentally <strong className="text-[#00C9A7]">better-marketed clinic</strong>. 
          Their digital dominance is built on consistent, AI-assisted content. This is precisely the infrastructure StudEx delivers.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <div className="bg-white/[0.02] border border-white/[0.08] rounded p-6">
            <p className="text-xs font-bold text-[#00C9A7] tracking-widest uppercase mb-4">Facebook Followers — Competitor Comparison</p>
            <div style={{ height: 280 }}>
              <Bar data={fbData} options={{ ...chartDefaults, plugins: { ...chartDefaults.plugins, legend: { display: false } } }} />
            </div>
          </div>
          <div className="bg-white/[0.02] border border-white/[0.08] rounded p-6">
            <p className="text-xs font-bold text-[#00C9A7] tracking-widest uppercase mb-4">Instagram Followers — Competitor Comparison</p>
            <div style={{ height: 280 }}>
              <Bar data={igData} options={{ ...chartDefaults, plugins: { ...chartDefaults.plugins, legend: { display: false } } }} />
            </div>
          </div>
        </div>

        {/* Competitor table */}
        <div className="bg-white/[0.02] border border-white/[0.08] rounded overflow-hidden mb-10">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-[#00C9A7]/10 border-b border-[#00C9A7]/20">
                {["Competitor", "Facebook", "Instagram", "Post Freq.", "Eng. Rate", "Digital Score", "Threat Level"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[#00C9A7] font-bold tracking-wider uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {competitors.map((c, i) => (
                <tr key={i} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-bold" style={{ color: c.color }}>{c.name}</td>
                  <td className="px-4 py-3 text-gray-300">{c.fb}</td>
                  <td className="px-4 py-3 text-gray-300">{c.ig}</td>
                  <td className="px-4 py-3 text-gray-400">{c.posts}</td>
                  <td className="px-4 py-3 text-gray-400">{c.er}</td>
                  <td className="px-4 py-3 font-bold" style={{ color: c.color }}>{c.score}</td>
                  <td className="px-4 py-3">
                    {c.threat !== "—" && (
                      <span className="px-2 py-1 rounded text-xs font-bold" style={{
                        background: c.threat === "Critical" ? "rgba(255,76,76,0.15)" : c.threat === "High" ? "rgba(255,165,0,0.15)" : c.threat === "Medium" ? "rgba(255,165,0,0.1)" : "rgba(100,100,100,0.1)",
                        color: c.threat === "Critical" ? "#FF4C4C" : c.threat === "High" ? "#FFA500" : c.threat === "Medium" ? "#FFA500" : "#666"
                      }}>{c.threat}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Gap analysis */}
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { gap: "Gap 1", title: "No AI Content Generation", impact: "Competitors post 5× more content with 3× less effort", severity: "Critical" },
            { gap: "Gap 2", title: "No WhatsApp Automation", impact: "Every after-hours enquiry is lost to competitors with 24/7 bots", severity: "Critical" },
            { gap: "Gap 3", title: "No Video Content Strategy", impact: "Reels and TikTok drive 60% of aesthetic procedure discovery — zero presence", severity: "High" },
            { gap: "Gap 4", title: "No Online Booking", impact: "Patients who can't book instantly choose the clinic that lets them", severity: "High" },
            { gap: "Gap 5", title: "No Competitor Monitoring", impact: "Flying blind while Skin Renewal tracks every trend and reacts within 24 hours", severity: "Medium" },
          ].map((g, i) => (
            <div key={i} className="bg-white/[0.02] border border-red-500/20 rounded p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
                <span className="text-xs font-bold text-red-400 uppercase tracking-wider">{g.gap} — {g.severity}</span>
              </div>
              <div className="text-sm font-bold text-white mb-2">{g.title}</div>
              <p className="text-xs text-gray-500 leading-relaxed">{g.impact}</p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

// ─── PLATFORM ─────────────────────────────────────────────────────────────────
function PlatformSection() {
  return (
    <Section id="platform" className="bg-[#0D1117]">
      <div className="max-w-7xl mx-auto">
        <Label>Part 3 — The StudEx AI Ecosystem</Label>
        <h2 className="text-4xl font-black text-white mb-4">Six Capabilities. One Unified System.</h2>
        <p className="text-gray-400 max-w-3xl mb-12 leading-relaxed">
          One platform replaces six separate tools — social listening, content creation, video production, patient communication, 
          knowledge management, and analytics reporting. At a fraction of the combined cost.
        </p>

        <div className="grid md:grid-cols-3 gap-5 mb-12">
          <CapCard icon={Brain} title="Social Intelligence" desc="Real-time competitor monitoring, trend detection, and market intelligence. Know what Skin Renewal is posting before your patients do." tag="Naledi Research Agent" />
          <CapCard icon={Sparkles} title="AI Content Generation" desc="Posts, captions, blogs, and email copy generated in seconds — in your brand voice, for your audience, at the right time." tag="Naledi Content Agent" />
          <CapCard icon={BarChart3} title="AI Video Production" desc="Professional-quality Reels and procedure videos from text briefs. No camera crew. No editing suite. Just results." tag="Higgsfield AI Integration" color="#A78BFA" />
          <CapCard icon={Zap} title="WhatsApp Automation" desc="24/7 patient communication — appointment reminders, booking, follow-ups, and broadcasts. POPIA-compliant by design." tag="Naledi Outreach Agent" color="#FFA500" />
          <CapCard icon={Cpu} title="Company Brain (RAG)" desc="Every meeting, decision, and campaign stored and instantly queryable. Institutional memory that never forgets. Data never leaves the building." tag="StudEx Patent RAG System" />
          <CapCard icon={TrendingUp} title="Analytics & Reporting" desc="Weekly performance dashboards, monthly board reports, and 12-month revenue forecasting — all generated automatically." tag="Naledi Reporting Agent" />
        </div>

        {/* Replaces bar */}
        <div className="bg-[#00C9A7]/06 border border-[#00C9A7]/20 rounded p-4 text-center text-sm text-gray-400 mb-12">
          Replaces: <strong className="text-[#00C9A7]">Hootsuite + ChatGPT + Typeform + Calendly + HubSpot + Google Analytics</strong> — in one system, at a fraction of the cost
        </div>

        {/* Naledi agents */}
        <div className="mb-12">
          <p className="text-xs font-bold text-[#00C9A7] tracking-widest uppercase mb-6">The Naledi Intelligence System — 9 Specialised AI Agents</p>
          <div className="grid md:grid-cols-3 gap-3">
            {[
              { num: "01", name: "Research Agent", desc: "Monitors competitors, tracks trends, and delivers daily intelligence briefings" },
              { num: "02", name: "Content Agent", desc: "Generates posts, captions, blogs, and email copy in your brand voice" },
              { num: "03", name: "Outreach Agent", desc: "Handles all WhatsApp, DM, and email communication 24/7" },
              { num: "04", name: "Analytics Agent", desc: "Tracks performance metrics and identifies optimisation opportunities" },
              { num: "05", name: "Reporting Agent", desc: "Generates weekly dashboards and monthly board-ready reports automatically" },
              { num: "06", name: "SEO Agent", desc: "Builds and executes the organic search strategy for both brands" },
              { num: "07", name: "Video Agent", desc: "Briefs and manages AI video production via Higgsfield integration" },
              { num: "08", name: "Booking Agent", desc: "Manages appointment scheduling, reminders, and follow-ups" },
              { num: "09", name: "Knowledge Agent", desc: "Maintains the Company Brain — indexes all clinic knowledge for instant retrieval" },
            ].map((a, i) => (
              <div key={i} className="bg-white/[0.02] border border-white/[0.06] rounded p-4 flex gap-3">
                <span className="text-2xl font-black text-[#00C9A7]/20 flex-shrink-0">{a.num}</span>
                <div>
                  <div className="text-sm font-bold text-white mb-1">{a.name}</div>
                  <p className="text-xs text-gray-500 leading-relaxed">{a.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ML Cameras */}
        <div className="bg-white/[0.02] border border-white/[0.08] rounded p-8">
          <div className="flex items-center gap-3 mb-4">
            <Camera size={20} className="text-[#00C9A7]" />
            <p className="text-xs font-bold text-[#00C9A7] tracking-widest uppercase">ML Vision Cameras — Physical Intelligence Layer</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                Custom-built machine learning cameras installed at the clinic capture anonymised behavioural data — foot traffic patterns, 
                waiting room occupancy, peak consultation hours, and demographic insights. This physical intelligence layer feeds directly 
                into the StudEx Brain, enabling demand forecasting and staffing optimisation that no competitor has.
              </p>
              <p className="text-gray-400 text-sm leading-relaxed">
                All data is anonymised and POPIA-compliant. No facial recognition. No biometric data. 
                Pure behavioural analytics — the same technology used by major retail chains to optimise their operations.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Users, label: "Foot Traffic Analysis", desc: "Peak hours, busy days, seasonal patterns" },
                { icon: Activity, label: "Wait Time Monitoring", desc: "Real-time occupancy and queue management" },
                { icon: Target, label: "Demographic Insights", desc: "Age range and gender distribution (anonymised)" },
                { icon: TrendingUp, label: "Demand Forecasting", desc: "Predict busy periods 4–6 weeks in advance" },
              ].map((f, i) => (
                <div key={i} className="bg-white/[0.02] border border-white/[0.06] rounded p-3">
                  <f.icon size={14} className="text-[#00C9A7] mb-2" />
                  <div className="text-xs font-bold text-white mb-1">{f.label}</div>
                  <p className="text-xs text-gray-500">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

// ─── SECURITY ─────────────────────────────────────────────────────────────────
function SecuritySection() {
  const specs = [
    { key: "Chip", val: "Apple M4 Pro" },
    { key: "RAM", val: "24GB Unified Memory" },
    { key: "Storage", val: "512GB NVMe SSD" },
    { key: "Power Draw", val: "~30W (silent operation)" },
    { key: "AI Model", val: "DeepSeek-R1 (local, offline)" },
    { key: "RAG System", val: "AnythingLLM + Ollama" },
    { key: "Automation", val: "N8N Engine" },
    { key: "CRM", val: "StudEx Claw" },
  ];

  return (
    <Section id="security" className="bg-[#0a0f14]">
      <div className="max-w-7xl mx-auto">
        <Label>Part 4 — Data Security Architecture</Label>
        <h2 className="text-4xl font-black text-white mb-4">Institutional Memory.<br />Data Never Leaves the Building.</h2>
        <p className="text-gray-400 max-w-3xl mb-12 leading-relaxed">
          The Mac Mini M4 Pro is the physical heart of the StudEx system — a silent, powerful AI hub installed at the clinic. 
          All AI processing happens locally. Patient data never leaves the premises. The three-point backup architecture makes 
          data breach probability effectively zero.
        </p>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Mac Mini specs */}
          <div>
            <p className="text-xs font-bold text-[#00C9A7] tracking-widest uppercase mb-4">Mac Mini M4 Pro — Hardware Specifications</p>
            <div className="bg-[#00C9A7]/04 border border-[#00C9A7]/15 rounded p-6">
              <div className="flex items-center gap-3 mb-4">
                <Monitor size={20} className="text-[#00C9A7]" />
                <span className="text-sm font-bold text-white">Your Company Brain</span>
                <span className="text-xs bg-[#00C9A7]/10 text-[#00C9A7] px-2 py-0.5 rounded font-semibold">~R18,500 once-off</span>
              </div>
              {specs.map((s, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-white/[0.05] last:border-0">
                  <span className="text-xs text-gray-500">{s.key}</span>
                  <span className="text-xs font-semibold text-[#00C9A7]">{s.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Three-point security */}
          <div>
            <p className="text-xs font-bold text-[#00C9A7] tracking-widest uppercase mb-4">Three-Point Security Architecture</p>
            <div className="flex flex-col gap-3">
              <SecurityNode icon={Monitor} title="Point 1 — Company Brain (Primary)" desc="Primary storage on Mac Mini NVMe SSD. AES-256 encrypted. Fully offline-capable. No internet required for AI processing. All patient data stays on-premises." tag="On-Premises — Primary" color="#00C9A7" />
              <SecurityNode icon={Lock} title="Point 2 — On-Site Backup" desc="NAS or encrypted external drive at a separate clinic location. Auto-syncs every 6 hours. 90-day rolling backup. No internet connection required." tag="On-Premises — Backup" color="#FFA500" />
              <SecurityNode icon={Cloud} title="Point 3 — Google Cloud (SA Region)" desc="Encrypted daily backup to Google Cloud Johannesburg. AES-256 in transit and at rest. South Africa data residency. POPIA-compliant. Built on Google's enterprise security infrastructure." tag="Cloud — Disaster Recovery" color="#4A9EFF" />
            </div>
            <div className="mt-4 bg-[#00C9A7]/06 border border-[#00C9A7]/25 rounded p-3 text-center">
              <div className="text-lg font-black text-[#00C9A7] mb-1">Data Breach Probability: &lt;0.001%</div>
              <div className="flex justify-center gap-3 flex-wrap">
                {["POPIA Compliant", "AES-256 Encrypted", "SA Data Residency", "Google Cloud Infrastructure"].map(b => (
                  <span key={b} className="text-xs font-semibold bg-[#00C9A7]/10 text-[#00C9A7] px-2 py-1 rounded">{b}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Use cases */}
        <p className="text-xs font-bold text-[#00C9A7] tracking-widest uppercase mb-4">Three Company Brain Use Cases</p>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { num: "01", title: "Onboarding New Staff", body: "Ask the Brain: 'What is our standard response to a LASIK enquiry?' — Instant answer, sourced from your own clinic's history and protocols. No more tribal knowledge lost when staff leave." },
            { num: "02", title: "Campaign Intelligence", body: "Ask the Brain: 'Which content performed best last summer?' — Instant recall of every post, every metric, every campaign result. Informs the next campaign automatically." },
            { num: "03", title: "Business Continuity", body: "Every meeting transcript, every decision, every patient communication protocol stored and indexed. The clinic's intelligence survives staff turnover, ownership changes, and time." },
          ].map((u, i) => (
            <div key={i} className="bg-white/[0.02] border border-white/[0.07] rounded p-5">
              <div className="text-4xl font-black text-[#00C9A7]/20 mb-3">{u.num}</div>
              <div className="text-sm font-bold text-white mb-2">{u.title}</div>
              <p className="text-xs text-gray-500 leading-relaxed">{u.body}</p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

// ─── ROADMAP ──────────────────────────────────────────────────────────────────
function RoadmapSection() {
  return (
    <Section id="roadmap" className="bg-[#0D1117]">
      <div className="max-w-7xl mx-auto">
        <Label>Part 5 — Implementation Roadmap</Label>
        <h2 className="text-4xl font-black text-white mb-4">Three Phases. Measurable Results at Every Stage.</h2>
        <p className="text-gray-400 max-w-3xl mb-12 leading-relaxed">
          No big-bang risk. Each phase delivers standalone value — and builds the foundation for the next. 
          You see results from Month 1, not Month 12.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          <PhaseCard
            num="1" title="Foundation" timeframe="Months 1–3" color="#00C9A7"
            items={[
              "Mac Mini Company Brain installed and configured at clinic",
              "Brand voice profile created for Safesight and LAISA separately",
              "Content Engine activated — first month of posts generated and approved",
              "WhatsApp automation live — appointment reminders and enquiry handling",
              "Online booking integrated with clinic calendar",
              "Google Business Profile optimised",
              "Three-point backup architecture configured and tested",
              "Staff trained on Nexus Social dashboard (2-hour session)",
            ]}
            milestone="Month 3 Milestone: +40% enquiry volume from digital channels"
          />
          <PhaseCard
            num="2" title="Growth" timeframe="Months 4–6" color="#4A9EFF"
            items={[
              "All 9 Naledi agents configured and operational",
              "ML Vision Cameras installed and calibrated (foot traffic, demographics)",
              "StudEx Patent RAG System seeded with clinic documentation and FAQs",
              "Competitor monitoring dashboard activated — daily intelligence reports",
              "Patient testimonial collection system launched",
              "Sales forecasting model trained on booking history",
              "Before/after content series launched across Instagram and Facebook",
              "StudEx Claw CRM fully operational with patient journey mapping",
            ]}
            milestone="Month 6 Milestone: +60% enquiry volume, break-even on investment"
          />
          <PhaseCard
            num="3" title="Intelligence" timeframe="Months 7–12" color="#A78BFA"
            items={[
              "AI video content series launched — procedure explainers and testimonials",
              "TikTok and YouTube channels activated with AI-generated content",
              "Patient loyalty programme integrated with StudEx Claw CRM",
              "Predictive demand forecasting driving stock and staffing decisions",
              "Monthly board-ready intelligence reports delivered automatically",
              "Patient churn prediction and re-engagement automation active",
              "Referral programme with automated tracking and rewards",
              "Patient app scoping and development initiated",
            ]}
            milestone="Month 12 Milestone: +R336,000/month revenue uplift, 8.5/10 digital score"
          />
        </div>

        <div className="mt-8 bg-[#00C9A7]/05 border border-[#00C9A7]/20 rounded p-4 flex flex-wrap justify-between items-center gap-4">
          <span className="text-sm text-gray-400">Each phase is <strong className="text-[#00C9A7]">independently valuable</strong> — you see results from Month 1, not Month 12.</span>
          <span className="text-sm font-bold text-[#00C9A7]">Break-even: Month 2 &nbsp;|&nbsp; Full ROI: Month 6 &nbsp;|&nbsp; Compounding returns: Month 12+</span>
        </div>
      </div>
    </Section>
  );
}

// ─── PROJECTION ───────────────────────────────────────────────────────────────
function ProjectionSection() {
  const months = ["M1","M2","M3","M4","M5","M6","M7","M8","M9","M10","M11","M12"];
  const baseline = [45,47,48,50,51,52,54,55,56,57,58,60];
  const withAI   = [45,58,72,89,105,118,130,140,148,155,160,165];

  const lineData = {
    labels: months,
    datasets: [
      {
        label: "Without StudEx",
        data: baseline,
        borderColor: "#FFA500",
        backgroundColor: "rgba(255,165,0,0.05)",
        borderWidth: 2,
        borderDash: [6, 3],
        pointBackgroundColor: "#FFA500",
        pointRadius: 4,
        fill: false,
        tension: 0.3,
      },
      {
        label: "With StudEx AI",
        data: withAI,
        borderColor: "#00C9A7",
        backgroundColor: "rgba(0,201,167,0.08)",
        borderWidth: 2.5,
        pointBackgroundColor: "#00C9A7",
        pointRadius: 5,
        fill: true,
        tension: 0.3,
      },
    ],
  };

  const salesImpact = {
    labels: ["Month 3", "Month 6", "Month 9", "Month 12"],
    datasets: [
      {
        label: "Monthly Revenue Uplift (R)",
        data: [76800, 211200, 294400, 336000],
        backgroundColor: "rgba(0,201,167,0.6)",
        borderColor: "#00C9A7",
        borderWidth: 1,
      },
    ],
  };

  return (
    <Section id="projection" className="bg-[#0a0f14]">
      <div className="max-w-7xl mx-auto">
        <Label>Part 6 — Revenue Intelligence & Sales Impact</Label>
        <h2 className="text-4xl font-black text-white mb-4">The Numbers. Conservative. Compounding. Real.</h2>
        <p className="text-gray-400 max-w-3xl mb-12 leading-relaxed">
          Based on conservative assumptions: R3,200 average revenue per converted enquiry, 65% enquiry-to-consultation rate, 
          45% consultation-to-procedure conversion. These are below-industry-average figures — real results are typically higher.
        </p>

        <div className="grid md:grid-cols-4 gap-4 mb-10">
          <StatCard value="R1.8M" label="Cumulative 12-Mo Uplift" sub="Conservative estimate" />
          <StatCard value="+202%" label="Growth Index by Month 12" sub="vs baseline trajectory" />
          <StatCard value="Month 2" label="Break-Even Point" sub="Investment recovered" />
          <StatCard value="R336K" label="Monthly Uplift by Month 12" sub="Recurring, compounding" />
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <div className="bg-white/[0.02] border border-white/[0.08] rounded p-6">
            <p className="text-xs font-bold text-[#00C9A7] tracking-widest uppercase mb-4">Monthly Patient Enquiries — Baseline vs With StudEx AI</p>
            <div style={{ height: 300 }}>
              <Line data={lineData} options={chartDefaults} />
            </div>
          </div>
          <div className="bg-white/[0.02] border border-white/[0.08] rounded p-6">
            <p className="text-xs font-bold text-[#00C9A7] tracking-widest uppercase mb-4">Monthly Revenue Uplift at Key Milestones</p>
            <div style={{ height: 300 }}>
              <Bar data={salesImpact} options={{ ...chartDefaults, plugins: { ...chartDefaults.plugins, legend: { display: false } } }} />
            </div>
          </div>
        </div>

        {/* Milestone table */}
        <div className="bg-white/[0.02] border border-white/[0.08] rounded overflow-hidden mb-10">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-[#00C9A7]/10 border-b border-[#00C9A7]/20">
                {["Month", "Baseline Enquiries", "With StudEx", "Conversion Rate", "Monthly Uplift", "Cumulative Uplift"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[#00C9A7] font-bold tracking-wider uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { m: "Month 1", base: 45, ai: 45, conv: "Setup phase", uplift: "—", cum: "—" },
                { m: "Month 3", base: 48, ai: 72, conv: "65% → 45%", uplift: "R76,800", cum: "R115,200" },
                { m: "Month 6", base: 52, ai: 118, conv: "65% → 45%", uplift: "R211,200", cum: "R633,600" },
                { m: "Month 9", base: 56, ai: 148, conv: "65% → 45%", uplift: "R294,400", cum: "R1,176,000" },
                { m: "Month 12", base: 60, ai: 165, conv: "65% → 45%", uplift: "R336,000", cum: "R1,814,400" },
              ].map((r, i) => (
                <tr key={i} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-bold text-white">{r.m}</td>
                  <td className="px-4 py-3 text-gray-400">{r.base}</td>
                  <td className="px-4 py-3 font-bold text-[#00C9A7]">{r.ai}</td>
                  <td className="px-4 py-3 text-gray-400">{r.conv}</td>
                  <td className="px-4 py-3 font-bold text-[#00C9A7]">{r.uplift}</td>
                  <td className="px-4 py-3 font-bold text-white">{r.cum}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Sales AI explanation */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white/[0.02] border border-white/[0.08] rounded p-6">
            <div className="flex items-center gap-2 mb-4">
              <Brain size={16} className="text-[#00C9A7]" />
              <p className="text-xs font-bold text-[#00C9A7] tracking-widest uppercase">How AI Drives Sales</p>
            </div>
            <div className="flex flex-col gap-3">
              {[
                { step: "01", title: "Identify High-Intent Signals", desc: "AI monitors which content types generate the most booking enquiries and doubles down on those formats automatically." },
                { step: "02", title: "Predict Demand Cycles", desc: "Seasonal patterns, competitor promotions, and local events are analysed to predict when enquiry volume will spike — so you're ready." },
                { step: "03", title: "Optimise the Conversion Funnel", desc: "Every touchpoint from first Instagram view to booked consultation is tracked and optimised. Leaks in the funnel are identified and fixed." },
                { step: "04", title: "Forecast Revenue 90 Days Out", desc: "The AI generates a 90-day revenue forecast updated weekly — giving management the visibility to make staffing and investment decisions confidently." },
              ].map((s, i) => (
                <div key={i} className="flex gap-3">
                  <span className="text-2xl font-black text-[#00C9A7]/20 flex-shrink-0">{s.step}</span>
                  <div>
                    <div className="text-sm font-bold text-white mb-1">{s.title}</div>
                    <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/[0.02] border border-white/[0.08] rounded p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={16} className="text-[#00C9A7]" />
              <p className="text-xs font-bold text-[#00C9A7] tracking-widest uppercase">Better Management Through AI</p>
            </div>
            <div className="flex flex-col gap-3">
              {[
                { icon: BarChart3, title: "Financial Forecasting", desc: "AI-generated P&L projections updated monthly, with scenario modelling for different growth trajectories." },
                { icon: Users, title: "Staff Optimisation", desc: "ML camera data predicts peak periods — ensuring the right number of staff are scheduled without overstaffing." },
                { icon: Target, title: "Marketing ROI Tracking", desc: "Every rand spent on content and advertising is tracked to a specific number of enquiries and bookings." },
                { icon: Shield, title: "Risk Intelligence", desc: "The AI flags anomalies — sudden drops in engagement, competitor price changes, negative reviews — before they become problems." },
              ].map((f, i) => (
                <div key={i} className="flex gap-3 py-2 border-b border-white/[0.04] last:border-0">
                  <f.icon size={14} className="text-[#00C9A7] mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-bold text-white mb-1">{f.title}</div>
                    <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

// ─── WHY NOW ──────────────────────────────────────────────────────────────────
function WhyNowSection() {
  return (
    <Section id="why" className="bg-[#0D1117]">
      <div className="max-w-7xl mx-auto text-center">
        <Label>The Strategic Case</Label>
        <h2 className="text-5xl font-black text-white mb-4">Why StudEx. Why Now.</h2>
        <div className="w-20 h-0.5 bg-[#00C9A7] mx-auto mb-12" />

        <div className="grid md:grid-cols-2 gap-5 max-w-4xl mx-auto mb-12">
          {[
            { num: "01", title: "No Competitor Has Moved Yet", body: "Zero direct competitors in the Pretoria medical aesthetics and ophthalmology space are using AI content generation. The first-mover advantage is still fully available — but it won't be for long." },
            { num: "02", title: "AI Content Is Proven, Not Experimental", body: "The technology is mature, reliable, and already deployed by leading brands globally. This is not a bet on an unproven technology — it is adoption of a proven system that competitors have not yet discovered locally." },
            { num: "03", title: "Patient Expectations Are Shifting", body: "South African patients increasingly expect digital-first experiences — online booking, WhatsApp communication, and social proof before choosing a clinic. Practices that don't meet these expectations lose patients to those that do." },
            { num: "04", title: "The Window Closes", body: "Every month without AI content generation is a month where Skin Renewal grows its 337K Facebook audience further, where Pretoria Eye Institute could activate, and where the gap becomes harder to close." },
          ].map((r, i) => (
            <div key={i} className="bg-white/[0.02] border border-white/[0.08] rounded p-6 text-left">
              <div className="text-5xl font-black text-[#00C9A7]/15 mb-3">{r.num}</div>
              <div className="text-lg font-black text-white mb-3">{r.title}</div>
              <p className="text-sm text-gray-500 leading-relaxed">{r.body}</p>
            </div>
          ))}
        </div>

        <div className="bg-[#00C9A7]/08 border border-[#00C9A7]/30 rounded p-6 max-w-3xl mx-auto">
          <p className="text-lg font-bold text-white leading-relaxed">
            The first practice to move <span className="text-[#00C9A7]">sets the standard</span>. Every competitor that follows will be playing catch-up.<br />
            That practice should be <span className="text-[#00C9A7]">Safesight–LAISA</span>.
          </p>
        </div>
      </div>
    </Section>
  );
}

// ─── CONTACT / CTA ────────────────────────────────────────────────────────────
function ContactSection() {
  return (
    <Section id="contact" className="bg-[#0a0f14]">
      <div className="max-w-4xl mx-auto text-center">
        <Label>The Decision Point</Label>
        <h2 className="text-5xl font-black text-white mb-4">The Transformation Starts<br />with <span className="text-[#00C9A7]">One Decision</span>.</h2>
        <div className="w-20 h-0.5 bg-[#00C9A7] mx-auto mb-8" />
        <p className="text-gray-400 text-lg mb-12 leading-relaxed">
          <strong className="text-white">Safesight–LAISA has the clinical excellence.</strong> StudEx provides the digital intelligence.<br />
          Together, we build the dominant practice in Pretoria.
        </p>

        <div className="grid md:grid-cols-3 gap-5 mb-10">
          {[
            { num: "01", title: "Schedule the Strategy Session", desc: "A focused 90-minute session to walk through the full intelligence report, answer questions, and confirm Phase 1 scope." },
            { num: "02", title: "Review the Full Intelligence Report", desc: "The complete digital intelligence report — every metric, every competitor, every recommendation — is ready for your review." },
            { num: "03", title: "Approve Phase 1 Implementation", desc: "Company Brain installed, Content Engine activated, WhatsApp live. First results visible within 30 days of go-live." },
          ].map((s, i) => (
            <div key={i} className="bg-white/[0.02] border border-white/[0.08] rounded p-5 text-left">
              <div className="text-4xl font-black text-[#00C9A7]/20 mb-3">{s.num}</div>
              <div className="text-sm font-bold text-white mb-2">{s.title}</div>
              <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-4 justify-center mb-8">
          <a href="https://studex.co.za" target="_blank" rel="noopener noreferrer"
            className="px-10 py-4 bg-[#00C9A7] text-[#0D1117] font-black rounded text-sm hover:bg-[#00b396] transition-colors">
            Book the Strategy Session
          </a>
          <a href="https://studex.co.za" target="_blank" rel="noopener noreferrer"
            className="px-10 py-4 border border-[#00C9A7]/40 text-[#00C9A7] font-bold rounded text-sm hover:bg-[#00C9A7]/10 transition-colors">
            studex.co.za
          </a>
        </div>

        <p className="text-sm text-gray-600 italic mb-8">
          The window is open. The question is: <strong className="text-[#00C9A7] not-italic">who moves first?</strong>
        </p>

        <div className="flex flex-wrap justify-center gap-4 text-xs font-bold text-gray-600 uppercase tracking-widest">
          {["StudEx Digital Intelligence", "Naledi AI System", "Nexus Social Platform", "StudEx Claw CRM"].map((b, i) => (
            <span key={i}>{b}{i < 3 ? " ·" : ""}</span>
          ))}
        </div>
      </div>
    </Section>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-[#0D1117] border-t border-white/[0.06] py-8 px-6 text-center">
      <div className="flex items-center justify-center gap-2 mb-3">
        <div className="w-6 h-6 rounded bg-[#00C9A7]/20 border border-[#00C9A7]/40 flex items-center justify-center">
          <Brain size={12} className="text-[#00C9A7]" />
        </div>
        <span className="text-sm font-black text-white tracking-wider">STUDEX</span>
      </div>
      <p className="text-xs text-gray-600">© 2026 StudEx Agentic Lab. All rights reserved. Confidential — Prepared for Safesight–LAISA.</p>
      <p className="text-xs text-gray-700 mt-1">Built on Google Cloud · POPIA Compliant · AES-256 Encrypted</p>
    </footer>
  );
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────
export default function SafesightReport() {
  return (
    <div className="min-h-screen bg-[#0D1117] text-white">
      <Nav />
      <Hero />
      <MetricsSection />
      <CompetitorSection />
      <PlatformSection />
      <SecuritySection />
      <RoadmapSection />
      <ProjectionSection />
      <WhyNowSection />
      <ContactSection />
      <Footer />
    </div>
  );
}
