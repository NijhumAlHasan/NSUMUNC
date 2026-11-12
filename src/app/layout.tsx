import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { connection } from "next/server";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CustomCursor from "@/components/motion/CustomCursor";
import AdminQuickAccess from "@/components/AdminQuickAccess";
import ScrollProgressTop from "@/components/motion/ScrollProgressTop";
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

  return (
    <html lang="en" className={`${geist.variable} antialiased`}>
      <body className="min-h-screen bg-navy text-white overflow-x-hidden">
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
      </body>
    </html>
  );
}
