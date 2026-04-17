"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: "⚡" },
  { href: "/leads",     label: "Lead Feed",  icon: "🎯" },
  { href: "/clients",   label: "Clients",    icon: "👥" },
  { href: "/pricing",   label: "Pricing",    icon: "💰" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#0a0a0a" }}>

      {/* Sidebar */}
      <aside style={{
        width: "220px", flexShrink: 0,
        backgroundColor: "#0f0f0f",
        borderRight: "1px solid #1e1e1e",
        display: "flex", flexDirection: "column",
        padding: "24px 12px",
        position: "fixed", top: 0, left: 0, bottom: 0,
      }}>
        {/* Logo */}
        <div style={{ paddingLeft: "12px", marginBottom: "32px" }}>
          <div style={{ fontSize: "20px", fontWeight: "700", color: "#fff", letterSpacing: "-0.3px" }}>
            👻 ghost
          </div>
          <div style={{ fontSize: "11px", color: "#444", marginTop: "2px" }}>AI Business Partner</div>
        </div>

        {/* Nav items */}
        <nav style={{ display: "flex", flexDirection: "column", gap: "2px", flex: 1 }}>
          {NAV.map(({ href, label, icon }) => {
            const active = path === href;
            return (
              <Link key={href} href={href} style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "10px 12px", borderRadius: "8px", textDecoration: "none",
                backgroundColor: active ? "rgba(124,58,237,0.15)" : "transparent",
                color: active ? "#a78bfa" : "#666",
                fontSize: "14px", fontWeight: active ? "600" : "400",
                transition: "all 0.15s",
              }}>
                <span style={{ fontSize: "16px" }}>{icon}</span>
                {label}
                {active && <div style={{ marginLeft: "auto", width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "#7c3aed" }} />}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{ paddingLeft: "12px", borderTop: "1px solid #1e1e1e", paddingTop: "16px" }}>
          <div style={{ fontSize: "11px", color: "#333" }}>Ghost POC · Hackathon Build</div>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ marginLeft: "220px", flex: 1, minHeight: "100vh" }}>
        {children}
      </main>
    </div>
  );
}
