"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback, useRef, MouseEvent } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  RefreshCw,
  Users,
  Crosshair,
  DollarSign,
  Database,
  Send,
  ExternalLink,
  Zap,
  Copy,
  Check,
  MessageSquarePlus,
  X,
} from "lucide-react";
import { apiFetch } from "../../lib/api";
import { cn } from "@/lib/utils";

// ---------- Types ----------
type BriefItem = {
  priority: "URGENT" | "TODAY" | "THIS_WEEK";
  action: string;
  reason: string;
};

type Stats = {
  total_leads: number;
  new_leads: number;
  high_urgency: number;
  avg_score: number;
  total_clients: number;
  critical_clients: number;
  at_risk_clients: number;
};

type SentProposal = {
  id: string;
  subject: string;
  created_at: string;
  lead_id: string;
  leads: {
    title: string;
    author: string;
    subreddit: string;
    intent_score: number;
    url: string;
  } | null;
};

// ---------- Mono label ----------
function MonoLabel({ children, dim = false }: { children: React.ReactNode; dim?: boolean }) {
  return (
    <span
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: "0.85rem",
        letterSpacing: "0.3em",
        textTransform: "uppercase",
        color: dim ? "rgba(240,237,230,0.25)" : "rgba(240,237,230,0.45)",
      }}
    >
      {children}
    </span>
  );
}

// ---------- Stat tile ----------
function StatTile({
  label,
  value,
  accent,
  href,
}: {
  label: string;
  value: number;
  accent?: string;
  href: string;
}) {
  return (
    <Link href={href} className="group block">
      <div
        className="rounded-2xl border p-5 transition-all duration-300 hover:border-[rgba(168,85,247,0.25)]"
        style={{
          background: "#0c0c0c",
          borderColor: "rgba(240,237,230,0.07)",
        }}
      >
        <div
          className="text-4xl font-bold mb-2 transition-colors duration-200"
          style={{
            fontFamily: "var(--font-impact-stack)",
            letterSpacing: "-0.02em",
            color: accent ?? "#f0ede6",
          }}
        >
          {value}
        </div>
        <MonoLabel dim>{label}</MonoLabel>
      </div>
    </Link>
  );
}

// ---------- Ghost card (spotlight hover) ----------
function GhostCard({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [spot, setSpot] = useState({ x: 50, y: 50, on: false });

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setSpot({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100, on: true });
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => setSpot((s) => ({ ...s, on: false }))}
      className={cn("relative rounded-2xl border overflow-hidden", className)}
      style={{
        background: "#0c0c0c",
        borderColor: "rgba(240,237,230,0.07)",
        ...style,
      }}
    >
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none transition-opacity duration-500"
        style={{
          opacity: spot.on ? 1 : 0,
          background: `radial-gradient(400px circle at ${spot.x}% ${spot.y}%, rgba(168,85,247,0.10), transparent 65%)`,
        }}
      />
      {children}
    </div>
  );
}

// ---------- Priority pill ----------
const PRIORITY_CONFIG = {
  URGENT: { label: "Urgent", color: "rgba(239,68,68,1)", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.2)" },
  TODAY:  { label: "Today",  color: "rgba(234,179,8,1)", bg: "rgba(234,179,8,0.07)",  border: "rgba(234,179,8,0.2)"  },
  THIS_WEEK: { label: "This week", color: "rgba(240,237,230,0.38)", bg: "rgba(240,237,230,0.04)", border: "rgba(240,237,230,0.1)" },
};

