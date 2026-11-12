import { connection } from "next/server";
import { getSiteContent } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";
import FluidCanvas from "@/components/motion/FluidCanvas";
import MagneticButton from "@/components/motion/MagneticButton";
import GalleryClientView from "@/components/GalleryClientView";

export const instant = false;

export default async function GalleryPage() {
  await connection();
  const { settings, gallery } = getSiteContent();
  const isAuthedAdmin = await isAdminAuthenticated();

  return (
    <div className="pt-20">
      {/* Header */}
      <section className="relative py-24 px-4 mesh-bg agency-grid-bg overflow-hidden">
        <FluidCanvas />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="mb-3 animate-fade-in-down">
            <span className="striver-tag">{settings.gallery_header_tag}</span>
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-white mb-5 animate-fade-in-up tracking-tight leading-[1.08]">
            {settings.gallery_header_title} <span className="gradient-text">{settings.gallery_header_accent}</span>
          </h1>
          <p
            className="text-base sm:text-xl max-w-2xl mx-auto animate-fade-in-up stagger-2 leading-relaxed"
            style={{ color: "var(--text-muted)" }}
          >
            {settings.gallery_header_subtitle}
          </p>
        </div>
      </section>

      {/* Gallery grid & interactive filters */}
      <section className="py-16 px-4 pb-20" style={{ background: "var(--navy-mid)" }}>
        <div className="max-w-7xl mx-auto">
          <GalleryClientView gallery={gallery} isAdmin={isAuthedAdmin} />
        </div>
      </section>

      {/* Social links */}
      <section className="py-14 px-4 text-center pb-20 agency-grid-bg">
        <p className="text-sm sm:text-base font-medium mb-5" style={{ color: "var(--text-muted)" }}>
          {settings.gallery_social_text || "See more high-resolution albums on our official social channels"}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <MagneticButton>
            <a
              href={settings.club_facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl glass-blue font-bold text-sm transition-all border"
              style={{ color: "var(--un-blue-bright)", borderColor: "rgba(56,189,248,0.35)" }}
            >
              <span>{settings.gallery_fb_label || "Facebook Photos"}</span>
              <span className="striver-arrow">↗</span>
            </a>
          </MagneticButton>
          <MagneticButton>
            <a
              href={settings.club_instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl glass-gold font-bold text-sm transition-all border"
              style={{ color: "var(--gold-bright)", borderColor: "rgba(251,191,36,0.35)" }}
            >
              <span>{settings.gallery_ig_label || "Instagram · @nsumunc"}</span>
              <span className="striver-arrow">↗</span>
            </a>
          </MagneticButton>
        </div>
      </section>
    </div>
  );
}
