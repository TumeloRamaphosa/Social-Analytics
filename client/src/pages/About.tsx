import { motion } from "framer-motion";
import { Brain, Zap, Shield, Globe, ArrowRight, Star, Network, Code, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const NEON_PINK = "#ff00cc";
const NEON_CYAN = "#00ffff";
const NEON_PURPLE = "#9900ff";
const NEON_GREEN = "#00ff88";
const NEON_YELLOW = "#ffcc00";

export default function About() {
  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #050008 0%, #0a0015 50%, #050008 100%)", fontFamily: "'Rajdhani', sans-serif" }}>

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-pink-500/10 bg-black/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <span className="font-orbitron text-white font-black text-lg cursor-pointer" style={{ textShadow: `0 0 20px ${NEON_PINK}` }}>
              STUDEX <span style={{ color: NEON_PINK }}>D#VOP$</span>
            </span>
          </Link>
          <div className="flex gap-6 text-sm font-rajdhani text-gray-400">
            <Link href="/"><span className="hover:text-white cursor-pointer transition-colors">Home</span></Link>
            <Link href="/pricing"><span className="hover:text-white cursor-pointer transition-colors">Pricing</span></Link>
            <Link href="/dashboard"><span className="cursor-pointer transition-colors" style={{ color: NEON_PINK }}>Dashboard</span></Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "linear-gradient(rgba(255,0,204,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,0,204,0.3) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <Badge className="mb-6 font-rajdhani text-sm px-4 py-2" style={{ background: `${NEON_PURPLE}20`, color: NEON_PURPLE, border: `1px solid ${NEON_PURPLE}40` }}>
              ABOUT THE LAB
            </Badge>
            <h1 className="font-orbitron text-4xl md:text-6xl font-black text-white mb-6" style={{ textShadow: `0 0 40px ${NEON_PINK}60` }}>
              STUDEX <span style={{ color: NEON_PINK }}>DEVOPS</span><br />AGENTIC LAB
            </h1>
            <p className="text-gray-300 text-lg md:text-xl max-w-3xl mx-auto font-rajdhani leading-relaxed">
              We are not a digital marketing agency. We are not a software house. We are an <strong style={{ color: NEON_CYAN }}>Agentic Lab</strong> — a South African AI engineering studio that designs, trains, and deploys intelligent systems for businesses that want to operate at the speed of the future.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Founder's Soul */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="text-center mb-12">
              <h2 className="font-orbitron text-3xl font-black text-white mb-4">
                THE <span style={{ color: NEON_PURPLE }}>FOUNDER'S SOUL</span>
              </h2>
              <p className="text-gray-400 font-rajdhani text-lg max-w-2xl mx-auto">
                The ideation and structural foundation for our RAG, agents, and long-term vision
              </p>
            </div>

            <div className="p-8 rounded-2xl border relative overflow-hidden" style={{ background: "rgba(153,0,255,0.05)", borderColor: `${NEON_PURPLE}30` }}>
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 blur-3xl" style={{ background: NEON_PURPLE }} />
              <blockquote className="text-white font-rajdhani text-xl md:text-2xl leading-relaxed italic mb-6 relative z-10" style={{ borderLeft: `4px solid ${NEON_PINK}`, paddingLeft: "1.5rem" }}>
                "The future of business is not about working harder. It is about building systems that work for you — systems that remember, learn, and act on your behalf while you focus on what only humans can do: vision, relationships, and creativity."
              </blockquote>
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-orbitron font-black text-sm" style={{ background: `linear-gradient(135deg, ${NEON_PINK}, ${NEON_PURPLE})` }}>TR</div>
                <div>
                  <div className="text-white font-rajdhani font-bold">Tumelo Ramaphosa</div>
                  <div className="text-gray-400 text-sm font-rajdhani">Founder, StudEx DevOps Agentic Lab</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Core Philosophy */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-orbitron text-3xl font-black text-white mb-4">
              OUR <span style={{ color: NEON_CYAN }}>CORE BELIEFS</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { icon: Code, color: NEON_PINK, title: "Build for Ourselves First", desc: "We never sell something we haven't used ourselves. StudEx Meat is our test bed. Nexus Social is our proof of concept. Every tool we offer has been battle-tested on our own business." },
              { icon: Shield, color: NEON_CYAN, title: "Privacy and Sovereignty", desc: "Our RAG runs locally. Our clients' data stays on their infrastructure. We do not send sensitive business data to third-party AI providers without explicit consent." },
              { icon: Zap, color: NEON_GREEN, title: "Compound Value", desc: "Every tool we build gets better over time. We design for compounding — the longer you use it, the more valuable it becomes. This is our moat and our clients' competitive advantage." },
              { icon: Users, color: NEON_YELLOW, title: "Teach, Don't Just Deliver", desc: "We want our clients to understand what we build for them. An informed client is a better client. We document everything, explain every decision, and train every team." },
              { icon: Globe, color: NEON_PURPLE, title: "South African Excellence", desc: "We are building world-class AI infrastructure from South Africa, for South African businesses first, and then for the world. Local context, global standards." },
              { icon: Brain, color: NEON_PINK, title: "Context Is Everything", desc: "The companies that win in the AI era will not be the ones with the most data — they will be the ones who can retrieve the right information at the right moment and act on it intelligently." },
            ].map((item, i) => (
              <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Card className="border h-full" style={{ background: `${item.color}08`, borderColor: `${item.color}25` }}>
                  <CardContent className="p-6">
                    <div className="p-3 rounded-xl w-fit mb-4" style={{ background: `${item.color}20` }}>
                      <item.icon className="w-5 h-5" style={{ color: item.color }} />
                    </div>
                    <h3 className="font-orbitron text-white font-bold text-sm mb-3">{item.title}</h3>
                    <p className="text-gray-400 font-rajdhani text-sm leading-relaxed">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Build */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-orbitron text-3xl font-black text-white mb-4">
              WHAT WE <span style={{ color: NEON_GREEN }}>BUILD</span>
            </h2>
            <p className="text-gray-400 font-rajdhani text-lg">Beyond Nexus Social, the Agentic Lab builds custom AI solutions for clients</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { emoji: "🧠", title: "Custom RAG Systems", desc: "Private knowledge bases for specific industries — legal, medical, retail, logistics. Your data, your intelligence, your competitive advantage.", color: NEON_PURPLE },
              { emoji: "⚙️", title: "N8N Automation Workflows", desc: "Connect your existing business tools into intelligent pipelines. From CRM to WhatsApp to email — fully automated and AI-powered.", color: NEON_CYAN },
              { emoji: "🤖", title: "AI Chatbots", desc: "WhatsApp and Instagram bots powered by DeepSeek Intelligence. Trained on your brand, your products, and your customer data.", color: NEON_PINK },
              { emoji: "🔌", title: "MCP Server Builds", desc: "Connect AI agents to your business data through custom Model Context Protocol servers. Give your agents real-time access to everything.", color: NEON_GREEN },
              { emoji: "📊", title: "Social Intelligence", desc: "Deep analytics, automated reporting, and AI-generated insights across Facebook, Instagram, WhatsApp, and Shopify.", color: NEON_YELLOW },
              { emoji: "🎓", title: "AI Training & Workshops", desc: "Teach your team to work with AI agents effectively. From prompt engineering to RAG setup — we train the humans too.", color: NEON_PURPLE },
            ].map((item, i) => (
              <motion.div key={item.title} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Card className="border h-full hover:scale-105 transition-transform cursor-default" style={{ background: `${item.color}08`, borderColor: `${item.color}25` }}>
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-4">{item.emoji}</div>
                    <h3 className="font-orbitron text-white font-bold text-sm mb-3">{item.title}</h3>
                    <p className="text-gray-400 font-rajdhani text-sm leading-relaxed">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* RAG Foundation */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="p-8 md:p-12 rounded-2xl border relative overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(255,0,204,0.05), rgba(153,0,255,0.05))", borderColor: `${NEON_PINK}30` }}>
            <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: NEON_PINK }} />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <Network className="w-6 h-6" style={{ color: NEON_PINK }} />
                <h2 className="font-orbitron text-2xl font-black text-white">
                  THE <span style={{ color: NEON_PINK }}>RAG FOUNDATION</span>
                </h2>
              </div>
              <p className="text-gray-300 font-rajdhani text-lg leading-relaxed mb-6">
                Our RAG system is not a feature. It is the <strong style={{ color: NEON_CYAN }}>foundation</strong> of everything we build. Every client who works with StudEx DevOps Agentic Lab gets their own private RAG system as part of our service. We set up their knowledge base, connect their communication channels, configure their AI agents, and train them on how to use it.
              </p>
              <p className="text-gray-300 font-rajdhani text-lg leading-relaxed mb-8">
                The RAG becomes the brain of their entire AI infrastructure — the foundation that makes every other AI tool we build for them smarter, more contextual, and more valuable over time. <strong style={{ color: NEON_PINK }}>This is our core differentiator. No other agency in South Africa is building this at this level.</strong>
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/dashboard">
                  <Button className="font-rajdhani font-bold" style={{ background: `linear-gradient(135deg, ${NEON_PINK}, ${NEON_PURPLE})` }}>
                    Enter the Platform <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button variant="outline" className="font-rajdhani border-pink-500/30 text-pink-400 hover:bg-pink-500/10">
                    View Pricing <Star className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-pink-500/10">
        <div className="max-w-5xl mx-auto text-center">
          <div className="font-orbitron text-white font-black text-xl mb-3" style={{ textShadow: `0 0 20px ${NEON_PINK}` }}>
            STUDEX <span style={{ color: NEON_PINK }}>D#VOP$</span>
          </div>
          <p className="text-gray-500 font-rajdhani text-sm">
            © 2026 StudEx DevOps Agentic Lab. Built in South Africa. Powered by DeepSeek Intelligence.
          </p>
        </div>
      </footer>
    </div>
  );
}
