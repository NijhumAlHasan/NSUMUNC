import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { getSiteContent } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";
import AnnouncementsBanner from "@/components/AnnouncementsBanner";
import FluidCanvas from "@/components/motion/FluidCanvas";
import MagneticButton from "@/components/motion/MagneticButton";
import { KineticMarquee } from "@/components/motion/KineticMarquee";
import { ScrollReveal, SectionHeading, AnimatedCounter } from "@/components/motion/ScrollReveal";
import InteractiveShowcase, { ShowcaseItem } from "@/components/motion/InteractiveShowcase";
import CardSpotlight from "@/components/motion/CardSpotlight";

export const instant = false;

export default async function Home() {
  await connection();
  const { settings, announcements, events, achievements, stats, values, marqueeItems } = getSiteContent();
  const isAuthedAdmin = await isAdminAuthenticated();

  const showcaseItems: ShowcaseItem[] = events.map((e, i) => ({
    index: String(i + 1).padStart(3, "0"),
    year: e.year,
    title: e.title,
    subtitle: e.theme,
    description: e.description,
    image: e.image,
    tag: e.type,
    href: "/events",
  }));

  return (
    <div>
      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden mesh-bg agency-grid-bg">
        <FluidCanvas />

        {/* Concentric Orbital Wireframe Globe */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[640px] h-[640px] opacity-[0.06] animate-rotate-slow">
            <svg viewBox="0 0 200 200" className="w-full h-full" fill="none" stroke="white" strokeWidth="0.45">
              <circle cx="100" cy="100" r="94" />
              <ellipse cx="100" cy="100" rx="44" ry="94" />
              <ellipse cx="100" cy="100" rx="78" ry="94" />
              <line x1="6" y1="100" x2="194" y2="100" />
              <line x1="100" y1="6" x2="100" y2="194" />
              <line x1="18" y1="55" x2="182" y2="55" />
              <line x1="18" y1="145" x2="182" y2="145" />
            </svg>
          </div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 pt-28 pb-20 w-full">
          <div className="text-center lg:text-left max-w-3xl">
              {/* Striver Bracket Tag + Live Pill */}
              <div className="inline-flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-6 animate-fade-in-down">
                <span className="striver-tag">{settings.hero_tag}</span>
                <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 border border-white/15">
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "var(--gold-bright)" }} />
                  <span className="text-xs sm:text-sm font-semibold" style={{ color: "var(--text-base)" }}>
                    {settings.hero_badge_text}
                  </span>
                </div>
              </div>

              <h1 className="text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold text-white mb-5 animate-fade-in-up leading-[1.08] tracking-tight break-words">
                {settings.hero_headline_1}
                <br />
                <span className="gradient-text">{settings.hero_headline_2}</span>
              </h1>

              <p
                className="text-lg sm:text-xl md:text-2xl font-semibold mb-4 animate-fade-in-up stagger-1 italic tracking-wide shimmer-gold-text"
              >
                &ldquo;{settings.hero_tagline}&rdquo;
              </p>

              <p
                className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto lg:mx-0 mb-8 sm:mb-10 animate-fade-in-up stagger-2 leading-relaxed font-normal"
                style={{ color: "var(--text-muted)" }}
              >
                {settings.hero_subtext}
              </p>

              {(() => {
                let heroButtons: { label: string; href: string; variant?: "blue" | "gold" | "glass" }[] = [];
                try {
                  if (settings.hero_buttons_json) {
                    heroButtons = JSON.parse(settings.hero_buttons_json);
                  }
                } catch {}
                if (!heroButtons || heroButtons.length === 0) {
                  if (settings.hero_cta1_label) {
                    heroButtons.push({ label: settings.hero_cta1_label, href: settings.hero_cta1_href || "/events", variant: "blue" });
                  }
                  if (settings.hero_cta2_label) {
                    heroButtons.push({ label: settings.hero_cta2_label, href: settings.hero_cta2_href || "/contact", variant: "gold" });
                  }
                }

                if (heroButtons.length === 0) return null;

                return (
                  <div className="flex flex-col sm:flex-row gap-3.5 sm:gap-4 justify-center lg:justify-start animate-fade-in-up stagger-3 w-full sm:w-auto">
                    {heroButtons.map((btn, idx) => {
                      const isGold = btn.variant === "gold";
                      const isGlass = btn.variant === "glass";
                      return (
                        <MagneticButton key={idx} className="w-full sm:w-auto">
                          <Link
                            href={btn.href || "#"}
                            className={`w-full sm:w-auto group inline-flex items-center justify-center gap-3 px-7 py-3.5 sm:px-8 sm:py-4 rounded-2xl font-bold text-base sm:text-lg transition-all hover:brightness-110 active:scale-[0.98] ${
                              isGold
                                ? "border shadow-lg"
                                : isGlass
                                ? "glass border border-white/20 text-white"
                                : "text-white shadow-lg"
                            }`}
                            style={
                              isGold
                                ? {
                                    background: "rgba(20, 15, 5, 0.92)",
                                    borderColor: "rgba(251, 191, 36, 0.48)",
                                    color: "var(--gold-bright)",
                                  }
                                : isGlass
                                ? { color: "var(--text-base)" }
                                : {
                                    background: "var(--un-blue)",
                                    boxShadow: "0 10px 32px rgba(14,165,233,0.35)",
                                  }
                            }
                          >
                            <span>{btn.label}</span>
                            <span className="striver-arrow">{isGold ? "✦" : "↗"}</span>
                          </Link>
                        </MagneticButton>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
        </div>
      </section>

      {/* ── Scroll-Velocity Kinetic Marquee Band ── */}
      <KineticMarquee items={marqueeItems} />

      {/* ── Live Announcements ── */}
      <AnnouncementsBanner heading={settings.announcements_heading} announcements={announcements} />

      {/* ── Animated Counters ── */}
      <section className="py-20 px-4" style={{ background: "var(--navy-mid)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <SectionHeading
              tag={settings.stats_tag}
              title={settings.stats_title}
              accent={settings.stats_accent}
              subtitle={settings.stats_subtitle}
            />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {stats.map((s, i) => (
              <AnimatedCounter key={i} index={i} value={s.value} label={s.label} />
            ))}
          </div>
        </div>
      </section>

      {/* ── EMUN 2026 Achievement ── */}
      <section className="py-24 px-4 agency-grid-bg">
        <div className="max-w-7xl mx-auto">
          <div className="mb-14">
            <SectionHeading
              tag={settings.emun_tag}
              title={settings.emun_title}
              accent={settings.emun_accent}
              subtitle={settings.emun_subtitle}
            />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <ScrollReveal className="md:col-span-1">
              <CardSpotlight glowColor="rgba(14, 165, 233, 0.22)" className="rounded-2xl border border-white/15 card-hover group h-full">
                <div className="glass overflow-hidden h-full flex flex-col rounded-[inherit]">
                  <div className="relative w-full" style={{ aspectRatio: "4/3" }}>
                    <Image
                      src={settings.emun_team_image || "/emun-team.jpg"}
                      alt={settings.emun_team_title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-center">
                    <span className="striver-tag mb-2">{settings.emun_team_tag}</span>
                    <h3 className="text-white font-extrabold text-xl leading-snug">{settings.emun_team_title}</h3>
                    <p className="text-sm sm:text-base font-semibold mt-1" style={{ color: "var(--gold-bright)" }}>
                      {settings.emun_team_subtitle}
                    </p>
                  </div>
                </div>
              </CardSpotlight>
            </ScrollReveal>

            <div className="md:col-span-2 grid sm:grid-cols-2 gap-6">
              {achievements.map((a, i) => (
                <ScrollReveal key={a.id ?? i} delay={(i + 1) * 120}>
                  <CardSpotlight glowColor="rgba(251, 191, 36, 0.22)" className="rounded-2xl border border-gold/25 card-hover group h-full">
                    <div className="glass-gold overflow-hidden h-full flex flex-col rounded-[inherit]">
                      <div className="relative w-full" style={{ aspectRatio: "1/1" }}>
                        <Image
                          src={a.image}
                          alt={a.name}
                          fill
                          className="object-cover object-top group-hover:scale-105 transition-transform duration-700"
                        />
                      </div>
                      <div className="p-6">
                        <div
                          className="badge glass mb-2.5"
                          style={{ color: "var(--gold-bright)", borderColor: "rgba(251,191,36,0.3)" }}
                        >
                          {settings.emun_award_badge || "🏆 Award Winner"}
                        </div>
                        <h3 className="text-white font-extrabold text-xl">{a.name}</h3>
                        <p className="font-semibold text-base mt-1" style={{ color: "var(--gold-bright)" }}>
                          {a.award}
                        </p>
                        <p className="text-xs font-medium mt-1.5" style={{ color: "var(--text-faint)" }}>
                          {a.conference}
                        </p>
                      </div>
                    </div>
                  </CardSpotlight>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="celestial-divider my-4" />

      {/* ── Striver Interactive Showcase ── */}
      {showcaseItems.length > 0 && (
        <section className="py-24 px-4" style={{ background: "var(--navy-mid)" }}>
          <div className="max-w-7xl mx-auto">
            <div className="mb-14">
              <SectionHeading
                tag={settings.showcase_tag}
                title={settings.showcase_title}
                accent={settings.showcase_accent}
                subtitle={settings.showcase_subtitle}
                align="left"
              />
            </div>
            <InteractiveShowcase items={showcaseItems} />
          </div>
        </section>
      )}

      {/* ── Member Development Programs (MDPs) Spotlight ── */}
      <section className="py-20 px-4 agency-grid-bg border-y border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="striver-tag mb-2">skill-building &amp; leadership</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                Member Development <span className="gradient-text">Programs (MDPs)</span>
              </h2>
              <p className="text-sm sm:text-base mt-2 max-w-2xl" style={{ color: "var(--text-muted)" }}>
                Inspired by collegiate leadership excellence: year-round diplomatic bootcamps, resolution clinics, and emergency crisis simulations.
              </p>
            </div>
            <Link
              href="/mdps"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs sm:text-sm glass border border-white/15 hover:border-gold/40 transition-colors flex-shrink-0"
              style={{ color: "var(--gold-bright)" }}
            >
              <span>Explore All MDPs</span>
              <span>→</span>
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                num: "01",
                icon: "📜",
                title: "Rules of Procedure (RoP)",
                desc: "Master UN General Assembly and Security Council protocol, moderated caucuses, and procedural voting.",
              },
              {
                num: "02",
                icon: "🎙️",
                title: "Diplomatic Oratory & Lobbying",
                desc: "Learn bloc formation, persuasive rhetoric, and negotiating cross-table consensus under pressure.",
              },
              {
                num: "03",
                icon: "⚡",
                title: "Crisis Simulation Labs",
                desc: "Real-time geopolitical emergency simulations with breaking directives, intelligence, and communiqués.",
              },
            ].map((p, idx) => (
              <ScrollReveal key={p.num} delay={idx * 100}>
                <CardSpotlight glowColor="rgba(14, 165, 233, 0.2)" className="rounded-2xl border border-white/15 h-full">
                  <div className="glass rounded-[inherit] p-6 h-full flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl">{p.icon}</span>
                        <span className="font-mono text-sm font-bold gradient-text-gold">{p.num}</span>
                      </div>
                      <h3 className="text-white font-bold text-lg mb-2">{p.title}</h3>
                      <p className="text-xs sm:text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                        {p.desc}
                      </p>
                    </div>
                    <Link
                      href="/mdps"
                      className="mt-4 pt-3 border-t border-white/10 text-xs font-semibold flex items-center justify-between hover:text-white"
                      style={{ color: "var(--un-blue-bright)" }}
                    >
                      <span>Read Syllabus</span>
                      <span>→</span>
                    </Link>
                  </div>
                </CardSpotlight>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <div className="celestial-divider my-4" />

      {/* ── Core Values ── */}
      <section className="py-24 px-4 agency-grid-bg">
        <div className="max-w-7xl mx-auto">
          <div className="mb-14">
            <SectionHeading
              tag={settings.values_tag}
              title={settings.values_title}
              accent={settings.values_accent}
              subtitle={settings.values_subtitle}
            />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {values.map((v, i) => {
              const num = String(i + 1).padStart(3, "0");
              return (
                <ScrollReveal key={i} delay={i * 80}>
                  <CardSpotlight glowColor="rgba(14, 165, 233, 0.2)" className="rounded-2xl border border-white/15 card-hover h-full">
                    <div className="group glass rounded-[inherit] p-7 h-full flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-3xl group-hover:scale-110 transition-transform">{v.icon}</span>
                          <span
                            className="font-mono text-xs font-bold px-2.5 py-1 rounded-full glass-blue"
                            style={{ color: "var(--un-blue-bright)" }}
                          >
                            /{num}
                          </span>
                        </div>
                        <h3 className="text-white font-extrabold text-xl mb-2 group-hover:text-gold-bright transition-colors">{v.title}</h3>
                        <p className="text-sm sm:text-base leading-relaxed" style={{ color: "var(--text-muted)" }}>
                          {v.description}
                        </p>
                      </div>
                    </div>
                  </CardSpotlight>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── UN Day Feature ── */}
      <section className="py-20 px-4" style={{ background: "var(--navy-mid)" }}>
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <CardSpotlight glowColor="rgba(251, 191, 36, 0.22)" className="rounded-3xl border border-white/15">
              <div className="glass rounded-[inherit] overflow-hidden">
                <div className="grid md:grid-cols-2">
                  <div className="relative min-h-[300px]">
                    <Image src={settings.unday_image || "/un-day.jpg"} alt={settings.unday_title} fill className="object-cover" />
                  </div>
                  <div className="p-8 md:p-10 flex flex-col justify-center">
                    <div className="mb-3">
                      <span className="striver-tag">{settings.unday_tag}</span>
                    </div>
                    <h3 className="text-white text-2xl sm:text-3xl font-extrabold mb-2">{settings.unday_title}</h3>
                    <p className="italic text-base font-semibold mb-4" style={{ color: "var(--gold-bright)" }}>
                      &ldquo;{settings.unday_quote}&rdquo;
                    </p>
                    <p className="text-sm sm:text-base leading-relaxed mb-5" style={{ color: "var(--text-muted)" }}>
                      {settings.unday_description}
                    </p>
                    <blockquote
                      className="glass rounded-xl p-4 text-sm sm:text-base italic border-l-2 border-un-blue"
                      style={{ color: "var(--text-base)" }}
                    >
                      &ldquo;{settings.unday_blockquote}&rdquo;
                      <footer className="text-xs font-semibold mt-1.5 not-italic" style={{ color: "var(--gold-bright)" }}>
                        — {settings.unday_blockquote_author}
                      </footer>
                    </blockquote>
                  </div>
                </div>
              </div>
            </CardSpotlight>
          </ScrollReveal>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-4 relative overflow-hidden mesh-bg">
        <div className="relative max-w-3xl mx-auto text-center z-10">
          <ScrollReveal>
            <span className="striver-tag mb-4">{settings.home_cta_tag}</span>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-5 tracking-tight">
              {settings.home_cta_title} <span className="gradient-text">{settings.home_cta_accent}</span>
            </h2>
            <p className="text-lg sm:text-xl mb-10 max-w-xl mx-auto leading-relaxed" style={{ color: "var(--text-muted)" }}>
              {settings.home_cta_subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <MagneticButton>
                <Link
                  href={settings.home_cta_btn1_href || "/contact"}
                  className="group inline-flex items-center justify-center gap-3 px-10 py-4 rounded-2xl font-extrabold text-lg text-navy transition-all hover:brightness-110 shadow-lg"
                  style={{
                    background: "linear-gradient(135deg, var(--gold), var(--gold-bright))",
                    boxShadow: "0 10px 30px rgba(212,160,23,0.35)",
                  }}
                >
                  <span>{settings.home_cta_btn1_label}</span>
                  <span className="striver-arrow">↗</span>
                </Link>
              </MagneticButton>
              <MagneticButton>
                <Link
                  href={settings.home_cta_btn2_href || "/about"}
                  className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-2xl font-bold text-lg text-white transition-all glass border border-white/20 hover:border-un-blue-bright"
                >
                  {settings.home_cta_btn2_label}
                </Link>
              </MagneticButton>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
