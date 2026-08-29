"use client";

import { useEffect, useState } from "react";
import { Eye, Menu, X } from "lucide-react";
import { NAV_LINKS, PRODUCT } from "@/lib/config";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Highlight the section currently in view (IntersectionObserver).
  useEffect(() => {
    const ids = NAV_LINKS.map((l) => l.href.slice(1));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(`#${entry.target.id}`);
        }
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "glass border-b border-white/[0.06]" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        {/* Brand */}
        <a href="#overview" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-violet-500 shadow-[0_0_18px_rgba(41,151,255,0.45)]">
            <Eye className="h-4 w-4 text-white" />
          </span>
          <span className="text-[15px] font-semibold tracking-tight">
            {PRODUCT.brand}
          </span>
        </a>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className={`rounded-full px-4 py-2 text-sm transition-colors ${
                active === l.href
                  ? "text-white"
                  : "text-foreground-2 hover:text-white"
              }`}
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <a
            href="#specs"
            data-testid="nav-preorder"
            className="btn-apple hidden !py-2 !px-4 !text-sm sm:inline-flex"
          >
            Pre-order
          </a>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full text-white md:hidden"
            aria-label="Toggle menu"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="glass-strong border-t border-white/[0.06] px-5 pb-5 pt-2 md:hidden">
          {NAV_LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-3 text-[15px] text-foreground-2 hover:text-white"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#specs"
            onClick={() => setOpen(false)}
            className="btn-apple mt-3 w-full justify-center"
          >
            Pre-order · {PRODUCT.price}
          </a>
        </div>
      )}
    </header>
  );
}
