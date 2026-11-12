"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavItem, defaultNavItems } from "@/lib/nav";
import MagneticButton from "@/components/motion/MagneticButton";

export default function Navbar({
  shortName = "NSUMUNC",
  university = "North South University",
  logoImage = "",
  nsuLogoImage = "/nsu-monogram.svg",
  nsuLogoShow = true,
  ctaLabel = "Join Us",
  ctaHref = "/contact",
  ctaShow = true,
  navItems,
}: {
  shortName?: string;
  university?: string;
  logoImage?: string;
  nsuLogoImage?: string;
  nsuLogoShow?: boolean;
  ctaLabel?: string;
  ctaHref?: string;
  ctaShow?: boolean;
  navItems?: NavItem[];
}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<Record<string, boolean>>({});
  const pathname = usePathname();

  const items = (navItems && navItems.length > 0 ? navItems : defaultNavItems).filter(
    (item) => item.is_active !== false
  );

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    setOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const toggleMobileAccordion = (id: string) => {
    setMobileExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "glass-dark py-2.5 shadow-2xl border-b border-white/10" : "bg-transparent py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Logo */}
        <MagneticButton strength={0.22}>
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group">
            {/* Club Logo Badge */}
            <div className="relative w-10 h-10 flex-shrink-0" title={`${shortName} Emblem`}>
              <div className="absolute inset-0 rounded-full bg-un-blue/20 animate-pulse-ring" />
              <div className="relative w-10 h-10 rounded-full glass border border-white/20 flex items-center justify-center group-hover:border-un-blue-bright transition-colors overflow-hidden">
                {logoImage ? (
                  <Image src={logoImage} alt={shortName} fill className="object-cover" />
                ) : (
                  <svg
                    viewBox="0 0 40 40"
                    className="w-6 h-6 group-hover:rotate-45 transition-transform duration-500"
                    fill="none"
                    stroke="rgba(255,255,255,0.92)"
                    strokeWidth="1.6"
                  >
                    <circle cx="20" cy="20" r="17" />
                    <ellipse cx="20" cy="20" rx="8" ry="17" />
                    <line x1="3" y1="20" x2="37" y2="20" />
                  </svg>
                )}
              </div>
            </div>

            {/* Official North South University Monogram Badge */}
            {nsuLogoShow && (
              <div
                className="relative w-9 h-9 rounded-full glass border border-white/20 flex items-center justify-center overflow-hidden bg-white/95 p-1 shadow-md group-hover:border-gold/40 transition-colors flex-shrink-0"
                title={university}
              >
                <Image
                  src={nsuLogoImage || "/nsu-monogram.svg"}
                  alt={university}
                  fill
                  className="object-contain p-0.5"
                />
              </div>
            )}

            <div>
              <div className="text-white font-extrabold text-base leading-none tracking-wider">
                {shortName}
              </div>
              <div className="text-xs leading-none mt-1 font-medium" style={{ color: "var(--text-faint)" }}>
                {university}
              </div>
            </div>
          </Link>
        </MagneticButton>

        {/* Desktop Navigation Links with Dropdowns */}
        <div className="hidden md:flex items-center gap-1">
          {items.map((item) => {
            const hasChildren = item.children && item.children.length > 0;
            const isChildActive = hasChildren && item.children?.some((c) => pathname === c.href);
            const isSelfActive = item.href ? pathname === item.href : false;
            const isActive = isSelfActive || isChildActive;

            if (hasChildren) {
              const isOpen = activeDropdown === item.id;
              const activeChildren = item.children?.filter((c) => c.is_active !== false) || [];

              return (
                <div
                  key={item.id}
                  className="relative"
                  onMouseEnter={() => setActiveDropdown(item.id)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button
                    type="button"
                    onClick={() => setActiveDropdown(isOpen ? null : item.id)}
                    className="px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 relative group"
                    style={{ color: isActive ? "var(--gold-bright)" : "var(--text-base)" }}
                    aria-expanded={isOpen}
                  >
                    {isActive && <span className="absolute inset-0 rounded-lg glass-blue opacity-75" />}
                    <span className="relative group-hover:text-white transition-colors">{item.label}</span>
                    <svg
                      className={`w-3.5 h-3.5 transition-transform duration-200 relative ${isOpen ? "rotate-180 text-gold" : "text-white/60"}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {isOpen && (
                    <div
                      className="absolute top-full left-0 mt-1 min-w-[210px] rounded-xl glass-dark border border-white/15 p-2 shadow-2xl animate-fade-in-down z-50 backdrop-blur-xl"
                      style={{ background: "rgba(5, 8, 20, 0.94)" }}
                    >
                      <div className="space-y-1">
                        {activeChildren.map((child, idx) => {
                          const childActive = pathname === child.href;
                          return (
                            <Link
                              key={child.href + idx}
                              href={child.href}
                              onClick={() => setActiveDropdown(null)}
                              className="flex items-center justify-between px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all group"
                              style={{
                                color: childActive ? "var(--gold-bright)" : "var(--text-base)",
                                background: childActive ? "rgba(251, 191, 36, 0.1)" : "transparent",
                              }}
                            >
                              <span className="group-hover:text-white group-hover:translate-x-0.5 transition-all">
                                {child.label}
                              </span>
                              {childActive && (
                                <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--gold-bright)" }} />
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.id}
                href={item.href || "/"}
                className="px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 relative group"
                style={{ color: isActive ? "var(--text-base)" : "var(--text-muted)" }}
              >
                {isActive && <span className="absolute inset-0 rounded-lg glass-blue opacity-90" />}
                <span className="relative group-hover:text-white transition-colors">{item.label}</span>
              </Link>
            );
          })}

          {/* Header CTA Button (deletable / toggleable) */}
          {ctaShow && (
            <MagneticButton strength={0.25} className="ml-2">
              <Link
                href={ctaHref || "/contact"}
                className="group inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all hover:brightness-110"
                style={{
                  background: "rgba(20, 15, 5, 0.92)",
                  border: "1px solid rgba(251, 191, 36, 0.45)",
                  color: "var(--gold-bright)",
                }}
              >
                <span>{ctaLabel || "Join Us"}</span>
                <span className="striver-arrow text-xs">↗</span>
              </Link>
            </MagneticButton>
          )}
        </div>

        {/* Mobile menu button with 44px min tap target */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden glass w-11 h-11 rounded-xl flex items-center justify-center border border-white/20 active:scale-95 transition-transform"
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Drawer + Tap-outside Backdrop */}
      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            className="fixed inset-0 top-[60px] bg-black/75 backdrop-blur-sm z-40 md:hidden animate-fade-in"
          />
          <div className="relative z-50 md:hidden glass-dark border border-white/15 mt-2 mx-3 rounded-2xl overflow-hidden shadow-2xl animate-fade-in-down max-h-[calc(100vh-80px)] overflow-y-auto">
            <div className="py-2 divide-y divide-white/5">
              {items.map((item) => {
                const hasChildren = item.children && item.children.length > 0;
                const isChildActive = hasChildren && item.children?.some((c) => pathname === c.href);
                const isSelfActive = item.href ? pathname === item.href : false;
                const isActive = isSelfActive || isChildActive;
                const isExpanded = !!mobileExpanded[item.id];
                const activeChildren = item.children?.filter((c) => c.is_active !== false) || [];

                if (hasChildren) {
                  return (
                    <div key={item.id} className="flex flex-col">
                      <button
                        type="button"
                        onClick={() => toggleMobileAccordion(item.id)}
                        className="flex items-center justify-between px-6 min-h-[50px] text-base font-semibold transition-colors hover:bg-white/5 active:bg-white/10 w-full text-left"
                        style={{ color: isActive ? "var(--gold-bright)" : "var(--text-base)" }}
                      >
                        <span>{item.label}</span>
                        <svg
                          className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? "rotate-180 text-gold" : "text-white/60"}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {isExpanded && (
                        <div className="bg-black/30 px-6 py-2 space-y-1 border-t border-white/5">
                          {activeChildren.map((child, cIdx) => {
                            const childActive = pathname === child.href;
                            return (
                              <Link
                                key={child.href + cIdx}
                                href={child.href}
                                onClick={() => setOpen(false)}
                                className="flex items-center justify-between py-2.5 px-3 rounded-lg text-sm font-medium transition-colors hover:bg-white/5"
                                style={{ color: childActive ? "var(--gold-bright)" : "var(--text-muted)" }}
                              >
                                <span>{child.label}</span>
                                {childActive && (
                                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--gold-bright)" }} />
                                )}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.id}
                    href={item.href || "/"}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between px-6 min-h-[50px] text-base font-semibold transition-colors hover:bg-white/5 active:bg-white/10"
                    style={{ color: isActive ? "var(--gold-bright)" : "var(--text-base)" }}
                  >
                    <span>{item.label}</span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--gold-bright)" }} />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Mobile CTA */}
            {ctaShow && (
              <div className="p-4 pt-2">
                <Link
                  href={ctaHref || "/contact"}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 text-center py-3.5 rounded-xl font-bold text-base shadow-lg transition-transform active:scale-[0.98]"
                  style={{
                    background: "linear-gradient(135deg, rgba(20, 15, 5, 0.98), rgba(30, 20, 5, 0.98))",
                    border: "1px solid rgba(251, 191, 36, 0.5)",
                    color: "var(--gold-bright)",
                  }}
                >
                  <span>{ctaLabel || "Join Us"}</span>
                  <span>✦</span>
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </nav>
  );
}