// ---------- Brief Item ----------
function BriefItem({ item, index }: { item: BriefItem; index: number }) {
  const cfg = PRIORITY_CONFIG[item.priority] ?? PRIORITY_CONFIG.THIS_WEEK;
  return (
    <div
      className="rounded-xl border p-4 transition-all duration-200 hover:border-[rgba(240,237,230,0.14)]"
      style={{ background: cfg.bg, borderColor: cfg.border }}
    >
      <div className="flex items-start gap-3">
        <div
          className="mt-0.5 flex-shrink-0 rounded-full px-2 py-0.5"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.7rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: cfg.color,
            background: `${cfg.color}18`,
            border: `1px solid ${cfg.color}30`,
          }}
        >
          {cfg.label}
        </div>
        <div className="flex-1 min-w-0">
          <p
            className="text-sm leading-snug mb-1"
            style={{ color: "#f0ede6" }}
          >
            {item.action}
          </p>
          <p
            className="text-xs leading-relaxed"
            style={{ color: "rgba(240,237,230,0.4)" }}
          >
            {item.reason}
          </p>
        </div>
      </div>
    </div>
  );
}

// ---------- Skeleton rows ----------
function BriefSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="rounded-xl border p-4 animate-pulse"
          style={{ background: "#0d0d0d", borderColor: "rgba(240,237,230,0.06)" }}
        >
          <div className="flex gap-3">
            <div className="h-5 w-14 rounded-full bg-[rgba(240,237,230,0.06)]" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-full rounded bg-[rgba(240,237,230,0.06)]" />
              <div className="h-3 w-3/4 rounded bg-[rgba(240,237,230,0.04)]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------- Seed button ----------
function SeedButton({ onSeeded }: { onSeeded: () => void }) {
  const [loading, setLoading] = useState(false);
  const handle = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/seed/demo", { method: "POST" });
      const data = await res.json();
      toast.success(`Demo data loaded: ${data.leads_added} leads, ${data.clients_added} clients`);
      onSeeded();
    } catch {
      toast.error("Failed to seed demo data");
    } finally {
      setLoading(false);
    }
  };
  return (
    <button
      onClick={handle}
      disabled={loading}
      className="flex items-center gap-2 rounded-lg border px-4 py-2 transition-all duration-200 hover:border-[rgba(168,85,247,0.3)] hover:bg-[rgba(168,85,247,0.06)] disabled:opacity-50"
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: "0.85rem",
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        color: "rgba(240,237,230,0.5)",
        borderColor: "rgba(240,237,230,0.1)",
        background: "transparent",
      }}
    >
      <Database className={cn("h-3.5 w-3.5", loading && "animate-pulse")} />
      {loading ? "Loading..." : "Load Demo"}
    </button>
  );
}

