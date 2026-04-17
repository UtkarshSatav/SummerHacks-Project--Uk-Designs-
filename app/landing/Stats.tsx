"use client";

import { motion, useInView } from "framer-motion";
import CountUp from "react-countup";
import { Check } from "lucide-react";
import { useRef, useState, MouseEvent } from "react";

export function Stats() {
  const STATS = [
    { value: 70, label: "Struggle with income", suffix: "%" },
    { value: 60, label: "Lose clients unnecessarily", suffix: "%" },
    { value: 85, label: "Are undercharging", suffix: "%" },
  ];

  return (
    <section className="min-h-screen flex items-center justify-center bg-void relative py-[10rem]">
      <div className="site-max">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-[10rem] flex items-end justify-between gap-[4rem] flex-wrap"
        >
          <div>
            <h3 className="text-[3rem] s:text-[5rem] font-disp font-light leading-[1.1] max-w-[60rem]">
              The numbers say what <br className="hidden s:block" />
              every solo operator already feels.
            </h3>
          </div>
          <p className="text-[1.3rem] opacity-40 font-mono uppercase tracking-[0.2em]">
            Source · Freelancers Union / Bonsai · 2024–25
          </p>
        </motion.div>

        <div className="grid grid-cols-1 s:grid-cols-3 gap-[6rem] s:gap-[4rem]">
          {STATS.map((stat, i) => (
            <StatCard key={i} {...stat} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StatCard({
  value,
  label,
  suffix,
  index,
}: {
  value: number;
  label: string;
  suffix: string;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15%" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.9, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      className="relative text-center px-[2rem]"
    >
      {/* Animated progress arc behind the number */}
      <div className="relative inline-block">
        <svg
          viewBox="0 0 200 200"
          className="absolute inset-0 w-full h-full -z-0"
          aria-hidden="true"
        >
          <circle
            cx="100"
            cy="100"
            r="92"
            fill="none"
            stroke="rgba(240,237,230,0.08)"
            strokeWidth="1"
          />
          <motion.circle
            cx="100"
            cy="100"
            r="92"
            fill="none"
            stroke="rgba(168,85,247,0.5)"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 92}
            initial={{ strokeDashoffset: 2 * Math.PI * 92 }}
            animate={
              inView
                ? { strokeDashoffset: 2 * Math.PI * 92 * (1 - value / 100) }
                : {}
            }
            transition={{ duration: 2.4, delay: 0.3 + index * 0.1, ease: [0.22, 1, 0.36, 1] }}
            style={{ transform: "rotate(-90deg)", transformOrigin: "100px 100px" }}
          />
        </svg>

        <div className="relative py-[4rem] px-[2rem] text-[6rem] s:text-[10rem] font-disp font-light text-purple-400 leading-none">
          <CountUp end={value} duration={2.2} enableScrollSpy scrollSpyOnce />
          {suffix}
        </div>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.55 }}
        viewport={{ once: true }}
        transition={{ delay: 0.6 + index * 0.1, duration: 0.6 }}
        className="mt-[3rem] text-[1.3rem] s:text-[1.6rem] uppercase tracking-[0.25em] font-mono max-w-[26rem] mx-auto"
      >
        {label}
      </motion.p>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════════════ */

export function Pricing() {
  const PLANS = [
    {
      name: "Solo",
      price: "$0",
      desc: "For those just starting their solo journey.",
      features: ["Basic lead alerts", "Single channel sync", "Email support"],
      highlight: false,
    },
    {
      name: "Partner",
      price: "$49",
      desc: "The full Ghost experience for active operators.",
      features: [
        "All lead detection",
        "Infinite channel sync",
        "Priority execution",
        "Market intent pricing",
      ],
      highlight: true,
    },
  ];

  return (
    <section className="py-[10rem] s:py-[20rem] bg-void relative">
      <div className="site-max">
        <div className="text-center mb-[12rem]">
          <motion.span
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 0.5, y: 0 }}
            viewport={{ once: true }}
            className="block text-[1.2rem] s:text-[1.4rem] uppercase tracking-[0.4em] mb-[4rem] font-mono"
          >
            04 — Conversion
          </motion.span>
          <motion.h3
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="text-[3.5rem] s:text-[7rem] font-disp font-light"
          >
            Simple math.
          </motion.h3>
        </div>

        <div className="flex flex-col s:flex-row justify-center items-stretch gap-[4rem]">
          {PLANS.map((plan, i) => (
            <PlanCard key={i} {...plan} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PlanCard({
  name,
  price,
  desc,
  features,
  highlight,
  index,
}: {
  name: string;
  price: string;
  desc: string;
  features: string[];
  highlight: boolean;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ rx: py * -6, ry: px * 8 });
  };
  const onLeave = () => setTilt({ rx: 0, ry: 0 });

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
      style={{
        transform: `perspective(1200px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
        transformStyle: "preserve-3d",
        transition: "transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
      }}
      className={`relative w-full max-w-[50rem] rounded-[3rem] border-sweep border p-[5rem] s:p-[6rem] overflow-hidden ${highlight
          ? "bg-purple-900/10 border-purple-500/40 shadow-[0_0_90px_-30px_rgba(168,85,247,0.45)] is-active"
          : "bg-[#0e0e0e] border-[rgba(240,237,230,0.08)]"
        }`}
    >
      {highlight && (
        <span className="absolute top-[2rem] right-[2rem] inline-flex items-center gap-[0.6rem] text-[1rem] uppercase tracking-[0.3em] font-mono px-[1.2rem] py-[0.5rem] rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30">
          <span className="w-[0.6rem] h-[0.6rem] rounded-full bg-purple-400 pulse-soft" />
          Recommended
        </span>
      )}

      <span
        className={`block uppercase tracking-[0.3em] text-[1.2rem] font-mono ${highlight ? "text-purple-400" : "text-muted opacity-50"
          }`}
      >
        {name}
      </span>

      <div className="mt-[3rem] mb-[1rem] flex items-baseline gap-[1rem]">
        <span className="text-[6rem] font-disp leading-none">{price}</span>
        <span className="text-[2rem] opacity-40">/mo</span>
      </div>

      <p className="text-[1.6rem] opacity-50 mb-[4rem] min-h-[5rem]">{desc}</p>

      <ul className="space-y-[1.6rem] mb-[5rem]">
        {features.map((f, j) => (
          <motion.li
            key={j}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 0.8, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 + j * 0.08 }}
            className="flex items-center gap-[1.2rem] text-[1.5rem]"
          >
            <Check className="w-[1.6rem] h-[1.6rem] text-purple-400 shrink-0" />
            <span>{f}</span>
          </motion.li>
        ))}
      </ul>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`w-full py-[1.8rem] rounded-full text-[1.4rem] uppercase tracking-[0.3em] font-medium transition-all ${highlight
            ? "bg-purple-500 text-void shadow-[0_4px_30px_rgba(168,85,247,0.4)] hover:shadow-[0_8px_50px_rgba(168,85,247,0.55)]"
            : "bg-[#f0ede6] text-void hover:bg-white"
          }`}
      >
        Get Started →
      </motion.button>
    </motion.div>
  );
}
