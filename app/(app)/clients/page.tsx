"use client";

import { useState, useEffect, useCallback } from "react";

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

const HEALTH_COLORS = {
  healthy:  { bg: "rgba(34,197,94,0.1)",   border: "rgba(34,197,94,0.25)",   text: "#22c55e",  label: "Healthy" },
  at_risk:  { bg: "rgba(234,179,8,0.1)",   border: "rgba(234,179,8,0.25)",   text: "#facc15",  label: "At Risk" },
  critical: { bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.25)",   text: "#f87171",  label: "Critical" },
};

const PAYMENT_LABELS: Record<string, { text: string; color: string }> = {
  current:  { text: "Paid",     color: "#22c55e" },
  overdue:  { text: "Overdue",  color: "#f87171" },
  at_risk:  { text: "At Risk",  color: "#facc15" },
};

function HealthBar({ score, status }: { score: number; status: string }) {
  const colors = HEALTH_COLORS[status as keyof typeof HEALTH_COLORS] || HEALTH_COLORS.healthy;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <div style={{ flex: 1, height: "6px", backgroundColor: "#1e1e1e", borderRadius: "3px", overflow: "hidden" }}>
        <div style={{
          width: `${score}%`, height: "100%", borderRadius: "3px",
          backgroundColor: colors.text,
          transition: "width 0.5s ease",
        }} />
      </div>
      <span style={{ fontSize: "13px", fontWeight: "700", color: colors.text, minWidth: "32px" }}>{score}</span>
    </div>
  );
}

function ClientCard({ client, onEdit }: { client: Client; onEdit: (c: Client) => void }) {
  const health = HEALTH_COLORS[client.health_status] || HEALTH_COLORS.healthy;
  const payment = PAYMENT_LABELS[client.payment_status] || PAYMENT_LABELS.current;
  const [expanded, setExpanded] = useState(false);

  const daysSince = () => {
    const d = new Date(client.last_contact_date);
    const diff = Math.floor((Date.now() - d.getTime()) / 86400000);
    return diff;
  };

  return (
    <div style={{
      backgroundColor: "#111", border: `1px solid ${client.health_status === "critical" ? "rgba(239,68,68,0.3)" : "#1e1e1e"}`,
      borderRadius: "12px", padding: "20px", display: "flex", flexDirection: "column", gap: "14px",
      transition: "border-color 0.15s",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "15px", fontWeight: "600", color: "#e5e5e5" }}>{client.name}</span>
            {client.company && (
              <span style={{ fontSize: "12px", color: "#555" }}>· {client.company}</span>
            )}
            <span style={{
              fontSize: "11px", padding: "2px 8px", borderRadius: "20px",
              backgroundColor: health.bg, border: `1px solid ${health.border}`, color: health.text,
              fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.4px",
            }}>
              {health.label}
            </span>
          </div>
          <p style={{ fontSize: "13px", color: "#666", margin: 0 }}>{client.project_name}</p>
        </div>
        {client.total_value && (
          <div style={{ fontSize: "14px", fontWeight: "700", color: "#a78bfa", flexShrink: 0 }}>
            ₹{client.total_value.toLocaleString()}
          </div>
        )}
      </div>

      {/* Health bar */}
      <HealthBar score={client.health_score} status={client.health_status} />

      {/* Stats row */}
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <div style={{ fontSize: "12px", color: "#555" }}>
          <span style={{ color: "#888" }}>Completion:</span>{" "}
          <span style={{ color: "#ccc", fontWeight: "600" }}>{client.project_completion_pct}%</span>
        </div>
        <div style={{ fontSize: "12px", color: "#555" }}>
          <span style={{ color: "#888" }}>Payment:</span>{" "}
          <span style={{ color: payment.color, fontWeight: "600" }}>{payment.text}</span>
        </div>
        <div style={{ fontSize: "12px", color: "#555" }}>
          <span style={{ color: "#888" }}>Last contact:</span>{" "}
          <span style={{ color: daysSince() > 7 ? "#f87171" : "#ccc", fontWeight: "600" }}>
            {daysSince() === 0 ? "Today" : `${daysSince()}d ago`}
          </span>
        </div>
      </div>

      {/* Flags */}
      {client.health_flags.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {client.health_flags.map((flag, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
              <span style={{ color: "#f87171", fontSize: "12px", flexShrink: 0, marginTop: "1px" }}>⚠</span>
              <span style={{ fontSize: "12px", color: "#f87171" }}>{flag}</span>
            </div>
          ))}
        </div>
      )}

      {/* Opportunities */}
      {client.opportunities.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {client.opportunities.map((opp, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
              <span style={{ color: "#22c55e", fontSize: "12px", flexShrink: 0, marginTop: "1px" }}>✦</span>
              <span style={{ fontSize: "12px", color: "#22c55e" }}>{opp}</span>
            </div>
          ))}
        </div>
      )}

      {/* Suggested action */}
      <div style={{ backgroundColor: "#0f0f0f", borderRadius: "8px", padding: "10px 12px", border: "1px solid #1a1a1a" }}>
        <div style={{ fontSize: "11px", color: "#444", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "3px" }}>Ghost says</div>
        <p style={{ fontSize: "13px", color: "#888", margin: 0 }}>{client.suggested_action}</p>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "8px" }}>
        <button
          onClick={() => onEdit(client)}
          style={{ flex: 1, padding: "9px 0", borderRadius: "8px", border: "1px solid #2a2a2a", backgroundColor: "transparent", color: "#888", fontSize: "13px", cursor: "pointer" }}
        >
          Edit
        </button>
        <button
          onClick={() => setExpanded(!expanded)}
          style={{ flex: 1, padding: "9px 0", borderRadius: "8px", border: "none", backgroundColor: "#7c3aed", color: "#fff", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}
        >
          {expanded ? "Hide Notes" : "View Notes"}
        </button>
      </div>

      {expanded && client.notes && (
        <div style={{ borderTop: "1px solid #1e1e1e", paddingTop: "12px" }}>
          <p style={{ fontSize: "13px", color: "#666", margin: 0, lineHeight: "1.6" }}>{client.notes}</p>
        </div>
      )}
    </div>
  );
}

