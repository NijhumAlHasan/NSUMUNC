"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export type ShowcaseItem = {
  index: string;
  year: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  tag: string;
  href?: string;
};

/**
 * Striver Digital-inspired numbered interactive hover-reveal showcase (wgl-showcase-2 / interactive-showcase).
 * High-contrast, readable typography with expandable detail and floating image preview.
 */
export default function InteractiveShowcase({ items }: { items: ShowcaseItem[] }) {
  const [activeIdx, setActiveIdx] = useState<number>(0);

  return (
    <div className="grid lg:grid-cols-12 gap-8 items-center">
      {/* Left: Numbered Interactive Accordion Rows (001, 002, 003, 004) */}
      <div className="lg:col-span-7 divide-y" style={{ borderColor: "var(--border-medium)" }}>
        {items.map((item, idx) => {
          const isActive = idx === activeIdx;
          return (
            <div
              key={idx}
              onMouseEnter={() => setActiveIdx(idx)}
              onClick={() => setActiveIdx(idx)}
              data-cursor-text="EXPLORE"
              className={`group cursor-pointer py-6 px-4 sm:px-6 rounded-2xl transition-all duration-300 ${
                isActive ? "glass-blue" : "hover:bg-white/[0.03]"
              }`}
              style={{
                borderColor: isActive ? "rgba(56, 189, 248, 0.32)" : "transparent",
              }}
            >
              <div className="flex items-start sm:items-center justify-between gap-4">
                <div className="flex items-baseline gap-4 sm:gap-6 min-w-0">
                  <span
                    className="font-mono text-sm sm:text-base font-bold tracking-widest flex-shrink-0"
                    style={{ color: isActive ? "var(--gold-bright)" : "var(--un-blue-bright)" }}
                  >
                    {item.index}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5 mb-1">
                      <span
                        className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full"
                        style={{
                          background: isActive ? "rgba(212, 160, 23, 0.18)" : "rgba(255,255,255,0.06)",
                          color: isActive ? "var(--gold-bright)" : "var(--text-faint)",
                        }}
                      >
                        {item.tag} · {item.year}
                      </span>
                    </div>
                    <h3
                      className={`text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight transition-transform duration-300 ${
                        isActive ? "text-white translate-x-1" : "text-white/90 group-hover:translate-x-1"
                      }`}
                    >
                      {item.title}
                    </h3>
                  </div>
                </div>

                <Link
                  href={item.href || "/events"}
                  aria-label={`View ${item.title}`}
                  className="striver-arrow flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center border transition-all"
                  style={{
                    background: isActive ? "var(--un-blue)" : "rgba(12, 20, 40, 0.85)",
                    borderColor: isActive ? "var(--un-blue-bright)" : "var(--border-medium)",
                    color: "var(--text-base)",
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H8M17 7V16" />
                  </svg>
                </Link>
              </div>

              {/* Expandable description + mobile inline image for high readability */}
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  isActive ? "max-h-[500px] opacity-100 mt-4" : "max-h-0 opacity-0 mt-0"
                }`}
              >
                <div className="pl-6 sm:pl-14 pr-2 space-y-2.5">
                  <p className="text-sm sm:text-base font-medium" style={{ color: "var(--gold-bright)" }}>
                    &ldquo;{item.subtitle}&rdquo;
                  </p>
                  <p className="text-sm sm:text-base leading-relaxed" style={{ color: "var(--text-muted)" }}>
                    {item.description}
                  </p>

                  {/* Mobile inline preview image (visible on mobile phones, hidden on desktop) */}
                  <div className="lg:hidden relative w-full h-44 rounded-xl overflow-hidden border border-white/15 mt-3 shadow-lg">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 400px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#03060f]/80 via-transparent to-transparent" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Right: Interactive Floating Preview Card (Desktop & Tablet) */}
      <div className="hidden lg:block lg:col-span-5">
        <div className="relative glass rounded-3xl overflow-hidden border border-white/15 shadow-2xl group">
          <div className="relative w-full" style={{ aspectRatio: "4/3" }}>
            {items.map((item, idx) => (
              <div
                key={idx}
                className={`absolute inset-0 transition-all duration-500 ${
                  idx === activeIdx ? "opacity-100 scale-100" : "opacity-0 scale-105 pointer-events-none"
                }`}
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 480px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#03060f] via-[#03060f]/45 to-transparent" />
              </div>
            ))}

            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span
                className="badge glass-gold"
                style={{ color: "var(--gold-bright)", borderColor: "rgba(251, 191, 36, 0.35)" }}
              >
                {items[activeIdx]?.index} · {items[activeIdx]?.tag}
              </span>
            </div>

            <div className="absolute bottom-5 left-5 right-5">
              <div className="text-xs font-mono uppercase tracking-widest mb-1" style={{ color: "var(--un-blue-bright)" }}>
                {items[activeIdx]?.year} — {items[activeIdx]?.subtitle}
              </div>
              <h4 className="text-xl sm:text-2xl font-bold text-white leading-snug">
                {items[activeIdx]?.title}
              </h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
