# Nexus Social — Platform TODO

## Core Infrastructure
- [x] Database schema: analyses, analysisCache, ragIndex tables
- [x] tRPC routers: analysis, export
- [x] Web scraping engine with intelligent caching (analysisEngine.ts)
- [x] Rate limit handling and retry logic

## Feature 1: Website Analysis Tool
- [x] URL input form with validation
- [x] Domain info extraction (WHOIS, DNS, registration)
- [x] Business registration details
- [x] Analysis results display (Report.tsx)

## Feature 2: SEO & Performance Analysis
- [x] Page speed scoring
- [x] Meta tags extraction
- [x] Keyword detection
- [x] Technical SEO health score
- [ ] Backlink count estimation (requires external API)

## Feature 3: Social Media Presence Detection
- [x] Facebook page detection
- [x] Instagram profile detection
- [x] LinkedIn company detection
- [x] Twitter/X profile detection
- [x] TikTok profile detection
- [x] YouTube channel detection
- [ ] Live follower counts (requires platform APIs)

## Feature 4: Technology Stack Identification
- [x] CMS detection (WordPress, Shopify, etc.)
- [x] Framework detection (React, Vue, Angular, etc.)
- [x] Hosting provider identification
- [x] CDN detection
- [x] Analytics tools detection
- [x] Marketing platform detection

## Feature 5: Competitive Analysis
- [x] AI-generated SWOT analysis
- [x] Market positioning insights
- [x] Recommended actions
- [ ] Industry benchmark comparison (requires data source)

## Feature 6: Google Drive Export
- [x] Structured markdown report generation
- [x] S3 storage for reports
- [x] Download functionality
- [ ] Native Google Drive OAuth integration (requires Google API key)

## Feature 7: RAG Pipeline
- [x] ragIndex table for storing analysis chunks
- [x] Analysis data indexing (keyword-based)
- [x] Semantic search interface (Search.tsx)
- [ ] True vector embeddings (requires embedding model)

## Feature 8: Analysis History Dashboard
- [x] All previously analyzed websites list (History.tsx)
- [x] Search and filter history
- [x] Delete analyses
- [ ] Side-by-side comparison view (future)

## Feature 9: PDF Report Generation
- [x] HTML report generation with branded template
- [x] S3 upload and download link
- [ ] True PDF binary output (requires puppeteer/wkhtmltopdf)

## Feature 10: Real-time Web Scraping
- [x] Intelligent caching layer (analysisCache table)
- [x] Cache invalidation controls
- [x] Repeated analysis speed optimization

## UI/UX
- [x] Landing page with hero section and feature overview
- [x] Dashboard layout with sidebar navigation
- [x] Analysis form page (Analyze.tsx)
- [x] Report view page (Report.tsx)
- [x] History page (History.tsx)
- [x] RAG Search page (Search.tsx)
- [x] Dark theme with professional design

## Tests
- [x] Vitest tests for analysis router (7 tests passing)
- [x] Vitest tests for export router
- [x] Auth logout test

## Future Enhancements
- [ ] HubSpot CRM integration
- [ ] WhatsApp reporting integration
- [ ] Facebook auto-posting from analysis insights
- [ ] MCP server for external tool access
- [ ] True Google Drive OAuth sync
- [ ] Vector embeddings for RAG (OpenAI/DeepSeek)
- [ ] Competitor website tracking (scheduled re-analysis)
- [ ] White-label PDF with custom branding

## SaaS Expansion (New Requests)
- [x] Multi-tenant architecture (workspaces per client)
- [x] Subscription billing tiers (Starter / Pro / Agency)
- [x] White-label dashboard for reselling to clients
- [ ] Client onboarding flow

## Shopify Integration
- [x] Shopify OAuth / API key connection
- [x] Product catalogue sync
- [x] Sales and revenue analytics
- [ ] Abandoned cart tracking
- [ ] Shopify ad spend vs revenue ROAS dashboard

## Google Ads Integration
- [ ] Google Ads OAuth connection
- [ ] Campaign performance data (impressions, clicks, CPC, ROAS)
- [ ] Spend optimization recommendations
- [ ] Keyword performance analysis
- [ ] Budget allocation suggestions

## Content Management Platform
- [x] Content calendar with scheduling
- [x] AI content generation (Claude / nano banana skill)
- [x] Multi-platform publishing (Facebook, Instagram, WhatsApp)
- [ ] Content performance tracking
- [ ] Brand voice library
- [ ] Image generation for posts

## Content Analysis & Reporting
- [x] StudEx Meat content audit report
- [x] Spend optimization report
- [x] Content gap analysis
- [x] Recommended content strategy

## OpenClaw / External AI Integration
- [ ] OpenClaw API connection research and integration
- [ ] AI agent orchestration layer

