import Link from "next/link";
import { connection } from "next/server";
import { getSiteContent } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";
import FluidCanvas from "@/components/motion/FluidCanvas";
import MagneticButton from "@/components/motion/MagneticButton";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import EventsClientView from "@/components/EventsClientView";

export const instant = false;

export default async function EventsPage() {
  await connection();
  const { settings, events } = getSiteContent();
  const isAuthedAdmin = await isAdminAuthenticated();

  return (
    <div className="pt-20">
      {/* Header */}
      <section className="relative py-24 px-4 mesh-bg agency-grid-bg overflow-hidden">
        <FluidCanvas />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="mb-3 animate-fade-in-down">
            <span className="striver-tag">{settings.events_header_tag}</span>
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-white mb-5 animate-fade-in-up tracking-tight leading-[1.08]">
            {settings.events_header_title} <span className="gradient-text">{settings.events_header_accent}</span>
          </h1>
          <p
            className="text-base sm:text-xl max-w-2xl mx-auto animate-fade-in-up stagger-2 leading-relaxed"
            style={{ color: "var(--text-muted)" }}
          >
            {settings.events_header_subtitle}
          </p>
        </div>
      </section>

      {/* Events list & filter */}
      <section className="py-20 px-4" style={{ background: "var(--navy-mid)" }}>
        <div className="max-w-5xl mx-auto">
          <EventsClientView events={events} isAdmin={isAuthedAdmin} />
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center agency-grid-bg">
        <ScrollReveal className="max-w-2xl mx-auto glass rounded-3xl p-10 sm:p-12 border border-white/15">
          <span className="striver-tag mb-3">{settings.events_cta_tag}</span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-3">{settings.events_cta_title}</h2>
          <p className="text-base sm:text-lg mb-8 leading-relaxed" style={{ color: "var(--text-muted)" }}>
            {settings.events_cta_subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-3.5 justify-center">
            <MagneticButton>
              <Link
                href={settings.events_cta_btn1_href || "/contact"}
                className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm transition-all hover:brightness-110"
                style={{
                  background: "rgba(20,15,5,0.95)",
                  border: "1px solid rgba(251,191,36,0.48)",
                  color: "var(--gold-bright)",
                }}
              >
                <span>{settings.events_cta_btn1_label || "Get Notified"}</span>
                <span className="striver-arrow">↗</span>
              </Link>
            </MagneticButton>
            <MagneticButton>
              <a
                href={settings.club_facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-7 py-3.5 rounded-xl glass font-bold text-sm text-white transition-all border border-white/20 hover:border-un-blue-bright"
              >
                {settings.events_cta_btn2_label || "Follow on Facebook"}
              </a>
            </MagneticButton>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
