"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { ScanFace, Bot, Eye, Compass } from "lucide-react";

const steps = [
  {
    icon: <Eye className="h-5 w-5 text-sky-300" />,
    title: "See through a new lens",
    body: "A translucent Micro-OLED display paints information into your field of view at 3,000 nits — pinned to the real world, never floating in a void.",
  },
  {
    icon: <ScanFace className="h-5 w-5 text-violet-300" />,
    title: "The world becomes searchable",
    body: "Point at anything and the on-device Neural Engine recognizes it instantly — objects, landmarks, people, text — then translates and explains in real time.",
  },
  {
    icon: <Bot className="h-5 w-5 text-emerald-300" />,
    title: "An assistant that sees with you",
    body: "Glance AI shares your view. Whisper a question and it answers about exactly what you're looking at — private, on-device, with 12 ms latency.",
  },
  {
    icon: <Compass className="h-5 w-5 text-amber-300" />,
    title: "Guided by spatial context",
    body: "A 3D world map anchors directions, notes, and calendar items to your surroundings, so information lives where you need it.",
  },
];

export function Experience() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section id="experience" ref={ref} className="relative border-t border-white/[0.06]">
      <div className="mx-auto max-w-6xl px-5 py-28">
        <div className="mb-16 text-center">
          <div className="flex items-center justify-center gap-2 text-[13px] font-medium uppercase tracking-[0.14em] text-foreground-2">
            <ScanFace className="h-4 w-4 text-accent" />
            The Experience
          </div>
          <h2 className="mt-5 display-2 text-gradient">
            A new way to see what&apos;s around you
          </h2>
        </div>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              className="glass-soft group relative overflow-hidden rounded-3xl p-6 transition-transform duration-300 hover:-translate-y-1"
              style={{ y }}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06] ring-1 ring-white/10">
                  {s.icon}
                </div>
                <span className="text-xs font-medium tabular-nums text-white/25">
                  0{i + 1}
                </span>
              </div>
              <h3 className="text-lg font-semibold tracking-tight">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground-2">
                {s.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
