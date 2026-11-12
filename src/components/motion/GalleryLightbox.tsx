"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import type { DbGalleryItem } from "@/lib/db";

export default function GalleryLightbox({
  item,
  onClose,
  onPrev,
  onNext,
}: {
  item: DbGalleryItem | null;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}) {
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (!item) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && onPrev) onPrev();
      if (e.key === "ArrowRight" && onNext) onNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [item, onClose, onPrev, onNext]);

  if (!item) return null;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > 40) {
      if (diff > 0 && onPrev) {
        onPrev();
      } else if (diff < 0 && onNext) {
        onNext();
      }
    }
    touchStartX.current = null;
  };

  return (
    <div
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-8 animate-fade-in"
      style={{
        background: "rgba(3, 6, 15, 0.96)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
      }}
    >
      {/* Close button with safe-area top offset on mobile */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 w-11 h-11 rounded-full glass border border-white/20 flex items-center justify-center text-white text-lg hover:border-gold-bright transition-all active:scale-90"
        aria-label="Close photo"
      >
        ✕
      </button>

      {/* Prev / Next buttons */}
      {onPrev && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full glass border border-white/20 flex items-center justify-center text-white text-xl hover:border-un-blue-bright transition-all"
          aria-label="Previous photo"
        >
          ‹
        </button>
      )}
      {onNext && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full glass border border-white/20 flex items-center justify-center text-white text-xl hover:border-un-blue-bright transition-all"
          aria-label="Next photo"
        >
          ›
        </button>
      )}

      {/* Main card */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-5xl w-full max-h-[90vh] flex flex-col rounded-3xl overflow-hidden glass border border-white/20 shadow-2xl animate-fade-in-up"
      >
        <div className="relative w-full h-[62vh] sm:h-[72vh] bg-black/60">
          <Image
            src={item.src}
            alt={item.caption}
            fill
            className="object-contain"
            sizes="(max-width: 1280px) 100vw, 1200px"
            priority
          />
        </div>
        <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-navy-surface border-t border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="badge glass-blue" style={{ color: "var(--un-blue-bright)" }}>
                {item.category}
              </span>
              <span className="text-xs font-mono font-bold" style={{ color: "var(--gold-bright)" }}>
                {item.year}
              </span>
            </div>
            <h3 className="text-white font-extrabold text-base sm:text-xl leading-snug">
              {item.caption}
            </h3>
          </div>
          <span className="text-xs font-mono text-white/50 hidden sm:inline">
            (Press Esc or click outside to close)
          </span>
        </div>
      </div>
    </div>
  );
}
