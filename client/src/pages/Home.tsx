import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, Float, MeshDistortMaterial, Sphere, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { motion, type Variants, type Transition } from "framer-motion";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  Zap, Brain, Globe, MessageSquare, BarChart3, Layers,
  ArrowRight, ChevronDown, Bot, Rocket, Shield, Users,
  Instagram, Facebook, ShoppingBag, Code2, Cpu, Network
} from "lucide-react";

// ─── 3D Scene Components ────────────────────────────────────────────────────

function NeuralOrb({ position, color, speed = 1, distort = 0.4 }: {
  position: [number, number, number];
  color: string;
  speed?: number;
  distort?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2 * speed;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3 * speed;
    }
  });
  return (
    <Float speed={speed} rotationIntensity={0.5} floatIntensity={1.5}>
      <Sphere ref={meshRef} args={[1, 64, 64]} position={position}>
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={distort}
          speed={2}
          roughness={0.1}
          metalness={0.8}
          transparent
          opacity={0.85}
        />
      </Sphere>
    </Float>
  );
}

function ParticleField() {
  const count = 800;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 40;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 40;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 40;
    }
    return arr;
  }, []);

  const pointsRef = useRef<THREE.Points>(null);
  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.02;
      pointsRef.current.rotation.x = state.clock.elapsedTime * 0.01;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.06} color="#a855f7" transparent opacity={0.7} sizeAttenuation />
    </points>
  );
}

function NeuralNetwork() {
  const groupRef = useRef<THREE.Group>(null);
  const nodes = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      x: Math.cos((i / 12) * Math.PI * 2) * 3,
      y: Math.sin((i / 12) * Math.PI * 2) * 3,
      z: (Math.random() - 0.5) * 2,
    }));
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {nodes.map((node, i) => (
        <mesh key={i} position={[node.x, node.y, node.z]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={2} />
        </mesh>
      ))}
    </group>
  );
}

function HeroScene() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={2} color="#a855f7" />
      <pointLight position={[-10, -10, -10]} intensity={1} color="#06b6d4" />
      <pointLight position={[0, 0, 5]} intensity={1.5} color="#ec4899" />
      <Stars radius={80} depth={50} count={3000} factor={4} saturation={0.5} fade speed={1} />
      <ParticleField />
      <NeuralNetwork />
      <NeuralOrb position={[0, 0, 0]} color="#7c3aed" speed={0.8} distort={0.5} />
      <NeuralOrb position={[4, 2, -2]} color="#0891b2" speed={1.2} distort={0.3} />
      <NeuralOrb position={[-4, -1, -1]} color="#be185d" speed={0.6} distort={0.6} />
      <NeuralOrb position={[2, -3, 1]} color="#059669" speed={1.0} distort={0.4} />
    </>
  );
}

// ─── Static UI Components ────────────────────────────────────────────────────

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.7, ease: "easeOut" } as Transition,
  }),
};

const features = [
  { icon: Brain, title: "AI Command Centre", desc: "Unified intelligence hub for all your social channels with real-time AI insights and automated decision-making.", color: "from-purple-500 to-violet-600" },
  { icon: Bot, title: "WhatsApp & Instagram Bots", desc: "DeepSeek-powered chatbots that handle customer queries, qualify leads, and drive sales 24/7 automatically.", color: "from-cyan-500 to-blue-600" },
  { icon: BarChart3, title: "Deep Analytics Engine", desc: "360° business intelligence — ad spend, ROAS, engagement rates, audience demographics, and competitor benchmarks.", color: "from-pink-500 to-rose-600" },
  { icon: Layers, title: "Content Studio", desc: "AI-generated posts, captions, and visuals tailored to your brand voice, scheduled and published automatically.", color: "from-emerald-500 to-teal-600" },
  { icon: ShoppingBag, title: "Shopify Integration", desc: "Sync your product catalogue, track sales attribution, and auto-generate product posts from your store.", color: "from-orange-500 to-amber-600" },
  { icon: Network, title: "MCP Server & OpenClaw", desc: "Self-hosted AI agent infrastructure that connects all your tools, platforms, and data sources into one brain.", color: "from-indigo-500 to-purple-600" },
];

