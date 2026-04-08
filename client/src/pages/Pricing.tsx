import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  X,
  Zap,
  Shield,
  Building2,
  ChevronDown,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const plans = [
  {
    id: "starter",
    name: "Starter",
    tagline: "Launch your social intelligence",
    icon: Zap,
    monthlyPrice: 999,
    annualPrice: 799,
    currency: "R",
    color: "cyan",
    gradient: "from-cyan-500/20 to-cyan-500/5",
    border: "border-cyan-500/40",
    glow: "shadow-cyan-500/20",
    buttonClass: "bg-cyan-500 hover:bg-cyan-400 text-black",
    badge: null,
    features: {
      "Social Media Analytics": [
        { name: "Facebook & Instagram analytics", included: true },
        { name: "Post performance tracking", included: true },
        { name: "Follower growth charts", included: true },
        { name: "Engagement rate analysis", included: true },
        { name: "Audience demographics", included: false },
        { name: "Competitor benchmarking", included: false },
      ],
      "Content Management": [
        { name: "AI content generation (50 posts/mo)", included: true },
        { name: "Content calendar", included: true },
        { name: "Post scheduling", included: true },
        { name: "Image prompt generation", included: true },
        { name: "Brand voice training", included: false },
        { name: "Bulk content creation", included: false },
      ],
      "Business Intelligence": [
        { name: "Website analysis (10/mo)", included: true },
        { name: "SEO health score", included: true },
        { name: "Tech stack detection", included: true },
        { name: "PDF report export", included: false },
        { name: "Google Drive sync", included: false },
        { name: "RAG knowledge base", included: false },
      ],
      "Integrations & Automation": [
        { name: "Facebook Graph API", included: true },
        { name: "Instagram Basic Display", included: true },
        { name: "Shopify integration", included: false },
        { name: "Google Ads integration", included: false },
        { name: "WhatsApp chatbot", included: false },
        { name: "MCP server access", included: false },
      ],
      "Support & Access": [
        { name: "1 workspace", included: true },
        { name: "2 team members", included: true },
        { name: "Email support", included: true },
        { name: "Priority support", included: false },
        { name: "Dedicated account manager", included: false },
        { name: "White-label option", included: false },
      ],
    },
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Full command centre power",
    icon: Shield,
    monthlyPrice: 2499,
    annualPrice: 1999,
    currency: "R",
    color: "pink",
    gradient: "from-pink-500/30 to-purple-600/20",
    border: "border-pink-500/60",
    glow: "shadow-pink-500/30",
    buttonClass: "bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white",
    badge: "MOST POPULAR",
    features: {
      "Social Media Analytics": [
        { name: "Facebook & Instagram analytics", included: true },
        { name: "Post performance tracking", included: true },
        { name: "Follower growth charts", included: true },
        { name: "Engagement rate analysis", included: true },
        { name: "Audience demographics", included: true },
        { name: "Competitor benchmarking", included: true },
      ],
      "Content Management": [
        { name: "AI content generation (200 posts/mo)", included: true },
        { name: "Content calendar", included: true },
        { name: "Post scheduling", included: true },
        { name: "Image prompt generation", included: true },
        { name: "Brand voice training", included: true },
        { name: "Bulk content creation", included: false },
      ],
      "Business Intelligence": [
        { name: "Website analysis (50/mo)", included: true },
        { name: "SEO health score", included: true },
        { name: "Tech stack detection", included: true },
        { name: "PDF report export", included: true },
        { name: "Google Drive sync", included: true },
        { name: "RAG knowledge base", included: true },
      ],
      "Integrations & Automation": [
        { name: "Facebook Graph API", included: true },
        { name: "Instagram Basic Display", included: true },
        { name: "Shopify integration", included: true },
        { name: "Google Ads integration", included: true },
        { name: "WhatsApp chatbot", included: true },
        { name: "MCP server access", included: false },
      ],
      "Support & Access": [
        { name: "3 workspaces", included: true },
        { name: "10 team members", included: true },
        { name: "Email support", included: true },
        { name: "Priority support", included: true },
        { name: "Dedicated account manager", included: false },
        { name: "White-label option", included: false },
      ],
    },
  },
  {
    id: "agency",
    name: "Agency",
    tagline: "Scale your client operations",
    icon: Building2,
    monthlyPrice: 7999,
    annualPrice: 6399,
    currency: "R",
    color: "purple",
    gradient: "from-purple-500/20 to-pink-500/10",
    border: "border-purple-500/40",
    glow: "shadow-purple-500/20",
    buttonClass: "bg-purple-600 hover:bg-purple-500 text-white",
    badge: "BEST VALUE",
    features: {
      "Social Media Analytics": [
        { name: "Facebook & Instagram analytics", included: true },
        { name: "Post performance tracking", included: true },
        { name: "Follower growth charts", included: true },
        { name: "Engagement rate analysis", included: true },
        { name: "Audience demographics", included: true },
        { name: "Competitor benchmarking", included: true },
      ],
      "Content Management": [
        { name: "AI content generation (unlimited)", included: true },
        { name: "Content calendar", included: true },
        { name: "Post scheduling", included: true },
        { name: "Image prompt generation", included: true },
        { name: "Brand voice training", included: true },
        { name: "Bulk content creation", included: true },
      ],
      "Business Intelligence": [
        { name: "Website analysis (unlimited)", included: true },
        { name: "SEO health score", included: true },
        { name: "Tech stack detection", included: true },
        { name: "PDF report export", included: true },
        { name: "Google Drive sync", included: true },
        { name: "RAG knowledge base", included: true },
      ],
      "Integrations & Automation": [
        { name: "Facebook Graph API", included: true },
        { name: "Instagram Basic Display", included: true },
        { name: "Shopify integration", included: true },
        { name: "Google Ads integration", included: true },
        { name: "WhatsApp chatbot", included: true },
        { name: "MCP server access", included: true },
      ],
      "Support & Access": [
        { name: "Unlimited workspaces", included: true },
        { name: "Unlimited team members", included: true },
        { name: "Email support", included: true },
        { name: "Priority support", included: true },
        { name: "Dedicated account manager", included: true },
        { name: "White-label option", included: true },
      ],
    },
  },
];

