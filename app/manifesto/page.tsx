"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { SmoothScroll } from "../landing/SmoothScroll";
import { PageTransition } from "../landing/PageTransition";
import { Header } from "../landing/Header";
import { Footer } from "../landing/FinalCTA";
import { useRef } from "react";

export default function ManifestoPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  return (
    <>
      <SmoothScroll />
      <PageTransition />
      <Header />
      <main ref={containerRef} className="relative bg-[#050505] min-h-screen overflow-hidden">

        {/* Sweeping Giant Abstract Gradient */}
        <motion.div
          style={{ y: bgY }}
          className="absolute top-[-20%] left-[-10%] w-[120vw] h-[150vh] opacity-20 pointer-events-none mix-blend-screen"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-700 via-transparent to-transparent blur-[15rem] rounded-full scale-y-150 rotate-12" />
          <div className="absolute top-[40%] right-[-10%] w-[80vw] h-[80vh] bg-gradient-to-tl from-purple-500/40 to-transparent blur-[20rem] rounded-full" />
        </motion.div>

        <div className="relative pt-[25rem] pb-[15rem] site-max z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mb-[15rem]"
          >
            <span className="block text-[1.4rem] uppercase tracking-[0.6em] mb-[6rem] font-mono opacity-50">
              The Doctrine
            </span>
            <h1 className="text-[6rem] s:text-[14rem] font-disp font-light leading-[0.85] tracking-tight">
              Scale without <br />
              <span className="italic">concession.</span>
            </h1>
          </motion.div>

          <div className="max-w-[90rem] mx-auto space-y-[12rem] s:space-y-[18rem] text-[2.2rem] s:text-[3.2rem] leading-relaxed font-light text-[#f0ede6]/80 text-justify s:text-left">

            <Paragraph>
              For a decade, the only accepted path for a successful independent operator to &quot;scale&quot; was to morph into an agency. Hire a project manager. Hire junior designers. Stop doing the craft, start managing the churn.
            </Paragraph>

            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-20%" }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="py-[6rem] pl-[4rem] s:pl-[8rem] border-l-[4px] border-purple-500 bg-gradient-to-r from-purple-500/5 to-transparent"
            >
              <p className="text-[3rem] s:text-[5rem] font-disp italic leading-[1.1] text-purple-100">
                &quot;We fundamentally reject this timeline. The solo operator is the most lethal, high-leverage entity on the internet.&quot;
              </p>
            </motion.div>

            <Paragraph>
              What holds solos back isn&apos;t lack of talent—it&apos;s the infrastructural burden. The endless ping-pong of emails. The lead qualification. The pricing negotiations based on imperfect data. The &quot;checking in&quot; messages that rot your soul.
            </Paragraph>

            <Paragraph>
              Ghost is the software equivalent of a ruthless, perfect Chief Operations Officer who never sleeps, never complains, and works entirely in the background. It observes your history, mimics your communication structure, and intercepts operational friction before you are ever forced to address it.
            </Paragraph>

            <Paragraph>
              Do not hire. Orchestrate. Stay in the craft. Build the ultimate personal monopoly.
            </Paragraph>

            {/* Signature Block */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 1, delay: 0.2 }}
              className="pt-[10rem] flex flex-col items-center text-center opacity-60 hover:opacity-100 transition-opacity duration-700"
            >
               <div className="w-[10rem] h-[10rem] relative mb-[4rem]">
                 <svg viewBox="0 0 100 100" className="w-full h-full stroke-purple-400 stroke-[2] fill-none stroke-dasharray-[300] stroke-dashoffset-[300] animate-[draw_4s_cubic-bezier(0.22,1,0.36,1)_forwards]">
                   <path d="M 20,80 C 20,40 40,20 80,20 C 60,60 40,80 80,80" />
                 </svg>
               </div>
               <span className="font-mono uppercase tracking-[0.4em] text-[1.4rem]">Ghost System 2026</span>
            </motion.div>

          </div>
        </div>
      </main>
      <Footer />
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes draw { to { stroke-dashoffset: 0; } }
      `}} />
    </>
  );
}

function Paragraph({ children }: { children: React.ReactNode }) {
  return (
    <motion.p
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.p>
  );
}
