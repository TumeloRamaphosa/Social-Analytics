import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { getLoginUrl } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import {
  LayoutDashboard, LogOut, PanelLeft, Search, Globe, Clock,
  Brain, Zap, Sparkles, Link, Bot, Cpu, BarChart2, BookOpen,
  Film, Share2, Plug, TrendingUp, Users, FileText, Layers,
  Calendar, Wand2, Mail, ChevronRight, Settings, UserCheck
} from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from './DashboardLayoutSkeleton';
import { Button } from "./ui/button";

// ── Navigation structure ──────────────────────────────────────────────────────

type NavItem = { icon: React.ElementType; label: string; path: string; badge?: string };
type NavSection = { title: string; items: NavItem[] };

const navSections: NavSection[] = [
  {
    title: "Command Centre",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
      { icon: BarChart2, label: "Social Analytics", path: "/analytics" },
      { icon: TrendingUp, label: "Social Report", path: "/social-report" },
    ],
  },
  {
    title: "Content",
    items: [
      { icon: Sparkles, label: "Content Studio", path: "/content" },
      { icon: Wand2, label: "Statics Generator", path: "/higgsfield" },
      { icon: Share2, label: "Multi-Publisher", path: "/publisher" },
      { icon: Calendar, label: "Content Calendar", path: "/calendar" },
    ],
  },
  {
    title: "Intelligence",
    items: [
      { icon: Search, label: "Analyse Website", path: "/analyze" },
      { icon: Brain, label: "Knowledge Brain", path: "/knowledge" },
      { icon: Cpu, label: "RAG Search", path: "/search" },
      { icon: Clock, label: "History", path: "/history" },
    ],
  },
  {
    title: "Connections",
    items: [
      { icon: Plug, label: "Composio Connect", path: "/composio" },
      { icon: Link, label: "Integrations", path: "/integrations" },
      { icon: Bot, label: "AI Chatbots", path: "/chatbots" },
      { icon: Layers, label: "MCP Server", path: "/mcp" },
    ],
  },
  {
    title: "Clients & Campaigns",
    items: [
      { icon: UserCheck, label: "Client Submissions", path: "/clients", badge: "New" },
      { icon: Users, label: "Safesight Portal", path: "/client/safesight" },
      { icon: Mail, label: "AgentMail Inbox", path: "/mailbox" },
    ],
  },
];

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const DEFAULT_WIDTH = 260;
const MIN_WIDTH = 200;
const MAX_WIDTH = 400;

// ── Main export ───────────────────────────────────────────────────────────────

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const { loading, user } = useAuth();

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  if (loading) return <DashboardLayoutSkeleton />;

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-8 p-8 max-w-md w-full">
          {/* Logo */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
              <Sparkles className="w-7 h-7 text-primary-foreground" />
            </div>
            <div className="text-center">
              <h1 className="font-display text-2xl font-bold text-foreground tracking-tight">DatAgentic</h1>
              <p className="text-sm text-muted-foreground mt-1">AI Social Intelligence Platform</p>
            </div>
          </div>
          <div className="w-full space-y-3">
            <p className="text-sm text-muted-foreground text-center">
              Sign in to access your management dashboard
            </p>
            <Button
              onClick={() => { window.location.href = getLoginUrl(); }}
              size="lg"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
            >
              Sign in to continue
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider style={{ "--sidebar-width": `${sidebarWidth}px` } as CSSProperties}>
      <DashboardLayoutContent setSidebarWidth={setSidebarWidth}>
        {children}
      </DashboardLayoutContent>
    </SidebarProvider>
  );
}

// ── Inner layout ──────────────────────────────────────────────────────────────

