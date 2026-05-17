import { useState, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Calendar, Plus, Facebook, Instagram, MessageSquare, Mail,
  Sparkles, Clock, CheckCircle2, Edit3, Trash2, GripVertical,
  LayoutGrid, List, CalendarDays, Zap, Target, TrendingUp,
  ChevronLeft, ChevronRight, MoreHorizontal, FileText
} from "lucide-react";
import { trpc } from "@/lib/trpc";

// ── Types ────────────────────────────────────────────────────────────────────
type Platform = "facebook" | "instagram" | "discord" | "gmail" | "whatsapp";
type Status = "idea" | "draft" | "scheduled" | "published" | "failed";

interface ContentItem {
  id: string;
  title: string;
  content: string;
  platforms: Platform[];
  status: Status;
  scheduledAt: Date;
  aiGenerated: boolean;
  tags: string[];
}

// ── Constants ─────────────────────────────────────────────────────────────────
const PLATFORM_CONFIG: Record<Platform, { label: string; color: string; icon: React.ElementType }> = {
  facebook: { label: "Facebook", color: "#1877F2", icon: Facebook },
  instagram: { label: "Instagram", color: "#E1306C", icon: Instagram },
  discord: { label: "Discord", color: "#5865F2", icon: MessageSquare },
  gmail: { label: "Gmail", color: "#EA4335", icon: Mail },
  whatsapp: { label: "WhatsApp", color: "#25D366", icon: MessageSquare },
};

const STATUS_CONFIG: Record<Status, { label: string; color: string }> = {
  idea: { label: "Idea", color: "bg-muted text-muted-foreground border border-border" },
  draft: { label: "Draft", color: "bg-yellow-50 text-yellow-700 border border-yellow-200" },
  scheduled: { label: "Scheduled", color: "bg-blue-50 text-blue-700 border border-blue-200" },
  published: { label: "Published", color: "bg-green-50 text-green-700 border border-green-200" },
  failed: { label: "Failed", color: "bg-red-50 text-red-700 border border-red-200" },
};

const KANBAN_COLUMNS: Status[] = ["idea", "draft", "scheduled", "published"];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

// ── Sample Data ───────────────────────────────────────────────────────────────
const SAMPLE_ITEMS: ContentItem[] = [
  {
    id: "1",
    title: "Monday Motivation — Premium Halaal Beef",
    content: "Start your week right with the finest Halaal beef. Our cattle are ethically raised and hand-selected for quality you can taste. 🥩✨",
    platforms: ["facebook", "instagram"],
    status: "scheduled",
    scheduledAt: new Date(2026, 4, 19, 9, 0),
    aiGenerated: true,
    tags: ["motivation", "halaal", "quality"],
  },
  {
    id: "2",
    title: "Behind the Scenes — Butchery Process",
    content: "Ever wondered how we ensure every cut meets our premium standard? Here's a look behind the scenes at our quality control process.",
    platforms: ["instagram", "facebook"],
    status: "draft",
    scheduledAt: new Date(2026, 4, 20, 12, 0),
    aiGenerated: false,
    tags: ["bts", "quality", "process"],
  },
  {
    id: "3",
    title: "Weekend Braai Special Announcement",
    content: "🔥 This weekend only — premium braai packs at 20% off. Order before Friday midnight. Link in bio.",
    platforms: ["facebook", "instagram", "whatsapp"],
    status: "idea",
    scheduledAt: new Date(2026, 4, 22, 10, 0),
    aiGenerated: true,
    tags: ["promo", "braai", "weekend"],
  },
  {
    id: "4",
    title: "Customer Testimonial — Johannesburg",
    content: "\"Best beef I've ever had — the quality is unmatched.\" — Sipho M., Johannesburg. Thank you for the love! 🙏",
    platforms: ["facebook"],
    status: "published",
    scheduledAt: new Date(2026, 4, 16, 8, 0),
    aiGenerated: false,
    tags: ["testimonial", "social-proof"],
  },
  {
    id: "5",
    title: "Recipe: 30-Minute Beef Stew",
    content: "Quick, hearty, and made with our premium chuck roast. Full recipe in the comments below 👇",
    platforms: ["instagram", "facebook"],
    status: "scheduled",
    scheduledAt: new Date(2026, 4, 21, 18, 0),
    aiGenerated: true,
    tags: ["recipe", "content", "engagement"],
  },
  {
    id: "6",
    title: "Weekly Newsletter — Deals & Tips",
    content: "This week's deals, new stock arrivals, and a special recipe from our head butcher.",
    platforms: ["gmail"],
    status: "draft",
    scheduledAt: new Date(2026, 4, 23, 8, 0),
    aiGenerated: false,
    tags: ["newsletter", "email"],
  },
];

