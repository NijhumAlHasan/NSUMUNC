import Link from "next/link";
import { connection } from "next/server";
import { getSiteContent } from "@/lib/db";
import FluidCanvas from "@/components/motion/FluidCanvas";
import { ScrollReveal, SectionHeading } from "@/components/motion/ScrollReveal";
import { KineticMarquee } from "@/components/motion/KineticMarquee";
import CardSpotlight from "@/components/motion/CardSpotlight";

export const instant = false;

export default async function MdpsPage() {
  await connection();
  const { settings, marqueeItems } = getSiteContent();

  const mdpPillars = [
    {
      num: "01",
      title: "UN Rules of Procedure (RoP)",
      tag: "Diplomatic Protocol",
      description:
        "Master the formal procedures governing UN General Assembly, Security Council, and specialized committees. Learn moderated caucuses, points of order, right of reply, and procedural voting.",
      icon: "📜",
      topics: ["Speakers' List & Points", "Working Papers & Draft Resolutions", "Amendment Procedures"],
    },
    {
      num: "02",
      title: "Foreign Policy Research & Position Papers",
      tag: "Strategic Academics",
      description:
        "In-depth geopolitical analysis and dossier construction. Delegates learn how to analyze UN treaties, align national interest with international law, and draft compelling position papers.",
      icon: "🌐",
      topics: ["Treaty Analysis & UN Charters", "Country Dossier Formulation", "Policy Consistency"],
    },
    {
      num: "03",
      title: "Diplomatic Oratory & Lobbying",
      tag: "Oratory & Negotiation",
      description:
        "Transform nervousness into persuasive eloquence. Training covers unmoderated caucus diplomacy, bloc building, cross-table compromise, and delivering high-stakes speeches.",
      icon: "🎙️",
      topics: ["High-Impact Speeches", "Bloc Consolidation & Alliance", "Compromise & Crisis Bargaining"],
    },
    {
      num: "04",
      title: "Real-Time Crisis Simulations",
      tag: "High-Pressure Lab",
      description:
        "Simulated emergency sessions where delegates respond to breaking international conflicts, military escalations, and humanitarian crises with fast directives and emergency communiqués.",
      icon: "⚡",
      topics: ["Emergency Directives", "Backchannel Intelligence", "Cabinet Maneuvering"],
    },
  ];

  const upcomingWorkshops = [
    {
      title: "RoP Masterclass: Shaping Resolution Consensus",
      date: "Saturday, November 28, 2026",
      time: "4:00 PM – 7:00 PM",
      venue: "AUDI801, North South University",
      instructor: "Secretariat Academic Board",
      badge: "Open for All Members",
    },
    {
      title: "Geopolitics & Bilateral Bargaining Workshop",
      date: "Friday, December 04, 2026",
      time: "5:00 PM – 8:00 PM",
      venue: "NAC514, North South University",
      instructor: "Alumni Delegation Diplomats",
      badge: "Intensive Lab",
    },
    {
      title: "Mock Security Council Crisis Simulation",
      date: "Saturday, December 19, 2026",
      time: "10:00 AM – 6:00 PM",
      venue: "Recreation Hall, NSU",
      instructor: "External International Chairs",
      badge: "Full-Day Simulation",
    },
  ];

  return (
    <div className="pt-20">
      {/* Header */}
      <section className="relative py-24 px-4 mesh-bg agency-grid-bg overflow-hidden">
        <FluidCanvas />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="mb-3 animate-fade-in-down">
            <span className="striver-tag">skill development · leadership</span>
          </div>
          <h1 className="text-4xl xs:text-5xl sm:text-6xl md:text-7xl font-extrabold text-white mb-5 animate-fade-in-up tracking-tight leading-[1.08]">
            Member Development <span className="gradient-text">Programs</span>
          </h1>
          <p
            className="text-base sm:text-xl max-w-2xl mx-auto animate-fade-in-up stagger-2 leading-relaxed"
            style={{ color: "var(--text-muted)" }}
          >
            Enhancing diplomatic skills, building future global leaders. NSUMUNC conducts year-round Member Development Programs (MDPs) designed to transform novices into world-class delegates.
          </p>
        </div>
      </section>

      <KineticMarquee items={marqueeItems} />

      {/* 4 Pillars of MDP */}
      <section className="py-20 px-4" style={{ background: "var(--navy-mid)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-14">
            <SectionHeading
              tag="curriculum pillars"
              title="Four Foundational"
              accent="Diplomacy Pillars"
              subtitle="Every NSUMUNC recruit undergoes comprehensive training across four rigorous modules crafted by seasoned MUNers and international delegation awardees."
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {mdpPillars.map((p, i) => (
              <ScrollReveal key={p.num} delay={i * 100}>
                <CardSpotlight glowColor="rgba(14, 165, 233, 0.2)" className="rounded-2xl border border-white/15 h-full">
                  <div className="glass rounded-[inherit] p-7 sm:p-8 flex flex-col justify-between h-full">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-3xl">{p.icon}</span>
                        <span className="font-mono text-xl font-black gradient-text-gold">{p.num}</span>
                      </div>
                      <span className="striver-tag mb-2">{p.tag}</span>
                      <h3 className="text-white font-extrabold text-2xl mb-3">{p.title}</h3>
                      <p className="text-sm sm:text-base leading-relaxed mb-6" style={{ color: "var(--text-muted)" }}>
                        {p.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-white/10">
                      <div className="text-xs uppercase tracking-widest font-mono mb-2" style={{ color: "var(--gold-bright)" }}>
                        Core Modules Covered:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {p.topics.map((t) => (
                          <span
                            key={t}
                            className="text-xs px-2.5 py-1 rounded-md glass border border-white/10"
                            style={{ color: "var(--text-base)" }}
                          >
                            ✓ {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardSpotlight>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming MDP Workshops */}
      <section className="py-24 px-4 agency-grid-bg">
        <div className="max-w-7xl mx-auto">
          <div className="mb-14">
            <SectionHeading
              tag="calendar"
              title="Upcoming"
              accent="MDP Workshops"
              subtitle="Hands-on interactive sessions scheduled for current members and executive trainees."
            />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {upcomingWorkshops.map((w, i) => (
              <ScrollReveal key={w.title} delay={i * 120}>
                <div className="glass rounded-2xl p-6 sm:p-7 border border-white/15 card-hover flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="badge glass-blue text-[10px]" style={{ color: "var(--un-blue-bright)" }}>
                        {w.badge}
                      </span>
                      <span className="text-xs font-mono" style={{ color: "var(--text-faint)" }}>
                        Phase {i + 1}
                      </span>
                    </div>
                    <h3 className="text-white font-bold text-lg mb-4">{w.title}</h3>
                    <div className="space-y-2 text-xs sm:text-sm font-medium mb-6" style={{ color: "var(--text-muted)" }}>
                      <div className="flex items-center gap-2">
                        <span>📅</span>
                        <span>{w.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>⏰</span>
                        <span>{w.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>📍</span>
                        <span>{w.venue}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>👤</span>
                        <span style={{ color: "var(--gold-bright)" }}>{w.instructor}</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl glass font-bold text-xs hover:border-gold/40 transition-colors"
                    style={{ color: "var(--gold-bright)" }}
                  >
                    <span>RSVP for Session</span>
                    <span>→</span>
                  </Link>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 px-4 border-t border-white/10" style={{ background: "var(--navy-surface)" }}>
        <div className="max-w-4xl mx-auto text-center">
          <span className="striver-tag mb-3">join the diplomatic circle</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Ready to Accelerate Your Speaking and Diplomatic Skills?
          </h2>
          <p className="text-base sm:text-lg mb-8" style={{ color: "var(--text-muted)" }}>
            NSUMUNC members get priority access to all MDP sessions, private resolution clinics, and international delegation subsidies.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/registration"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm bg-un-blue hover:brightness-110 transition-all shadow-lg"
              style={{ color: "#ffffff" }}
            >
              <span>Apply for Recruitment</span>
              <span>↗</span>
            </Link>
            <Link
              href="/events"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm glass border border-white/15 hover:border-gold/40 transition-colors"
              style={{ color: "var(--gold-bright)" }}
            >
              <span>Explore Flagship Events</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
