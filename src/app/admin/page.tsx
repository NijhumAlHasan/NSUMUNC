import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import AdminDashboard from "@/components/admin/AdminDashboard";
import { getDb, DEFAULT_SETTINGS } from "@/lib/db";

export const instant = false;

export default async function AdminPage() {
  const authed = await isAdminAuthenticated();
  if (!authed) redirect("/admin/login");

  const db = getDb();
  const announcements = db.prepare("SELECT * FROM announcements ORDER BY created_at DESC").all();
  const events        = db.prepare("SELECT * FROM events ORDER BY sort_order ASC, id ASC").all();
  const team          = db.prepare("SELECT * FROM team_members ORDER BY sort_order ASC, id ASC").all();
  const achievements  = db.prepare("SELECT * FROM achievements ORDER BY sort_order ASC, id ASC").all();
  const gallery       = db.prepare("SELECT * FROM gallery_items ORDER BY sort_order ASC, id ASC").all();
  const messages      = db.prepare("SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 100").all();
  const subscribers   = db.prepare("SELECT * FROM newsletter_subscribers ORDER BY created_at DESC LIMIT 500").all();
  const settingsRows  = db.prepare("SELECT * FROM site_settings").all() as { key: string; value: string }[];

  const settings: Record<string, string> = { ...DEFAULT_SETTINGS };
  settingsRows.forEach((r) => {
    if (r.key !== "admin_password") {
      settings[r.key] = r.value;
    }
  });

  return (
    <AdminDashboard
      initialAnnouncements={announcements as never}
      initialEvents={events as never}
      initialTeam={team as never}
      initialAchievements={achievements as never}
      initialGallery={gallery as never}
      initialMessages={messages as never}
      initialSubscribers={subscribers as never}
      initialSettings={settings}
    />
  );
}
