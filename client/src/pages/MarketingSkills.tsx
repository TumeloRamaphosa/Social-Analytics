import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Lightbulb, 
  Target, 
  Search, 
  PenTool, 
  BarChart3, 
  Mail, 
  Share2, 
  DollarSign,
  FileText,
  Zap,
  Brain,
  ArrowRight,
  Copy,
  CheckCircle2
} from "lucide-react";

interface MarketingSkill {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  prompts: string[];
}

const MARKETING_SKILLS: MarketingSkill[] = [
  {
    id: "copywriting",
    name: "Copywriting",
    description: "Write, rewrite, or improve marketing copy for any page - homepage, landing pages, product pages, etc.",
    icon: <PenTool className="w-5 h-5" />,
    prompts: [
      "Write a compelling headline for [product]",
      "Create a hero section for [landing page]",
      "Improve the CTA on my [page]"
    ]
  },
  {
    id: "content-strategy",
    name: "Content Strategy",
    description: "Plan content strategy, decide what content to create, figure out what topics to cover.",
    icon: <FileText className="w-5 h-5" />,
    prompts: [
      "Plan content calendar for [industry]",
      "What topics should [company] cover?",
      "Create content pillars for [niche]"
    ]
  },
  {
    id: "seo-audit",
    name: "SEO Audit",
    description: "Audit, review, or diagnose SEO issues on your site.",
    icon: <Search className="w-5 h-5" />,
    prompts: [
      "Audit my website for SEO issues",
      "What keywords should [business] target?",
      "Fix technical SEO on [URL]"
    ]
  },
  {
    id: "paid-ads",
    name: "Paid Ads",
    description: "Help with paid advertising campaigns on Google Ads, Meta, LinkedIn, Twitter/X.",
    icon: <Target className="w-5 h-5" />,
    prompts: [
      "Create ad copy for [product] on [platform]",
      "Optimize my [platform] campaign",
      "Set up conversion tracking for ads"
    ]
  },
  {
    id: "email-sequence",
    name: "Email Sequence",
    description: "Create or optimize email sequences, drip campaigns, automated email flows.",
    icon: <Mail className="w-5 h-5" />,
    prompts: [
      "Create welcome email sequence for [business]",
      "Write abandoned cart emails for [store]",
      "Optimize my email subject lines"
    ]
  },
  {
    id: "social-content",
    name: "Social Content",
    description: "Create, schedule, or optimize social media content for LinkedIn, Twitter, Instagram.",
    icon: <Share2 className="w-5 h-5" />,
    prompts: [
      "Write LinkedIn posts for [topic]",
      "Create Instagram captions for [product]",
      "Plan social media calendar for [business]"
    ]
  },
  {
    id: "pricing-strategy",
    name: "Pricing Strategy",
    description: "Help with pricing decisions, packaging, or monetization strategy.",
    icon: <DollarSign className="w-5 h-5" />,
    prompts: [
      "What pricing strategy for [product]?",
      "Create pricing tiers for [SaaS]",
      "Analyze competitor pricing for [industry]"
    ]
  },
  {
    id: "ab-test-setup",
    name: "A/B Testing",
    description: "Plan, design, or implement A/B tests or experiments.",
    icon: <BarChart3 className="w-5 h-5" />,
    prompts: [
      "Design A/B test for [page element]",
      "What should I test on [landing page]?",
      "Calculate sample size for [experiment]"
    ]
  },
  {
    id: "page-cro",
    name: "Page Optimization",
    description: "Optimize, improve, or increase conversions on any marketing page.",
    icon: <Zap className="w-5 h-5" />,
    prompts: [
      "Improve conversion rate on [page]",
      "Optimize checkout flow for [store]",
      "Fix UX issues on [website]"
    ]
  }
];

