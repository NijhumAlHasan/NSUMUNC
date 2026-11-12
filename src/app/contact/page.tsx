import { connection } from "next/server";
import { getSiteContent } from "@/lib/db";
import FluidCanvas from "@/components/motion/FluidCanvas";
import ContactFormClient from "@/components/ContactFormClient";

export const instant = false;

export default async function ContactPage() {
  await connection();
  const { settings, contactSubjects } = getSiteContent();

  return (
    <div className="pt-20">
      {/* Header */}
      <section className="relative py-24 px-4 mesh-bg agency-grid-bg overflow-hidden">
        <FluidCanvas />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="mb-3 animate-fade-in-down">
            <span className="striver-tag">{settings.contact_header_tag}</span>
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-white mb-5 animate-fade-in-up tracking-tight leading-[1.08]">
            {settings.contact_header_title} <span className="gradient-text">{settings.contact_header_accent}</span>
          </h1>
          <p
            className="text-base sm:text-xl max-w-2xl mx-auto animate-fade-in-up stagger-2 leading-relaxed"
            style={{ color: "var(--text-muted)" }}
          >
            {settings.contact_header_subtitle}
          </p>
        </div>
      </section>

      {/* Contact grid */}
      <section className="py-16 px-4" style={{ background: "var(--navy-mid)" }}>
        <ContactFormClient
          email={settings.club_email}
          facebook={settings.club_facebook}
          instagram={settings.club_instagram}
          followers={settings.club_followers}
          location={settings.club_location}
          channelsTag={settings.contact_channels_tag}
          channelsTitle={settings.contact_channels_title}
          formTitle={settings.contact_form_title}
          formBtnLabel={settings.contact_form_btn_label}
          newsletterTitle={settings.newsletter_title}
          newsletterSubtitle={settings.newsletter_subtitle}
          subjects={contactSubjects}
        />
      </section>
    </div>
  );
}
