"use client";

import React, { useEffect, useRef, useState } from "react";

/**
 * Scroll-triggered reveal wrapper.
 */
export function ScrollReveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        transitionDelay: `${delay}ms`,
        opacity: visible ? 1 : 0,
        transform: visible ? "translate3d(0, 0, 0)" : "translate3d(0, 28px, 0)",
      }}
      className={`transition-all duration-700 ease-out will-change-transform ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * Striver Digital double-heading component.
 */
export function SectionHeading({
  tag,
  title,
  accent,
  subtitle,
  align = "center",
}: {
  tag: string;
  title: string;
  accent?: string;
  subtitle?: string;
  align?: "left" | "center";
}) {
  return (
    <ScrollReveal className={align === "center" ? "text-center max-w-3xl mx-auto" : "text-left"}>
      <div className="mb-3">
        <span className="striver-tag">{tag}</span>
      </div>
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-[1.12]">
        {title}{" "}
        {accent && <span className="gradient-text">{accent}</span>}
      </h2>
      {subtitle && (
        <p
          className="mt-4 text-base sm:text-lg leading-relaxed font-normal"
          style={{ color: "var(--text-muted)" }}
        >
          {subtitle}
        </p>
      )}
    </ScrollReveal>
  );
}

/**
 * Striver Digital animated counter — clean stacked layout with zero overlapping watermark text.
 */
export function AnimatedCounter({
  value,
  label,
  index,
}: {
  value: string;
  label: string;
  index: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  const match = value.match(/^(\d+)(.*)$/);
  const targetNum = match ? parseInt(match[1], 10) : 0;
  const suffix = match ? match[2] : "";

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          obs.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!started || targetNum <= 0) return;
    const duration = 1400;
    const startTime = performance.now();

    let rafId = 0;
    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * targetNum));
      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [started, targetNum]);

  const idxLabel = String(index + 1).padStart(3, "0");

  return (
    <div
      ref={ref}
      className="group glass rounded-2xl p-4 sm:p-7 card-hover flex flex-col justify-between"
      style={{ borderColor: "var(--border-medium)" }}
    >
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <span className="text-[11px] sm:text-xs font-mono font-bold uppercase tracking-widest" style={{ color: "var(--gold-bright)" }}>
          /{idxLabel}
        </span>
        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full" style={{ background: "var(--un-blue-bright)" }} />
      </div>
      <div>
        <div className="text-2xl xs:text-3xl sm:text-5xl font-extrabold gradient-text mb-1 sm:mb-2 tracking-tight leading-none">
          {started ? `${count}${suffix}` : value}
        </div>
        <div className="text-xs sm:text-base font-medium leading-snug" style={{ color: "var(--text-base)" }}>
          {label}
        </div>
      </div>
    </div>
  );
}