const faqs = [
  {
    q: "Can I switch plans at any time?",
    a: "Yes — you can upgrade or downgrade your plan at any time. Upgrades take effect immediately and you are billed the prorated difference. Downgrades take effect at the start of your next billing cycle.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit and debit cards (Visa, Mastercard, Amex), EFT bank transfers, and PayFast for South African clients. International clients can pay via Stripe.",
  },
  {
    q: "Is there a free trial?",
    a: "Yes — every plan comes with a 14-day free trial, no credit card required. You get full access to all features in your chosen tier during the trial period.",
  },
  {
    q: "What is the MCP server and why does it matter?",
    a: "The MCP (Model Context Protocol) server is an infrastructure layer that exposes all your Nexus Social tools to AI agents like Manus, Claude, or Cursor. This means AI can autonomously pull your analytics, generate content, and post to your social channels without manual intervention — true automation.",
  },
  {
    q: "Can I use Nexus Social for multiple client accounts?",
    a: "The Agency plan supports unlimited workspaces, making it ideal for managing multiple client accounts. Each workspace has its own integrations, content calendar, analytics, and team members. The white-label option lets you brand the platform as your own when presenting to clients.",
  },
  {
    q: "How does the WhatsApp chatbot work?",
    a: "The WhatsApp chatbot connects to your Meta Business account via the WhatsApp Cloud API. It uses DeepSeek Intelligence to understand and respond to customer messages, handle FAQs, qualify leads, and escalate complex queries to your team — all automatically, 24/7.",
  },
  {
    q: "What does the RAG knowledge base do?",
    a: "RAG (Retrieval-Augmented Generation) indexes all your business analysis reports, social media data, and content into a searchable vector database. This means the AI generates content and insights grounded in your actual business data — not generic responses.",
  },
  {
    q: "Do you offer custom enterprise pricing?",
    a: "Yes — for large enterprises or custom requirements (on-premise deployment, custom integrations, SLA guarantees), contact us directly at enterprise@studexdevops.com for a tailored quote.",
  },
];

const comparisonFeatures = [
  { category: "Analytics", feature: "Social media analytics", starter: true, pro: true, agency: true },
  { category: "Analytics", feature: "Audience demographics", starter: false, pro: true, agency: true },
  { category: "Analytics", feature: "Competitor benchmarking", starter: false, pro: true, agency: true },
  { category: "Content", feature: "AI content generation", starter: "50/mo", pro: "200/mo", agency: "Unlimited" },
  { category: "Content", feature: "Brand voice training", starter: false, pro: true, agency: true },
  { category: "Content", feature: "Bulk content creation", starter: false, pro: false, agency: true },
  { category: "Intelligence", feature: "Website analysis", starter: "10/mo", pro: "50/mo", agency: "Unlimited" },
  { category: "Intelligence", feature: "PDF report export", starter: false, pro: true, agency: true },
  { category: "Intelligence", feature: "RAG knowledge base", starter: false, pro: true, agency: true },
  { category: "Integrations", feature: "Shopify + Google Ads", starter: false, pro: true, agency: true },
  { category: "Integrations", feature: "WhatsApp chatbot", starter: false, pro: true, agency: true },
  { category: "Integrations", feature: "MCP server access", starter: false, pro: false, agency: true },
  { category: "Access", feature: "Workspaces", starter: "1", pro: "3", agency: "Unlimited" },
  { category: "Access", feature: "Team members", starter: "2", pro: "10", agency: "Unlimited" },
  { category: "Access", feature: "White-label option", starter: false, pro: false, agency: true },
  { category: "Support", feature: "Priority support", starter: false, pro: true, agency: true },
  { category: "Support", feature: "Dedicated account manager", starter: false, pro: false, agency: true },
];

