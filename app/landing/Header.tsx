"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Mount-kick: flip .is-ready on the header so CSS transitions fire in.
  useEffect(() => {
    const el = document.documentElement;
    const t = window.setTimeout(() => el.classList.add("is-ready"), 80);
    return () => {
      window.clearTimeout(t);
      el.classList.remove("is-ready");
    };
  }, []);

  return (
    <header className="sh fixed top-0 inset-x-0 z-[99] pt-[2rem] s:pt-0">
      <div className="site-max">
        {/* ── Desktop top row ─────────────────────────────────────── */}
        <div className="relative h-[6rem] pt-[0.5rem] hidden s:flex items-center justify-between">
          <Link href="/" aria-label="Home" className="relative block js-sh-item">
            <Image
              src="/ghost-2.png"
              alt=""
              width={120}
              height={48}
              priority
              style={{
                height: "3rem",
                width: "auto",
                objectFit: "contain",
                mixBlendMode: "screen",
                filter: "brightness(1.1)",
              }}
            />
          </Link>

          {/* Centered wordmark */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <Link
              href="/"
              className="uppercase js-sh-item block cursor-pointer hover:opacity-100 transition-opacity"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "1.2rem",
                letterSpacing: "0.35em",
                color: "#f0ede6",
                opacity: 0.85,
              }}
            >
              Ghost
            </Link>
          </div>

          {/* Right slot — MENU button */}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="js-sh-item inline-block hover:text-white transition-colors"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "1.2rem",
              letterSpacing: "0.4em",
              textTransform: "uppercase",
              color: "rgba(240,237,230,0.55)",
            }}
          >
            MENU
          </button>
        </div>

        {/* ── Mobile burger ───────────────────────────────────────── */}
        <button
          type="button"
          aria-label="Toggle menu"
          onClick={() => setMenuOpen((v) => !v)}
          className="relative block s:hidden mb-[1rem] w-full"
        >
          <div className="h-[6rem] relative border border-[rgba(240,237,230,0.25)] flex items-center px-[1.4rem]">
            <div className="burg relative h-px w-full">
              <div className="burg__line absolute inset-0 bg-[#f0ede6]" />
              <div className="burg__line absolute inset-0 bg-[#f0ede6]" />
              <div className="burg__line absolute inset-0 bg-[#f0ede6]" />
            </div>
          </div>
        </button>

        {/* ── Pillar row: word | line | word | line | word ────────── */}
        <div
          className="uppercase text-[1rem] s:text-[1.5rem] relative flex items-center justify-between gap-x-[1rem]"
          style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.04em" }}
        >
          <span className="overflow-hidden inline-block">
            <div className="js-slide">Discover</div>
          </span>
          <hr className="border-current flex-1 origin-right js-line opacity-60" />
          <span className="overflow-hidden inline-block">
            <div className="js-slide">Manage</div>
          </span>
          <hr className="border-current flex-1 origin-left js-line opacity-60" />
          <span className="overflow-hidden inline-block">
            <div className="js-slide">Automate</div>
          </span>
        </div>
      </div>

      {/* Full-screen Overlay Menu */}
      <AnimatePresence>
        {menuOpen && <FullScreenMenu onClose={() => setMenuOpen(false)} />}
      </AnimatePresence>
    </header>
  );
}

function FullScreenMenu({ onClose }: { onClose: () => void }) {
  const links = [
    { label: "Home", href: "/" },
    { label: "Features", href: "/features" },
    { label: "Pricing", href: "/pricing" },
    { label: "Manifesto", href: "/manifesto" },
    { label: "Contact", href: "/contact" },
    { label: "Login / Sign Up", href: "/login" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[999] bg-[#070707] flex flex-col px-[2rem] py-[4rem] s:p-[8rem]"
    >
      {/* Abstract Background Glow inside menu */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80rem] h-[80rem] bg-purple-900/10 blur-[15rem] rounded-full pointer-events-none" />

      {/* Menu Header */}
      <div className="relative z-10 flex justify-between items-center mb-[8rem] s:mb-[12rem]">
        <Link href="/" onClick={onClose} className="block text-[#f0ede6] opacity-80 uppercase font-mono text-[1.2rem] tracking-[0.3em]">
          GHOST
        </Link>
        <button
          onClick={onClose}
          className="w-[5rem] h-[5rem] rounded-full border border-[rgba(240,237,230,0.15)] flex items-center justify-center text-[#f0ede6] hover:bg-[#f0ede6] hover:text-[#090909] transition-all duration-300"
          aria-label="Close menu"
        >
          <X className="w-[2rem] h-[2rem]" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="relative z-10 flex-1 flex flex-col justify-center gap-[2rem] s:gap-[4rem]">
        {links.map((link, i) => (
          <div key={link.label} className="overflow-hidden">
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 + i * 0.05 }}
            >
              <Link
                href={link.href}
                onClick={onClose}
                className="group relative inline-block text-[4.5rem] s:text-[10rem] font-disp font-light leading-none text-[#f0ede6]/40 hover:text-[#f0ede6] transition-colors duration-500"
              >
                {link.label}
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0 h-[2px] s:h-[4px] bg-purple-500 group-hover:w-full transition-all duration-700 ease-[0.22,1,0.36,1]" />
              </Link>
            </motion.div>
          </div>
        ))}
      </nav>

      {/* Menu Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="relative z-10 mt-auto pt-[4rem] border-t border-[rgba(240,237,230,0.1)] flex justify-between items-center text-[1rem] s:text-[1.2rem] font-mono tracking-[0.2em] uppercase opacity-40"
      >
        <span>© 2026 GHOST AI</span>
        <span>Ghost acts.</span>
      </motion.div>
    </motion.div>
  );
}
