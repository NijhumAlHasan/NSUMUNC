"use client";
import { useState, useMemo } from "react";
import Image from "next/image";
import type { DbGalleryItem } from "@/lib/db";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import CardSpotlight from "@/components/motion/CardSpotlight";
import GalleryLightbox from "@/components/motion/GalleryLightbox";

const catColor: Record<string, { text: string; border: string }> = {
  Conference:  { text: "var(--un-blue-bright)", border: "rgba(56,189,248,0.35)" },
  Achievement: { text: "var(--gold-bright)",    border: "rgba(251,191,36,0.35)" },
  Recruitment: { text: "var(--text-base)",      border: "rgba(255,255,255,0.22)" },
  Celebration: { text: "var(--un-blue-bright)", border: "rgba(56,189,248,0.30)" },
};

export default function GalleryClientView({
  gallery,
  isAdmin = false,
}: {
  gallery: DbGalleryItem[];
  isAdmin?: boolean;
}) {
  const [filter, setFilter] = useState("All");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const categories = useMemo(() => {
    const set = new Set<string>();
    gallery.forEach((g) => {
      if (g.category) set.add(g.category);
    });
    return ["All", ...Array.from(set)];
  }, [gallery]);

  const filteredItems = useMemo(() => {
    if (filter === "All") return gallery;
    return gallery.filter((g) => g.category.toLowerCase() === filter.toLowerCase());
  }, [gallery, filter]);

  const currentLightboxItem = lightboxIndex !== null ? filteredItems[lightboxIndex] ?? null : null;

  const handlePrev = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev! > 0 ? prev! - 1 : filteredItems.length - 1));
  };

  const handleNext = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev! < filteredItems.length - 1 ? prev! + 1 : 0));
  };

  return (
    <>
      {/* Category filter tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
        {categories.map((cat) => {
          const count =
            cat === "All"
              ? gallery.length
              : gallery.filter((g) => g.category.toLowerCase() === cat.toLowerCase()).length;
          const isActive = filter === cat;
          return (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`filter-pill flex items-center gap-2 ${isActive ? "active" : ""}`}
            >
              <span>{cat}</span>
              <span
                className="text-[10px] px-1.5 py-0.2 rounded-full font-bold"
                style={{
                  background: isActive ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.1)",
                  color: isActive ? "white" : "var(--text-muted)",
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Gallery columns */}
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
        {filteredItems.map((item, i) => {
          const cc = catColor[item.category] ?? catColor.Recruitment;
          const ratio = i % 4 === 0 ? "1/1" : i % 4 === 1 ? "4/5" : i % 4 === 2 ? "3/2" : "4/3";
          const idx = String(i + 1).padStart(3, "0");

          return (
            <ScrollReveal key={item.id ?? i} delay={(i % 3) * 75} className="break-inside-avoid">
              <CardSpotlight
                glowColor={
                  item.category === "Achievement"
                    ? "rgba(251, 191, 36, 0.22)"
                    : "rgba(14, 165, 233, 0.22)"
                }
                className="rounded-2xl border border-white/15 card-hover group cursor-pointer"
              >
                <div
                  onClick={() => setLightboxIndex(i)}
                  className="relative w-full overflow-hidden"
                  style={{ aspectRatio: ratio }}
                >
                  <Image
                    src={item.src}
                    alt={item.caption}
                    fill
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  {/* Subtle top badge */}
                  <div className="absolute top-3 left-3 z-20">
                    <span
                      className="badge glass-dark"
                      style={{ color: cc.text, borderColor: cc.border }}
                    >
                      /{idx} · {item.category}
                    </span>
                  </div>

                  {/* Expand icon on hover */}
                  <div className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full glass border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs text-white">⤢</span>
                  </div>
                </div>

                <div
                  onClick={() => setLightboxIndex(i)}
                  className="p-4 sm:p-5 relative z-20"
                  style={{ background: "var(--navy-surface)" }}
                >
                  <p className="text-sm sm:text-base font-bold leading-snug text-white group-hover:text-gold-bright transition-colors">
                    {item.caption}
                  </p>
                  <p className="text-xs font-medium mt-1" style={{ color: "var(--text-faint)" }}>
                    {item.category} · {item.year}
                  </p>
                </div>
              </CardSpotlight>
            </ScrollReveal>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <p className="text-center py-16 text-sm" style={{ color: "var(--text-faint)" }}>
          No photos found in this category.
        </p>
      )}

      {/* Lightbox modal */}
      <GalleryLightbox
        item={currentLightboxItem}
        onClose={() => setLightboxIndex(null)}
        onPrev={filteredItems.length > 1 ? handlePrev : undefined}
        onNext={filteredItems.length > 1 ? handleNext : undefined}
      />
    </>
  );
}