const agenticProducts = [
  { icon: Rocket, name: "Nexus Social", tag: "Social Media Intelligence", desc: "The AI command centre for social media — analytics, automation, chatbots, and content generation in one platform.", status: "Live" },
  { icon: Globe, name: "Nexus Insights", tag: "Business Intelligence", desc: "Deep business analysis from any website URL — SEO, tech stack, competitive analysis, and market positioning.", status: "Live" },
  { icon: MessageSquare, name: "Nexus Chat", tag: "Conversational AI", desc: "WhatsApp and Instagram AI chatbots powered by DeepSeek intelligence for sales, support, and lead generation.", status: "Beta" },
  { icon: Code2, name: "Nexus Build", tag: "SaaS Development", desc: "Custom SaaS solutions built by our Agentic Lab — from concept to deployed product in weeks, not months.", status: "Available" },
];

const integrations = [
  { name: "Facebook", icon: Facebook, color: "#1877F2" },
  { name: "Instagram", icon: Instagram, color: "#E4405F" },
  { name: "WhatsApp", icon: MessageSquare, color: "#25D366" },
  { name: "Shopify", icon: ShoppingBag, color: "#96BF48" },
  { name: "OpenClaw", icon: Cpu, color: "#a855f7" },
  { name: "Google Ads", icon: BarChart3, color: "#4285F4" },
];

