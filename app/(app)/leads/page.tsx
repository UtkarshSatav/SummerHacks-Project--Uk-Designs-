"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

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

const URGENCY_COLORS = {
  high:   { bg: "rgba(239,68,68,0.12)",   border: "rgba(239,68,68,0.3)",   text: "#f87171" },
  medium: { bg: "rgba(234,179,8,0.12)",   border: "rgba(234,179,8,0.3)",   text: "#facc15" },
  low:    { bg: "rgba(107,114,128,0.12)", border: "rgba(107,114,128,0.3)", text: "#9ca3af" },
};

const SCORE_COLOR = (score: number) =>
  score >= 80 ? "#22c55e" : score >= 65 ? "#facc15" : "#f87171";

function ScoreRing({ score }: { score: number }) {
  const r = 18, circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  return (
    <div style={{ position: "relative", width: "48px", height: "48px", flexShrink: 0 }}>
      <svg width="48" height="48" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="24" cy="24" r={r} fill="none" stroke="#1e1e1e" strokeWidth="3" />
        <circle cx="24" cy="24" r={r} fill="none"
          stroke={SCORE_COLOR(score)} strokeWidth="3"
          strokeDasharray={`${fill} ${circ}`}
          strokeLinecap="round"
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "700", color: SCORE_COLOR(score) }}>
        {score}
      </div>
    </div>
  );
}

