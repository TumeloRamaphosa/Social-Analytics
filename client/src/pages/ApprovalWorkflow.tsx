import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Image, 
  Video, 
  Check, 
  X, 
  Sparkles, 
  Loader2,
  RefreshCw,
  Send,
  Zap,
  Brain,
  FileText,
  Instagram,
  Youtube,
  Linkedin,
  Facebook,
  Twitter,
  MessageCircle
} from "lucide-react";
import { useState } from "react";

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  instagram: <Instagram className="w-4 h-4" />,
  youtube: <Youtube className="w-4 h-4" />,
  linkedin: <Linkedin className="w-4 h-4" />,
  facebook: <Facebook className="w-4 h-4" />,
  tiktok: <MessageCircle className="w-4 h-4" />,
  threads: <Twitter className="w-4 h-4" />,
};

const TYPE_ICONS = {
  image: <Image className="w-5 h-5" />,
  video: <Video className="w-5 h-5" />,
  text: <FileText className="w-5 h-5" />,
};

export interface PendingContent {
  id: string;
  type: "image" | "video" | "text";
  prompt: string;
  mediaUrl?: string;
  caption?: string;
  platforms: string[];
  generatedAt: Date;
  influencer: "naledi" | "emily" | "both";
}

interface ContentCardProps {
  content: PendingContent;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  isProcessing: boolean;
}

