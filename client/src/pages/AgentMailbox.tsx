import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Mail, Inbox, Send, RefreshCw, Plus, ChevronRight,
  Users, Megaphone, Reply, Clock, AlertCircle, Loader2, Eye
} from "lucide-react";

function formatDate(ts: string | number | undefined) {
  if (!ts) return "";
  const d = new Date(ts);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 86400000) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function extractSender(msg: any) {
  return msg?.from?.name || msg?.from?.address || msg?.from || "Unknown";
}

function extractSubject(msg: any) {
  return msg?.subject || "(no subject)";
}

function extractPreview(msg: any) {
  const text = msg?.extractedText || msg?.text || msg?.body || "";
  return text.slice(0, 120).replace(/\n/g, " ");
}

// ── Compose / Campaign Dialog ─────────────────────────────────────────────────
function ComposeDialog({
  inboxId,
  mode,
  replyToId,
  onClose,
}: {
  inboxId: string;
  mode: "compose" | "campaign" | "reply";
  replyToId?: string;
  onClose: () => void;
}) {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [recipientList, setRecipientList] = useState("");

  const sendMutation = trpc.agentmail.sendMessage.useMutation({
    onSuccess: () => { toast.success("Email sent!"); onClose(); },
    onError: (e) => toast.error(`Failed: ${e.message}`),
  });
  const campaignMutation = trpc.agentmail.sendCampaign.useMutation({
    onSuccess: (d) => { toast.success(`Campaign sent to ${d.recipientCount} recipients!`); onClose(); },
    onError: (e) => toast.error(`Campaign failed: ${e.message}`),
  });
  const replyMutation = trpc.agentmail.replyMessage.useMutation({
    onSuccess: () => { toast.success("Reply sent!"); onClose(); },
    onError: (e) => toast.error(`Reply failed: ${e.message}`),
  });

  const handleSend = () => {
    if (!inboxId) return toast.error("Select an inbox first");
    if (mode === "reply" && replyToId) {
      if (!body.trim()) return toast.error("Reply body is required");
      replyMutation.mutate({ inboxId, messageId: replyToId, text: body });
    } else if (mode === "campaign") {
      const recipients = recipientList.split(/[\n,;]+/).map(e => e.trim()).filter(Boolean);
      if (!recipients.length) return toast.error("Add at least one recipient");
      if (!subject.trim()) return toast.error("Subject is required");
      if (!body.trim()) return toast.error("Body is required");
      campaignMutation.mutate({ inboxId, recipients, subject, text: body, labels: ["campaign"] });
    } else {
      const toList = to.split(/[\n,;]+/).map(e => e.trim()).filter(Boolean);
      if (!toList.length) return toast.error("Recipient is required");
      if (!subject.trim()) return toast.error("Subject is required");
      if (!body.trim()) return toast.error("Body is required");
      sendMutation.mutate({ inboxId, to: toList, subject, text: body });
    }
  };

  const isBusy = sendMutation.isPending || campaignMutation.isPending || replyMutation.isPending;

  return (
    <div className="space-y-4">
      {mode === "campaign" ? (
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Recipients (one per line, or comma-separated)</label>
          <Textarea
            placeholder="user1@example.com&#10;user2@example.com"
            value={recipientList}
            onChange={e => setRecipientList(e.target.value)}
            className="min-h-[80px] font-mono text-sm"
          />
        </div>
      ) : mode !== "reply" ? (
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">To</label>
          <Input placeholder="recipient@example.com" value={to} onChange={e => setTo(e.target.value)} />
        </div>
      ) : null}

      {mode !== "reply" && (
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Subject</label>
          <Input placeholder="Email subject" value={subject} onChange={e => setSubject(e.target.value)} />
        </div>
      )}

      <div>
        <label className="text-sm font-medium text-foreground mb-1 block">
          {mode === "reply" ? "Reply" : "Message"}
        </label>
        <Textarea
          placeholder="Write your message..."
          value={body}
          onChange={e => setBody(e.target.value)}
          className="min-h-[160px]"
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSend} disabled={isBusy} className="gap-2">
          {isBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {mode === "campaign" ? "Send Campaign" : mode === "reply" ? "Send Reply" : "Send"}
        </Button>
      </div>
    </div>
  );
}

