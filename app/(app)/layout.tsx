"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import {
  Ghost,
  LogOut,
  Settings,
  LayoutDashboard,
  Crosshair,
  Users,
  DollarSign,
} from "lucide-react";


const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leads",     label: "Lead Feed",  icon: Crosshair       },
  { href: "/clients",   label: "Clients",    icon: Users           },
  { href: "/pricing",   label: "Pricing",    icon: DollarSign      },
  { href: "/profile",   label: "Profile",    icon: Settings        },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    document.documentElement.style.fontSize = "68.75%";
    return () => { document.documentElement.style.fontSize = ""; };
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.replace("/auth");
      else setChecking(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) router.replace("/auth");
    });
    return () => subscription.unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-[#090909] flex items-center justify-center">
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "1.1rem",
            letterSpacing: "0.35em",
            color: "rgba(240,237,230,0.35)",
            textTransform: "uppercase",
          }}
          className="animate-pulse"
        >
          Loading Ghost...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090909]">
      {/* ── Main content — pad bottom so dock doesn't overlap ── */}
      <main className="min-h-screen pb-28">
        {children}
      </main>

      {/* ── Bottom Dock ── */}
      <nav
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center"
        style={{
          background: "rgba(12,12,12,0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(240,237,230,0.09)",
          borderRadius: "24px",
          padding: "8px 10px",
          gap: "2px",
          boxShadow: "0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(240,237,230,0.04) inset",
        }}
      >
        {/* Ghost logo pip */}
        <div
          className="flex h-10 w-10 items-center justify-center rounded-2xl mr-1"
          style={{
            background: "rgba(168,85,247,0.12)",
            border: "1px solid rgba(168,85,247,0.2)",
          }}
        >
          <Ghost className="h-4 w-4" style={{ color: "rgba(168,85,247,0.85)" }} />
        </div>

        {/* Divider */}
        <div
          className="mx-1 self-stretch w-px"
          style={{ background: "rgba(240,237,230,0.07)" }}
        />

        {/* Nav items */}
        {NAV.map(({ href, label, icon: Icon }) => {
          const active =
            path === href || (href === "/leads" && path.startsWith("/proposal"));
          return (
            <Link
              key={href}
              href={href}
              className="group relative flex flex-col items-center gap-1 rounded-xl px-4 py-2 transition-all duration-200"
              style={{
                background: active ? "rgba(168,85,247,0.12)" : "transparent",
                minWidth: "60px",
              }}
            >
              <Icon
                className="h-4 w-4 transition-colors duration-200"
                style={{
                  color: active ? "rgba(168,85,247,0.9)" : "rgba(240,237,230,0.38)",
                }}
              />
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.6rem",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: active ? "rgba(168,85,247,0.8)" : "rgba(240,237,230,0.25)",
                  whiteSpace: "nowrap",
                }}
              >
                {label}
              </span>
              {/* Active dot */}
              {active && (
                <span
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full"
                  style={{ background: "rgba(168,85,247,0.8)" }}
                />
              )}
            </Link>
          );
        })}

        {/* Divider */}
        <div
          className="mx-1 self-stretch w-px"
          style={{ background: "rgba(240,237,230,0.07)" }}
        />

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="flex flex-col items-center gap-1 rounded-xl px-4 py-2 transition-all duration-200 hover:bg-[rgba(239,68,68,0.08)]"
          style={{ minWidth: "52px" }}
        >
          <LogOut
            className="h-4 w-4 transition-colors duration-200 hover:text-[rgba(239,68,68,0.8)]"
            style={{ color: "rgba(240,237,230,0.25)" }}
          />
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.6rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "rgba(240,237,230,0.2)",
              whiteSpace: "nowrap",
            }}
          >
            Sign out
          </span>
        </button>
      </nav>
    </div>
  );
}