## MCP Server Build
- [x] Standalone MCP server with all Nexus Social tools
- [x] Facebook & Instagram tools (get_analytics, post_content, get_insights)
- [x] Shopify tools (get_orders, get_products, get_revenue)
- [x] Content generation tools (generate_post, generate_image_prompt, get_content_plan)
- [x] Business analysis tools (analyse_website, get_report, search_rag)
- [ ] GitHub integration (connect_repo, read_file, list_files, trigger_workflow, create_issue)
- [x] WhatsApp tools (send_message, send_report)
- [x] MCP config JSON for Manus/Claude/Cursor connection
- [ ] Master Manual with step-by-step setup guide
- [ ] README with tool reference and examples

## Phase 2 Expansion — Full Social Media Command Centre SaaS
- [ ] Research-backed platform architecture blueprint
- [x] WhatsApp chatbot (Meta Cloud API + AI responses)
- [x] Instagram chatbot (DM automation + AI responses)
- [ ] Deep client analytics engine (full page/business 360° view)
- [ ] Social media engine automation (scheduling, auto-reply, content pipeline)
- [x] OpenClaw integration guide and API connection
- [ ] Client onboarding portal (white-label, multi-tenant)
- [ ] Command centre dashboard (real-time unified inbox)
- [x] MCP server with GitHub connectivity
- [ ] Master Manual PDF (beginner-friendly, step-by-step)

## 3D Website Redesign — Agentic Lab Showcase
- [x] Install Three.js, @react-three/fiber, @react-three/drei, framer-motion
- [x] 3D animated hero section with floating orbs, particle field, and neural network mesh
- [x] Agentic Lab brand section with 3D product cards
- [ ] Animated feature showcase with scroll-triggered 3D transitions
- [ ] Command centre dashboard with glassmorphism and 3D data visualisations
- [x] WhatsApp + Instagram chatbot UI pages
- [x] MCP server showcase page with live tool explorer
- [x] OpenClaw integration guide page
- [ ] SaaS pricing page with 3D card flip animations
- [ ] Client portfolio / case studies section
- [ ] Contact / onboarding CTA with 3D form

## Brand Redesign — StudEx D#VOP$ Cyberpunk Theme
- [x] Upload StudEx bull brand image to CDN
- [x] Redesign landing page hero with cyberpunk bull as centrepiece
- [x] Apply neon pink / dark city grid colour palette site-wide
- [x] Update CSS variables to match brand colours (hot pink, dark navy, cyan accents)
- [x] Glitch text effects on headings matching brand typography
- [x] Neon glow effects on buttons and cards
- [x] Circuit board / grid pattern background elements

## Detailed Pricing Page
- [x] Three-tier pricing cards (Starter, Pro, Agency) with full feature breakdowns
- [x] Feature comparison table across all tiers
- [x] FAQ accordion section
- [x] Annual/monthly billing toggle with savings badge
- [x] CTA buttons per tier
- [x] Pricing page route and navigation link

## In-House Rebrand & Deep Intelligence (Phase 3)
- [ ] Remove ad spend references from landing page and dashboard
- [ ] Rebrand as StudEx DevOps internal intelligence tool
- [ ] Connect live Facebook API data to analytics dashboard
- [ ] Connect live Instagram API data to analytics dashboard
- [ ] Deep analytics reports with AI-generated insights
- [ ] PDF report generation for Facebook/Instagram performance

## RAG & Knowledge Base (Phase 3)
- [ ] AnythingLLM integration guide and setup instructions
- [ ] Meeting transcript upload and storage (video call transcripts)
- [ ] RAG knowledge base page with semantic search
- [ ] Obsidian integration guide for knowledge management
- [ ] Visual RAG architecture diagram (Mermaid/D2)
- [ ] Client-facing RAG explainer document
- [ ] Founders Soul/MD file (business ideation and context)
- [ ] About Us page with founders section
- [ ] Long-term memory storage strategy document

## Skill Creation
- [ ] StudEx Social Intelligence reusable skill (skill-creator workflow)

## RAG Knowledge Search Fix (Active)
- [x] Expand ragIndex schema to support general knowledge documents (not just analyses)
- [x] Build knowledge.ts router with: ingestDocument, searchKnowledge, askBrain procedures
- [x] Seed knowledge base with research study data (OpenClaw, AI CRM, Africa gap) — 5 docs, 37 chunks
- [x] Wire KnowledgeBase.tsx "Ask Brain" to real LLM-powered RAG query
- [x] Show real search results with source citations in the UI
- [x] Add document management (list, delete knowledge entries)

