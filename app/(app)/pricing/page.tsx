"use client";

import { useState } from "react";

type PricingResult = {
  range_low: number;
  range_mid: number;
  range_high: number;
  recommended: number;
  justification: string;
  framing: string;
  upsell: string;
  red_flag: string;
};

const CLIENT_TYPES = [
  { value: "startup",    label: "Startup",    desc: "Early-stage, tight budget" },
  { value: "smb",        label: "SMB",        desc: "Small/medium business" },
  { value: "enterprise", label: "Enterprise", desc: "Large company, big budget" },
  { value: "individual", label: "Individual", desc: "Solo client, personal project" },
];

function PriceBar({ low, high, recommended }: { low: number; high: number; recommended: number }) {
  const pct = (v: number) => Math.min(100, Math.max(0, ((v - low) / (high - low)) * 100));
  return (
    <div style={{ position: "relative", height: "8px", backgroundColor: "#1e1e1e", borderRadius: "4px", margin: "24px 0 32px" }}>
      <div style={{
        position: "absolute", left: 0, width: "100%", height: "100%",
        background: "linear-gradient(to right, rgba(124,58,237,0.3), rgba(124,58,237,0.8))",
        borderRadius: "4px",
      }} />
      <div style={{
        position: "absolute", left: `${pct(recommended)}%`, top: "-6px",
        width: "20px", height: "20px", backgroundColor: "#7c3aed",
        borderRadius: "50%", border: "3px solid #0a0a0a",
        transform: "translateX(-50%)",
      }} />
      <div style={{ position: "absolute", left: "0", top: "16px", fontSize: "11px", color: "#555" }}>
        ₹{low.toLocaleString()}
      </div>
      <div style={{ position: "absolute", left: `${pct(recommended)}%`, top: "16px", fontSize: "11px", color: "#a78bfa", fontWeight: "700", transform: "translateX(-50%)", whiteSpace: "nowrap" }}>
        ₹{recommended.toLocaleString()}
      </div>
      <div style={{ position: "absolute", right: "0", top: "16px", fontSize: "11px", color: "#555" }}>
        ₹{high.toLocaleString()}
      </div>
    </div>
  );
}

export default function PricingPage() {
  const [description, setDescription] = useState("");
  const [clientType, setClientType] = useState("smb");
  const [result, setResult] = useState<PricingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleAnalyse = async () => {
    if (!description.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("http://localhost:8000/pricing/analyse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_description: description, client_type: clientType }),
      });
      const data = await res.json();
      setResult(data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", backgroundColor: "#0f0f0f", border: "1px solid #2a2a2a",
    borderRadius: "8px", padding: "12px", color: "#e5e5e5", fontSize: "14px",
    outline: "none", boxSizing: "border-box",
  };

  return (
    <div style={{ padding: "40px 48px", maxWidth: "800px" }}>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "26px", fontWeight: "700", color: "#fff", margin: "0 0 6px" }}>Pricing Intelligence</h1>
        <p style={{ color: "#555", fontSize: "14px", margin: 0 }}>
          Describe a project and Ghost tells you exactly what to charge.
        </p>
      </div>

      <div style={{ backgroundColor: "#111", border: "1px solid #1e1e1e", borderRadius: "12px", padding: "24px", display: "flex", flexDirection: "column", gap: "20px", marginBottom: "24px" }}>
        <div>
          <label style={{ fontSize: "12px", color: "#555", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: "8px", display: "block" }}>
            Project Description
          </label>
          <textarea
            style={{ ...inputStyle, resize: "vertical", minHeight: "100px" } as React.CSSProperties}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="e.g. Build a full-stack SaaS dashboard with authentication, billing integration, and admin panel. 6-8 weeks timeline."
          />
        </div>

        <div>
          <label style={{ fontSize: "12px", color: "#555", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: "10px", display: "block" }}>
            Client Type
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px" }}>
            {CLIENT_TYPES.map(ct => (
              <button
                key={ct.value}
                onClick={() => setClientType(ct.value)}
                style={{
                  padding: "12px 16px", borderRadius: "8px", textAlign: "left",
                  border: `1px solid ${clientType === ct.value ? "rgba(124,58,237,0.5)" : "#2a2a2a"}`,
                  backgroundColor: clientType === ct.value ? "rgba(124,58,237,0.1)" : "transparent",
                  cursor: "pointer",
                }}
              >
                <div style={{ fontSize: "13px", fontWeight: "600", color: clientType === ct.value ? "#a78bfa" : "#888" }}>{ct.label}</div>
                <div style={{ fontSize: "11px", color: "#444", marginTop: "2px" }}>{ct.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleAnalyse}
          disabled={loading || !description.trim()}
          style={{
            padding: "13px 28px", borderRadius: "8px", border: "none",
            backgroundColor: loading || !description.trim() ? "#2a1a50" : "#7c3aed",
            color: "#fff", fontSize: "14px", fontWeight: "600",
            cursor: loading || !description.trim() ? "not-allowed" : "pointer",
            opacity: loading || !description.trim() ? 0.6 : 1,
            display: "flex", alignItems: "center", gap: "8px", alignSelf: "flex-start",
          }}
        >
          {loading ? (
            <><span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</span> Analysing...</>
          ) : (
            "✦ Analyse Pricing"
          )}
        </button>
      </div>

      {result && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Price range */}
          <div style={{ backgroundColor: "#111", border: "1px solid #1e1e1e", borderRadius: "12px", padding: "24px" }}>
            <div style={{ fontSize: "12px", color: "#555", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>
              Recommended Price
            </div>
            <div style={{ fontSize: "36px", fontWeight: "700", color: "#a78bfa" }}>
              ₹{result.recommended.toLocaleString()}
            </div>
            <PriceBar low={result.range_low} high={result.range_high} recommended={result.recommended} />
            <p style={{ fontSize: "13px", color: "#777", margin: 0, lineHeight: "1.6" }}>{result.justification}</p>
          </div>

          {/* Framing */}
          <div style={{ backgroundColor: "#0d1a0d", border: "1px solid rgba(34,197,94,0.2)", borderRadius: "12px", padding: "20px" }}>
            <div style={{ fontSize: "11px", color: "#444", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>
              How to say it
            </div>
            <p style={{ fontSize: "14px", color: "#86efac", margin: "0 0 10px", lineHeight: "1.6", fontStyle: "italic" }}>
              "{result.framing}"
            </p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(result.framing);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              style={{ padding: "6px 14px", borderRadius: "6px", border: "1px solid rgba(34,197,94,0.3)", backgroundColor: "transparent", color: copied ? "#22c55e" : "#555", fontSize: "12px", cursor: "pointer" }}
            >
              {copied ? "✓ Copied!" : "Copy line"}
            </button>
          </div>

          {/* Upsell */}
          <div style={{ backgroundColor: "#0d0d1a", border: "1px solid rgba(124,58,237,0.2)", borderRadius: "12px", padding: "20px" }}>
            <div style={{ fontSize: "11px", color: "#444", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>
              Upsell opportunity (+20%)
            </div>
            <p style={{ fontSize: "13px", color: "#a78bfa", margin: 0, lineHeight: "1.6" }}>{result.upsell}</p>
          </div>

          {/* Red flag */}
          <div style={{ backgroundColor: "#1a0d0d", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "12px", padding: "20px" }}>
            <div style={{ fontSize: "11px", color: "#444", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>
              Charge more because
            </div>
            <p style={{ fontSize: "13px", color: "#fca5a5", margin: 0, lineHeight: "1.6" }}>{result.red_flag}</p>
          </div>
        </div>
      )}
    </div>
  );
}
