"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

/**
 * Two-layer intro veil: a black plate slides up first, revealing a white
 * plate underneath which in turn slides up to expose the page.
 */
export function PageTransition() {
  const [done, setDone] = useState(false);
  const blackRef = useRef<HTMLDivElement>(null);
  const whiteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    const tl = gsap.timeline({
      defaults: { ease: "expo.inOut" },
      onComplete: () => {
        document.body.style.overflow = "";
        setDone(true);
      },
    });

    tl.to(blackRef.current, { yPercent: -100, duration: 1.2 }, 0.9)
      .to(whiteRef.current, { yPercent: -100, duration: 1.3 }, 1.25);

    return () => {
      tl.kill();
      document.body.style.overflow = "";
    };
  }, []);

  if (done) return null;

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      <div
        ref={whiteRef}
        className="absolute inset-0"
        style={{ background: "#f0ede6" }}
      />
      <div
        ref={blackRef}
        className="absolute inset-0 z-[2]"
        style={{ background: "#090909" }}
      />
    </div>
  );
}
