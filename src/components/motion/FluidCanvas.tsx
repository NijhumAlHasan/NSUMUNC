"use client";

import { useEffect, useRef } from "react";

/**
 * Subtle ambient background canvas in Navy / UN-Blue / Gold.
 * Cursor-following glow splats removed so the cursor has zero glow.
 */
export default function FluidCanvas({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const ambientOrbs = [
      { x: width * 0.22, y: height * 0.3, vx: 0.35, vy: 0.22, r: Math.max(width, height) * 0.26, isGold: false },
      { x: width * 0.78, y: height * 0.68, vx: -0.3, vy: -0.22, r: Math.max(width, height) * 0.24, isGold: true },
    ];

    const onResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };

    window.addEventListener("resize", onResize);

    let isVisible = true;
    const observer = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0]?.isIntersecting ?? false;
      },
      { threshold: 0.05 }
    );
    observer.observe(canvas);

    const onVisibilityChange = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    let rafId = 0;
    const render = () => {
      if (!isVisible) {
        // Pause loop while offscreen or tab hidden to save mobile battery
        rafId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      for (const orb of ambientOrbs) {
        if (!prefersReduced) {
          orb.x += orb.vx;
          orb.y += orb.vy;
          if (orb.x < orb.r * 0.2 || orb.x > width - orb.r * 0.2) orb.vx *= -1;
          if (orb.y < orb.r * 0.2 || orb.y > height - orb.r * 0.2) orb.vy *= -1;
        }

        const grad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r);
        if (orb.isGold) {
          grad.addColorStop(0, "rgba(251, 191, 36, 0.07)");
          grad.addColorStop(0.5, "rgba(212, 160, 23, 0.03)");
          grad.addColorStop(1, "rgba(3, 6, 15, 0)");
        } else {
          grad.addColorStop(0, "rgba(56, 189, 248, 0.08)");
          grad.addColorStop(0.5, "rgba(14, 165, 233, 0.03)");
          grad.addColorStop(1, "rgba(3, 6, 15, 0)");
        }
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2);
        ctx.fill();
      }

      if (!prefersReduced) {
        rafId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 w-full h-full ${className}`}
    />
  );
}
