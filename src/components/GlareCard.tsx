"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useMotionTemplate } from "motion/react";

/**
 * Premium glossy glass card (Apple / Linear-style):
 *  - frosted glass: bg-white/5, backdrop-blur-3xl, border-white/10
 *  - cursor-tracked glare (a radial sheen that follows the pointer) +
 *    an edge highlight that mirrors the pointer position
 *  - the whole card is a motion.div so the parent can stagger its reveal
 */
export function GlareCard({
  className = "",
  children,
  delay = 0,
}: {
  className?: string;
  children: React.ReactNode;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 160, damping: 20, mass: 0.4 });
  const springY = useSpring(mouseY, { stiffness: 160, damping: 20, mass: 0.4 });

  // Radial glare that follows the cursor.
  const glare = useMotionTemplate`radial-gradient(140px circle at ${springX}px ${springY}px, rgba(255,255,255,0.16), transparent 70%)`;
  // Edge highlight drawn around the cursor for a "light catches the glass" feel.
  const glow = useMotionTemplate`radial-gradient(240px circle at ${springX}px ${springY}px, rgba(255,255,255,0.1), transparent 70%)`;

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-3xl ${className}`}
    >
      {/* Cursor edge glow */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: glow }}
      />
      {/* Cursor radial glare (the "sheen") */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: glare }}
      />
      {/* Ambient diagonal sheen — always-on gloss so cards never read flat */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_30%,rgba(255,255,255,0.07)_45%,rgba(255,255,255,0.02)_55%,transparent_70%)]"
      />
      {/* top highlight line */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      {/* bottom soft inner edge */}
      <div className="pointer-events-none absolute inset-x-4 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="relative">{children}</div>
    </motion.div>
  );
}
