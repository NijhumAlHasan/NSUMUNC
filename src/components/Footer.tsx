"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { clubInfo, navLinks } from "@/lib/data";

export default function Footer({
  settings = {},
  isAdmin = false,
}: {
  settings?: Record<string, string>;
  isAdmin?: boolean;
}) {
  const router = useRouter();
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleSecretTrigger = () => {
    clickCountRef.current += 1;
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    if (clickCountRef.current >= 5) {
      clickCountRef.current = 0;
      router.push("/admin");
    } else {
      clickTimerRef.current = setTimeout(() => {
        clickCountRef.current = 0;
      }, 1500);
    }
  };
  const shortName  = settings.club_short_name || clubInfo.shortName;
  const university = settings.club_university || clubInfo.university;
  const tagline    = settings.club_tagline || clubInfo.tagline;
  const logoImage  = settings.club_logo_image || "";
  const nsuLogo    = settings.nsu_logo_image || "/nsu-monogram.svg";
  const nsuLogoShow = settings.nsu_logo_show !== "false";
  const bioExtra   = settings.footer_bio_extra || "Rooted in the legacy of the United Nations — peace, human rights, and international cooperation.";
  const email      = settings.club_email || clubInfo.email;
  const facebook   = settings.club_facebook || clubInfo.facebook;
  const instagram  = settings.club_instagram || clubInfo.instagram;
  const location   = settings.club_location || clubInfo.location;
  const watermark  = settings.footer_watermark || "NSUMUNC · DIPLOMACY";
  const copyright  = settings.footer_copyright || `© 2026 ${clubInfo.name}. All rights reserved.`;

  return (
    <footer
      className="relative overflow-hidden border-t"
      style={{ borderColor: "var(--border-subtle)", background: "var(--navy-mid)" }}
    >
      <div className="divider-glow" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-10 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 mb-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-11 h-11 rounded-2xl glass flex items-center justify-center border border-white/15 overflow-hidden flex-shrink-0" title={shortName}>
                {logoImage ? (
                  <Image src={logoImage} alt={shortName} fill className="object-cover" />
                ) : (
                  <svg viewBox="0 0 40 40" className="w-6 h-6" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.5">
                    <circle cx="20" cy="20" r="17" />
                    <ellipse cx="20" cy="20" rx="8" ry="17" />
                    <line x1="3" y1="20" x2="37" y2="20" />
                  </svg>
                )}
              </div>

              {nsuLogoShow && (
                <div
                  className="relative w-10 h-10 rounded-2xl glass border border-white/20 flex items-center justify-center overflow-hidden bg-white/95 p-1.5 shadow-md flex-shrink-0"
                  title={university}
                >
                  <Image
                    src={nsuLogo}
                    alt={university}
                    fill
                    className="object-contain p-0.5"
                  />
                </div>
              )}

              <div>
                <div className="text-white font-extrabold text-lg">{shortName}</div>
                <div className="text-xs font-medium" style={{ color: "var(--text-faint)" }}>
                  {university}
                </div>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-5" style={{ color: "var(--text-muted)" }}>
              {tagline}. {bioExtra}
            </p>
            <div className="flex gap-2.5">
              {[
                {
                  href: facebook,
                  label: "Facebook",
                  icon: (
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  ),
                  fill: true,
                },
                {
                  href: instagram,
                  label: "Instagram",
                  icon: (
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  ),
                  fill: true,
                },
                {
                  href: `mailto:${email}`,
                  label: "Email",
                  icon: (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  ),
                  fill: false,
                },
              ].map((s, i) => (
                <a
                  key={i}
                  href={s.href}
                  aria-label={s.label}
                  target={s.href.startsWith("http") ? "_blank" : undefined}
                  rel={s.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="glass w-9 h-9 rounded-xl flex items-center justify-center border border-white/15 hover:border-un-blue-bright transition-all hover:scale-110"
                >
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill={s.fill ? "rgba(248,250,255,0.85)" : "none"}
                    stroke={s.fill ? "none" : "rgba(248,250,255,0.85)"}
                  >
                    {s.icon}
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Initiatives & Events */}
          <div>
            <h4 className="text-white font-bold mb-4 text-xs uppercase tracking-widest font-mono">Programs &amp; Events</h4>
            <ul className="space-y-2 text-sm">
              {[
                { href: "/events", label: "All Events & Conferences" },
                { href: "/events", label: "NSUIMUN Editions" },
                { href: "/mdps", label: "Member Development (MDPs)" },
                { href: "/faculty-advisor", label: "Faculty Advisor" },
                { href: "/registration", label: "Delegate Registration" },
              ].map((l, i) => (
                <li key={l.href + i}>
                  <Link
                    href={l.href}
                    className="font-medium transition-colors hover:text-white flex items-center gap-2 group"
                    style={{ color: "var(--text-muted)" }}
                  >
                    <span className="w-1 h-1 rounded-full bg-un-blue group-hover:bg-gold-bright transition-colors" />
                    <span className="group-hover:translate-x-1 transition-transform">{l.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: The Panel & Legacy */}
          <div>
            <h4 className="text-white font-bold mb-4 text-xs uppercase tracking-widest font-mono">The Panel &amp; Club</h4>
            <ul className="space-y-2 text-sm">
              {[
                { href: "/executive-body", label: "Executive Body" },
                { href: "/sub-executive-body", label: "Sub-Executive Body" },
                { href: "/legacy", label: "Legacy & Past Panels" },
                { href: "/about", label: "About & Mission" },
                { href: "/gallery", label: "Photo Gallery" },
              ].map((l, i) => (
                <li key={l.href + i}>
                  <Link
                    href={l.href}
                    className="font-medium transition-colors hover:text-white flex items-center gap-2 group"
                    style={{ color: "var(--text-muted)" }}
                  >
                    <span className="w-1 h-1 rounded-full bg-un-blue group-hover:bg-gold-bright transition-colors" />
                    <span className="group-hover:translate-x-1 transition-transform">{l.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact & Secretariat */}
          <div>
            <h4 className="text-white font-bold mb-4 text-xs uppercase tracking-widest font-mono">Secretariat</h4>
            <div className="space-y-3 text-xs sm:text-sm">
              <a
                href={`mailto:${email}`}
                className="flex items-center gap-2.5 font-medium hover:text-white transition-colors"
                style={{ color: "var(--text-muted)" }}
              >
                <span className="glass w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border border-white/15">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="rgba(248,250,255,0.85)" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </span>
                <span className="truncate">{email}</span>
              </a>

              <div className="flex items-start gap-2.5 font-medium" style={{ color: "var(--text-muted)" }}>
                <span className="glass w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border border-white/15">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="rgba(248,250,255,0.85)" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </span>
                <span className="leading-snug">{location}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Striver-style Giant Brand Display Signature */}
        <div className="py-4 text-center select-none overflow-hidden max-w-full">
          <div className="text-2xl xs:text-3xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter uppercase outline-text truncate">
            {watermark}
          </div>
        </div>

        <div className="divider-glow my-6" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm font-medium" style={{ color: "var(--text-faint)" }}>
          <p
            onClick={handleSecretTrigger}
            className="cursor-default select-none transition-colors"
          >
            {copyright} &mdash;{" "}
            <span style={{ color: "var(--gold-bright)" }}>{tagline}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
