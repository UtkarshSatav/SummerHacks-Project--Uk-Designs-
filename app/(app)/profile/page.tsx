"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { apiFetch } from "../../lib/api";
import { supabase } from "../../lib/supabase";
import { X, Plus, Save, User } from "lucide-react";
import { cn } from "@/lib/utils";

const EXPERIENCE_OPTIONS = [
  { value: "junior",  label: "Junior",  desc: "0–2 years" },
  { value: "mid",     label: "Mid",     desc: "2–5 years" },
  { value: "senior",  label: "Senior",  desc: "5–10 years" },
  { value: "expert",  label: "Expert",  desc: "10+ years" },
];

type Profile = {
  name: string;
  niche: string;
  skills: string[];
  experience: string;
  target_client: string;
  location: string;
};

const EMPTY: Profile = {
  name: "",
  niche: "",
  skills: [],
  experience: "mid",
  target_client: "",
  location: "India",
};

// ── Shared input style ──────────────────────────────────────────────
const inputBase: React.CSSProperties = {
  width: "100%",
  background: "#0f0f0f",
  border: "1px solid rgba(240,237,230,0.1)",
  borderRadius: "10px",
  padding: "12px 16px",
  color: "#f0ede6",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
  transition: "border-color 0.2s",
};

function GhostInput({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        style={{
          display: "block",
          fontFamily: "var(--font-mono)",
          fontSize: "0.72rem",
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: "rgba(240,237,230,0.35)",
          marginBottom: "8px",
        }}
      >
        {label}
      </label>
      {children}
      {hint && (
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.68rem",
            letterSpacing: "0.05em",
            color: "rgba(240,237,230,0.2)",
            marginTop: "6px",
          }}
        >
          {hint}
        </p>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const [form, setForm] = useState<Profile>(EMPTY);
  const [skillInput, setSkillInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      const [profileRes, { data: session }] = await Promise.all([
        apiFetch("/profile/"),
        supabase.auth.getSession(),
      ]);
      const data = await profileRes.json();
      if (data && data.name) {
        setForm({
          name: data.name ?? "",
          niche: data.niche ?? "",
          skills: Array.isArray(data.skills) ? data.skills : [],
          experience: data.experience ?? "mid",
          target_client: data.target_client ?? "",
          location: data.location ?? "India",
        });
      }
      setUserEmail(session.session?.user.email ?? null);
    } catch {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const addSkill = () => {
    const s = skillInput.trim();
    if (!s || form.skills.includes(s)) return;
    setForm(f => ({ ...f, skills: [...f.skills, s] }));
    setSkillInput("");
  };

  const removeSkill = (skill: string) => {
    setForm(f => ({ ...f, skills: f.skills.filter(s => s !== skill) }));
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.niche.trim()) {
      toast.error("Name and niche are required");
      return;
    }
    setSaving(true);
    try {
      const res = await apiFetch("/profile/", {
        method: "POST",
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success("Profile saved");
    } catch {
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const mono = (opacity = 0.35): React.CSSProperties => ({
    fontFamily: "var(--font-mono)",
    fontSize: "0.72rem",
    letterSpacing: "0.25em",
    textTransform: "uppercase",
    color: `rgba(240,237,230,${opacity})`,
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span style={{ ...mono(0.25), animation: "pulse 2s infinite" }}>Loading...</span>
      </div>
    );
  }

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
            Your Profile
          </h1>
          <span style={mono(0.28)}>
            {userEmail ?? "Ghost uses this to personalise everything"}
          </span>
        </div>
        <div
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl mt-1"
          style={{ background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.2)" }}
        >
          <User className="h-5 w-5" style={{ color: "rgba(168,85,247,0.8)" }} />
        </div>
      </div>

      {/* ── Form card ── */}
      <div
        className="rounded-2xl border p-6 space-y-7"
        style={{ background: "#0c0c0c", borderColor: "rgba(240,237,230,0.07)" }}
      >
        {/* Row 1 — Name + Niche */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
          <GhostInput label="Full Name" hint="Used as the sign-off in every proposal">
            <input
              style={inputBase}
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Utkarsh Satav"
              onFocus={e => (e.target.style.borderColor = "rgba(168,85,247,0.4)")}
              onBlur={e => (e.target.style.borderColor = "rgba(240,237,230,0.1)")}
            />
          </GhostInput>
          <GhostInput label="Niche / Specialisation" hint="Ghost scans Reddit subreddits based on this">
            <input
              style={inputBase}
              value={form.niche}
              onChange={e => setForm(f => ({ ...f, niche: e.target.value }))}
              placeholder="e.g. AI/ML, Video Editing, Full-Stack Dev"
              onFocus={e => (e.target.style.borderColor = "rgba(168,85,247,0.4)")}
              onBlur={e => (e.target.style.borderColor = "rgba(240,237,230,0.1)")}
            />
          </GhostInput>
        </div>

        {/* Skills */}
        <GhostInput label="Skills" hint="Press Enter or comma to add a skill">
          <div
            className="flex flex-wrap gap-2 min-h-[48px] rounded-[10px] border p-3"
            style={{ background: "#0f0f0f", borderColor: "rgba(240,237,230,0.1)" }}
          >
            {form.skills.map(skill => (
              <span
                key={skill}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-sm"
                style={{
                  background: "rgba(168,85,247,0.1)",
                  border: "1px solid rgba(168,85,247,0.25)",
                  color: "rgba(168,85,247,0.9)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.75rem",
                  letterSpacing: "0.08em",
                }}
              >
                {skill}
                <button
                  onClick={() => removeSkill(skill)}
                  className="opacity-50 hover:opacity-100 transition-opacity"
                  style={{ lineHeight: 1 }}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            <input
              style={{
                flex: "1 1 120px",
                minWidth: "80px",
                background: "transparent",
                border: "none",
                outline: "none",
                color: "#f0ede6",
                fontSize: "14px",
                fontFamily: "inherit",
                padding: "2px 4px",
              }}
              value={skillInput}
              onChange={e => setSkillInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  addSkill();
                }
                if (e.key === "Backspace" && !skillInput && form.skills.length > 0) {
                  setForm(f => ({ ...f, skills: f.skills.slice(0, -1) }));
                }
              }}
              placeholder={form.skills.length === 0 ? "Python, React, CapCut..." : ""}
            />
          </div>
        </GhostInput>

        {/* Experience */}
        <GhostInput label="Experience Level">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {EXPERIENCE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setForm(f => ({ ...f, experience: opt.value }))}
                className="rounded-xl border py-3 text-center transition-all duration-200"
                style={{
                  background: form.experience === opt.value ? "rgba(168,85,247,0.12)" : "transparent",
                  borderColor: form.experience === opt.value ? "rgba(168,85,247,0.4)" : "rgba(240,237,230,0.08)",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.78rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: form.experience === opt.value ? "rgba(168,85,247,0.9)" : "rgba(240,237,230,0.5)",
                  }}
                >
                  {opt.label}
                </div>
                <div style={{ fontSize: "0.68rem", color: "rgba(240,237,230,0.2)", marginTop: "2px" }}>
                  {opt.desc}
                </div>
              </button>
            ))}
          </div>
        </GhostInput>

        {/* Row — Target Client + Location */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
          <GhostInput label="Target Client" hint="Who are your ideal clients?">
            <input
              style={inputBase}
              value={form.target_client}
              onChange={e => setForm(f => ({ ...f, target_client: e.target.value }))}
              placeholder="e.g. SaaS startups, indie hackers, small agencies"
              onFocus={e => (e.target.style.borderColor = "rgba(168,85,247,0.4)")}
              onBlur={e => (e.target.style.borderColor = "rgba(240,237,230,0.1)")}
            />
          </GhostInput>
          <GhostInput label="Location" hint="Used for pricing benchmarks">
            <input
              style={inputBase}
              value={form.location}
              onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
              placeholder="e.g. India, USA, Remote"
              onFocus={e => (e.target.style.borderColor = "rgba(168,85,247,0.4)")}
              onBlur={e => (e.target.style.borderColor = "rgba(240,237,230,0.1)")}
            />
          </GhostInput>
        </div>

        {/* Divider */}
        <div style={{ height: "1px", background: "rgba(240,237,230,0.06)" }} />

        {/* Save */}
        <div className="flex items-center justify-between">
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", letterSpacing: "0.1em", color: "rgba(240,237,230,0.2)" }}>
            Changes apply to all future proposals &amp; briefs
          </p>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl px-6 py-3 transition-all duration-200 hover:opacity-90 disabled:opacity-50"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.82rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#090909",
              background: saving ? "rgba(240,237,230,0.7)" : "#f0ede6",
            }}
          >
            <Save className={cn("h-3.5 w-3.5", saving && "animate-pulse")} />
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </div>

    </div>
  );
}