// ─── Main Component ──────────────────────────────────────────────────────────

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-[#030712] text-white overflow-x-hidden">

      {/* ── Navigation ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-xl bg-black/20 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">Nexus<span className="text-purple-400">Social</span></span>
          <span className="text-xs text-white/30 ml-1">by Agentic Lab</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#products" className="hover:text-white transition-colors">Products</a>
          <a href="#integrations" className="hover:text-white transition-colors">Integrations</a>
          <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
        </div>
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link href="/dashboard">
              <button className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-sm font-medium transition-all">
                Dashboard →
              </button>
            </Link>
          ) : (
            <>
              <a href={getLoginUrl()} className="text-sm text-white/60 hover:text-white transition-colors">Sign in</a>
              <a href={getLoginUrl()} className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-sm font-medium transition-all shadow-lg shadow-purple-500/25">
                Get Started Free
              </a>
            </>
          )}
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* 3D Canvas */}
        <div className="absolute inset-0">
          <Canvas camera={{ position: [0, 0, 8], fov: 60 }} gl={{ antialias: true, alpha: true }}>
            <Suspense fallback={null}>
              <HeroScene />
            </Suspense>
          </Canvas>
        </div>

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#030712]/20 to-[#030712]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#030712]/60 via-transparent to-[#030712]/60" />

        {/* Hero Content */}
        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-purple-300 mb-8 backdrop-blur-sm"
          >
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            Agentic Lab — Building the Future of AI SaaS
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={1}
            className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-tight"
          >
            The AI{" "}
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Command Centre
            </span>
            <br />for Social Media
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={2}
            className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Nexus Social is the flagship product of our Agentic Lab — a fully automated social media intelligence platform with AI chatbots, deep analytics, content generation, and MCP server infrastructure.
          </motion.p>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={3}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <a
              href={isAuthenticated ? "/dashboard" : getLoginUrl()}
              className="group flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 font-semibold text-lg transition-all shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105"
            >
              Launch Command Centre
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#features"
              className="flex items-center gap-2 px-8 py-4 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 font-medium text-white/80 hover:text-white transition-all backdrop-blur-sm"
            >
              Explore Features
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={4}
            className="flex items-center justify-center gap-12 mt-16 text-center"
          >
            {[
              { value: "R715K+", label: "Ad Spend Managed" },
              { value: "85K+", label: "Instagram Followers" },
              { value: "6+", label: "Platform Integrations" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-black text-white">{stat.value}</div>
                <div className="text-xs text-white/40 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/30"
        >
          <ChevronDown className="w-6 h-6" />
        </motion.div>
      </section>

      {/* ── Features Section ── */}
      <section id="features" className="py-32 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-950/10 to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-20"
          >
            <span className="text-sm text-purple-400 font-medium tracking-widest uppercase">Platform Capabilities</span>
            <h2 className="text-4xl md:text-5xl font-black mt-4 mb-6">
              Everything your social media<br />
              <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">engine needs</span>
            </h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">
              Built by the Agentic Lab — a team that uses every tool we build, constantly improving through real-world experience.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i * 0.5}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group relative p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-white/10 backdrop-blur-sm transition-all cursor-default overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-white">{feature.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Agentic Lab Products ── */}
      <section id="products" className="py-32 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-20"
          >
            <span className="text-sm text-cyan-400 font-medium tracking-widest uppercase">Agentic Lab Portfolio</span>
            <h2 className="text-4xl md:text-5xl font-black mt-4 mb-6">
              SaaS solutions built for<br />
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">real businesses</span>
            </h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">
              We build and use every product ourselves first, gaining real experience before selling to clients. This is how we guarantee results.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {agenticProducts.map((product, i) => (
              <motion.div
                key={product.name}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i * 0.3}
                whileHover={{ y: -6 }}
                className="group relative p-8 rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.07] hover:border-purple-500/30 transition-all overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-48 h-48 bg-purple-600/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-purple-600/10 transition-colors" />
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600/30 to-cyan-600/30 border border-white/10 flex items-center justify-center">
                    <product.icon className="w-7 h-7 text-white" />
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                    product.status === "Live" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
                    product.status === "Beta" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
                    "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  }`}>
                    {product.status}
                  </span>
                </div>
                <div className="text-xs text-purple-400 font-medium mb-1">{product.tag}</div>
                <h3 className="text-xl font-bold mb-3 text-white">{product.name}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{product.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Integrations ── */}
      <section id="integrations" className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-950/10 to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <span className="text-sm text-pink-400 font-medium tracking-widest uppercase">Integrations</span>
            <h2 className="text-4xl md:text-5xl font-black mt-4 mb-6">
              Connects to everything<br />
              <span className="bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent">you already use</span>
            </h2>
          </motion.div>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-12">
            {integrations.map((integration, i) => (
              <motion.div
                key={integration.name}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i * 0.2}
                whileHover={{ scale: 1.1, y: -4 }}
                className="flex items-center gap-3 px-5 py-3 rounded-xl bg-white/[0.04] border border-white/[0.07] hover:border-white/15 transition-all cursor-default"
              >
                <integration.icon className="w-5 h-5" style={{ color: integration.color }} />
                <span className="text-sm font-medium text-white/80">{integration.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Agentic Lab ── */}
      <section className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
            >
              <span className="text-sm text-emerald-400 font-medium tracking-widest uppercase">Why Agentic Lab</span>
              <h2 className="text-4xl md:text-5xl font-black mt-4 mb-6 leading-tight">
                We build what we<br />
                <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">use ourselves</span>
              </h2>
              <p className="text-white/60 text-lg leading-relaxed mb-8">
                Every product in our portfolio is battle-tested on real businesses — including StudEx Meat, our own brand with R715K+ in managed ad spend and 85K+ Instagram followers. We do not sell theory. We sell proven systems.
              </p>
              <div className="space-y-4">
                {[
                  { icon: Shield, text: "Built on real business data — not demos" },
                  { icon: Rocket, text: "Continuously improved through live usage" },
                  { icon: Users, text: "Sold to clients only after we prove it works" },
                  { icon: Cpu, text: "Powered by DeepSeek intelligence + MCP infrastructure" },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-3 text-white/70">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-4 h-4 text-emerald-400" />
                    </div>
                    <span className="text-sm">{item.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={1}
              className="relative h-80 rounded-3xl overflow-hidden border border-white/10"
            >
              <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[5, 5, 5]} intensity={2} color="#10b981" />
                <pointLight position={[-5, -5, 5]} intensity={1} color="#06b6d4" />
                <Stars radius={30} depth={20} count={1000} factor={3} fade />
                <NeuralOrb position={[0, 0, 0]} color="#059669" speed={0.5} distort={0.6} />
                <NeuralOrb position={[2, 1, -1]} color="#0891b2" speed={0.8} distort={0.3} />
                <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1} />
              </Canvas>
              <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="text-xs text-white/40 mb-1">Live Platform Data</div>
                <div className="text-2xl font-black text-white">StudEx Meat</div>
                <div className="text-sm text-emerald-400">R715,469 total ad spend · 85K followers</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950/30 via-transparent to-cyan-950/30 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
              Ready to launch your<br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">AI command centre?</span>
            </h2>
            <p className="text-white/50 text-lg mb-10">
              Join the Agentic Lab ecosystem. Get access to Nexus Social, our MCP server infrastructure, AI chatbots, and the full social media engine.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={isAuthenticated ? "/dashboard" : getLoginUrl()}
                className="group flex items-center gap-2 px-10 py-5 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 font-bold text-xl transition-all shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105"
              >
                Start for Free
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </a>
              <Link href="/pricing">
                <button className="px-10 py-5 rounded-2xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 font-semibold text-lg text-white/80 hover:text-white transition-all">
                  View Pricing
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-bold text-white">Nexus Social</div>
              <div className="text-xs text-white/30">by Agentic Lab</div>
            </div>
          </div>
          <div className="text-sm text-white/30">
            © 2026 Agentic Lab. Building AI SaaS solutions that actually work.
          </div>
          <div className="flex items-center gap-6 text-sm text-white/40">
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
