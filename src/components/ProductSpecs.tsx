"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import {
  Camera,
  Cpu,
  Feather,
  Eye,
  BatteryMedium,
  Scan,
  ArrowRight,
} from "lucide-react";
import { SPECS, PRODUCT } from "@/lib/config";
import { GlareCard } from "./GlareCard";

interface SpecCard {
  title: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  span?: string;
  accent?: string;
  tag?: string;
}

const cards: SpecCard[] = [
  {
    title: "Camera",
    value: SPECS.camera,
    sub: "4K HDR · on-device object recognition",
    icon: <Camera className="h-5 w-5 text-sky-300" />,
    span: "md:col-span-2",
    accent: "LIVE",
    tag: "4K HDR",
  },
  {
    title: "Neural Engine",
    value: SPECS.chip,
    sub: "On-device AI · zero cloud latency",
    icon: <Cpu className="h-5 w-5 text-violet-300" />,
    tag: "128 TOPS",
  },
  {
    title: "Featherweight",
    value: SPECS.weight,
    sub: "Titanium frame · all-day comfort",
    icon: <Feather className="h-5 w-5 text-emerald-300" />,
    span: "md:col-span-2",
    accent: "LIGHTER THAN A DECK",
    tag: "Ti-6Al-4V",
  },
  {
    title: "Spatial Display",
    value: SPECS.display,
    sub: "See-through AR · 3,000 nits",
    icon: <Eye className="h-5 w-5 text-amber-300" />,
    tag: "120 Hz",
  },
  {
    title: "All-day Power",
    value: SPECS.battery,
    sub: "24 hr with charging case",
    icon: <BatteryMedium className="h-5 w-5 text-rose-300" />,
    span: "md:col-span-3",
    accent: "FAST CHARGE",
    tag: "USB-C · Wireless",
  },
];

function SpecCard({ card, index }: { card: SpecCard; index: number }) {
  return (
    <GlareCard className={card.span || ""} delay={index * 0.1}>
      <div className="relative flex flex-col space-y-4 p-6">
        <div className="flex items-center justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06] ring-1 ring-white/10">
            {card.icon}
          </div>
          {card.accent && (
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/50">
              {card.accent}
            </span>
          )}
        </div>

        <div>
          <p className="text-[13px] font-medium text-foreground-2">
            {card.title}
          </p>
          <p className="mt-1 text-4xl font-semibold tracking-tight text-white">
            {card.value}
          </p>
          <p className="mt-1.5 text-sm text-foreground-2">{card.sub}</p>
        </div>

        <div className="mt-auto flex flex-wrap gap-1.5">
          {card.tag && (
            <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-white/60">
              {card.tag}
            </span>
          )}
        </div>
      </div>
    </GlareCard>
  );
}

export function ProductSpecs() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const fade = useTransform(scrollYProgress, [0, 0.25], [0.3, 1]);

  return (
    <section id="specs" ref={ref} data-testid="specs" className="relative">
      <div className="mx-auto max-w-6xl px-5 py-28">
        <motion.div style={{ y, opacity: fade }} className="mb-16 text-center">
          <div className="flex items-center justify-center gap-2 text-[13px] font-medium uppercase tracking-[0.14em] text-foreground-2">
            <Scan className="h-4 w-4 text-accent" />
            {PRODUCT.brand} · Specs
          </div>
          <h2 className="mt-5 display-2 text-gradient">
            Engineered to disappear
          </h2>
          <p className="mx-auto mt-5 max-w-2xl body-lg text-foreground-2">
            {PRODUCT.name} packs the power of a spatial computer into a frame
            you almost forget you&apos;re wearing.
          </p>
          <div className="mt-7 flex items-center justify-center gap-4">
            <span className="text-5xl font-bold tracking-tight text-gradient-blue">
              {PRODUCT.price}
            </span>
            <span className="text-sm text-foreground-3">
              · Free shipping · 30-day trial
            </span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {cards.map((card, i) => (
            <SpecCard key={card.title} card={card} index={i} />
          ))}
        </div>

        <motion.div style={{ y, opacity: fade }} className="mt-14 text-center">
          <a
            href="#"
            data-testid="preorder"
            className="btn-apple glow-pulse !py-3.5 !px-8 !text-base"
          >
            Pre-order {PRODUCT.name}
            <ArrowRight className="h-4 w-4" />
          </a>
          <p className="mt-4 text-sm text-foreground-3">
            Ships Q1 2027 · Limited first batch
          </p>
        </motion.div>
      </div>
    </section>
  );
}