// ── Platform Badge ─────────────────────────────────────────────────────────────
function PlatformBadge({ platform }: { platform: Platform }) {
  const cfg = PLATFORM_CONFIG[platform];
  const Icon = cfg.icon;
  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium"
      style={{ backgroundColor: cfg.color + "22", color: cfg.color, border: `1px solid ${cfg.color}44` }}
    >
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}

// ── Content Card ───────────────────────────────────────────────────────────────
function ContentCard({
  item,
  onEdit,
  onDelete,
  draggable = false,
  onDragStart,
}: {
  item: ContentItem;
  onEdit: (item: ContentItem) => void;
  onDelete: (id: string) => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent, id: string) => void;
}) {
  const statusCfg = STATUS_CONFIG[item.status];
  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart ? (e) => onDragStart(e, item.id) : undefined}
      className="bg-white border border-border rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-primary/30 hover:shadow-sm transition-all group card-hover"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          {draggable && <GripVertical className="h-3.5 w-3.5 text-zinc-600 shrink-0" />}
          <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button onClick={() => onEdit(item)} className="p-1 hover:bg-zinc-700 rounded">
            <Edit3 className="h-3 w-3 text-zinc-400" />
          </button>
          <button onClick={() => onDelete(item.id)} className="p-1 hover:bg-zinc-700 rounded">
            <Trash2 className="h-3 w-3 text-red-400" />
          </button>
        </div>
      </div>
      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{item.content}</p>
      <div className="flex flex-wrap gap-1 mb-2">
        {item.platforms.map(p => <PlatformBadge key={p} platform={p} />)}
      </div>
      <div className="flex items-center justify-between">
        <span className={`text-xs px-1.5 py-0.5 rounded ${statusCfg.color}`}>{statusCfg.label}</span>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          {item.aiGenerated && <Sparkles className="h-3 w-3 text-purple-400" />}
          <Clock className="h-3 w-3" />
          <span>{item.scheduledAt.toLocaleDateString("en-ZA", { day: "numeric", month: "short" })}</span>
        </div>
      </div>
    </div>
  );
}

