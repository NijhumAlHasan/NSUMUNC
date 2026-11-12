import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { getSiteContent, defaultFacultyAdvisor } from "@/lib/db";
import FluidCanvas from "@/components/motion/FluidCanvas";
import { ScrollReveal, SectionHeading } from "@/components/motion/ScrollReveal";
import { KineticMarquee } from "@/components/motion/KineticMarquee";
import CardSpotlight from "@/components/motion/CardSpotlight";

export const instant = false;

export default async function FacultyAdvisorPage() {
  await connection();
  const { settings, marqueeItems, facultyAdvisor } = getSiteContent();

  const advisor = facultyAdvisor || defaultFacultyAdvisor;
  const milestones =
    advisor.milestones && advisor.milestones.length > 0
      ? advisor.milestones
      : defaultFacultyAdvisor.milestones || [];
  const pastAdvisors =
    advisor.pastAdvisors && advisor.pastAdvisors.length > 0
      ? advisor.pastAdvisors
      : defaultFacultyAdvisor.pastAdvisors || [];

  return (
    <div className="pt-20">
      {/* Header */}
      <section className="relative py-24 px-4 mesh-bg agency-grid-bg overflow-hidden">
        <FluidCanvas />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="mb-3 animate-fade-in-down">
            <span className="striver-tag">academic leadership · mentorship</span>
          </div>
          <h1 className="text-4xl xs:text-5xl sm:text-6xl md:text-7xl font-extrabold text-white mb-5 animate-fade-in-up tracking-tight leading-[1.08]">
            Faculty <span className="gradient-text">Advisor</span>
          </h1>
          <p
            className="text-base sm:text-xl max-w-2xl mx-auto animate-fade-in-up stagger-2 leading-relaxed"
            style={{ color: "var(--text-muted)" }}
          >
            Guiding diplomatic excellence, scholarly inquiry, and student leadership at North South University.
          </p>
        </div>
      </section>

      <KineticMarquee items={marqueeItems} />

      {/* Main Advisor Spotlight & Message */}
      <section className="py-20 px-4" style={{ background: "var(--navy-mid)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-10 items-start">
            {/* Left Card: Portrait & Info */}
            <div className="lg:col-span-5">
              <ScrollReveal>
                <CardSpotlight glowColor="rgba(251, 191, 36, 0.22)" className="rounded-3xl border border-gold/30">
                  <div className="glass-gold rounded-[inherit] overflow-hidden p-6 sm:p-8">
                    <div className="relative w-full aspect-square rounded-2xl overflow-hidden mb-6 border border-gold/25 bg-black/40">
                      {/* Stylized fallback if photo not on disk */}
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-un-blue/20 via-navy to-gold/10">
                        <div className="w-24 h-24 rounded-full glass border border-gold/40 flex items-center justify-center text-4xl mb-4 text-gold">
                          🎓
                        </div>
                        <span className="text-white font-extrabold text-xl">{advisor.name}</span>
                        <span className="text-xs mt-1" style={{ color: "var(--gold-bright)" }}>
                          {advisor.title}
                        </span>
                      </div>
                    </div>

                    <span className="striver-tag mb-2">faculty mentorship</span>
                    <h3 className="text-2xl font-extrabold text-white">{advisor.name}</h3>
                    <p className="text-sm font-semibold mt-1" style={{ color: "var(--gold-bright)" }}>
                      {advisor.designation}
                    </p>
                    <p className="text-xs mt-1 text-white/70">{advisor.department}</p>

                    <div className="mt-6 pt-5 border-t border-white/10 space-y-2.5 text-xs sm:text-sm" style={{ color: "var(--text-muted)" }}>
                      <div className="flex items-center gap-2">
                        <span>🏛️</span>
                        <span>Office: {advisor.office}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>✉️</span>
                        <span>{advisor.email}</span>
                      </div>
                    </div>
                  </div>
                </CardSpotlight>
              </ScrollReveal>
            </div>

            {/* Right Card: Message from Faculty Advisor */}
            <div className="lg:col-span-7">
              <ScrollReveal delay={150}>
                <div className="glass rounded-3xl p-8 sm:p-10 border border-white/15">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="badge glass-blue text-[10px]" style={{ color: "var(--un-blue-bright)" }}>
                      OFFICIAL MESSAGE
                    </span>
                    <span className="text-xs font-mono" style={{ color: "var(--text-faint)" }}>
                      North South University
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-6">
                    A Message to Future Diplomats
                  </h2>

                  {/* Blockquote callout */}
                  <div
                    className="p-5 rounded-2xl mb-6 border-l-4"
                    style={{
                      background: "rgba(251, 191, 36, 0.06)",
                      borderColor: "var(--gold-bright)",
                      color: "var(--gold-bright)",
                    }}
                  >
                    <p className="italic text-base sm:text-lg font-medium leading-relaxed">
                      &ldquo;{advisor.quote}&rdquo;
                    </p>
                  </div>

                  <div className="space-y-4 text-base sm:text-lg leading-relaxed" style={{ color: "var(--text-muted)" }}>
                    {advisor.message.map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>

                  <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <div className="text-white font-bold text-base">{advisor.name}</div>
                      <div className="text-xs" style={{ color: "var(--gold-bright)" }}>
                        {advisor.title}, NSU Model UN Club
                      </div>
                    </div>
                    <Link
                      href="/contact"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl glass border border-white/20 text-xs sm:text-sm font-bold hover:border-gold/40 transition-colors"
                      style={{ color: "var(--gold-bright)" }}
                    >
                      <span>Connect with Faculty</span>
                      <span>→</span>
                    </Link>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* Advisory Milestones */}
      <section className="py-20 px-4 agency-grid-bg">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <SectionHeading
              tag="mentorship legacy"
              title="Advisory"
              accent="Milestones"
              subtitle="Decade-long guidance supporting national and international student delegations."
            />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {milestones.map((m, i) => (
              <ScrollReveal key={m.year} delay={i * 90}>
                <div className="glass rounded-2xl p-6 border border-white/15 h-full flex flex-col justify-between">
                  <div>
                    <span className="font-mono text-2xl font-black gradient-text-gold">{m.year}</span>
                    <h4 className="text-white font-bold text-base mt-2 mb-1">{m.label}</h4>
                    <p className="text-xs sm:text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                      {m.text}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Past Faculty Advisors */}
      <section className="py-20 px-4 border-t border-white/10" style={{ background: "var(--navy-surface)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="mb-12 text-center">
            <span className="striver-tag mb-2">honor roll</span>
            <h2 className="text-3xl font-extrabold text-white">Past Faculty Advisors</h2>
            <p className="text-sm sm:text-base mt-2" style={{ color: "var(--text-muted)" }}>
              Honoring the distinguished faculty members who laid the academic pillars of NSUMUNC.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {pastAdvisors.map((p, i) => (
              <ScrollReveal key={p.name} delay={i * 120}>
                <div className="glass rounded-2xl p-6 border border-white/15 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl glass border border-white/20 flex items-center justify-center text-xl flex-shrink-0">
                    🏛️
                  </div>
                  <div>
                    <span className="badge glass-blue text-[10px] mb-1.5" style={{ color: "var(--un-blue-bright)" }}>
                      {p.role}
                    </span>
                    <h4 className="text-white font-bold text-lg">{p.name}</h4>
                    <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                      {p.dept}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
