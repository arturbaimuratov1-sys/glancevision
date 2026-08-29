"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";

const palette = [
  { name: "Titanium", hex: "#3a3a3f" },
  { name: "Onyx", hex: "#111114" },
  { name: "Iridescent", hex: "#7a5cff" },
  { name: "Glacier", hex: "#2997ff" },
];

export function Design() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [30, -30]);

  return (
    <section id="design" ref={ref} className="relative border-t border-white/[0.06]">
      <div className="mx-auto max-w-6xl px-5 py-28">
        <motion.div style={{ y }} className="max-w-2xl">
          <div className="mb-5 text-[13px] font-medium uppercase tracking-[0.14em] text-foreground-2">
            Design Language
          </div>
          <h2 className="display-2 text-gradient">
            A few grams of timeless design
          </h2>
          <p className="mt-5 body-lg text-foreground-2">
            {`A classic silhouette that turns heads for the right reasons. The
            titanium frame is machined to a sub-millimeter tolerance, finished
            in a whisper-quiet matte that resists fingerprints and glare.`}
          </p>

          <div className="mt-10 flex items-center gap-4">
            {palette.map((c) => (
              <div key={c.name} className="flex flex-col items-center gap-2">
                <span
                  className="h-9 w-9 rounded-full ring-1 ring-white/15"
                  style={{ background: c.hex }}
                />
                <span className="text-xs text-foreground-3">{c.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
