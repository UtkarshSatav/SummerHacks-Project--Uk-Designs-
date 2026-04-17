"use client";

import { motion } from "framer-motion";
import { SmoothScroll } from "../landing/SmoothScroll";
import { PageTransition } from "../landing/PageTransition";
import { Header } from "../landing/Header";
import { Footer } from "../landing/FinalCTA";
import { ArrowUpRight } from "lucide-react";
import { useState, useEffect } from "react";

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [nodes, setNodes] = useState(1402);
  const [signals, setSignals] = useState(482103);

  useEffect(() => {
    const int = setInterval(() => {
      setNodes(n => n + Math.floor(Math.random() * 2));
      setSignals(s => s + Math.floor(Math.random() * 8));
    }, 2000);
    return () => clearInterval(int);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setTimeout(() => setStatus("sent"), 1500);
  };

  return (
    <>
      <SmoothScroll />
      <PageTransition />
      <Header />
      <main className="relative bg-[#090909] py-[20rem] min-h-screen flex items-center">

        {/* Environment Grid */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02] pointer-events-none" />

        <div className="site-max w-full">
          <div className="grid grid-cols-1 s:grid-cols-2 gap-[10rem] s:gap-[16rem]">

            {/* Context/Branding Side */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col justify-between"
            >
              <div>
                <span className="block text-[1.2rem] s:text-[1.4rem] uppercase tracking-[0.4em] mb-[4rem] font-mono opacity-50 flex items-center gap-[1rem]">
                  <span className="w-[0.8rem] h-[0.8rem] rounded-full bg-purple-500 pulse-soft" />
                  Network Entry
                </span>
                <h1 className="text-[5rem] s:text-[9rem] font-disp font-light leading-[1] mb-[4rem]">
                  Start <br />
                  <span className="italic opacity-70">the hunt.</span>
                </h1>
                <p className="text-[1.8rem] opacity-50 max-w-[40rem] leading-relaxed font-mono">
                  Ghost AI is currently maintaining an active waitlist to ensure extreme server throughput for existing operators. Drop your signal to claim your position.
                </p>
              </div>

              {/* Live Terminal HUD */}
              <div className="hidden s:block mt-[10rem] p-[4rem] border border-[rgba(240,237,230,0.1)] rounded-[2rem] bg-[#050505] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
                <h4 className="text-[1.2rem] uppercase tracking-[0.3em] font-mono opacity-40 mb-[4rem]">System Health (US-East)</h4>

                <div className="space-y-[3rem]">
                  <div className="flex justify-between items-end border-b border-[rgba(240,237,230,0.05)] pb-[1.5rem]">
                    <span className="text-[1.4rem] font-mono opacity-60">Active Operators</span>
                    <span className="text-[2.4rem] font-mono text-purple-300">{nodes.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-end border-b border-[rgba(240,237,230,0.05)] pb-[1.5rem]">
                    <span className="text-[1.4rem] font-mono opacity-60">Signals Intercepted (24h)</span>
                    <span className="text-[2.4rem] font-mono text-purple-300">{signals.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-[1.4rem] font-mono opacity-60">Avg. Execution Latency</span>
                    <span className="text-[2.4rem] font-mono text-purple-300 flex items-center gap-[1rem]">
                       14ms <span className="w-[1rem] h-[1rem] rounded-full border border-purple-500/50 bg-purple-500/20" />
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Brutalist Form Side */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="p-[4rem] s:p-[6rem] border border-[rgba(240,237,230,0.1)] rounded-[3rem] bg-[#0c0c0c] relative overflow-hidden flex flex-col justify-center"
            >
              {/* Form abstract glow */}
              <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-purple-900/10 blur-[10rem] rounded-full pointer-events-none translate-x-1/2 -translate-y-1/2" />

              {status === "sent" ? (
                <div className="h-[45rem] flex flex-col items-center justify-center text-center">
                  <div className="w-[6rem] h-[6rem] mb-[4rem] rounded-full bg-[rgba(168,85,247,0.1)] text-purple-300 flex items-center justify-center border border-purple-400/30 shadow-[0_0_50px_rgba(168,85,247,0.4)]">
                    <ArrowUpRight className="w-[3rem] h-[3rem]" />
                  </div>
                  <h3 className="text-[3rem] s:text-[4rem] font-disp mb-[2rem] text-[#f0ede6]">Signal Received.</h3>
                  <p className="text-[1.6rem] opacity-50 font-mono">You are now in the queue. We will initiate contact.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-[5rem] relative z-10 w-full">
                  <div className="space-y-[1.5rem] group">
                    <label className="block text-[1.2rem] uppercase tracking-[0.3em] font-mono opacity-40 group-focus-within:opacity-100 group-focus-within:text-purple-400 transition-colors">Operator Designation</label>
                    <input
                      required
                      type="text"
                      placeholder="Your Given Name"
                      className="w-full bg-transparent border-b border-[rgba(240,237,230,0.2)] focus:border-purple-400 outline-none pb-[1.5rem] text-[2rem] font-medium placeholder:opacity-20 transition-colors"
                    />
                  </div>

                  <div className="space-y-[1.5rem] group">
                    <label className="block text-[1.2rem] uppercase tracking-[0.3em] font-mono opacity-40 group-focus-within:opacity-100 group-focus-within:text-purple-400 transition-colors">Comms Link</label>
                    <input
                      required
                      type="email"
                      placeholder="secure@domain.com"
                      className="w-full bg-transparent border-b border-[rgba(240,237,230,0.2)] focus:border-purple-400 outline-none pb-[1.5rem] text-[2rem] font-medium placeholder:opacity-20 transition-colors"
                    />
                  </div>

                  <div className="space-y-[1.5rem] group">
                    <label className="block text-[1.2rem] uppercase tracking-[0.3em] font-mono opacity-40 group-focus-within:opacity-100 group-focus-within:text-purple-400 transition-colors">Digital Footprint</label>
                    <input
                      type="url"
                      placeholder="https://portfolio.com"
                      className="w-full bg-transparent border-b border-[rgba(240,237,230,0.2)] focus:border-purple-400 outline-none pb-[1.5rem] text-[2rem] font-medium placeholder:opacity-20 transition-colors"
                    />
                  </div>

                  <div className="pt-[4rem]">
                    <button
                      type="submit"
                      disabled={status === "sending"}
                      className="group relative w-full py-[2.4rem] rounded-full bg-[#f0ede6] text-[#090909] text-[1.4rem] uppercase tracking-[0.4em] font-medium overflow-hidden transition-transform active:scale-[0.98]"
                    >
                      <div className="absolute inset-0 bg-purple-500 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[0.22, 1, 0.36, 1]" />
                      <span className="relative z-10 group-hover:text-white transition-colors flex items-center justify-center gap-[1rem]">
                        {status === "sending" ? "Initiating Handshake..." : "Request Access"}
                        {status !== "sending" && <ArrowUpRight className="w-[1.6rem] h-[1.6rem] -mt-[2px]" />}
                      </span>
                    </button>
                  </div>
                </form>
              )}
            </motion.div>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
