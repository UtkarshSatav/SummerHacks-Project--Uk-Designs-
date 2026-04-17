"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { apiFetch } from "../../lib/api";
import { Copy, Check, DollarSign, FileText, X, Printer } from "lucide-react";

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

type InvoiceData = {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  clientName: string;
  clientGST: string;
  freelancerName: string;
  freelancerGST: string;
  projectDesc: string;
  amount: number;
  includeGST: boolean;
};

const CLIENT_TYPES = [
  { value: "startup",    label: "Startup",    desc: "Early-stage, tight budget" },
  { value: "smb",        label: "SMB",        desc: "Small / medium business"   },
  { value: "enterprise", label: "Enterprise", desc: "Large company, big budget"  },
  { value: "individual", label: "Individual", desc: "Solo client, personal work" },
];

function PriceBar({ low, high, recommended }: { low: number; high: number; recommended: number }) {
  const pct = (v: number) => Math.min(100, Math.max(0, ((v - low) / (high - low)) * 100));
  return (
    <div className="relative my-7" style={{ height: "6px" }}>
      <div className="absolute inset-0 rounded-full" style={{ background: "rgba(240,237,230,0.06)" }} />
      <div
        className="absolute left-0 top-0 h-full rounded-full"
        style={{ width: `${pct(recommended)}%`, background: "linear-gradient(to right, rgba(168,85,247,0.3), rgba(168,85,247,0.85))" }}
      />
      <div
        className="absolute top-1/2 -translate-y-1/2 h-4 w-4 rounded-full border-2"
        style={{ left: `${pct(recommended)}%`, transform: "translate(-50%, -50%)", background: "rgba(168,85,247,0.9)", borderColor: "#090909" }}
      />
      <div className="absolute top-5 left-0" style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", color: "rgba(240,237,230,0.3)" }}>
        ₹{low.toLocaleString()}
      </div>
      <div
        className="absolute top-5 -translate-x-1/2 whitespace-nowrap"
        style={{ left: `${pct(recommended)}%`, fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "rgba(168,85,247,0.9)", fontWeight: 600 }}
      >
        ₹{recommended.toLocaleString()}
      </div>
      <div className="absolute top-5 right-0" style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", color: "rgba(240,237,230,0.3)" }}>
        ₹{high.toLocaleString()}
      </div>
    </div>
  );
}