function FeatureValue({ value }: { value: boolean | string }) {
  if (value === true) return <Check className="w-5 h-5 text-pink-400 mx-auto" />;
  if (value === false) return <X className="w-4 h-4 text-white/20 mx-auto" />;
  return <span className="text-sm text-pink-300 font-medium">{value}</span>;
}

export default function Pricing() {
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [expandedSection, setExpandedSection] = useState<Record<string, Record<string, boolean>>>({});

  const toggleSection = (planId: string, section: string) => {
    setExpandedSection(prev => ({
      ...prev,
      [planId]: {
        ...(prev[planId] || {}),
        [section]: !(prev[planId]?.[section] ?? false),
      },
    }));
  };

  return (
    <div className="min-h-screen bg-[#050510] text-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-[#050510]/80 backdrop-blur-md border-b border-pink-500/10">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">N</div>
          <div>
            <div className="font-bold text-white text-sm tracking-wider" style={{ fontFamily: "'Orbitron', monospace" }}>NEXUS SOCIAL</div>
            <div className="text-[10px] text-pink-400/70 tracking-widest">by StudEx D#VOP$</div>
          </div>
        </Link>
        <Link href="/dashboard" className="px-5 py-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg text-sm font-bold tracking-wider hover:opacity-90 transition-opacity" style={{ fontFamily: "'Orbitron', monospace" }}>
          LAUNCH →
        </Link>
      </nav>

      <div className="pt-24 pb-20 px-4">
        {/* Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-pink-500/30 bg-pink-500/10 text-pink-400 text-xs tracking-widest mb-6"
            style={{ fontFamily: "'Orbitron', monospace" }}
          >
            <Sparkles className="w-3 h-3" /> TRANSPARENT PRICING — NO HIDDEN FEES
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl font-black mb-4 leading-tight"
            style={{ fontFamily: "'Orbitron', monospace" }}
          >
            CHOOSE YOUR{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
              COMMAND LEVEL
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/60 text-lg"
          >
            From solo operators to full-scale agencies — every plan includes a 14-day free trial with no credit card required.
          </motion.p>

          {/* Billing Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-4 mt-8"
          >
            <span className={`text-sm font-medium ${!annual ? "text-white" : "text-white/40"}`}>Monthly</span>
            <button
              onClick={() => setAnnual(!annual)}
              className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${annual ? "bg-pink-500" : "bg-white/20"}`}
            >
              <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300 ${annual ? "translate-x-8" : "translate-x-1"}`} />
            </button>
            <span className={`text-sm font-medium ${annual ? "text-white" : "text-white/40"}`}>
              Annual{" "}
              <span className="ml-1 px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs font-bold">SAVE 20%</span>
            </span>
          </motion.div>
        </div>

        {/* Pricing Cards */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {plans.map((plan, i) => {
            const Icon = plan.icon;
            const price = annual ? plan.annualPrice : plan.monthlyPrice;
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                className={`relative rounded-2xl border ${plan.border} bg-gradient-to-b ${plan.gradient} backdrop-blur-sm overflow-hidden shadow-xl ${plan.glow} ${plan.id === "pro" ? "md:-mt-4 md:mb-4" : ""}`}
              >
                {plan.badge && (
                  <div className="absolute top-0 left-0 right-0 text-center py-1.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-black tracking-widest" style={{ fontFamily: "'Orbitron', monospace" }}>
                    {plan.badge}
                  </div>
                )}

                <div className={`p-8 ${plan.badge ? "pt-10" : ""}`}>
                  {/* Plan Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${plan.id === "starter" ? "from-cyan-500 to-cyan-700" : plan.id === "pro" ? "from-pink-500 to-purple-600" : "from-purple-500 to-pink-600"}`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-black text-lg tracking-wider" style={{ fontFamily: "'Orbitron', monospace" }}>{plan.name}</h3>
                      <p className="text-white/50 text-xs">{plan.tagline}</p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-end gap-1">
                      <span className="text-white/50 text-lg">{plan.currency}</span>
                      <span className="text-5xl font-black" style={{ fontFamily: "'Orbitron', monospace" }}>
                        {price.toLocaleString()}
                      </span>
                      <span className="text-white/50 text-sm mb-2">/mo</span>
                    </div>
                    {annual && (
                      <p className="text-green-400 text-xs mt-1">
                        Save {plan.currency}{((plan.monthlyPrice - plan.annualPrice) * 12).toLocaleString()} per year
                      </p>
                    )}
                  </div>

                  {/* CTA */}
                  <Link href="/dashboard">
                    <button className={`w-full py-3 rounded-xl font-bold text-sm tracking-wider transition-all duration-200 flex items-center justify-center gap-2 mb-6 ${plan.buttonClass}`} style={{ fontFamily: "'Orbitron', monospace" }}>
                      START FREE TRIAL <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>

                  {/* Feature Sections */}
                  {Object.entries(plan.features).map(([section, features]) => {
                    const isOpen = expandedSection[plan.id]?.[section] ?? true;
                    return (
                      <div key={section} className="mb-4">
                        <button
                          onClick={() => toggleSection(plan.id, section)}
                          className="w-full flex items-center justify-between py-2 text-left"
                        >
                          <span className="text-xs font-bold tracking-widest text-white/40 uppercase">{section}</span>
                          <ChevronDown className={`w-3 h-3 text-white/30 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                        </button>
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="space-y-2 pb-2">
                                {features.map((f) => (
                                  <div key={f.name} className="flex items-center gap-3">
                                    {f.included
                                      ? <Check className="w-4 h-4 text-pink-400 flex-shrink-0" />
                                      : <X className="w-4 h-4 text-white/20 flex-shrink-0" />
                                    }
                                    <span className={`text-sm ${f.included ? "text-white/80" : "text-white/30 line-through"}`}>{f.name}</span>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                        <div className="border-b border-white/5" />
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Comparison Table */}
        <div className="max-w-5xl mx-auto mb-20">
          <h2 className="text-3xl font-black text-center mb-10" style={{ fontFamily: "'Orbitron', monospace" }}>
            FULL FEATURE{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">COMPARISON</span>
          </h2>
          <div className="rounded-2xl border border-pink-500/20 overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-4 bg-white/5 border-b border-white/10">
              <div className="p-4 text-white/40 text-xs font-bold tracking-widest uppercase">Feature</div>
              {plans.map(p => (
                <div key={p.id} className="p-4 text-center">
                  <div className="font-black text-sm tracking-wider" style={{ fontFamily: "'Orbitron', monospace" }}>{p.name}</div>
                  <div className="text-white/40 text-xs">{p.currency}{annual ? p.annualPrice : p.monthlyPrice}/mo</div>
                </div>
              ))}
            </div>

            {/* Group rows by category */}
            {Array.from(new Set(comparisonFeatures.map(f => f.category))).map((category) => (
              <div key={category}>
                <div className="grid grid-cols-4 bg-pink-500/5 border-b border-white/5">
                  <div className="p-3 col-span-4 text-xs font-bold tracking-widest text-pink-400/60 uppercase px-4">{category}</div>
                </div>
                {comparisonFeatures.filter(f => f.category === category).map((row, i) => (
                  <div key={row.feature} className={`grid grid-cols-4 border-b border-white/5 hover:bg-white/3 transition-colors ${i % 2 === 0 ? "" : "bg-white/2"}`}>
                    <div className="p-4 text-sm text-white/70">{row.feature}</div>
                    <div className="p-4 text-center flex items-center justify-center"><FeatureValue value={row.starter} /></div>
                    <div className="p-4 text-center flex items-center justify-center"><FeatureValue value={row.pro} /></div>
                    <div className="p-4 text-center flex items-center justify-center"><FeatureValue value={row.agency} /></div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl font-black text-center mb-10" style={{ fontFamily: "'Orbitron', monospace" }}>
            FREQUENTLY ASKED{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">QUESTIONS</span>
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
                className="rounded-xl border border-white/10 bg-white/3 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition-colors"
                >
                  <span className="font-semibold text-white/90 pr-4">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-pink-400 flex-shrink-0 transition-transform duration-300 ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 text-white/60 text-sm leading-relaxed border-t border-white/5 pt-4">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto text-center rounded-2xl border border-pink-500/30 bg-gradient-to-b from-pink-500/10 to-purple-600/5 p-12"
        >
          <h3 className="text-3xl font-black mb-4" style={{ fontFamily: "'Orbitron', monospace" }}>
            READY TO DOMINATE?
          </h3>
          <p className="text-white/60 mb-8">
            Join the StudEx D#VOP$ Agentic Lab ecosystem. Start your 14-day free trial today — no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <button className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl font-black text-sm tracking-wider hover:opacity-90 transition-opacity flex items-center gap-2" style={{ fontFamily: "'Orbitron', monospace" }}>
                <Zap className="w-4 h-4" /> START FREE TRIAL
              </button>
            </Link>
            <a href="mailto:enterprise@studexdevops.com">
              <button className="px-8 py-4 rounded-xl border border-white/20 font-bold text-sm tracking-wider hover:bg-white/5 transition-colors" style={{ fontFamily: "'Orbitron', monospace" }}>
                CONTACT ENTERPRISE
              </button>
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
