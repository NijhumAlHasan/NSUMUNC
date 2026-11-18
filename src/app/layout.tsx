import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { connection } from "next/server";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CustomCursor from "@/components/motion/CustomCursor";
import AdminQuickAccess from "@/components/AdminQuickAccess";
import ScrollProgressTop from "@/components/motion/ScrollProgressTop";
import { cookies, headers } from "next/headers";
import Link from "next/link";
import { getSiteContent } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const instant = false;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#03060f",
};

export const metadata: Metadata = {
  title: "NSU Model UN Club | Diplomacy at its Best",
  description:
    "The NSU Model UN Club — NSUMUNC — at North South University, Dhaka. Organizers of NSUIMUN, the largest MUN conference in Bangladesh.",
  keywords: ["NSU Model UN", "NSUMUNC", "NSUIMUN", "Model United Nations Bangladesh", "Diplomacy NSU"],
  openGraph: {
    title: "NSU Model UN Club | Diplomacy at its Best",
    description: "One of North South University's most prestigious clubs. Join us at NSUIMUN.",
    type: "website",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  await connection();
  const { settings, navItems } = getSiteContent();
  const isAuthedAdmin = await isAdminAuthenticated();

  const cookieStore = await cookies();
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  const host = headersList.get("host") || "";
  const isLocalhost = host.includes("localhost") || host.startsWith("127.0.0.1");

  const isBypassRoute =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/invite") ||
    pathname.startsWith("/api");

  const visitorDeviceId = cookieStore.get("nsumunc_preview_device")?.value;
  const isPreviewActive = settings.preview_mode_active === "true";
  const claimedDevice = settings.preview_claimed_device;

  const isAuthorizedViewer =
    !isPreviewActive ||
    isAuthedAdmin ||
    isBypassRoute ||
    isLocalhost ||
    (Boolean(claimedDevice) && visitorDeviceId === claimedDevice);

  return (
    <html lang="en" className={`${geist.variable} antialiased`}>
      <body className="min-h-screen bg-navy text-white overflow-x-hidden">
        {!isAuthorizedViewer ? (
          <div className="min-h-screen flex items-center justify-center p-4 bg-navy text-white text-center">
            <div className="glass rounded-3xl p-8 sm:p-10 max-w-lg border border-white/15 shadow-2xl">
              <div
                className="w-16 h-16 rounded-full glass border border-gold/30 mx-auto flex items-center justify-center text-3xl mb-4"
                style={{ background: "rgba(251, 191, 36, 0.1)" }}
              >
                🔒
              </div>
              <span
                className="badge text-[10px] font-mono tracking-widest uppercase mb-2 inline-block"
                style={{ color: "var(--gold-bright)", borderColor: "rgba(251,191,36,0.3)" }}
              >
                Restricted Preview Access
              </span>
              <h1 className="text-3xl font-extrabold mb-3 text-white">Private Preview Only</h1>
              <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--text-muted)" }}>
                This website preview is strictly locked to 1 authorized device. You must open your authorized invite link to unlock access.
              </p>
              <div className="pt-5 border-t border-white/10 flex items-center justify-center gap-4 text-xs font-semibold">
                <Link href="/admin/login" className="text-white/50 hover:text-white transition-colors">
                  Site Owner Login →
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <>
            <CustomCursor />
            <ScrollProgressTop />
            <AdminQuickAccess isAdmin={isAuthedAdmin} />
            <Navbar
              shortName={settings.club_short_name}
              university={settings.club_university}
              logoImage={settings.club_logo_image}
              nsuLogoImage={settings.nsu_logo_image || "/nsu-monogram.svg"}
              nsuLogoShow={settings.nsu_logo_show !== "false"}
              ctaLabel={settings.nav_cta_label}
              ctaHref={settings.nav_cta_href}
              ctaShow={settings.nav_cta_show !== "false"}
              navItems={navItems}
            />
            <main>{children}</main>
            <Footer settings={settings} isAdmin={isAuthedAdmin} />
          </>
        )}
      </body>
    </html>
  );
}
