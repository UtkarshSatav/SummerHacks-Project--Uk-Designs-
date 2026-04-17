"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ delay: 1.5 }); // Wait for page transition

    // Intro Animation
    tl.fromTo(
      imageRef.current,
      { opacity: 0, scale: 1.1, filter: "blur(20px) brightness(0)" },
      {
        opacity: 1,
        scale: 1,
        filter: "blur(0px) brightness(1)",
        duration: 2,
        ease: "expo.out",
      }
    );

    tl.fromTo(
      textContainerRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 1.5, ease: "power3.out" },
      "-=1.5"
    );

  }, []);

  return (
    <section
      ref={containerRef}
      className="relative w-full h-screen min-h-[600px] flex items-center justify-center overflow-hidden bg-[#090909]"
    >
      <div
        ref={imageRef}
        className="relative w-full h-full flex items-center justify-center"
        style={{ opacity: 0 }}
      >
        <Image
          src="/img12.gif"
          alt="Ghost AI Hero"
          fill
          priority
          className="object-cover"
          unoptimized
        />

        <div className="absolute inset-0 bg-gradient-to-b from-[#090909]/60 via-transparent to-[#090909]/60 pointer-events-none" />

        <div
          ref={textContainerRef}
          className="absolute inset-x-0 top-[18rem] s:top-[12rem] flex flex-col items-center pointer-events-none px-[2rem] s:px-[4rem]"
        >

          {/* Massive Wordmark: Ultra-condensed with symmetrical staggered sizes */}
          <h1
            className="w-full flex items-center justify-center tracking-[-0.04em] uppercase"
            style={{
              fontFamily: "var(--font-impact-stack)",
              color: "#f0ede6",
              lineHeight: 1,
            }}
          >
            <span style={{ fontSize: "clamp(12rem, 28vw, 55rem)" }}>G</span>
            <span style={{ fontSize: "clamp(9.5rem, 22vw, 45.5rem)" }}>H</span>
            <span style={{ fontSize: "clamp(7.5rem, 16vw, 36.5rem)" }}>O</span>
            <span style={{ fontSize: "clamp(9.5rem, 22vw, 45.5rem)" }}>S</span>
            <span style={{ fontSize: "clamp(12rem, 28vw, 55rem)" }}>T</span>
          </h1>
        </div>
      </div>
    </section>
  );
}
