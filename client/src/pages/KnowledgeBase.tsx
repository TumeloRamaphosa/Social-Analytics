import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Brain, Upload, Search, FileText, Video, MessageSquare,
  Database, Zap, BookOpen, Link, CheckCircle, ArrowRight,
  Mic, Globe, Download, Star, Network, Trash2, Loader2,
  Sparkles, ChevronRight, AlertCircle, Send
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

const NEON_PINK = "#ff00cc";
const NEON_CYAN = "#00ffff";
const NEON_PURPLE = "#9900ff";
const NEON_GREEN = "#00ff88";
const NEON_YELLOW = "#ffcc00";

const typeIcon: Record<string, any> = {
  transcript: Mic,
  document: FileText,
  report: Database,
  notes: BookOpen,
  research: Globe,
  strategy: Network,
  client: MessageSquare,
};

const typeColor: Record<string, string> = {
  transcript: NEON_CYAN,
  document: NEON_PINK,
  report: NEON_GREEN,
  notes: NEON_YELLOW,
  research: NEON_PURPLE,
  strategy: NEON_CYAN,
  client: NEON_PINK,
};

const toolStack = [
  {
    name: "AnythingLLM",
    role: "Local RAG Hub",
    description: "Self-hosted, privacy-first AI knowledge base. Upload any document, transcript, or report and chat with it in plain English. Runs entirely on your own machine — no data leaves your premises.",
    setup: "Download from anythingllm.com/desktop → Install → Create workspace 'StudEx Internal' → Upload documents → Connect DeepSeek model",
    benefit: "Zero cost after setup. Complete data privacy. Works offline.",
    color: NEON_PURPLE,
    icon: "🏠",
    link: "https://anythingllm.com/desktop",
  },
  {
    name: "Obsidian",
    role: "Personal Knowledge Graph",
    description: "Markdown-based note-taking with bi-directional linking. Every meeting note, idea, and decision becomes a node in your knowledge graph.",
    setup: "Download obsidian.md → Create vault 'StudEx Brain' → Install plugins: Dataview, Templater, Calendar, Obsidian Git, AnythingLLM connector",
    benefit: "Visual knowledge graph. Links ideas across time. Feeds directly into RAG.",
    color: NEON_YELLOW,
    icon: "💎",
    link: "https://obsidian.md",
  },
  {
    name: "Whisper AI",
    role: "Speech-to-Text Engine",
    description: "OpenAI's open-source transcription model. Converts any video call, voice note, or meeting recording into searchable text automatically. Supports 99 languages.",
    setup: "pip install openai-whisper → whisper meeting.mp4 --model medium → Output saved as .txt and .srt",
    benefit: "Every spoken word becomes searchable knowledge. Works on any audio/video file.",
    color: NEON_CYAN,
    icon: "🎙️",
    link: "https://github.com/openai/whisper",
  },
  {
    name: "ChromaDB",
    role: "Vector Database",
    description: "Open-source vector database that stores the mathematical representations (embeddings) of your documents. Enables semantic search — find information by meaning, not just keywords.",
    setup: "pip install chromadb → Built into AnythingLLM automatically → No manual setup required",
    benefit: "Semantic search across all your knowledge. Finds relevant context even with different wording.",
    color: NEON_GREEN,
    icon: "🗄️",
    link: "https://www.trychroma.com",
  },
  {
    name: "N8N",
    role: "Automation Pipeline",
    description: "Open-source workflow automation. Automatically routes new meeting recordings to Whisper, transcripts to AnythingLLM, and summaries to WhatsApp.",
    setup: "npx n8n → Create workflow: Trigger (new file) → Whisper → AnythingLLM → Notify WhatsApp",
    benefit: "Zero manual work. Every new recording automatically enters the knowledge base.",
    color: NEON_PINK,
    icon: "⚙️",
    link: "https://n8n.io",
  },
];