function DashboardLayoutContent({
  children,
  setSidebarWidth,
}: {
  children: React.ReactNode;
  setSidebarWidth: (w: number) => void;
}) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const activeLabel = navSections
    .flatMap(s => s.items)
    .find(i => i.path === location)?.label ?? "Dashboard";

  useEffect(() => {
    if (isCollapsed) setIsResizing(false);
  }, [isCollapsed]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const left = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const w = e.clientX - left;
      if (w >= MIN_WIDTH && w <= MAX_WIDTH) setSidebarWidth(w);
    };
    const onUp = () => setIsResizing(false);
    if (isResizing) {
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  return (
    <>
      <div className="relative" ref={sidebarRef}>
        <Sidebar
          collapsible="icon"
          className="border-r border-border bg-white"
          disableTransition={isResizing}
        >
          {/* ── Header ── */}
          <SidebarHeader className="h-16 border-b border-border">
            <div className="flex items-center gap-3 px-3 h-full">
              <button
                onClick={toggleSidebar}
                className="h-8 w-8 flex items-center justify-center hover:bg-muted rounded-lg transition-colors shrink-0"
                aria-label="Toggle navigation"
              >
                <PanelLeft className="h-4 w-4 text-muted-foreground" />
              </button>
              {!isCollapsed ? (
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
                    <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-display font-bold text-foreground text-sm leading-tight truncate">DatAgentic</p>
                    <p className="text-[10px] text-muted-foreground leading-tight">by StudEx DevOps</p>
                  </div>
                </div>
              ) : null}
            </div>
          </SidebarHeader>

          {/* ── Nav ── */}
          <SidebarContent className="gap-0 py-3">
            {navSections.map(section => (
              <div key={section.title} className="mb-1">
                {!isCollapsed ? (
                  <p className="px-4 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                    {section.title}
                  </p>
                ) : (
                  <div className="h-px mx-3 bg-border my-2" />
                )}
                <SidebarMenu className="px-2">
                  {section.items.map(item => {
                    const isActive = location === item.path;
                    return (
                      <SidebarMenuItem key={item.path}>
                        <SidebarMenuButton
                          isActive={isActive}
                          onClick={() => setLocation(item.path)}
                          tooltip={item.label}
                          className={`h-9 rounded-lg transition-all font-normal text-sm ${
                            isActive
                              ? "bg-pink-tint text-primary font-medium"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted"
                          }`}
                        >
                          <item.icon className={`h-4 w-4 shrink-0 ${isActive ? "text-primary" : ""}`} />
                          <span className="truncate">{item.label}</span>
                          {item.badge && !isCollapsed ? (
                            <span className="ml-auto text-[9px] font-semibold bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
                              {item.badge}
                            </span>
                          ) : null}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </div>
            ))}
          </SidebarContent>

          {/* ── Footer ── */}
          <SidebarFooter className="border-t border-border p-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-muted transition-colors w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Avatar className="h-8 w-8 border border-border shrink-0">
                    <AvatarFallback className="text-xs font-semibold bg-pink-tint text-primary">
                      {user?.name?.charAt(0).toUpperCase() ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                  {!isCollapsed ? (
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate leading-tight text-foreground">
                        {user?.name ?? "—"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate leading-tight mt-0.5">
                        {user?.email ?? "—"}
                      </p>
                    </div>
                  ) : null}
                  {!isCollapsed ? <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" /> : null}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>

        {/* Resize handle */}
        {!isCollapsed ? (
          <div
            className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/20 transition-colors"
            onMouseDown={() => setIsResizing(true)}
            style={{ zIndex: 50 }}
          />
        ) : null}
      </div>

      {/* ── Main content ── */}
      <SidebarInset className="bg-background">
        {isMobile ? (
          <div className="flex border-b border-border h-14 items-center justify-between bg-white px-4 sticky top-0 z-40">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="h-9 w-9 rounded-lg" />
              <span className="font-display font-semibold text-foreground text-sm">{activeLabel}</span>
            </div>
          </div>
        ) : null}
        <main className="flex-1 p-5">{children}</main>
      </SidebarInset>
    </>
  );
}
