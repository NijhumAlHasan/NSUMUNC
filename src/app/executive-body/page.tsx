import Link from "next/link";
import { connection } from "next/server";
import { getSiteContent } from "@/lib/db";
import FluidCanvas from "@/components/motion/FluidCanvas";
import { ScrollReveal, SectionHeading } from "@/components/motion/ScrollReveal";
import { KineticMarquee } from "@/components/motion/KineticMarquee";
import CardSpotlight from "@/components/motion/CardSpotlight";

export const instant = false;

export default async function ExecutiveBodyPage() {
  await connection();
  const { team, marqueeItems } = getSiteContent();

  // Highlight executive secretariat roles (filtering strictly executive body)
  const executiveMembers = team.filter(
    (m) => (m.body_type || "executive") === "executive" && m.is_active !== 0
  );

  return (
    <div className="pt-20">
      {/* Header */}
      <section className="relative py-24 px-4 mesh-bg agency-grid-bg overflow-hidden">
        <FluidCanvas />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="mb-3 animate-fade-in-down">
            <span className="striver-tag">leadership · fiscal year 2025–2026</span>
          </div>
          <h1 className="text-4xl xs:text-5xl sm:text-6xl md:text-7xl font-extrabold text-white mb-5 animate-fade-in-up tracking-tight leading-[1.08]">
            Executive <span className="gradient-text">Body</span>
          </h1>
          <p
            className="text-base sm:text-xl max-w-2xl mx-auto animate-fade-in-up stagger-2 leading-relaxed"
            style={{ color: "var(--text-muted)" }}
          >
            The apex leadership guiding the diplomacy, governance, and national conferences of North South University Model UN Club.
          </p>
        </div>
      </section>

      <KineticMarquee items={marqueeItems} />

      {/* Executive Body Grid */}
      <section className="py-20 px-4" style={{ background: "var(--navy-mid)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-14">
            <SectionHeading
              tag="secretariat board"
              title="Presidency &"
              accent="Secretaries-General"
              subtitle="Elected leadership steering NSUMUNC's diplomatic standards, external affairs, and conference operations."
            />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {executiveMembers.map((m, i) => (
              <ScrollReveal key={m.id} delay={i * 80}>
                <CardSpotlight glowColor="rgba(251, 191, 36, 0.18)" className="rounded-2xl border border-white/15 card-hover h-full">
                  <div className="glass rounded-[inherit] p-7 flex flex-col justify-between h-full">
                    <div>
                      {/* Avatar / Portrait */}
                      <div className="flex items-center gap-4 mb-5">
                        <div
                          className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-extrabold text-2xl flex-shrink-0 overflow-hidden border border-white/20 shadow-lg"
                          style={{
                            background:
                              i === 0
                                ? "linear-gradient(135deg, var(--gold-bright), #b45309)"
                                : "linear-gradient(135deg, var(--un-blue), #0369a1)",
                          }}
                        >
                          {m.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={m.image} alt={m.name} className="w-full h-full object-cover" />
                          ) : (
                            m.initial || m.role.charAt(0)
                          )}
                        </div>
                        <div className="min-w-0">
                          <span
                            className="badge text-[10px] font-mono tracking-wider uppercase mb-1 inline-block"
                            style={{
                              background: i === 0 ? "rgba(251,191,36,0.15)" : "rgba(14,165,233,0.15)",
                              color: i === 0 ? "var(--gold-bright)" : "var(--un-blue-bright)",
                            }}
                          >
                            {i === 0 ? "Presidential Office" : "Executive Secretariat"}
                          </span>
                          <h3 className="text-white font-extrabold text-lg leading-snug truncate">{m.role}</h3>
                        </div>
                      </div>

                      {/* Name & Bio */}
                      <div className="mb-4">
                        <div className="text-base font-bold" style={{ color: "var(--gold-bright)" }}>
                          {m.name}
                        </div>
                        <div className="text-xs text-white/50 font-mono mt-0.5">North South University</div>
                      </div>

                      <p className="text-xs sm:text-sm leading-relaxed mb-6" style={{ color: "var(--text-muted)" }}>
                        {m.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                      <span className="font-mono text-white/40">Tenure 2025–26</span>
                      <Link
                        href="/contact"
                        className="text-xs font-semibold hover:underline"
                        style={{ color: "var(--un-blue-bright)" }}
                      >
                        Contact Official →
                      </Link>
                    </div>
                  </div>
                </CardSpotlight>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Sub-Executive Body Cross-link */}
      <section className="py-20 px-4 border-t border-white/10" style={{ background: "var(--navy-surface)" }}>
        <div className="max-w-4xl mx-auto text-center">
          <span className="striver-tag mb-3">operational backbone</span>
          <h2 className="text-3xl font-extrabold text-white mb-4">
            Explore the Sub-Executive Body
          </h2>
          <p className="text-base sm:text-lg mb-8" style={{ color: "var(--text-muted)" }}>
            Discover the Directors, Wing Leads, and Under-Secretaries managing Delegate Affairs, Logistics, IT, and Public Relations.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/sub-executive-body"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm bg-un-blue hover:brightness-110 transition-all shadow-lg"
              style={{ color: "#ffffff" }}
            >
              <span>View Sub-Executive Body</span>
              <span>→</span>
            </Link>
            <Link
              href="/legacy"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm glass border border-white/15 hover:border-gold/40 transition-colors"
              style={{ color: "var(--gold-bright)" }}
            >
              <span>Past Secretariats (Legacy)</span>
              <span>✦</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