function ContentCard({ content, onApprove, onReject, isProcessing }: ContentCardProps) {
  return (
    <Card className="overflow-hidden bg-gradient-to-br from-card to-card/50 border-border/50 hover:border-border transition-all duration-300">
      <div className="aspect-[9/16] bg-muted relative overflow-hidden">
        {content.mediaUrl ? (
          <img 
            src={content.mediaUrl} 
            alt={content.prompt} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-4">
            <div className="text-center">
              {TYPE_ICONS[content.type]}
              <p className="text-xs text-muted-foreground mt-2 line-clamp-6">{content.prompt}</p>
            </div>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="bg-background/80 backdrop-blur">
            {content.influencer === "both" ? "Naledi + Emily" : 
             content.influencer === "naledi" ? "Naledi" : "Emily"}
          </Badge>
        </div>
        <div className="absolute bottom-2 left-2 flex gap-1">
          {content.platforms.map((p) => (
            <div key={p} className="bg-background/80 backdrop-blur p-1 rounded">
              {PLATFORM_ICONS[p]}
            </div>
          ))}
        </div>
      </div>
      <CardContent className="p-3 space-y-2">
        {content.caption && (
          <p className="text-xs text-muted-foreground line-clamp-2">{content.caption}</p>
        )}
        <div className="flex gap-2">
          <Button 
            size="sm" 
            className="flex-1 bg-green-600 hover:bg-green-700"
            onClick={() => onApprove(content.id)}
            disabled={isProcessing}
          >
            <Check className="w-4 h-4 mr-1" />
            Approve
          </Button>
          <Button 
            size="sm" 
            variant="destructive"
            className="flex-1"
            onClick={() => onReject(content.id)}
            disabled={isProcessing}
          >
            <X className="w-4 h-4 mr-1" />
            Reject
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ApprovalWorkflow() {
  const [selectedInfluencer, setSelectedInfluencer] = useState<"naledi" | "emily" | "both">("both");
  const [contentCount, setContentCount] = useState(9);
  const [generating, setGenerating] = useState(false);
  const [pendingContent, setPendingContent] = useState<PendingContent[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Generate new batch of content
  const handleGenerate = async () => {
    setGenerating(true);
    
    // Simulate content generation (in real app, call AI)
    await new Promise(r => setTimeout(r, 2000));
    
    const newContent: PendingContent[] = Array.from({ length: contentCount }, (_, i) => ({
      id: `gen-${Date.now()}-${i}`,
      type: Math.random() > 0.3 ? "image" : "video",
      prompt: getRandomPrompt(selectedInfluencer),
      mediaUrl: `https://picsum.photos/seed/${Date.now() + i}/400/600`,
      caption: getRandomCaption(selectedInfluencer),
      platforms: getRandomPlatforms(),
      generatedAt: new Date(),
      influencer: selectedInfluencer,
    }));
    
    setPendingContent(newContent);
    setGenerating(false);
  };

  // Approve content - move to posting queue
  const handleApprove = async (id: string) => {
    setProcessingId(id);
    await new Promise(r => setTimeout(r, 1000));
    setPendingContent(prev => prev.filter(c => c.id !== id));
    setProcessingId(null);
  };

  // Reject content - discard
  const handleReject = async (id: string) => {
    setProcessingId(id);
    await new Promise(r => setTimeout(r, 500));
    setPendingContent(prev => prev.filter(c => c.id !== id));
    setProcessingId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Content Approval
            </h1>
            <p className="text-muted-foreground">Review and approve AI-generated content before posting</p>
          </div>
          <Button 
            onClick={handleGenerate}
            disabled={generating}
            className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
          >
            {generating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            Generate New Batch
          </Button>
        </div>

        {/* Controls */}
        <Card className="bg-card/50">
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Influencer:</span>
                <div className="flex gap-1">
                  {(["naledi", "emily", "both"] as const).map((inf) => (
                    <Button
                      key={inf}
                      size="sm"
                      variant={selectedInfluencer === inf ? "default" : "outline"}
                      onClick={() => setSelectedInfluencer(inf)}
                      className="capitalize"
                    >
                      {inf === "both" ? "Both" : inf === "naledi" ? "Naledi" : "Emily"}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Count:</span>
                <select 
                  value={contentCount}
                  onChange={(e) => setContentCount(Number(e.target.value))}
                  className="bg-background border border-border rounded-md px-3 py-1 text-sm"
                >
                  <option value={3}>3</option>
                  <option value={6}>6</option>
                  <option value={9}>9</option>
                </select>
              </div>

              <div className="flex-1" />

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Brain className="w-4 h-4" />
                <span>{pendingContent.length} pending</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Grid */}
        {pendingContent.length > 0 ? (
          <div className="grid grid-cols-3 gap-4">
            {pendingContent.map((content) => (
              <ContentCard
                key={content.id}
                content={content}
                onApprove={handleApprove}
                onReject={handleReject}
                isProcessing={processingId === content.id}
              />
            ))}
          </div>
        ) : (
          <Card className="bg-card/50">
            <CardContent className="py-16 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">No content pending</h3>
                  <p className="text-muted-foreground">Generate a new batch to start approving content</p>
                </div>
                <Button onClick={handleGenerate} disabled={generating}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Content
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tips */}
        <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-400" />
              Generation Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="p-3 bg-background/50 rounded-lg">
                <p className="font-medium text-pink-400 mb-1">For Naledi</p>
                <p className="text-muted-foreground">Focus on lifestyle, kitchen, study content. Show premium living.</p>
              </div>
              <div className="p-3 bg-background/50 rounded-lg">
                <p className="font-medium text-purple-400 mb-1">For Emily</p>
                <p className="text-muted-foreground">Focus on farm, science, embryo transfer content. Show expertise.</p>
              </div>
              <div className="p-3 bg-background/50 rounded-lg">
                <p className="font-medium text-cyan-400 mb-1">For Best Results</p>
                <p className="text-muted-foreground">Use consistent character settings. Check product visibility in each frame.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Helper functions
function getRandomPrompt(influencer: string): string {
  const prompts = {
    naledi: [
      "Naledi in a modern kitchen preparing Studex Wagyu steak",
      "Naledi at a café with Studex biltong and coffee",
      "Naledi hosting Easter lunch with Studex meat platters",
      "Naledi at rugby stadium eating Studex snacks",
      "Naledi studying with Studex high-protein snacks",
    ],
    emily: [
      "Emily at the farm with Ankole cattle",
      "Emily performing embryo transfer on Studex farm",
      "Emily in vet lab with ultrasound equipment",
      "Emily walking through Wagyu herd",
      "Emily explaining genetics at the research facility",
    ],
    both: [
      "Naledi and Emily together on the Studex farm",
      "Emily showing Naledi the breeding charts",
      "Naledi and Emily at the launch event",
      "Emily explaining the cut, Naledi cooking it",
    ],
  };
  const list = prompts[influencer as keyof typeof prompts] || prompts.both;
  return list[Math.floor(Math.random() * list.length)];
}

function getRandomCaption(influencer: string): string {
  const captions = {
    naledi: [
      "Premium protein fits my lifestyle. #StudexMeat #HighProtein",
      "Because I deserve the best. 🥩 #StudexWagyu #PremiumMeat",
      "Fuel for my busy day. #StudyFuel #StudexMeat",
    ],
    emily: [
      "Every great steak starts in the genetics. #StudexFarming #Ankole",
      "Science meets tradition. #EmbryoTransfer #StudexMeat",
      "From our farm to your table. #Wagyu #EthicalFarming",
    ],
    both: [
      "The perfect pair: science and lifestyle. #StudexMeat #NalediAndEmily",
    ],
  };
  const list = captions[influencer as keyof typeof captions] || captions.both;
  return list[Math.floor(Math.random() * list.length)];
}

function getRandomPlatforms(): string[] {
  const all = ["instagram", "tiktok", "facebook", "youtube", "linkedin", "threads"];
  const count = Math.floor(Math.random() * 4) + 1;
  const shuffled = all.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}