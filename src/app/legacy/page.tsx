import Link from "next/link";
import { connection } from "next/server";
import { getSiteContent } from "@/lib/db";
import FluidCanvas from "@/components/motion/FluidCanvas";
import { ScrollReveal, SectionHeading } from "@/components/motion/ScrollReveal";
import { KineticMarquee } from "@/components/motion/KineticMarquee";
import CardSpotlight from "@/components/motion/CardSpotlight";

export const instant = false;

export default async function LegacyPage() {
  await connection();
  const { founder, marqueeItems } = getSiteContent();

  const tenures = [
    {
      year: "2025–2026",
      theme: "Shape the Resurgence",
      badge: "Current Active Tenure",
      achievements: [
        "Welcomed 17 new recruits in Recruitment 14.",
        "Eastern Model United Nations 2026: Won Best Delegation & Top Individual Awards.",
        "Launched renovated digital portal and Member Development Programs.",
      ],
      sg: "Executive Secretariat Board",
    },
    {
      year: "2023–2024",
      theme: "Diplomatic Endurance",
      badge: "Tenure XII",
      achievements: [
        "Organized inter-university diplomacy workshops with 300+ attendees.",
        "Delegations to regional conferences across Bangladesh and South Asia.",
        "Conducted Model UN Crisis Bootcamp at AUDI801.",
      ],
      sg: "Kazi Nabil & Team",
    },
    {
      year: "2022–2023",
      theme: "Global Sustenance Through Solidarity",
      badge: "Flagship NSUIMUN V",
      achievements: [
        "Hosted NSUIMUN 2022 — Bangladesh's premier international MUN.",
        "7 distinct committee rooms, 500+ delegates from 20+ institutions.",
        "Featured luxury 5-star diplomatic evening socials.",
      ],
      sg: "Secretariat General V",
    },
    {
      year: "2018–2019",
      theme: "Decade of Influence",
      badge: "Tenure VII",
      achievements: [
        "Represented North South University at Harvard WorldMUN and McMUN.",
        "Secured international Best Delegate awards in Singapore and Malaysia.",
        "Established permanent alumni advisory council.",
      ],
      sg: "Adnan Sharif & Board",
    },
    {
      year: "2012–2014",
      theme: "The Inception Era",
      badge: "Founding Cohort",
      achievements: [
        "Founded by Zunayeed and pioneer cohort under NSU Department of Student Affairs.",
        "Introduced formal UN Rules of Procedure culture to North South University.",
        "Organized the first ever NSUIMUN conference in Dhaka.",
      ],
      sg: "Zunayeed (Founder)",
    },
  ];

  return (
    <div className="pt-20">
      {/* Header */}
      <section className="relative py-24 px-4 mesh-bg agency-grid-bg overflow-hidden">
        <FluidCanvas />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="mb-3 animate-fade-in-down">
            <span className="striver-tag">history · secretariats · hall of fame</span>
          </div>
          <h1 className="text-4xl xs:text-5xl sm:text-6xl md:text-7xl font-extrabold text-white mb-5 animate-fade-in-up tracking-tight leading-[1.08]">
            Our <span className="gradient-text">Legacy</span>
          </h1>
          <p
            className="text-base sm:text-xl max-w-2xl mx-auto animate-fade-in-up stagger-2 leading-relaxed"
            style={{ color: "var(--text-muted)" }}
          >
            Over a decade of diplomatic excellence, transformative conferences, and the leaders who shaped North South University Model UN Club.
          </p>
        </div>
      </section>

      <KineticMarquee items={marqueeItems} />

      {/* Founder Spotlight */}
      <section className="py-20 px-4" style={{ background: "var(--navy-mid)" }}>
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <CardSpotlight glowColor="rgba(251, 191, 36, 0.2)" className="rounded-3xl border border-gold/30">
              <div className="glass-gold rounded-[inherit] p-8 sm:p-12">
                <div className="flex items-center gap-2 mb-3">
                  <span className="badge glass" style={{ color: "var(--gold-bright)", borderColor: "rgba(251,191,36,0.3)" }}>
                    FOUNDER SPOTLIGHT
                  </span>
                  <span className="text-xs font-mono text-white/50">Established 2012</span>
                </div>

                <div className="grid md:grid-cols-12 gap-8 items-center">
                  <div className="md:col-span-8">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">{founder.name}</h2>
                    <p className="text-sm sm:text-base font-semibold mb-4" style={{ color: "var(--gold-bright)" }}>
                      {founder.title}
                    </p>
                    <p className="text-sm sm:text-base leading-relaxed mb-6" style={{ color: "var(--text-muted)" }}>
                      {founder.bio}
                    </p>

                    <div className="border-l-2 pl-4 py-1 border-gold/60 mb-6">
                      <div className="text-xs uppercase tracking-widest font-mono text-white/50">Motto</div>
                      <div className="text-base font-bold italic text-white">&ldquo;{founder.motto}&rdquo;</div>
                    </div>
                  </div>

                  <div className="md:col-span-4 space-y-2">
                    <div className="text-xs uppercase tracking-widest font-mono mb-2" style={{ color: "var(--gold-bright)" }}>
                      Historic Delegations
                    </div>
                    {founder.achievements.slice(0, 4).map((a, i) => (
                      <div key={i} className="text-xs p-2.5 rounded-lg glass border border-white/10 text-white/80">
                        ✦ {a}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardSpotlight>
          </ScrollReveal>
        </div>
      </section>

      {/* Tenures Timeline */}
      <section className="py-24 px-4 agency-grid-bg">
        <div className="max-w-6xl mx-auto">
          <div className="mb-14">
            <SectionHeading
              tag="chronicles of leadership"
              title="Tenures Across"
              accent="The Decades"
              subtitle="Every executive tenure set new benchmarks in committee innovation, delegation triumphs, and diplomatic mentorship."
            />
          </div>

          <div className="space-y-6">
            {tenures.map((t, idx) => (
              <ScrollReveal key={t.year} delay={idx * 100}>
                <div className="glass rounded-2xl p-6 sm:p-8 border border-white/15 card-hover">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 border-b border-white/10 pb-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-2xl sm:text-3xl font-black gradient-text-gold">
                          {t.year}
                        </span>
                        <span className="badge glass-blue text-[10px]" style={{ color: "var(--un-blue-bright)" }}>
                          {t.badge}
                        </span>
                      </div>
                      <h3 className="text-white font-extrabold text-lg sm:text-xl mt-1">{t.theme}</h3>
                    </div>
                    <div className="text-xs sm:text-sm font-mono text-right sm:text-right" style={{ color: "var(--gold-bright)" }}>
                      Secretariat: {t.sg}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-3">
                    {t.achievements.map((ach, achIdx) => (
                      <div
                        key={achIdx}
                        className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs sm:text-sm leading-relaxed"
                        style={{ color: "var(--text-muted)" }}
                      >
                        <span className="text-gold font-bold mr-1.5">✓</span>
                        {ach}
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 px-4 border-t border-white/10" style={{ background: "var(--navy-surface)" }}>
        <div className="max-w-4xl mx-auto text-center">
          <span className="striver-tag mb-3">write the next chapter</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Be Part of the Next Decade of Legacy
          </h2>
          <p className="text-base sm:text-lg mb-8" style={{ color: "var(--text-muted)" }}>
            Join the student leaders shaping international debate, global partnerships, and diplomacy at North South University.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/registration"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm bg-un-blue hover:brightness-110 transition-all shadow-lg"
              style={{ color: "#ffffff" }}
            >
              <span>Register for Membership</span>
              <span>↗</span>
            </Link>
            <Link
              href="/executive-body"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm glass border border-white/15 hover:border-gold/40 transition-colors"
              style={{ color: "var(--gold-bright)" }}
            >
              <span>Current Executive Body</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
