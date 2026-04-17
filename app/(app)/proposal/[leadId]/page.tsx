"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiFetch } from "../../../lib/api";
import { Copy, Check, RefreshCw, ExternalLink, ArrowLeft, DollarSign, FileText, Send } from "lucide-react";

type Lead = {
  id: string;
  title: string;
  body: string;
  author: string;
  subreddit: string;
  intent_score: number;
  hook: string;
  url: string;
};

type DraftResult = {
  id?: string;
  subject: string;
  content: string;
};

export default function ProposalPage() {
  const params = useParams();
  const router = useRouter();
  const leadId = params?.leadId as string;

  const [lead, setLead] = useState<Lead | null>(null);
  const [draft, setDraft] = useState<DraftResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [drafting, setDrafting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [context, setContext] = useState("");
  const [pricingLoading, setPricingLoading] = useState(false);
  const [pricingResult, setPricingResult] = useState<{ recommended: number; justification: string } | null>(null);
  const [includePricing, setIncludePricing] = useState(false);
  const [status, setStatus] = useState<"draft" | "sent">("draft");

  const fetchLead = useCallback(async () => {
    if (!leadId) return;
    try {
      const res = await apiFetch(`/leads/${leadId}`);
      setLead(await res.json());
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [leadId]);

  useEffect(() => { fetchLead(); }, [fetchLead]);

  const handleDraft = async () => {
    setDrafting(true);
    setDraft(null);
    setStatus("draft");
    try {
      const priceCtx = includePricing && pricingResult
        ? `YOU ABSOLUTELY MUST INCLUDE THIS EXACT SENTENCE IN THE PROPOSAL BODY: "Based on the scope, I estimate this project will cost ₹${pricingResult.recommended.toLocaleString()}"\n\n`
        : "";
      const res = await apiFetch("/proposals/draft", {
        method: "POST",
        body: JSON.stringify({ lead_id: leadId, context: priceCtx + context }),
      });
      const data = await res.json();
      if (includePricing && pricingResult && !data.content.includes(pricingResult.recommended.toLocaleString())) {
        data.content += `\n\nBased on your requirements, I'd estimate this project around ₹${pricingResult.recommended.toLocaleString()}.`;
      }
      setDraft(data);
      toast.success("Proposal drafted");
    } catch {
      toast.error("Failed to draft proposal");
    } finally {
      setDrafting(false);
    }
  };

  const handleCopy = () => {
    if (!draft) return;
    navigator.clipboard.writeText(`Subject: ${draft.subject}\n\n${draft.content}`);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const markAsSent = async () => {
    if (!draft?.id) return;
    try {
      await apiFetch(`/proposals/${draft.id}/status`, { method: "PATCH", body: JSON.stringify({ status: "sent" }) });
      await apiFetch(`/leads/${leadId}/status`, { method: "PATCH", body: JSON.stringify({ status: "sent" }) });
      setStatus("sent");
      toast.success("Marked as sent! Moved to Active Outreach on dashboard.");
    } catch {
      toast.error("Failed to update status");
    }
  };

  const inp: React.CSSProperties = {
    width: "100%", background: "#111",
    border: "1px solid rgba(240,237,230,0.09)",
    borderRadius: "10px", padding: "10px 14px",
    color: "#f0ede6", fontSize: "14px",
    outline: "none", boxSizing: "border-box",
    fontFamily: "inherit", resize: "vertical",
    lineHeight: 1.6,
  };
  const lbl: React.CSSProperties = {
    fontFamily: "var(--font-mono)", fontSize: "0.65rem",
    letterSpacing: "0.25em", textTransform: "uppercase",
    color: "rgba(240,237,230,0.3)", marginBottom: "6px", display: "block",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(240,237,230,0.2)" }} className="animate-pulse">
          Loading lead...
        </span>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "rgba(240,237,230,0.3)" }}>Lead not found.</p>
        <button onClick={() => router.push("/leads")} className="flex items-center gap-2 text-sm" style={{ color: "rgba(240,237,230,0.4)" }}>
          <ArrowLeft className="h-4 w-4" /> Back to leads
        </button>
      </div>
    );
  }

  return (
    <div className="px-6 py-10 lg:px-10 lg:py-12 space-y-8 max-w-3xl">

      {/* ── Back + Header ── */}
      <div>
        <button
          onClick={() => router.push("/leads")}
          className="flex items-center gap-1.5 mb-5 transition-colors hover:text-[rgba(240,237,230,0.6)]"
          style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(240,237,230,0.28)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
        >
          <ArrowLeft className="h-3 w-3" /> Lead Feed
        </button>
        <h1
          className="leading-tight mb-2"
          style={{
            fontFamily: "var(--font-disp)",
            fontSize: "clamp(2.4rem, 3.5vw, 3.8rem)",
            fontWeight: 300,
            fontStyle: "italic",
            color: "#f0ede6",
            letterSpacing: "-0.01em",
          }}
        >
          Draft Proposal
        </h1>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(240,237,230,0.25)" }}>
          Ghost writes a human, personalised proposal
        </span>
      </div>

      {/* ── Lead context card ── */}
      <div className="rounded-2xl border p-5 space-y-4" style={{ background: "#0c0c0c", borderColor: "rgba(240,237,230,0.07)" }}>
        <div className="flex items-center gap-2 flex-wrap">
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(168,85,247,0.8)", background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.2)", padding: "3px 10px", borderRadius: "999px" }}>
            r/{lead.subreddit}
          </span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "rgba(240,237,230,0.28)" }}>
            u/{lead.author}
          </span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", letterSpacing: "0.1em", color: "rgba(168,85,247,0.7)", marginLeft: "auto" }}>
            Score: {lead.intent_score}
          </span>
        </div>

        <h2 style={{ fontSize: "15px", fontWeight: 500, color: "#f0ede6", lineHeight: 1.4 }}>{lead.title}</h2>

        {lead.body && (
          <p style={{ fontSize: "13px", color: "rgba(240,237,230,0.4)", lineHeight: 1.7 }}>
            {lead.body.slice(0, 500)}{lead.body.length > 500 ? "..." : ""}
          </p>
        )}

        {lead.hook && (
          <div
            className="rounded-xl px-4 py-3"
            style={{ borderLeft: "3px solid rgba(168,85,247,0.4)", background: "rgba(168,85,247,0.04)", border: "1px solid rgba(168,85,247,0.1)", borderLeftWidth: "3px" }}
          >
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(168,85,247,0.45)", marginBottom: "4px" }}>
              Ghost&apos;s suggested opener
            </p>
            <p style={{ fontSize: "13px", color: "rgba(168,85,247,0.8)", fontStyle: "italic" }}>&ldquo;{lead.hook}&rdquo;</p>
          </div>
        )}
      </div>

      {/* ── Extra context ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label style={lbl}>Additional context (optional)</label>
          <button
            onClick={async () => {
              setPricingLoading(true);
              try {
                const res = await apiFetch("/pricing/analyse", {
                  method: "POST",
                  body: JSON.stringify({ project_description: lead.body, client_type: "startup" }),
                });
                const data = await res.json();
                if (data?.recommended) {
                  setPricingResult(data);
                  setIncludePricing(true);
                  toast.success("Pricing analysed!");
                } else {
                  toast.error("Could not analyse pricing.");
                }
              } catch {
                toast.error("Pricing analysis failed.");
              } finally {
                setPricingLoading(false);
              }
            }}
            disabled={pricingLoading}
            className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 transition-all duration-200 hover:border-[rgba(234,179,8,0.35)] hover:bg-[rgba(234,179,8,0.06)] disabled:opacity-50"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.65rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "rgba(234,179,8,0.8)",
              borderColor: "rgba(234,179,8,0.2)",
              background: "transparent",
            }}
          >
            <DollarSign className="h-3 w-3" />
            {pricingLoading ? "Analysing..." : "Auto-price this lead"}
          </button>
        </div>

        {pricingResult && (
          <div
            className="rounded-xl border p-4"
            style={{ background: "rgba(234,179,8,0.04)", borderColor: "rgba(234,179,8,0.18)" }}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", letterSpacing: "0.1em", color: "rgba(234,179,8,0.9)", marginBottom: "4px" }}>
                  Suggested: ₹{pricingResult.recommended.toLocaleString()}
                </p>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", color: "rgba(240,237,230,0.35)", lineHeight: 1.5 }}>
                  {pricingResult.justification}
                </p>
              </div>
              <button
                onClick={() => setIncludePricing(!includePricing)}
                className="flex-shrink-0 rounded-lg px-3 py-1.5 transition-all duration-200"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.65rem",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: includePricing ? "rgba(52,211,153,0.9)" : "rgba(240,237,230,0.4)",
                  background: includePricing ? "rgba(52,211,153,0.08)" : "transparent",
                  border: `1px solid ${includePricing ? "rgba(52,211,153,0.3)" : "rgba(240,237,230,0.1)"}`,
                }}
              >
                {includePricing ? "✓ Added" : "+ Add to Proposal"}
              </button>
            </div>
          </div>
        )}

        <textarea
          style={{ ...inp, minHeight: "72px" }}
          value={context}
          onChange={e => setContext(e.target.value)}
          placeholder="Any specific skills or past work you want Ghost to highlight..."
        />
      </div>

      {/* ── Generate button ── */}
      <button
        onClick={handleDraft}
        disabled={drafting}
        className="flex items-center gap-2 rounded-xl px-6 py-3.5 transition-all duration-200 hover:opacity-90 disabled:opacity-50"
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.82rem",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "#090909",
          background: "#f0ede6",
          border: "none",
        }}
      >
        {drafting ? (
          <>
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            Writing proposal...
          </>
        ) : (
          <>
            <FileText className="h-3.5 w-3.5" />
            Generate Proposal
          </>
        )}
      </button>

      {/* ── Draft output ── */}
      {draft && (
        <div className="rounded-2xl border space-y-0 overflow-hidden" style={{ background: "#0c0c0c", borderColor: "rgba(240,237,230,0.07)" }}>
          {/* Draft header */}
          <div
            className="flex items-center justify-between px-6 py-4"
            style={{ borderBottom: "1px solid rgba(240,237,230,0.06)" }}
          >
            <div className="flex items-center gap-2">
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(240,237,230,0.28)" }}>
                Ghost&apos;s Draft
              </span>
              {status === "sent" && (
                <span
                  className="rounded-full px-2 py-0.5"
                  style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(52,211,153,0.9)", background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)" }}
                >
                  Sent
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDraft}
                className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 transition-all duration-200 hover:border-[rgba(240,237,230,0.18)]"
                style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(240,237,230,0.35)", borderColor: "rgba(240,237,230,0.08)", background: "transparent" }}
              >
                <RefreshCw className="h-3 w-3" />
                Regenerate
              </button>
              {status === "draft" && draft.id && (
                <button
                  onClick={markAsSent}
                  className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 transition-all duration-200 hover:border-[rgba(168,85,247,0.4)] hover:bg-[rgba(168,85,247,0.08)]"
                  style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(168,85,247,0.7)", borderColor: "rgba(168,85,247,0.2)", background: "transparent" }}
                >
                  <Send className="h-3 w-3" />
                  Mark as Sent
                </button>
              )}
            </div>
          </div>

          {/* Subject */}
          <div className="px-6 py-4" style={{ borderBottom: "1px solid rgba(240,237,230,0.05)" }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(240,237,230,0.22)", marginBottom: "5px" }}>Subject</p>
            <p style={{ fontSize: "14px", fontWeight: 500, color: "#f0ede6" }}>{draft.subject}</p>
          </div>

          {/* Body */}
          <div className="px-6 py-5">
            <p style={{ whiteSpace: "pre-wrap", fontSize: "14px", color: "rgba(240,237,230,0.75)", lineHeight: 1.8 }}>
              {draft.content}
            </p>
          </div>

          {/* Footer actions */}
          <div
            className="flex items-center gap-3 px-6 py-4"
            style={{ borderTop: "1px solid rgba(240,237,230,0.06)" }}
          >
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 rounded-xl px-5 py-2.5 transition-all duration-200 hover:opacity-90"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.75rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                background: copied ? "rgba(52,211,153,0.12)" : "#f0ede6",
                color: copied ? "rgba(52,211,153,0.9)" : "#090909",
                border: copied ? "1px solid rgba(52,211,153,0.25)" : "none",
              }}
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied!" : "Copy All"}
            </button>
            <a
              href={lead.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl border px-5 py-2.5 transition-all duration-200 hover:border-[rgba(168,85,247,0.4)] hover:bg-[rgba(168,85,247,0.08)]"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.75rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "rgba(240,237,230,0.55)",
                borderColor: "rgba(240,237,230,0.1)",
                textDecoration: "none",
              }}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Reply on Reddit
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