function printInvoice(inv: InvoiceData) {
  const gstAmount = inv.includeGST ? Math.round(inv.amount * 0.18) : 0;
  const total = inv.amount + gstAmount;

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Invoice ${inv.invoiceNumber}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; background: #fff; color: #111; padding: 48px; max-width: 800px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 48px; border-bottom: 2px solid #111; padding-bottom: 32px; }
    .brand { font-size: 28px; font-weight: 600; letter-spacing: -0.02em; }
    .brand span { color: #7c3aed; }
    .invoice-meta { text-align: right; }
    .invoice-meta .inv-num { font-size: 22px; font-weight: 600; margin-bottom: 4px; }
    .invoice-meta .inv-dates { font-size: 12px; color: #666; line-height: 1.8; }
    .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 40px; }
    .party-label { font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: #999; margin-bottom: 8px; font-weight: 500; }
    .party-name { font-size: 16px; font-weight: 600; margin-bottom: 4px; }
    .party-gst { font-size: 11px; color: #666; font-family: monospace; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 32px; }
    thead tr { border-bottom: 1px solid #e5e5e5; }
    thead th { text-align: left; font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: #999; padding: 8px 0; font-weight: 500; }
    thead th:last-child { text-align: right; }
    tbody td { padding: 16px 0; font-size: 14px; border-bottom: 1px solid #f5f5f5; vertical-align: top; }
    tbody td:last-child { text-align: right; font-variant-numeric: tabular-nums; }
    .desc-title { font-weight: 500; margin-bottom: 4px; }
    .totals { margin-left: auto; width: 280px; }
    .totals-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; color: #555; }
    .totals-row.total { border-top: 2px solid #111; margin-top: 8px; padding-top: 12px; font-size: 18px; font-weight: 600; color: #111; }
    .footer { margin-top: 64px; padding-top: 24px; border-top: 1px solid #e5e5e5; font-size: 11px; color: #aaa; text-align: center; }
    @media print { body { padding: 24px; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">ghost<span>.</span></div>
    <div class="invoice-meta">
      <div class="inv-num">Invoice #${inv.invoiceNumber}</div>
      <div class="inv-dates">
        Issue date: ${inv.issueDate}<br/>
        Due date: ${inv.dueDate}
      </div>
    </div>
  </div>

  <div class="parties">
    <div>
      <div class="party-label">From</div>
      <div class="party-name">${inv.freelancerName || "Freelancer"}</div>
      ${inv.freelancerGST ? `<div class="party-gst">GSTIN: ${inv.freelancerGST}</div>` : ""}
    </div>
    <div>
      <div class="party-label">Bill To</div>
      <div class="party-name">${inv.clientName}</div>
      ${inv.clientGST ? `<div class="party-gst">GSTIN: ${inv.clientGST}</div>` : ""}
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th style="text-align:right">Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>
          <div class="desc-title">${inv.projectDesc}</div>
        </td>
        <td>₹${inv.amount.toLocaleString("en-IN")}</td>
      </tr>
    </tbody>
  </table>

  <div class="totals">
    <div class="totals-row"><span>Subtotal</span><span>₹${inv.amount.toLocaleString("en-IN")}</span></div>
    ${inv.includeGST ? `<div class="totals-row"><span>GST (18%)</span><span>₹${gstAmount.toLocaleString("en-IN")}</span></div>` : ""}
    <div class="totals-row total"><span>Total Due</span><span>₹${total.toLocaleString("en-IN")}</span></div>
  </div>

  <div class="footer">Generated via Ghost · ghost.app</div>
  <script>window.onload = () => { window.print(); }</script>
</body>
</html>`;

  const win = window.open("", "_blank");
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}

function InvoicePanel({ result, description, onClose }: { result: PricingResult; description: string; onClose: () => void }) {
  const today = new Date();
  const due = new Date(today);
  due.setDate(due.getDate() + 30);
  const fmt = (d: Date) => d.toISOString().split("T")[0];

  const [inv, setInv] = useState<InvoiceData>({
    invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
    issueDate: fmt(today),
    dueDate: fmt(due),
    clientName: "",
    clientGST: "",
    freelancerName: "",
    freelancerGST: "",
    projectDesc: description.slice(0, 120),
    amount: result.recommended,
    includeGST: true,
  });

  const set = (k: keyof InvoiceData, v: string | number | boolean) =>
    setInv(prev => ({ ...prev, [k]: v }));

  const gstAmount = inv.includeGST ? Math.round(inv.amount * 0.18) : 0;
  const total = inv.amount + gstAmount;

  const inp: React.CSSProperties = {
    width: "100%",
    background: "rgba(240,237,230,0.04)",
    border: "1px solid rgba(240,237,230,0.1)",
    borderRadius: "8px",
    padding: "10px 12px",
    color: "#f0ede6",
    fontSize: "13px",
    outline: "none",
    fontFamily: "var(--font-mono)",
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: "rgba(9,9,9,0.7)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="fixed right-0 top-0 z-50 h-full flex flex-col"
        style={{ width: "min(520px, 100vw)", background: "#0c0c0c", borderLeft: "1px solid rgba(240,237,230,0.08)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: "rgba(240,237,230,0.07)" }}>
          <div className="flex items-center gap-3">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.2)" }}
            >
              <FileText className="h-4 w-4" style={{ color: "rgba(234,179,8,0.8)" }} />
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(240,237,230,0.5)" }}>
                Invoice Generator
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "rgba(240,237,230,0.25)" }}>
                {inv.invoiceNumber}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 transition-all hover:bg-white/5">
            <X className="h-4 w-4" style={{ color: "rgba(240,237,230,0.4)" }} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">

          {/* Amount preview */}
          <div
            className="rounded-xl border p-4 flex items-center justify-between"
            style={{ background: "rgba(168,85,247,0.05)", borderColor: "rgba(168,85,247,0.18)" }}
          >
            <div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(168,85,247,0.5)", marginBottom: "4px" }}>
                Base Amount
              </div>
              <div style={{ fontFamily: "var(--font-impact-stack)", fontSize: "2rem", color: "rgba(168,85,247,0.9)", letterSpacing: "-0.02em", lineHeight: 1 }}>
                ₹{inv.amount.toLocaleString("en-IN")}
              </div>
            </div>
            {inv.includeGST && (
              <div className="text-right">
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(240,237,230,0.25)", marginBottom: "4px" }}>
                  Total incl. GST
                </div>
                <div style={{ fontFamily: "var(--font-impact-stack)", fontSize: "2rem", color: "#f0ede6", letterSpacing: "-0.02em", lineHeight: 1 }}>
                  ₹{total.toLocaleString("en-IN")}
                </div>
              </div>
            )}
          </div>

          {/* Dates row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(240,237,230,0.3)", display: "block", marginBottom: "6px" }}>
                Issue Date
              </label>
              <input type="date" style={inp} value={inv.issueDate} onChange={e => set("issueDate", e.target.value)} />
            </div>
            <div>
              <label style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(240,237,230,0.3)", display: "block", marginBottom: "6px" }}>
                Due Date
              </label>
              <input type="date" style={inp} value={inv.dueDate} onChange={e => set("dueDate", e.target.value)} />
            </div>
          </div>

          {/* Client */}
          <div>
            <label style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(240,237,230,0.3)", display: "block", marginBottom: "6px" }}>
              Client Name *
            </label>
            <input style={inp} placeholder="Acme Corp" value={inv.clientName} onChange={e => set("clientName", e.target.value)} />
          </div>

          <div>
            <label style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(240,237,230,0.3)", display: "block", marginBottom: "6px" }}>
              Client GSTIN
            </label>
            <input style={inp} placeholder="22AAAAA0000A1Z5" maxLength={15} value={inv.clientGST} onChange={e => set("clientGST", e.target.value.toUpperCase())} />
          </div>

          {/* Freelancer */}
          <div>
            <label style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(240,237,230,0.3)", display: "block", marginBottom: "6px" }}>
              Your Name
            </label>
            <input style={inp} placeholder="Your full name or business name" value={inv.freelancerName} onChange={e => set("freelancerName", e.target.value)} />
          </div>

          <div>
            <label style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(240,237,230,0.3)", display: "block", marginBottom: "6px" }}>
              Your GSTIN (optional)
            </label>
            <input style={inp} placeholder="22AAAAA0000A1Z5" maxLength={15} value={inv.freelancerGST} onChange={e => set("freelancerGST", e.target.value.toUpperCase())} />
          </div>

          {/* Project desc */}
          <div>
            <label style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(240,237,230,0.3)", display: "block", marginBottom: "6px" }}>
              Project Description
            </label>
            <textarea
              style={{ ...inp, resize: "vertical", minHeight: "72px" } as React.CSSProperties}
              value={inv.projectDesc}
              onChange={e => set("projectDesc", e.target.value)}
            />
          </div>

          {/* Amount override */}
          <div>
            <label style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(240,237,230,0.3)", display: "block", marginBottom: "6px" }}>
              Invoice Amount (₹)
            </label>
            <input
              type="number"
              style={inp}
              value={inv.amount}
              onChange={e => set("amount", Number(e.target.value))}
            />
          </div>

          {/* GST toggle */}
          <button
            onClick={() => set("includeGST", !inv.includeGST)}
            className="flex items-center gap-3 rounded-xl border p-4 w-full text-left transition-all duration-200"
            style={{
              background: inv.includeGST ? "rgba(234,179,8,0.05)" : "transparent",
              borderColor: inv.includeGST ? "rgba(234,179,8,0.25)" : "rgba(240,237,230,0.08)",
            }}
          >
            <div
              className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded"
              style={{
                background: inv.includeGST ? "rgba(234,179,8,0.8)" : "transparent",
                border: `1.5px solid ${inv.includeGST ? "rgba(234,179,8,0.8)" : "rgba(240,237,230,0.2)"}`,
              }}
            >
              {inv.includeGST && <Check className="h-3 w-3" style={{ color: "#090909" }} />}
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", letterSpacing: "0.1em", color: inv.includeGST ? "rgba(234,179,8,0.9)" : "rgba(240,237,230,0.4)" }}>
                Add 18% GST
              </div>
              {inv.includeGST && (
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "rgba(234,179,8,0.5)", marginTop: "2px" }}>
                  +₹{gstAmount.toLocaleString("en-IN")} · Total ₹{total.toLocaleString("en-IN")}
                </div>
              )}
            </div>
          </button>

        </div>

        {/* Footer */}
        <div className="p-5 border-t" style={{ borderColor: "rgba(240,237,230,0.07)" }}>
          <button
            onClick={() => printInvoice(inv)}
            disabled={!inv.clientName.trim()}
            className="flex items-center justify-center gap-2 w-full rounded-xl px-6 py-3 transition-all duration-200 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
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
            <Printer className="h-4 w-4" />
            Print / Download PDF
          </button>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", textAlign: "center", color: "rgba(240,237,230,0.2)", marginTop: "8px", letterSpacing: "0.1em" }}>
            Opens print dialog · Save as PDF from there
          </p>
        </div>
      </div>
    </>
  );
}

export default function PricingPage() {
  const [description, setDescription] = useState("");
  const [clientType, setClientType] = useState("smb");
  const [result, setResult] = useState<PricingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);

  const handleAnalyse = async () => {
    if (!description.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await apiFetch("/pricing/analyse", {
        method: "POST",
        body: JSON.stringify({ project_description: description, client_type: clientType }),
      });
      setResult(await res.json());
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  const inp: React.CSSProperties = {
    width: "100%",
    background: "#111",
    border: "1px solid rgba(240,237,230,0.09)",
    borderRadius: "10px",
    padding: "12px 14px",
    color: "#f0ede6",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
    lineHeight: 1.6,
  };
  const lbl: React.CSSProperties = {
    fontFamily: "var(--font-mono)",
    fontSize: "0.65rem",
    letterSpacing: "0.25em",
    textTransform: "uppercase",
    color: "rgba(240,237,230,0.3)",
    marginBottom: "8px",
    display: "block",
  };

  return (
    <div className="px-6 py-10 lg:px-10 lg:py-12 space-y-8">

      {/* Invoice panel */}
      {showInvoice && result && (
        <InvoicePanel
          result={result}
          description={description}
          onClose={() => setShowInvoice(false)}
        />
      )}

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
            Pricing Intelligence
          </h1>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(240,237,230,0.28)" }}>
            Describe a project · Ghost tells you exactly what to charge
          </span>
        </div>
        <div
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl mt-1"
          style={{ background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.18)" }}
        >
          <DollarSign className="h-5 w-5" style={{ color: "rgba(234,179,8,0.7)" }} />
        </div>
      </div>

      {/* ── Input card ── */}
      <div
        className="rounded-2xl border p-6 space-y-6"
        style={{ background: "#0c0c0c", borderColor: "rgba(240,237,230,0.07)" }}
      >
        <div>
          <label style={lbl}>Project Description</label>
          <textarea
            style={{ ...inp, resize: "vertical", minHeight: "96px" } as React.CSSProperties}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="e.g. Build a full-stack SaaS dashboard with authentication, billing integration, and admin panel. 6–8 weeks timeline."
          />
        </div>

        <div>
          <label style={lbl}>Client Type</label>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {CLIENT_TYPES.map(ct => (
              <button
                key={ct.value}
                onClick={() => setClientType(ct.value)}
                className="rounded-xl border p-3 text-left transition-all duration-200"
                style={{
                  background: clientType === ct.value ? "rgba(168,85,247,0.08)" : "transparent",
                  borderColor: clientType === ct.value ? "rgba(168,85,247,0.35)" : "rgba(240,237,230,0.08)",
                }}
              >
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", letterSpacing: "0.1em", color: clientType === ct.value ? "rgba(168,85,247,0.9)" : "rgba(240,237,230,0.5)", marginBottom: "2px" }}>
                  {ct.label}
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "rgba(240,237,230,0.22)" }}>{ct.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleAnalyse}
          disabled={loading || !description.trim()}
          className="flex items-center gap-2 rounded-xl px-6 py-3 transition-all duration-200 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
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
          {loading ? (
            <>
              <div className="h-3.5 w-3.5 rounded-full border-2 animate-spin" style={{ borderColor: "rgba(9,9,9,0.3)", borderTopColor: "#090909" }} />
              Analysing...
            </>
          ) : (
            <>✦ Analyse Pricing</>
          )}
        </button>
      </div>

      {/* ── Result ── */}
      {result && (
        <div className="space-y-4">

          {/* Top row: price + how to say it */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Recommended price */}
            <div className="rounded-2xl border p-6" style={{ background: "#0c0c0c", borderColor: "rgba(240,237,230,0.07)" }}>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(240,237,230,0.28)", marginBottom: "8px" }}>
                Recommended Price
              </p>
              <div
                style={{
                  fontFamily: "var(--font-impact-stack)",
                  fontSize: "clamp(3rem, 5vw, 5rem)",
                  letterSpacing: "-0.02em",
                  color: "rgba(168,85,247,0.9)",
                  lineHeight: 1,
                  marginBottom: "4px",
                }}
              >
                ₹{result.recommended.toLocaleString()}
              </div>
              <PriceBar low={result.range_low} high={result.range_high} recommended={result.recommended} />
              <p className="mt-8 text-sm leading-relaxed" style={{ color: "rgba(240,237,230,0.5)" }}>{result.justification}</p>
            </div>

            {/* How to say it */}
            <div
              className="rounded-2xl border p-5 flex flex-col space-y-3"
              style={{ background: "rgba(52,211,153,0.03)", borderColor: "rgba(52,211,153,0.15)" }}
            >
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(52,211,153,0.5)" }}>
                How to say it
              </p>
              <p className="flex-1 text-sm italic leading-relaxed" style={{ color: "rgba(52,211,153,0.85)" }}>
                &ldquo;{result.framing}&rdquo;
              </p>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(result.framing);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="flex items-center gap-2 rounded-lg border px-3 py-1.5 transition-all duration-200 self-start"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.68rem",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: copied ? "rgba(52,211,153,0.9)" : "rgba(240,237,230,0.3)",
                  borderColor: copied ? "rgba(52,211,153,0.3)" : "rgba(240,237,230,0.08)",
                  background: "transparent",
                }}
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copied ? "Copied!" : "Copy line"}
              </button>
            </div>
          </div>

          {/* Bottom row: upsell + red flag + invoice */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* Upsell */}
            <div
              className="rounded-2xl border p-5"
              style={{ background: "rgba(168,85,247,0.03)", borderColor: "rgba(168,85,247,0.15)" }}
            >
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(168,85,247,0.5)", marginBottom: "8px" }}>
                Upsell opportunity (+20%)
              </p>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(168,85,247,0.75)" }}>{result.upsell}</p>
            </div>

            {/* Charge more because */}
            <div
              className="rounded-2xl border p-5"
              style={{ background: "rgba(239,68,68,0.03)", borderColor: "rgba(239,68,68,0.15)" }}
            >
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(239,68,68,0.5)", marginBottom: "8px" }}>
                Charge more because
              </p>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(239,68,68,0.75)" }}>{result.red_flag}</p>
            </div>

            {/* Generate Invoice CTA */}
            <button
              onClick={() => setShowInvoice(true)}
              className="flex flex-col gap-4 rounded-2xl border p-5 text-left transition-all duration-200 hover:border-yellow-500/30"
              style={{ background: "rgba(234,179,8,0.04)", borderColor: "rgba(234,179,8,0.15)" }}
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.2)" }}
              >
                <FileText className="h-5 w-5" style={{ color: "rgba(234,179,8,0.8)" }} />
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", letterSpacing: "0.1em", color: "rgba(234,179,8,0.85)", marginBottom: "6px" }}>
                  Generate Invoice
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "rgba(240,237,230,0.3)", lineHeight: 1.6 }}>
                  GST-ready invoice for ₹{result.recommended.toLocaleString()} · print or save as PDF
                </div>
              </div>
            </button>

          </div>
        </div>
      )}
    </div>
  );
}
