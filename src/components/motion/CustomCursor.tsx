"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Clean, non-glowing follower cursor ring for desktop pointers.
 * No glow/box-shadow and no floating pill labels that overlap page text.
 */
export default function CustomCursor() {
  const ringRef = useRef<HTMLDivElement | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    if (!finePointer) return;
    setEnabled(true);

    const pos = { x: -100, y: -100 };
    const ring = { x: -100, y: -100 };

    const onMove = (e: MouseEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;

      const target = e.target as HTMLElement | null;
      if (!target) return;
      const interactiveEl = target.closest(
        "a, button, [role='button'], input, select, textarea, [data-cursor-text]"
      );
      setHovered(Boolean(interactiveEl));
    };

    let rafId = 0;
    const animate = () => {
      ring.x += (pos.x - ring.x) * 0.22;
      ring.y += (pos.y - ring.y) * 0.22;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0)`;
      }
      rafId = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  if (!enabled) return null;

  const size = hovered ? 36 : 24;
  const offset = -size / 2;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      <div
        ref={ringRef}
        className="fixed top-0 left-0 rounded-full transition-[width,height,margin,border-color] duration-150 ease-out"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          marginLeft: `${offset}px`,
          marginTop: `${offset}px`,
          background: "transparent",
          border: hovered
            ? "1.5px solid var(--gold-bright)"
            : "1px solid rgba(196, 211, 242, 0.45)",
          boxShadow: "none",
        }}
      />
    </div>
  );
}
