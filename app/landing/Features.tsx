"use client";

import { motion } from "framer-motion";
import { Zap, Shield, Target, TrendingUp, Cpu, Radar } from "lucide-react";
import { MouseEvent, useRef, useState } from "react";

const FEATURES = [
  {
    icon: <Target className="w-[2.4rem] h-[2.4rem]" />,
    title: "Lead Detection",
    desc: "Finding high-value targets before you need to look.",
    span: "s:col-span-2",
  },
  {
    icon: <Shield className="w-[2.4rem] h-[2.4rem]" />,
    title: "Health Monitoring",
    desc: "Watching every client relationship, alert by alert.",
    span: "s:col-span-1",
  },
  {
    icon: <Cpu className="w-[2.4rem] h-[2.4rem]" />,
    title: "Auto Proposal",
    desc: "Drafting the next big win while you stay in the craft.",
    span: "s:col-span-1",
  },
  {
    icon: <TrendingUp className="w-[2.4rem] h-[2.4rem]" />,
    title: "Pricing Engine",
    desc: "Pricing your work based on real-time market intent.",
    span: "s:col-span-1",
  },
  {
    icon: <Zap className="w-[2.4rem] h-[2.4rem]" />,
    title: "Daily Brief",
    desc: "The one thing to do right now — distilled every morning.",
    span: "s:col-span-2",
  },
  {
    icon: <Radar className="w-[2.4rem] h-[2.4rem]" />,
    title: "Ops Autopilot",
    desc: "Follow-ups, invoices, reminders — all running silently.",
    span: "s:col-span-1",
  },
];

export function Features() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-[#090909] py-[10rem]">
      <div className="site-max">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.6 }}
          className="mb-[4rem] s:mb-[6rem]"
        >

        </motion.div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 s:grid-cols-3 auto-rows-[22rem] gap-[1.6rem] s:gap-[2rem]">
          {FEATURES.map((f, i) => (
            <FeatureCard key={i} {...f} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
  span,
  index,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  span: string;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [spot, setSpot] = useState({ x: 50, y: 50, on: false });

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
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
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{
        type: "spring",
        damping: 22,
        stiffness: 90,
        delay: index * 0.08,
      }}
      className={`border-sweep relative ${span} p-[2.8rem] s:p-[3.2rem] border border-[rgba(240,237,230,0.08)] rounded-[1.6rem] bg-[#0c0c0c] overflow-hidden group`}
    >
      {/* Cursor-follow spotlight */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none transition-opacity duration-500"
        style={{
          opacity: spot.on ? 1 : 0,
          background: `radial-gradient(320px circle at ${spot.x}% ${spot.y}%, rgba(168,85,247,0.16), transparent 65%)`,
        }}
      />



      <div className="relative z-10 h-full flex flex-col">
        <div className="flex items-center justify-between mb-[2.5rem]">
          <div className="w-[5rem] h-[5rem] rounded-[1.2rem] flex items-center justify-center bg-purple-500/10 text-purple-300 border border-purple-400/20 group-hover:bg-purple-500/20 group-hover:scale-105 transition-all duration-500">
            {icon}
          </div>
          <span className="text-[1rem] font-mono tracking-[0.3em] opacity-30">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>

        <h4 className="text-[2rem] s:text-[2.2rem] font-medium mb-[1.2rem] group-hover:text-[#f0ede6] transition-colors">
          {title}
        </h4>
        <p className="text-[1.3rem] opacity-[0.45] leading-relaxed font-mono max-w-[32rem]">
          {desc}
        </p>
        <div className="mt-auto"></div>
      </div>
    </motion.div>
  );
}
