import { Eye } from "lucide-react";
import { PRODUCT } from "@/lib/config";

const product = ["Glance Vision One", "Specs", "Accessories", "Compare"];
const company = ["About", "Careers", "Press", "Privacy"];

export function Footer() {
  return (
    <footer className="relative border-t border-white/10">
      <div className="glass-soft mx-auto max-w-6xl px-5 py-14">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-violet-500">
                <Eye className="h-4 w-4 text-white" />
              </span>
              <span className="text-[15px] font-semibold tracking-tight">
                {PRODUCT.brand}
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-foreground-3">
              {PRODUCT.name} — the world is your interface. Privacy-first,
              on-device AI, timeless design.
            </p>
          </div>

          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground-3">
              Product
            </h4>
            <nav className="mt-4 flex flex-col gap-2.5">
              {product.map((l) => (
                <a
                  key={l}
                  href="#specs"
                  className="text-sm text-foreground-2 transition-colors hover:text-white"
                >
                  {l}
                </a>
              ))}
            </nav>
          </div>

          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground-3">
              Company
            </h4>
            <nav className="mt-4 flex flex-col gap-2.5">
              {company.map((l) => (
                <a
                  key={l}
                  href="#"
                  className="text-sm text-foreground-2 transition-colors hover:text-white"
                >
                  {l}
                </a>
              ))}
            </nav>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 sm:flex-row">
          <p className="text-xs text-foreground-3">
            © 2027 {PRODUCT.brand}. All rights reserved.
          </p>
          <p className="text-xs text-foreground-3">Look classic. Think beyond.</p>
        </div>
      </div>
    </footer>
  );
}
