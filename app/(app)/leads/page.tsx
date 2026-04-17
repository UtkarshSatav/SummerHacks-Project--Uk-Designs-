"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Target,
  Archive,
  ExternalLink,
  FileText,
  Sparkles,
  RefreshCw,
  ChevronRight,
  X,
} from "lucide-react";
import { apiFetch } from "../../lib/api";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Lead = {
  id: string;
  title: string;
  subreddit: string;
  intent_score: number;
  urgency: "low" | "medium" | "high";
  budget_signal: string;
  reason: string;
  hook: string;
  url: string;
  author: string;
  status: string;
  detected_at: string;
};

// ---------- Score badge ----------
function ScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? "rgba(34,197,94,0.9)" : score >= 65 ? "rgba(234,179,8,0.9)" : "rgba(248,113,113,0.9)";
  const bg    = score >= 80 ? "rgba(34,197,94,0.08)" : score >= 65 ? "rgba(234,179,8,0.07)" : "rgba(248,113,113,0.08)";
  return (
    <span
      className="inline-flex items-center justify-center w-10 h-10 rounded-xl"
      style={{
        fontFamily: "var(--font-impact-stack)",
        fontSize: "1.4rem",
        letterSpacing: "-0.02em",
        color,
        background: bg,
        border: `1px solid ${color}30`,
      }}
    >
      {score}
    </span>
  );
}

// ---------- Urgency pill ----------
function UrgencyPill({ urgency }: { urgency: Lead["urgency"] }) {
  const cfg = {
    high:   { color: "rgba(239,68,68,0.9)",   bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.25)"   },
    medium: { color: "rgba(234,179,8,0.9)",   bg: "rgba(234,179,8,0.07)",   border: "rgba(234,179,8,0.25)"   },
    low:    { color: "rgba(240,237,230,0.38)", bg: "rgba(240,237,230,0.04)", border: "rgba(240,237,230,0.12)" },
  }[urgency];
  return (
    <span
      className="inline-block rounded-full px-2.5 py-0.5"
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: "0.68rem",
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        color: cfg.color,
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
      }}
    >
      {urgency}
    </span>
  );
}

