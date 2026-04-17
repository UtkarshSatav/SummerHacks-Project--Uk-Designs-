"use client";

import { motion, Variants } from "framer-motion";

export function About() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
    },
  };

  return (
    <section id="about" className="relative min-h-[80vh] bg-[#090909] flex flex-col items-center justify-center py-[10rem] s:py-[15rem] overflow-hidden text-center">
      <div className="site-max w-full relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-10%" }}
          className="max-w-[130rem] mx-auto flex flex-col items-center"
        >
          {/* Label */}
          <motion.span
            variants={itemVariants}
            className="block text-[1.1rem] s:text-[1.3rem] uppercase tracking-[0.5em] mb-[4rem] font-mono opacity-30"
          >
            01 — The Mission
          </motion.span>

          {/* Heading: Solved overflow errors on narrow screens */}
          <motion.h3
            variants={itemVariants}
            className="text-[3rem] s:text-[clamp(4.5rem,8vw,8.5rem)] font-disp font-light leading-[1.05] mb-[8rem] px-[2rem] tracking-tight"
          >
            Built for the elite who choose <br className="hidden s:block" />
            to do <span className="italic">everything</span> alone.
          </motion.h3>

          {/* Solution Block: Solved highlight visibility by using alpha instead of opacity */}
          <div className="max-w-[100rem] space-y-[6rem] px-[2rem]">
            <motion.p
              variants={itemVariants}
              className="text-[1.7rem] s:text-[2.8rem] leading-relaxed font-light text-[#f0ede6]/40"
            >
              Ghost is the invisible infrastructure for the modern soloist.
              We handle the discovery, orchestration, and engineering—so you can go back to being the one thing no AI can replicate: <span className="text-[#f0ede6] inline-block ml-[0.5rem]">The Artist.</span>
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col s:flex-row items-center justify-center gap-[2rem] s:gap-[2.5rem] pt-[4rem]"
            >
              <span className="font-mono text-[1rem] s:text-[1.1rem] uppercase tracking-[0.3em] opacity-30">Autonomous Orchestration</span>
              <span className="font-mono text-[1rem] s:text-[1.1rem] uppercase tracking-[0.3em] opacity-30">Ghost AI</span>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Subtle Background Detail (Original) */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[70rem] h-[70rem] border border-[#f0ede6]/[0.02] rounded-full pointer-events-none" />
    </section>
  );
}
