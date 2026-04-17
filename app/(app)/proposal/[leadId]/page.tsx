"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";

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
  subject: string;
  content: string;
};

export default function ProposalPage() {
  const params = useParams();
  const leadId = params?.leadId as string;

  const [lead, setLead] = useState<Lead | null>(null);
  const [draft, setDraft] = useState<DraftResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [drafting, setDrafting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [context, setContext] = useState("");

  const fetchLead = useCallback(async () => {
    if (!leadId) return;
    try {
      const res = await fetch(`http://localhost:8000/leads/${leadId}`);
      const data = await res.json();
      setLead(data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [leadId]);

  useEffect(() => { fetchLead(); }, [fetchLead]);

  const handleDraft = async () => {
    setDrafting(true);
    setDraft(null);
    try {
      const res = await fetch("http://localhost:8000/proposals/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead_id: leadId, context }),
      });
      const data = await res.json();
      setDraft(data);
    } catch { /* ignore */ }
    finally { setDrafting(false); }
  };

  const handleCopy = () => {
    if (!draft) return;
    navigator.clipboard.writeText(`Subject: ${draft.subject}\n\n${draft.content}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", backgroundColor: "#0f0f0f", border: "1px solid #2a2a2a",
    borderRadius: "8px", padding: "10px 12px", color: "#e5e5e5", fontSize: "14px",
    outline: "none", boxSizing: "border-box", resize: "vertical",
  };

  if (loading) {
    return (
      <div style={{ padding: "48px", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div style={{ color: "#444", fontSize: "14px" }}>Loading lead...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px 48px", maxWidth: "900px" }}>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "26px", fontWeight: "700", color: "#fff", margin: "0 0 6px" }}>Draft Proposal</h1>
        <p style={{ color: "#555", fontSize: "14px", margin: 0 }}>
          Ghost writes a human, personalised proposal based on the Reddit post.
        </p>
      </div>

      {lead && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Lead context */}
          <div style={{ backgroundColor: "#111", border: "1px solid #1e1e1e", borderRadius: "12px", padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <span style={{ fontSize: "11px", color: "#7c3aed", backgroundColor: "rgba(124,58,237,0.12)", padding: "2px 8px", borderRadius: "20px", border: "1px solid rgba(124,58,237,0.2)" }}>
                r/{lead.subreddit}
              </span>
              <span style={{ fontSize: "11px", color: "#555" }}>by u/{lead.author}</span>
              <span style={{ fontSize: "11px", color: "#a78bfa", marginLeft: "auto", fontWeight: "600" }}>
                Score: {lead.intent_score}
              </span>
            </div>
            <h2 style={{ fontSize: "16px", fontWeight: "600", color: "#e5e5e5", margin: "0 0 10px" }}>{lead.title}</h2>
            {lead.body && (
              <p style={{ fontSize: "13px", color: "#666", margin: "0 0 12px", lineHeight: "1.6" }}>
                {lead.body.slice(0, 500)}{lead.body.length > 500 ? "..." : ""}
              </p>
            )}
            {lead.hook && (
              <div style={{ borderLeft: "2px solid #7c3aed", paddingLeft: "12px" }}>
                <div style={{ fontSize: "11px", color: "#444", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "3px" }}>Ghost suggested opener</div>
                <p style={{ fontSize: "13px", color: "#a78bfa", fontStyle: "italic", margin: 0 }}>"{lead.hook}"</p>
              </div>
            )}
          </div>

          {/* Extra context */}
          <div>
            <label style={{ fontSize: "12px", color: "#555", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: "8px", display: "block" }}>
              Additional context (optional)
            </label>
            <textarea
              style={{ ...inputStyle, minHeight: "72px" }}
              value={context}
              onChange={e => setContext(e.target.value)}
              placeholder="Any specific skills or past work you want Ghost to highlight..."
            />
          </div>

          <button
            onClick={handleDraft}
            disabled={drafting}
            style={{
              padding: "13px 28px", borderRadius: "8px", border: "none",
              backgroundColor: drafting ? "#4a2090" : "#7c3aed",
              color: "#fff", fontSize: "14px", fontWeight: "600",
              cursor: drafting ? "not-allowed" : "pointer",
              opacity: drafting ? 0.8 : 1, alignSelf: "flex-start",
              display: "flex", alignItems: "center", gap: "8px",
            }}
          >
            {drafting ? (
              <><span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</span> Writing proposal...</>
            ) : (
              "✦ Generate Proposal"
            )}
          </button>

          {/* Draft output */}
          {draft && (
            <div style={{ backgroundColor: "#0d0d0d", border: "1px solid #2a2a2a", borderRadius: "12px", padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontSize: "12px", color: "#444", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Ghost's Draft
                </div>
                <button
                  onClick={handleCopy}
                  style={{ padding: "6px 14px", borderRadius: "6px", border: "1px solid #2a2a2a", backgroundColor: "transparent", color: copied ? "#22c55e" : "#666", fontSize: "12px", cursor: "pointer" }}
                >
                  {copied ? "✓ Copied!" : "Copy all"}
                </button>
              </div>

              <div style={{ borderBottom: "1px solid #1e1e1e", paddingBottom: "12px" }}>
                <div style={{ fontSize: "11px", color: "#555", marginBottom: "4px" }}>Subject</div>
                <p style={{ fontSize: "14px", fontWeight: "600", color: "#e5e5e5", margin: 0 }}>{draft.subject}</p>
              </div>

              <div style={{ whiteSpace: "pre-wrap", fontSize: "14px", color: "#ccc", lineHeight: "1.75" }}>
                {draft.content}
              </div>

              <div style={{ display: "flex", gap: "10px", paddingTop: "8px", borderTop: "1px solid #1e1e1e" }}>
                <button
                  onClick={handleDraft}
                  style={{ padding: "9px 18px", borderRadius: "8px", border: "1px solid #2a2a2a", backgroundColor: "transparent", color: "#888", fontSize: "13px", cursor: "pointer" }}
                >
                  Regenerate
                </button>
                <a
                  href={lead.url} target="_blank" rel="noopener noreferrer"
                  style={{ padding: "9px 18px", borderRadius: "8px", border: "none", backgroundColor: "#7c3aed", color: "#fff", fontSize: "13px", fontWeight: "600", textDecoration: "none" }}
                >
                  Reply on Reddit ↗
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {!lead && !loading && (
        <div style={{ textAlign: "center", padding: "80px 0", color: "#444" }}>
          Lead not found.
        </div>
      )}
    </div>
  );
}
