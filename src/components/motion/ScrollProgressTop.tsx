"use client";
import { useEffect, useState } from "react";

export default function ScrollProgressTop() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentProgress = (window.scrollY / totalHeight) * 100;
        setProgress(Math.min(100, Math.max(0, currentProgress)));
      }
      setVisible(window.scrollY > 250);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!visible) return null;

  const radius = 17;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Back to top"
      className="fixed z-40 w-11 h-11 rounded-full glass border border-white/20 flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 hover:border-un-blue-bright group animate-fade-in-up"
      style={{
        bottom: "calc(1.25rem + env(safe-area-inset-bottom, 0px))",
        left: "calc(1rem + env(safe-area-inset-left, 0px))",
        background: "rgba(3,6,15,0.88)",
      }}
    >
      <svg className="w-10 h-10 -rotate-90 transform" viewBox="0 0 40 40">
        <circle
          cx="20"
          cy="20"
          r={radius}
          stroke="rgba(255, 255, 255, 0.12)"
          strokeWidth="2.5"
          fill="transparent"
        />
        <circle
          cx="20"
          cy="20"
          r={radius}
          stroke="url(#progress-gradient)"
          strokeWidth="2.5"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-150"
        />
        <defs>
          <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--un-blue-bright)" />
            <stop offset="100%" stopColor="var(--gold-bright)" />
          </linearGradient>
        </defs>
      </svg>
      <span className="absolute text-xs text-white/80 group-hover:text-white group-hover:-translate-y-0.5 transition-all">
        ↑
      </span>
    </button>
  );
}
