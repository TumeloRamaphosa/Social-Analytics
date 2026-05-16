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
import KnowledgeBase from "./pages/KnowledgeBase";
import Analytics from "./pages/Analytics";
import About from "./pages/About";
import HiggsfieldStudio from "@/pages/HiggsfieldStudio";
import SafesightReport from "@/pages/SafesightReport";
import SafesightPortal from "@/pages/SafesightPortal";
import ComposioIntegrations from "@/pages/ComposioIntegrations";
import MultiPublisher from "@/pages/MultiPublisher";
import SocialIntelligenceReport from "@/pages/SocialIntelligenceReport";
import ContentCalendar from "@/pages/ContentCalendar";
import AgentMailbox from "@/pages/AgentMailbox";
import ClientOnboarding from "@/pages/ClientOnboarding";
import ClientPortal from "@/pages/ClientPortal";
import ClientSubmissions from "@/pages/ClientSubmissions";

function Router() {
  return (
    <Switch>
      {/* Public */}
      <Route path="/" component={Home} />
      <Route path="/get-started" component={ClientOnboarding} />
      <Route path="/portal" component={ClientPortal} />

      {/* Management */}
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/analyze" component={Analyze} />
      <Route path="/report/:id" component={Report} />
      <Route path="/history" component={History} />
      <Route path="/search" component={Search} />
      <Route path="/content" component={ContentStudio} />
      <Route path="/integrations" component={Integrations} />
      <Route path="/saas" component={SaaS} />
      <Route path="/chatbots" component={Chatbots} />
      <Route path="/mcp" component={MCPServer} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/knowledge" component={KnowledgeBase} />
      <Route path="/about" component={About} />
      <Route path="/higgsfield" component={HiggsfieldStudio} />
      <Route path="/safesight" component={SafesightReport} />
      <Route path="/client/safesight" component={SafesightPortal} />
      <Route path="/composio" component={ComposioIntegrations} />
      <Route path="/publisher" component={MultiPublisher} />
      <Route path="/social-report" component={SocialIntelligenceReport} />
      <Route path="/calendar" component={ContentCalendar} />
      <Route path="/mailbox" component={AgentMailbox} />
      <Route path="/clients" component={ClientSubmissions} />

      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
