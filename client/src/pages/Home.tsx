import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Zap, Brain, Globe, BarChart3, MessageSquare, Bot,
  ArrowRight, ChevronDown, Shield, Cpu, Sparkles,
  TrendingUp, Users, Target, Play
} from "lucide-react";

const BULL_CDN = "https://d2xsxph8kpxj0f.cloudfront.net/310419663029659263/fYpX8oULM7FHcETfXDebgF/studex-bull-logo_b0ef99c2.jpeg";

// Glitch text component
function GlitchText({ children, className = "" }: { children: string; className?: string }) {
  return (
    <span className={`relative inline-block ${className}`} data-text={children}>
      <span className="glitch-main">{children}</span>
    </span>
  );
}

// Animated counter
function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const duration = 2000;
        const steps = 60;
        const increment = target / steps;
        let current = 0;
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            setCount(target);
            clearInterval(timer);
          } else {
            setCount(Math.floor(current));
          }
        }, duration / steps);
      }
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// Neon grid background
function NeonGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Dark base */}
      <div className="absolute inset-0 bg-[#050008]" />
      {/* Grid lines */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,0,200,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,0,200,0.3) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />
      {/* Perspective grid at bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-64 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,0,200,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,0,200,0.5) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          transform: "perspective(400px) rotateX(60deg)",
          transformOrigin: "bottom center",
        }}
      />
      {/* Radial glow from centre */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,rgba(255,0,180,0.12),transparent)]" />
      {/* Top cyan accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60" />
    </div>
  );
}

// Floating neon particles
function Particles() {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 8 + 4,
    delay: Math.random() * 4,
    color: i % 3 === 0 ? "#ff00cc" : i % 3 === 1 ? "#00ffff" : "#ff66ff",
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            boxShadow: `0 0 ${p.size * 4}px ${p.color}`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.3, 1, 0.3],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

const features = [
  {
    icon: Brain,
    title: "AI Intelligence Engine",
    desc: "DeepSeek-powered analysis that reads your entire social media presence and delivers actionable insights in seconds.",
    color: "#ff00cc",
  },
  {
    icon: Bot,
    title: "WhatsApp & Instagram Bots",
    desc: "24/7 AI chatbots that handle customer queries, qualify leads, and drive sales while you sleep.",
    color: "#00ffff",
  },
  {
    icon: BarChart3,
    title: "Deep Analytics",
    desc: "Full 360° view of your Facebook, Instagram, ad spend, ROAS, and audience demographics in one command centre.",
    color: "#ff66ff",
  },
  {
    icon: Globe,
    title: "Business Intelligence",
    desc: "Paste any website URL and receive a complete competitive intelligence report in under 60 seconds.",
    color: "#ff00cc",
  },
  {
    icon: Sparkles,
    title: "AI Content Studio",
    desc: "Generate scroll-stopping posts, captions, and campaigns tailored to your brand voice and audience.",
    color: "#00ffff",
  },
  {
    icon: Cpu,
    title: "MCP Server Infrastructure",
    desc: "Enterprise-grade API layer connecting your entire marketing stack — Shopify, Meta, Google Ads, WhatsApp.",
    color: "#ff66ff",
  },
];

const stats = [
  { value: 715469, suffix: "+", label: "Ad Spend Managed (ZAR)", icon: TrendingUp },
  { value: 85208, suffix: "+", label: "Instagram Followers Tracked", icon: Users },
  { value: 12, suffix: "", label: "MCP Tools Available", icon: Cpu },
  { value: 6, suffix: "+", label: "Platform Integrations", icon: Target },
];

const plans = [
  {
    name: "STARTER",
    price: "R999",
    period: "/mo",
    desc: "Perfect for solo brands",
    features: ["1 Social Account", "AI Content Generation", "Basic Analytics", "WhatsApp Bot"],
    color: "#ff00cc",
    popular: false,
  },
  {
    name: "PRO",
    price: "R2,499",
    period: "/mo",
    desc: "For growing businesses",
    features: ["5 Social Accounts", "Full Analytics Suite", "AI Chatbots (WA + IG)", "Shopify Integration", "MCP Server Access"],
    color: "#00ffff",
    popular: true,
  },
  {
    name: "AGENCY",
    price: "R7,999",
    period: "/mo",
    desc: "White-label for agencies",
    features: ["Unlimited Clients", "White-label Dashboard", "Google Ads Integration", "RAG Knowledge Base", "Priority Support", "Custom MCP Tools"],
    color: "#ff66ff",
    popular: false,
  },
];

export default function Home() {
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, -120]);
  const bullScale = useTransform(scrollY, [0, 400], [1, 1.08]);
  const bullOpacity = useTransform(scrollY, [0, 500], [1, 0.4]);
  const [videoPlaying, setVideoPlaying] = useState(false);

  return (
    <div className="min-h-screen bg-[#050008] text-white overflow-x-hidden">
      {/* ─── GLOBAL STYLES ─── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@400;600;700&display=swap');

        .font-orbitron { font-family: 'Orbitron', monospace; }
        .font-rajdhani { font-family: 'Rajdhani', sans-serif; }

        .glitch-main {
          position: relative;
          color: #ff00cc;
          text-shadow: 0 0 20px #ff00cc, 0 0 40px #ff00cc88;
        }
        .glitch-main::before,
        .glitch-main::after {
          content: attr(data-text);
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
        }
        [data-text]::before {
          content: attr(data-text);
          position: absolute;
          top: 0; left: 0;
          color: #00ffff;
          clip-path: polygon(0 0, 100% 0, 100% 35%, 0 35%);
          animation: glitch-top 3s infinite;
          text-shadow: 2px 0 #00ffff;
          opacity: 0.8;
        }
        [data-text]::after {
          content: attr(data-text);
          position: absolute;
          top: 0; left: 0;
          color: #ff66ff;
          clip-path: polygon(0 65%, 100% 65%, 100% 100%, 0 100%);
          animation: glitch-bottom 3s infinite;
          text-shadow: -2px 0 #ff66ff;
          opacity: 0.8;
        }
        @keyframes glitch-top {
          0%, 90%, 100% { transform: translate(0); }
          92% { transform: translate(-3px, -1px); }
          94% { transform: translate(3px, 1px); }
          96% { transform: translate(-1px, 0); }
        }
        @keyframes glitch-bottom {
          0%, 90%, 100% { transform: translate(0); }
          92% { transform: translate(3px, 1px); }
          94% { transform: translate(-3px, -1px); }
          96% { transform: translate(1px, 0); }
        }

        .neon-border {
          border: 1px solid rgba(255, 0, 204, 0.4);
          box-shadow: 0 0 20px rgba(255, 0, 204, 0.15), inset 0 0 20px rgba(255, 0, 204, 0.05);
        }
        .neon-border-cyan {
          border: 1px solid rgba(0, 255, 255, 0.4);
          box-shadow: 0 0 20px rgba(0, 255, 255, 0.15), inset 0 0 20px rgba(0, 255, 255, 0.05);
        }
        .neon-btn {
          background: linear-gradient(135deg, #ff00cc, #cc00ff);
          box-shadow: 0 0 30px rgba(255, 0, 204, 0.5), 0 0 60px rgba(255, 0, 204, 0.2);
          transition: all 0.3s ease;
        }
        .neon-btn:hover {
          box-shadow: 0 0 50px rgba(255, 0, 204, 0.8), 0 0 100px rgba(255, 0, 204, 0.4);
          transform: translateY(-2px);
        }
        .neon-btn-outline {
          background: transparent;
          border: 1px solid rgba(0, 255, 255, 0.6);
          color: #00ffff;
          box-shadow: 0 0 20px rgba(0, 255, 255, 0.2);
          transition: all 0.3s ease;
        }
        .neon-btn-outline:hover {
          background: rgba(0, 255, 255, 0.1);
          box-shadow: 0 0 40px rgba(0, 255, 255, 0.5);
        }
        .bull-glow {
          filter: drop-shadow(0 0 40px rgba(255, 0, 204, 0.6)) drop-shadow(0 0 80px rgba(255, 0, 204, 0.3));
        }
        .scan-line {
          background: linear-gradient(transparent 50%, rgba(255, 0, 204, 0.03) 50%);
          background-size: 100% 4px;
          pointer-events: none;
        }
        .card-hover {
          transition: all 0.3s ease;
        }
        .card-hover:hover {
          transform: translateY(-6px);
        }
        .popular-badge {
          background: linear-gradient(135deg, #00ffff, #0088ff);
          box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
        }
      `}</style>

      {/* ─── NAVBAR ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
        style={{ background: "rgba(5, 0, 8, 0.85)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,0,204,0.2)" }}>
        <div className="flex items-center gap-3">
          <img src={BULL_CDN} alt="StudEx" className="w-10 h-10 rounded-lg object-cover" style={{ boxShadow: "0 0 15px rgba(255,0,204,0.5)" }} />
          <div>
            <div className="font-orbitron text-sm font-bold text-white leading-none">NEXUS SOCIAL</div>
            <div className="font-rajdhani text-xs text-pink-400 leading-none">by StudEx D#VOP$</div>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {["Features", "Analytics", "Pricing", "Agentic Lab"].map((item) => (
            <a key={item} href={`#${item.toLowerCase().replace(" ", "-")}`}
              className="font-rajdhani text-sm text-gray-400 hover:text-pink-400 transition-colors tracking-wider uppercase">
              {item}
            </a>
          ))}
        </div>
        <Link href="/dashboard">
          <button className="neon-btn font-orbitron text-xs font-bold text-white px-5 py-2 rounded-lg">
            LAUNCH →
          </button>
        </Link>
      </nav>

      {/* ─── HERO SECTION ─── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <NeonGrid />
        <Particles />
        {/* Scan line overlay */}
        <div className="absolute inset-0 scan-line opacity-30 pointer-events-none" />

        <div className="relative z-10 container mx-auto px-6 flex flex-col lg:flex-row items-center gap-12 lg:gap-0">
          {/* Left — Text */}
          <motion.div
            className="flex-1 text-center lg:text-left"
            style={{ y: heroY }}
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Badge */}
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 font-rajdhani text-xs tracking-widest uppercase"
              style={{ background: "rgba(255,0,204,0.1)", border: "1px solid rgba(255,0,204,0.4)", color: "#ff00cc" }}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
              Agentic Lab — AI SaaS Command Centre
            </motion.div>

            {/* Headline */}
            <h1 className="font-orbitron font-black leading-none mb-6">
              <div className="text-4xl lg:text-6xl text-white mb-2">THE AI</div>
              <div className="text-5xl lg:text-7xl mb-2">
                <GlitchText>COMMAND</GlitchText>
              </div>
              <div className="text-4xl lg:text-6xl text-white">CENTRE</div>
            </h1>

            <p className="font-rajdhani text-lg text-gray-300 mb-8 max-w-lg leading-relaxed">
              The flagship product of <span className="text-pink-400 font-bold">StudEx D#VOP$ Agentic Lab</span> — 
              a fully automated social media intelligence platform with AI chatbots, deep analytics, 
              content generation, and MCP server infrastructure.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/dashboard">
                <button className="neon-btn font-orbitron text-sm font-bold text-white px-8 py-4 rounded-xl flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  LAUNCH COMMAND CENTRE
                </button>
              </Link>
              <button className="neon-btn-outline font-orbitron text-sm font-bold px-8 py-4 rounded-xl flex items-center gap-2">
                <Play className="w-4 h-4" />
                WATCH DEMO
              </button>
            </div>

            {/* Mini stats */}
            <div className="flex gap-8 mt-10 justify-center lg:justify-start">
              {[
                { val: "R715K+", label: "Ad Spend" },
                { val: "85K+", label: "IG Followers" },
                { val: "6+", label: "Platforms" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className="font-orbitron text-xl font-black text-pink-400">{s.val}</div>
                  <div className="font-rajdhani text-xs text-gray-500 uppercase tracking-wider">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — Bull Hero Image */}
          <motion.div
            className="flex-1 flex items-center justify-center relative"
            style={{ scale: bullScale, opacity: bullOpacity }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
          >
            {/* Outer glow rings */}
            <div className="absolute w-[500px] h-[500px] rounded-full"
              style={{ background: "radial-gradient(circle, rgba(255,0,204,0.15) 0%, transparent 70%)", animation: "pulse 3s ease-in-out infinite" }} />
            <div className="absolute w-[400px] h-[400px] rounded-full border border-pink-500/20 animate-spin"
              style={{ animationDuration: "20s" }} />
            <div className="absolute w-[340px] h-[340px] rounded-full border border-cyan-500/20 animate-spin"
              style={{ animationDuration: "15s", animationDirection: "reverse" }} />

            {/* Bull image */}
            <motion.img
              src={BULL_CDN}
              alt="StudEx D#VOP$ — Cyberpunk Bull"
              className="bull-glow relative z-10 w-72 h-72 lg:w-96 lg:h-96 object-cover rounded-2xl"
              style={{ border: "2px solid rgba(255,0,204,0.5)" }}
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Floating data cards */}
            <motion.div
              className="absolute top-8 right-0 neon-border rounded-xl px-4 py-3 text-xs font-rajdhani"
              style={{ background: "rgba(5,0,8,0.9)" }}
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
            >
              <div className="text-pink-400 font-bold">LIVE ANALYTICS</div>
              <div className="text-gray-400">85,208 followers tracked</div>
            </motion.div>
            <motion.div
              className="absolute bottom-12 left-0 neon-border-cyan rounded-xl px-4 py-3 text-xs font-rajdhani"
              style={{ background: "rgba(5,0,8,0.9)" }}
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: 1.2 }}
            >
              <div className="text-cyan-400 font-bold">AI CHATBOT</div>
              <div className="text-gray-400">DeepSeek Intelligence</div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="font-rajdhani text-xs text-gray-500 tracking-widest uppercase">Scroll</span>
          <ChevronDown className="w-4 h-4 text-pink-500" />
        </motion.div>
      </section>

      {/* ─── STATS BAR ─── */}
      <section className="relative py-16" style={{ background: "rgba(255,0,204,0.05)", borderTop: "1px solid rgba(255,0,204,0.2)", borderBottom: "1px solid rgba(255,0,204,0.2)" }}>
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <stat.icon className="w-6 h-6 text-pink-400 mx-auto mb-2" />
                <div className="font-orbitron text-3xl font-black text-white">
                  <Counter target={stat.value} suffix={stat.suffix} />
                </div>
                <div className="font-rajdhani text-sm text-gray-500 uppercase tracking-wider mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" className="relative py-24">
        <NeonGrid />
        <div className="relative z-10 container mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="font-rajdhani text-pink-400 text-sm tracking-widest uppercase mb-3">What We Build</div>
            <h2 className="font-orbitron text-4xl lg:text-5xl font-black text-white mb-4">
              THE <GlitchText>ARSENAL</GlitchText>
            </h2>
            <p className="font-rajdhani text-gray-400 text-lg max-w-2xl mx-auto">
              Every tool you need to dominate your social media presence, automate your marketing, and scale your business.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, i) => (
              <motion.div
                key={feat.title}
                className="neon-border rounded-2xl p-6 card-hover cursor-pointer"
                style={{ background: "rgba(5,0,8,0.8)" }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ borderColor: feat.color }}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${feat.color}22`, border: `1px solid ${feat.color}44` }}>
                  <feat.icon className="w-6 h-6" style={{ color: feat.color }} />
                </div>
                <h3 className="font-orbitron text-sm font-bold text-white mb-2">{feat.title}</h3>
                <p className="font-rajdhani text-gray-400 text-sm leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BULL SHOWCASE BANNER ─── */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(255,0,204,0.1) 0%, rgba(0,0,0,0) 50%, rgba(0,255,255,0.05) 100%)" }} />
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(255,0,200,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,0,200,0.15) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }} />
        <div className="relative z-10 container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <motion.div
              className="flex-1"
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="font-rajdhani text-pink-400 text-sm tracking-widest uppercase mb-3">Agentic Lab</div>
              <h2 className="font-orbitron text-4xl lg:text-5xl font-black text-white mb-6 leading-tight">
                WE BUILD<br /><GlitchText>AI SAAS</GlitchText><br />SOLUTIONS
              </h2>
              <p className="font-rajdhani text-gray-300 text-lg leading-relaxed mb-8 max-w-lg">
                StudEx D#VOP$ Agentic Lab is where cutting-edge AI meets real business results. 
                We build, deploy, and operate AI-powered SaaS platforms for brands that want to 
                dominate their market. Nexus Social is our flagship — and we use it ourselves first.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  "MCP Server Infrastructure",
                  "AI Chatbot Automation",
                  "Social Media Command Centre",
                  "Business Intelligence RAG",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 font-rajdhani text-sm text-gray-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-pink-500 flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
              <Link href="/dashboard">
                <button className="neon-btn font-orbitron text-sm font-bold text-white px-8 py-4 rounded-xl flex items-center gap-2">
                  EXPLORE THE LAB <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </motion.div>

            <motion.div
              className="flex-1 flex justify-center"
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="relative">
                {/* Hexagonal frame effect */}
                <div className="absolute -inset-4 rounded-3xl"
                  style={{ background: "linear-gradient(135deg, rgba(255,0,204,0.3), rgba(0,255,255,0.3))", filter: "blur(20px)" }} />
                <img
                  src={BULL_CDN}
                  alt="StudEx D#VOP$ Agentic Lab"
                  className="relative z-10 w-80 h-80 object-cover rounded-2xl"
                  style={{ border: "2px solid rgba(255,0,204,0.6)", boxShadow: "0 0 60px rgba(255,0,204,0.4)" }}
                />
                {/* Corner accents */}
                <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-pink-500 rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-cyan-400 rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-cyan-400 rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-pink-500 rounded-br-lg" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section id="pricing" className="relative py-24">
        <NeonGrid />
        <div className="relative z-10 container mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="font-rajdhani text-pink-400 text-sm tracking-widest uppercase mb-3">Pricing</div>
            <h2 className="font-orbitron text-4xl lg:text-5xl font-black text-white mb-4">
              CHOOSE YOUR <GlitchText>TIER</GlitchText>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                className={`relative rounded-2xl p-6 card-hover ${plan.popular ? "neon-border-cyan scale-105" : "neon-border"}`}
                style={{ background: "rgba(5,0,8,0.9)" }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                viewport={{ once: true }}
              >
                {plan.popular && (
                  <div className="popular-badge absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full font-orbitron text-xs font-bold text-black">
                    MOST POPULAR
                  </div>
                )}
                <div className="font-orbitron text-sm font-bold mb-1" style={{ color: plan.color }}>{plan.name}</div>
                <div className="font-rajdhani text-gray-400 text-sm mb-4">{plan.desc}</div>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="font-orbitron text-4xl font-black text-white">{plan.price}</span>
                  <span className="font-rajdhani text-gray-500">{plan.period}</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 font-rajdhani text-sm text-gray-300">
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: plan.color }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  className="w-full py-3 rounded-xl font-orbitron text-xs font-bold transition-all"
                  style={plan.popular
                    ? { background: `linear-gradient(135deg, ${plan.color}, #0088ff)`, color: "#000", boxShadow: `0 0 20px ${plan.color}66` }
                    : { border: `1px solid ${plan.color}66`, color: plan.color, background: "transparent" }
                  }
                >
                  GET STARTED
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA FOOTER ─── */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,rgba(255,0,204,0.15),transparent)]" />
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(255,0,200,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,0,200,0.2) 1px, transparent 1px)`,
          backgroundSize: "30px 30px",
        }} />
        <div className="relative z-10 container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <img src={BULL_CDN} alt="StudEx" className="w-24 h-24 rounded-2xl object-cover mx-auto mb-6 bull-glow" />
            <h2 className="font-orbitron text-4xl lg:text-6xl font-black text-white mb-4">
              READY TO <GlitchText>DOMINATE</GlitchText>?
            </h2>
            <p className="font-rajdhani text-gray-300 text-xl mb-8 max-w-2xl mx-auto">
              Join the Agentic Lab ecosystem. Automate your marketing, amplify your brand, and let AI do the heavy lifting.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <button className="neon-btn font-orbitron text-sm font-bold text-white px-10 py-4 rounded-xl flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  START FREE TRIAL
                </button>
              </Link>
              <Link href="/dashboard">
                <button className="neon-btn-outline font-orbitron text-sm font-bold px-10 py-4 rounded-xl flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  TALK TO US
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="relative py-8 border-t border-pink-900/30">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={BULL_CDN} alt="StudEx" className="w-8 h-8 rounded-lg object-cover" />
            <div>
              <div className="font-orbitron text-xs font-bold text-white">NEXUS SOCIAL</div>
              <div className="font-rajdhani text-xs text-gray-500">by StudEx D#VOP$ Agentic Lab</div>
            </div>
          </div>
          <div className="font-rajdhani text-xs text-gray-600">
            © 2026 StudEx D#VOP$ Agentic Lab. All rights reserved.
          </div>
          <div className="flex gap-6">
            {["Privacy", "Terms", "Contact"].map((item) => (
              <a key={item} href="#" className="font-rajdhani text-xs text-gray-500 hover:text-pink-400 transition-colors">{item}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