// ─── Ask Brain Panel ─────────────────────────────────────────────────────────
function AskBrainPanel() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<{ answer: string; chunksUsed: number; sources: string[]; question: string } | null>(null);

  const askMutation = trpc.knowledge.askBrain.useMutation({
    onSuccess: (data) => {
      setAnswer(data);
    },
    onError: (err) => {
      toast.error(`Brain query failed: ${err.message}`);
    },
  });

  const handleAsk = () => {
    if (!question.trim() || question.length < 5) {
      toast.error("Please enter a question (at least 5 characters)");
      return;
    }
    askMutation.mutate({ question });
  };

  const suggestedQuestions = [
    "What is OpenClaw and why is it important?",
    "What is the AI adoption gap between Africa and the rest of the world?",
    "What are the best AI CRM tools and their pricing?",
    "How does RAG work and why does StudEx need it?",
    "What did we decide in the Q1 strategy meeting?",
  ];

  return (
    <div className="space-y-4">
      {/* Question Input */}
      <div className="p-4 rounded-xl border border-purple-500/30 bg-black/40">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-4 h-4" style={{ color: NEON_PURPLE }} />
          <span className="text-purple-400 font-rajdhani font-bold text-sm">Ask the StudEx Super Brain</span>
        </div>
        <Textarea
          placeholder="Ask anything... 'What did we decide about the Q1 strategy?' or 'What is OpenClaw?' or 'Summarise the Africa AI gap research'"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          className="bg-black/60 border-purple-500/30 text-white font-rajdhani min-h-[80px] mb-3 resize-none"
          onKeyDown={e => {
            if (e.key === "Enter" && e.ctrlKey) handleAsk();
          }}
        />
        <div className="flex items-center justify-between">
          <span className="text-gray-500 text-xs font-rajdhani">Ctrl+Enter to send</span>
          <Button
            onClick={handleAsk}
            disabled={askMutation.isPending || !question.trim()}
            className="font-rajdhani"
            style={{ background: "linear-gradient(135deg, #9900ff, #ff00cc)" }}
          >
            {askMutation.isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Thinking...</>
            ) : (
              <><Send className="w-4 h-4 mr-2" />Ask Brain</>
            )}
          </Button>
        </div>
      </div>

      {/* Suggested Questions */}
      {!answer && !askMutation.isPending && (
        <div>
          <div className="text-gray-500 text-xs font-rajdhani mb-2">SUGGESTED QUESTIONS:</div>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map(q => (
              <button
                key={q}
                onClick={() => setQuestion(q)}
                className="text-xs font-rajdhani px-3 py-1.5 rounded-lg border border-purple-500/20 text-purple-400 hover:border-purple-400/60 hover:bg-purple-500/10 transition-all text-left"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {askMutation.isPending && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-6 rounded-xl border border-purple-500/30 bg-purple-500/5 text-center"
        >
          <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin" style={{ color: NEON_PURPLE }} />
          <div className="text-purple-400 font-rajdhani font-bold">Searching knowledge base...</div>
          <div className="text-gray-500 text-xs font-rajdhani mt-1">Retrieving relevant context and generating answer</div>
        </motion.div>
      )}

      {/* Answer */}
      <AnimatePresence>
        {answer && !askMutation.isPending && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {/* Question recap */}
            <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <div className="text-gray-400 text-xs font-rajdhani mb-1">YOUR QUESTION:</div>
              <div className="text-white font-rajdhani text-sm">{answer.question}</div>
            </div>

            {/* Answer */}
            <div className="p-5 rounded-xl border border-green-500/30 bg-green-500/5">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4" style={{ color: NEON_GREEN }} />
                <span className="font-rajdhani font-bold text-sm" style={{ color: NEON_GREEN }}>
                  Super Brain Response
                </span>
                <Badge className="text-xs font-rajdhani ml-auto" style={{ background: "#00ff8820", color: NEON_GREEN }}>
                  {answer.chunksUsed} chunks retrieved
                </Badge>
              </div>
              <div className="text-gray-200 font-rajdhani text-sm leading-relaxed whitespace-pre-wrap">
                {answer.answer}
              </div>
            </div>

            {/* Sources */}
            {answer.sources.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-gray-500 text-xs font-rajdhani">SOURCES:</span>
                {answer.sources.map(s => (
                  <Badge key={s} className="text-xs font-rajdhani" style={{ background: "#9900ff20", color: NEON_PURPLE }}>
                    {s}
                  </Badge>
                ))}
              </div>
            )}

            {/* Ask another */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setAnswer(null); setQuestion(""); }}
              className="font-rajdhani text-gray-400 border-white/10 hover:text-white"
            >
              Ask Another Question
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Ingest Document Panel ───────────────────────────────────────────────────
function IngestPanel() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [source, setSource] = useState("manual");
  const [docType, setDocType] = useState<"research" | "transcript" | "report" | "notes" | "strategy" | "client">("notes");
  const [tags, setTags] = useState("");

  const utils = trpc.useUtils();
  const ingestMutation = trpc.knowledge.ingest.useMutation({
    onSuccess: (data) => {
      toast.success(`"${data.title}" ingested — ${data.chunkCount} chunks indexed into the knowledge base`);
      setTitle("");
      setContent("");
      setTags("");
      utils.knowledge.list.invalidate();
      utils.knowledge.stats.invalidate();
    },
    onError: (err) => {
      toast.error(`Ingest failed: ${err.message}`);
    },
  });

  const handleIngest = () => {
    if (!title.trim()) { toast.error("Please enter a title"); return; }
    if (!content.trim() || content.length < 10) { toast.error("Please enter document content (at least 10 characters)"); return; }
    ingestMutation.mutate({
      title,
      content,
      source,
      docType,
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
    });
  };

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl border border-purple-500/20 bg-purple-500/5">
        <div className="flex items-center gap-2 mb-1">
          <AlertCircle className="w-4 h-4 text-purple-400" />
          <span className="text-purple-400 font-rajdhani font-bold text-sm">How Ingestion Works</span>
        </div>
        <p className="text-gray-400 text-xs font-rajdhani">
          Paste any text — meeting notes, research, transcripts, strategy docs. The system chunks it into ~500-character segments, indexes each chunk into the RAG database, and makes it instantly searchable by the Super Brain.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-gray-400 text-xs font-rajdhani mb-1 block">DOCUMENT TITLE *</label>
          <Input
            placeholder="e.g. Q1 Strategy Meeting — March 2026"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="bg-black/40 border-purple-500/30 text-white font-rajdhani"
          />
        </div>
        <div>
          <label className="text-gray-400 text-xs font-rajdhani mb-1 block">SOURCE</label>
          <Input
            placeholder="e.g. Zoom, Obsidian, Manual, Google Meet"
            value={source}
            onChange={e => setSource(e.target.value)}
            className="bg-black/40 border-purple-500/30 text-white font-rajdhani"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-gray-400 text-xs font-rajdhani mb-1 block">DOCUMENT TYPE</label>
          <select
            value={docType}
            onChange={e => setDocType(e.target.value as any)}
            className="w-full bg-black/40 border border-purple-500/30 text-white font-rajdhani rounded-md px-3 py-2 text-sm"
          >
            <option value="notes">Notes</option>
            <option value="transcript">Transcript</option>
            <option value="research">Research</option>
            <option value="report">Report</option>
            <option value="strategy">Strategy</option>
            <option value="client">Client</option>
          </select>
        </div>
        <div>
          <label className="text-gray-400 text-xs font-rajdhani mb-1 block">TAGS (comma-separated)</label>
          <Input
            placeholder="e.g. strategy, Q1, planning, studex"
            value={tags}
            onChange={e => setTags(e.target.value)}
            className="bg-black/40 border-purple-500/30 text-white font-rajdhani"
          />
        </div>
      </div>

      <div>
        <label className="text-gray-400 text-xs font-rajdhani mb-1 block">DOCUMENT CONTENT *</label>
        <Textarea
          placeholder="Paste your document content here — meeting transcript, research notes, strategy document, client brief, etc. The more detail you include, the better the AI can answer questions about it."
          value={content}
          onChange={e => setContent(e.target.value)}
          className="bg-black/40 border-purple-500/30 text-white font-rajdhani min-h-[200px]"
        />
        <div className="text-gray-600 text-xs font-rajdhani mt-1">{content.length} characters</div>
      </div>

      <Button
        onClick={handleIngest}
        disabled={ingestMutation.isPending || !title.trim() || !content.trim()}
        className="w-full font-rajdhani"
        style={{ background: "linear-gradient(135deg, #9900ff, #ff00cc)" }}
      >
        {ingestMutation.isPending ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Indexing into Knowledge Base...</>
        ) : (
          <><Upload className="w-4 h-4 mr-2" />Ingest into Super Brain</>
        )}
      </Button>
    </div>
  );
}

