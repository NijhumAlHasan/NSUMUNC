import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { getSiteContent } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";
import FluidCanvas from "@/components/motion/FluidCanvas";
import MagneticButton from "@/components/motion/MagneticButton";
import { ScrollReveal, SectionHeading } from "@/components/motion/ScrollReveal";
import CardSpotlight from "@/components/motion/CardSpotlight";

export const instant = false;

const grads = [
  "from-sky-600 to-blue-800",
  "from-amber-600 to-yellow-800",
  "from-blue-700 to-indigo-900",
  "from-sky-500 to-amber-700",
  "from-amber-500 to-sky-700",
  "from-indigo-600 to-amber-600",
  "from-sky-700 to-indigo-700",
  "from-amber-700 to-sky-600",
];

export default async function TeamPage() {
  await connection();
  const { settings, team, achievements } = getSiteContent();
  const isAuthedAdmin = await isAdminAuthenticated();

  const secretariatMembers = team.filter(
    (m) => (m.body_type || "executive") === "executive" && m.is_active !== 0
  );
  const subEbMembers = team.filter((m) => m.body_type === "sub_eb" && m.is_active !== 0);

  return (
    <div className="pt-20">
      {/* Header */}
      <section className="relative py-24 px-4 mesh-bg agency-grid-bg overflow-hidden">
        <FluidCanvas />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="mb-3 animate-fade-in-down">
            <span className="striver-tag">{settings.team_header_tag}</span>
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-white mb-5 animate-fade-in-up tracking-tight leading-[1.08]">
            {settings.team_header_title} <span className="gradient-text">{settings.team_header_accent}</span>
          </h1>
          <p
            className="text-lg sm:text-xl max-w-2xl mx-auto animate-fade-in-up stagger-2 leading-relaxed"
            style={{ color: "var(--text-muted)" }}
          >
            {settings.team_header_subtitle}
          </p>
        </div>
      </section>

      {/* Secretariat grid */}
      <section className="py-20 px-4" style={{ background: "var(--navy-mid)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {secretariatMembers.map((m, i) => {
              const num = String(i + 1).padStart(3, "0");
              const grad = grads[i % grads.length];
              return (
                <ScrollReveal key={m.id ?? i} delay={i * 65}>
                  <CardSpotlight glowColor="rgba(14, 165, 233, 0.22)" className="rounded-2xl border border-white/15 card-hover group h-full">
                    <div className="glass overflow-hidden rounded-[inherit] h-full flex flex-col">
                      {m.image ? (
                        <div className="relative h-48 w-full overflow-hidden">
                          <Image
                            src={m.image}
                            alt={m.name !== "TBA" ? m.name : m.role}
                            fill
                            className="object-cover object-top group-hover:scale-105 transition-transform duration-700"
                          />
                          <span className="absolute top-3 left-3 font-mono text-xs font-bold px-2 py-0.5 rounded-full glass-dark text-white z-20">
                            /{num}
                          </span>
                        </div>
                      ) : (
                        <div className={`h-36 bg-gradient-to-br ${grad} flex items-center justify-center relative`}>
                          <span className="absolute top-3 left-3 font-mono text-xs font-bold text-white/80">
                            /{num}
                          </span>
                          <div className="w-16 h-16 rounded-full glass border border-white/25 flex items-center justify-center text-white text-2xl font-extrabold group-hover:scale-110 transition-transform">
                            {m.initial}
                          </div>
                        </div>
                      )}
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="text-white font-extrabold text-base sm:text-lg leading-tight mb-1 group-hover:text-gold-bright transition-colors">
                            {m.role}
                          </h3>
                          {m.name && m.name !== "TBA" && (
                            <p className="text-sm font-semibold mb-2" style={{ color: "var(--gold-bright)" }}>
                              {m.name}
                            </p>
                          )}
                          <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                            {m.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardSpotlight>
                </ScrollReveal>
              );
            })}
          </div>

          {/* Link to Sub-Executive Body */}
          <div className="mt-14 glass rounded-2xl p-6 sm:p-8 border border-white/15 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <span className="striver-tag text-[10px] mb-1 inline-block">wings &amp; operations</span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                Looking for the Sub-Executive Body?
              </h3>
              <p className="text-xs sm:text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                Explore the {subEbMembers.length} directors, deputies, and associates across our four operational wings.
              </p>
            </div>
            <Link
              href="/sub-executive-body"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs sm:text-sm border border-white/20 glass hover:border-un-blue transition-all whitespace-nowrap text-white"
            >
              <span>Explore Sub-Executive Body ({subEbMembers.length})</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      <div className="celestial-divider my-4" />

      {/* Award Winners */}
      <section className="py-20 px-4 agency-grid-bg">
        <div className="max-w-5xl mx-auto">
          <div className="mb-12">
            <SectionHeading
              tag={settings.team_awards_tag || "eastern mun 2026"}
              title={settings.team_awards_title || "Recent"}
              accent={settings.team_awards_accent || "Award Winners"}
              subtitle={settings.team_awards_subtitle}
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {achievements.map((a, i) => (
              <ScrollReveal key={a.id ?? i} delay={i * 100}>
                <div className="glass-gold rounded-2xl overflow-hidden card-hover border border-gold/25 group">
                  <div className="relative" style={{ aspectRatio: "1/1" }}>
                    <Image
                      src={a.image}
                      alt={a.name}
                      fill
                      className="object-cover object-top group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div className="p-6">
                    <div
                      className="badge glass mb-3"
                      style={{ color: "var(--gold-bright)", borderColor: "rgba(251,191,36,0.3)" }}
                    >
                      🏆 {a.conference}
                    </div>
                    <h3 className="text-white font-extrabold text-xl">{a.name}</h3>
                    <p className="font-semibold text-base mt-1" style={{ color: "var(--gold-bright)" }}>
                      {a.award}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Join CTA */}
      <section className="py-20 px-4" style={{ background: "var(--navy-mid)" }}>
        <ScrollReveal className="max-w-3xl mx-auto text-center glass rounded-3xl p-10 sm:p-12 border border-white/15">
          <span className="striver-tag mb-3">{settings.team_cta_tag}</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">{settings.team_cta_title}</h2>
          <p className="text-base sm:text-lg leading-relaxed mb-8" style={{ color: "var(--text-muted)" }}>
            {settings.team_cta_subtitle}
          </p>
          <MagneticButton>
            <Link
              href={settings.team_cta_btn_href || "/contact"}
              className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-white transition-all hover:brightness-110 shadow-lg"
              style={{ background: "var(--un-blue)", boxShadow: "0 8px 28px rgba(14,165,233,0.35)" }}
            >
              <span>{settings.team_cta_btn_label || "Reach Out to Us"}</span>
              <span className="striver-arrow">↗</span>
            </Link>
          </MagneticButton>
        </ScrollReveal>
      </section>
    </div>
  );
}
