import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import {
  Search, BarChart3, Globe, Zap, Shield, Users,
  ArrowRight, CheckCircle, TrendingUp, Database,
  FileText, Cpu, Share2, Brain
} from "lucide-react";

const features = [
  { icon: Globe, title: "Website Intelligence", desc: "WHOIS, DNS, domain registration, and full business profile extraction from any URL." },
  { icon: BarChart3, title: "SEO & Performance", desc: "Page speed, meta tags, keyword analysis, backlinks, and technical SEO health scores." },
  { icon: Share2, title: "Social Media Detection", desc: "Automatically finds Facebook, Instagram, LinkedIn, TikTok, YouTube profiles with follower counts." },
  { icon: Cpu, title: "Tech Stack Analysis", desc: "Identifies CMS, frameworks, hosting, CDN, analytics tools, and marketing platforms." },
  { icon: TrendingUp, title: "Competitive Analysis", desc: "AI-powered market positioning, industry benchmarks, and competitor insights." },
  { icon: Brain, title: "RAG Pipeline", desc: "All analysis data indexed into a searchable vector knowledge base for AI-powered queries." },
  { icon: FileText, title: "PDF Reports", desc: "Branded, client-ready PDF reports with white-label options for professional deliverables." },
  { icon: Database, title: "Google Drive Export", desc: "Auto-exports structured markdown reports to Google Drive, organized by date and company." },
];

const stats = [
  { value: "10+", label: "Analysis Modules" },
  { value: "50+", label: "Tech Signals Detected" },
  { value: "8", label: "Social Platforms" },
  { value: "100%", label: "AI-Powered" },
];

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">Nexus Social</span>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Button onClick={() => navigate("/dashboard")} className="gap-2">
                Dashboard <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <a href={getLoginUrl()}>Sign In</a>
                </Button>
                <Button asChild>
                  <a href={getLoginUrl()}>Get Started Free</a>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden py-24 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="container relative text-center">
          <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm">
            AI-Powered Business Intelligence Platform
          </Badge>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            Understand Any Business
            <br />
            <span className="gradient-text">In Seconds</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Paste any website URL and receive a comprehensive intelligence report — SEO scores, social media presence, tech stack, competitive analysis, and AI-powered insights. All automatically saved to your knowledge base.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Button size="lg" onClick={() => navigate("/analyze")} className="gap-2 text-base px-8 glow">
                <Search className="w-5 h-5" /> Analyze a Website
              </Button>
            ) : (
              <Button size="lg" asChild className="gap-2 text-base px-8 glow">
                <a href={getLoginUrl()}>
                  <Search className="w-5 h-5" /> Start Analyzing Free
                </a>
              </Button>
            )}
            <Button size="lg" variant="outline" onClick={() => navigate("/dashboard")} className="gap-2 text-base px-8">
              View Dashboard <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border/50 py-12 bg-card/30">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-3xl font-bold gradient-text mb-1">{value}</div>
                <div className="text-muted-foreground text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need to Know</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              One URL. Ten intelligence modules. Complete business picture.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-xl border border-border bg-card p-6 card-hover">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-card/20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg">From URL to full intelligence report in under 30 seconds.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: "01", title: "Paste a URL", desc: "Enter any website address into the analysis form. No setup required." },
              { step: "02", title: "AI Analyses Everything", desc: "Our engine scrapes, scores, detects technologies, social profiles, and generates AI insights." },
              { step: "03", title: "Get Your Report", desc: "Receive a full intelligence report. Download as PDF, export to Google Drive, or query via RAG." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary font-bold text-sm">{step}</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">{title}</h3>
                <p className="text-muted-foreground text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container text-center">
          <div className="max-w-2xl mx-auto rounded-2xl border border-primary/20 bg-card p-12 glow">
            <h2 className="text-3xl font-bold mb-4">Ready to Analyse Your First Website?</h2>
            <p className="text-muted-foreground mb-8">Join the platform and start generating business intelligence reports instantly.</p>
            {isAuthenticated ? (
              <Button size="lg" onClick={() => navigate("/analyze")} className="gap-2 px-10">
                <Search className="w-5 h-5" /> Analyze Now
              </Button>
            ) : (
              <Button size="lg" asChild className="gap-2 px-10">
                <a href={getLoginUrl()}>
                  <CheckCircle className="w-5 h-5" /> Get Started Free
                </a>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sm">Nexus Social</span>
          </div>
          <p className="text-muted-foreground text-sm">AI-Powered Business Intelligence Platform</p>
        </div>
      </footer>
    </div>
  );
}
