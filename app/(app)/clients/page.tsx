"use client";

import { useState, useEffect, useCallback, useRef, MouseEvent } from "react";
import { toast } from "sonner";
import { apiFetch } from "../../lib/api";
import {
  Plus,
  Users,
  AlertTriangle,
  Copy,
  Check,
  MessageSquarePlus,
  X,
  ChevronRight,
} from "lucide-react";

// ---------- Types ----------
type Client = {
  id: string;
  name: string;
  company?: string;
  project_name: string;
  project_status: string;
  project_completion_pct: number;
  payment_status: string;
  total_value?: number;
  last_contact_date: string;
  notes?: string;
  health_score: number;
  health_status: "healthy" | "at_risk" | "critical";
  health_flags: string[];
  opportunities: string[];
  suggested_action: string;
};

// ---------- Ghost Card ----------
function GhostCard({
  children,
  criticalBorder,
}: {
  children: React.ReactNode;
  criticalBorder?: boolean;
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
      onMouseLeave={() => setSpot(s => ({ ...s, on: false }))}
      className="relative rounded-2xl border"
      style={{
        background: "#0c0c0c",
        borderColor: criticalBorder ? "rgba(239,68,68,0.25)" : "rgba(240,237,230,0.07)",
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
        style={{
          opacity: spot.on ? 1 : 0,
          background: `radial-gradient(400px circle at ${spot.x}% ${spot.y}%, rgba(168,85,247,0.09), transparent 65%)`,
        }}
      />
      {children}
    </div>
  );
}

// ---------- Health config ----------
const HEALTH = {
  healthy:  { label: "Healthy",  text: "rgba(52,211,153,0.9)",  bg: "rgba(52,211,153,0.08)",  border: "rgba(52,211,153,0.2)"  },
  at_risk:  { label: "At Risk",  text: "rgba(234,179,8,0.9)",   bg: "rgba(234,179,8,0.08)",   border: "rgba(234,179,8,0.2)"   },
  critical: { label: "Critical", text: "rgba(239,68,68,0.9)",   bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.2)"   },
};

// ---------- Client Card ----------
function ClientCard({
  client,
  onEdit,
  onOutreach,
}: {
  client: Client;
  onEdit: (c: Client) => void;
  onOutreach: (c: Client) => void;
}) {
  const h = HEALTH[client.health_status] ?? HEALTH.healthy;
  const daysSince = Math.floor((Date.now() - new Date(client.last_contact_date).getTime()) / 86400000);
  const needsOutreach = client.health_status === "at_risk" || client.health_status === "critical";

  return (
    <GhostCard criticalBorder={client.health_status === "critical"}>
      <div className="p-5 flex flex-col gap-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-sm font-medium" style={{ color: "#f0ede6" }}>{client.name}</span>
              {client.company && (
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "rgba(240,237,230,0.28)" }}>
                  {client.company}
                </span>
              )}
            </div>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", letterSpacing: "0.03em", color: "rgba(240,237,230,0.35)" }}>
              {client.project_name}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            <span
              className="rounded-full px-2.5 py-0.5"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.62rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: h.text,
                background: h.bg,
                border: `1px solid ${h.border}`,
              }}
            >
              {h.label}
            </span>
            {client.total_value && (
              <span
                style={{
                  fontFamily: "var(--font-impact-stack)",
                  fontSize: "1.3rem",
                  letterSpacing: "-0.02em",
                  color: "rgba(168,85,247,0.7)",
                  lineHeight: 1,
                }}
              >
                ₹{client.total_value.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Health bar */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "rgba(240,237,230,0.06)" }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${client.health_score}%`, background: h.text }}
            />
          </div>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", color: h.text, minWidth: "26px", textAlign: "right" }}>
            {client.health_score}
          </span>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-x-5 gap-y-1">
          <div>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(240,237,230,0.22)" }}>Completion </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "rgba(240,237,230,0.65)" }}>{client.project_completion_pct}%</span>
          </div>
          <div>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(240,237,230,0.22)" }}>Contact </span>
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: "0.72rem",
              color: daysSince > 14 ? "rgba(239,68,68,0.75)" : "rgba(240,237,230,0.65)",
            }}>
              {daysSince === 0 ? "Today" : `${daysSince}d ago`}
            </span>
          </div>
          <div>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(240,237,230,0.22)" }}>Payment </span>
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: "0.72rem",
              color: client.payment_status === "overdue" ? "rgba(239,68,68,0.75)" : client.payment_status === "at_risk" ? "rgba(234,179,8,0.75)" : "rgba(52,211,153,0.75)",
            }}>
              {client.payment_status === "current" ? "Paid" : client.payment_status === "overdue" ? "Overdue" : "At Risk"}
            </span>
          </div>
        </div>

        {/* Flags */}
        {client.health_flags.length > 0 && (
          <div className="space-y-1.5">
            {client.health_flags.map((flag, i) => (
              <div key={i} className="flex items-start gap-2">
                <AlertTriangle className="h-3 w-3 flex-shrink-0 mt-0.5" style={{ color: "rgba(239,68,68,0.6)" }} />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", letterSpacing: "0.02em", color: "rgba(239,68,68,0.75)" }}>{flag}</span>
              </div>
            ))}
          </div>
        )}

        {/* Opportunities */}
        {client.opportunities.length > 0 && (
          <div className="space-y-1.5">
            {client.opportunities.map((opp, i) => (
              <div key={i} className="flex items-start gap-2">
                <span style={{ color: "rgba(52,211,153,0.7)", fontSize: "11px", flexShrink: 0, lineHeight: "20px" }}>✦</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "rgba(52,211,153,0.75)" }}>{opp}</span>
              </div>
            ))}
          </div>
        )}

        {/* Ghost says */}
        <div
          className="rounded-xl border px-3 py-2.5"
          style={{ background: "rgba(168,85,247,0.04)", borderColor: "rgba(168,85,247,0.1)" }}
        >
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(168,85,247,0.45)", marginBottom: "3px" }}>
            Ghost says
          </p>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "rgba(240,237,230,0.45)", lineHeight: 1.5 }}>
            {client.suggested_action}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-0.5">
          <button
            onClick={() => onEdit(client)}
            className="rounded-xl border px-4 py-2.5 transition-all duration-200 hover:border-[rgba(240,237,230,0.15)] hover:bg-[rgba(240,237,230,0.03)]"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.72rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "rgba(240,237,230,0.35)",
              borderColor: "rgba(240,237,230,0.08)",
              background: "transparent",
            }}
          >
            Edit
          </button>
          <button
            onClick={() => onOutreach(client)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 transition-all duration-200"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.72rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: needsOutreach ? (client.health_status === "critical" ? "rgba(239,68,68,0.9)" : "rgba(234,179,8,0.9)") : "rgba(240,237,230,0.35)",
              background: needsOutreach ? (client.health_status === "critical" ? "rgba(239,68,68,0.08)" : "rgba(234,179,8,0.07)") : "transparent",
              borderColor: needsOutreach ? (client.health_status === "critical" ? "rgba(239,68,68,0.2)" : "rgba(234,179,8,0.2)") : "rgba(240,237,230,0.08)",
            }}
          >
            <MessageSquarePlus className="h-3.5 w-3.5" />
            Re-engage
          </button>
        </div>
      </div>
    </GhostCard>
  );
}

// ---------- Client Form Modal ----------
type FormData = {
  name: string; company: string; project_name: string; project_status: string;
  project_completion_pct: string; payment_status: string; total_value: string;
  last_contact_date: string; notes: string;
};

const EMPTY_FORM: FormData = {
  name: "", company: "", project_name: "", project_status: "active",
  project_completion_pct: "0", payment_status: "current",
  total_value: "", last_contact_date: new Date().toISOString().split("T")[0], notes: "",
};

function ClientFormModal({
  onClose, onSave, initialData, clientId, title, submitLabel,
}: {
  onClose: () => void; onSave: () => void; initialData?: FormData;
  clientId?: string; title: string; submitLabel: string;
}) {
  const [form, setForm] = useState<FormData>(initialData || EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const isEdit = !!clientId;
  const set = (k: keyof FormData, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name || !form.project_name || !form.last_contact_date) {
      setError("Name, project name, and last contact date are required.");
      return;
    }
    setSaving(true); setError("");
    try {
      const payload: Record<string, unknown> = {
        name: form.name, project_name: form.project_name,
        project_status: form.project_status,
        project_completion_pct: parseInt(form.project_completion_pct) || 0,
        payment_status: form.payment_status, last_contact_date: form.last_contact_date,
      };
      if (form.company) payload.company = form.company;
      if (form.total_value) payload.total_value = parseInt(form.total_value);
      if (form.notes) payload.notes = form.notes;

      const res = await apiFetch(isEdit ? `/clients/${clientId}` : "/clients/", {
        method: isEdit ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      toast.success(isEdit ? `${form.name} updated` : `${form.name} added`);
      onSave(); onClose();
    } catch { setError("Failed to save."); }
    finally { setSaving(false); }
  };

  const inp: React.CSSProperties = {
    width: "100%", background: "#111",
    border: "1px solid rgba(240,237,230,0.1)",
    borderRadius: "10px", padding: "10px 14px",
    color: "#f0ede6", fontSize: "14px", outline: "none",
    boxSizing: "border-box", fontFamily: "inherit",
  };
  const lbl: React.CSSProperties = {
    fontFamily: "var(--font-mono)", fontSize: "0.65rem",
    letterSpacing: "0.25em", textTransform: "uppercase",
    color: "rgba(240,237,230,0.3)", marginBottom: "6px", display: "block",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-5"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[480px] max-h-[90vh] overflow-y-auto rounded-2xl border p-7 space-y-5"
        style={{ background: "#0c0c0c", borderColor: "rgba(240,237,230,0.09)" }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 style={{ fontFamily: "var(--font-disp)", fontSize: "1.8rem", fontWeight: 300, fontStyle: "italic", color: "#f0ede6", margin: 0 }}>{title}</h2>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", letterSpacing: "0.1em", color: "rgba(240,237,230,0.22)", marginTop: "4px" }}>
              Ghost will monitor their health and alert you.
            </p>
          </div>
          <button onClick={onClose} style={{ color: "rgba(240,237,230,0.3)", background: "none", border: "none", cursor: "pointer", padding: "4px", flexShrink: 0 }}>
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2"><label style={lbl}>Client Name *</label><input style={inp} value={form.name} onChange={e => set("name", e.target.value)} placeholder="Alex Johnson" /></div>
          <div><label style={lbl}>Company</label><input style={inp} value={form.company} onChange={e => set("company", e.target.value)} placeholder="Acme Inc" /></div>
          <div><label style={lbl}>Project Value (₹)</label><input style={inp} type="number" value={form.total_value} onChange={e => set("total_value", e.target.value)} placeholder="150000" /></div>
          <div className="col-span-2"><label style={lbl}>Project Name *</label><input style={inp} value={form.project_name} onChange={e => set("project_name", e.target.value)} placeholder="E-commerce redesign" /></div>
          <div>
            <label style={lbl}>Project Status</label>
            <select style={inp} value={form.project_status} onChange={e => set("project_status", e.target.value)}>
              <option value="active">Active</option>
              <option value="stalled">Stalled</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div><label style={lbl}>Completion %</label><input style={inp} type="number" min="0" max="100" value={form.project_completion_pct} onChange={e => set("project_completion_pct", e.target.value)} /></div>
          <div>
            <label style={lbl}>Payment Status</label>
            <select style={inp} value={form.payment_status} onChange={e => set("payment_status", e.target.value)}>
              <option value="current">Current</option>
              <option value="overdue">Overdue</option>
              <option value="at_risk">At Risk</option>
            </select>
          </div>
          <div><label style={lbl}>Last Contact Date *</label><input style={inp} type="date" value={form.last_contact_date} onChange={e => set("last_contact_date", e.target.value)} /></div>
          <div className="col-span-2">
            <label style={lbl}>Notes</label>
            <textarea style={{ ...inp, resize: "vertical", minHeight: "72px" }} value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Context, communication style, important details..." />
          </div>
        </div>

        {error && <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "rgba(239,68,68,0.8)" }}>{error}</p>}

        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border py-3 transition-all duration-200 hover:border-[rgba(240,237,230,0.15)]"
            style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(240,237,230,0.35)", borderColor: "rgba(240,237,230,0.08)", background: "transparent" }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 rounded-xl py-3 transition-all duration-200 hover:opacity-90 disabled:opacity-50"
            style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#090909", background: "#f0ede6", border: "none" }}
          >
            {saving ? "Saving..." : submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- Outreach Panel (custom slide-in) ----------
function OutreachPanel({
  client,
  onClose,
}: {
  client: Client | null;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<{ subject: string; content: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!client) return;
    setDraft(null);
    setError(false);
    setLoading(true);
    apiFetch(`/clients/${client.id}/outreach`, { method: "POST" })
      .then(r => r.json())
      .then(d => {
        if (d?.subject || d?.content) setDraft(d);
        else setError(true);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [client]);

  const handleCopy = () => {
    if (!draft) return;
    navigator.clipboard.writeText(`Subject: ${draft.subject}\n\n${draft.content}`);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  if (!client) return null;
  const h = HEALTH[client.health_status] ?? HEALTH.healthy;

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
                Re-engage {client.name}
              </h2>
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.7rem",
                  letterSpacing: "0.1em",
                  color: "rgba(240,237,230,0.3)",
                  marginTop: "4px",
                }}
              >
                {client.project_name}
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
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Why Ghost flagged this */}
          <div
            className="rounded-xl border p-4"
            style={{ background: "#111", borderColor: "rgba(240,237,230,0.07)" }}
          >
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(240,237,230,0.22)", marginBottom: "10px" }}>
              Why Ghost flagged this
            </p>
            <div className="space-y-2">
              {client.health_flags.length > 0
                ? client.health_flags.map((flag, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" style={{ color: h.text }} />
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "rgba(240,237,230,0.55)" }}>{flag}</span>
                    </div>
                  ))
                : <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "rgba(240,237,230,0.3)" }}>Routine check-in recommended.</span>
              }
              {client.suggested_action && (
                <div className="pt-3 mt-1" style={{ borderTop: "1px solid rgba(240,237,230,0.06)" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(168,85,247,0.45)" }}>Ghost recommends: </span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "rgba(168,85,247,0.65)" }}>{client.suggested_action}</span>
                </div>
              )}
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-14 gap-4">
              <div
                className="h-9 w-9 rounded-full border-2 animate-spin"
                style={{ borderColor: "rgba(168,85,247,0.2)", borderTopColor: "rgba(168,85,247,0.8)" }}
              />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(240,237,230,0.25)" }}>
                Ghost is writing...
              </span>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-14 gap-3">
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "rgba(239,68,68,0.6)", textAlign: "center" }}>
                Failed to generate message. Check that the backend is running.
              </p>
            </div>
          )}

          {/* Draft */}
          {!loading && !error && draft && (
            <div className="space-y-4">
              <div
                className="rounded-xl border p-4"
                style={{ background: "#111", borderColor: "rgba(240,237,230,0.07)" }}
              >
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(240,237,230,0.25)", marginBottom: "6px" }}>Subject</p>
                <p style={{ color: "#f0ede6", fontSize: "14px", fontWeight: 500, lineHeight: 1.4 }}>{draft.subject}</p>
              </div>
              <div
                className="rounded-xl border p-4"
                style={{ background: "#111", borderColor: "rgba(240,237,230,0.07)" }}
              >
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
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ---------- Main ----------
export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [outreachClient, setOutreachClient] = useState<Client | null>(null);

  const fetchClients = useCallback(async () => {
    try {
      const res = await apiFetch("/clients/");
      const data = await res.json();
      setClients(Array.isArray(data) ? data : []);
    } catch { setClients([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  const critical = clients.filter(c => c.health_status === "critical");
  const at_risk  = clients.filter(c => c.health_status === "at_risk");
  const healthy  = clients.filter(c => c.health_status === "healthy");

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
            Client Health
          </h1>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.72rem",
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: "rgba(240,237,230,0.28)",
            }}
          >
            Ghost monitors every relationship and flags churn risks early
          </span>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 mt-1">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 rounded-xl px-5 py-2.5 transition-all duration-200 hover:opacity-90"
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
            <Plus className="h-3.5 w-3.5" />
            Add Client
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      {clients.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {[
            { label: "Total",      value: clients.length,   color: "#f0ede6"               },
            { label: "Critical",   value: critical.length,  color: "rgba(239,68,68,0.9)"   },
            { label: "At Risk",    value: at_risk.length,   color: "rgba(234,179,8,0.9)"   },
            { label: "Healthy",    value: healthy.length,   color: "rgba(52,211,153,0.9)"  },
            { label: "Avg Health", value: clients.length ? Math.round(clients.reduce((a, c) => a + c.health_score, 0) / clients.length) : 0, color: "rgba(168,85,247,0.9)" },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="rounded-2xl border p-4"
              style={{ background: "#0c0c0c", borderColor: "rgba(240,237,230,0.07)" }}
            >
              <div style={{ fontFamily: "var(--font-impact-stack)", fontSize: "2.2rem", letterSpacing: "-0.02em", color, lineHeight: 1, marginBottom: "6px" }}>
                {value}
              </div>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(240,237,230,0.22)" }}>
                {label}
              </span>
            </div>
          ))}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-20">
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(240,237,230,0.2)" }} className="animate-pulse">
            Loading clients...
          </span>
        </div>
      )}

      {!loading && clients.length === 0 && (
        <div
          className="flex flex-col items-center justify-center rounded-2xl border py-20 text-center"
          style={{ background: "#0c0c0c", borderColor: "rgba(240,237,230,0.07)", borderStyle: "dashed" }}
        >
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.18)" }}>
            <Users className="h-8 w-8" style={{ color: "rgba(52,211,153,0.6)" }} />
          </div>
          <h3 className="mb-2" style={{ fontFamily: "var(--font-disp)", fontSize: "2.2rem", fontWeight: 300, fontStyle: "italic", color: "#f0ede6" }}>
            No clients yet
          </h3>
          <p className="mb-8 max-w-sm" style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", letterSpacing: "0.05em", color: "rgba(240,237,230,0.3)", lineHeight: 1.7 }}>
            Add your first client and Ghost will start monitoring the relationship health.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 rounded-xl px-6 py-3 transition-all duration-200 hover:opacity-90"
            style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#090909", background: "#f0ede6", border: "none" }}
          >
            <Plus className="h-3.5 w-3.5" />
            Add First Client
          </button>
        </div>
      )}

      {!loading && clients.length > 0 && (
        <div className="space-y-10">
          {[
            { label: "Critical", items: critical, color: "rgba(239,68,68,0.6)"  },
            { label: "At Risk",  items: at_risk,  color: "rgba(234,179,8,0.6)"  },
            { label: "Healthy",  items: healthy,  color: "rgba(52,211,153,0.6)" },
          ].filter(({ items }) => items.length > 0).map(({ label, items, color }) => (
            <div key={label}>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px flex-1" style={{ background: "rgba(240,237,230,0.05)" }} />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", letterSpacing: "0.3em", textTransform: "uppercase", color }}>
                  {label} · {items.length}
                </span>
                <div className="h-px flex-1" style={{ background: "rgba(240,237,230,0.05)" }} />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {items.map(client => (
                  <ClientCard
                    key={client.id}
                    client={client}
                    onEdit={setEditingClient}
                    onOutreach={setOutreachClient}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showAddModal && (
        <ClientFormModal onClose={() => setShowAddModal(false)} onSave={fetchClients} title="Add Client" submitLabel="Add Client" />
      )}
      {editingClient && (
        <ClientFormModal
          onClose={() => setEditingClient(null)}
          onSave={fetchClients}
          clientId={editingClient.id}
          title={`Edit — ${editingClient.name}`}
          submitLabel="Save Changes"
          initialData={{
            name: editingClient.name,
            company: editingClient.company || "",
            project_name: editingClient.project_name,
            project_status: editingClient.project_status,
            project_completion_pct: String(editingClient.project_completion_pct),
            payment_status: editingClient.payment_status,
            total_value: editingClient.total_value ? String(editingClient.total_value) : "",
            last_contact_date: editingClient.last_contact_date,
            notes: editingClient.notes || "",
          }}
        />
      )}

      {/* Outreach panel */}
      <OutreachPanel client={outreachClient} onClose={() => setOutreachClient(null)} />
    </div>
  );
}