// ── Message Detail Panel ──────────────────────────────────────────────────────
function MessageDetail({ inboxId, messageId, onBack }: { inboxId: string; messageId: string; onBack: () => void }) {
  const [showReply, setShowReply] = useState(false);
  const { data: msg, isLoading } = trpc.agentmail.getMessage.useQuery(
    { inboxId, messageId },
    { enabled: !!inboxId && !!messageId }
  );

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
    </div>
  );
  if (!msg) return <div className="p-4 text-muted-foreground">Message not found.</div>;

  const body = (msg as any).extractedText || (msg as any).text || (msg as any).body || "(no body)";
  const from = extractSender(msg);
  const subject = extractSubject(msg);
  const date = formatDate((msg as any).createdAt || (msg as any).date);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1">
          <ChevronRight className="w-4 h-4 rotate-180" /> Back
        </Button>
      </div>
      <div className="border rounded-lg p-5 flex-1 overflow-auto space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{subject}</h2>
          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
            <span>From: <span className="text-foreground">{from}</span></span>
            <span>·</span>
            <span>{date}</span>
          </div>
        </div>
        <div className="border-t pt-4 whitespace-pre-wrap text-sm text-foreground leading-relaxed">
          {body}
        </div>
      </div>
      <div className="mt-3">
        {!showReply ? (
          <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowReply(true)}>
            <Reply className="w-4 h-4" /> Reply
          </Button>
        ) : (
          <Card className="mt-2">
            <CardContent className="pt-4">
              <ComposeDialog
                inboxId={inboxId}
                mode="reply"
                replyToId={messageId}
                onClose={() => setShowReply(false)}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AgentMailbox() {
  const [selectedInbox, setSelectedInbox] = useState<string>("");
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [campaignOpen, setCampaignOpen] = useState(false);

  const { data: inboxesData, isLoading: inboxesLoading, refetch: refetchInboxes } =
    trpc.agentmail.listInboxes.useQuery();

  const { data: messagesData, isLoading: messagesLoading, refetch: refetchMessages } =
    trpc.agentmail.listMessages.useQuery(
      { inboxId: selectedInbox, limit: 30 },
      { enabled: !!selectedInbox }
    );

  const { data: connectionStatus } = trpc.agentmail.testConnection.useQuery();

  const inboxes = (inboxesData as any)?.inboxes ?? [];
  const messages = (messagesData as any)?.messages ?? [];

  return (
    <DashboardLayout>
      <div className="p-6 space-y-4 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Mail className="w-6 h-6 text-primary" />
              AgentMail Inbox
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Manage your AI agent email inboxes and run email campaigns
            </p>
          </div>
          <div className="flex items-center gap-2">
            {connectionStatus?.connected ? (
              <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                ● Connected · {connectionStatus.inboxCount} inbox{connectionStatus.inboxCount !== 1 ? "es" : ""}
              </Badge>
            ) : (
              <Badge variant="destructive" className="gap-1">
                <AlertCircle className="w-3 h-3" /> Not connected
              </Badge>
            )}
            <Button variant="outline" size="sm" className="gap-1" onClick={() => { refetchInboxes(); refetchMessages(); }}>
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4 min-h-[600px]">
          {/* Sidebar — Inboxes */}
          <div className="col-span-3 space-y-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Inboxes</span>
            </div>

            {inboxesLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
            ) : inboxes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <Inbox className="w-8 h-8 mx-auto mb-2 opacity-40" />
                No inboxes yet
              </div>
            ) : (
              inboxes.map((inbox: any) => {
                const id = inbox.inboxId || inbox.id || inbox.inbox_id;
                const name = inbox.displayName || inbox.display_name || id;
                const isSelected = selectedInbox === id;
                return (
                  <button
                    key={id}
                    onClick={() => { setSelectedInbox(id); setSelectedMessage(null); }}
                    className={`w-full text-left px-3 py-2.5 rounded-lg transition-all text-sm ${
                      isSelected
                        ? "bg-primary/10 text-primary border border-primary/20 font-medium"
                        : "hover:bg-accent text-foreground border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Inbox className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{name}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 truncate pl-5">{id}</div>
                  </button>
                );
              })
            )}

            {/* Quick actions */}
            <div className="pt-3 border-t space-y-1.5">
              <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full gap-2 justify-start" disabled={!selectedInbox}>
                    <Plus className="w-3.5 h-3.5" /> New Email
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader><DialogTitle>Compose Email</DialogTitle></DialogHeader>
                  <ComposeDialog inboxId={selectedInbox} mode="compose" onClose={() => setComposeOpen(false)} />
                </DialogContent>
              </Dialog>

              <Dialog open={campaignOpen} onOpenChange={setCampaignOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="w-full gap-2 justify-start" disabled={!selectedInbox}>
                    <Megaphone className="w-3.5 h-3.5" /> Send Campaign
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader><DialogTitle className="flex items-center gap-2"><Users className="w-4 h-4" /> Email Campaign</DialogTitle></DialogHeader>
                  <ComposeDialog inboxId={selectedInbox} mode="campaign" onClose={() => setCampaignOpen(false)} />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Main area */}
          <div className="col-span-9 border rounded-xl overflow-hidden flex flex-col">
            {!selectedInbox ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-12 text-muted-foreground">
                <Mail className="w-12 h-12 mb-4 opacity-30" />
                <p className="text-lg font-medium">Select an inbox</p>
                <p className="text-sm mt-1">Choose an inbox from the left to view messages</p>
              </div>
            ) : selectedMessage ? (
              <div className="p-5 flex-1 overflow-auto">
                <MessageDetail
                  inboxId={selectedInbox}
                  messageId={selectedMessage}
                  onBack={() => setSelectedMessage(null)}
                />
              </div>
            ) : (
              <div className="flex flex-col h-full">
                {/* Inbox toolbar */}
                <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
                  <div className="flex items-center gap-2">
                    <Inbox className="w-4 h-4 text-primary" />
                    <span className="font-medium text-sm">{selectedInbox}</span>
                    {messagesData && (
                      <Badge variant="secondary" className="text-xs">
                        {(messagesData as any).count ?? messages.length} messages
                      </Badge>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" className="gap-1" onClick={() => refetchMessages()}>
                    <RefreshCw className="w-3.5 h-3.5" />
                  </Button>
                </div>

                {/* Message list */}
                {messagesLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center flex-1 text-muted-foreground">
                    <Mail className="w-10 h-10 mb-3 opacity-30" />
                    <p className="text-sm">No messages in this inbox</p>
                  </div>
                ) : (
                  <div className="flex-1 overflow-auto divide-y">
                    {messages.map((msg: any) => {
                      const id = msg.messageId || msg.id || msg.message_id;
                      const from = extractSender(msg);
                      const subject = extractSubject(msg);
                      const preview = extractPreview(msg);
                      const date = formatDate(msg.createdAt || msg.date || msg.created_at);
                      const isRead = msg.isRead || msg.is_read || false;

                      return (
                        <button
                          key={id}
                          onClick={() => setSelectedMessage(id)}
                          className="w-full text-left px-4 py-3.5 hover:bg-accent/50 transition-colors group"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                {!isRead && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                                <span className={`text-sm truncate ${!isRead ? "font-semibold text-foreground" : "text-foreground"}`}>
                                  {from}
                                </span>
                              </div>
                              <div className={`text-sm truncate mt-0.5 ${!isRead ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                                {subject}
                              </div>
                              <div className="text-xs text-muted-foreground truncate mt-0.5">{preview}</div>
                            </div>
                            <div className="flex flex-col items-end gap-1 shrink-0">
                              <span className="text-xs text-muted-foreground whitespace-nowrap">{date}</span>
                              <Eye className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 pt-2">
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Inbox className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Inboxes</p>
                  <p className="text-xl font-bold">{inboxes.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Mail className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Messages (selected inbox)</p>
                  <p className="text-xl font-bold">{messages.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Megaphone className="w-4 h-4 text-green-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Campaign Ready</p>
                  <p className="text-xl font-bold">{selectedInbox ? "Yes" : "—"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