export default function MarketingSkills() {
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [userInput, setUserInput] = useState("");
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSkillClick = (skillId: string) => {
    setSelectedSkill(skillId === selectedSkill ? null : skillId);
  };

  const handlePromptClick = (prompt: string) => {
    setGeneratedPrompt(prompt);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-green-400 bg-clip-text text-transparent">
              Marketing Skills
            </h1>
            <p className="text-muted-foreground">AI-powered marketing guidance with 18 specialized skills</p>
          </div>
          <Badge variant="outline" className="bg-blue-500/10 text-blue-400">
            18 Skills Available
          </Badge>
        </div>

        {/* What This Does */}
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Brain className="w-8 h-8 text-blue-400 mt-1" />
              <div>
                <h3 className="font-semibold text-blue-400 mb-2">What is this?</h3>
                <p className="text-sm text-muted-foreground">
                  These are specialized AI skills that help you with specific marketing tasks. 
                  Click on any skill to see what it can help with, then use the prompts 
                  to get guided assistance for your marketing needs. These skills understand 
                  marketing best practices and can help you plan, write, and optimize your campaigns.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="skills" className="space-y-4">
          <TabsList className="grid grid-cols-2 w-full max-w-md">
            <TabsTrigger value="skills">All Skills</TabsTrigger>
            <TabsTrigger value="guide">How to Use</TabsTrigger>
          </TabsList>

          {/* Skills Tab */}
          <TabsContent value="skills">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {MARKETING_SKILLS.map((skill) => (
                <Card 
                  key={skill.id} 
                  className={`cursor-pointer transition-all hover:scale-[1.02] ${
                    selectedSkill === skill.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => handleSkillClick(skill.id)}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-blue-500/20">
                        {skill.icon}
                      </div>
                      <div>
                        <p className="font-semibold">{skill.name}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{skill.description}</p>
                    
                    {selectedSkill === skill.id && (
                      <div className="space-y-2 pt-4 border-t">
                        <p className="text-sm font-medium">Quick Prompts:</p>
                        {skill.prompts.map((prompt, i) => (
                          <button
                            key={i}
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePromptClick(prompt);
                            }}
                            className="block w-full text-left text-xs p-2 bg-muted/50 rounded hover:bg-muted transition-colors"
                          >
                            {prompt}
                          </button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Guide Tab */}
          <TabsContent value="guide" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  How to Use These Skills
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-500/10 rounded-lg">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl">1</span>
                    </div>
                    <p className="font-medium">Choose a Skill</p>
                    <p className="text-sm text-muted-foreground">Click any skill card to see details</p>
                  </div>
                  <div className="text-center p-4 bg-cyan-500/10 rounded-lg">
                    <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl">2</span>
                    </div>
                    <p className="font-medium">Use a Prompt</p>
                    <p className="text-sm text-muted-foreground">Click any prompt to prepare it</p>
                  </div>
                  <div className="text-center p-4 bg-green-500/10 rounded-lg">
                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl">3</span>
                    </div>
                    <p className="font-medium">Apply to Content</p>
                    <p className="text-sm text-muted-foreground">Copy and use in Content Studio</p>
                  </div>
                </div>

                <div className="p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-medium mb-2">Example Workflow:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                    <li>Go to Content Studio to create new content</li>
                    <li>Come here to get guidance on what to write</li>
                    <li>Click "Copywriting" skill for help with headlines</li>
                    <li>Use a prompt like "Write a compelling headline for premium beef"</li>
                    <li>Copy the result back to Content Studio</li>
                  </ol>
                </div>
              </CardContent>
            </Card>

            {/* Prompt Builder */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Prompt Builder</CardTitle>
                <CardDescription>Create a custom prompt based on selected skill</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Badge variant="outline" className="bg-blue-500/10">
                    {selectedSkill || "No skill selected"}
                  </Badge>
                  <Input 
                    placeholder="Add specifics to the prompt..."
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                  />
                </div>
                
                {generatedPrompt && (
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-green-400">Ready to use:</span>
                      <Button size="sm" variant="ghost" onClick={copyToClipboard}>
                        {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                    <p className="text-sm">{generatedPrompt}</p>
                  </div>
                )}

                <Button className="w-full">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Open in Content Studio
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}