import { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import {
  BarChart3, TrendingUp, Users, MessageSquare, Sparkles,
  Brain, Zap, ArrowRight, ChevronDown, Play, Check,
  Instagram, Globe, Target, Bell, Settings, LogOut,
  FileText, Video, Bot, Star, Shield, Cpu
} from "lucide-react";

// ─── DEMO CLIENT CONFIGURATIONS ───────────────────────────────────────────────
const DEMO_CLIENTS = [
  {
    id: "kasi",
    name: "Kasi Eats",
    tagline: "Township Food Delivery Platform",
    logo: "🍖",
    primaryColor: "#FF6B35",
    secondaryColor: "#FFD700",
    accentColor: "#FF6B35",
    bgDark: "#1A0A00",
    bgCard: "#2A1500",
    borderColor: "rgba(255,107,53,0.4)",
    glowColor: "rgba(255,107,53,0.3)",
    industry: "Food & Delivery",
    followers: "42,800",
    reach: "128,400",
    engagement: "8.4%",
    posts: 47,
    growth: "+23%",
    plan: "Growth",
    metrics: [
      { label: "Page Likes", value: "42.8K", change: "+12%", up: true },
      { label: "Weekly Reach", value: "128K", change: "+23%", up: true },
      { label: "Engagement Rate", value: "8.4%", change: "+1.2%", up: true },
      { label: "AI Posts Published", value: "47", change: "this month", up: true },
    ],
    recentPosts: [
      { content: "🍖 Friday night sorted! Our pap & wors combo is back — order now and get free delivery in Soweto. Link in bio!", likes: 847, comments: 234, reach: "12.4K" },
      { content: "Behind the scenes at our Diepkloof kitchen 🔥 Real food, real people, real flavour. #KasiEats #TownshipFood", likes: 1203, comments: 456, reach: "18.7K" },
      { content: "NEW: Bunny chow delivery now live in Alexandra! 🐰 Tag a friend who needs this in their life 👇", likes: 2341, comments: 891, reach: "34.2K" },
    ],
  },
  {
    id: "ubuntu",
    name: "Ubuntu Fintech",
    tagline: "Pan-African Digital Banking",
    logo: "💳",
    primaryColor: "#00D4AA",
    secondaryColor: "#0088FF",
    accentColor: "#00D4AA",
    bgDark: "#000D1A",
    bgCard: "#001A2E",
    borderColor: "rgba(0,212,170,0.4)",
    glowColor: "rgba(0,212,170,0.3)",
    industry: "Financial Services",
    followers: "89,200",
    reach: "312,000",
    engagement: "5.7%",
    posts: 62,
    growth: "+41%",
    plan: "Command Centre",
    metrics: [
      { label: "Page Likes", value: "89.2K", change: "+41%", up: true },
      { label: "Weekly Reach", value: "312K", change: "+38%", up: true },
      { label: "Engagement Rate", value: "5.7%", change: "+0.8%", up: true },
      { label: "AI Posts Published", value: "62", change: "this month", up: true },
    ],
    recentPosts: [
      { content: "Send money across 12 African countries in under 30 seconds. No hidden fees. No queues. Just Ubuntu. 🌍", likes: 3421, comments: 1203, reach: "48.2K" },
      { content: "Your money should work as hard as you do. Ubuntu Savings Account — 9.5% interest, zero fees. Open in 2 minutes 📱", likes: 2891, comments: 987, reach: "41.7K" },
      { content: "We just crossed 1 million transactions! Thank you for trusting Ubuntu with your money 🙏 #FinancialFreedom", likes: 8934, comments: 3421, reach: "124K" },
    ],
  },
  {
    id: "naledi",
    name: "Naledi Fashion",
    tagline: "African Luxury Streetwear",
    logo: "👗",
    primaryColor: "#D4AF37",
    secondaryColor: "#8B0000",
    accentColor: "#D4AF37",
    bgDark: "#0D0800",
    bgCard: "#1A1000",
    borderColor: "rgba(212,175,55,0.4)",
    glowColor: "rgba(212,175,55,0.3)",
    industry: "Fashion & Retail",
    followers: "156,400",
    reach: "489,000",
    engagement: "11.2%",
    posts: 89,
    growth: "+67%",
    plan: "Command Centre",
    metrics: [
      { label: "Page Likes", value: "156K", change: "+67%", up: true },
      { label: "Weekly Reach", value: "489K", change: "+52%", up: true },
      { label: "Engagement Rate", value: "11.2%", change: "+2.1%", up: true },
      { label: "AI Posts Published", value: "89", change: "this month", up: true },
    ],
    recentPosts: [
      { content: "The Ndebele Collection drops Friday 🌟 Handcrafted beadwork meets modern streetwear. Limited to 200 pieces. Are you ready? 🔥", likes: 12400, comments: 4321, reach: "89.4K" },
      { content: "Wearing your roots is a revolution. New editorial — 'Ubuntu Luxe' — shot in Johannesburg, Lagos, and Nairobi 📸", likes: 8934, comments: 2341, reach: "67.2K" },
      { content: "We don't do fast fashion. We do forever fashion. Each piece tells a story that started 1000 years ago. #NalediFashion", likes: 15600, comments: 5678, reach: "124K" },
    ],
  },
];

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

function ScrollSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function ClientDashboardPreview({ client }: { client: typeof DEMO_CLIENTS[0] }) {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div
      className="rounded-2xl overflow-hidden border"
      style={{
        background: client.bgDark,
        borderColor: client.borderColor,
        boxShadow: `0 0 60px ${client.glowColor}, 0 0 120px ${client.glowColor}44`,
      }}
    >
      {/* Dashboard Header */}
      <div
        className="flex items-center justify-between px-6 py-4 border-b"
        style={{ borderColor: client.borderColor, background: client.bgCard }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{ background: `${client.primaryColor}22`, border: `1px solid ${client.primaryColor}44` }}
          >
            {client.logo}
          </div>
          <div>
            <div className="font-bold text-white text-sm">{client.name}</div>
            <div className="text-xs" style={{ color: client.primaryColor }}>{client.tagline}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div
            className="px-3 py-1 rounded-full text-xs font-bold"
            style={{ background: `${client.primaryColor}22`, color: client.primaryColor, border: `1px solid ${client.primaryColor}44` }}
          >
            {client.plan}
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-green-400">Live</span>
          </div>
        </div>
      </div>

      {/* Sidebar + Content */}
      <div className="flex">
        {/* Mini Sidebar */}
        <div
          className="w-14 flex flex-col items-center py-4 gap-4 border-r"
          style={{ borderColor: client.borderColor, background: client.bgCard }}
        >
          {[
            { icon: BarChart3, active: activeTab === "overview" },
            { icon: Instagram, active: activeTab === "social" },
            { icon: Brain, active: activeTab === "ai" },
            { icon: FileText, active: activeTab === "reports" },
            { icon: Settings, active: false },
          ].map((item, i) => (
            <button
              key={i}
              onClick={() => {
                if (i === 0) setActiveTab("overview");
                else if (i === 1) setActiveTab("social");
                else if (i === 2) setActiveTab("ai");
                else if (i === 3) setActiveTab("reports");
              }}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
              style={{
                background: item.active ? `${client.primaryColor}22` : "transparent",
                border: item.active ? `1px solid ${client.primaryColor}44` : "1px solid transparent",
              }}
            >
              <item.icon
                className="w-4 h-4"
                style={{ color: item.active ? client.primaryColor : "#666" }}
              />
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex-1 p-5">
          <AnimatePresence mode="wait">
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-xs text-gray-500 mb-4 uppercase tracking-wider">Performance Overview — Last 30 Days</div>
                {/* KPI Grid */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {client.metrics.map((m) => (
                    <div
                      key={m.label}
                      className="rounded-xl p-3 border"
                      style={{ background: client.bgCard, borderColor: client.borderColor }}
                    >
                      <div className="text-xs text-gray-500 mb-1">{m.label}</div>
                      <div className="font-bold text-white text-lg leading-none">{m.value}</div>
                      <div className="text-xs mt-1" style={{ color: m.up ? "#4ade80" : "#f87171" }}>
                        {m.up ? "↑" : "↓"} {m.change}
                      </div>
                    </div>
                  ))}
                </div>
                {/* Mini bar chart */}
                <div className="rounded-xl p-3 border" style={{ background: client.bgCard, borderColor: client.borderColor }}>
                  <div className="text-xs text-gray-500 mb-3">Weekly Reach Trend</div>
                  <div className="flex items-end gap-1 h-16">
                    {[40, 55, 48, 72, 65, 88, 95].map((h, i) => (
                      <motion.div
                        key={i}
                        className="flex-1 rounded-t"
                        style={{ background: `${client.primaryColor}${i === 6 ? "ff" : "66"}` }}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ delay: i * 0.08, duration: 0.5 }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between mt-1">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                      <div key={d} className="text-xs text-gray-600 flex-1 text-center">{d}</div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "social" && (
              <motion.div
                key="social"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-xs text-gray-500 mb-4 uppercase tracking-wider">AI-Generated Posts — Awaiting Approval</div>
                <div className="space-y-3">
                  {client.recentPosts.map((post, i) => (
                    <div
                      key={i}
                      className="rounded-xl p-3 border"
                      style={{ background: client.bgCard, borderColor: client.borderColor }}
                    >
                      <p className="text-xs text-gray-300 leading-relaxed mb-2 line-clamp-2">{post.content}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-3 text-xs text-gray-500">
                          <span>❤️ {post.likes.toLocaleString()}</span>
                          <span>💬 {post.comments.toLocaleString()}</span>
                          <span>👁️ {post.reach}</span>
                        </div>
                        <div className="flex gap-1">
                          <button
                            className="px-2 py-1 rounded text-xs font-bold"
                            style={{ background: `${client.primaryColor}22`, color: client.primaryColor }}
                          >
                            Approve
                          </button>
                          <button className="px-2 py-1 rounded text-xs text-gray-500 hover:text-white">Edit</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === "ai" && (
              <motion.div
                key="ai"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-xs text-gray-500 mb-4 uppercase tracking-wider">AI Brain — Ask Anything</div>
                <div
                  className="rounded-xl p-4 border mb-3"
                  style={{ background: client.bgCard, borderColor: client.borderColor }}
                >
                  <div className="flex items-start gap-2 mb-3">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs"
                      style={{ background: `${client.primaryColor}22`, color: client.primaryColor }}
                    >
                      AI
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      Based on your last 30 days, your best performing content is behind-the-scenes posts with authentic storytelling. 
                      Your audience engages 3.2× more on Thursdays between 6–9PM. I recommend increasing video content by 40% next month.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg" style={{ background: `${client.primaryColor}11`, border: `1px solid ${client.primaryColor}22` }}>
                    <span className="text-xs text-gray-500 flex-1">Ask your AI brain anything...</span>
                    <button
                      className="px-3 py-1 rounded text-xs font-bold"
                      style={{ background: client.primaryColor, color: "#000" }}
                    >
                      Ask
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {["Best time to post?", "Top performing hashtags?", "Competitor analysis?", "Content ideas for next week?"].map((q) => (
                    <button
                      key={q}
                      className="text-left p-2 rounded-lg text-xs text-gray-400 hover:text-white transition-colors border"
                      style={{ borderColor: client.borderColor, background: client.bgCard }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === "reports" && (
              <motion.div
                key="reports"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-xs text-gray-500 mb-4 uppercase tracking-wider">Auto-Generated Reports</div>
                <div className="space-y-2">
                  {[
                    { name: "March 2026 Performance Report", size: "2.4 MB", date: "Apr 1, 2026" },
                    { name: "Competitor Intelligence — Q1 2026", size: "1.8 MB", date: "Mar 31, 2026" },
                    { name: "Audience Demographics Deep Dive", size: "3.1 MB", date: "Mar 28, 2026" },
                    { name: "Content Strategy Recommendations", size: "0.9 MB", date: "Mar 25, 2026" },
                  ].map((r) => (
                    <div
                      key={r.name}
                      className="flex items-center justify-between p-3 rounded-xl border"
                      style={{ background: client.bgCard, borderColor: client.borderColor }}
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" style={{ color: client.primaryColor }} />
                        <div>
                          <div className="text-xs text-white font-medium">{r.name}</div>
                          <div className="text-xs text-gray-500">{r.date} · {r.size}</div>
                        </div>
                      </div>
                      <button
                        className="text-xs px-2 py-1 rounded"
                        style={{ background: `${client.primaryColor}22`, color: client.primaryColor }}
                      >
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function WhiteLabelDemo() {
  const [activeClient, setActiveClient] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const client = DEMO_CLIENTS[activeClient];
  const heroRef = useRef(null);
  // Replace VIDEO_URL with your own Loom/Vimeo/S3 .mp4 URL when ready
  const VIDEO_URL = "https://www.w3schools.com/html/mov_bbb.mp4";
  const videoRef = useRef<HTMLVideoElement>(null);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, -100]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0.3]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="min-h-screen bg-[#050008] text-white overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@400;600;700&display=swap');
        .font-orbitron { font-family: 'Orbitron', monospace; }
        .font-rajdhani { font-family: 'Rajdhani', sans-serif; }
        .neon-pink { color: #ff00cc; text-shadow: 0 0 20px #ff00cc88; }
        .neon-cyan { color: #00ffff; text-shadow: 0 0 20px #00ffff88; }
        .grid-bg {
          background-image: linear-gradient(rgba(255,0,200,0.08) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,0,200,0.08) 1px, transparent 1px);
          background-size: 60px 60px;
        }
        .client-tab-active {
          transform: translateY(-2px);
        }
        .scan-overlay {
          background: repeating-linear-gradient(
            0deg, transparent, transparent 2px,
            rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px
          );
          pointer-events: none;
        }
      `}</style>

      {/* ─── NAVBAR ─── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
        style={{ background: "rgba(5,0,8,0.9)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,0,204,0.2)" }}
      >
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="font-orbitron text-xs font-bold text-pink-400">← NEXUS SOCIAL</div>
          </div>
        </Link>
        <div className="font-orbitron text-sm font-bold text-white">WHITE-LABEL CLIENT DEMO</div>
        <Link href="/dashboard">
          <button
            className="font-orbitron text-xs font-bold text-white px-4 py-2 rounded-lg"
            style={{ background: "linear-gradient(135deg, #ff00cc, #cc00ff)", boxShadow: "0 0 20px rgba(255,0,204,0.4)" }}
          >
            LAUNCH DASHBOARD
          </button>
        </Link>
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20" ref={heroRef}>
        {/* ── Autoplay background video ── */}
        {/* To use your own recording: replace VIDEO_URL with your Loom export, Vimeo direct link, or S3 .mp4 URL */}
        <video
          ref={videoRef}
          src={VIDEO_URL}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.18, filter: "saturate(1.4) hue-rotate(260deg) brightness(0.7)" }}
        />
        {/* Dark cinematic overlay so text stays readable */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(5,0,8,0.55) 0%, rgba(5,0,8,0.72) 60%, rgba(5,0,8,0.95) 100%)" }} />
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,rgba(255,0,180,0.12),transparent)]" />
        <div className="absolute inset-0 scan-overlay" />
        {/* Play / Pause control */}
        <button
          onClick={togglePlay}
          className="absolute bottom-8 right-8 z-20 flex items-center gap-2 font-rajdhani text-xs tracking-widest uppercase px-4 py-2 rounded-full transition-all"
          style={{ background: "rgba(255,0,204,0.12)", border: "1px solid rgba(255,0,204,0.35)", color: "#ff00cc" }}
          aria-label={isPlaying ? "Pause background video" : "Play background video"}
        >
          {isPlaying ? (
            <><span className="w-3 h-3 flex gap-0.5"><span className="w-1 h-3 bg-pink-400 rounded-sm" /><span className="w-1 h-3 bg-pink-400 rounded-sm" /></span> Pause</>  
          ) : (
            <><Play className="w-3 h-3" /> Play</>
          )}
        </button>

        <motion.div
          className="relative z-10 text-center px-6 max-w-5xl mx-auto"
          style={{ y: heroY, opacity: heroOpacity }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 font-rajdhani text-xs tracking-widest uppercase"
            style={{ background: "rgba(255,0,204,0.1)", border: "1px solid rgba(255,0,204,0.4)", color: "#ff00cc" }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
            White-Label Platform Demo — StudEx D#VOP$
          </motion.div>

          <motion.h1
            className="font-orbitron font-black leading-none mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="text-3xl lg:text-5xl text-gray-400 mb-2">YOUR CLIENTS GET</div>
            <div className="text-5xl lg:text-8xl neon-pink mb-2">THEIR OWN</div>
            <div className="text-4xl lg:text-6xl text-white">AI COMMAND CENTRE</div>
          </motion.h1>

          <motion.p
            className="font-rajdhani text-xl text-gray-400 mb-10 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Every client gets a fully branded portal — their logo, their colours, their data.
            They see their analytics, approve AI-generated content, and access their AI brain.
            You manage everything from one command centre.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Link href="/dashboard">
              <button
                className="font-orbitron text-sm font-bold text-white px-8 py-4 rounded-xl flex items-center gap-2 mx-auto"
                style={{ background: "linear-gradient(135deg, #ff00cc, #cc00ff)", boxShadow: "0 0 30px rgba(255,0,204,0.5)" }}
              >
                <Zap className="w-4 h-4" />
                START BUILDING YOUR PLATFORM
              </button>
            </Link>
            <button
              className="font-orbitron text-sm font-bold px-8 py-4 rounded-xl flex items-center gap-2 mx-auto"
              style={{ border: "1px solid rgba(0,255,255,0.5)", color: "#00ffff" }}
              onClick={() => document.getElementById("demo-section")?.scrollIntoView({ behavior: "smooth" })}
            >
              <Play className="w-4 h-4" />
              SEE LIVE DEMOS
            </button>
          </motion.div>

          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="font-rajdhani text-xs text-gray-600 tracking-widest uppercase">Scroll to explore</span>
            <ChevronDown className="w-4 h-4 text-pink-600" />
          </motion.div>
        </motion.div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="relative py-24">
        <div className="container mx-auto px-6">
          <ScrollSection className="text-center mb-16">
            <div className="font-rajdhani text-pink-400 text-sm tracking-widest uppercase mb-3">The Model</div>
            <h2 className="font-orbitron text-4xl lg:text-5xl font-black text-white mb-4">
              ONE PLATFORM, INFINITE BRANDS
            </h2>
            <p className="font-rajdhani text-gray-400 text-lg max-w-2xl mx-auto">
              You run one Nexus Social instance. Each client gets their own branded portal.
              You keep the margin. They get world-class AI tools.
            </p>
          </ScrollSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                icon: Settings,
                title: "You Create a Client Workspace",
                desc: "Add their logo, brand colours, and connect their social accounts. Takes 5 minutes. The portal is live instantly.",
                color: "#ff00cc",
              },
              {
                step: "02",
                icon: Brain,
                title: "AI Learns Their Brand",
                desc: "The RAG brain ingests their brand voice, past campaigns, and audience data. Every AI output is on-brand from day one.",
                color: "#00ffff",
              },
              {
                step: "03",
                icon: BarChart3,
                title: "Client Logs In, Sees Their World",
                desc: "Their branded dashboard. Their analytics. Their AI-generated content queue. Their reports. Nothing from other clients.",
                color: "#ff66ff",
              },
            ].map((item, i) => (
              <ScrollSection key={item.step}>
                <motion.div
                  className="rounded-2xl p-6 border h-full"
                  style={{
                    background: "rgba(5,0,8,0.8)",
                    borderColor: `${item.color}44`,
                    boxShadow: `0 0 30px ${item.color}11`,
                  }}
                  whileHover={{ y: -6, boxShadow: `0 0 60px ${item.color}22` }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="font-orbitron text-5xl font-black mb-4" style={{ color: `${item.color}33` }}>{item.step}</div>
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: `${item.color}22`, border: `1px solid ${item.color}44` }}
                  >
                    <item.icon className="w-6 h-6" style={{ color: item.color }} />
                  </div>
                  <h3 className="font-orbitron text-sm font-bold text-white mb-3">{item.title}</h3>
                  <p className="font-rajdhani text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                </motion.div>
              </ScrollSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── LIVE CLIENT DEMOS ─── */}
      <section id="demo-section" className="relative py-24">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="relative z-10 container mx-auto px-6">
          <ScrollSection className="text-center mb-12">
            <div className="font-rajdhani text-pink-400 text-sm tracking-widest uppercase mb-3">Live Demos</div>
            <h2 className="font-orbitron text-4xl lg:text-5xl font-black text-white mb-4">
              THREE CLIENTS. THREE BRANDS.
            </h2>
            <p className="font-rajdhani text-gray-400 text-lg max-w-2xl mx-auto">
              Click each client below to see their fully branded AI command centre.
              Same platform. Completely different experience.
            </p>
          </ScrollSection>

          {/* Client Selector */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
            {DEMO_CLIENTS.map((c, i) => (
              <motion.button
                key={c.id}
                onClick={() => setActiveClient(i)}
                className="flex items-center gap-3 px-6 py-4 rounded-2xl border transition-all font-rajdhani"
                style={{
                  background: activeClient === i ? `${c.primaryColor}22` : "rgba(5,0,8,0.8)",
                  borderColor: activeClient === i ? c.primaryColor : "rgba(255,255,255,0.1)",
                  boxShadow: activeClient === i ? `0 0 30px ${c.glowColor}` : "none",
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-2xl">{c.logo}</span>
                <div className="text-left">
                  <div className="font-bold text-white text-sm">{c.name}</div>
                  <div className="text-xs" style={{ color: activeClient === i ? c.primaryColor : "#666" }}>
                    {c.industry}
                  </div>
                </div>
                {activeClient === i && (
                  <div className="w-2 h-2 rounded-full ml-auto animate-pulse" style={{ background: c.primaryColor }} />
                )}
              </motion.button>
            ))}
          </div>

          {/* Dashboard Preview */}
          <AnimatePresence mode="wait">
            <motion.div
              key={client.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.4 }}
            >
              <ClientDashboardPreview client={client} />
            </motion.div>
          </AnimatePresence>

          {/* Client Stats */}
          <motion.div
            className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4"
            key={`stats-${client.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {[
              { label: "Total Followers", value: client.followers, icon: Users },
              { label: "Monthly Reach", value: client.reach, icon: TrendingUp },
              { label: "Engagement Rate", value: client.engagement, icon: Target },
              { label: "Growth This Month", value: client.growth, icon: Zap },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl p-4 border text-center"
                style={{
                  background: `${client.primaryColor}11`,
                  borderColor: client.borderColor,
                }}
              >
                <stat.icon className="w-5 h-5 mx-auto mb-2" style={{ color: client.primaryColor }} />
                <div className="font-orbitron text-xl font-black text-white">{stat.value}</div>
                <div className="font-rajdhani text-xs text-gray-500 uppercase tracking-wider mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── WHAT CLIENTS GET ─── */}
      <section className="relative py-24">
        <div className="container mx-auto px-6">
          <ScrollSection className="text-center mb-16">
            <div className="font-rajdhani text-pink-400 text-sm tracking-widest uppercase mb-3">Included in Every Portal</div>
            <h2 className="font-orbitron text-4xl lg:text-5xl font-black text-white mb-4">
              WHAT YOUR CLIENTS GET
            </h2>
          </ScrollSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: BarChart3, title: "Live Analytics Dashboard", desc: "Real-time Facebook, Instagram, and TikTok metrics. Daily reach, engagement, audience demographics, and top posts.", color: "#ff00cc" },
              { icon: Sparkles, title: "AI Content Generation", desc: "AI writes posts, captions, and campaigns in the client's brand voice. Client approves with one click.", color: "#00ffff" },
              { icon: Brain, title: "AI Brain (RAG)", desc: "Ask any question about their business, audience, or competitors. The AI answers from their own data.", color: "#ff66ff" },
              { icon: Video, title: "AI Video Creation", desc: "Higgsfield-powered video generation. Turn a text brief into a professional social media video in minutes.", color: "#ff00cc" },
              { icon: FileText, title: "Auto-Generated Reports", desc: "Monthly performance reports, competitor analysis, and content strategy recommendations — generated automatically.", color: "#00ffff" },
              { icon: Bot, title: "WhatsApp & IG Chatbot", desc: "24/7 AI chatbot that handles customer queries, qualifies leads, and books appointments automatically.", color: "#ff66ff" },
            ].map((feat, i) => (
              <ScrollSection key={feat.title}>
                <motion.div
                  className="rounded-2xl p-6 border h-full"
                  style={{ background: "rgba(5,0,8,0.8)", borderColor: `${feat.color}33` }}
                  whileHover={{ y: -4, borderColor: feat.color }}
                  transition={{ duration: 0.2 }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: `${feat.color}22`, border: `1px solid ${feat.color}44` }}
                  >
                    <feat.icon className="w-6 h-6" style={{ color: feat.color }} />
                  </div>
                  <h3 className="font-orbitron text-sm font-bold text-white mb-2">{feat.title}</h3>
                  <p className="font-rajdhani text-gray-400 text-sm leading-relaxed">{feat.desc}</p>
                </motion.div>
              </ScrollSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section className="relative py-24">
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="relative z-10 container mx-auto px-6">
          <ScrollSection className="text-center mb-16">
            <div className="font-rajdhani text-pink-400 text-sm tracking-widest uppercase mb-3">Reseller Pricing</div>
            <h2 className="font-orbitron text-4xl lg:text-5xl font-black text-white mb-4">
              YOUR MARGIN. YOUR PRICE.
            </h2>
            <p className="font-rajdhani text-gray-400 text-lg max-w-2xl mx-auto">
              You pay one platform fee. You charge clients whatever you want.
              Break even at 2 clients. Pure profit from client 3 onwards.
            </p>
          </ScrollSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                name: "STARTER",
                yourCost: "R2,500",
                sellFor: "R3,500–R5,000",
                margin: "R1,000–R2,500",
                color: "#ff00cc",
                features: ["1 Social Account", "AI Content (10 posts/mo)", "Basic Analytics", "WhatsApp Bot", "Monthly Report"],
              },
              {
                name: "GROWTH",
                yourCost: "R5,500",
                sellFor: "R7,500–R12,000",
                margin: "R2,000–R6,500",
                color: "#00ffff",
                popular: true,
                features: ["3 Social Accounts", "AI Content (30 posts/mo)", "Full Analytics", "AI Video (5/mo)", "Competitor Analysis", "Priority Support"],
              },
              {
                name: "COMMAND CENTRE",
                yourCost: "R9,500",
                sellFor: "R15,000–R25,000",
                margin: "R5,500–R15,500",
                color: "#ff66ff",
                features: ["Unlimited Accounts", "Unlimited AI Content", "RAG Brain", "Unlimited AI Video", "DenchClaw CRM", "White-label Portal", "Monthly Strategy Call"],
              },
            ].map((plan) => (
              <ScrollSection key={plan.name}>
                <motion.div
                  className="rounded-2xl p-6 border relative"
                  style={{
                    background: plan.popular ? `${plan.color}11` : "rgba(5,0,8,0.8)",
                    borderColor: plan.popular ? plan.color : `${plan.color}44`,
                    boxShadow: plan.popular ? `0 0 40px ${plan.color}22` : "none",
                  }}
                  whileHover={{ y: -6 }}
                >
                  {plan.popular && (
                    <div
                      className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold font-orbitron"
                      style={{ background: plan.color, color: "#000" }}
                    >
                      MOST POPULAR
                    </div>
                  )}
                  <div className="font-orbitron text-xs font-bold mb-4" style={{ color: plan.color }}>{plan.name}</div>
                  <div className="mb-4">
                    <div className="text-xs text-gray-500 mb-1">You pay</div>
                    <div className="font-orbitron text-2xl font-black text-white">{plan.yourCost}<span className="text-sm text-gray-500">/mo</span></div>
                  </div>
                  <div className="mb-4 p-3 rounded-xl" style={{ background: `${plan.color}11`, border: `1px solid ${plan.color}22` }}>
                    <div className="text-xs text-gray-500 mb-1">You charge clients</div>
                    <div className="font-orbitron text-lg font-black" style={{ color: plan.color }}>{plan.sellFor}</div>
                    <div className="text-xs text-green-400 mt-1">Margin: {plan.margin}/client</div>
                  </div>
                  <div className="space-y-2 mb-6">
                    {plan.features.map((f) => (
                      <div key={f} className="flex items-center gap-2 font-rajdhani text-sm text-gray-300">
                        <Check className="w-3 h-3 flex-shrink-0" style={{ color: plan.color }} />
                        {f}
                      </div>
                    ))}
                  </div>
                  <Link href="/dashboard">
                    <button
                      className="w-full font-orbitron text-xs font-bold py-3 rounded-xl"
                      style={{
                        background: plan.popular ? plan.color : "transparent",
                        color: plan.popular ? "#000" : plan.color,
                        border: `1px solid ${plan.color}`,
                      }}
                    >
                      GET STARTED →
                    </button>
                  </Link>
                </motion.div>
              </ScrollSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(255,0,204,0.15) 0%, rgba(0,0,0,0) 50%, rgba(0,255,255,0.08) 100%)" }} />
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="relative z-10 container mx-auto px-6 text-center">
          <ScrollSection>
            <h2 className="font-orbitron text-4xl lg:text-6xl font-black text-white mb-6 leading-tight">
              READY TO BUILD<br />
              <span className="neon-pink">AFRICA'S MOST</span><br />
              POWERFUL AI PLATFORM?
            </h2>
            <p className="font-rajdhani text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
              Join the StudEx D#VOP$ Agentic Lab. Get access to the full platform,
              the white-label infrastructure, and the team that built it.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <button
                  className="font-orbitron text-sm font-bold text-white px-10 py-5 rounded-xl flex items-center gap-2 mx-auto"
                  style={{ background: "linear-gradient(135deg, #ff00cc, #cc00ff)", boxShadow: "0 0 40px rgba(255,0,204,0.5)" }}
                >
                  <Zap className="w-5 h-5" />
                  LAUNCH YOUR COMMAND CENTRE
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
            </div>
          </ScrollSection>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="py-8 border-t text-center"
        style={{ borderColor: "rgba(255,0,204,0.2)", background: "rgba(5,0,8,0.9)" }}
      >
        <div className="font-orbitron text-xs text-gray-600">
          NEXUS SOCIAL — STUDEX D#VOP$ AGENTIC LAB © 2026
        </div>
        <div className="font-rajdhani text-xs text-gray-700 mt-1">
          Africa's AI Command Centre · Built in South Africa · For the World
        </div>
      </footer>
    </div>
  );
}
