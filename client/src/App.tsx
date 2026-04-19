import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Analyze from "./pages/Analyze";
import Report from "./pages/Report";
import History from "./pages/History";
import Search from "./pages/Search";
import ContentStudio from "./pages/ContentStudio";
import Integrations from "./pages/Integrations";
import SaaS from "./pages/SaaS";
import Chatbots from "./pages/Chatbots";
import MCPServer from "./pages/MCPServer";
import Pricing from "./pages/Pricing";
import KnowledgeBase from "./pages/KnowledgeBase";
import Analytics from "./pages/Analytics";
import About from "./pages/About";
import HiggsfieldStudio from "@/pages/HiggsfieldStudio";
import TokenGauge from "@/pages/TokenGauge";
import ApprovalWorkflow from "@/pages/ApprovalWorkflow";
import ResearchHub from "@/pages/ResearchHub";
import LocalModels from "@/pages/LocalModels";
import SafesightReport from "@/pages/SafesightReport";
import SocialIntelligenceReport from "@/pages/SocialIntelligenceReport";
import SafesightPortal from "@/pages/SafesightPortal";
import SystemMonitor from "@/pages/SystemMonitor";
import AgentSimulation from "@/pages/AgentSimulation";
import MarketingSkills from "@/pages/MarketingSkills";
import AdminPanel from "@/pages/AdminPanel";
import AnalyticsReport from "@/pages/AnalyticsReport";
import InfluencerTracking from "@/pages/InfluencerTracking";
import SkillsAndAgents from "@/pages/SkillsAndAgents";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/analyze" component={Analyze} />
      <Route path="/report/:id" component={Report} />
      <Route path="/history" component={History} />
      <Route path="/search" component={Search} />
      <Route path="/content" component={ContentStudio} />
      <Route path="/integrations" component={Integrations} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/saas" component={SaaS} />
      <Route path="/chatbots" component={Chatbots} />
      <Route path="/mcp" component={MCPServer} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/knowledge" component={KnowledgeBase} />
      <Route path="/about" component={About} />
      <Route path="/higgsfield" component={HiggsfieldStudio} />
      <Route path="/tokens" component={TokenGauge} />
      <Route path="/approval" component={ApprovalWorkflow} />
      <Route path="/research" component={ResearchHub} />
      <Route path="/local-models" component={LocalModels} />
      <Route path="/safesight" component={SafesightReport} />
      <Route path="/social-intelligence" component={SocialIntelligenceReport} />
      <Route path="/client/safesight" component={SafesightPortal} />
      <Route path="/system" component={SystemMonitor} />
      <Route path="/agents" component={AgentSimulation} />
      <Route path="/marketing-skills" component={MarketingSkills} />
      <Route path="/admin" component={AdminPanel} />
      <Route path="/analytics-report" component={AnalyticsReport} />
      <Route path="/influencers" component={InfluencerTracking} />
      <Route path="/skills" component={SkillsAndAgents} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
