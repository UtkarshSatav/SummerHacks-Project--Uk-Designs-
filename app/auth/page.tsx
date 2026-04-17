"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Lock, User, ArrowRight } from "lucide-react";
import { supabase } from "../lib/supabase";

/* ── PIXEL ANIMATION BACKGROUND by Kishan ── */
function PixelBackground({ mode }: { mode: "login" | "signup" }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    let rafId: number;
    let particles: Particle[] = [];
    const mouse = { x: -9999, y: -9999, radius: 150 };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener("mousemove", handleMouseMove);

    class Particle {
      x: number; y: number; destX: number; destY: number;
      vx: number; vy: number; accX: number; accY: number;
      friction: number; color: string; size: number;
      originX: number; originY: number;

      constructor(x: number, y: number, color: string) {
        this.destX = x; this.destY = y;
        this.x = innerWidth / 2 + (Math.random() - 0.5) * 100;
        this.y = innerHeight / 2 + (Math.random() - 0.5) * 100;
        this.originX = this.x; this.originY = this.y;
        this.vx = (Math.random() - 0.5) * 30;
        this.vy = (Math.random() - 0.5) * 30;
        this.accX = 0; this.accY = 0;
        this.friction = 0.85 + Math.random() * 0.08;
        this.color = color;
        this.size = Math.random() * 3 + 2;
      }

      update() {
        this.accX = (this.destX - this.x) * 0.015;
        this.accY = (this.destY - this.y) * 0.015;
        const dx = this.x - mouse.x, dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          this.accX += (dx / dist) * force * 5;
          this.accY += (dy / dist) * force * 5;
        }
        this.accX += (Math.random() - 0.5) * 0.2;
        this.accY += (Math.random() - 0.5) * 0.2;
        this.vx += this.accX; this.vy += this.accY;
        this.vx *= this.friction; this.vy *= this.friction;
        this.x += this.vx; this.y += this.vy;
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = this.color;
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        const stretch = Math.max(1, speed * 0.5);
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(Math.atan2(this.vy, this.vx));
        ctx.fillRect(-stretch / 2, -this.size / 2, stretch + this.size, this.size);
        ctx.restore();
      }
    }

    const initText = () => {
      particles = [];
      const W = innerWidth, H = innerHeight;
      canvas.width = W; canvas.height = H;
      const textCtx = document.createElement("canvas").getContext("2d");
      if (!textCtx) return;
      textCtx.canvas.width = W; textCtx.canvas.height = H;
      const text = mode === "login" ? "AUTH" : "JOIN";
      textCtx.fillStyle = "white";
      textCtx.font = "900 30vw Arial, sans-serif";
      textCtx.textAlign = "center";
      textCtx.textBaseline = "middle";
      textCtx.fillText(text, W / 2, H / 2);
      const pixels = textCtx.getImageData(0, 0, W, H).data;
      const step = Math.max(Math.floor(W / 200), 4);
      for (let y = 0; y < H; y += step) {
        for (let x = 0; x < W; x += step) {
          const idx = (y * W + x) * 4;
          if (pixels[idx + 3] > 128) {
            const isPurple = Math.random() > 0.7;
            particles.push(new Particle(x, y, isPurple ? "rgba(168,85,247,1)" : "rgba(240,237,230,0.9)"));
          }
        }
      }
    };

    setTimeout(initText, 300);
    window.addEventListener("resize", initText);

    const animate = () => {
      ctx.fillStyle = "rgba(7,7,7,0.3)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) { p.update(); p.draw(); }
      rafId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", initText);
      cancelAnimationFrame(rafId);
    };
  }, [mode]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />;
}

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkingSession, setCheckingSession] = useState(true);

  // Restore rem scale to 68.75% for this page (globals.css sets 51.5625% for the landing)
  useEffect(() => {
    document.documentElement.style.fontSize = "68.75%";
    return () => { document.documentElement.style.fontSize = ""; };
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace("/dashboard");
      else setCheckingSession(false);
    });
  }, [router]);

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-[#070707] flex items-center justify-center">
        <div className="text-[#f0ede6]/40 text-[1.4rem]">Initializing...</div>
      </div>
    );
  }

  const handleGoogle = async () => {
    setGoogleLoading(true);
    setError("");
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (oauthError) { setError(oauthError.message); setGoogleLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError("Email and passcode are required."); return; }
    if (password.length < 6) { setError("Passcode must be at least 6 characters."); return; }
    setLoading(true);
    setError("");
    try {
      if (!isLogin) {
        const { error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;
        router.push("/onboarding");
      } else {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        const userId = signInData.session?.user?.id;
        if (userId) {
          const profileRes = await fetch("http://localhost:8000/profile/", { headers: { "X-User-ID": userId } });
          const profile = await profileRes.json();
          router.push(profile?.id ? "/dashboard" : "/onboarding");
        } else {
          router.push("/onboarding");
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg.replace("AuthApiError: ", ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#070707] text-[#f0ede6] overflow-hidden flex items-center justify-center font-mono py-[6rem]">
      <PixelBackground mode={isLogin ? "login" : "signup"} />

      {/* Glow */}
      <div className="absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60rem] h-[60rem] bg-purple-900/10 blur-[10rem] pointer-events-none rounded-full" />

      {/* Back button */}
      <Link href="/" className="absolute top-[3rem] left-[3rem] z-20 flex items-center gap-[1rem] text-[1.1rem] uppercase tracking-[0.2em] opacity-50 hover:opacity-100 transition-opacity">
        <ArrowLeft className="w-[1.4rem] h-[1.4rem]" />
        <span>Back to Ghost</span>
      </Link>

      <div className="relative z-10 w-full max-w-[46rem] px-[2rem]">
        <motion.div
          layout
          className="bg-[#090909]/40 backdrop-blur-2xl border border-[rgba(240,237,230,0.1)] p-[4rem] s:p-[6rem] rounded-[2rem] shadow-2xl relative overflow-hidden"
        >
          {/* Grid pattern */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.15]" style={{ backgroundImage: "radial-gradient(rgba(240,237,230,0.15) 1px, transparent 1px)", backgroundSize: "16px 16px" }} />

          {/* Toggle */}
          <div className="flex bg-[#050505] rounded-full p-[0.5rem] mb-[4rem] border border-[rgba(240,237,230,0.05)] relative z-10">
            <button
              onClick={() => { setIsLogin(true); setError(""); }}
              className={`flex-1 py-[1.2rem] text-[1.2rem] uppercase tracking-[0.2em] relative transition-colors ${isLogin ? "text-[#090909]" : "text-[#f0ede6]/50 hover:text-[#f0ede6]"}`}
            >
              {isLogin && <motion.div layoutId="pill" className="absolute inset-0 bg-[#f0ede6] rounded-full" />}
              <span className="relative z-10">Log In</span>
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(""); }}
              className={`flex-1 py-[1.2rem] text-[1.2rem] uppercase tracking-[0.2em] relative transition-colors ${!isLogin ? "text-[#090909]" : "text-[#f0ede6]/50 hover:text-[#f0ede6]"}`}
            >
              {!isLogin && <motion.div layoutId="pill" className="absolute inset-0 bg-[#f0ede6] rounded-full" />}
              <span className="relative z-10">Sign Up</span>
            </button>
          </div>

          {/* Form */}
          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? "login" : "signup"}
              initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10"
            >
              <h2 className="text-[3rem] font-disp font-light leading-none mb-[1rem]">
                {isLogin ? "Welcome Back" : "Initialize Agent"}
              </h2>
              <p className="text-[1.3rem] opacity-50 mb-[4rem]">
                {isLogin ? "Enter your credentials to access the system." : "Create a new agent profile and start the hunt."}
              </p>

              <form className="space-y-[2rem]" onSubmit={handleSubmit}>
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="relative group"
                  >
                    <User className="absolute left-[1.6rem] top-1/2 -translate-y-1/2 w-[1.8rem] h-[1.8rem] text-[#f0ede6]/30 group-focus-within:text-purple-400 transition-colors" />
                    <input
                      type="text"
                      placeholder="Agent Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#050505] border border-[rgba(240,237,230,0.1)] rounded-[1rem] py-[1.6rem] pl-[5rem] pr-[2rem] text-[1.4rem] focus:border-purple-500/50 outline-none transition-all placeholder:text-[#f0ede6]/20"
                    />
                  </motion.div>
                )}

                <div className="relative group">
                  <Mail className="absolute left-[1.6rem] top-1/2 -translate-y-1/2 w-[1.8rem] h-[1.8rem] text-[#f0ede6]/30 group-focus-within:text-purple-400 transition-colors" />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#050505] border border-[rgba(240,237,230,0.1)] rounded-[1rem] py-[1.6rem] pl-[5rem] pr-[2rem] text-[1.4rem] focus:border-purple-500/50 outline-none transition-all placeholder:text-[#f0ede6]/20"
                  />
                </div>

                <div className="relative group">
                  <Lock className="absolute left-[1.6rem] top-1/2 -translate-y-1/2 w-[1.8rem] h-[1.8rem] text-[#f0ede6]/30 group-focus-within:text-purple-400 transition-colors" />
                  <input
                    type="password"
                    placeholder="Passcode"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#050505] border border-[rgba(240,237,230,0.1)] rounded-[1rem] py-[1.6rem] pl-[5rem] pr-[2rem] text-[1.4rem] focus:border-purple-500/50 outline-none transition-all placeholder:text-[#f0ede6]/20"
                  />
                </div>

                {/* Google OAuth */}
                <button
                  type="button"
                  onClick={handleGoogle}
                  disabled={googleLoading || loading}
                  className="w-full flex items-center justify-center gap-[1.2rem] bg-[#050505] border border-[rgba(240,237,230,0.1)] hover:border-purple-500/40 rounded-[1rem] py-[1.6rem] text-[1.3rem] uppercase tracking-[0.1em] transition-all disabled:opacity-50"
                >
                  {googleLoading ? (
                    <span className="w-[1.6rem] h-[1.6rem] rounded-full border-2 border-[#f0ede6]/30 border-t-[#f0ede6] animate-spin" />
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                      <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
                      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                    </svg>
                  )}
                  {googleLoading ? "Redirecting..." : "Continue with Google"}
                </button>

                {error && (
                  <div className="rounded-[0.8rem] bg-red-500/10 border border-red-500/25 px-[1.6rem] py-[1.2rem] text-[1.3rem] text-red-400">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || googleLoading}
                  className="w-full mt-[2rem] py-[1.8rem] bg-[#f0ede6] hover:bg-white text-[#090909] rounded-[1rem] text-[1.4rem] uppercase tracking-[0.2em] font-bold transition-all group flex items-center justify-center gap-[1rem] disabled:opacity-60"
                >
                  {loading
                    ? (isLogin ? "Authenticating..." : "Deploying...")
                    : (isLogin ? "Authenticate" : "Deploy")}
                  {!loading && <ArrowRight className="w-[1.6rem] h-[1.6rem] group-hover:translate-x-[4px] transition-transform" />}
                </button>
              </form>

              {isLogin && (
                <div className="mt-[3rem] text-center">
                  <button className="text-[1.2rem] opacity-40 hover:opacity-100 transition-all underline decoration-[rgba(240,237,230,0.2)] underline-offset-4">
                    Forgot your passcode?
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