## Higgsfield AI Studio Integration
- [x] Research Higgsfield API (REST, Bearer auth, text-to-image, image-to-video, text-to-video)
- [x] Add higgsfield to integrations enum in schema + higgsfieldApiKey and higgsfieldUsername fields
- [x] Apply migration (ALTER TABLE integrations)
- [x] Build higgsfield.ts router: connect, disconnect, testConnection, generateImage, generateVideo, generateTextToVideo, getGenerationStatus, listGenerations
- [x] Register higgsfieldRouter in main routers.ts
- [x] Build HiggsfieldStudio.tsx page with connect flow, 3-tab generation UI, polling, and result preview
- [x] Add Higgsfield Studio to sidebar nav (Film icon)
- [x] Add /higgsfield route to App.tsx
- [x] All 27 tests passing

## Safesight–LAISA Digital Intelligence Report Website
- [x] Build SafesightReport.tsx — full interactive intelligence report website
- [x] Install chart.js + react-chartjs-2 for interactive charts
- [x] Add /safesight route to App.tsx
- [x] All sections: Hero, Metrics, Competitors, Platform, Security, Roadmap, Projection, Why Now, CTA
- [x] Interactive Chart.js charts: maturity bar, competitor FB/IG bars, revenue line + uplift bar
- [x] Competitor table with threat levels
- [x] Three-point security architecture (Mac Mini + on-site + Google Cloud)
- [x] Nine Naledi AI agents breakdown
- [x] ML Vision Cameras section
- [x] Three-phase roadmap with milestones
- [x] Revenue projection table with monthly uplift
- [x] Save checkpoint and deploy

## Safesight–LAISA Client Portal & Facebook Ads Intelligence
- [x] Build facebookAds.ts router — real Graph API: ad accounts, spend summary, campaigns, ad performance, audience insights, AI analysis, organic replacement
- [x] Register facebookAds router in main routers.ts
- [x] Build SafesightPortal.tsx — white-label client portal with live FB Ads data, 5 tabs (Overview, Campaigns, Ad Performance, Audience, AI Insights)
- [x] Add /client/safesight route to App.tsx
- [x] Upgrade ContentStudio.tsx — Replace Ads tab with underperforming ad detection and organic content replacement
- [x] Weekly Planner → Generate This Post flow
- [x] All TypeScript errors resolved (0 errors)

## Platform Upgrade — Autonomous Social Command Centre

### Connections & Publishing
- [ ] Reconnect WhatsApp via Composio (guide user through reconnect flow in UI)
- [ ] Wire Facebook posting into Content Studio via Composio FACEBOOK_CREATE_POST
- [ ] Wire Instagram posting into Content Studio via Composio INSTAGRAM_POST_IG_USER_MEDIA + PUBLISH
- [ ] Add multi-platform publish button (Facebook + Instagram + Discord + Gmail in one click)
- [ ] Remove /pricing page and nav link

### Advanced Dashboard
- [ ] Rebuild dashboard with live multi-platform analytics (FB + IG data via Composio)
- [ ] Add AI strategy advisor panel — reads data, advises what to post and when
- [ ] Add content calendar with AI-suggested posting schedule
- [ ] Add competitor tracking panel

### Content Creation Pipeline
- [ ] Integrate social-agents repo patterns (data → analysis → strategy → content loop)
- [ ] Integrate Content Creation Agents repo patterns
- [ ] Add Remotion video generation (programmatic video from templates)
- [ ] Add LTX Studio / Stable Diffusion image generation pipeline
- [ ] Add content performance prediction before posting

### Multi-Platform Publisher
- [ ] Post to Facebook Pages via Composio
- [ ] Post to Instagram Feed + Reels via Composio
- [ ] Post to LinkedIn via Composio
- [ ] Post to Discord channels via Composio
- [ ] Send via Gmail campaigns via Composio
- [ ] Post to WhatsApp (once reconnected)
- [ ] Scheduling queue with optimal time suggestions

## DatAgentic Rebrand & Major Platform Upgrade (Phase 4)
- [ ] Rebrand to DatAgentic by StudEx DevOps — update app title, logo text, nav, home page
- [ ] Rename Higgsfield Studio to Statics Content Generator
- [ ] Remove /pricing route, replace with SaaS plans page (/plans)
- [ ] Build 4 SaaS product tiers with per-account pricing
- [ ] Build Content Calendar — drag-and-drop, Kanban, table view (/calendar)
- [ ] Build Kanban-style command centre dashboard
- [ ] Add all Composio connections — Google Ads, ElevenLabs, Slack, Discord, WhatsApp, Shopify, Facebook, Instagram
- [ ] Wire Content Creation Agents (Media Analyst, Content Writer, SEO Optimizer) into Content Studio
- [ ] Add social-agents platform-specific posting rules (Instagram, Facebook, LinkedIn, TikTok, Twitter)
- [ ] Build AI Strategy Advisor — reads all data, generates strategy with recommendations
- [ ] Fix all TypeScript errors and broken routes
- [ ] Maintain dark neon command centre design throughout all pages
- [ ] Push to GitHub

