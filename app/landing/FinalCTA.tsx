"use client";

import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";

/* ════════════════════════════════════════════════════════════════════
   FINAL CTA — letter-by-letter headline + magnetic CTA + marquee strip
   ════════════════════════════════════════════════════════════════════ */
export function FinalCTA() {
  const router = useRouter();
  const headline = "Your next client already exists.";
  const words = headline.split(" ");

  return (
    <section className="min-h-screen flex items-center justify-center bg-[#090909] relative overflow-hidden py-[10rem]">
      {/* Slow ambient glow */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.25, 0.45, 0.25] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80rem] h-[80rem] bg-purple-900/20 blur-[15rem] rounded-full pointer-events-none"
      />

      <div className="site-max relative z-10 text-center">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 0.5, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="inline-block text-[1.2rem] s:text-[1.4rem] uppercase tracking-[0.4em] mb-[6rem] font-mono"
        >
          06 — Begin
        </motion.span>

        <h3
          className="text-[4rem] s:text-[12rem] font-disp font-light leading-none mb-[2rem]"
          aria-label={headline}
        >
          {words.map((word, wi) => (
            <span key={wi} className="inline-block whitespace-nowrap mr-[0.25em]">
              {word.split("").map((ch, ci) => (
                <motion.span
                  key={ci}
                  initial={{ y: "110%", opacity: 0, filter: "blur(8px)" }}
                  whileInView={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
                  viewport={{ once: true, margin: "-15%" }}
                  transition={{
                    duration: 0.9,
                    ease: [0.22, 1, 0.36, 1],
                    delay: (wi * 6 + ci) * 0.025,
                  }}
                  className="inline-block"
                >
                  {ch}
                </motion.span>
              ))}
            </span>
          ))}
        </h3>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.45 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.6 }}
          className="text-[2rem] s:text-[4rem] font-disp italic mb-[8rem]"
        >
          Ghost finds them.
        </motion.p>

        <MagneticCTA label="Start the Hunt" onClick={() => router.push("/login")} />
      </div>

    </section>
  );
}

function MagneticCTA({ label, onClick }: { label: string; onClick?: () => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 200, damping: 18, mass: 0.4 });

  const onMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    x.set(dx * 0.35);
    y.set(dy * 0.35);
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ x: sx, y: sy }}
      whileTap={{ scale: 0.95 }}
      className="group relative px-[6rem] py-[2.5rem] bg-[#f0ede6] text-[#090909] rounded-full text-[1.4rem] s:text-[1.8rem] uppercase tracking-[0.4em] font-medium overflow-hidden"
    >
      <span
        className="absolute inset-0 bg-purple-500 translate-y-full group-hover:translate-y-0 transition-transform duration-700"
        style={{ transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)" }}
      />
      <span className="relative z-10 inline-flex items-center gap-[1rem] group-hover:text-white transition-colors duration-500">
        {label}
        <ArrowUpRight className="w-[1.6rem] h-[1.6rem] -mt-[2px]" />
      </span>
    </motion.button>
  );
}

/* ════════════════════════════════════════════════════════════════════
   FOOTER — kinetic wordmark + cursor-reactive grid + live ticker
   + 9-col curtain intro + magnetic back-to-top
   ════════════════════════════════════════════════════════════════════ */
export function Footer() {
  return (
    <footer className="relative bg-[#070707] overflow-hidden border-t border-[rgba(240,237,230,0.06)]">
      <AmbientCanvas />
      <FooterBody />
      <KineticWordmark />
      <BottomBar />
    </footer>
  );
}



/* ── Cursor-reactive ambient canvas (slow drifting glow + motes) ──── */
function AmbientCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    const t0 = performance.now();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = Math.max(1, Math.floor(canvas.clientWidth * dpr));
      canvas.height = Math.max(1, Math.floor(canvas.clientHeight * dpr));
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const dots = Array.from({ length: 40 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.3 + Math.random() * 1.1,
      s: 0.04 + Math.random() * 0.1,
      o: 0.05 + Math.random() * 0.2,
      p: Math.random() * Math.PI * 2,
    }));
    const draw = (now: number) => {
      const t = (now - t0) / 1000;
      const W = canvas.width;
      const H = canvas.height;
      ctx.fillStyle = "#070707";
      ctx.fillRect(0, 0, W, H);
      const cx = W * (0.5 + 0.18 * Math.sin(t * 0.13));
      const cy = H * (0.55 + 0.12 * Math.cos(t * 0.1));
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.7);
      g.addColorStop(0, "rgba(168,85,247,0.16)");
      g.addColorStop(0.4, "rgba(240,237,230,0.04)");
      g.addColorStop(1, "rgba(7,7,7,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      for (const d of dots) {
        const px = (d.x + t * d.s * 0.02) % 1;
        const py = (d.y + Math.sin(t * 0.2 + d.p) * 0.01 + t * d.s * 0.01) % 1;
        const a = d.o * (0.5 + 0.5 * Math.sin(t * 0.7 + d.p));
        ctx.beginPath();
        ctx.fillStyle = `rgba(240,237,230,${a.toFixed(3)})`;
        ctx.arc(px * W, py * H, d.r * dpr, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);
  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
}