function LeadCard({ lead, onDraft }: { lead: Lead; onDraft: (id: string) => void }) {
  const urg = URGENCY_COLORS[lead.urgency] || URGENCY_COLORS.low;
  return (
    <div style={{
      backgroundColor: "#111", border: "1px solid #1e1e1e", borderRadius: "12px",
      padding: "20px", display: "flex", flexDirection: "column", gap: "14px",
      transition: "border-color 0.15s",
    }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#2a2a2a")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#1e1e1e")}
    >
      {/* Top row */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
        <ScoreRing score={lead.intent_score} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "6px" }}>
            <span style={{ fontSize: "11px", color: "#7c3aed", backgroundColor: "rgba(124,58,237,0.12)", padding: "2px 8px", borderRadius: "20px", border: "1px solid rgba(124,58,237,0.2)" }}>
              r/{lead.subreddit}
            </span>
            <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "20px", backgroundColor: urg.bg, border: `1px solid ${urg.border}`, color: urg.text, textTransform: "uppercase", fontWeight: "600", letterSpacing: "0.4px" }}>
              {lead.urgency}
            </span>
            {lead.budget_signal !== "none" && (
              <span style={{ fontSize: "11px", color: "#22c55e", backgroundColor: "rgba(34,197,94,0.1)", padding: "2px 8px", borderRadius: "20px", border: "1px solid rgba(34,197,94,0.2)" }}>
                💰 budget signal
              </span>
            )}
          </div>
          <p style={{ fontSize: "14px", fontWeight: "500", color: "#e5e5e5", lineHeight: "1.5", margin: 0 }}>
            {lead.title}
          </p>
        </div>
      </div>

      {/* AI reason */}
      <div style={{ backgroundColor: "#0f0f0f", borderRadius: "8px", padding: "12px", border: "1px solid #1a1a1a" }}>
        <div style={{ fontSize: "11px", color: "#444", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>Ghost's read</div>
        <p style={{ fontSize: "13px", color: "#888", lineHeight: "1.5", margin: 0 }}>{lead.reason}</p>
      </div>

      {/* Hook */}
      {lead.hook && (
        <div style={{ borderLeft: "2px solid #7c3aed", paddingLeft: "12px" }}>
          <div style={{ fontSize: "11px", color: "#444", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>Suggested opener</div>
          <p style={{ fontSize: "13px", color: "#a78bfa", lineHeight: "1.5", margin: 0, fontStyle: "italic" }}>"{lead.hook}"</p>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
        <button
          onClick={() => onDraft(lead.id)}
          style={{ flex: 1, padding: "10px 0", borderRadius: "8px", border: "none", backgroundColor: "#7c3aed", color: "#fff", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}
        >
          Draft Proposal →
        </button>
        <a
          href={lead.url} target="_blank" rel="noopener noreferrer"
          style={{ padding: "10px 16px", borderRadius: "8px", border: "1px solid #2a2a2a", backgroundColor: "transparent", color: "#666", fontSize: "13px", textDecoration: "none", display: "flex", alignItems: "center" }}
        >
          View ↗
        </a>
      </div>
    </div>
  );
}

export default function LeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchLeads = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:8000/leads/");
      const data = await res.json();
      setLeads(Array.isArray(data) ? data : []);
    } catch { setLeads([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const handleScan = async () => {
    setScanning(true);
    try {
      await fetch("http://localhost:8000/leads/scan", { method: "POST" });
      // Poll every 4s while scan runs in background (runs ~20-30s)
      let polls = 0;
      const interval = setInterval(async () => {
        await fetchLeads();
        polls++;
        if (polls >= 10) { clearInterval(interval); setScanning(false); }
      }, 4000);
    } catch {
      setScanning(false);
    }
  };

  const handleDraft = (leadId: string) => {
    router.push(`/proposal/${leadId}`);
  };

  const high   = leads.filter((l) => l.urgency === "high");
  const medium = leads.filter((l) => l.urgency === "medium");
  const low    = leads.filter((l) => l.urgency === "low");

  return (
    <div style={{ padding: "40px 48px", maxWidth: "1100px" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "26px", fontWeight: "700", color: "#fff", margin: 0 }}>Lead Feed</h1>
          <p style={{ color: "#555", fontSize: "14px", marginTop: "6px" }}>
            Real-time opportunities from Reddit, ranked by AI intent score
          </p>
        </div>
        <button
          onClick={handleScan}
          disabled={scanning}
          style={{
            padding: "11px 22px", borderRadius: "8px", border: "none",
            backgroundColor: scanning ? "#4a2090" : "#7c3aed",
            color: "#fff", fontSize: "14px", fontWeight: "600",
            cursor: scanning ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "8px",
            opacity: scanning ? 0.8 : 1,
          }}
        >
          {scanning ? (
            <><span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</span> Scanning Reddit...</>
          ) : (
            "⟳ Scan Now"
          )}
        </button>
      </div>

      {/* Stats bar */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "32px" }}>
        {[
          { label: "Total Leads", value: leads.length, color: "#fff" },
          { label: "High Urgency", value: high.length, color: "#f87171" },
          { label: "Budget Signal", value: leads.filter(l => l.budget_signal !== "none").length, color: "#22c55e" },
          { label: "Avg Score", value: leads.length ? Math.round(leads.reduce((a, l) => a + l.intent_score, 0) / leads.length) : 0, color: "#a78bfa" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ flex: 1, backgroundColor: "#111", border: "1px solid #1e1e1e", borderRadius: "10px", padding: "16px 20px" }}>
            <div style={{ fontSize: "22px", fontWeight: "700", color }}>{value}</div>
            <div style={{ fontSize: "12px", color: "#555", marginTop: "2px" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: "80px 0", color: "#444" }}>
          Loading leads...
        </div>
      )}

      {/* Empty state */}
      {!loading && leads.length === 0 && (
        <div style={{ textAlign: "center", padding: "80px 0", backgroundColor: "#111", border: "1px dashed #2a2a2a", borderRadius: "12px" }}>
          <div style={{ fontSize: "40px", marginBottom: "16px" }}>🎯</div>
          <h3 style={{ color: "#fff", fontSize: "18px", fontWeight: "600", marginBottom: "8px" }}>No leads yet</h3>
          <p style={{ color: "#555", fontSize: "14px", marginBottom: "24px" }}>Click "Scan Now" and Ghost will hunt Reddit for people who need your skills.</p>
          <button onClick={handleScan} disabled={scanning} style={{ padding: "12px 28px", borderRadius: "8px", border: "none", backgroundColor: "#7c3aed", color: "#fff", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}>
            {scanning ? "Scanning..." : "⟳ Scan Now"}
          </button>
        </div>
      )}

      {/* Leads grouped by urgency */}
      {!loading && leads.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          {[
            { label: "🔴 High Urgency", items: high },
            { label: "🟡 Medium",       items: medium },
            { label: "⚪ Low",          items: low },
          ].filter(({ items }) => items.length > 0).map(({ label, items }) => (
            <div key={label}>
              <h2 style={{ fontSize: "13px", fontWeight: "600", color: "#555", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "14px" }}>
                {label} · {items.length}
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "16px" }}>
                {items.map((lead) => (
                  <LeadCard key={lead.id} lead={lead} onDraft={handleDraft} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