// ── Kanban View ────────────────────────────────────────────────────────────────
function KanbanView({
  items,
  onEdit,
  onDelete,
  onStatusChange,
}: {
  items: ContentItem[];
  onEdit: (item: ContentItem) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: Status) => void;
}) {
  const dragId = useRef<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    dragId.current = id;
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (e: React.DragEvent, status: Status) => {
    e.preventDefault();
    if (dragId.current) {
      onStatusChange(dragId.current, status);
      dragId.current = null;
    }
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {KANBAN_COLUMNS.map(col => {
        const colItems = items.filter(i => i.status === col);
        const cfg = STATUS_CONFIG[col];
        return (
          <div
            key={col}
            className="bg-muted/40 border border-border rounded-xl p-3 min-h-64"
            onDragOver={e => e.preventDefault()}
            onDrop={e => handleDrop(e, col)}
          >
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${cfg.color}`}>
                {cfg.label}
              </span>
              <span className="text-xs text-zinc-500">{colItems.length}</span>
            </div>
            <div className="flex flex-col gap-2">
              {colItems.map(item => (
                <ContentCard
                  key={item.id}
                  item={item}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  draggable
                  onDragStart={handleDragStart}
                />
              ))}
              {colItems.length === 0 && (
                <div className="border-2 border-dashed border-border rounded-lg p-4 text-center text-xs text-muted-foreground">
                  Drop here
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Calendar View ─────────────────────────────────────────────────────────────
function CalendarView({ items, onEdit }: { items: ContentItem[]; onEdit: (item: ContentItem) => void }) {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 1));
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array.from({ length: firstDay + daysInMonth }, (_, i) =>
    i < firstDay ? null : i - firstDay + 1
  );

  const getItemsForDay = (day: number) =>
    items.filter(item => {
      const d = item.scheduledAt;
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          {MONTHS[month]} {year}
        </h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS.map(d => (
          <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, idx) => {
          const dayItems = day ? getItemsForDay(day) : [];
          const isToday = day === 16 && month === 4 && year === 2026;
          return (
            <div
              key={idx}
              className={`min-h-20 rounded-lg p-1.5 border transition-colors ${
                day
                  ? isToday
                    ? "border-pink-500/50 bg-pink-950/20"
                    : "border-border bg-white hover:border-primary/30"
                  : "border-transparent bg-transparent"
              }`}
            >
              {day && (
                <>
                  <span className={`text-xs font-medium ${isToday ? "text-primary font-bold" : "text-muted-foreground"}`}>
                    {day}
                  </span>
                  <div className="mt-1 flex flex-col gap-0.5">
                    {dayItems.slice(0, 2).map(item => (
                      <button
                        key={item.id}
                        onClick={() => onEdit(item)}
                        className="text-left text-xs truncate px-1 py-0.5 rounded"
                        style={{
                          backgroundColor: PLATFORM_CONFIG[item.platforms[0]]?.color + "22",
                          color: PLATFORM_CONFIG[item.platforms[0]]?.color,
                        }}
                      >
                        {item.title}
                      </button>
                    ))}
                    {dayItems.length > 2 && (
                      <span className="text-xs text-muted-foreground px-1">+{dayItems.length - 2} more</span>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Table View ─────────────────────────────────────────────────────────────────
function TableView({
  items,
  onEdit,
  onDelete,
}: {
  items: ContentItem[];
  onEdit: (item: ContentItem) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Title</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Platforms</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Scheduled</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">AI</th>
            <th className="text-right px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => {
            const statusCfg = STATUS_CONFIG[item.status];
            return (
              <tr
                key={item.id}
                className={`border-b border-border/50 hover:bg-muted/30 transition-colors ${i % 2 === 0 ? "bg-white" : "bg-muted/20"}`}
              >
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground truncate max-w-xs">{item.title}</p>
                  <p className="text-xs text-muted-foreground truncate max-w-xs mt-0.5">{item.content}</p>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {item.platforms.map(p => <PlatformBadge key={p} platform={p} />)}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${statusCfg.color}`}>{statusCfg.label}</span>
                </td>
                <td className="px-4 py-3 text-xs text-foreground">
                  {item.scheduledAt.toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}
                  <br />
                  <span className="text-muted-foreground">{item.scheduledAt.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })}</span>
                </td>
                <td className="px-4 py-3">
                  {item.aiGenerated ? (
                    <Sparkles className="h-4 w-4 text-purple-400" />
                  ) : (
                    <span className="text-muted-foreground text-xs">Manual</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => onEdit(item)} className="h-7 w-7 p-0">
                      <Edit3 className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onDelete(item.id)} className="h-7 w-7 p-0 text-red-400 hover:text-red-300">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Edit Dialog ────────────────────────────────────────────────────────────────
function EditDialog({
  item,
  open,
  onClose,
  onSave,
}: {
  item: ContentItem | null;
  open: boolean;
  onClose: () => void;
  onSave: (item: ContentItem) => void;
}) {
  const [form, setForm] = useState<ContentItem | null>(item);
  const generateMutation = trpc.content.generatePost.useMutation();

  if (!form) return null;

  const handleGenerate = async () => {
    try {
      const safePlatform = (form.platforms[0] === "discord" || form.platforms[0] === "gmail")
        ? "facebook"
        : (form.platforms[0] || "facebook");
      const result = await generateMutation.mutateAsync({
        brief: form.title || "social media post",
        platform: safePlatform as "facebook" | "instagram" | "whatsapp" | "all",
      });
      setForm(prev => prev ? { ...prev, content: result.content, aiGenerated: true } : prev);
      toast.success("AI content generated!");
    } catch {
      toast.error("Generation failed");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-white border-border max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-foreground">Edit Content</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-2">
          <Input
            placeholder="Post title"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            className="bg-background border-input text-foreground"
          />
          <div className="relative">
            <Textarea
              placeholder="Post content..."
              value={form.content}
              onChange={e => setForm({ ...form, content: e.target.value })}
              className="bg-background border-input text-foreground min-h-28 resize-none"
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={handleGenerate}
              disabled={generateMutation.isPending}
              className="absolute top-2 right-2 h-7 gap-1 text-secondary-foreground hover:text-primary"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {generateMutation.isPending ? "Generating..." : "AI Generate"}
            </Button>
          </div>
          <Select value={form.status} onValueChange={v => setForm({ ...form, status: v as Status })}>
            <SelectTrigger className="bg-background border-input text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border-border">
              {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                <SelectItem key={k} value={k} className="text-foreground">{v.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div>
            <p className="text-xs text-muted-foreground font-medium mb-2">Platforms</p>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(PLATFORM_CONFIG) as Platform[]).map(p => {
                const selected = form.platforms.includes(p);
                const cfg = PLATFORM_CONFIG[p];
                return (
                  <button
                    key={p}
                    onClick={() => setForm({
                      ...form,
                      platforms: selected
                        ? form.platforms.filter(x => x !== p)
                        : [...form.platforms, p],
                    })}
                    className={`px-2 py-1 rounded text-xs font-medium border transition-all ${
                      selected ? "opacity-100" : "opacity-40"
                    }`}
                    style={{
                      backgroundColor: selected ? cfg.color + "22" : "transparent",
                      color: cfg.color,
                      borderColor: cfg.color + "44",
                    }}
                  >
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => { onSave(form); onClose(); }}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function ContentCalendar() {
  const [items, setItems] = useState<ContentItem[]>(SAMPLE_ITEMS);
  const [view, setView] = useState<"kanban" | "calendar" | "table">("kanban");
  const [editItem, setEditItem] = useState<ContentItem | null>(null);
  const [filterPlatform, setFilterPlatform] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filtered = items.filter(item => {
    if (filterPlatform !== "all" && !item.platforms.includes(filterPlatform as Platform)) return false;
    if (filterStatus !== "all" && item.status !== (filterStatus as Status)) return false;
    return true;
  });

  const handleStatusChange = (id: string, status: Status) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, status } : i));
    toast.success(`Moved to ${STATUS_CONFIG[status].label}`);
  };

  const handleDelete = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    toast.success("Post removed");
  };

  const handleSave = (updated: ContentItem) => {
    setItems(prev => prev.map(i => i.id === updated.id ? updated : i));
    toast.success("Post updated");
  };

  const handleAddNew = () => {
    const newItem: ContentItem = {
      id: Date.now().toString(),
      title: "New Post",
      content: "",
      platforms: ["facebook"],
      status: "idea",
      scheduledAt: new Date(),
      aiGenerated: false,
      tags: [],
    };
    setItems(prev => [newItem, ...prev]);
    setEditItem(newItem);
  };

  // Stats
  const stats = {
    total: items.length,
    scheduled: items.filter(i => i.status === "scheduled").length,
    published: items.filter(i => i.status === "published").length,
    aiGenerated: items.filter(i => i.aiGenerated).length,
  };

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Calendar className="h-6 w-6 text-pink-400" />
              Content Calendar
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Plan, schedule, and publish across all platforms</p>
          </div>
          <Button onClick={handleAddNew} className="gap-2 bg-pink-600 hover:bg-pink-500">
            <Plus className="h-4 w-4" />
            New Post
          </Button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Total Posts", value: stats.total, icon: FileText, color: "text-foreground" },
            { label: "Scheduled", value: stats.scheduled, icon: Clock, color: "text-blue-600" },
            { label: "Published", value: stats.published, icon: CheckCircle2, color: "text-green-600" },
            { label: "AI Generated", value: stats.aiGenerated, icon: Sparkles, color: "text-primary" },
          ].map(s => (
            <Card key={s.label} className="bg-white border-border p-4 card-hover">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
                </div>
                <s.icon className={`h-8 w-8 ${s.color} opacity-30`} />
              </div>
            </Card>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-muted border border-border rounded-lg p-1">
            {[
              { id: "kanban", icon: LayoutGrid, label: "Kanban" },
              { id: "calendar", icon: CalendarDays, label: "Calendar" },
              { id: "table", icon: List, label: "Table" },
            ].map(v => (
              <button
                key={v.id}
                onClick={() => setView(v.id as typeof view)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all ${
                  view === v.id
                    ? "bg-pink-600 text-white"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <v.icon className="h-3.5 w-3.5" />
                {v.label}
              </button>
            ))}
          </div>

          {/* Platform Filter */}
          <Select value={filterPlatform} onValueChange={v => setFilterPlatform(v)}>
            <SelectTrigger className="bg-white border-border text-foreground h-8 text-xs w-36">
              <SelectValue placeholder="All Platforms" />
            </SelectTrigger>
            <SelectContent className="bg-white border-border">
              <SelectItem value="all" className="text-foreground text-xs">All Platforms</SelectItem>
              {(Object.keys(PLATFORM_CONFIG) as Platform[]).map(p => (
                <SelectItem key={p} value={p} className="text-foreground text-xs">{PLATFORM_CONFIG[p].label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={filterStatus} onValueChange={v => setFilterStatus(v)}>
            <SelectTrigger className="bg-white border-border text-foreground h-8 text-xs w-32">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent className="bg-white border-border">
              <SelectItem value="all" className="text-foreground text-xs">All Status</SelectItem>
              {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                <SelectItem key={k} value={k} className="text-foreground text-xs">{v.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <span className="text-xs text-muted-foreground ml-auto">{filtered.length} posts</span>
        </div>

        {/* View Content */}
        {view === "kanban" && (
          <KanbanView
            items={filtered}
            onEdit={setEditItem}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
          />
        )}
        {view === "calendar" && (
          <CalendarView items={filtered} onEdit={setEditItem} />
        )}
        {view === "table" && (
          <TableView items={filtered} onEdit={setEditItem} onDelete={handleDelete} />
        )}

        {/* AI Strategy Panel */}
        <Card className="bg-white border-border p-5">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-5 w-5 text-yellow-400" />
            <h3 className="font-semibold text-foreground">AI Posting Strategy</h3>
            <Badge className="bg-yellow-50 text-yellow-700 border border-yellow-200 text-xs">Live Recommendations</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon: Target,
                color: "text-pink-400",
                title: "Best Time to Post",
                tip: "Facebook: 9am–11am Tue/Wed/Thu. Instagram: 6pm–8pm Fri–Sun. Your audience is most active on weekday mornings.",
              },
              {
                icon: TrendingUp,
                color: "text-green-400",
                title: "Content Gap",
                tip: "You have 3 posts scheduled this week but zero video content. Reels get 3× more reach than static images on Instagram.",
              },
              {
                icon: Sparkles,
                color: "text-purple-400",
                title: "AI Suggestion",
                tip: "Your last 5 posts had no call-to-action. Add 'Order via link in bio' or 'DM us to order' to every post to drive conversions.",
              },
            ].map(r => (
              <div key={r.title} className="bg-muted/40 border border-border rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <r.icon className={`h-4 w-4 ${r.color}`} />
                  <span className="text-sm font-medium text-foreground">{r.title}</span>
                </div>
                <p className="text-xs text-muted-foreground">{r.tip}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Edit Dialog */}
      <EditDialog
        item={editItem}
        open={!!editItem}
        onClose={() => setEditItem(null)}
        onSave={handleSave}
      />
    </DashboardLayout>
  );
}


