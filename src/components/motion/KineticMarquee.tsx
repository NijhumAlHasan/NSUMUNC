"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

/**
 * Striver Digital-inspired scroll-velocity kinetic marquee.
 */
export function KineticMarquee({
  items = [
    "NSU MODEL UN CLUB",
    "DIPLOMACY AT ITS BEST",
    "SHAPE THE RESURGENCE",
    "NSUIMUN BANGLADESH",
    "NORTH SOUTH UNIVERSITY",
  ],
  speed = 0.55,
}: {
  items?: string[];
  speed?: number;
}) {
  const trackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let offset = 0;
    let velocityBoost = 0;
    let direction = -1;
    let lastScrollY = window.scrollY;

    const onScroll = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastScrollY;
      lastScrollY = currentY;
      if (Math.abs(delta) > 0) {
        direction = delta > 0 ? -1 : 1;
        velocityBoost = Math.min(Math.abs(delta) * 0.14, 4);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    let rafId = 0;
    const step = () => {
      velocityBoost *= 0.92;
      offset += direction * (speed + velocityBoost);

      const halfWidth = track.scrollWidth / 2;
      if (halfWidth > 0) {
        if (offset <= -halfWidth) offset += halfWidth;
        if (offset >= 0) offset -= halfWidth;
      }

      track.style.transform = `translate3d(${offset}px, 0, 0)`;
      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
    };
  }, [speed]);

  const repeated = [...items, ...items, ...items, ...items];

  return (
    <div
      className="relative overflow-hidden py-5 border-y select-none"
      style={{
        background: "rgba(7, 13, 29, 0.94)",
        borderColor: "var(--border-medium)",
      }}
    >
      <div
        ref={trackRef}
        className="flex items-center whitespace-nowrap will-change-transform gap-8"
      >
        {repeated.map((text, idx) => {
          const isAccent = idx % 2 === 1;
          return (
            <div key={idx} className="flex items-center gap-8">
              <span
                className={`text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight uppercase ${
                  isAccent ? "gradient-text" : "text-white"
                }`}
              >
                {text}
              </span>
              <span
                className="text-xl sm:text-2xl"
                style={{ color: isAccent ? "var(--gold-bright)" : "var(--un-blue-bright)" }}
              >
                ✦
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Striver Digital-inspired rotating circular SVG text badge.
 * Carefully sized circumference (r=56, circumference=352px) so text never overlaps around the ring.
 */
export function CircularStamp({
  text = "NSUMUNC • DIPLOMACY AT ITS BEST • ",
  href = "/events",
  size = 144,
}: {
  text?: string;
  href?: string;
  size?: number;
}) {
  return (
    <Link
      href={href}
      aria-label="Explore NSUMUNC Events"
      className="group relative inline-flex items-center justify-center rounded-full glass-blue transition-transform duration-300 hover:scale-105 flex-shrink-0"
      style={{ width: size, height: size, border: "1px solid rgba(56, 189, 248, 0.35)" }}
    >
      <svg
        viewBox="0 0 140 140"
        className="w-full h-full p-2 animate-rotate-slow"
      >
        <defs>
          <path
            id="nsumunc-circle-path"
            d="M 70, 70 m -56, 0 a 56,56 0 1,1 112,0 a 56,56 0 1,1 -112,0"
          />
        </defs>
        <text
          fill="var(--text-base)"
          fontSize="8.5"
          fontWeight="700"
          letterSpacing="2.2px"
        >
          <textPath href="#nsumunc-circle-path" startOffset="2%">
            {text}
          </textPath>
        </text>
      </svg>

      {/* Center diagonal arrow button */}
      <span
        className="striver-arrow absolute w-11 h-11 rounded-full flex items-center justify-center shadow-lg"
        style={{
          background: "linear-gradient(135deg, var(--un-blue), var(--gold))",
          color: "var(--navy)",
        }}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.4} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H8M17 7V16" />
        </svg>
      </span>
    </Link>
  );
}