// ─── Knowledge Library ───────────────────────────────────────────────────────
function KnowledgeLibrary() {
  const [search, setSearch] = useState("");
  const [docTypeFilter, setDocTypeFilter] = useState<any>("all");

  const { data: docs, isLoading } = trpc.knowledge.list.useQuery({ search: search || undefined, docType: docTypeFilter });
  const utils = trpc.useUtils();

  const deleteMutation = trpc.knowledge.delete.useMutation({
    onSuccess: () => {
      toast.success("Document removed from knowledge base");
      utils.knowledge.list.invalidate();
      utils.knowledge.stats.invalidate();
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            placeholder="Search knowledge base..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 bg-black/40 border-purple-500/30 text-white font-rajdhani"
          />
        </div>
        <select
          value={docTypeFilter}
          onChange={e => setDocTypeFilter(e.target.value)}
          className="bg-black/40 border border-purple-500/30 text-white font-rajdhani rounded-md px-3 py-2 text-sm"
        >
          <option value="all">All Types</option>
          <option value="notes">Notes</option>
          <option value="transcript">Transcripts</option>
          <option value="research">Research</option>
          <option value="report">Reports</option>
          <option value="strategy">Strategy</option>
          <option value="client">Client</option>
        </select>
      </div>

      {isLoading && (
        <div className="text-center py-8">
          <Loader2 className="w-6 h-6 mx-auto animate-spin text-purple-400" />
          <div className="text-gray-500 text-sm font-rajdhani mt-2">Loading knowledge base...</div>
        </div>
      )}

      {!isLoading && (!docs || docs.length === 0) && (
        <div className="text-center py-12 border border-purple-500/20 rounded-xl bg-black/20">
          <Brain className="w-12 h-12 mx-auto mb-3 text-gray-600" />
          <div className="text-gray-400 font-rajdhani font-bold">No documents yet</div>
          <p className="text-gray-600 text-sm font-rajdhani mt-1">
            Go to the "Ingest Document" tab to add your first knowledge document
          </p>
        </div>
      )}

      <div className="space-y-2">
        {docs?.map((doc, i) => {
          const Icon = typeIcon[doc.docType] || FileText;
          const color = typeColor[doc.docType] || NEON_PINK;
          const tags = Array.isArray(doc.tags) ? doc.tags as string[] : [];
          return (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center justify-between p-4 rounded-xl border bg-black/40 hover:bg-white/5 transition-all"
              style={{ borderColor: `${color}30` }}
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="p-2 rounded-lg flex-shrink-0" style={{ background: `${color}20` }}>
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <div className="min-w-0">
                  <div className="text-white font-rajdhani font-bold text-sm truncate">{doc.title}</div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-gray-500 text-xs">{doc.source}</span>
                    <span className="text-gray-600 text-xs">•</span>
                    <span className="text-gray-500 text-xs">{doc.chunkCount} chunks</span>
                    <span className="text-gray-600 text-xs">•</span>
                    <span className="text-gray-500 text-xs">{new Date(doc.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                {tags.slice(0, 2).map(tag => (
                  <Badge key={tag} className="text-xs font-rajdhani hidden md:flex" style={{ background: `${color}20`, color }}>
                    {tag}
                  </Badge>
                ))}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteMutation.mutate({ id: doc.id })}
                  className="text-gray-600 hover:text-red-400 h-7 w-7 p-0"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function KnowledgeBase() {
  const [activeTab, setActiveTab] = useState("ask");

  const { data: stats } = trpc.knowledge.stats.useQuery();

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6" style={{ background: "rgba(5,0,8,0.95)", minHeight: "100vh" }}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-orbitron text-2xl font-black text-white">
              StudEx <span style={{ color: NEON_PURPLE }}>Super Brain</span>
            </h1>
            <p className="text-gray-400 font-rajdhani mt-1">
              RAG Knowledge Base — Every meeting, call, document, and insight stored and searchable forever
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Brain, label: "Knowledge Chunks", value: stats?.totalChunks?.toString() ?? "0", color: NEON_PURPLE },
            { icon: FileText, label: "Documents Indexed", value: stats?.totalDocs?.toString() ?? "0", color: NEON_CYAN },
            { icon: Mic, label: "Transcripts Stored", value: stats?.docsByType?.transcript?.toString() ?? "0", color: NEON_PINK },
            { icon: Globe, label: "Research Docs", value: stats?.docsByType?.research?.toString() ?? "0", color: NEON_GREEN },
          ].map(stat => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border p-4"
              style={{ background: "rgba(5,0,8,0.8)", borderColor: `${stat.color}40` }}
            >
              <div className="p-2 rounded-lg w-fit mb-3" style={{ background: `${stat.color}20` }}>
                <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
              </div>
              <div className="font-orbitron text-2xl font-black" style={{ color: stat.color }}>{stat.value}</div>
              <div className="text-gray-400 text-xs mt-1 font-rajdhani">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-black/50 border border-purple-500/20">
            {[
              { id: "ask", label: "Ask Brain" },
              { id: "ingest", label: "Ingest Document" },
              { id: "library", label: "Knowledge Library" },
              { id: "tools", label: "Tool Stack" },
              { id: "obsidian", label: "Obsidian Setup" },
            ].map(tab => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="font-rajdhani data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ASK BRAIN TAB */}
          <TabsContent value="ask" className="space-y-4">
            <AskBrainPanel />
          </TabsContent>

          {/* INGEST TAB */}
          <TabsContent value="ingest" className="space-y-4">
            <IngestPanel />
          </TabsContent>

          {/* LIBRARY TAB */}
          <TabsContent value="library" className="space-y-4">
            <KnowledgeLibrary />
          </TabsContent>

          {/* TOOL STACK TAB */}
          <TabsContent value="tools" className="space-y-4">
            <div className="p-4 rounded-xl border border-purple-500/20 bg-purple-500/5 mb-2">
              <div className="flex items-center gap-2 mb-2">
                <Network className="w-4 h-4 text-purple-400" />
                <span className="text-purple-400 font-rajdhani font-bold text-sm">Recommended RAG Stack for StudEx DevOps</span>
              </div>
              <p className="text-gray-400 text-xs font-rajdhani">
                This is the exact tool stack we recommend for building your long-term AI memory system. All tools are open-source, self-hostable, and designed to work together. Total cost: R0/month after setup.
              </p>
            </div>
            {toolStack.map((tool, i) => (
              <motion.div
                key={tool.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-5 rounded-xl border bg-black/40"
                style={{ borderColor: `${tool.color}30` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{tool.icon}</span>
                    <div>
                      <div className="font-orbitron text-white font-black text-sm">{tool.name}</div>
                      <Badge className="text-xs font-rajdhani mt-1" style={{ background: `${tool.color}20`, color: tool.color }}>
                        {tool.role}
                      </Badge>
                    </div>
                  </div>
                  <a href={tool.link} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline" className="text-xs font-rajdhani border-white/10 text-gray-400 hover:text-white">
                      <Link className="w-3 h-3 mr-1" />
                      Visit
                    </Button>
                  </a>
                </div>
                <p className="text-gray-300 text-sm font-rajdhani mb-3">{tool.description}</p>
                <div className="p-3 rounded-lg bg-black/60 border border-white/5 mb-3">
                  <div className="text-gray-500 text-xs font-rajdhani mb-1">SETUP COMMAND / STEPS:</div>
                  <code className="text-green-400 text-xs font-mono">{tool.setup}</code>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3" style={{ color: tool.color }} />
                  <span className="text-xs font-rajdhani" style={{ color: tool.color }}>{tool.benefit}</span>
                </div>
              </motion.div>
            ))}
          </TabsContent>

          {/* OBSIDIAN SETUP TAB */}
          <TabsContent value="obsidian" className="space-y-4">
            <Card className="border-yellow-500/20 bg-black/40">
              <CardHeader>
                <CardTitle className="font-orbitron text-white text-sm flex items-center gap-2">
                  <span className="text-xl">💎</span>
                  Obsidian — Your Personal Knowledge Graph
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-300 font-rajdhani text-sm">
                  Obsidian is the foundation of your personal knowledge system. Every meeting note, idea, decision, and insight becomes a linked node in a visual knowledge graph. When connected to AnythingLLM, your Obsidian vault becomes the primary feed for your RAG system.
                </p>
                <div className="space-y-3">
                  {[
                    {
                      step: "1",
                      title: "Download & Install Obsidian",
                      detail: "Go to obsidian.md and download for your OS. Create a new vault called 'StudEx Brain'. This is your master knowledge repository.",
                      why: "Obsidian stores everything as plain Markdown files on your computer — no vendor lock-in, works forever, fully searchable.",
                    },
                    {
                      step: "2",
                      title: "Set Up Your Folder Structure",
                      detail: "Create folders: 📁 Meetings / 📁 Clients / 📁 Projects / 📁 Ideas / 📁 Agents / 📁 Daily Notes / 📁 Resources",
                      why: "A consistent structure means agents and AI can navigate your knowledge base predictably and find context reliably.",
                    },
                    {
                      step: "3",
                      title: "Install Essential Plugins",
                      detail: "Settings → Community Plugins → Enable: Dataview, Templater, Calendar, Obsidian Git, Excalidraw, AnythingLLM connector",
                      why: "Dataview lets you query your notes like a database. Templater auto-fills meeting templates. Git backs everything up automatically.",
                    },
                    {
                      step: "4",
                      title: "Create a Meeting Template",
                      detail: "In Templates folder, create 'Meeting.md' with: Date, Attendees, Agenda, Key Decisions, Action Items, Next Steps, [[Links to related notes]]",
                      why: "Consistent templates mean every meeting is structured the same way, making it easy for AI agents to extract key information.",
                    },
                    {
                      step: "5",
                      title: "Connect to AnythingLLM",
                      detail: "In AnythingLLM, add your Obsidian vault folder as a watched directory. New notes auto-index into the RAG system within minutes.",
                      why: "This creates a live bridge — every note you write in Obsidian immediately becomes searchable knowledge for all your AI agents.",
                    },
                    {
                      step: "6",
                      title: "Set Up Obsidian Sync (Optional)",
                      detail: "Subscribe to Obsidian Sync (R150/mo) to access your vault on mobile and across all devices. Alternatively use iCloud, Dropbox, or Git.",
                      why: "Your knowledge base should be accessible anywhere — on your phone after a client call, on your laptop in a meeting.",
                    },
                  ].map(step => (
                    <div key={step.step} className="flex gap-4 p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
                      <div className="font-orbitron text-2xl font-black flex-shrink-0" style={{ color: NEON_YELLOW }}>
                        {step.step}
                      </div>
                      <div>
                        <div className="text-white font-rajdhani font-bold text-sm mb-1">{step.title}</div>
                        <p className="text-gray-300 text-xs font-rajdhani mb-2">{step.detail}</p>
                        <div className="flex items-start gap-2">
                          <Zap className="w-3 h-3 text-yellow-400 flex-shrink-0 mt-0.5" />
                          <p className="text-yellow-400/80 text-xs font-rajdhani italic">{step.why}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
