import Link from "next/link";
import { connection } from "next/server";
import { getSiteContent } from "@/lib/db";
import FluidCanvas from "@/components/motion/FluidCanvas";
import { ScrollReveal, SectionHeading } from "@/components/motion/ScrollReveal";
import { KineticMarquee } from "@/components/motion/KineticMarquee";

export const instant = false;

export default async function SubExecutiveBodyPage() {
  await connection();
  const { team, marqueeItems } = getSiteContent();

  const subEbMembers = team.filter((m) => m.body_type === "sub_eb" && m.is_active !== 0);

  const wingMeta: Record<string, { tag: string; icon: string; description: string }> = {
    "Delegate Affairs & International Relations": {
      tag: "External Diplomacy",
      icon: "🌐",
      description: "Managing delegate onboarding, international liaison, committee registration, and country portfolio allocations.",
    },
    "Academics & Research Council": {
      tag: "Substantive Protocol",
      icon: "📚",
      description: "Crafting committee background guides, study materials, crisis matrices, and Rules of Procedure (RoP) masterclasses.",
    },
    "Logistics & Event Operations": {
      tag: "Execution & Secretariat",
      icon: "⚙️",
      description: "Powering venues, audio-visual technical setups, delegate conference kits, socials, and ceremony production.",
    },
    "Public Relations, Branding & Media": {
      tag: "Visual Storytelling",
      icon: "📸",
      description: "Directing photography, cinematography, official statements, social campaigns, and press coverage.",
    },
    "Finance & Corporate Sponsorships": {
      tag: "Fiscal Strategy",
      icon: "💎",
      description: "Overseeing corporate sponsorships, institutional grants, budget allocations, and auditing.",
    },
    "Information Technology & Web": {
      tag: "Digital Infrastructure",
      icon: "💻",
      description: "Developing and maintaining conference software, web portals, digital voting, and IT systems.",
    },
  };

  // Group dynamic Sub-EB members by wing
  const wingGroups: Record<string, typeof subEbMembers> = {};
  for (const m of subEbMembers) {
    const wingName = m.wing?.trim() || "General Operations";
    if (!wingGroups[wingName]) {
      wingGroups[wingName] = [];
    }
    wingGroups[wingName].push(m);
  }

  const wingNames = Object.keys(wingGroups);

  return (
    <div className="pt-20">
      {/* Header */}
      <section className="relative py-24 px-4 mesh-bg agency-grid-bg overflow-hidden">
        <FluidCanvas />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="mb-3 animate-fade-in-down">
            <span className="striver-tag">wings &amp; operations · fiscal year 2025–2026</span>
          </div>
          <h1 className="text-4xl xs:text-5xl sm:text-6xl md:text-7xl font-extrabold text-white mb-5 animate-fade-in-up tracking-tight leading-[1.08]">
            Sub-Executive <span className="gradient-text">Body</span>
          </h1>
          <p
            className="text-base sm:text-xl max-w-2xl mx-auto animate-fade-in-up stagger-2 leading-relaxed"
            style={{ color: "var(--text-muted)" }}
          >
            The dedicated directors, wing heads, and associate managers orchestrating every detail of NSUMUNC&apos;s diplomatic operations.
          </p>
        </div>
      </section>

      <KineticMarquee items={marqueeItems} />

      {/* Wings Breakdown */}
      <section className="py-20 px-4" style={{ background: "var(--navy-mid)" }}>
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="mb-14">
            <SectionHeading
              tag="operational wings"
              title="Strategic"
              accent="Operational Wings"
              subtitle="Coordinating substantive diplomacy, event execution, delegate experience, and high-impact media production."
            />
          </div>

          {wingNames.length === 0 ? (
            <div className="text-center py-16 glass rounded-2xl border border-white/10 max-w-xl mx-auto">
              <span className="text-3xl mb-3 block">🌿</span>
              <p className="text-white font-bold mb-1">Sub-Executive Body recruitment in progress</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Check back soon or explore the Executive Body leadership.
              </p>
            </div>
          ) : (
            wingNames.map((wingName, wIdx) => {
              const meta = wingMeta[wingName] || {
                tag: "Operational Wing",
                icon: "🏛️",
                description: `Coordinating activities and initiatives under ${wingName}.`,
              };
              const members = wingGroups[wingName];

              return (
                <div key={wingName} className="space-y-6">
                  <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                    <span className="text-2xl p-2 rounded-xl glass border border-white/10">{meta.icon}</span>
                    <div>
                      <span className="striver-tag text-[10px]">{meta.tag}</span>
                      <h3 className="text-xl sm:text-2xl font-extrabold text-white">{wingName}</h3>
                      <p className="text-xs sm:text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
                        {meta.description}
                      </p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {members.map((m, mIdx) => (
                      <ScrollReveal key={m.id} delay={(wIdx * 3 + mIdx) * 60}>
                        <div className="glass rounded-2xl p-6 border border-white/15 card-hover flex flex-col justify-between h-full">
                          <div>
                            <div className="flex items-center gap-3.5 mb-4">
                              <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-extrabold text-lg flex-shrink-0 border border-white/15 shadow overflow-hidden"
                                style={{
                                  background:
                                    mIdx === 0
                                      ? "linear-gradient(135deg, var(--gold-bright), #b45309)"
                                      : "linear-gradient(135deg, var(--un-blue), #0369a1)",
                                }}
                              >
                                {m.image ? (
                                  /* eslint-disable-next-line @next/next/no-img-element */
                                  <img src={m.image} alt={m.name} className="w-full h-full object-cover" />
                                ) : (
                                  m.initial || m.role.charAt(0)
                                )}
                              </div>
                              <div className="min-w-0">
                                <span
                                  className="badge glass text-[9px] font-mono mb-1 inline-block"
                                  style={{ color: "var(--gold-bright)" }}
                                >
                                  {mIdx === 0 ? "Wing Lead" : "Associate Officer"}
                                </span>
                                <h4 className="text-white font-bold text-base truncate">{m.name}</h4>
                              </div>
                            </div>

                            <div className="text-xs font-semibold text-white/80 mb-2">{m.role}</div>
                            <p className="text-xs sm:text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                              {m.description}
                            </p>
                          </div>

                          <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-white/40">
                            <span>NSU SBE / SHSS</span>
                            <span className="text-green-400/90 font-medium">● Active Member</span>
                          </div>
                        </div>
                      </ScrollReveal>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Navigation CTA */}
      <section className="py-20 px-4 border-t border-white/10" style={{ background: "var(--navy-surface)" }}>
        <div className="max-w-4xl mx-auto text-center">
          <span className="striver-tag mb-3">join the sub-executive body</span>
          <h2 className="text-3xl font-extrabold text-white mb-4">
            Aspire to Lead in NSUMUNC?
          </h2>
          <p className="text-base sm:text-lg mb-8" style={{ color: "var(--text-muted)" }}>
            Sub-Executive roles are appointed annually through competitive recruitment, member performance evaluations, and interview boards.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/registration"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm bg-un-blue hover:brightness-110 transition-all shadow-lg"
              style={{ color: "#ffffff" }}
            >
              <span>Apply in Recruitment 15</span>
              <span>↗</span>
            </Link>
            <Link
              href="/executive-body"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm glass border border-white/15 hover:border-gold/40 transition-colors"
              style={{ color: "var(--gold-bright)" }}
            >
              <span>View Executive Body</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
