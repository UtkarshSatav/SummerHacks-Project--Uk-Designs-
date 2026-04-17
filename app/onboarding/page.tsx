"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createProfile } from "../lib/api";
import { supabase } from "../lib/supabase";
import { toast } from "sonner";

const EXPERIENCE_OPTIONS = ["junior", "mid", "senior", "expert"];
const CLIENT_TYPES = [
  "early-stage startups",
  "funded startups (Series A+)",
  "SMBs & small businesses",
  "enterprises",
  "individual founders",
  "e-commerce brands",
  "creative agencies",
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  // Get auth user on mount — redirect to /auth if not signed in
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.replace("/auth");
      } else {
        setUserId(data.session.user.id);
      }
    });
  }, [router]);

  const [name, setName] = useState("");
  const [niche, setNiche] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [targetClient, setTargetClient] = useState("");
  const [experience, setExperience] = useState("senior");
  
  // Step 4 state
  const [clientName, setClientName] = useState("");
  const [projectName, setProjectName] = useState("");

  const addSkill = () => {
    const v = skillInput.trim();
    if (v && !skills.includes(v)) setSkills((s) => [...s, v]);
    setSkillInput("");
  };

  const handleSkillKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addSkill(); }
  };

  const next = () => {
    setError("");
    if (step === 1 && (!name.trim() || !niche.trim())) { setError("Please fill in both fields."); return; }
    if (step === 2 && skills.length === 0) { setError("Add at least one skill."); return; }
    if (step === 3 && !targetClient) { setError("Please select a target client type."); return; }
    setStep((s) => s + 1);
  };

  const finish = async () => {
    setLoading(true);
    setError("");
    try {
      await createProfile({ name, niche, skills, target_client: targetClient, experience, user_id: userId });
      
      // Optionally add client
      if (clientName && projectName) {
        await fetch("http://localhost:8000/clients/", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-User-ID": userId ?? "" },
          body: JSON.stringify({
            name: clientName,
            project_name: projectName,
            project_status: "active",
            project_completion_pct: 0,
            payment_status: "current",
            last_contact_date: new Date().toISOString().split("T")[0],
          }),
        });
      }

      toast.success("Ghost initialized!");
      fetch("http://localhost:8000/leads/scan", {
        method: "POST",
        headers: { "X-User-ID": userId ?? "" },
      }).catch(() => {});
      router.push("/dashboard");
    } catch {
      setError("Something went wrong. Make sure the backend is running.");
      setLoading(false);
    }
  };

  const steps = [
    { num: 1, label: "About you" },
    { num: 2, label: "Your skills" },
    { num: 3, label: "Your clients" },
    { num: 4, label: "First client" },
  ];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0a0a0a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px" }}>

      {/* Logo */}
      <div style={{ marginBottom: "48px", textAlign: "center" }}>
        <div style={{ fontSize: "30px", fontWeight: "700", color: "#fff", letterSpacing: "-0.5px" }}>
          👻 ghost
        </div>
        <div style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>
          Your AI business partner
        </div>
      </div>

      {/* Step indicators */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "32px", alignItems: "center" }}>
        {steps.map((s, i) => (
          <div key={s.num} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{
                width: "28px", height: "28px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "12px", fontWeight: "600",
                backgroundColor: step > s.num ? "#7c3aed" : step === s.num ? "#7c3aed" : "#1a1a1a",
                border: `2px solid ${step >= s.num ? "#7c3aed" : "#2a2a2a"}`,
                color: step >= s.num ? "#fff" : "#666",
                transition: "all 0.2s"
              }}>
                {step > s.num ? "✓" : s.num}
              </div>
              <span style={{ fontSize: "13px", color: step >= s.num ? "#f0f0f0" : "#666", fontWeight: step === s.num ? "600" : "400" }}>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ width: "32px", height: "1px", backgroundColor: step > s.num ? "#7c3aed" : "#2a2a2a", marginLeft: "4px" }} />
            )}
          </div>
        ))}
      </div>

      {/* Card */}
      <div style={{ width: "100%", maxWidth: "480px", backgroundColor: "#111111", border: "1px solid #2a2a2a", borderRadius: "16px", padding: "36px" }}>

        {/* Step 1 */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: "600", color: "#fff", marginBottom: "8px" }}>
              What's your name and niche?
            </h2>
            <p style={{ color: "#666", fontSize: "14px", marginBottom: "28px", lineHeight: "1.6" }}>
              Ghost uses this to write proposals and find leads in your voice.
            </p>

            <div style={{ marginBottom: "20px" }}>
              <label style={labelSt}>Your name</label>
              <input
                style={inputSt}
                placeholder="e.g. Arjun Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                onFocus={(e) => { e.target.style.borderColor = "#7c3aed"; }}
                onBlur={(e) => { e.target.style.borderColor = "#2a2a2a"; }}
              />
            </div>

            <div>
              <label style={labelSt}>Your niche</label>
              <input
                style={inputSt}
                placeholder="e.g. UI/UX design for SaaS products"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                onFocus={(e) => { e.target.style.borderColor = "#7c3aed"; }}
                onBlur={(e) => { e.target.style.borderColor = "#2a2a2a"; }}
              />
              <p style={{ color: "#555", fontSize: "12px", marginTop: "6px" }}>
                Specific beats generic — "SaaS product design" &gt; "designer"
              </p>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: "600", color: "#fff", marginBottom: "8px" }}>
              What are your skills?
            </h2>
            <p style={{ color: "#666", fontSize: "14px", marginBottom: "28px", lineHeight: "1.6" }}>
              Ghost scans the internet for people who need exactly these skills.
            </p>

            <label style={labelSt}>Add skills (press Enter after each)</label>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                style={{ ...inputSt, flex: 1 }}
                placeholder="e.g. Figma, Branding, React"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleSkillKey}
                autoFocus
                onFocus={(e) => { e.target.style.borderColor = "#7c3aed"; }}
                onBlur={(e) => { e.target.style.borderColor = "#2a2a2a"; }}
              />
              <button
                onClick={addSkill}
                style={{ padding: "0 18px", borderRadius: "8px", border: "1px solid #2a2a2a", background: "#1a1a1a", color: "#f0f0f0", fontSize: "14px", fontWeight: "500", whiteSpace: "nowrap" }}
              >
                Add
              </button>
            </div>

            {skills.length > 0 ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "16px" }}>
                {skills.map((s) => (
                  <span key={s} style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 12px", borderRadius: "20px", backgroundColor: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.4)", color: "#a78bfa", fontSize: "13px" }}>
                    {s}
                    <button onClick={() => setSkills(skills.filter((x) => x !== s))} style={{ background: "none", border: "none", color: "#7c3aed", fontSize: "16px", lineHeight: "1", padding: "0", cursor: "pointer" }}>×</button>
                  </span>
                ))}
              </div>
            ) : (
              <div style={{ marginTop: "16px", padding: "12px", borderRadius: "8px", border: "1px dashed #2a2a2a", textAlign: "center", color: "#555", fontSize: "13px" }}>
                Your skills will appear here
              </div>
            )}
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: "600", color: "#fff", marginBottom: "8px" }}>
              Who's your ideal client?
            </h2>
            <p style={{ color: "#666", fontSize: "14px", marginBottom: "24px", lineHeight: "1.6" }}>
              Ghost hunts for these exact people across Reddit and social media.
            </p>

            <label style={labelSt}>Select client type</label>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "24px" }}>
              {CLIENT_TYPES.map((c) => (
                <button
                  key={c}
                  onClick={() => setTargetClient(c)}
                  style={{
                    padding: "12px 16px", borderRadius: "8px", textAlign: "left", fontSize: "14px",
                    border: `1px solid ${targetClient === c ? "#7c3aed" : "#2a2a2a"}`,
                    backgroundColor: targetClient === c ? "rgba(124,58,237,0.15)" : "#1a1a1a",
                    color: targetClient === c ? "#a78bfa" : "#888",
                    cursor: "pointer", transition: "all 0.15s",
                    display: "flex", alignItems: "center", justifyContent: "space-between"
                  }}
                >
                  {c}
                  {targetClient === c && <span style={{ color: "#7c3aed", fontSize: "16px" }}>✓</span>}
                </button>
              ))}
            </div>

            <label style={labelSt}>Your experience level</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
              {EXPERIENCE_OPTIONS.map((e) => (
                <button
                  key={e}
                  onClick={() => setExperience(e)}
                  style={{
                    padding: "10px 0", borderRadius: "8px", fontSize: "13px", fontWeight: "500",
                    border: `1px solid ${experience === e ? "#7c3aed" : "#2a2a2a"}`,
                    backgroundColor: experience === e ? "rgba(124,58,237,0.15)" : "#1a1a1a",
                    color: experience === e ? "#a78bfa" : "#888",
                    cursor: "pointer", textTransform: "capitalize", transition: "all 0.15s"
                  }}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4 */}
        {step === 4 && (
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: "600", color: "#fff", marginBottom: "8px" }}>
              Add your first client (optional)
            </h2>
            <p style={{ color: "#666", fontSize: "14px", marginBottom: "28px", lineHeight: "1.6" }}>
              Ghost will immediately start monitoring their health. You can also skip and add this later.
            </p>

            <div style={{ marginBottom: "20px" }}>
              <label style={labelSt}>Client Name</label>
              <input
                style={inputSt}
                placeholder="e.g. Acme Corp"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                autoFocus
                onFocus={(e) => { e.target.style.borderColor = "#7c3aed"; }}
                onBlur={(e) => { e.target.style.borderColor = "#2a2a2a"; }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={labelSt}>Project Name</label>
              <input
                style={inputSt}
                placeholder="e.g. Dashboard Redesign"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                onFocus={(e) => { e.target.style.borderColor = "#7c3aed"; }}
                onBlur={(e) => { e.target.style.borderColor = "#2a2a2a"; }}
              />
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div style={{ marginTop: "16px", padding: "10px 14px", borderRadius: "8px", backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171", fontSize: "13px" }}>
            {error}
          </div>
        )}

        {/* Nav buttons */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "32px", gap: "12px" }}>
          {step > 1 ? (
            <button
              onClick={() => { setError(""); setStep(step - 1); }}
              style={{ padding: "12px 20px", borderRadius: "8px", border: "1px solid #2a2a2a", background: "transparent", color: "#888", fontSize: "14px", fontWeight: "500" }}
            >
              ← Back
            </button>
          ) : <div />}

          {step < 4 ? (
            <button
              onClick={next}
              style={{ padding: "12px 28px", borderRadius: "8px", border: "none", background: "#7c3aed", color: "#fff", fontSize: "14px", fontWeight: "600" }}
            >
              Continue →
            </button>
          ) : (
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={finish}
                disabled={loading}
                style={{ padding: "12px 20px", borderRadius: "8px", border: "1px solid #2a2a2a", background: "transparent", color: "#888", fontSize: "14px", fontWeight: "500", opacity: loading ? 0.8 : 1 }}
              >
                Skip & Launch
              </button>
              <button
                onClick={finish}
                disabled={loading}
                style={{ padding: "12px 28px", borderRadius: "8px", border: "none", background: loading ? "#4a2090" : "#7c3aed", color: "#fff", fontSize: "14px", fontWeight: "600", opacity: loading ? 0.8 : 1 }}
              >
                {loading ? "Setting up Ghost..." : "🚀 Launch Ghost"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer hint */}
      <p style={{ color: "#444", fontSize: "12px", marginTop: "24px" }}>
        Takes 30 seconds · No credit card required
      </p>
    </div>
  );
}

const labelSt: React.CSSProperties = {
  display: "block", fontSize: "13px", fontWeight: "500",
  color: "#888", marginBottom: "8px"
};

const inputSt: React.CSSProperties = {
  width: "100%", padding: "12px 14px", borderRadius: "8px",
  border: "1px solid #2a2a2a", backgroundColor: "#1a1a1a",
  color: "#f0f0f0", fontSize: "14px", transition: "border-color 0.15s"
};