// ---------- Follow-up Panel ----------
function FollowUpPanel({
  proposal,
  onClose,
}: {
  proposal: SentProposal | null;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<{ subject: string; content: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!proposal) return;
    setDraft(null);
    setError(false);
    setLoading(true);
    apiFetch(`/proposals/${proposal.id}/followup`, { method: "POST" })
      .then(r => r.json())
      .then(d => {
        if (d?.subject || d?.content) setDraft(d);
        else setError(true);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [proposal]);

  const handleCopy = () => {
    if (!draft) return;
    navigator.clipboard.writeText(`Subject: ${draft.subject}\n\n${draft.content}`);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  if (!proposal) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50"
        style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(3px)" }}
        onClick={onClose}
      />
      {/* Panel */}
      <div
        className="fixed right-0 top-0 z-50 h-full w-full max-w-[500px] flex flex-col"
        style={{
          background: "#0c0c0c",
          borderLeft: "1px solid rgba(240,237,230,0.08)",
          boxShadow: "-20px 0 60px rgba(0,0,0,0.5)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-start justify-between p-6 pb-5"
          style={{ borderBottom: "1px solid rgba(240,237,230,0.06)" }}
        >
          <div className="flex items-start gap-3">
            <div
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl mt-0.5"
              style={{ background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.2)" }}
            >
              <MessageSquarePlus className="h-4 w-4" style={{ color: "rgba(168,85,247,0.9)" }} />
            </div>
            <div>
              <h2
                style={{
                  fontFamily: "var(--font-disp)",
                  fontSize: "1.7rem",
                  fontWeight: 300,
                  fontStyle: "italic",
                  color: "#f0ede6",
                  lineHeight: 1.1,
                  margin: 0,
                }}
              >
                Draft Follow-up
              </h2>
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.7rem",
                  letterSpacing: "0.08em",
                  color: "rgba(240,237,230,0.3)",
                  marginTop: "4px",
                }}
                className="truncate max-w-[280px]"
              >
                {proposal.leads?.title ?? proposal.subject}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 rounded-lg p-1.5 transition-colors hover:bg-[rgba(240,237,230,0.06)]"
            style={{ color: "rgba(240,237,230,0.3)", background: "none", border: "none", cursor: "pointer" }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div
                className="h-9 w-9 rounded-full border-2 animate-spin"
                style={{ borderColor: "rgba(168,85,247,0.2)", borderTopColor: "rgba(168,85,247,0.8)" }}
              />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(240,237,230,0.25)" }}>
                Ghost is writing...
              </span>
            </div>
          )}

          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-14 gap-3">
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "rgba(239,68,68,0.6)", textAlign: "center" }}>
                Failed to generate. Check that the backend is running.
              </p>
            </div>
          )}

          {!loading && !error && draft && (
            <>
              <div className="rounded-xl border p-4" style={{ background: "#111", borderColor: "rgba(240,237,230,0.07)" }}>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(240,237,230,0.25)", marginBottom: "6px" }}>Subject</p>
                <p style={{ color: "#f0ede6", fontSize: "14px", fontWeight: 500, lineHeight: 1.4 }}>{draft.subject}</p>
              </div>
              <div className="rounded-xl border p-4" style={{ background: "#111", borderColor: "rgba(240,237,230,0.07)" }}>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(240,237,230,0.25)", marginBottom: "10px" }}>Message</p>
                <p style={{ color: "rgba(240,237,230,0.8)", fontSize: "14px", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{draft.content}</p>
              </div>
              <button
                onClick={handleCopy}
                className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 transition-all duration-200 hover:opacity-90"
                style={{
                  fontFamily: "var(--font-mono)", fontSize: "0.78rem", letterSpacing: "0.2em", textTransform: "uppercase",
                  background: copied ? "rgba(52,211,153,0.12)" : "#f0ede6",
                  color: copied ? "rgba(52,211,153,0.9)" : "#090909",
                  border: copied ? "1px solid rgba(52,211,153,0.25)" : "none",
                }}
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied!" : "Copy to Clipboard"}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

// ---------- Main ----------
export default function DashboardPage() {
  const [brief, setBrief] = useState<BriefItem[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [profileName, setProfileName] = useState<string>("");
  const [sentProposals, setSentProposals] = useState<SentProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [followUpProposal, setFollowUpProposal] = useState<SentProposal | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [briefRes, leadsRes, clientsRes, profileRes, sentRes] = await Promise.all([
        apiFetch("/brief/daily"),
        apiFetch("/leads/"),
        apiFetch("/clients/"),
        apiFetch("/profile/"),
        apiFetch("/proposals/sent"),
      ]);
      const [briefData, leadsData, clientsData, profileData, sentData] = await Promise.all([
        briefRes.json(),
        leadsRes.json(),
        clientsRes.json(),
        profileRes.json(),
        sentRes.json(),
      ]);

      setBrief(Array.isArray(briefData) ? briefData : []);
      if (profileData?.name) setProfileName(profileData.name);
      setSentProposals(Array.isArray(sentData) ? sentData : []);

      const leads = Array.isArray(leadsData) ? leadsData : [];
      const clients = Array.isArray(clientsData) ? clientsData : [];
      setStats({
        total_leads: leads.length,
        new_leads: leads.filter((l: { status: string }) => l.status === "new").length,
        high_urgency: leads.filter((l: { urgency: string }) => l.urgency === "high").length,
        avg_score: leads.length ? Math.round(leads.reduce((a: number, l: { intent_score: number }) => a + l.intent_score, 0) / leads.length) : 0,
        total_clients: clients.length,
        critical_clients: clients.filter((c: { health_status: string }) => c.health_status === "critical").length,
        at_risk_clients: clients.filter((c: { health_status: string }) => c.health_status === "at_risk").length,
      });
    } catch { /* ignore */ }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setBrief([]);
    try {
      toast.loading("Regenerating brief...", { id: "brief-refresh" });
      const res = await apiFetch("/brief/refresh", { method: "POST" });
      const data = await res.json();
      setBrief(Array.isArray(data) ? data : []);
      toast.success("Brief regenerated", { id: "brief-refresh" });
    } catch {
      toast.error("Failed to refresh", { id: "brief-refresh" });
    } finally {
      setRefreshing(false);
    }
  };

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const dateStr = now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });

  const urgentCount = brief.filter((b) => b.priority === "URGENT").length;
  const todayCount = brief.filter((b) => b.priority === "TODAY").length;

  return (
    <div className="px-6 py-10 lg:px-10 lg:py-12 space-y-10">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1
            className="leading-tight mb-2"
            style={{
              fontFamily: "var(--font-disp)",
              fontSize: "clamp(2.8rem, 4vw, 4.4rem)",
              fontWeight: 300,
              fontStyle: "italic",
              color: "#f0ede6",
              letterSpacing: "-0.01em",
            }}
          >
            {greeting}{profileName ? `, ${profileName}` : ""}.
          </h1>
          <MonoLabel dim>{dateStr}</MonoLabel>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="mt-1 flex items-center gap-2 rounded-lg border px-4 py-2 transition-all duration-200 hover:border-[rgba(240,237,230,0.18)] disabled:opacity-50 flex-shrink-0"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.8rem",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: "rgba(240,237,230,0.4)",
            borderColor: "rgba(240,237,230,0.1)",
            background: "transparent",
          }}
        >
          <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
          Refresh
        </button>
      </div>

      {/* ── Stats ── */}
      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <StatTile label="Leads" value={stats.total_leads} href="/leads" />
          <StatTile label="New" value={stats.new_leads} accent="rgba(168,85,247,0.9)" href="/leads" />
          <StatTile label="Urgent" value={stats.high_urgency} accent="rgba(239,68,68,0.9)" href="/leads" />
          <StatTile label="Avg Intent" value={stats.avg_score} accent="rgba(234,179,8,0.9)" href="/leads" />
          <StatTile label="Clients" value={stats.total_clients} href="/clients" />
          <StatTile label="At Risk" value={stats.critical_clients + stats.at_risk_clients} accent="rgba(239,68,68,0.9)" href="/clients" />
        </div>
      )}

      {/* ── Active Outreach ── */}
      {sentProposals.length > 0 && (
        <GhostCard>
          <div className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-xl"
                  style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)" }}
                >
                  <Send className="h-3.5 w-3.5" style={{ color: "rgba(52,211,153,0.9)" }} />
                </div>
                <div>
                  <p
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.75rem",
                      letterSpacing: "0.3em",
                      textTransform: "uppercase",
                      color: "rgba(52,211,153,0.8)",
                    }}
                  >
                    Active Outreach
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.72rem",
                      letterSpacing: "0.1em",
                      color: "rgba(240,237,230,0.3)",
                    }}
                  >
                    {sentProposals.length} sent ·{" "}
                    {sentProposals.filter(p => Math.floor((Date.now() - new Date(p.created_at).getTime()) / 86400000) >= 3).length > 0
                      ? `${sentProposals.filter(p => Math.floor((Date.now() - new Date(p.created_at).getTime()) / 86400000) >= 3).length} need follow-up`
                      : "waiting for replies"}
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              {sentProposals.map((p) => {
                const daysSince = Math.floor((Date.now() - new Date(p.created_at).getTime()) / 86400000);
                const followUp = daysSince >= 3;
                return (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 rounded-xl border px-4 py-3"
                    style={{
                      borderColor: followUp ? "rgba(234,179,8,0.2)" : "rgba(52,211,153,0.12)",
                      background: followUp ? "rgba(234,179,8,0.04)" : "rgba(52,211,153,0.04)",
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate mb-0.5" style={{ color: "#f0ede6" }}>
                        {p.leads?.title ?? p.subject}
                      </p>
                      <p
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.72rem",
                          letterSpacing: "0.1em",
                          color: "rgba(240,237,230,0.3)",
                        }}
                      >
                        {p.leads ? `r/${p.leads.subreddit} · u/${p.leads.author}` : "Client proposal"} ·{" "}
                        {daysSince === 0 ? "sent today" : `${daysSince}d ago`}
                      </p>
                    </div>
                    {followUp && (
                      <button
                        onClick={() => setFollowUpProposal(p)}
                        className="flex-shrink-0 flex items-center gap-1.5 rounded-full px-2.5 py-0.5 transition-all duration-200 hover:bg-[rgba(234,179,8,0.14)]"
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.7rem",
                          letterSpacing: "0.15em",
                          textTransform: "uppercase",
                          color: "rgba(234,179,8,0.9)",
                          background: "rgba(234,179,8,0.08)",
                          border: "1px solid rgba(234,179,8,0.2)",
                        }}
                      >
                        <MessageSquarePlus className="h-3 w-3" />
                        Follow up
                      </button>
                    )}
                    {p.leads?.url && (
                      <a
                        href={p.leads.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 transition-colors hover:text-[#f0ede6]"
                        style={{ color: "rgba(240,237,230,0.2)" }}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </GhostCard>
      )}

      {/* ── Daily Brief ── */}
      <GhostCard>
        <div className="p-6">
          {/* Section header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-xl"
                style={{ background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.2)" }}
              >
                <Zap className="h-3.5 w-3.5" style={{ color: "rgba(168,85,247,0.9)" }} />
              </div>
              <div>
                <p
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.75rem",
                    letterSpacing: "0.3em",
                    textTransform: "uppercase",
                    color: "rgba(168,85,247,0.8)",
                  }}
                >
                  Ghost&apos;s Action Plan
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.72rem",
                    letterSpacing: "0.1em",
                    color: "rgba(240,237,230,0.28)",
                  }}
                >
                  AI-prioritized tasks for today
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {urgentCount > 0 && (
                <span
                  className="rounded-full px-2.5 py-0.5"
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.7rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: "rgba(239,68,68,0.9)",
                    background: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.2)",
                  }}
                >
                  {urgentCount} urgent
                </span>
              )}
              {todayCount > 0 && (
                <span
                  className="rounded-full px-2.5 py-0.5"
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.7rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: "rgba(234,179,8,0.9)",
                    background: "rgba(234,179,8,0.07)",
                    border: "1px solid rgba(234,179,8,0.2)",
                  }}
                >
                  {todayCount} today
                </span>
              )}
            </div>
          </div>

          {loading && <BriefSkeleton />}

          {!loading && brief.length === 0 && (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div
                className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
                style={{ background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.18)" }}
              >
                <Zap className="h-8 w-8" style={{ color: "rgba(168,85,247,0.7)" }} />
              </div>
              <h3
                className="mb-2"
                style={{
                  fontFamily: "var(--font-disp)",
                  fontSize: "2.2rem",
                  fontWeight: 300,
                  fontStyle: "italic",
                  color: "#f0ede6",
                }}
              >
                No brief yet
              </h3>
              <p
                className="mb-8 max-w-sm"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.82rem",
                  letterSpacing: "0.05em",
                  color: "rgba(240,237,230,0.35)",
                  lineHeight: 1.7,
                }}
              >
                Add clients and scan for leads to generate your first daily brief. Or load demo data to see Ghost in action.
              </p>
              <div className="flex gap-3 flex-wrap justify-center">
                <Link
                  href="/leads"
                  className="flex items-center gap-2 rounded-lg border px-5 py-2.5 transition-all duration-200 hover:border-[rgba(168,85,247,0.4)] hover:bg-[rgba(168,85,247,0.08)]"
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.82rem",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: "rgba(240,237,230,0.7)",
                    borderColor: "rgba(240,237,230,0.14)",
                  }}
                >
                  <Crosshair className="h-3.5 w-3.5" />
                  Scan Leads
                </Link>
                <Link
                  href="/clients"
                  className="flex items-center gap-2 rounded-lg border px-5 py-2.5 transition-all duration-200 hover:border-[rgba(168,85,247,0.4)] hover:bg-[rgba(168,85,247,0.08)]"
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.82rem",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: "rgba(240,237,230,0.7)",
                    borderColor: "rgba(240,237,230,0.14)",
                  }}
                >
                  <Users className="h-3.5 w-3.5" />
                  Add Client
                </Link>
                <SeedButton onSeeded={fetchData} />
              </div>
            </div>
          )}

          {!loading && brief.length > 0 && (
            <div className="space-y-3">
              {brief.map((item, i) => (
                <BriefItem key={i} item={item} index={i} />
              ))}
            </div>
          )}
        </div>
      </GhostCard>

      {/* ── Pipeline Health ── */}
      {stats && (stats.total_leads > 0 || stats.total_clients > 0) && (
        <div
          className="rounded-2xl border p-5 flex items-center gap-6 flex-wrap"
          style={{ background: "#0c0c0c", borderColor: "rgba(240,237,230,0.07)" }}
        >
          <MonoLabel dim>Pipeline Health</MonoLabel>
          <div className="flex-1 min-w-[140px]">
            <div className="flex items-center justify-between mb-2">
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", letterSpacing: "0.1em", color: "rgba(240,237,230,0.3)" }}>
                Lead conversion potential
              </span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem", letterSpacing: "0.1em", color: "#f0ede6" }}>
                {stats.avg_score}%
              </span>
            </div>
            <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(240,237,230,0.08)" }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${stats.avg_score}%`, background: "rgba(168,85,247,0.7)" }}
              />
            </div>
          </div>
          <div className="flex items-center gap-6 pl-0 lg:pl-6 lg:border-l" style={{ borderColor: "rgba(240,237,230,0.08)" }}>
            {[
              { val: stats.total_clients - stats.critical_clients - stats.at_risk_clients, label: "Healthy", color: "rgba(52,211,153,0.9)" },
              { val: stats.at_risk_clients, label: "At Risk", color: "rgba(234,179,8,0.9)" },
              { val: stats.critical_clients, label: "Critical", color: "rgba(239,68,68,0.9)" },
            ].map(({ val, label, color }) => (
              <div key={label} className="text-center">
                <div style={{ fontFamily: "var(--font-impact-stack)", fontSize: "2rem", color, letterSpacing: "-0.02em" }}>{val}</div>
                <MonoLabel dim>{label}</MonoLabel>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Quick Actions ── */}
      <div>
        <div className="mb-4">
          <MonoLabel dim>Quick Actions</MonoLabel>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { href: "/leads",   icon: Crosshair,   title: "Lead Feed",       desc: "Scan Reddit for opportunities",  accent: "rgba(168,85,247,0.8)" },
            { href: "/clients", icon: Users,        title: "Client Health",   desc: "Monitor relationships",          accent: "rgba(52,211,153,0.8)"  },
            { href: "/pricing", icon: DollarSign,   title: "Price a Project", desc: "AI-powered rate calculator",     accent: "rgba(234,179,8,0.8)"   },
          ].map(({ href, icon: Icon, title, desc, accent }) => (
            <Link key={href} href={href} className="group block">
              <div
                className="flex items-center gap-4 rounded-2xl border p-4 transition-all duration-200 hover:border-[rgba(168,85,247,0.25)]"
                style={{ background: "#0c0c0c", borderColor: "rgba(240,237,230,0.07)" }}
              >
                <div
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-105"
                  style={{ background: `${accent}12`, border: `1px solid ${accent}25` }}
                >
                  <Icon className="h-4 w-4" style={{ color: accent }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium mb-0.5" style={{ color: "#f0ede6" }}>{title}</p>
                  <p
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.72rem",
                      letterSpacing: "0.05em",
                      color: "rgba(240,237,230,0.3)",
                    }}
                  >
                    {desc}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Follow-up Panel ── */}
      <FollowUpPanel
        proposal={followUpProposal}
        onClose={() => setFollowUpProposal(null)}
      />

    </div>
  );
}
