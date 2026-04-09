/**
 * Seed script: Ingests the StudEx research study into the RAG knowledge base
 * Run with: node scripts/seed-knowledge.mjs
 */
import mysql from "mysql2/promise";

const DATABASE_URL = process.env.DATABASE_URL;

function chunkText(text, chunkSize = 500) {
  const paragraphs = text.split(/\n{2,}/);
  const chunks = [];
  let current = "";
  for (const para of paragraphs) {
    if ((current + para).length > chunkSize && current.length > 0) {
      chunks.push(current.trim());
      current = para;
    } else {
      current += (current ? "\n\n" : "") + para;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.filter(c => c.length > 30);
}

const KNOWLEDGE_DOCS = [
  {
    title: "OpenClaw & DenchClaw — Agentic AI Research",
    source: "Nexus Research",
    docType: "research",
    tags: ["openclaw", "denchclaw", "agentic-ai", "crm"],
    content: `OpenClaw is the fastest-growing open-source project in GitHub history. It surpassed Linux's 33-year GitHub star count in under 180 days. OpenAI acquired OpenClaw in February 2026. NVIDIA built an enterprise hardening layer on top of it called NemoClaw. Jensen Huang said at GTC 2026: "Every software company in the world needs to have an OpenClaw strategy."

OpenClaw is a protocol — not a product. It defines a standard way for AI agents to communicate with each other, share context, delegate tasks, and coordinate actions. Think of it as the HTTP of the agentic era. Just as HTTP allowed any browser to talk to any web server, OpenClaw allows any AI agent to talk to any other AI agent.

DenchClaw (dench.com/claw) is the most polished CRM product built on OpenClaw. It is local-first, installs in under a minute, uses your Chrome profile to act as you on LinkedIn and Gmail, and integrates with 50+ tools including Obsidian, Notion, Salesforce, and WhatsApp. DenchClaw is designed for sales teams and agencies who want AI to handle prospecting, follow-ups, and relationship management automatically.

Key DenchClaw capabilities:
- Autonomous LinkedIn outreach and connection management
- Gmail integration for AI-drafted follow-up emails
- CRM data enrichment from public sources
- Meeting scheduling and preparation briefs
- Integration with Obsidian, Notion, Salesforce, HubSpot
- WhatsApp Business API integration
- Local-first architecture — data stays on your machine

The OpenClaw ecosystem is expanding rapidly. Tencent integrated WeChat with OpenClaw in March 2026. Baidu built a full agent ecosystem on it. Microsoft added OpenClaw support to Copilot Studio. Salesforce's Agentforce is built on OpenClaw principles.

NVIDIA's NemoClaw adds enterprise guardrails to OpenClaw: content filtering, audit logging, role-based access control, and compliance monitoring. This makes it suitable for regulated industries like finance, healthcare, and legal.

For StudEx DevOps, DenchClaw represents the CRM AI layer of the command centre. It can automate client outreach, manage follow-ups, enrich contact data, and feed insights back into the RAG knowledge base.`,
  },
  {
    title: "Global AI SaaS CRM Market — Pricing & Competitive Landscape 2026",
    source: "Nexus Research",
    docType: "research",
    tags: ["crm", "saas", "pricing", "ai-agencies", "market-research"],
    content: `The global AI CRM market is undergoing a fundamental shift from copilot AI (AI that suggests) to agentic AI (AI that does). This is the most significant transition in enterprise software since the move from on-premise to cloud.

Key market data for 2026:
- Salesforce Agentforce: $540M ARR, 11,000 enterprise customers
- HubSpot Breeze Agents: 279,000+ customers, $2.4B revenue
- Gartner prediction: 40% of enterprise apps will embed AI agents by end of 2026 (up from less than 5% in 2025)
- Only 11% of organisations are running agentic AI in production today
- The "GaaS" (Guidance as a Service) model is replacing SaaS — charging per outcome, not per seat

Top AI CRM tools and pricing:
1. Salesforce Agentforce — $75/user/month + $2/conversation for agents. Enterprise-grade. Best for large organisations.
2. HubSpot with Breeze — $800-$3,600/month. Best for mid-market. Strong marketing automation.
3. Pipedrive AI — $49-$99/user/month. Best for sales-focused SMBs.
4. Zoho CRM with Zia AI — $14-$52/user/month. Best value for budget-conscious teams.
5. Monday.com CRM — $12-$20/user/month. Best for project-centric teams.
6. DenchClaw — Free tier + $29/month Pro. Best for agentic automation. Local-first.
7. Clay — $149-$800/month. Best for data enrichment and outreach automation.
8. Instantly AI — $97-$358/month. Best for cold email at scale.

What AI agencies are selling in 2026:
- AI chatbot setup and integration: $2,500-$15,000 one-time + $500-$2,000/month retainer
- Social media AI automation: $1,500-$8,000/month
- Custom AI agent development: $10,000-$100,000+ per project
- RAG knowledge base setup: $5,000-$25,000 one-time
- AI CRM implementation: $5,000-$50,000 one-time
- White-label AI SaaS platforms: $500-$5,000/month per client

The value proposition AI agencies use:
- Time savings: "Replace 40 hours of manual work per week"
- Revenue impact: "Increase conversion rates by 23% through AI follow-ups"
- Cost reduction: "Replace $8,000/month in human labour with $800/month AI system"
- Competitive advantage: "Be the first in your industry to have AI agents"

For StudEx DevOps, the opportunity is to build and sell these solutions locally in South Africa where the market is largely untapped and pricing can be competitive.`,
  },
  {
    title: "Africa vs World AI Gap — Research & Analysis 2026",
    source: "Nexus Research",
    docType: "research",
    tags: ["africa", "south-africa", "ai-adoption", "market-gap", "opportunity"],
    content: `Africa's AI adoption rate sits at 9.38% — the lowest of any region globally. North America leads at 31.65%, followed by Europe at 24.2%, Asia-Pacific at 22.1%, Latin America at 18.3%, and the Middle East at 14.7%.

However, this gap is not a weakness — it is a first-mover advantage. The organisations and agencies that build AI capabilities now in Africa will dominate the next decade.

South Africa AI landscape:
- Highest AI-readiness score in Africa: 55.23/100 (Oxford Internet Institute)
- Individual AI adoption: 17% (comparable to USA at 18%)
- GDP contribution of digital economy: 8.2% and growing
- Key AI hubs: Johannesburg, Cape Town, Durban
- Leading companies: Synthesis AI, DataProphet, Aerobotics, Luno

The gap is primarily at the infrastructure and investment level, not individual capability:
- Africa receives less than 1% of global AI investment
- Infrastructure challenges: power reliability, internet bandwidth
- Skills gap: limited AI engineering talent pipeline
- Regulatory uncertainty: no comprehensive AI framework yet

Countries leading AI in Africa:
1. South Africa — most mature ecosystem, strongest regulatory framework
2. Kenya — highest mobile AI adoption, M-Pesa AI integration
3. Nigeria — largest tech startup ecosystem, 700+ AI startups
4. Egypt — government AI strategy, Cairo AI hub
5. Rwanda — government-led AI adoption, drone delivery infrastructure

Global comparison:
- China: 2nd highest AI investment globally ($15.6B in 2025). WeChat integrated with OpenClaw March 2026. Baidu's Ernie Bot has 200M+ users. Government mandates AI adoption across industries.
- India: Highest individual AI adoption rate globally (36%). 3rd in AI startup funding. Strong engineering talent pipeline. Government's IndiaAI mission ($1.2B investment).
- Brazil: 21% individual adoption. Latin America's largest AI market. Strong fintech AI integration. São Paulo emerging as AI hub.
- South America broadly: 18.3% average adoption. Chile and Colombia leading after Brazil.

The "leapfrog opportunity" for Africa:
Africa has historically leapfrogged legacy infrastructure (e.g., mobile banking before desktop banking). The same pattern is emerging with AI — African businesses can adopt agentic AI without the legacy system debt that slows Western enterprises.

For StudEx DevOps, this means:
- First-mover advantage in South Africa's AI agency market
- Ability to charge premium prices for expertise that is scarce locally
- Opportunity to build solutions tailored to African business contexts
- Export potential: solutions built for Africa can be sold across the continent`,
  },
  {
    title: "RAG (Retrieval-Augmented Generation) — What It Is and Why It Matters",
    source: "Nexus Research",
    docType: "research",
    tags: ["rag", "ai", "knowledge-base", "anythingllm", "obsidian"],
    content: `RAG (Retrieval-Augmented Generation) is the process of giving an AI model access to your own private knowledge before it generates a response. Instead of the AI only knowing what it was trained on, it first searches your documents, transcripts, and notes — then answers based on your actual data.

How RAG works (step by step):
1. INGEST: You upload documents (PDFs, meeting notes, transcripts, reports) into the system
2. CHUNK: The system splits documents into ~500-character segments called "chunks"
3. EMBED: Each chunk is converted into a mathematical vector (embedding) that captures its meaning
4. STORE: Vectors are stored in a vector database (ChromaDB, Pinecone, Weaviate)
5. QUERY: When you ask a question, your question is also converted to a vector
6. RETRIEVE: The system finds the chunks whose vectors are closest to your question vector
7. GENERATE: The AI model receives your question + the retrieved chunks as context, then generates an answer

Why RAG is the foundation of AI right now:
- Large language models (LLMs) have a knowledge cutoff — they don't know what happened after their training date
- LLMs hallucinate — they make up facts when they don't know something
- LLMs don't know your private data — your meeting notes, client history, internal decisions
- RAG solves all three problems by grounding the AI in your actual, current, private knowledge

The business value of RAG for StudEx:
- Every meeting transcript becomes queryable: "What did we decide about the Q1 strategy?"
- Every client call becomes institutional memory: "What did TechCorp say about their budget?"
- Every research document becomes accessible: "What is the Africa AI adoption rate?"
- New team members can instantly access all historical context
- AI agents can make decisions based on company history and strategy

Recommended RAG stack for StudEx DevOps:
1. AnythingLLM (anythingllm.com/desktop) — Local RAG hub, privacy-first, free
2. Obsidian (obsidian.md) — Knowledge graph, Markdown-based, feeds into RAG
3. Whisper AI — Speech-to-text for meeting recordings, open-source
4. ChromaDB — Vector database, built into AnythingLLM
5. N8N — Automation pipeline connecting all tools
6. DeepSeek — AI model for generating answers (preferred)

Total cost after setup: R0/month (all open-source, self-hosted)

The Obsidian + AnythingLLM combination is particularly powerful:
- Write meeting notes in Obsidian using a consistent template
- AnythingLLM watches the Obsidian vault folder
- New notes are automatically indexed within minutes
- Any team member or AI agent can then query: "What was decided in the last client meeting?"

For agents specifically, the RAG is their long-term memory. Without RAG, each agent conversation starts fresh with no context. With RAG, agents can reference past decisions, client preferences, strategy documents, and meeting outcomes — making them dramatically more effective.`,
  },
  {
    title: "StudEx DevOps — Command Centre Architecture & Strategy",
    source: "Internal Strategy",
    docType: "strategy",
    tags: ["studex", "command-centre", "architecture", "strategy", "devops"],
    content: `StudEx DevOps is building an in-house AI Command Centre — a unified intelligence platform that connects social media, CRM, knowledge management, and agentic automation into a single operational system.

The platform is being built for internal use first, then packaged and sold to clients as a SaaS product.

Five-layer architecture:
1. INTELLIGENCE LAYER — Nexus Social Dashboard (React + tRPC)
   - Facebook Graph API integration
   - Instagram Graph API integration
   - WhatsApp Business API integration
   - Real-time analytics and reporting

2. AGENT LAYER — OpenClaw Runtime
   - DenchClaw CRM Agent (autonomous outreach and relationship management)
   - Social Intelligence Agent (content analysis and recommendations)
   - Report Generator Agent (automated PDF reports)
   - Outreach Agent (multi-channel prospecting)
   - Meeting Transcription Agent (Whisper AI integration)
   - Knowledge Retrieval Agent (RAG queries for context)

3. MEMORY LAYER — RAG Knowledge Base
   - AnythingLLM (vector store + retrieval)
   - Obsidian (Markdown knowledge graph)
   - Meeting transcripts, call recordings, client notes
   - SOUL.md (business ideation and founding vision)
   - Strategy documents and research

4. AUTOMATION LAYER — N8N Workflows
   - N8N workflow engine
   - DeepSeek AI model (preferred)
   - Triggers, webhooks, cron jobs
   - Connects all layers automatically

5. STORAGE LAYER
   - DuckDB (local structured data)
   - S3 / Cloudflare R2 (cloud file storage)
   - MySQL / TiDB (Nexus Social database)
   - Vector DB (embeddings)

The value proposition for clients:
- Replace manual social media management with AI automation
- Get deep analytics on Facebook, Instagram, WhatsApp performance
- Build institutional memory through RAG knowledge base
- Automate client outreach and follow-ups with DenchClaw
- Generate professional PDF reports automatically
- Have AI agents that understand your business context

Pricing strategy for client sales:
- Starter: R5,000 setup + R2,500/month
- Pro: R15,000 setup + R8,000/month
- Agency: R35,000 setup + R20,000/month

The platform is designed to solve StudEx's own problems first — then the solutions become the product.`,
  },
];

async function main() {
  if (!DATABASE_URL) {
    console.error("DATABASE_URL environment variable not set");
    process.exit(1);
  }

  const conn = await mysql.createConnection(DATABASE_URL);
  console.log("Connected to database");

  // Get the first user (owner)
  const [users] = await conn.execute("SELECT id FROM users LIMIT 1");
  if (!users || users.length === 0) {
    console.log("No users found — seed will use userId=1 as placeholder");
  }
  const userId = users?.[0]?.id || 1;
  console.log(`Using userId: ${userId}`);

  for (const doc of KNOWLEDGE_DOCS) {
    // Check if already exists
    const [existing] = await conn.execute(
      "SELECT id FROM knowledgeDocs WHERE title = ? AND userId = ?",
      [doc.title, userId]
    );
    if (existing.length > 0) {
      console.log(`Skipping (already exists): ${doc.title}`);
      continue;
    }

    // Insert document
    const [result] = await conn.execute(
      "INSERT INTO knowledgeDocs (userId, title, source, docType, content, tags, chunkCount) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [userId, doc.title, doc.source, doc.docType, doc.content, JSON.stringify(doc.tags), 0]
    );
    const docId = result.insertId;

    // Chunk and index
    const chunks = chunkText(doc.content);
    for (const chunk of chunks) {
      await conn.execute(
        "INSERT INTO ragIndex (chunkType, content) VALUES (?, ?)",
        [`doc_${doc.docType}`, `[${doc.title}] ${chunk}`]
      );
    }

    // Update chunk count
    await conn.execute(
      "UPDATE knowledgeDocs SET chunkCount = ? WHERE id = ?",
      [chunks.length, docId]
    );

    console.log(`✓ Ingested: "${doc.title}" — ${chunks.length} chunks`);
  }

  await conn.end();
  console.log("\n✅ Knowledge base seeded successfully!");
  console.log("You can now use the Super Brain to query this data.");
}

main().catch(err => {
  console.error("Seed failed:", err);
  process.exit(1);
});
