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
