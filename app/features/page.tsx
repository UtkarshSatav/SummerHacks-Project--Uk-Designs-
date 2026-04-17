"use client";

import { motion } from "framer-motion";
import { SmoothScroll } from "../landing/SmoothScroll";
import { PageTransition } from "../landing/PageTransition";
import { Header } from "../landing/Header";
import { Footer } from "../landing/FinalCTA";
import { Target, Zap, Cpu, Network } from "lucide-react";

export default function FeaturesPage() {
  const capabilities = [
    {
      title: "Signal Interpretation",
      desc: "Ghost doesn't just read data; it understands intent. By monitoring subtle changes in your clients' organizational structure, funding rounds, or key hires, Ghost flags high-probability interaction windows before your competitors even know there's a need.",
      icon: <Target className="w-[3rem] h-[3rem]" />,
      stats: ["24/7 Monitoring", "94% Signal Accuracy", "Zero-Latent Alerts"],
    },
    {
      title: "Autonomous Outreach",
      desc: "Drafting emails is a bottleneck. Ghost constructs highly contextual, hyper-personalized outreach sequences natively mimicking your exact tone and cadence. When a signal is detected, the draft is ready in your outbox.",
      icon: <Zap className="w-[3rem] h-[3rem]" />,
      stats: ["Voice Cloning", "Multi-Thread Syntax", "Auto-Followups"],
    },
    {
      title: "CRM Synchronization",
      desc: "Stop doing data entry. As you execute work, Ghost silently logs interactions, updates pipeline probabilities, and restructures your client history. Your CRM is always perfectly accurate, but you never have to touch it.",
      icon: <Network className="w-[3rem] h-[3rem]" />,
      stats: ["Silent Logging", "Auto-Enrichment", "Bidirectional Sync"],
    },
    {
      title: "Market Intelligence Pricing",
      desc: "Never undercharge again. Ghost analyzes open-market intent, competitor pricing structures, and client budget proxies to mathematically calculate the optimal ceiling for your next proposal.",
      icon: <Cpu className="w-[3rem] h-[3rem]" />,
      stats: ["Dynamic Modeling", "Budget Proxying", "Win-Rate Alg."],
    },
  ];

  return (
    <>
      <SmoothScroll />
      <PageTransition />
      <Header />
      <main className="relative bg-[#090909] pb-[15rem]">

        {/* Abstract Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[100vw] h-[60vh] bg-purple-900/10 blur-[15rem] pointer-events-none" />

        {/* Hero Section */}
        <section className="relative pt-[25rem] pb-[15rem] site-max flex flex-col items-center text-center z-10">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="block text-[1.2rem] s:text-[1.4rem] uppercase tracking-[0.4em] mb-[4rem] font-mono opacity-50"
          >
            Capabilities
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-[5rem] s:text-[10rem] font-disp font-light leading-[1] max-w-[110rem] tracking-tight"
          >
            The architecture of <br className="hidden s:block" />
            <span className="italic opacity-80">infinite leverage.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="mt-[6rem] text-[1.8rem] s:text-[2.2rem] font-mono leading-relaxed max-w-[60rem]"
          >
            Ghost replaces the operational drag of agency structures with pure mathematical throughput.
          </motion.p>
        </section>

        {/* Deep Dive Capabilities */}
        <section className="relative site-max z-10 space-y-[4rem] s:space-y-[8rem]">
          {capabilities.map((cap, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="group flex flex-col s:flex-row gap-[4rem] s:gap-[8rem] items-stretch p-[4rem] s:p-[8rem] rounded-[3rem] border border-[rgba(240,237,230,0.06)] bg-[#0c0c0c] hover:bg-[#0f0f0f] transition-colors duration-700 relative overflow-hidden"
            >
              {/* Internal glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

              <div className="s:w-1/2 flex flex-col items-start">
                <div className="w-[6rem] h-[6rem] rounded-[1.6rem] bg-purple-500/10 text-purple-300 flex items-center justify-center border border-purple-400/20 mb-[4rem] group-hover:scale-110 transition-transform duration-700">
                  {cap.icon}
                </div>
                <h3 className="text-[3rem] s:text-[4.5rem] font-disp font-medium leading-[1.1] mb-[3rem]">{cap.title}</h3>
                <div className="flex gap-[1.5rem] flex-wrap mt-auto pt-[4rem]">
                  {cap.stats.map((stat, j) => (
                    <span key={j} className="text-[1.1rem] uppercase tracking-[0.2em] font-mono opacity-40 py-[0.8rem] px-[1.6rem] border border-[rgba(240,237,230,0.2)] rounded-full">
                      {stat}
                    </span>
                  ))}
                </div>
              </div>

              <div className="s:w-1/2 flex items-center">
                <p className="text-[1.8rem] s:text-[2.2rem] leading-relaxed text-[#f0ede6]/60">
                  {cap.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </section>

        {/* Integration Strip */}
        <section className="relative mt-[15rem] border-y border-[rgba(240,237,230,0.05)] bg-[#050505] py-[6rem] overflow-hidden">
          <div className="marquee-track gap-[4rem]">
             {[...Array(2)].map((_, i) => (
                <div key={i} className="flex items-center gap-[8rem]">
                  {["Salesforce", "Linear", "Notion", "Slack", "Figma", "Stripe", "HubSpot", "Google Workspace", "PostHog"].map((tool) => (
                    <span key={tool} className="text-[3rem] s:text-[5rem] font-disp opacity-20 uppercase tracking-widest hover:opacity-100 transition-opacity duration-300">
                      {tool}
                    </span>
                  ))}
                  <span className="text-[3rem] s:text-[5rem] font-disp opacity-20 uppercase tracking-widest mx-[4rem]">·</span>
                </div>
             ))}
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