// ---------- Lead detail panel ----------
function LeadPanel({
  lead,
  onClose,
  onDraft,
  onArchive,
}: {
  lead: Lead | null;
  onClose: () => void;
  onDraft: (id: string) => void;
  onArchive: (id: string) => void;
}) {
  const [archiving, setArchiving] = useState(false);

  const handleArchive = async () => {
    if (!lead) return;
    setArchiving(true);
    try {
      await apiFetch(`/leads/${lead.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: "archived" }),
      });
      toast.success("Lead archived");
      onArchive(lead.id);
      onClose();
    } catch {
      toast.error("Failed to archive lead");
      setArchiving(false);
    }
  };

  if (!lead) return null;

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
          className="p-6 pb-5"
          style={{ borderBottom: "1px solid rgba(240,237,230,0.06)" }}
        >
          {/* Pill row */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.68rem",
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                color: "rgba(168,85,247,0.8)",
                background: "rgba(168,85,247,0.08)",
                border: "1px solid rgba(168,85,247,0.2)",
                padding: "3px 10px",
                borderRadius: "999px",
              }}
            >
              r/{lead.subreddit}
            </span>
            <UrgencyPill urgency={lead.urgency} />
            {lead.budget_signal !== "none" && (
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.68rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "rgba(52,211,153,0.9)",
                  background: "rgba(52,211,153,0.08)",
                  border: "1px solid rgba(52,211,153,0.2)",
                  padding: "3px 10px",
                  borderRadius: "999px",
                }}
              >
                $ budget
              </span>
            )}
            <button
              onClick={onClose}
              className="ml-auto flex-shrink-0 rounded-lg p-1.5 transition-colors hover:bg-[rgba(240,237,230,0.06)]"
              style={{ color: "rgba(240,237,230,0.3)", background: "none", border: "none", cursor: "pointer" }}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {/* Title */}
          <h2
            className="leading-snug mb-1.5"
            style={{
              fontSize: "1rem",
              fontWeight: 500,
              color: "#f0ede6",
              lineHeight: 1.4,
            }}
          >
            {lead.title}
          </h2>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.7rem",
              letterSpacing: "0.08em",
              color: "rgba(240,237,230,0.28)",
            }}
          >
            u/{lead.author}
          </p>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Ghost's Read */}
          <div
            className="rounded-xl border p-4"
            style={{ background: "rgba(240,237,230,0.02)", borderColor: "rgba(240,237,230,0.07)" }}
          >
            <p
              className="mb-2"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.62rem",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "rgba(240,237,230,0.28)",
              }}
            >
              Ghost&apos;s Read
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(240,237,230,0.68)" }}>
              {lead.reason}
            </p>
          </div>

          {/* Suggested opener */}
          {lead.hook && (
            <div
              className="rounded-xl px-4 py-3.5"
              style={{
                borderLeft: "3px solid rgba(168,85,247,0.5)",
                background: "rgba(168,85,247,0.05)",
                borderTop: "1px solid rgba(168,85,247,0.1)",
                borderRight: "1px solid rgba(168,85,247,0.1)",
                borderBottom: "1px solid rgba(168,85,247,0.1)",
              }}
            >
              <p
                className="mb-2"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.62rem",
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  color: "rgba(168,85,247,0.55)",
                }}
              >
                Suggested Opener
              </p>
              <p className="text-sm italic leading-relaxed" style={{ color: "rgba(168,85,247,0.85)" }}>
                &ldquo;{lead.hook}&rdquo;
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-2 pt-1">
            <button
              onClick={() => { onDraft(lead.id); onClose(); }}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 transition-all duration-200 hover:opacity-90"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.78rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#090909",
                background: "#f0ede6",
                border: "none",
              }}
            >
              <FileText className="h-3.5 w-3.5" />
              Draft Proposal
            </button>
            <a
              href={lead.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl border py-3.5 transition-all duration-200 hover:border-[rgba(240,237,230,0.2)] hover:bg-[rgba(240,237,230,0.03)]"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.78rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "rgba(240,237,230,0.55)",
                borderColor: "rgba(240,237,230,0.1)",
                textDecoration: "none",
              }}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View on Reddit
            </a>
            <button
              onClick={handleArchive}
              disabled={archiving}
              className="flex w-full items-center justify-center gap-2 rounded-xl border py-3.5 transition-all duration-200 hover:border-[rgba(239,68,68,0.3)] hover:text-[rgba(239,68,68,0.7)] disabled:opacity-50"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.78rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "rgba(240,237,230,0.28)",
                borderColor: "rgba(240,237,230,0.07)",
                background: "transparent",
              }}
            >
              <Archive className="h-3.5 w-3.5" />
              {archiving ? "Archiving..." : "Archive"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ---------- Skeleton rows ----------
function TableSkeleton() {
  return (
    <>
      {[1, 2, 3, 4, 5].map((i) => (
        <TableRow key={i} style={{ borderColor: "rgba(240,237,230,0.05)" }}>
          <TableCell><div className="w-10 h-10 rounded-xl bg-[rgba(240,237,230,0.05)] animate-pulse" /></TableCell>
          <TableCell>
            <div className="space-y-1.5">
              <div className="h-3.5 w-48 rounded bg-[rgba(240,237,230,0.05)] animate-pulse" />
              <div className="h-3 w-24 rounded bg-[rgba(240,237,230,0.04)] animate-pulse" />
            </div>
          </TableCell>
          <TableCell><div className="h-5 w-16 rounded-full bg-[rgba(240,237,230,0.05)] animate-pulse" /></TableCell>
          <TableCell><div className="h-5 w-12 rounded-full bg-[rgba(240,237,230,0.05)] animate-pulse" /></TableCell>
          <TableCell><div className="h-3 w-20 rounded bg-[rgba(240,237,230,0.04)] animate-pulse" /></TableCell>
          <TableCell><div className="h-8 w-28 rounded-lg bg-[rgba(240,237,230,0.05)] animate-pulse" /></TableCell>
        </TableRow>
      ))}
    </>
  );
}

// ---------- Main ----------
export default function LeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Lead | null>(null);

  const fetchLeads = useCallback(async () => {
    try {
      const res = await apiFetch("/leads/");
      const data = await res.json();
      setLeads(Array.isArray(data) ? data : []);
    } catch { setLeads([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const handleScan = async () => {
    setScanning(true);
    try {
      await apiFetch("/leads/scan", { method: "POST" });
      toast.success("Ghost is hunting on Reddit...", { description: "Leads appear in ~20 seconds" });
      let polls = 0;
      const interval = setInterval(async () => {
        await fetchLeads();
        polls++;
        if (polls >= 10) {
          clearInterval(interval);
          setScanning(false);
          toast.success("Scan complete!");
        }
      }, 4000);
    } catch {
      setScanning(false);
      toast.error("Scan failed. Is the backend running?");
    }
  };

  const handleArchive = (id: string) => {
    setLeads(prev => prev.filter(l => l.id !== id));
  };

  const high   = leads.filter(l => l.urgency === "high");
  const medium = leads.filter(l => l.urgency === "medium");
  const low    = leads.filter(l => l.urgency === "low");
  const avgScore = leads.length
    ? Math.round(leads.reduce((a, l) => a + l.intent_score, 0) / leads.length) : 0;

  const monoLabel: React.CSSProperties = {
    fontFamily: "var(--font-mono)",
    fontSize: "0.72rem",
    letterSpacing: "0.25em",
    textTransform: "uppercase",
    color: "rgba(240,237,230,0.3)",
  };

  return (
    <div className="px-6 py-10 lg:px-10 lg:py-12 space-y-8">

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
            Lead Feed
          </h1>
          <span style={monoLabel}>Real-time Reddit opportunities · ranked by AI intent</span>
        </div>
        <button
          onClick={handleScan}
          disabled={scanning}
          className="mt-1 flex items-center gap-2 rounded-lg border px-5 py-2.5 transition-all duration-200 hover:border-[rgba(168,85,247,0.4)] hover:bg-[rgba(168,85,247,0.08)] disabled:opacity-50 flex-shrink-0"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.8rem",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: "rgba(240,237,230,0.7)",
            borderColor: "rgba(240,237,230,0.12)",
            background: "transparent",
          }}
        >
          <RefreshCw className={cn("h-3.5 w-3.5", scanning && "animate-spin")} />
          {scanning ? "Scanning..." : "Scan Now"}
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Leads",   value: leads.length,                                         accent: "#f0ede6"               },
          { label: "High Urgency",  value: high.length,                                          accent: "rgba(239,68,68,0.9)"   },
          { label: "Budget Signal", value: leads.filter(l => l.budget_signal !== "none").length, accent: "rgba(52,211,153,0.9)"  },
          { label: "Avg Score",     value: avgScore,                                             accent: "rgba(234,179,8,0.9)"   },
        ].map(({ label, value, accent }) => (
          <div key={label} className="rounded-2xl border p-5" style={{ background: "#0c0c0c", borderColor: "rgba(240,237,230,0.07)" }}>
            <div style={{ fontFamily: "var(--font-impact-stack)", fontSize: "2.4rem", letterSpacing: "-0.02em", color: accent, lineHeight: 1, marginBottom: "6px" }}>
              {value}
            </div>
            <span style={monoLabel}>{label}</span>
          </div>
        ))}
      </div>

      {/* ── Empty state ── */}
      {!loading && leads.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center rounded-2xl border" style={{ background: "#0c0c0c", borderColor: "rgba(240,237,230,0.07)" }}>
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.18)" }}>
            <Sparkles className="h-8 w-8" style={{ color: "rgba(168,85,247,0.7)" }} />
          </div>
          <h3 className="mb-2" style={{ fontFamily: "var(--font-disp)", fontSize: "2.2rem", fontWeight: 300, fontStyle: "italic", color: "#f0ede6" }}>
            No leads yet
          </h3>
          <p className="mb-8 max-w-sm" style={{ ...monoLabel, lineHeight: 1.8, textTransform: "none" as const }}>
            Click Scan Now and Ghost will hunt Reddit for people who need your exact skills.
          </p>
          <button
            onClick={handleScan}
            disabled={scanning}
            className="flex items-center gap-2 rounded-lg border px-5 py-2.5 transition-all duration-200 hover:border-[rgba(168,85,247,0.4)] hover:bg-[rgba(168,85,247,0.08)] disabled:opacity-50"
            style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(240,237,230,0.7)", borderColor: "rgba(240,237,230,0.12)", background: "transparent" }}
          >
            <RefreshCw className={cn("h-3.5 w-3.5", scanning && "animate-spin")} />
            {scanning ? "Scanning..." : "Scan Now"}
          </button>
        </div>
      )}

      {/* ── Tables ── */}
      {(loading || leads.length > 0) && (
        <div className="space-y-8">
          {loading ? (
            <div className="rounded-2xl border overflow-hidden" style={{ background: "#0c0c0c", borderColor: "rgba(240,237,230,0.07)" }}>
              <Table>
                <TableBody><TableSkeleton /></TableBody>
              </Table>
            </div>
          ) : (
            [
              { label: "High Urgency", dot: "rgba(239,68,68,0.9)",  items: high   },
              { label: "Medium",       dot: "rgba(234,179,8,0.9)",  items: medium },
              { label: "Low",          dot: "rgba(240,237,230,0.3)", items: low    },
            ].filter(({ items }) => items.length > 0).map(({ label, dot, items }) => (
              <div key={label}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ background: dot }} />
                  <span style={{ ...monoLabel, color: "rgba(240,237,230,0.4)" }}>{label} · {items.length}</span>
                </div>
                <div className="rounded-2xl border overflow-hidden" style={{ background: "#0c0c0c", borderColor: "rgba(240,237,230,0.07)" }}>
                  <Table>
                    <TableHeader>
                      <TableRow style={{ borderColor: "rgba(240,237,230,0.06)" }}>
                        {["Score", "Lead", "Urgency", "Budget", "Detected", ""].map((h) => (
                          <TableHead key={h} style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(240,237,230,0.25)", background: "#0c0c0c", borderColor: "rgba(240,237,230,0.06)" }}>
                            {h}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((lead) => (
                        <TableRow
                          key={lead.id}
                          className="cursor-pointer group transition-colors duration-150 hover:bg-[rgba(240,237,230,0.025)]"
                          style={{ borderColor: "rgba(240,237,230,0.05)" }}
                          onClick={() => setSelected(lead)}
                        >
                          <TableCell className="w-16 py-3.5">
                            <ScoreBadge score={lead.intent_score} />
                          </TableCell>
                          <TableCell className="py-3.5 max-w-[340px]">
                            <p className="text-sm leading-snug line-clamp-2 mb-1 group-hover:text-[#f0ede6] transition-colors" style={{ color: "rgba(240,237,230,0.85)" }}>
                              {lead.title}
                            </p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", letterSpacing: "0.1em", color: "rgba(168,85,247,0.7)" }}>r/{lead.subreddit}</span>
                              <span style={{ color: "rgba(240,237,230,0.15)", fontSize: "0.6rem" }}>·</span>
                              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", letterSpacing: "0.05em", color: "rgba(240,237,230,0.25)" }}>u/{lead.author}</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-3.5 w-28">
                            <UrgencyPill urgency={lead.urgency} />
                          </TableCell>
                          <TableCell className="py-3.5 w-24">
                            {lead.budget_signal !== "none" ? (
                              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(52,211,153,0.9)", background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)", padding: "2px 8px", borderRadius: "999px" }}>
                                $ signal
                              </span>
                            ) : (
                              <span style={{ color: "rgba(240,237,230,0.15)", fontSize: "0.8rem" }}>—</span>
                            )}
                          </TableCell>
                          <TableCell className="py-3.5 w-32">
                            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", letterSpacing: "0.05em", color: "rgba(240,237,230,0.22)" }}>
                              {lead.detected_at ? new Date(lead.detected_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"}
                            </span>
                          </TableCell>
                          <TableCell className="py-3.5 w-36" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-1.5 justify-end">
                              <button
                                onClick={() => router.push(`/proposal/${lead.id}`)}
                                className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 transition-all duration-200 hover:border-[rgba(168,85,247,0.4)] hover:bg-[rgba(168,85,247,0.08)]"
                                style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(240,237,230,0.55)", borderColor: "rgba(240,237,230,0.1)", background: "transparent" }}
                              >
                                <FileText className="h-3 w-3" />
                                Draft
                              </button>
                              <button
                                onClick={() => setSelected(lead)}
                                className="flex items-center justify-center rounded-lg border w-7 h-7 transition-all duration-200 hover:border-[rgba(240,237,230,0.2)] hover:text-[#f0ede6]"
                                style={{ borderColor: "rgba(240,237,230,0.08)", color: "rgba(240,237,230,0.3)", background: "transparent" }}
                              >
                                <ChevronRight className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Lead detail panel ── */}
      <LeadPanel
        lead={selected}
        onClose={() => setSelected(null)}
        onDraft={(id) => router.push(`/proposal/${id}`)}
        onArchive={handleArchive}
      />
    </div>
  );
}