## Session 5 Completions (May 16 2026)
- [x] Fix ContentCalendar.tsx TypeScript errors (FileText import + Platform type mismatch)
- [x] Build ContentCalendar.tsx — Kanban, Calendar, Table views with drag-and-drop
- [x] Update App.tsx — /calendar now routes to ContentCalendar (not MultiPublisher)
- [x] Build SaaSPlans.tsx — 4 tiers: Starter (R999), Pro (R2499), Agency (R7999), Enterprise (custom)
- [x] Add /plans route to App.tsx
- [x] Rename HiggsfieldStudio.tsx UI text to "Statics Content Generator"
- [x] Update DashboardLayout.tsx — Higgsfield nav item renamed to Statics Content Gen
- [x] Add SaaS Plans to DashboardLayout sidebar nav
- [x] TypeScript: 0 errors confirmed

## Phase 5 — Design Redesign & Advanced Features (May 16 2026)
- [ ] Apply new light design system: YAML/neon-pink/cream-white (UI/UX Pro Max SaaS pattern)
- [ ] Update index.css CSS variables for light theme (cream white bg, neon pink primary, soft purple accent)
- [ ] Update index.html fonts: Inter + Space Grotesk from Google Fonts
- [ ] Update DashboardLayout sidebar to match new light design
- [ ] Remove Pricing page from nav and routes
- [ ] Remove SaaS Plans from client-facing nav
- [ ] Build three-agent content pipeline backend: runAgentPipeline procedure (Media Analyst → Content Writer → SEO Optimizer)
- [ ] Build advanced Command Centre dashboard: multi-platform KPI grid + AI Strategy Advisor panel
- [ ] Wire three-agent pipeline into Content Studio UI with one-click trigger and live step progress
- [ ] Build 3 client portal variants (Safesight, StudEx Meat, Generic) without pricing
- [ ] Push all changes to GitHub (TumeloRamaphosa/Social-Analytics)

## Phase 6 — Full Platform Redesign & Two-Sided Client Portal (May 16 2026)
- [ ] Apply sophisticated light cream/neon-pink/purple design system globally
- [ ] Redesign index.css with new CSS variables, Space Grotesk + Inter fonts
- [ ] Redesign DashboardLayout with new theme
- [ ] Remove Pricing from management nav
- [ ] Build public Client Onboarding landing page (no auth required)
- [ ] Build asset submission form (website URL, social links, follower counts, goals)
- [ ] Build AI analysis backend procedure (LLM analyses submitted assets)
- [ ] Store client submissions + AI results in DB
- [ ] Send proposal email via AgentMail after analysis
- [ ] Build invite-only client dashboard (locked until owner grants access)
- [ ] Client dashboard shows their strategy, analytics, content plan
- [ ] Management view of all client submissions + ability to approve/invite
- [ ] AgentMail mailbox wired into sidebar

## Session 6 Completions (May 16, 2026)
- [x] Apply new light design system (cream/neon-pink/purple) to DashboardLayout
- [x] Redesign DashboardLayout sidebar with grouped nav sections
- [x] Build Client Onboarding Portal (public landing page + asset submission form)
- [x] Build Client Portal (invite-only dashboard with AI strategy display)
- [x] Build Client Submissions management page (review, analyse, approve leads)
- [x] Build advanced Command Centre dashboard with multi-platform KPIs and AI advisor
- [x] Remove Pricing section from Home.tsx and nav
- [x] Build AgentMail mailbox page (inbox, thread reader, compose, campaigns)
- [x] Add clientLeads and clientPortalSessions database tables
- [x] Build clientPortal.ts router (submitLead, analyseLead, approveLead, listLeads, accessPortal)
- [x] Register agentmail and clientPortal routers in main routers.ts

## Remaining Work (Next Agent)
- [ ] Wire three-agent content pipeline into Content Studio (Media Analyst → Content Writer → SEO Optimizer)
- [ ] Build Google Ads dashboard with live campaign data via Composio
- [ ] Add PIN gate to client portals
- [ ] Apply light design system to all remaining pages (ContentCalendar, ContentStudio, etc.)
- [ ] Build 3 branded client portal variants (Safesight, StudEx Meat, Generic)
- [ ] Wire Facebook + Instagram live data into Command Centre KPIs
- [ ] Add multi-platform publish button (one-click to FB + IG + Discord)
- [ ] Test full client onboarding flow end-to-end
- [ ] Add AgentMail inbox to sidebar nav
