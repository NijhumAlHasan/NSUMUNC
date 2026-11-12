import Image from "next/image";
import { connection } from "next/server";
import { getSiteContent } from "@/lib/db";
import FluidCanvas from "@/components/motion/FluidCanvas";
import { ScrollReveal, SectionHeading, AnimatedCounter } from "@/components/motion/ScrollReveal";
import { KineticMarquee } from "@/components/motion/KineticMarquee";

export const instant = false;

export default async function AboutPage() {
  await connection();
  const { settings, stats, values, founder, marqueeItems } = getSiteContent();

  return (
    <div className="pt-20">
      {/* Header */}
      <section className="relative py-24 px-4 mesh-bg agency-grid-bg overflow-hidden">
        <FluidCanvas />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="mb-3 animate-fade-in-down">
            <span className="striver-tag">{settings.about_header_tag}</span>
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-white mb-5 animate-fade-in-up tracking-tight leading-[1.08]">
            {settings.about_header_title} <span className="gradient-text">{settings.about_header_accent}</span>
          </h1>
          <p
            className="text-lg sm:text-xl max-w-2xl mx-auto animate-fade-in-up stagger-2 leading-relaxed"
            style={{ color: "var(--text-muted)" }}
          >
            {settings.about_header_subtitle}
          </p>
        </div>
      </section>

      <KineticMarquee items={marqueeItems} />

      {/* Story */}
      <section className="py-20 px-4" style={{ background: "var(--navy-mid)" }}>
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="glass rounded-3xl p-8 sm:p-12 md:p-14 border border-white/15">
              <div className="grid md:grid-cols-2 gap-12 items-start">
                <div>
                  <span className="striver-tag mb-3">{settings.about_story_tag || "our story"}</span>
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-5">
                    {settings.about_story_title}
                  </h2>
                  <p className="text-base sm:text-lg leading-relaxed mb-4" style={{ color: "var(--text-muted)" }}>
                    {settings.about_story_intro}
                  </p>
                  <p className="text-base sm:text-lg leading-relaxed mb-4" style={{ color: "var(--text-muted)" }}>
                    {settings.about_description}
                  </p>
                  <p className="text-base sm:text-lg leading-relaxed" style={{ color: "var(--text-muted)" }}>
                    {settings.about_story_extra}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {stats.map((s, i) => (
                    <AnimatedCounter key={i} index={i} value={s.value} label={s.label} />
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 px-4 agency-grid-bg">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <SectionHeading
              tag={settings.mission_section_tag || "purpose & direction"}
              title={settings.mission_section_title || "Mission &"}
              accent={settings.mission_section_accent || "Vision"}
              subtitle={settings.mission_section_subtitle}
            />
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <ScrollReveal>
              <div className="group glass-blue rounded-3xl p-8 sm:p-10 border-t-2 border-un-blue card-hover h-full">
                <span className="striver-tag mb-4">{settings.mission_card_tag || "001 · mission"}</span>
                <h3 className="text-white font-extrabold text-2xl sm:text-3xl mb-4">
                  {settings.mission_card_title || "Our Mission"}
                </h3>
                <p className="text-base sm:text-lg leading-relaxed" style={{ color: "var(--text-base)" }}>
                  {settings.mission_text}
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={120}>
              <div className="group glass-gold rounded-3xl p-8 sm:p-10 border-t-2 border-gold card-hover h-full">
                <span className="striver-tag mb-4">{settings.vision_card_tag || "002 · vision"}</span>
                <h3 className="text-white font-extrabold text-2xl sm:text-3xl mb-4">
                  {settings.vision_card_title || "Our Vision"}
                </h3>
                <p className="text-base sm:text-lg leading-relaxed" style={{ color: "var(--text-base)" }}>
                  {settings.vision_text}
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-4" style={{ background: "var(--navy-mid)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <SectionHeading tag={settings.values_tag} title={settings.values_title} accent={settings.values_accent} />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {values.map((v, i) => {
              const num = String(i + 1).padStart(3, "0");
              return (
                <ScrollReveal key={i} delay={i * 75}>
                  <div className="group glass rounded-2xl p-7 card-hover border border-white/15 h-full">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-3xl group-hover:scale-110 transition-transform inline-block">{v.icon}</span>
                      <span
                        className="font-mono text-xs font-bold px-2.5 py-1 rounded-full glass-blue"
                        style={{ color: "var(--un-blue-bright)" }}
                      >
                        /{num}
                      </span>
                    </div>
                    <h3 className="text-white font-extrabold text-xl mb-2">{v.title}</h3>
                    <p className="text-sm sm:text-base leading-relaxed" style={{ color: "var(--text-muted)" }}>
                      {v.description}
                    </p>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Founder */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="glass rounded-3xl p-8 sm:p-12 md:p-14 border border-white/15">
              <div className="text-center mb-10">
                <span className="striver-tag mb-2">{settings.founder_section_tag || "origins"}</span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                  {settings.founder_section_title || "The Founder"}
                </h2>
              </div>
              <div className="grid md:grid-cols-3 gap-10 items-start">
                <div className="text-center">
                  {founder.image ? (
                    <div className="relative w-32 h-32 rounded-full mx-auto mb-4 overflow-hidden border-2 border-gold/40 shadow-2xl">
                      <Image src={founder.image} alt={founder.name} fill className="object-cover" />
                    </div>
                  ) : (
                    <div
                      className="w-28 h-28 rounded-full mx-auto flex items-center justify-center text-white text-5xl font-extrabold mb-4 shadow-2xl"
                      style={{ background: "linear-gradient(135deg, var(--un-blue), var(--gold))" }}
                    >
                      {(founder.name || "Z").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <h3 className="text-white font-extrabold text-2xl">{founder.name}</h3>
                  <p className="text-sm font-semibold mt-1" style={{ color: "var(--gold-bright)" }}>
                    {founder.title}
                  </p>
                  <p className="text-xs sm:text-sm italic mt-3" style={{ color: "var(--text-muted)" }}>
                    &ldquo;{founder.motto}&rdquo;
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-base sm:text-lg leading-relaxed mb-6" style={{ color: "var(--text-base)" }}>
                    {founder.bio}
                  </p>
                  <h4 className="text-white font-bold text-lg mb-4">
                    {settings.founder_achievements_heading || "Notable Achievements"}
                  </h4>
                  <ul className="space-y-3">
                    {founder.achievements.map((a, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm sm:text-base" style={{ color: "var(--text-muted)" }}>
                        <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="var(--un-blue-bright)" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
