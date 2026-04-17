"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

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

const PRIORITY_CONFIG = {
  URGENT:    { color: "#f87171", bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.2)",   dot: "#f87171" },
  TODAY:     { color: "#facc15", bg: "rgba(234,179,8,0.08)",   border: "rgba(234,179,8,0.2)",   dot: "#facc15" },
  THIS_WEEK: { color: "#9ca3af", bg: "rgba(107,114,128,0.08)", border: "rgba(107,114,128,0.2)", dot: "#6b7280" },
};

export default function DashboardPage() {
  const [brief, setBrief] = useState<BriefItem[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [briefRes, leadsRes, clientsRes] = await Promise.all([
        fetch("http://localhost:8000/brief/daily"),
        fetch("http://localhost:8000/leads/"),
        fetch("http://localhost:8000/clients/"),
      ]);
      const [briefData, leadsData, clientsData] = await Promise.all([
        briefRes.json(),
        leadsRes.json(),
        clientsRes.json(),
      ]);

      setBrief(Array.isArray(briefData) ? briefData : []);

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

  const handleRefresh = () => {
    setRefreshing(true);
    setBrief([]);
    // Force a fresh brief by fetching — today's cache will still serve, so this just re-renders
    fetchData();
  };

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div style={{ padding: "40px 48px", maxWidth: "1100px" }}>
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: "26px", fontWeight: "700", color: "#fff", margin: "0 0 4px" }}>
              {greeting}. Here's your brief.
            </h1>
            <p style={{ color: "#555", fontSize: "14px", margin: 0 }}>
              {now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            style={{
              padding: "9px 18px", borderRadius: "8px", border: "1px solid #2a2a2a",
              backgroundColor: "transparent", color: "#666", fontSize: "13px",
              cursor: refreshing ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", gap: "6px",
            }}
          >
            <span style={{ display: "inline-block", animation: refreshing ? "spin 1s linear infinite" : "none" }}>⟳</span>
            Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "12px", marginBottom: "32px" }}>
          {[
            { label: "Total Leads",       value: stats.total_leads,      color: "#fff",     href: "/leads" },
            { label: "New Leads",          value: stats.new_leads,        color: "#a78bfa",  href: "/leads" },
            { label: "High Urgency",       value: stats.high_urgency,     color: "#f87171",  href: "/leads" },
            { label: "Avg Intent Score",   value: stats.avg_score,        color: "#facc15",  href: "/leads" },
            { label: "Clients",            value: stats.total_clients,    color: "#fff",     href: "/clients" },
            { label: "Needs Attention",    value: stats.critical_clients + stats.at_risk_clients, color: "#f87171", href: "/clients" },
          ].map(({ label, value, color, href }) => (
            <Link key={label} href={href} style={{ textDecoration: "none" }}>
              <div style={{
                backgroundColor: "#111", border: "1px solid #1e1e1e", borderRadius: "10px",
                padding: "14px 16px", cursor: "pointer", transition: "border-color 0.15s",
              }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "#2a2a2a")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "#1e1e1e")}
              >
                <div style={{ fontSize: "22px", fontWeight: "700", color }}>{value}</div>
                <div style={{ fontSize: "11px", color: "#555", marginTop: "2px" }}>{label}</div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Brief */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
          <h2 style={{ fontSize: "13px", fontWeight: "600", color: "#555", textTransform: "uppercase", letterSpacing: "0.8px", margin: 0 }}>
            Ghost's Action Plan
          </h2>
          <div style={{ fontSize: "11px", color: "#333", backgroundColor: "#1a1a1a", padding: "2px 8px", borderRadius: "20px", border: "1px solid #222" }}>
            Today
          </div>
        </div>

        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} style={{ backgroundColor: "#111", border: "1px solid #1e1e1e", borderRadius: "10px", padding: "18px", height: "70px", opacity: 0.5 }} />
            ))}
          </div>
        )}

        {!loading && brief.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0", backgroundColor: "#111", border: "1px dashed #2a2a2a", borderRadius: "12px" }}>
            <div style={{ fontSize: "36px", marginBottom: "12px" }}>⚡</div>
            <h3 style={{ color: "#fff", fontSize: "16px", fontWeight: "600", marginBottom: "8px" }}>No brief yet</h3>
            <p style={{ color: "#555", fontSize: "13px", marginBottom: "20px" }}>
              Add clients and scan for leads to generate your first daily brief.
            </p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <Link href="/leads" style={{ padding: "10px 20px", borderRadius: "8px", border: "none", backgroundColor: "#7c3aed", color: "#fff", fontSize: "13px", fontWeight: "600", textDecoration: "none" }}>
                Scan for Leads
              </Link>
              <Link href="/clients" style={{ padding: "10px 20px", borderRadius: "8px", border: "1px solid #2a2a2a", color: "#888", fontSize: "13px", textDecoration: "none" }}>
                Add Client
              </Link>
            </div>
          </div>
        )}

        {!loading && brief.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {brief.map((item, i) => {
              const config = PRIORITY_CONFIG[item.priority] || PRIORITY_CONFIG.THIS_WEEK;
              return (
                <div key={i} style={{
                  backgroundColor: config.bg, border: `1px solid ${config.border}`,
                  borderRadius: "10px", padding: "16px 20px",
                  display: "flex", alignItems: "flex-start", gap: "14px",
                }}>
                  <div style={{ flexShrink: 0, marginTop: "2px" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: config.dot }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <span style={{ fontSize: "10px", fontWeight: "700", color: config.color, textTransform: "uppercase", letterSpacing: "0.6px" }}>
                        {item.priority.replace("_", " ")}
                      </span>
                    </div>
                    <p style={{ fontSize: "14px", color: "#e5e5e5", fontWeight: "500", margin: "0 0 4px", lineHeight: "1.4" }}>{item.action}</p>
                    <p style={{ fontSize: "12px", color: "#666", margin: 0 }}>{item.reason}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div style={{ marginTop: "32px", display: "flex", gap: "12px" }}>
        <Link href="/leads" style={{ textDecoration: "none" }}>
          <div style={{ backgroundColor: "#111", border: "1px solid #1e1e1e", borderRadius: "10px", padding: "16px 20px", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = "#2a2a2a")}
            onMouseLeave={e => (e.currentTarget.style.borderColor = "#1e1e1e")}
          >
            <span style={{ fontSize: "18px" }}>🎯</span>
            <div>
              <div style={{ fontSize: "13px", fontWeight: "600", color: "#e5e5e5" }}>Lead Feed</div>
              <div style={{ fontSize: "11px", color: "#555" }}>Scan Reddit for opportunities</div>
            </div>
          </div>
        </Link>
        <Link href="/clients" style={{ textDecoration: "none" }}>
          <div style={{ backgroundColor: "#111", border: "1px solid #1e1e1e", borderRadius: "10px", padding: "16px 20px", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = "#2a2a2a")}
            onMouseLeave={e => (e.currentTarget.style.borderColor = "#1e1e1e")}
          >
            <span style={{ fontSize: "18px" }}>👥</span>
            <div>
              <div style={{ fontSize: "13px", fontWeight: "600", color: "#e5e5e5" }}>Client Health</div>
              <div style={{ fontSize: "11px", color: "#555" }}>Monitor relationships</div>
            </div>
          </div>
        </Link>
        <Link href="/pricing" style={{ textDecoration: "none" }}>
          <div style={{ backgroundColor: "#111", border: "1px solid #1e1e1e", borderRadius: "10px", padding: "16px 20px", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = "#2a2a2a")}
            onMouseLeave={e => (e.currentTarget.style.borderColor = "#1e1e1e")}
          >
            <span style={{ fontSize: "18px" }}>💰</span>
            <div>
              <div style={{ fontSize: "13px", fontWeight: "600", color: "#e5e5e5" }}>Price a Project</div>
              <div style={{ fontSize: "11px", color: "#555" }}>AI-powered rate calculator</div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
