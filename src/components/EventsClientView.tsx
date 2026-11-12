"use client";
import { useState, useMemo } from "react";
import Image from "next/image";
import type { DbEvent } from "@/lib/db";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import CardSpotlight from "@/components/motion/CardSpotlight";

const typeBadge: Record<string, { bg: string; color: string; label: string }> = {
  conference:  { bg: "glass-blue", color: "var(--un-blue-bright)", label: "Conference" },
  delegation:  { bg: "glass",      color: "var(--text-base)",      label: "Delegation" },
  recruitment: { bg: "glass-gold", color: "var(--gold-bright)",    label: "Recruitment" },
};

export default function EventsClientView({
  events,
  isAdmin = false,
}: {
  events: DbEvent[];
  isAdmin?: boolean;
}) {
  const [filter, setFilter] = useState("all");

  const categories = [
    { id: "all", label: "All Milestones" },
    { id: "conference", label: "Conferences" },
    { id: "delegation", label: "Delegations" },
    { id: "recruitment", label: "Recruitments" },
  ];

  const filteredEvents = useMemo(() => {
    if (filter === "all") return events;
    return events.filter((e) => e.type?.toLowerCase() === filter.toLowerCase());
  }, [events, filter]);

  return (
    <>
      {/* Category filter pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
        {categories.map((cat) => {
          const count =
            cat.id === "all"
              ? events.length
              : events.filter((e) => e.type?.toLowerCase() === cat.id).length;
          const isActive = filter === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={`filter-pill flex items-center gap-2 ${isActive ? "active" : ""}`}
            >
              <span>{cat.label}</span>
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

      {/* Events list */}
      <div className="space-y-7">
        {filteredEvents.map((event, i) => {
          const badge = typeBadge[event.type] ?? typeBadge.delegation;
          const idx = String(i + 1).padStart(3, "0");

          return (
            <ScrollReveal key={event.id ?? i} delay={i * 70}>
              <CardSpotlight
                glowColor={
                  event.type === "recruitment"
                    ? "rgba(251, 191, 36, 0.22)"
                    : "rgba(14, 165, 233, 0.22)"
                }
                className="rounded-3xl border border-white/15 card-hover group"
              >
                <div className="flex flex-col md:flex-row glass rounded-[inherit]">
                  {/* Image */}
                  <div
                    className="relative w-full md:w-72 lg:w-80 flex-shrink-0 overflow-hidden"
                    style={{ minHeight: "230px" }}
                  >
                    <Image
                      src={event.image}
                      alt={event.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      sizes="(max-width: 768px) 100vw, 320px"
                    />
                    <div className="absolute top-3.5 left-3.5 z-20">
                      <span className={`badge ${badge.bg} border border-white/15`} style={{ color: badge.color }}>
                        {badge.label}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 sm:p-8 flex flex-col justify-center flex-1 relative z-20">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <span
                        className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full glass-blue"
                        style={{ color: "var(--un-blue-bright)" }}
                      >
                        /{idx}
                      </span>
                      <span className="text-2xl font-extrabold gradient-text-gold">{event.year}</span>
                      <span className="badge glass border border-white/15" style={{ color: "var(--text-base)" }}>
                        ✓ {event.status}
                      </span>
                    </div>
                    <h2 className="text-white font-extrabold text-xl sm:text-2xl md:text-3xl mb-1.5 group-hover:text-gold-bright transition-colors">
                      {event.title}
                    </h2>
                    <p className="italic text-sm sm:text-base font-semibold mb-1.5" style={{ color: "var(--gold-bright)" }}>
                      &ldquo;{event.theme}&rdquo;
                    </p>
                    <p className="text-xs sm:text-sm font-medium mb-3" style={{ color: "var(--text-faint)" }}>
                      {event.date_label}
                    </p>
                    <p className="text-sm sm:text-base leading-relaxed mb-5" style={{ color: "var(--text-muted)" }}>
                      {event.description}
                    </p>

                    {event.delegates && (
                      <div className="flex flex-wrap gap-3">
                        {[
                          { val: event.delegates, lbl: "Delegates" },
                          { val: event.committees ? String(event.committees) : "—", lbl: "Committees" },
                          { val: event.days ? String(event.days) : "—", lbl: "Days" },
                        ].map((s, j) => (
                          <div key={j} className="glass-blue rounded-xl px-4 py-2 text-center border border-white/15 min-w-[80px]">
                            <div className="text-base font-extrabold text-white">{s.val}</div>
                            <div className="text-[11px] font-medium" style={{ color: "var(--text-muted)" }}>
                              {s.lbl}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardSpotlight>
            </ScrollReveal>
          );
        })}
      </div>

      {filteredEvents.length === 0 && (
        <p className="text-center py-16 text-sm" style={{ color: "var(--text-faint)" }}>
          No milestones found in this category.
        </p>
      )}
    </>
  );
}