type FormData = {
  name: string;
  company: string;
  project_name: string;
  project_status: string;
  project_completion_pct: string;
  payment_status: string;
  total_value: string;
  last_contact_date: string;
  notes: string;
};

const EMPTY_FORM: FormData = {
  name: "", company: "", project_name: "", project_status: "active",
  project_completion_pct: "0", payment_status: "current",
  total_value: "", last_contact_date: new Date().toISOString().split("T")[0], notes: "",
};

function AddClientModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k: keyof FormData, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name || !form.project_name || !form.last_contact_date) {
      setError("Name, project name, and last contact date are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload: Record<string, unknown> = {
        name: form.name,
        project_name: form.project_name,
        project_status: form.project_status,
        project_completion_pct: parseInt(form.project_completion_pct) || 0,
        payment_status: form.payment_status,
        last_contact_date: form.last_contact_date,
      };
      if (form.company) payload.company = form.company;
      if (form.total_value) payload.total_value = parseInt(form.total_value);
      if (form.notes) payload.notes = form.notes;

      const res = await fetch("http://localhost:8000/clients/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to save client");
      onSave();
      onClose();
    } catch {
      setError("Failed to save. Is the backend running?");
    } finally {
      setSaving(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", backgroundColor: "#0f0f0f", border: "1px solid #2a2a2a",
    borderRadius: "8px", padding: "10px 12px", color: "#e5e5e5", fontSize: "14px",
    outline: "none", boxSizing: "border-box",
  };
  const labelStyle: React.CSSProperties = {
    fontSize: "12px", color: "#555", fontWeight: "600",
    textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: "6px", display: "block",
  };

  return (
    <div style={{
      position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.8)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px",
    }}>
      <div style={{
        backgroundColor: "#111", border: "1px solid #2a2a2a", borderRadius: "16px",
        padding: "32px", width: "100%", maxWidth: "480px", maxHeight: "90vh", overflowY: "auto",
        display: "flex", flexDirection: "column", gap: "20px",
      }}>
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#fff", margin: "0 0 4px" }}>Add Client</h2>
          <p style={{ fontSize: "13px", color: "#555", margin: 0 }}>Ghost will monitor their health and alert you.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Client Name *</label>
            <input style={inputStyle} value={form.name} onChange={e => set("name", e.target.value)} placeholder="Alex Johnson" />
          </div>
          <div>
            <label style={labelStyle}>Company</label>
            <input style={inputStyle} value={form.company} onChange={e => set("company", e.target.value)} placeholder="Acme Inc" />
          </div>
          <div>
            <label style={labelStyle}>Project Value (₹)</label>
            <input style={inputStyle} type="number" value={form.total_value} onChange={e => set("total_value", e.target.value)} placeholder="150000" />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Project Name *</label>
            <input style={inputStyle} value={form.project_name} onChange={e => set("project_name", e.target.value)} placeholder="E-commerce redesign" />
          </div>
          <div>
            <label style={labelStyle}>Project Status</label>
            <select style={inputStyle} value={form.project_status} onChange={e => set("project_status", e.target.value)}>
              <option value="active">Active</option>
              <option value="stalled">Stalled</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Completion %</label>
            <input style={inputStyle} type="number" min="0" max="100" value={form.project_completion_pct} onChange={e => set("project_completion_pct", e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Payment Status</label>
            <select style={inputStyle} value={form.payment_status} onChange={e => set("payment_status", e.target.value)}>
              <option value="current">Current</option>
              <option value="overdue">Overdue</option>
              <option value="at_risk">At Risk</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Last Contact Date *</label>
            <input style={inputStyle} type="date" value={form.last_contact_date} onChange={e => set("last_contact_date", e.target.value)} />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Notes</label>
            <textarea
              style={{ ...inputStyle, resize: "vertical", minHeight: "72px" }}
              value={form.notes}
              onChange={e => set("notes", e.target.value)}
              placeholder="Project context, communication style, important details..."
            />
          </div>
        </div>

        {error && <p style={{ fontSize: "13px", color: "#f87171", margin: 0 }}>{error}</p>}

        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={onClose} style={{ flex: 1, padding: "12px", borderRadius: "8px", border: "1px solid #2a2a2a", backgroundColor: "transparent", color: "#888", fontSize: "14px", cursor: "pointer" }}>
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={saving} style={{ flex: 1, padding: "12px", borderRadius: "8px", border: "none", backgroundColor: "#7c3aed", color: "#fff", fontSize: "14px", fontWeight: "600", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}>
            {saving ? "Saving..." : "Add Client"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const fetchClients = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:8000/clients/");
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
    <div style={{ padding: "40px 48px", maxWidth: "1100px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "26px", fontWeight: "700", color: "#fff", margin: 0 }}>Client Health</h1>
          <p style={{ color: "#555", fontSize: "14px", marginTop: "6px" }}>
            Ghost monitors every client relationship and flags churn risks early.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{ padding: "11px 22px", borderRadius: "8px", border: "none", backgroundColor: "#7c3aed", color: "#fff", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}
        >
          + Add Client
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "32px" }}>
        {[
          { label: "Total Clients", value: clients.length, color: "#fff" },
          { label: "Critical",      value: critical.length, color: "#f87171" },
          { label: "At Risk",       value: at_risk.length,  color: "#facc15" },
          { label: "Healthy",       value: healthy.length,  color: "#22c55e" },
          { label: "Avg Health",    value: clients.length ? Math.round(clients.reduce((a, c) => a + c.health_score, 0) / clients.length) : 0, color: "#a78bfa" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ flex: 1, backgroundColor: "#111", border: "1px solid #1e1e1e", borderRadius: "10px", padding: "16px 20px" }}>
            <div style={{ fontSize: "22px", fontWeight: "700", color }}>{value}</div>
            <div style={{ fontSize: "12px", color: "#555", marginTop: "2px" }}>{label}</div>
          </div>
        ))}
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: "80px 0", color: "#444" }}>Loading clients...</div>
      )}

      {!loading && clients.length === 0 && (
        <div style={{ textAlign: "center", padding: "80px 0", backgroundColor: "#111", border: "1px dashed #2a2a2a", borderRadius: "12px" }}>
          <div style={{ fontSize: "40px", marginBottom: "16px" }}>👥</div>
          <h3 style={{ color: "#fff", fontSize: "18px", fontWeight: "600", marginBottom: "8px" }}>No clients yet</h3>
          <p style={{ color: "#555", fontSize: "14px", marginBottom: "24px" }}>Add your first client and Ghost will start monitoring the relationship health.</p>
          <button onClick={() => setShowModal(true)} style={{ padding: "12px 28px", borderRadius: "8px", border: "none", backgroundColor: "#7c3aed", color: "#fff", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}>
            + Add First Client
          </button>
        </div>
      )}

      {!loading && clients.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          {[
            { label: "🔴 Critical", items: critical },
            { label: "🟡 At Risk",  items: at_risk },
            { label: "🟢 Healthy",  items: healthy },
          ].filter(({ items }) => items.length > 0).map(({ label, items }) => (
            <div key={label}>
              <h2 style={{ fontSize: "13px", fontWeight: "600", color: "#555", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "14px" }}>
                {label} · {items.length}
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "16px" }}>
                {items.map(client => (
                  <ClientCard key={client.id} client={client} onEdit={setEditingClient} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <AddClientModal onClose={() => setShowModal(false)} onSave={fetchClients} />
      )}

      {/* TODO: Edit modal — for now just re-open add */}
      {editingClient && (
        <div style={{
          position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.8)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
        }} onClick={() => setEditingClient(null)}>
          <div style={{ backgroundColor: "#111", border: "1px solid #2a2a2a", borderRadius: "16px", padding: "32px", maxWidth: "400px", width: "100%", textAlign: "center" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>✏️</div>
            <h3 style={{ color: "#fff", fontSize: "16px", fontWeight: "600", marginBottom: "8px" }}>Edit Client</h3>
            <p style={{ color: "#555", fontSize: "13px", marginBottom: "20px" }}>Quick edit: update via the API directly, or close and re-add.</p>
            <button onClick={() => setEditingClient(null)} style={{ padding: "10px 24px", borderRadius: "8px", border: "none", backgroundColor: "#7c3aed", color: "#fff", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