/* ── Footer body: link grid + live system panel + cursor spotlight ── */
function FooterBody() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [spot, setSpot] = useState({ x: 50, y: 50, on: false });

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setSpot({
      x: ((e.clientX - r.left) / r.width) * 100,
      y: ((e.clientY - r.top) / r.height) * 100,
      on: true,
    });
  };
  const onLeave = () => setSpot((s) => ({ ...s, on: false }));

  return (
    <div
      ref={wrapRef}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="relative"
      style={{
        backgroundImage:
          "radial-gradient(rgba(240,237,230,0.07) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
      }}
    >
      {/* Cursor-following spotlight */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none transition-opacity duration-500"
        style={{
          opacity: spot.on ? 1 : 0,
          background: `radial-gradient(420px circle at ${spot.x}% ${spot.y}%, rgba(168,85,247,0.18), transparent 70%)`,
        }}
      />

      <div className="site-max relative z-10 pt-[10rem] s:pt-[14rem] pb-[6rem] s:pb-[10rem]">
        <div className="grid grid-cols-1 s:grid-cols-12 gap-[6rem] s:gap-[4rem]">
          {/* Brand block */}
          <div className="s:col-span-5 space-y-[3rem]">
            <h4 className="text-[3rem] s:text-[3.6rem] font-disp font-light flex items-center gap-[1.2rem]">
              <span
                className="inline-block w-[1rem] h-[1rem] rounded-full bg-purple-400 pulse-soft"
                aria-hidden="true"
              />
              Ghost
            </h4>
            <p className="text-[1.5rem] opacity-50 max-w-[36rem] leading-relaxed font-mono">
              The AI business partner that runs the agency side of your solo
              operation. Always on. Always one step ahead.
            </p>
            <NewsletterField />
          </div>

          {/* Link columns */}
          <div className="s:col-span-7 grid grid-cols-2 gap-[4rem]">
            <FooterCol
              title="Platform"
              items={["How it works", "Capabilities", "Workflow", "Pricing"]}
            />
            <FooterCol
              title="Company"
              items={["About", "Manifesto", "Press", "Careers"]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function FooterCol({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h5 className="uppercase tracking-[0.3em] text-[1.1rem] opacity-40 mb-[2.5rem] font-mono">
        {title}
      </h5>
      <ul className="space-y-[1.4rem] text-[1.5rem]">
        {items.map((it) => (
          <li key={it}>
            <a className="link-draw hover:text-[#f0ede6] opacity-75 hover:opacity-100 transition-opacity">
              {it}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function NewsletterField() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (email.length > 3) setSent(true);
      }}
      className="relative mt-[1rem] max-w-[36rem]"
    >
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@work.email"
        className="w-full bg-transparent border-b border-[rgba(240,237,230,0.2)] focus:border-purple-400 outline-none py-[1.4rem] pr-[6rem] text-[1.5rem] font-mono placeholder:opacity-30 transition-colors"
        aria-label="Email"
      />
      <button
        type="submit"
        className="absolute right-0 top-1/2 -translate-y-1/2 text-purple-400 hover:text-[#f0ede6] transition-colors flex items-center gap-[0.6rem] text-[1.2rem] uppercase tracking-[0.25em] font-mono"
        aria-label="Subscribe"
      >
        {sent ? "Sent ✦" : "Notify"}
        <ArrowUpRight className="w-[1.4rem] h-[1.4rem]" />
      </button>
    </form>
  );
}


/* ── Kinetic GHOST wordmark — full-bleed, scroll-reactive ───────────── */
function KineticWordmark() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end end"],
  });
  // Letters drift up + tighten as the user scrolls into the footer
  const y = useTransform(scrollYProgress, [0, 1], ["6rem", "0rem"]);
  const tracking = useTransform(scrollYProgress, [0, 1], ["0.05em", "-0.04em"]);
  const blur = useTransform(scrollYProgress, [0, 0.6, 1], [10, 2, 0]);
  const filter = useTransform(blur, (b) => `blur(${b}px)`);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.4, 0.85, 1]);

  return (
    <div ref={ref} className="relative pb-[2rem] s:pb-[4rem] select-none">
      <motion.h2
        style={{ y, letterSpacing: tracking, filter, opacity }}
        className="block w-full text-center font-medium uppercase leading-[0.85]"
      >
        <span
          style={{
            fontFamily: "var(--font-impact-stack)",
            fontSize: "clamp(8rem, 28vw, 42rem)",
            color: "#f0ede6",
            background:
              "linear-gradient(180deg, #f0ede6 30%, rgba(240,237,230,0.15) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            display: "inline-block",
          }}
        >
          GHOST
        </span>
      </motion.h2>
    </div>
  );
}

/* ── Bottom bar: copyright + back-to-top + maker credit ─────────────── */
function BottomBar() {
  return (
    <div className="border-t border-[rgba(240,237,230,0.06)] bg-[#050505]">
      <div className="site-max py-[2.4rem] flex flex-col s:flex-row items-center justify-between gap-[1.6rem]">
        <span className="font-mono uppercase tracking-[0.25em] text-[1.1rem] opacity-40">
          © 2026 Ghost AI · All quietly reserved
        </span>

        <span className="font-mono uppercase tracking-[0.25em] text-[1.1rem] opacity-40">
          Made by <span className="opacity-90 text-[#f0ede6]">UK Designs</span>
        </span>
      </div>
    </div>
  );
}


