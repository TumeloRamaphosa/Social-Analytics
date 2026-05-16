import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  ArrowRight, CheckCircle2, Sparkles, BarChart3, Globe, Instagram,
  Facebook, Youtube, Linkedin, TrendingUp, Brain, Zap, Users, Target,
  ChevronRight, Star
} from "lucide-react";

type Step = 1 | 2 | 3 | 4;

const INDUSTRIES = [
  "Food & Beverage", "Retail & E-commerce", "Security & Technology",
  "Health & Wellness", "Real Estate", "Professional Services",
  "Entertainment & Media", "Education", "Finance", "Other"
];

const BUDGETS = [
  "Under R 1,000/month", "R 1,000 – R 3,000/month", "R 3,000 – R 7,000/month",
  "R 7,000 – R 15,000/month", "R 15,000+/month", "Not sure yet"
];

const GOALS = [
  "Grow social media following", "Increase website traffic", "Generate more leads",
  "Improve brand awareness", "Boost online sales", "Manage ad campaigns",
  "Create consistent content", "Understand my analytics"
];

export default function ClientOnboarding() {
  const [step, setStep] = useState<Step>(1);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    businessName: "", industry: "",
    websiteUrl: "", facebookUrl: "", instagramUrl: "",
    tiktokUrl: "", linkedinUrl: "", youtubeUrl: "",
    facebookFollowers: "", instagramFollowers: "", tiktokFollowers: "",
    monthlyBudget: "", primaryGoal: "",
    currentChallenges: "", targetAudience: "",
  });

  const submitLead = trpc.clientPortal.submitLead.useMutation({
    onSuccess: () => {
      setSubmitted(true);
    },
    onError: (err) => {
      toast.error("Submission failed", { description: err.message });
    },
  });

  const update = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = () => {
    submitLead.mutate({
      ...form,
      facebookFollowers: form.facebookFollowers ? parseInt(form.facebookFollowers) : undefined,
      instagramFollowers: form.instagramFollowers ? parseInt(form.instagramFollowers) : undefined,
      tiktokFollowers: form.tiktokFollowers ? parseInt(form.tiktokFollowers) : undefined,
    });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-lg w-full text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-pink-tint border-2 border-primary/30 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-3">
              We've received your details!
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Our AI is now analysing your digital presence. You'll receive a personalised strategy report and custom pricing proposal at <strong className="text-foreground">{form.email}</strong> within 24 hours.
            </p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-6 text-left space-y-3">
            <p className="font-display font-semibold text-foreground">What happens next:</p>
            {[
              "AI analyses your website, social profiles, and goals",
              "We craft a personalised 90-day strategy",
              "You receive a detailed proposal via email",
              "If you're a fit, we send you access to your client portal",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <p className="text-sm text-muted-foreground">{item}</p>
              </div>
            ))}
          </div>
          <a href="/" className="inline-flex items-center gap-2 text-primary hover:underline text-sm font-medium">
            Back to home <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-foreground text-lg">DatAgentic</span>
            <span className="hidden sm:block text-xs text-muted-foreground border border-border rounded-full px-2 py-0.5">by StudEx DevOps</span>
          </div>
          <a href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Back to home
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-brand-gradient border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-16 text-center">
          <div className="pill-pink mb-4 mx-auto w-fit">Free AI Analysis — No commitment required</div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
            Get Your Free{" "}
            <span className="gradient-text">AI Strategy Report</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            Submit your business details and digital assets. Our AI analyses your online presence and delivers a personalised strategy with custom pricing — within 24 hours.
          </p>

          {/* Trust signals */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-8">
            {[
              { icon: Brain, label: "AI-Powered Analysis" },
              { icon: TrendingUp, label: "Custom Strategy" },
              { icon: Zap, label: "24-Hour Turnaround" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon className="w-4 h-4 text-primary" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Progress Steps */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-center gap-2 mb-10">
          {([1, 2, 3, 4] as Step[]).map((s) => (
            <div key={s} className="flex items-center gap-2">
              <button
                onClick={() => s < step && setStep(s)}
                className={`w-8 h-8 rounded-full text-sm font-semibold transition-all ${
                  s === step
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : s < step
                    ? "bg-primary/20 text-primary cursor-pointer"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {s < step ? <CheckCircle2 className="w-4 h-4 mx-auto" /> : s}
              </button>
              {s < 4 && <div className={`w-12 h-0.5 ${s < step ? "bg-primary/40" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Step 1: Contact Info */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground mb-1">Let's start with you</h2>
                <p className="text-muted-foreground">Tell us who you are and your business.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>First name *</Label>
                  <Input value={form.firstName} onChange={e => update("firstName", e.target.value)} placeholder="Tumelo" />
                </div>
                <div className="space-y-1.5">
                  <Label>Last name *</Label>
                  <Input value={form.lastName} onChange={e => update("lastName", e.target.value)} placeholder="Ramaphosa" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Email address *</Label>
                <Input type="email" value={form.email} onChange={e => update("email", e.target.value)} placeholder="you@yourbusiness.co.za" />
              </div>
              <div className="space-y-1.5">
                <Label>Phone number</Label>
                <Input value={form.phone} onChange={e => update("phone", e.target.value)} placeholder="+27 82 000 0000" />
              </div>
              <div className="space-y-1.5">
                <Label>Business name *</Label>
                <Input value={form.businessName} onChange={e => update("businessName", e.target.value)} placeholder="Safesight Security" />
              </div>
              <div className="space-y-1.5">
                <Label>Industry</Label>
                <div className="grid grid-cols-2 gap-2">
                  {INDUSTRIES.map(ind => (
                    <button
                      key={ind}
                      onClick={() => update("industry", ind)}
                      className={`text-left text-sm px-3 py-2 rounded-lg border transition-all ${
                        form.industry === ind
                          ? "border-primary bg-pink-tint text-primary font-medium"
                          : "border-border text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      {ind}
                    </button>
                  ))}
                </div>
              </div>
              <Button
                className="w-full"
                onClick={() => {
                  if (!form.firstName || !form.email || !form.businessName) {
                    toast.error("Please fill in required fields");
                    return;
                  }
                  setStep(2);
                }}
              >
                Continue <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}

          {/* Step 2: Digital Assets */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground mb-1">Your digital presence</h2>
                <p className="text-muted-foreground">Share your website and social media links so our AI can analyse them.</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-2"><Globe className="w-4 h-4 text-muted-foreground" /> Website URL</Label>
                  <Input value={form.websiteUrl} onChange={e => update("websiteUrl", e.target.value)} placeholder="https://yourbusiness.co.za" />
                </div>
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-2"><Facebook className="w-4 h-4 text-blue-600" /> Facebook Page URL</Label>
                  <Input value={form.facebookUrl} onChange={e => update("facebookUrl", e.target.value)} placeholder="https://facebook.com/yourbusiness" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Facebook followers</Label>
                    <Input type="number" value={form.facebookFollowers} onChange={e => update("facebookFollowers", e.target.value)} placeholder="0" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Instagram followers</Label>
                    <Input type="number" value={form.instagramFollowers} onChange={e => update("instagramFollowers", e.target.value)} placeholder="0" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-2"><Instagram className="w-4 h-4 text-pink-500" /> Instagram Profile URL</Label>
                  <Input value={form.instagramUrl} onChange={e => update("instagramUrl", e.target.value)} placeholder="https://instagram.com/yourbusiness" />
                </div>
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-2"><span className="text-sm font-bold">TK</span> TikTok Profile URL</Label>
                  <Input value={form.tiktokUrl} onChange={e => update("tiktokUrl", e.target.value)} placeholder="https://tiktok.com/@yourbusiness" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-2"><Linkedin className="w-4 h-4 text-blue-700" /> LinkedIn URL</Label>
                    <Input value={form.linkedinUrl} onChange={e => update("linkedinUrl", e.target.value)} placeholder="linkedin.com/company/..." />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-2"><Youtube className="w-4 h-4 text-red-600" /> YouTube URL</Label>
                    <Input value={form.youtubeUrl} onChange={e => update("youtubeUrl", e.target.value)} placeholder="youtube.com/@channel" />
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Back</Button>
                <Button onClick={() => setStep(3)} className="flex-1">
                  Continue <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Goals & Budget */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground mb-1">Your goals & budget</h2>
                <p className="text-muted-foreground">Help us understand what success looks like for you.</p>
              </div>
              <div className="space-y-1.5">
                <Label>Monthly marketing budget</Label>
                <div className="grid grid-cols-2 gap-2">
                  {BUDGETS.map(b => (
                    <button
                      key={b}
                      onClick={() => update("monthlyBudget", b)}
                      className={`text-left text-sm px-3 py-2.5 rounded-lg border transition-all ${
                        form.monthlyBudget === b
                          ? "border-primary bg-pink-tint text-primary font-medium"
                          : "border-border text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Primary goal</Label>
                <div className="grid grid-cols-2 gap-2">
                  {GOALS.map(g => (
                    <button
                      key={g}
                      onClick={() => update("primaryGoal", g)}
                      className={`text-left text-sm px-3 py-2.5 rounded-lg border transition-all ${
                        form.primaryGoal === g
                          ? "border-primary bg-pink-tint text-primary font-medium"
                          : "border-border text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Target audience</Label>
                <Textarea
                  value={form.targetAudience}
                  onChange={e => update("targetAudience", e.target.value)}
                  placeholder="e.g. Small business owners in Johannesburg, aged 25–45, interested in security solutions"
                  rows={3}
                />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">Back</Button>
                <Button onClick={() => setStep(4)} className="flex-1">
                  Continue <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Challenges + Review */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground mb-1">Almost done!</h2>
                <p className="text-muted-foreground">Tell us your biggest challenges, then review and submit.</p>
              </div>
              <div className="space-y-1.5">
                <Label>Current challenges</Label>
                <Textarea
                  value={form.currentChallenges}
                  onChange={e => update("currentChallenges", e.target.value)}
                  placeholder="e.g. We struggle with consistent content, low engagement on Facebook, and don't know which platforms to focus on..."
                  rows={4}
                />
              </div>

              {/* Summary card */}
              <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
                <p className="font-display font-semibold text-foreground text-sm">Review your submission</p>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <span className="text-muted-foreground">Name</span>
                  <span className="text-foreground font-medium">{form.firstName} {form.lastName}</span>
                  <span className="text-muted-foreground">Email</span>
                  <span className="text-foreground font-medium">{form.email}</span>
                  <span className="text-muted-foreground">Business</span>
                  <span className="text-foreground font-medium">{form.businessName}</span>
                  <span className="text-muted-foreground">Industry</span>
                  <span className="text-foreground font-medium">{form.industry || "—"}</span>
                  <span className="text-muted-foreground">Budget</span>
                  <span className="text-foreground font-medium">{form.monthlyBudget || "—"}</span>
                  <span className="text-muted-foreground">Goal</span>
                  <span className="text-foreground font-medium">{form.primaryGoal || "—"}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(3)} className="flex-1">Back</Button>
                <Button
                  onClick={handleSubmit}
                  disabled={submitLead.isPending}
                  className="flex-1 bg-primary text-primary-foreground"
                >
                  {submitLead.isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Submitting...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Submit & Get Free Analysis
                    </span>
                  )}
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                By submitting, you agree to receive a strategy report and proposal email. No spam, no commitment.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Social proof */}
      <section className="border-t border-border bg-card/50 mt-16">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <p className="text-center text-sm text-muted-foreground mb-8 font-medium">Trusted by South African businesses</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Safesight Security", quote: "DatAgentic completely transformed our social media presence. The AI insights were spot-on.", stars: 5 },
              { name: "StudEx Meat", quote: "We went from 200 to 2,400 followers in 3 months. The content strategy is incredible.", stars: 5 },
              { name: "Local Retail Brand", quote: "The analytics dashboard gives us clarity we never had before. Worth every rand.", stars: 5 },
            ].map(({ name, quote, stars }) => (
              <div key={name} className="bg-card border border-border rounded-xl p-5 space-y-3">
                <div className="flex gap-0.5">
                  {Array.from({ length: stars }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">"{quote}"</p>
                <p className="text-sm font-semibold text-foreground">{name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
