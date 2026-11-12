"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type {
  Announcement,
  DbEvent,
  TeamMember,
  DbAchievement,
  DbGalleryItem,
  ContactMessage,
  NewsletterSubscriber,
} from "@/lib/db";
import { type FacultyAdvisorData, defaultFacultyAdvisor } from "@/lib/advisor";
import { type NavItem, defaultNavItems } from "@/lib/nav";

type Tab =
  | "navigation"
  | "home"
  | "about"
  | "events"
  | "faculty"
  | "team"
  | "gallery"
  | "contact"
  | "branding";

type Props = {
  initialAnnouncements: Announcement[];
  initialEvents: DbEvent[];
  initialTeam: TeamMember[];
  initialAchievements: DbAchievement[];
  initialGallery: DbGalleryItem[];
  initialMessages: ContactMessage[];
  initialSubscribers: NewsletterSubscriber[];
  initialSettings: Record<string, string>;
};

/* ── Shared UI helpers ── */
function Label({ children }: { children: React.ReactNode }) {
  return (
    <label
      className="block text-xs font-bold uppercase tracking-wider mb-1.5"
      style={{ color: "var(--text-muted)" }}
    >
      {children}
    </label>
  );
}
function Input({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className="input-glass w-full" />;
}
function Textarea({ ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className="input-glass w-full resize-none" rows={props.rows ?? 3} />;
}
function Select({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className="input-glass w-full" style={{ background: "rgba(3,6,15,0.88)" }}>
      {children}
    </select>
  );
}
function Btn({
  children,
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "danger" | "ghost" }) {
  const styles = {
    primary: { background: "var(--un-blue)", color: "white" },
    danger: {
      background: "rgba(239,68,68,0.15)",
      border: "1px solid rgba(239,68,68,0.35)",
      color: "#f87171",
    },
    ghost: {
      background: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(255,255,255,0.15)",
      color: "var(--text-base)",
    },
  };
  return (
    <button
      {...props}
      className="px-4 py-2 rounded-xl text-sm font-bold transition-all hover:brightness-110 hover:scale-[1.02] disabled:opacity-50 flex items-center gap-1.5"
      style={styles[variant]}
    >
      {children}
    </button>
  );
}

/**
 * Reusable Image Upload + Live Thumbnail Preview + URL field
 */
function ImageField({
  label = "Photo / Image",
  value,
  onChange,
  notify,
}: {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  notify?: (text: string, type?: "ok" | "err") => void;
}) {
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok && data.url) {
        onChange(data.url);
        notify?.("Photo uploaded! Click Save to publish.", "ok");
      } else {
        notify?.(data.error || "Upload failed", "err");
      }
    } catch {
      notify?.("Network error while uploading photo", "err");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <Label>{label}</Label>
      <div className="flex gap-2.5 items-center">
        {value ? (
          <div className="w-11 h-11 rounded-xl overflow-hidden border border-white/20 flex-shrink-0 bg-black/40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div
            className="w-11 h-11 rounded-xl border border-dashed border-white/20 flex items-center justify-center text-xs flex-shrink-0"
            style={{ color: "var(--text-faint)" }}
          >
            IMG
          </div>
        )}
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="/emun-team.jpg or click Upload →"
        />
        <label
          className="cursor-pointer px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap border transition-all hover:brightness-110 flex-shrink-0"
          style={{
            background: "rgba(20, 15, 5, 0.92)",
            borderColor: "rgba(251, 191, 36, 0.45)",
            color: "var(--gold-bright)",
          }}
        >
          {uploading ? "Uploading…" : "📤 Upload"}
          <input type="file" accept="image/*" onChange={handleFile} className="hidden" disabled={uploading} />
        </label>
      </div>
    </div>
  );
}

/**
 * Helper to render a clean grid of setting fields and save them with 1 click
 */
function SettingsCard({
  title,
  subtitle,
  fields,
  settings,
  onSettingsChange,
  onSaveKeys,
  saving,
  notify,
}: {
  title: string;
  subtitle?: string;
  fields: [string, string, string, ("text" | "textarea" | "image")?][];
  settings: Record<string, string>;
  onSettingsChange: (s: Record<string, string>) => void;
  onSaveKeys: (keys: string[]) => void;
  saving: boolean;
  notify?: (text: string, type?: "ok" | "err") => void;
}) {
  return (
    <div className="glass rounded-2xl p-6 border border-white/15">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
        <div>
          <h2 className="text-white font-extrabold text-lg">{title}</h2>
          {subtitle && (
            <p className="text-xs mt-0.5" style={{ color: "var(--text-faint)" }}>
              {subtitle}
            </p>
          )}
        </div>
        <Btn onClick={() => onSaveKeys(fields.map((f) => f[0]))} disabled={saving}>
          {saving ? "Saving…" : "💾 Save Section"}
        </Btn>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {fields.map(([key, label, ph, kind = "text"]) => (
          <div key={key} className={kind === "textarea" || kind === "image" ? "sm:col-span-2" : ""}>
            <div className="flex items-center justify-between mb-1">
              <Label>{label}</Label>
              {settings[key] ? (
                <button
                  type="button"
                  onClick={() => onSettingsChange({ ...settings, [key]: "" })}
                  className="text-[10px] text-red-400/80 hover:text-red-300 font-bold px-1.5 py-0.5 rounded hover:bg-red-500/10 transition-colors"
                  title={`Clear ${label}`}
                >
                  ✕ Clear
                </button>
              ) : null}
            </div>
            {kind === "image" ? (
              <ImageField
                label=""
                value={settings[key] ?? ""}
                onChange={(url) => onSettingsChange({ ...settings, [key]: url })}
                notify={notify}
              />
            ) : kind === "textarea" ? (
              <Textarea
                rows={3}
                value={settings[key] ?? ""}
                onChange={(e) => onSettingsChange({ ...settings, [key]: e.target.value })}
                placeholder={ph}
              />
            ) : (
              <Input
                value={settings[key] ?? ""}
                onChange={(e) => onSettingsChange({ ...settings, [key]: e.target.value })}
                placeholder={ph}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Main Dashboard ── */
export default function AdminDashboard({
  initialAnnouncements,
  initialEvents,
  initialTeam,
  initialAchievements,
  initialGallery,
  initialMessages,
  initialSubscribers,
  initialSettings,
}: Props) {
  const [tab, setTab] = useState<Tab>("home");
  const [settings, setSettings] = useState<Record<string, string>>(initialSettings);
  const [savingSettings, setSavingSettings] = useState(false);
  const [toast, setToast] = useState<{ text: string; type: "ok" | "err" } | null>(null);
  const router = useRouter();

  const notify = (text: string, type: "ok" | "err" = "ok") => {
    setToast({ text, type });
    setTimeout(() => {
      setToast((prev) => (prev?.text === text ? null : prev));
    }, 4500);
  };

  const saveSettingsSubset = async (updates: Record<string, string>, successMessage = "Changes saved to live website ✓") => {
    setSavingSettings(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });
      const data = await res.json();
      if (!res.ok) {
        notify(data.error || "Failed to save changes", "err");
      } else {
        setSettings((prev) => ({ ...prev, ...updates }));
        notify(successMessage, "ok");
        router.refresh();
      }
    } catch {
      notify("Network error while saving settings", "err");
    } finally {
      setSavingSettings(false);
    }
  };

  const saveSettingsKeys = async (keys: string[]) => {
    const subset: Record<string, string> = {};
    for (const k of keys) {
      subset[k] = settings[k] ?? "";
    }
    await saveSettingsSubset(subset);
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  const unread = initialMessages.filter((m) => !m.is_read).length;

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "navigation",   label: "🧭 Header" },
    { id: "home",         label: "🏠 Home" },
    { id: "about",        label: "📖 About" },
    { id: "events",       label: "📅 Events", count: initialEvents.length },
    { id: "faculty",      label: "🎓 Faculty Advisor" },
    { id: "team",         label: "👥 Team", count: initialTeam.length },
    { id: "gallery",      label: "🖼️ Gallery", count: initialGallery.length },
    { id: "contact",      label: "✉️ Contact", count: unread || undefined },
    { id: "branding",     label: "🌐 Settings" },
  ];

  return (
    <div className="min-h-screen pt-16 pb-20" style={{ background: "var(--navy-mid)" }}>
      {/* Floating Toast Notification */}
      {toast && (
        <div
          className="fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-2xl font-bold text-sm flex items-center gap-3 border animate-fade-in-up"
          style={{
            background: toast.type === "ok" ? "rgba(6, 38, 22, 0.96)" : "rgba(45, 10, 14, 0.96)",
            borderColor: toast.type === "ok" ? "#4ade80" : "#f87171",
            color: toast.type === "ok" ? "#4ade80" : "#f87171",
          }}
        >
          <span>{toast.type === "ok" ? "✅" : "⚠️"}</span>
          <span>{toast.text}</span>
          <button onClick={() => setToast(null)} className="ml-2 text-xs opacity-75 hover:opacity-100">
            ✕
          </button>
        </div>
      )}

      {/* Top bar */}
      <header
        className="glass-dark border-b sticky top-16 z-40 px-4 sm:px-6 py-3"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, var(--un-blue), var(--gold))" }}
            >
              <svg viewBox="0 0 40 40" className="w-5 h-5" fill="none" stroke="white" strokeWidth="2">
                <circle cx="20" cy="20" r="17" />
                <ellipse cx="20" cy="20" rx="8" ry="17" />
                <line x1="3" y1="20" x2="37" y2="20" />
              </svg>
            </div>
            <div>
              <span className="text-white font-extrabold text-sm sm:text-base">Admin Control Center</span>
              <span className="text-xs ml-2 hidden sm:inline" style={{ color: "var(--gold-bright)" }}>
                Easy Page-by-Page Editor
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/"
              target="_blank"
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold border border-white/15 transition-all hover:border-white/30"
              style={{ color: "var(--text-base)" }}
            >
              View Live Site ↗
            </a>
            <button
              onClick={handleLogout}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-all hover:border-red-500/40"
              style={{ color: "#f87171", borderColor: "rgba(239,68,68,0.25)" }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Page-by-page Tab nav */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap"
              style={{
                background: tab === t.id ? "var(--un-blue)" : "rgba(255,255,255,0.05)",
                color: tab === t.id ? "white" : "var(--text-muted)",
                border: tab === t.id ? "none" : "1px solid rgba(255,255,255,0.1)",
              }}
            >
              {t.label}
              {t.count !== undefined && (
                <span
                  className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                  style={{
                    background: tab === t.id ? "rgba(255,255,255,0.25)" : "var(--un-blue)",
                    color: "white",
                  }}
                >
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* 0. HEADER & NAVIGATION TAB */}
        {tab === "navigation" && (
          <NavigationTab
            settings={settings}
            onSaveSubset={saveSettingsSubset}
            saving={savingSettings}
            notify={notify}
          />
        )}

        {/* 1. HOME PAGE TAB */}
        {tab === "home" && (
          <HomePageTab
            initialAnnouncements={initialAnnouncements}
            settings={settings}
            onSettingsChange={setSettings}
            onSaveKeys={saveSettingsKeys}
            onSaveSubset={saveSettingsSubset}
            saving={savingSettings}
            notify={notify}
          />
        )}

        {/* 2. ABOUT PAGE TAB */}
        {tab === "about" && (
          <AboutPageTab
            settings={settings}
            onSettingsChange={setSettings}
            onSaveKeys={saveSettingsKeys}
            onSaveSubset={saveSettingsSubset}
            saving={savingSettings}
            notify={notify}
          />
        )}

        {/* 3. EVENTS TAB */}
        {tab === "events" && (
          <EventsTab
            initial={initialEvents}
            settings={settings}
            onSettingsChange={setSettings}
            onSaveKeys={saveSettingsKeys}
            savingSettings={savingSettings}
            notify={notify}
          />
        )}

        {/* 4. FACULTY ADVISOR TAB */}
        {tab === "faculty" && (
          <FacultyAdvisorTab
            settings={settings}
            onSaveSubset={saveSettingsSubset}
            saving={savingSettings}
            notify={notify}
          />
        )}

        {/* 5. TEAM TAB (includes Secretariat & Award Winners) */}
        {tab === "team" && (
          <TeamTab
            initial={initialTeam}
            initialAchievements={initialAchievements}
            settings={settings}
            onSettingsChange={setSettings}
            onSaveKeys={saveSettingsKeys}
            savingSettings={savingSettings}
            notify={notify}
          />
        )}

        {/* 6. GALLERY TAB */}
        {tab === "gallery" && (
          <GalleryTab
            initial={initialGallery}
            settings={settings}
            onSettingsChange={setSettings}
            onSaveKeys={saveSettingsKeys}
            savingSettings={savingSettings}
            notify={notify}
          />
        )}

        {/* 7. CONTACT & INBOX TAB */}
        {tab === "contact" && (
          <ContactInboxTab
            initialMessages={initialMessages}
            initialSubscribers={initialSubscribers}
            settings={settings}
            onSettingsChange={setSettings}
            onSaveKeys={saveSettingsKeys}
            onSaveSubset={saveSettingsSubset}
            savingSettings={savingSettings}
            notify={notify}
          />
        )}

        {/* 8. GLOBAL BRANDING & PASSWORD TAB */}
        {tab === "branding" && (
          <BrandingSecurityTab
            settings={settings}
            onSettingsChange={setSettings}
            onSaveKeys={saveSettingsKeys}
            onSaveSubset={saveSettingsSubset}
            saving={savingSettings}
            notify={notify}
          />
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB 0: HEADER & NAVIGATION MANAGER (Deletable, Editable, Dropdowns)
═══════════════════════════════════════════════════════════════════ */
function NavigationTab({
  settings,
  onSaveSubset,
  saving,
  notify,
}: {
  settings: Record<string, string>;
  onSaveSubset: (updates: Record<string, string>, msg?: string) => Promise<void>;
  saving: boolean;
  notify: (text: string, type?: "ok" | "err") => void;
}) {
  let parsedNav: NavItem[] = defaultNavItems;
  try {
    if (settings.nav_items_json) {
      parsedNav = JSON.parse(settings.nav_items_json);
    }
  } catch {}

  const [items, setItems] = useState<NavItem[]>(parsedNav);

  // Top-level item add form
  const [newLabel, setNewLabel] = useState("");
  const [newHref, setNewHref] = useState("");

  // Edit item form
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editHref, setEditHref] = useState("");

  // Add child modal state
  const [parentForChild, setParentForChild] = useState<string | null>(null);
  const [childLabel, setChildLabel] = useState("");
  const [childHref, setChildHref] = useState("");

  // Header CTA & Brand form
  const [ctaShow, setCtaShow] = useState(settings.nav_cta_show !== "false");
  const [ctaLabel, setCtaLabel] = useState(settings.nav_cta_label ?? "Join Us");
  const [ctaHref, setCtaHref] = useState(settings.nav_cta_href ?? "/contact");
  const [brandShort, setBrandShort] = useState(settings.club_short_name ?? "NSUMUNC");
  const [brandUni, setBrandUni] = useState(settings.club_university ?? "North South University");
  const [brandLogo, setBrandLogo] = useState(settings.club_logo_image ?? "");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [nsuLogo, setNsuLogo] = useState(settings.nsu_logo_image ?? "/nsu-monogram.svg");
  const [nsuLogoShow, setNsuLogoShow] = useState(settings.nsu_logo_show !== "false");
  const [uploadingNsuLogo, setUploadingNsuLogo] = useState(false);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok && data.url) {
        setBrandLogo(data.url);
        notify("Logo image uploaded! Click 'Save Header Brand & CTA' to publish ✓", "ok");
      } else {
        notify(data.error || "Upload failed", "err");
      }
    } catch {
      notify("Network error while uploading logo", "err");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleNsuLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingNsuLogo(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok && data.url) {
        setNsuLogo(data.url);
        notify("NSU logo uploaded! Click 'Save Header Brand & CTA' to publish ✓", "ok");
      } else {
        notify(data.error || "Upload failed", "err");
      }
    } catch {
      notify("Network error while uploading NSU logo", "err");
    } finally {
      setUploadingNsuLogo(false);
    }
  };

  const persistNav = async (updated: NavItem[], msg = "Header navigation updated ✓") => {
    setItems(updated);
    await onSaveSubset({ nav_items_json: JSON.stringify(updated) }, msg);
  };

  const handleAddTopItem = async () => {
    if (!newLabel.trim()) return;
    const newItem: NavItem = {
      id: "nav-" + Date.now(),
      label: newLabel.trim(),
      href: newHref.trim() || undefined,
      is_active: true,
      children: [],
    };
    const updated = [...items, newItem];
    setNewLabel("");
    setNewHref("");
    await persistNav(updated, "Navigation item added ✓");
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("Delete this navigation item from header?")) return;
    const updated = items.filter((it) => it.id !== id);
    await persistNav(updated, "Navigation item deleted ✓");
  };

  const handleToggleActive = async (id: string) => {
    const updated = items.map((it) =>
      it.id === id ? { ...it, is_active: it.is_active === false ? true : false } : it
    );
    await persistNav(updated, "Visibility updated ✓");
  };

  const handleMove = async (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    const updated = [...items];
    const temp = updated[index];
    updated[index] = updated[target];
    updated[target] = temp;
    await persistNav(updated, "Navigation order updated ✓");
  };

  const handleSaveEdit = async (id: string) => {
    const updated = items.map((it) =>
      it.id === id
        ? {
            ...it,
            label: editLabel.trim() || it.label,
            href: editHref.trim() || undefined,
          }
        : it
    );
    setEditingId(null);
    await persistNav(updated, "Navigation item updated ✓");
  };

  const handleAddChild = async (parentId: string) => {
    if (!childLabel.trim() || !childHref.trim()) return;
    const updated = items.map((it) => {
      if (it.id === parentId) {
        const children = it.children ? [...it.children] : [];
        children.push({ label: childLabel.trim(), href: childHref.trim(), is_active: true });
        return { ...it, children };
      }
      return it;
    });
    setParentForChild(null);
    setChildLabel("");
    setChildHref("");
    await persistNav(updated, "Dropdown sub-item added ✓");
  };

  const handleDeleteChild = async (parentId: string, childIdx: number) => {
    if (!confirm("Delete this dropdown sub-item?")) return;
    const updated = items.map((it) => {
      if (it.id === parentId && it.children) {
        const children = it.children.filter((_, idx) => idx !== childIdx);
        return { ...it, children };
      }
      return it;
    });
    await persistNav(updated, "Dropdown sub-item removed ✓");
  };

  const handleToggleChildActive = async (parentId: string, childIdx: number) => {
    const updated = items.map((it) => {
      if (it.id === parentId && it.children) {
        const children = it.children.map((c, idx) =>
          idx === childIdx ? { ...c, is_active: c.is_active === false ? true : false } : c
        );
        return { ...it, children };
      }
      return it;
    });
    await persistNav(updated, "Sub-item visibility updated ✓");
  };

  const saveCtaAndBrand = async () => {
    await onSaveSubset(
      {
        nav_cta_show: ctaShow ? "true" : "false",
        nav_cta_label: ctaLabel,
        nav_cta_href: ctaHref,
        club_short_name: brandShort,
        club_university: brandUni,
        club_logo_image: brandLogo,
        nsu_logo_image: nsuLogo,
        nsu_logo_show: nsuLogoShow ? "true" : "false",
      },
      "Header CTA & Brand settings saved ✓"
    );
  };

  return (
    <div className="space-y-8">
      {/* Brand & Header CTA Configuration */}
      <div className="glass rounded-2xl p-6 border border-white/15">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-white font-extrabold text-lg">🎨 Header Brand, Logo &amp; Action CTA</h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-faint)" }}>
              Customize the logo branding and the top-right call-to-action button (editable and deletable).
            </p>
          </div>
          <Btn onClick={saveCtaAndBrand} disabled={saving}>
            {saving ? "Saving…" : "💾 Save Header Brand & CTA"}
          </Btn>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
          <div>
            <Label>Logo Brand Text</Label>
            <Input value={brandShort} onChange={(e) => setBrandShort(e.target.value)} placeholder="NSUMUNC" />
          </div>
          <div>
            <Label>University Subtitle</Label>
            <Input value={brandUni} onChange={(e) => setBrandUni(e.target.value)} placeholder="North South University" />
          </div>
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between mb-1.5">
              <Label>Club Logo Emblem</Label>
              {brandLogo && (
                <button
                  type="button"
                  onClick={() => setBrandLogo("")}
                  className="text-[10px] font-bold text-red-400 hover:text-red-300 transition-colors"
                  title="Revert to default UN globe icon"
                >
                  ✕ Reset to Globe Icon
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              {/* Circular Badge Live Navbar Preview */}
              <div className="relative w-11 h-11 flex-shrink-0" title="Navbar logo badge preview">
                <div className="absolute inset-0 rounded-full bg-un-blue/20 animate-pulse-ring" />
                <div className="relative w-11 h-11 rounded-full glass border border-white/25 flex items-center justify-center overflow-hidden bg-black/40">
                  {brandLogo ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={brandLogo} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <svg viewBox="0 0 40 40" className="w-6 h-6" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.6">
                      <circle cx="20" cy="20" r="17" />
                      <ellipse cx="20" cy="20" rx="8" ry="17" />
                      <line x1="3" y1="20" x2="37" y2="20" />
                    </svg>
                  )}
                </div>
              </div>

              <div className="flex-1 flex gap-2">
                <Input
                  value={brandLogo}
                  onChange={(e) => setBrandLogo(e.target.value)}
                  placeholder="URL or click Upload →"
                />
                <label
                  className="cursor-pointer px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap border transition-all hover:brightness-110 flex-shrink-0 inline-flex items-center gap-1.5"
                  style={{
                    background: "rgba(20, 15, 5, 0.92)",
                    borderColor: "rgba(251, 191, 36, 0.45)",
                    color: "var(--gold-bright)",
                  }}
                >
                  {uploadingLogo ? "Uploading…" : "📤 Upload Logo"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    disabled={uploadingLogo}
                  />
                </label>
              </div>
            </div>
            <p className="text-[11px] mt-1.5" style={{ color: "var(--text-faint)" }}>
              {brandLogo ? "Custom logo active in navbar & footer." : "Using default UN globe diplomatic icon."}
            </p>
          </div>
        </div>

        {/* Institutional NSU Logo Co-Branding */}
        <div className="pt-4 border-t border-white/10 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <Label>North South University (NSU) Monogram Emblem</Label>
              <span className="badge glass-blue text-[10px]" style={{ color: "var(--un-blue-bright)" }}>
                Institutional Co-Branding
              </span>
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-xs text-white">
              <input
                type="checkbox"
                checked={nsuLogoShow}
                onChange={(e) => setNsuLogoShow(e.target.checked)}
                className="rounded w-3.5 h-3.5 accent-un-blue"
              />
              <span>Display Official NSU Monogram in Navbar &amp; Footer</span>
            </label>
          </div>

          <div className="flex items-center gap-3">
            {/* NSU Circular Badge Preview */}
            <div
              className="relative w-11 h-11 rounded-full glass border border-white/25 flex items-center justify-center overflow-hidden bg-white/95 p-1 shadow-md flex-shrink-0"
              title="Official NSU Monogram preview"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={nsuLogo || "/nsu-monogram.svg"}
                alt="NSU Emblem"
                className="w-full h-full object-contain p-0.5"
              />
            </div>

            <div className="flex-1 flex gap-2">
              <Input
                value={nsuLogo}
                onChange={(e) => setNsuLogo(e.target.value)}
                placeholder="/nsu-monogram.svg or click Upload →"
              />
              <label
                className="cursor-pointer px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap border transition-all hover:brightness-110 flex-shrink-0 inline-flex items-center gap-1.5"
                style={{
                  background: "rgba(14, 165, 233, 0.15)",
                  borderColor: "rgba(14, 165, 233, 0.4)",
                  color: "var(--un-blue-bright)",
                }}
              >
                {uploadingNsuLogo ? "Uploading…" : "📤 Upload NSU Logo"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleNsuLogoUpload}
                  className="hidden"
                  disabled={uploadingNsuLogo}
                />
              </label>
              {nsuLogo !== "/nsu-monogram.svg" && (
                <button
                  type="button"
                  onClick={() => setNsuLogo("/nsu-monogram.svg")}
                  className="px-2.5 py-1 text-xs text-white/70 hover:text-white glass rounded-lg border border-white/10"
                  title="Reset to official NSU vector SVG"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
          <p className="text-[11px] mt-1.5" style={{ color: "var(--text-faint)" }}>
            Official North South University crest co-branded in navbar badge and footer accreditation.
          </p>
        </div>

        <div className="pt-4 border-t border-white/10 grid sm:grid-cols-3 gap-4 items-end">
          <div>
            <Label>Header CTA Button Visibility</Label>
            <div className="flex items-center gap-3 h-10">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-white">
                <input
                  type="checkbox"
                  checked={ctaShow}
                  onChange={(e) => setCtaShow(e.target.checked)}
                  className="rounded w-4 h-4 accent-un-blue"
                />
                <span>Show CTA Button in Header</span>
              </label>
            </div>
          </div>
          <div>
            <Label>CTA Button Label</Label>
            <Input value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} placeholder="Join Us or Register" />
          </div>
          <div>
            <Label>CTA Button Destination (href)</Label>
            <Input value={ctaHref} onChange={(e) => setCtaHref(e.target.value)} placeholder="/registration or /contact" />
          </div>
        </div>
      </div>

      {/* Navigation Tree Manager */}
      <div className="glass rounded-2xl p-6 border border-white/15 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-white font-extrabold text-lg">🧭 Main Header Navigation Tree</h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-faint)" }}>
              Add, edit, reorder, delete, or hide any navigation link. Create dropdown menus with sub-links matching nsufinanceclub.org.
            </p>
          </div>
        </div>

        {/* Add New Top-Level Menu Link */}
        <div className="p-4 rounded-xl glass border border-white/10 flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1 w-full">
            <Label>New Menu Label *</Label>
            <Input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="e.g. MDPs or Publications" />
          </div>
          <div className="flex-1 w-full">
            <Label>Link URL (Leave blank if dropdown-only) *</Label>
            <Input value={newHref} onChange={(e) => setNewHref(e.target.value)} placeholder="/mdps or #" />
          </div>
          <Btn onClick={handleAddTopItem} disabled={!newLabel.trim()}>
            + Add Menu Item
          </Btn>
        </div>

        {/* Items List */}
        <div className="space-y-3">
          {items.map((it, idx) => {
            const isEditing = editingId === it.id;
            const hasChildren = it.children && it.children.length > 0;

            return (
              <div
                key={it.id}
                className="glass rounded-xl p-4 border border-white/15 space-y-3"
              >
                {/* Item Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono text-xs text-white/40 w-5">#{idx + 1}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white font-bold text-base">{it.label}</span>
                        {it.href && (
                          <span className="font-mono text-xs text-gold/80 px-2 py-0.5 rounded bg-black/40">
                            {it.href}
                          </span>
                        )}
                        {hasChildren && (
                          <span className="badge glass-blue text-[10px]" style={{ color: "var(--un-blue-bright)" }}>
                            Dropdown ({it.children?.length} items)
                          </span>
                        )}
                        {!it.is_active && (
                          <span
                            className="badge"
                            style={{ background: "rgba(239,68,68,0.15)", color: "#f87171", fontSize: "10px" }}
                          >
                            Hidden
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap">
                    <Btn
                      variant="ghost"
                      onClick={() => {
                        setParentForChild(it.id);
                        setChildLabel("");
                        setChildHref("");
                      }}
                      title="Add dropdown sub-item"
                    >
                      + Sub-item
                    </Btn>
                    <Btn variant="ghost" onClick={() => handleMove(idx, -1)} disabled={idx === 0} title="Move Up">
                      ↑
                    </Btn>
                    <Btn
                      variant="ghost"
                      onClick={() => handleMove(idx, 1)}
                      disabled={idx === items.length - 1}
                      title="Move Down"
                    >
                      ↓
                    </Btn>
                    <Btn
                      variant="ghost"
                      onClick={() => {
                        if (isEditing) {
                          setEditingId(null);
                        } else {
                          setEditingId(it.id);
                          setEditLabel(it.label);
                          setEditHref(it.href || "");
                        }
                      }}
                    >
                      {isEditing ? "Cancel" : "Edit"}
                    </Btn>
                    <Btn variant="ghost" onClick={() => handleToggleActive(it.id)}>
                      {it.is_active !== false ? "Hide" : "Show"}
                    </Btn>
                    <Btn variant="danger" onClick={() => handleDeleteItem(it.id)}>
                      Delete
                    </Btn>
                  </div>
                </div>

                {/* Inline Edit Form */}
                {isEditing && (
                  <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 flex flex-col sm:flex-row gap-3 items-end animate-fade-in">
                    <div className="flex-1 w-full">
                      <Label>Edit Label</Label>
                      <Input value={editLabel} onChange={(e) => setEditLabel(e.target.value)} />
                    </div>
                    <div className="flex-1 w-full">
                      <Label>Edit URL</Label>
                      <Input value={editHref} onChange={(e) => setEditHref(e.target.value)} placeholder="/path" />
                    </div>
                    <Btn onClick={() => handleSaveEdit(it.id)}>Save Item</Btn>
                  </div>
                )}

                {/* Sub-item Add Modal Form */}
                {parentForChild === it.id && (
                  <div className="p-3.5 rounded-xl bg-un-blue/10 border border-un-blue/30 flex flex-col sm:flex-row gap-3 items-end animate-fade-in">
                    <div className="flex-1 w-full">
                      <Label>Submenu Label *</Label>
                      <Input
                        value={childLabel}
                        onChange={(e) => setChildLabel(e.target.value)}
                        placeholder="e.g. Executive Body"
                      />
                    </div>
                    <div className="flex-1 w-full">
                      <Label>Submenu Link (href) *</Label>
                      <Input
                        value={childHref}
                        onChange={(e) => setChildHref(e.target.value)}
                        placeholder="e.g. /executive-body"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Btn onClick={() => handleAddChild(it.id)} disabled={!childLabel.trim() || !childHref.trim()}>
                        Add Sub-link
                      </Btn>
                      <Btn variant="ghost" onClick={() => setParentForChild(null)}>
                        Cancel
                      </Btn>
                    </div>
                  </div>
                )}

                {/* Sub-items (Dropdown Children) */}
                {hasChildren && (
                  <div className="pl-6 border-l-2 border-white/15 space-y-2 mt-2">
                    <div className="text-[11px] font-mono text-white/50 uppercase tracking-widest mb-1">
                      Dropdown Links ({it.children?.length}):
                    </div>
                    {it.children?.map((c, cIdx) => (
                      <div
                        key={c.href + cIdx}
                        className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-white/[0.03] border border-white/10"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-gold text-xs">↳</span>
                          <span className="text-sm font-semibold text-white">{c.label}</span>
                          <span className="font-mono text-xs text-white/50">{c.href}</span>
                          {!c.is_active && (
                            <span
                              className="badge"
                              style={{ background: "rgba(239,68,68,0.15)", color: "#f87171", fontSize: "9px" }}
                            >
                              Hidden
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <Btn variant="ghost" onClick={() => handleToggleChildActive(it.id, cIdx)}>
                            {c.is_active !== false ? "Hide" : "Show"}
                          </Btn>
                          <Btn variant="danger" onClick={() => handleDeleteChild(it.id, cIdx)}>
                            Delete
                          </Btn>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB 1: HOME PAGE (Announcements + Hero + Stats + Marquee + UN Day + CTA)
═══════════════════════════════════════════════════════════════════ */
function HomePageTab({
  initialAnnouncements,
  settings,
  onSettingsChange,
  onSaveKeys,
  onSaveSubset,
  saving,
  notify,
}: {
  initialAnnouncements: Announcement[];
  settings: Record<string, string>;
  onSettingsChange: (s: Record<string, string>) => void;
  onSaveKeys: (keys: string[]) => void;
  onSaveSubset: (u: Record<string, string>, msg?: string) => Promise<void>;
  saving: boolean;
  notify: (text: string, type?: "ok" | "err") => void;
}) {
  const parse = <T,>(raw: string | undefined, fb: T): T => {
    if (!raw) return fb;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fb;
    }
  };

  const [statsList, setStatsList] = useState<{ value: string; label: string }[]>(() =>
    parse(settings.stats_json, [
      { value: "14", label: "Recruitments Completed" },
      { value: "705+", label: "Instagram Followers" },
      { value: "5+", label: "NSUIMUN Editions" },
      { value: "20+", label: "Countries Represented" },
    ])
  );

  const [heroButtons, setHeroButtons] = useState<{ label: string; href: string; variant: "blue" | "gold" | "glass" }[]>(() => {
    try {
      if (settings.hero_buttons_json) {
        return JSON.parse(settings.hero_buttons_json);
      }
    } catch {}
    const fallback: { label: string; href: string; variant: "blue" | "gold" | "glass" }[] = [];
    if (settings.hero_cta1_label) {
      fallback.push({ label: settings.hero_cta1_label, href: settings.hero_cta1_href || "/events", variant: "blue" });
    }
    if (settings.hero_cta2_label) {
      fallback.push({ label: settings.hero_cta2_label, href: settings.hero_cta2_href || "/contact", variant: "gold" });
    }
    if (fallback.length === 0) {
      fallback.push(
        { label: "Explore NSUIMUN", href: "/events", variant: "blue" },
        { label: "Join the Club", href: "/contact", variant: "gold" }
      );
    }
    return fallback;
  });

  const updateHeroButtons = (newButtons: typeof heroButtons) => {
    setHeroButtons(newButtons);
    onSettingsChange({
      ...settings,
      hero_buttons_json: JSON.stringify(newButtons),
      hero_cta1_label: newButtons[0]?.label || "",
      hero_cta1_href: newButtons[0]?.href || "",
      hero_cta2_label: newButtons[1]?.label || "",
      hero_cta2_href: newButtons[1]?.href || "",
    });
  };

  const deleteHeroButton = (idx: number) => {
    const updated = heroButtons.filter((_, i) => i !== idx);
    updateHeroButtons(updated);
  };

  const moveHeroButton = (idx: number, delta: number) => {
    const target = idx + delta;
    if (target < 0 || target >= heroButtons.length) return;
    const copy = [...heroButtons];
    const temp = copy[idx];
    copy[idx] = copy[target];
    copy[target] = temp;
    updateHeroButtons(copy);
  };

  const [marqueeList, setMarqueeList] = useState<string[]>(() =>
    parse(settings.marquee_json, [
      "NSU MODEL UN CLUB",
      "DIPLOMACY AT ITS BEST",
      "SHAPE THE RESURGENCE",
    ])
  );

  const saveStatsAndMarquee = async () => {
    await onSaveSubset(
      {
        stats_tag: settings.stats_tag ?? "",
        stats_title: settings.stats_title ?? "",
        stats_accent: settings.stats_accent ?? "",
        stats_subtitle: settings.stats_subtitle ?? "",
        stats_json: JSON.stringify(statsList),
        marquee_json: JSON.stringify(marqueeList.filter((m) => m.trim().length > 0)),
      },
      "Stats Counters & Marquee Ticker saved ✓"
    );
  };

  return (
    <div className="space-y-8">
      {/* 1A. Hero Section */}
      <SettingsCard
        title="🏠 1. Home Hero Banner & Rotating Circular Stamp"
        subtitle="Top banner of your website — headlines, description, badge text, and rotating circular stamp."
        settings={settings}
        onSettingsChange={onSettingsChange}
        onSaveKeys={onSaveKeys}
        saving={saving}
        notify={notify}
        fields={[
          ["hero_tag", "Small Top Bracket Tag", "where diplomacy goes global"],
          ["hero_badge_text", "Live Pill Badge Text", "Recruitment 14 · Shape the Resurgence"],
          ["hero_headline_1", "Main Headline Line 1 (White)", "NSU Model"],
          ["hero_headline_2", "Main Headline Line 2 (Blue/Gold Gradient)", "UN Club"],
          ["hero_tagline", "Italic Quote Under Headline", "Diplomacy at its Best"],
          ["hero_subtext", "Hero Description Paragraph", "", "textarea"],
          ["hero_stamp_text", "Rotating Circular Stamp Text", "NSUMUNC • DIPLOMACY AT ITS BEST • "],
          ["hero_scroll_hint", "Text Under Circular Stamp", "(scroll to explore)"],
        ]}
      />

      {/* 1A.2 Hero Call-to-Action Buttons Manager */}
      <div className="glass rounded-2xl p-6 border border-white/15 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div>
            <h3 className="text-white font-extrabold text-base flex items-center gap-2">
              <span>🎯 Hero Call-to-Action Buttons</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-mono font-bold glass-gold" style={{ color: "var(--gold-bright)" }}>
                {heroButtons.length} Active
              </span>
            </h3>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-faint)" }}>
              Add, edit, reorder, or delete the main call-to-action buttons shown in the Hero banner.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Btn
              variant="ghost"
              onClick={() => {
                const updated = [
                  ...heroButtons,
                  { label: "New Button", href: "/events", variant: "blue" as const },
                ];
                updateHeroButtons(updated);
              }}
            >
              + Add Button
            </Btn>
            <Btn
              onClick={async () => {
                await onSaveSubset({
                  hero_buttons_json: JSON.stringify(heroButtons),
                  hero_cta1_label: heroButtons[0]?.label || "",
                  hero_cta1_href: heroButtons[0]?.href || "",
                  hero_cta2_label: heroButtons[1]?.label || "",
                  hero_cta2_href: heroButtons[1]?.href || "",
                }, "Hero Buttons saved ✓");
              }}
              disabled={saving}
            >
              {saving ? "Saving…" : "💾 Save Buttons"}
            </Btn>
          </div>
        </div>

        {heroButtons.length === 0 ? (
          <div className="text-center py-6 text-xs text-white/50 border border-dashed border-white/15 rounded-xl">
            No CTA buttons configured. Click &ldquo;+ Add Button&rdquo; to add one.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {heroButtons.map((btn, idx) => (
              <div key={idx} className="glass rounded-xl p-4 border border-white/15 space-y-3 relative group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md glass-blue" style={{ color: "var(--un-blue-bright)" }}>
                      Button #{idx + 1}
                    </span>
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                      style={{
                        background:
                          btn.variant === "gold"
                            ? "rgba(251,191,36,0.18)"
                            : btn.variant === "glass"
                            ? "rgba(255,255,255,0.12)"
                            : "rgba(14,165,233,0.18)",
                        color:
                          btn.variant === "gold"
                            ? "var(--gold-bright)"
                            : btn.variant === "glass"
                            ? "white"
                            : "var(--un-blue-bright)",
                      }}
                    >
                      {btn.variant === "gold" ? "Gold Shimmer" : btn.variant === "glass" ? "Glass Dark" : "Blue Primary"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveHeroButton(idx, -1)}
                      className="w-6 h-6 rounded glass flex items-center justify-center text-xs text-white/70 hover:text-white disabled:opacity-30"
                      title="Move up"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      disabled={idx === heroButtons.length - 1}
                      onClick={() => moveHeroButton(idx, 1)}
                      className="w-6 h-6 rounded glass flex items-center justify-center text-xs text-white/70 hover:text-white disabled:opacity-30"
                      title="Move down"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteHeroButton(idx)}
                      className="px-2 py-0.5 rounded text-xs text-red-400 hover:text-red-300 font-bold hover:bg-red-500/10 transition-colors ml-1"
                      title="Delete this button"
                    >
                      🗑 Delete
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Button Label</Label>
                    <Input
                      value={btn.label}
                      onChange={(e) => {
                        const copy = [...heroButtons];
                        copy[idx] = { ...copy[idx], label: e.target.value };
                        updateHeroButtons(copy);
                      }}
                      placeholder="e.g. Explore NSUIMUN"
                    />
                  </div>
                  <div>
                    <Label>Link URL</Label>
                    <Input
                      value={btn.href}
                      onChange={(e) => {
                        const copy = [...heroButtons];
                        copy[idx] = { ...copy[idx], href: e.target.value };
                        updateHeroButtons(copy);
                      }}
                      placeholder="e.g. /events"
                    />
                  </div>
                </div>

                <div>
                  <Label>Button Visual Style</Label>
                  <Select
                    value={btn.variant}
                    onChange={(e) => {
                      const copy = [...heroButtons];
                      copy[idx] = { ...copy[idx], variant: e.target.value as "blue" | "gold" | "glass" };
                      updateHeroButtons(copy);
                    }}
                  >
                    <option value="blue">Blue Primary (Prominent)</option>
                    <option value="gold">Gold Shimmer (Accent)</option>
                    <option value="glass">Glass Border (Subtle)</option>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 1B. Live Announcements Manager */}
      <div className="glass rounded-2xl p-6 border border-white/15">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-white font-extrabold text-lg">📢 2. Live Announcements Ticker</h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-faint)" }}>
              Add, edit, hide, or delete announcement cards shown on the Home page.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Input
              value={settings.announcements_heading ?? "Latest Updates"}
              onChange={(e) => onSettingsChange({ ...settings, announcements_heading: e.target.value })}
              placeholder="Latest Updates"
              style={{ width: "180px" }}
            />
            <Btn variant="ghost" onClick={() => onSaveKeys(["announcements_heading"])} disabled={saving}>
              Save Heading
            </Btn>
          </div>
        </div>
        <AnnouncementsManager initial={initialAnnouncements} notify={notify} />
      </div>

      {/* 1C. Stats Counters & Marquee Ticker */}
      <div className="glass rounded-2xl p-6 border border-white/15 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-white font-extrabold text-lg">📊 3. Stats Counters &amp; Scrolling Marquee Band</h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-faint)" }}>
              Edit the animated number counters (shared on Home &amp; About) and scrolling ticker words.
            </p>
          </div>
          <Btn onClick={saveStatsAndMarquee} disabled={saving}>
            {saving ? "Saving…" : "💾 Save Stats & Marquee"}
          </Btn>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Label>Stats Section Tag</Label>
            <Input
              value={settings.stats_tag ?? ""}
              onChange={(e) => onSettingsChange({ ...settings, stats_tag: e.target.value })}
            />
          </div>
          <div>
            <Label>Stats Title</Label>
            <Input
              value={settings.stats_title ?? ""}
              onChange={(e) => onSettingsChange({ ...settings, stats_title: e.target.value })}
            />
          </div>
          <div>
            <Label>Stats Accent Word</Label>
            <Input
              value={settings.stats_accent ?? ""}
              onChange={(e) => onSettingsChange({ ...settings, stats_accent: e.target.value })}
            />
          </div>
          <div>
            <Label>Stats Subtitle</Label>
            <Input
              value={settings.stats_subtitle ?? ""}
              onChange={(e) => onSettingsChange({ ...settings, stats_subtitle: e.target.value })}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <Label>Stat Counter Cards</Label>
            <Btn
              variant="ghost"
              onClick={() => setStatsList([...statsList, { value: "10+", label: "New Stat" }])}
            >
              + Add Counter Card
            </Btn>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statsList.map((st, idx) => (
              <div key={idx} className="glass-blue rounded-xl p-4 border border-white/15 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono font-bold" style={{ color: "var(--gold-bright)" }}>
                    Card #{idx + 1}
                  </span>
                  <button
                    onClick={() => setStatsList(statsList.filter((_, i) => i !== idx))}
                    className="text-xs text-red-400 hover:text-red-300 font-bold"
                  >
                    Remove
                  </button>
                </div>
                <Input
                  value={st.value}
                  onChange={(e) => {
                    const copy = [...statsList];
                    copy[idx] = { ...copy[idx], value: e.target.value };
                    setStatsList(copy);
                  }}
                  placeholder="705+"
                />
                <Input
                  value={st.label}
                  onChange={(e) => {
                    const copy = [...statsList];
                    copy[idx] = { ...copy[idx], label: e.target.value };
                    setStatsList(copy);
                  }}
                  placeholder="Instagram Followers"
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label>Scrolling Marquee Ticker Phrases (One phrase per line)</Label>
          <Textarea
            rows={4}
            value={marqueeList.join("\n")}
            onChange={(e) => setMarqueeList(e.target.value.split("\n"))}
          />
        </div>
      </div>

      {/* 1D. Milestones Showcase Section Heading */}
      <SettingsCard
        title="🎞️ 4. Interactive Milestones Section Heading"
        subtitle="Heading above the interactive 001–004 events showcase on the Home page (edit the events themselves in the 📅 Events tab)."
        settings={settings}
        onSettingsChange={onSettingsChange}
        onSaveKeys={onSaveKeys}
        saving={saving}
        notify={notify}
        fields={[
          ["showcase_tag", "Section Bracket Tag", "explore milestones"],
          ["showcase_title", "Section Title", "Conferences &"],
          ["showcase_accent", "Section Gradient Accent", "Flagship Editions"],
          ["showcase_subtitle", "Section Subtitle", "", "textarea"],
        ]}
      />

      {/* 1E. UN Day Spotlight Card */}
      <SettingsCard
        title="🕊️ 5. UN Day / Featured Spotlight Card"
        subtitle="Large image + quote feature card on the Home page."
        settings={settings}
        onSettingsChange={onSettingsChange}
        onSaveKeys={onSaveKeys}
        saving={saving}
        notify={notify}
        fields={[
          ["unday_tag", "Spotlight Bracket Tag", "october 24 · un day"],
          ["unday_title", "Spotlight Title", "United Nations Day"],
          ["unday_quote", "Theme Quote (Gold Italic)", "Stronger Together for a More Peaceful and Sustainable World"],
          ["unday_description", "Spotlight Description", "", "textarea"],
          ["unday_image", "Spotlight Photo", "/un-day.jpg", "image"],
          ["unday_blockquote", "Bottom Blockquote Text", "", "textarea"],
          ["unday_blockquote_author", "Blockquote Author", "Dag Hammarskjöld"],
        ]}
      />

      {/* 1F. Home Bottom CTA */}
      <SettingsCard
        title="🚀 6. Home Page Bottom Call-To-Action"
        subtitle="Final section at the bottom of the Home page."
        settings={settings}
        onSettingsChange={onSettingsChange}
        onSaveKeys={onSaveKeys}
        saving={saving}
        notify={notify}
        fields={[
          ["home_cta_tag", "Bottom CTA Bracket Tag", "start your journey"],
          ["home_cta_title", "Bottom CTA Title", "Ready to Become a"],
          ["home_cta_accent", "Bottom CTA Accent Word", "Diplomat?"],
          ["home_cta_subtitle", "Bottom CTA Subtitle", "", "textarea"],
          ["home_cta_btn1_label", "Primary Button Label (Gold)", "Apply Now"],
          ["home_cta_btn1_href", "Primary Button Link", "/contact"],
          ["home_cta_btn2_label", "Secondary Button Label", "Learn More"],
          ["home_cta_btn2_href", "Secondary Button Link", "/about"],
        ]}
      />
    </div>
  );
}

/* ── Announcements sub-manager ── */
function AnnouncementsManager({
  initial,
  notify,
}: {
  initial: Announcement[];
  notify: (text: string, type?: "ok" | "err") => void;
}) {
  const [items, setItems] = useState(initial);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [form, setForm] = useState({ title: "", body: "", category: "general", is_active: 1 });
  const [saving, setSaving] = useState(false);

  const reload = async () => {
    try {
      const r = await fetch(`/api/admin/announcements?_t=${Date.now()}`, { cache: "no-store" });
      if (r.ok) {
        const d = await r.json();
        if (Array.isArray(d.announcements)) {
          setItems(d.announcements);
        }
      }
    } catch (err) {
      console.error("reload announcements error:", err);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = editing
        ? await fetch(`/api/admin/announcements/${editing.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
          })
        : await fetch("/api/admin/announcements", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
          });
      const data = await res.json();
      if (!res.ok) {
        notify(data.error || "Failed to save announcement", "err");
      } else {
        setEditing(null);
        setForm({ title: "", body: "", category: "general", is_active: 1 });
        notify(editing ? "Announcement updated ✓" : "Announcement published ✓", "ok");
        await reload();
      }
    } catch {
      notify("Network error saving announcement", "err");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (a: Announcement) => {
    const nextActive = a.is_active ? 0 : 1;
    // Optimistic UI state update
    setItems((prev) =>
      prev.map((item) => (item.id === a.id ? { ...item, is_active: nextActive } : item))
    );
    notify(a.is_active ? "Announcement hidden" : "Announcement visible on site ✓", "ok");

    try {
      const res = await fetch(`/api/admin/announcements/${a.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: a.title,
          body: a.body,
          category: a.category,
          is_active: nextActive,
        }),
      });
      if (!res.ok) {
        // Revert on error
        setItems((prev) =>
          prev.map((item) => (item.id === a.id ? { ...item, is_active: a.is_active } : item))
        );
        notify("Failed to update announcement visibility", "err");
      } else {
        await reload();
      }
    } catch {
      setItems((prev) =>
        prev.map((item) => (item.id === a.id ? { ...item, is_active: a.is_active } : item))
      );
      notify("Network error updating visibility", "err");
    }
  };

  const del = async (id: number) => {
    if (!confirm("Delete this announcement?")) return;
    const res = await fetch(`/api/admin/announcements/${id}`, { method: "DELETE" });
    if (res.ok) {
      notify("Announcement deleted", "ok");
      await reload();
    }
  };

  return (
    <div className="grid lg:grid-cols-5 gap-6">
      <div className="lg:col-span-2 glass-blue rounded-xl p-5 border border-white/15">
        <h3 className="text-white font-bold text-base mb-4">
          {editing ? "✏️ Edit Announcement" : "➕ Post New Announcement"}
        </h3>
        <div className="space-y-3.5">
          <div>
            <Label>Title</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Announcement title"
            />
          </div>
          <div>
            <Label>Message Body</Label>
            <Textarea
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              placeholder="Announcement details…"
              rows={3}
            />
          </div>
          <div>
            <Label>Badge Category</Label>
            <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="general">General</option>
              <option value="recruitment">Recruitment</option>
              <option value="achievement">Achievement</option>
              <option value="event">Event</option>
            </Select>
          </div>
          <div className="flex gap-2 pt-1">
            <Btn onClick={save} disabled={saving || !form.title.trim() || !form.body.trim()}>
              {saving ? "Saving…" : editing ? "Update Announcement" : "Publish Announcement"}
            </Btn>
            {editing && (
              <Btn
                variant="ghost"
                onClick={() => {
                  setEditing(null);
                  setForm({ title: "", body: "", category: "general", is_active: 1 });
                }}
              >
                Cancel
              </Btn>
            )}
          </div>
        </div>
      </div>

      <div className="lg:col-span-3 space-y-2.5">
        {items.map((a) => (
          <div key={a.id} className="glass rounded-xl p-4 border border-white/15 flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="badge glass" style={{ color: "var(--gold-bright)", fontSize: "10px" }}>
                  {a.category}
                </span>
                {!a.is_active && (
                  <span
                    className="badge"
                    style={{ background: "rgba(239,68,68,0.15)", color: "#f87171", fontSize: "10px" }}
                  >
                    Hidden
                  </span>
                )}
              </div>
              <h4 className="text-white font-bold text-sm sm:text-base">{a.title}</h4>
              <p className="text-xs sm:text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                {a.body}
              </p>
            </div>
            <div className="flex gap-1.5 flex-shrink-0">
              <Btn
                variant="ghost"
                onClick={() => {
                  setEditing(null);
                  setForm({ title: "", body: "", category: a.category, is_active: 1 });
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                title="Add new announcement"
              >
                + Add
              </Btn>
              <Btn
                variant="ghost"
                onClick={() => {
                  setEditing(a);
                  setForm({ title: a.title, body: a.body, category: a.category, is_active: a.is_active });
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                Edit
              </Btn>
              <Btn variant="ghost" onClick={() => toggleActive(a)}>
                {a.is_active ? "Hide" : "Show"}
              </Btn>
              <Btn variant="danger" onClick={() => del(a.id)}>
                Delete
              </Btn>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB 2: ABOUT PAGE (Header + Story + Mission/Vision + Core Values + Founder)
═══════════════════════════════════════════════════════════════════ */
function AboutPageTab({
  settings,
  onSettingsChange,
  onSaveKeys,
  onSaveSubset,
  saving,
  notify,
}: {
  settings: Record<string, string>;
  onSettingsChange: (s: Record<string, string>) => void;
  onSaveKeys: (keys: string[]) => void;
  onSaveSubset: (u: Record<string, string>, msg?: string) => Promise<void>;
  saving: boolean;
  notify: (text: string, type?: "ok" | "err") => void;
}) {
  const parse = <T,>(raw: string | undefined, fb: T): T => {
    if (!raw) return fb;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fb;
    }
  };

  const [valuesList, setValuesList] = useState<{ icon: string; title: string; description: string }[]>(() =>
    parse(settings.values_json, [])
  );

  const [founderObj, setFounderObj] = useState<{
    name: string;
    title: string;
    bio: string;
    motto: string;
    image?: string;
    achievements: string[];
  }>(() =>
    parse(settings.founder_json, {
      name: "Zunayeed",
      title: "Founder, NSU Model UN Club",
      bio: "",
      motto: "Work hard, party harder",
      image: "",
      achievements: [],
    })
  );

  const savePillars = async () => {
    await onSaveSubset(
      {
        values_tag: settings.values_tag ?? "",
        values_title: settings.values_title ?? "",
        values_accent: settings.values_accent ?? "",
        values_subtitle: settings.values_subtitle ?? "",
        values_json: JSON.stringify(valuesList),
      },
      "Core Values / Pillars saved ✓"
    );
  };

  const saveFounder = async () => {
    await onSaveSubset(
      {
        founder_section_tag: settings.founder_section_tag ?? "origins",
        founder_section_title: settings.founder_section_title ?? "The Founder",
        founder_achievements_heading: settings.founder_achievements_heading ?? "Notable Achievements",
        founder_json: JSON.stringify({
          ...founderObj,
          achievements: founderObj.achievements.filter((a) => a.trim().length > 0),
        }),
      },
      "Founder profile saved ✓"
    );
  };

  return (
    <div className="space-y-8">
      {/* 2A. About Header & Our Story */}
      <SettingsCard
        title="📖 1. About Page Header & Our Story"
        subtitle="Top banner and the 3 story paragraphs on the About page."
        settings={settings}
        onSettingsChange={onSettingsChange}
        onSaveKeys={onSaveKeys}
        saving={saving}
        notify={notify}
        fields={[
          ["about_header_tag", "Header Bracket Tag", "about agency & legacy"],
          ["about_header_title", "Header Title", "Who We"],
          ["about_header_accent", "Header Accent Word", "Are"],
          ["about_header_subtitle", "Header Subtitle", "", "textarea"],
          ["about_story_tag", "Story Bracket Tag", "our story"],
          ["about_story_title", "Story Heading", "A Decade of Diplomatic Excellence"],
          ["about_story_intro", "Story Paragraph 1 (Introduction)", "", "textarea"],
          ["about_description", "Story Paragraph 2 (Club Mission & Growth)", "", "textarea"],
          ["about_story_extra", "Story Paragraph 3 (NSUIMUN Legacy)", "", "textarea"],
        ]}
      />

      {/* 2B. Mission & Vision */}
      <SettingsCard
        title="🧭 2. Mission & Vision Section"
        subtitle="Edit the section heading and both Mission and Vision cards."
        settings={settings}
        onSettingsChange={onSettingsChange}
        onSaveKeys={onSaveKeys}
        saving={saving}
        notify={notify}
        fields={[
          ["mission_section_tag", "Section Bracket Tag", "purpose & direction"],
          ["mission_section_title", "Section Title", "Mission &"],
          ["mission_section_accent", "Section Accent Word", "Vision"],
          ["mission_section_subtitle", "Section Subtitle", "", "textarea"],
          ["mission_card_tag", "Mission Card Tag", "001 · mission"],
          ["mission_card_title", "Mission Card Heading", "Our Mission"],
          ["mission_text", "Mission Statement Text", "", "textarea"],
          ["vision_card_tag", "Vision Card Tag", "002 · vision"],
          ["vision_card_title", "Vision Card Heading", "Our Vision"],
          ["vision_text", "Vision Statement Text", "", "textarea"],
        ]}
      />

      {/* 2C. Core Values / Six Pillars */}
      <div className="glass rounded-2xl p-6 border border-white/15 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-white font-extrabold text-lg">🏛️ 3. Core Values / Pillars (Home &amp; About)</h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-faint)" }}>
              Add, edit, or remove the value cards shown on both Home and About pages.
            </p>
          </div>
          <div className="flex gap-2">
            <Btn
              variant="ghost"
              onClick={() =>
                setValuesList([
                  ...valuesList,
                  { icon: "✦", title: "New Value", description: "Description..." },
                ])
              }
            >
              + Add Pillar
            </Btn>
            <Btn onClick={savePillars} disabled={saving}>
              {saving ? "Saving…" : "💾 Save Pillars"}
            </Btn>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Label>Pillars Tag</Label>
            <Input
              value={settings.values_tag ?? ""}
              onChange={(e) => onSettingsChange({ ...settings, values_tag: e.target.value })}
            />
          </div>
          <div>
            <Label>Pillars Title</Label>
            <Input
              value={settings.values_title ?? ""}
              onChange={(e) => onSettingsChange({ ...settings, values_title: e.target.value })}
            />
          </div>
          <div>
            <Label>Pillars Accent</Label>
            <Input
              value={settings.values_accent ?? ""}
              onChange={(e) => onSettingsChange({ ...settings, values_accent: e.target.value })}
            />
          </div>
          <div>
            <Label>Pillars Subtitle</Label>
            <Input
              value={settings.values_subtitle ?? ""}
              onChange={(e) => onSettingsChange({ ...settings, values_subtitle: e.target.value })}
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {valuesList.map((v, idx) => (
            <div key={idx} className="glass rounded-xl p-4 border border-white/15 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold" style={{ color: "var(--un-blue-bright)" }}>
                    /00{idx + 1}
                  </span>
                  <Input
                    value={v.icon}
                    onChange={(e) => {
                      const copy = [...valuesList];
                      copy[idx] = { ...copy[idx], icon: e.target.value };
                      setValuesList(copy);
                    }}
                    placeholder="🤝"
                    style={{ width: "60px" }}
                  />
                </div>
                <button
                  onClick={() => setValuesList(valuesList.filter((_, i) => i !== idx))}
                  className="text-xs text-red-400 hover:text-red-300 font-bold"
                >
                  Remove
                </button>
              </div>
              <Input
                value={v.title}
                onChange={(e) => {
                  const copy = [...valuesList];
                  copy[idx] = { ...copy[idx], title: e.target.value };
                  setValuesList(copy);
                }}
                placeholder="Pillar Title"
              />
              <Textarea
                rows={2}
                value={v.description}
                onChange={(e) => {
                  const copy = [...valuesList];
                  copy[idx] = { ...copy[idx], description: e.target.value };
                  setValuesList(copy);
                }}
                placeholder="Description"
              />
            </div>
          ))}
        </div>
      </div>

      {/* 2D. Founder Profile */}
      <div className="glass rounded-2xl p-6 border border-white/15 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-white font-extrabold text-lg">👤 4. Founder Profile Card</h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-faint)" }}>
              Edit the Founder section heading, portrait photo, bio, motto, and achievements list.
            </p>
          </div>
          <Btn onClick={saveFounder} disabled={saving}>
            {saving ? "Saving…" : "💾 Save Founder Profile"}
          </Btn>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <Label>Section Tag</Label>
            <Input
              value={settings.founder_section_tag ?? "origins"}
              onChange={(e) => onSettingsChange({ ...settings, founder_section_tag: e.target.value })}
            />
          </div>
          <div>
            <Label>Section Heading</Label>
            <Input
              value={settings.founder_section_title ?? "The Founder"}
              onChange={(e) => onSettingsChange({ ...settings, founder_section_title: e.target.value })}
            />
          </div>
          <div>
            <Label>Achievements Subheading</Label>
            <Input
              value={settings.founder_achievements_heading ?? "Notable Achievements"}
              onChange={(e) => onSettingsChange({ ...settings, founder_achievements_heading: e.target.value })}
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <Label>Founder Name</Label>
            <Input
              value={founderObj.name}
              onChange={(e) => setFounderObj({ ...founderObj, name: e.target.value })}
            />
          </div>
          <div>
            <Label>Founder Title / Role</Label>
            <Input
              value={founderObj.title}
              onChange={(e) => setFounderObj({ ...founderObj, title: e.target.value })}
            />
          </div>
          <div>
            <Label>Founder Motto</Label>
            <Input
              value={founderObj.motto}
              onChange={(e) => setFounderObj({ ...founderObj, motto: e.target.value })}
            />
          </div>
        </div>

        <ImageField
          label="Founder Portrait Photo (Leave empty to show gradient initial avatar)"
          value={founderObj.image ?? ""}
          onChange={(url) => setFounderObj({ ...founderObj, image: url })}
          notify={notify}
        />

        <div>
          <Label>Founder Biography</Label>
          <Textarea
            rows={3}
            value={founderObj.bio}
            onChange={(e) => setFounderObj({ ...founderObj, bio: e.target.value })}
          />
        </div>
        <div>
          <Label>Notable Achievements (One achievement per line)</Label>
          <Textarea
            rows={6}
            value={founderObj.achievements.join("\n")}
            onChange={(e) =>
              setFounderObj({ ...founderObj, achievements: e.target.value.split("\n") })
            }
          />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB 3: EVENTS & CONFERENCES
═══════════════════════════════════════════════════════════════════ */
function EventsTab({
  initial,
  settings,
  onSettingsChange,
  onSaveKeys,
  savingSettings,
  notify,
}: {
  initial: DbEvent[];
  settings: Record<string, string>;
  onSettingsChange: (s: Record<string, string>) => void;
  onSaveKeys: (keys: string[]) => void;
  savingSettings: boolean;
  notify: (text: string, type?: "ok" | "err") => void;
}) {
  const [items, setItems] = useState(initial);
  const [editing, setEditing] = useState<DbEvent | null>(null);
  const BLANK = {
    year: "2026",
    title: "",
    short_title: "",
    theme: "",
    date_label: "",
    description: "",
    image: "/emun-team.jpg",
    type: "conference",
    status: "upcoming",
    delegates: "",
    committees: "",
    days: "",
  };
  const [form, setForm] = useState<Record<string, string>>(BLANK);
  const [saving, setSaving] = useState(false);

  const reload = async () => {
    try {
      const r = await fetch(`/api/admin/events?_t=${Date.now()}`, { cache: "no-store" });
      if (r.ok) {
        const d = await r.json();
        if (Array.isArray(d.events)) {
          setItems(d.events);
        }
      }
    } catch (err) {
      console.error("reload events error:", err);
    }
  };

  const toggleActive = async (ev: DbEvent) => {
    const nextActive = ev.is_active ? 0 : 1;
    setItems((prev) =>
      prev.map((item) => (item.id === ev.id ? { ...item, is_active: nextActive } : item))
    );
    notify(ev.is_active ? "Event hidden from public site" : "Event visible on public site ✓", "ok");

    try {
      const res = await fetch(`/api/admin/events/${ev.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...ev, is_active: nextActive }),
      });
      if (!res.ok) {
        setItems((prev) =>
          prev.map((item) => (item.id === ev.id ? { ...item, is_active: ev.is_active } : item))
        );
        notify("Failed to update event visibility", "err");
      } else {
        await reload();
      }
    } catch {
      setItems((prev) =>
        prev.map((item) => (item.id === ev.id ? { ...item, is_active: ev.is_active } : item))
      );
      notify("Network error updating visibility", "err");
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        committees: form.committees ? parseInt(form.committees) : null,
        days: form.days ? parseInt(form.days) : null,
        delegates: form.delegates || null,
      };
      const res = editing
        ? await fetch(`/api/admin/events/${editing.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...payload, is_active: 1 }),
          })
        : await fetch("/api/admin/events", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
      const data = await res.json();
      if (!res.ok) {
        notify(data.error || "Failed to save event", "err");
      } else {
        setEditing(null);
        setForm(BLANK);
        notify(editing ? "Event updated ✓" : "New event added ✓", "ok");
        await reload();
      }
    } catch {
      notify("Network error saving event", "err");
    } finally {
      setSaving(false);
    }
  };

  const moveOrder = async (index: number, dir: -1 | 1) => {
    const targetIdx = index + dir;
    if (targetIdx < 0 || targetIdx >= items.length) return;
    const a = items[index];
    const b = items[targetIdx];
    await Promise.all([
      fetch(`/api/admin/events/${a.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...a, sort_order: targetIdx + 1 }),
      }),
      fetch(`/api/admin/events/${b.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...b, sort_order: index + 1 }),
      }),
    ]);
    notify("Event order updated ✓", "ok");
    await reload();
  };

  const del = async (id: number) => {
    if (!confirm("Delete this event?")) return;
    const res = await fetch(`/api/admin/events/${id}`, { method: "DELETE" });
    if (res.ok) {
      notify("Event deleted", "ok");
      await reload();
    }
  };

  const startEdit = (e: DbEvent) => {
    setEditing(e);
    setForm({
      year: e.year,
      title: e.title,
      short_title: e.short_title,
      theme: e.theme,
      date_label: e.date_label,
      description: e.description,
      image: e.image,
      type: e.type,
      status: e.status,
      delegates: e.delegates || "",
      committees: e.committees?.toString() || "",
      days: e.days?.toString() || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-8">
      {/* Add / Edit Event Card */}
      <div className="glass rounded-2xl p-6 border border-white/15">
        <h2 className="text-white font-extrabold text-lg mb-5">
          {editing ? `✏️ Editing Event: ${editing.title}` : "➕ Add New Event / Conference"}
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            ["Year *", "year", "2026"],
            ["Event Title *", "title", "NSUIMUN 2026"],
            ["Short Title", "short_title", "NSUIMUN VI"],
            ["Theme / Subtitle", "theme", "Diplomacy at its Best"],
            ["Date Label", "date_label", "October 2026"],
          ].map(([label, key, ph]) => (
            <div key={key}>
              <Label>{label}</Label>
              <Input
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                placeholder={ph}
              />
            </div>
          ))}
          <ImageField
            label="Event Cover Photo"
            value={form.image}
            onChange={(url) => setForm({ ...form, image: url })}
            notify={notify}
          />
          <div>
            <Label>Category Type</Label>
            <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="conference">Conference</option>
              <option value="delegation">Delegation</option>
              <option value="recruitment">Recruitment</option>
            </Select>
          </div>
          <div>
            <Label>Status</Label>
            <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
            </Select>
          </div>
          <div>
            <Label>Delegates Count (Optional)</Label>
            <Input
              value={form.delegates}
              onChange={(e) => setForm({ ...form, delegates: e.target.value })}
              placeholder="e.g. 500+"
            />
          </div>
          <div>
            <Label>Committees Count (Optional)</Label>
            <Input
              type="number"
              value={form.committees}
              onChange={(e) => setForm({ ...form, committees: e.target.value })}
              placeholder="e.g. 7"
            />
          </div>
          <div>
            <Label>Days Count (Optional)</Label>
            <Input
              type="number"
              value={form.days}
              onChange={(e) => setForm({ ...form, days: e.target.value })}
              placeholder="e.g. 4"
            />
          </div>
        </div>
        <div className="mt-4">
          <Label>Event Description *</Label>
          <Textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Full event summary…"
            rows={3}
          />
        </div>
        <div className="flex gap-2 mt-4">
          <Btn onClick={save} disabled={saving || !form.year.trim() || !form.title.trim() || !form.description.trim()}>
            {saving ? "Saving…" : editing ? "💾 Update Event" : "➕ Add Event"}
          </Btn>
          {editing && (
            <Btn
              variant="ghost"
              onClick={() => {
                setEditing(null);
                setForm(BLANK);
              }}
            >
              Cancel
            </Btn>
          )}
        </div>
      </div>

      {/* Existing Events List */}
      <div className="space-y-3">
        <h3 className="text-white font-extrabold text-base">
          📋 Current Events ({items.length}) — Shown on Home Showcase &amp; Events Page
        </h3>
        {items.map((ev, idx) => (
          <div
            key={ev.id}
            className="glass rounded-xl p-4 sm:p-5 border border-white/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/15 flex-shrink-0 bg-black/40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={ev.image} alt={ev.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-base font-extrabold gradient-text-gold">{ev.year}</span>
                  <span className="badge glass" style={{ color: "var(--un-blue-bright)", fontSize: "10px" }}>
                    {ev.type}
                  </span>
                  <span
                    className="badge"
                    style={{
                      background: ev.status === "completed" ? "rgba(74,222,128,0.12)" : "rgba(251,191,36,0.12)",
                      color: ev.status === "completed" ? "#4ade80" : "#fbbf24",
                      fontSize: "10px",
                    }}
                  >
                    {ev.status}
                  </span>
                  {!ev.is_active && (
                    <span
                      className="badge"
                      style={{ background: "rgba(239,68,68,0.15)", color: "#f87171", fontSize: "10px" }}
                    >
                      Hidden
                    </span>
                  )}
                </div>
                <h4 className="text-white font-bold text-base">{ev.title}</h4>
                <p className="text-xs italic" style={{ color: "var(--gold-bright)" }}>
                  {ev.theme} · {ev.date_label}
                </p>
                <p className="text-xs sm:text-sm mt-1 line-clamp-2" style={{ color: "var(--text-muted)" }}>
                  {ev.description}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <Btn
                variant="ghost"
                onClick={() => {
                  setEditing(null);
                  setForm({
                    year: "2026",
                    title: "",
                    short_title: "",
                    theme: "",
                    date_label: "",
                    description: "",
                    image: "",
                    type: ev.type || "conference",
                    status: "upcoming",
                    delegates: "",
                    committees: "",
                    days: "",
                  });
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                title="Add new event"
              >
                + Add
              </Btn>
              <Btn variant="ghost" onClick={() => moveOrder(idx, -1)} disabled={idx === 0} title="Move Up">
                ↑
              </Btn>
              <Btn
                variant="ghost"
                onClick={() => moveOrder(idx, 1)}
                disabled={idx === items.length - 1}
                title="Move Down"
              >
                ↓
              </Btn>
              <Btn variant="ghost" onClick={() => startEdit(ev)}>
                Edit
              </Btn>
              <Btn variant="ghost" onClick={() => toggleActive(ev)}>
                {ev.is_active ? "Hide" : "Show"}
              </Btn>
              <Btn variant="danger" onClick={() => del(ev.id)}>
                Delete
              </Btn>
            </div>
          </div>
        ))}
      </div>

      {/* Events Page Header & Bottom CTA Copy */}
      <SettingsCard
        title="📅 Events Page Header & Bottom CTA Copy"
        subtitle="Edit the banner headlines and bottom call-to-action on /events."
        settings={settings}
        onSettingsChange={onSettingsChange}
        onSaveKeys={onSaveKeys}
        saving={savingSettings}
        fields={[
          ["events_header_tag", "Header Bracket Tag", "events & conferences"],
          ["events_header_title", "Header Title", "NSUIMUN &"],
          ["events_header_accent", "Header Accent Word", "Beyond"],
          ["events_header_subtitle", "Header Subtitle", "", "textarea"],
          ["events_cta_tag", "Bottom CTA Bracket Tag", "upcoming edition"],
          ["events_cta_title", "Bottom CTA Title", "Stay Tuned for NSUIMUN 2026"],
          ["events_cta_subtitle", "Bottom CTA Subtitle", "", "textarea"],
          ["events_cta_btn1_label", "Bottom CTA Button 1 Label", "Get Notified"],
          ["events_cta_btn1_href", "Bottom CTA Button 1 Link", "/contact"],
          ["events_cta_btn2_label", "Bottom CTA Button 2 Label (Facebook)", "Follow on Facebook"],
        ]}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB 4: FACULTY ADVISOR MANAGER (DEDICATED SECTION)
═══════════════════════════════════════════════════════════════════ */
function FacultyAdvisorTab({
  settings,
  onSaveSubset,
  saving,
  notify,
}: {
  settings: Record<string, string>;
  onSaveSubset: (subset: Record<string, string>) => Promise<void>;
  saving: boolean;
  notify: (text: string, type?: "ok" | "err") => void;
}) {
  let parsed: FacultyAdvisorData = defaultFacultyAdvisor;
  try {
    if (settings.faculty_advisor_json) {
      parsed = { ...defaultFacultyAdvisor, ...JSON.parse(settings.faculty_advisor_json) };
    }
  } catch {}

  const [data, setData] = useState<FacultyAdvisorData>(parsed);
  const [savingData, setSavingData] = useState(false);

  const updateField = <K extends keyof FacultyAdvisorData>(key: K, val: FacultyAdvisorData[K]) => {
    setData((prev) => ({ ...prev, [key]: val }));
  };

  const handleSave = async () => {
    setSavingData(true);
    try {
      await onSaveSubset({
        faculty_advisor_json: JSON.stringify(data),
      });
      notify("Faculty Advisor profile saved successfully ✓", "ok");
    } catch {
      notify("Failed to save Faculty Advisor profile", "err");
    } finally {
      setSavingData(false);
    }
  };

  const updateMessageParagraph = (idx: number, text: string) => {
    const next = [...(data.message || [])];
    next[idx] = text;
    setData((prev) => ({ ...prev, message: next }));
  };

  const addMessageParagraph = () => {
    setData((prev) => ({ ...prev, message: [...(prev.message || []), ""] }));
  };

  const removeMessageParagraph = (idx: number) => {
    setData((prev) => ({ ...prev, message: (prev.message || []).filter((_, i) => i !== idx) }));
  };

  const updateMilestone = (idx: number, field: "year" | "label" | "text", val: string) => {
    const next = [...(data.milestones || [])];
    next[idx] = { ...next[idx], [field]: val };
    setData((prev) => ({ ...prev, milestones: next }));
  };

  const addMilestone = () => {
    setData((prev) => ({
      ...prev,
      milestones: [...(prev.milestones || []), { year: "2026", label: "New Milestone", text: "" }],
    }));
  };

  const removeMilestone = (idx: number) => {
    setData((prev) => ({ ...prev, milestones: (prev.milestones || []).filter((_, i) => i !== idx) }));
  };

  return (
    <div className="space-y-6">
      {/* Action banner */}
      <div className="glass rounded-2xl p-6 border border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="striver-tag mb-1">academic leadership · separate section</span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">Faculty Advisor Manager</h2>
          <p className="text-xs sm:text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Edit Faculty Advisor profile, official message, photo, quote, and historical milestones.
          </p>
        </div>
        <Btn onClick={handleSave} disabled={savingData || saving}>
          {savingData || saving ? "Saving…" : "💾 Save Advisor Profile"}
        </Btn>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Advisor Details */}
        <div className="glass rounded-2xl p-6 border border-white/15 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>👤</span> Advisor Profile &amp; Contact
          </h3>
          <div>
            <Label>Full Name</Label>
            <Input
              value={data.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="Dr. Rizwan Khair"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label>Title / Club Role</Label>
              <Input
                value={data.title}
                onChange={(e) => updateField("title", e.target.value)}
                placeholder="Faculty Advisor"
              />
            </div>
            <div>
              <Label>Academic Designation</Label>
              <Input
                value={data.designation}
                onChange={(e) => updateField("designation", e.target.value)}
                placeholder="Associate Professor & Senior Academic Fellow"
              />
            </div>
          </div>
          <div>
            <Label>Department &amp; University</Label>
            <Input
              value={data.department}
              onChange={(e) => updateField("department", e.target.value)}
              placeholder="Department of Political Science & Sociology, North South University"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label>Campus Office Location</Label>
              <Input
                value={data.office}
                onChange={(e) => updateField("office", e.target.value)}
                placeholder="SAC942, South Academic Building, NSU"
              />
            </div>
            <div>
              <Label>Official Email Address</Label>
              <Input
                value={data.email}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="faculty.advisor@nsu.edu"
              />
            </div>
          </div>
          <div>
            <Label>Advisor Portrait Photo</Label>
            <ImageField
              label=""
              value={data.image}
              onChange={(url) => updateField("image", url)}
              notify={notify}
            />
          </div>
        </div>

        {/* Quote & Featured Message */}
        <div className="glass rounded-2xl p-6 border border-white/15 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>💬</span> Inspiring Quote &amp; Statements
          </h3>
          <div>
            <Label>Featured Quote</Label>
            <Textarea
              rows={3}
              value={data.quote}
              onChange={(e) => updateField("quote", e.target.value)}
              placeholder="Diplomacy is not merely debating across committee rooms..."
            />
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <Label>Official Message Paragraphs ({data.message?.length || 0})</Label>
              <button
                type="button"
                onClick={addMessageParagraph}
                className="text-xs font-bold text-un-blue hover:text-white transition-colors"
              >
                + Add Paragraph
              </button>
            </div>
            {data.message?.map((para, pIdx) => (
              <div key={pIdx} className="relative">
                <Textarea
                  rows={3}
                  value={para}
                  onChange={(e) => updateMessageParagraph(pIdx, e.target.value)}
                  placeholder={`Paragraph ${pIdx + 1}...`}
                />
                {data.message.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMessageParagraph(pIdx)}
                    className="absolute top-2 right-2 text-xs text-red-400 hover:text-red-300 p-1 bg-black/40 rounded"
                    title="Remove paragraph"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Historical Milestones */}
      <div className="glass rounded-2xl p-6 border border-white/15 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>🏛️</span> Mentorship Milestones
            </h3>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-faint)" }}>
              Historical impact highlights displayed on the Faculty Advisor page.
            </p>
          </div>
          <button
            type="button"
            onClick={addMilestone}
            className="px-3 py-1.5 rounded-lg text-xs font-bold glass-blue text-white border border-un-blue/30 hover:border-un-blue transition-colors"
          >
            + Add Milestone
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 pt-2">
          {data.milestones?.map((m, mIdx) => (
            <div key={mIdx} className="glass rounded-xl p-4 border border-white/10 space-y-2 relative">
              <button
                type="button"
                onClick={() => removeMilestone(mIdx)}
                className="absolute top-2 right-2 text-xs text-red-400 hover:text-red-300 p-1 bg-black/40 rounded"
                title="Remove milestone"
              >
                ✕
              </button>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label>Year</Label>
                  <Input
                    value={m.year}
                    onChange={(e) => updateMilestone(mIdx, "year", e.target.value)}
                    placeholder="2026"
                  />
                </div>
                <div className="col-span-2">
                  <Label>Milestone Title</Label>
                  <Input
                    value={m.label}
                    onChange={(e) => updateMilestone(mIdx, "label", e.target.value)}
                    placeholder="Eastern MUN Triumph"
                  />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  rows={2}
                  value={m.text}
                  onChange={(e) => updateMilestone(mIdx, "text", e.target.value)}
                  placeholder="Details of the milestone..."
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB 5: TEAM (EXECUTIVE BODY, SUB-EXECUTIVE BODY & AWARD WINNERS)
═══════════════════════════════════════════════════════════════════ */
const STANDARD_WINGS = [
  "Delegate Affairs & International Relations",
  "Academics & Research Council",
  "Logistics & Event Operations",
  "Public Relations, Branding & Media",
  "Finance & Corporate Sponsorships",
  "Information Technology & Web",
];

function TeamTab({
  initial,
  initialAchievements = [],
  settings,
  onSettingsChange,
  onSaveKeys,
  savingSettings,
  notify,
}: {
  initial: TeamMember[];
  initialAchievements?: DbAchievement[];
  settings: Record<string, string>;
  onSettingsChange: (s: Record<string, string>) => void;
  onSaveKeys: (keys: string[]) => void;
  savingSettings: boolean;
  notify: (text: string, type?: "ok" | "err") => void;
}) {
  const [subTab, setSubTab] = useState<"eb" | "sub_eb" | "awards" | "settings">("eb");
  const [items, setItems] = useState<TeamMember[]>(initial);
  const [editing, setEditing] = useState<TeamMember | null>(null);

  type TeamMemberForm = {
    role: string;
    name: string;
    initial: string;
    description: string;
    image: string;
    body_type: "executive" | "sub_eb";
    wing: string;
  };

  const BLANK_EB: TeamMemberForm = {
    role: "",
    name: "TBA",
    initial: "",
    description: "",
    image: "",
    body_type: "executive",
    wing: "",
  };
  const BLANK_SUB: TeamMemberForm = {
    role: "",
    name: "TBA",
    initial: "",
    description: "",
    image: "",
    body_type: "sub_eb",
    wing: STANDARD_WINGS[0],
  };

  const [form, setForm] = useState<TeamMemberForm>(BLANK_EB);
  const [customWing, setCustomWing] = useState(false);
  const [wingFilter, setWingFilter] = useState<string>("all");
  const [saving, setSaving] = useState(false);

  const reload = async () => {
    try {
      const r = await fetch(`/api/admin/team?_t=${Date.now()}`, { cache: "no-store" });
      if (r.ok) {
        const d = await r.json();
        if (Array.isArray(d.team)) {
          setItems(d.team);
        }
      }
    } catch (err) {
      console.error("reload team error:", err);
    }
  };

  const switchSubTab = (nextTab: "eb" | "sub_eb" | "awards" | "settings") => {
    setSubTab(nextTab);
    setEditing(null);
    setForm(nextTab === "sub_eb" ? BLANK_SUB : BLANK_EB);
    setCustomWing(false);
  };

  const toggleActive = async (m: TeamMember) => {
    const nextActive = m.is_active ? 0 : 1;
    setItems((prev) =>
      prev.map((item) => (item.id === m.id ? { ...item, is_active: nextActive } : item))
    );
    notify(m.is_active ? "Member hidden from public site" : "Member visible on public site ✓", "ok");

    try {
      const res = await fetch(`/api/admin/team/${m.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...m, is_active: nextActive }),
      });
      if (!res.ok) {
        setItems((prev) =>
          prev.map((item) => (item.id === m.id ? { ...item, is_active: m.is_active } : item))
        );
        notify("Failed to update member visibility", "err");
      } else {
        await reload();
      }
    } catch {
      setItems((prev) =>
        prev.map((item) => (item.id === m.id ? { ...item, is_active: m.is_active } : item))
      );
      notify("Network error updating visibility", "err");
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      const autoInitial =
        form.initial.trim() ||
        (form.name.trim() && form.name.trim() !== "TBA"
          ? form.name.trim().charAt(0)
          : form.role.trim().charAt(0)) ||
        "M";
      const payload = {
        ...form,
        initial: autoInitial.toUpperCase(),
        body_type: subTab === "sub_eb" ? "sub_eb" : "executive",
        wing: subTab === "sub_eb" ? form.wing.trim() : "",
        is_active: editing ? editing.is_active : 1,
      };

      const res = editing
        ? await fetch(`/api/admin/team/${editing.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/admin/team", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
      const data = await res.json();
      if (!res.ok) {
        notify(data.error || "Failed to save team member", "err");
      } else {
        setEditing(null);
        setForm(subTab === "sub_eb" ? BLANK_SUB : BLANK_EB);
        setCustomWing(false);
        const memberType = subTab === "sub_eb" ? "Sub-Executive member" : "Executive Body member";
        notify(editing ? `${memberType} updated ✓` : `${memberType} added ✓`, "ok");
        await reload();
      }
    } catch {
      notify("Network error saving team member", "err");
    } finally {
      setSaving(false);
    }
  };

  const moveOrder = async (list: TeamMember[], index: number, dir: -1 | 1) => {
    const targetIdx = index + dir;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const a = list[index];
    const b = list[targetIdx];
    await Promise.all([
      fetch(`/api/admin/team/${a.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...a, sort_order: targetIdx + 1 }),
      }),
      fetch(`/api/admin/team/${b.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...b, sort_order: index + 1 }),
      }),
    ]);
    notify("Member order updated ✓", "ok");
    await reload();
  };

  const del = async (id: number) => {
    if (!confirm("Remove this team member?")) return;
    const res = await fetch(`/api/admin/team/${id}`, { method: "DELETE" });
    if (res.ok) {
      notify("Team member removed", "ok");
      await reload();
    }
  };

  const ebItems = items.filter((m) => (m.body_type || "executive") === "executive");
  const allSubEbItems = items.filter((m) => m.body_type === "sub_eb");
  const filteredSubEbItems =
    wingFilter === "all"
      ? allSubEbItems
      : allSubEbItems.filter((m) => (m.wing || "").trim() === wingFilter);

  // Collect all unique wings currently in sub-EB
  const existingWings = Array.from(
    new Set([...STANDARD_WINGS, ...allSubEbItems.map((m) => m.wing?.trim()).filter(Boolean) as string[]])
  );

  return (
    <div className="space-y-6">
      {/* Sub-navigation inside Team */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 glass rounded-xl border border-white/10 w-fit">
        <button
          type="button"
          onClick={() => switchSubTab("eb")}
          className="px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
          style={{
            background: subTab === "eb" ? "var(--un-blue)" : "transparent",
            color: subTab === "eb" ? "white" : "var(--text-muted)",
          }}
        >
          <span>🏛️ Executive Body (EB)</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white font-mono">
            {ebItems.length}
          </span>
        </button>
        <button
          type="button"
          onClick={() => switchSubTab("sub_eb")}
          className="px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
          style={{
            background: subTab === "sub_eb" ? "var(--un-blue)" : "transparent",
            color: subTab === "sub_eb" ? "white" : "var(--text-muted)",
          }}
        >
          <span>🌿 Sub-Executive Body (Sub-EB)</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white font-mono">
            {allSubEbItems.length}
          </span>
        </button>
        <button
          type="button"
          onClick={() => switchSubTab("awards")}
          className="px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
          style={{
            background: subTab === "awards" ? "var(--un-blue)" : "transparent",
            color: subTab === "awards" ? "white" : "var(--text-muted)",
          }}
        >
          <span>🏆 Award Winners</span>
          {initialAchievements.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white font-mono">
              {initialAchievements.length}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => switchSubTab("settings")}
          className="px-4 py-2 rounded-lg text-xs font-bold transition-all"
          style={{
            background: subTab === "settings" ? "var(--un-blue)" : "transparent",
            color: subTab === "settings" ? "white" : "var(--text-muted)",
          }}
        >
          ⚙️ Section Headings
        </button>
      </div>

      {subTab === "awards" ? (
        <AchievementsTab
          initial={initialAchievements || []}
          settings={settings}
          onSettingsChange={onSettingsChange}
          onSaveKeys={onSaveKeys}
          savingSettings={savingSettings}
          notify={notify}
        />
      ) : subTab === "settings" ? (
        <SettingsCard
          title="👥 Team Page Header, Awards Heading & Join CTA"
          subtitle="Edit the headings and bottom CTA on /team."
          settings={settings}
          onSettingsChange={onSettingsChange}
          onSaveKeys={onSaveKeys}
          saving={savingSettings}
          fields={[
            ["team_header_tag", "Header Bracket Tag", "recruitment 14 · leadership"],
            ["team_header_title", "Header Title", "Meet the"],
            ["team_header_accent", "Header Accent Word", "Secretariat"],
            ["team_header_subtitle", "Header Subtitle", "", "textarea"],
            ["team_awards_tag", "Award Section Tag", "eastern mun 2026"],
            ["team_awards_title", "Award Section Title", "Recent"],
            ["team_awards_accent", "Award Section Accent", "Award Winners"],
            ["team_awards_subtitle", "Award Section Subtitle", "", "textarea"],
            ["team_cta_tag", "Bottom CTA Tag", "become a leader"],
            ["team_cta_title", "Bottom CTA Title", "Want to Join the Secretariat?"],
            ["team_cta_subtitle", "Bottom CTA Subtitle", "", "textarea"],
            ["team_cta_btn_label", "Bottom CTA Button Label", "Reach Out to Us"],
            ["team_cta_btn_href", "Bottom CTA Button Link", "/contact"],
          ]}
        />
      ) : subTab === "sub_eb" ? (
        /* ══════════════════════════════════════════════════════════════
           SUB-EXECUTIVE BODY (SUB-EB) SECTION
        ══════════════════════════════════════════════════════════════ */
        <div className="space-y-6">
          <div className="glass rounded-2xl p-5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="badge glass-blue text-[10px]" style={{ color: "var(--un-blue-bright)" }}>
                  Operational Wings
                </span>
                <h3 className="text-white font-extrabold text-base">Sub-Executive Body Management</h3>
              </div>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                Add and organize directors, deputy directors, and associates by operational wing. Changes update /sub-executive-body instantly.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="/sub-executive-body"
                target="_blank"
                className="px-3 py-1.5 rounded-lg text-xs font-bold border border-white/15 text-white/80 hover:text-white glass"
              >
                View Live Sub-EB Page ↗
              </a>
            </div>
          </div>

          <div className="grid lg:grid-cols-5 gap-6">
            {/* Form */}
            <div className="lg:col-span-2">
              <div className="glass rounded-2xl p-6 border border-white/15 sticky top-28">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-white font-extrabold text-lg">
                    {editing ? `✏️ Edit: ${editing.role}` : "➕ Add Sub-EB Member"}
                  </h2>
                  <span className="badge glass text-[10px]" style={{ color: "var(--gold-bright)" }}>
                    Sub-EB
                  </span>
                </div>

                <div className="space-y-4">
                  {/* Wing Selector */}
                  <div>
                    <Label>Operational Wing / Department *</Label>
                    {!customWing ? (
                      <div className="space-y-1.5">
                        <Select
                          value={form.wing || STANDARD_WINGS[0]}
                          onChange={(e) => {
                            if (e.target.value === "__custom__") {
                              setCustomWing(true);
                              setForm({ ...form, wing: "" });
                            } else {
                              setForm({ ...form, wing: e.target.value });
                            }
                          }}
                        >
                          {existingWings.map((w) => (
                            <option key={w} value={w}>
                              {w}
                            </option>
                          ))}
                          <option value="__custom__">➕ Add Custom Wing Name…</option>
                        </Select>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="flex gap-2">
                          <Input
                            value={form.wing}
                            onChange={(e) => setForm({ ...form, wing: e.target.value })}
                            placeholder="e.g. Strategic Partnerships"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setCustomWing(false);
                              setForm({ ...form, wing: STANDARD_WINGS[0] });
                            }}
                            className="px-2.5 py-1.5 rounded-lg text-xs border border-white/15 glass text-white/70 hover:text-white whitespace-nowrap"
                          >
                            Back
                          </button>
                        </div>
                        <p className="text-[10px] text-white/50">Enter the custom wing or department title.</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label>Position / Role *</Label>
                    <Input
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value })}
                      placeholder="e.g. Director of Delegate Affairs"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <Label>Full Name</Label>
                      <Input
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="e.g. Samiha Anjum"
                      />
                    </div>
                    <div>
                      <Label>Initial</Label>
                      <Input
                        value={form.initial}
                        maxLength={1}
                        onChange={(e) =>
                          setForm({ ...form, initial: e.target.value.charAt(0).toUpperCase() })
                        }
                        placeholder="Auto"
                      />
                    </div>
                  </div>

                  <ImageField
                    label="Portrait Photo (Optional)"
                    value={form.image}
                    onChange={(url) => setForm({ ...form, image: url })}
                    notify={notify}
                  />

                  <div>
                    <Label>Bio / Key Responsibilities</Label>
                    <Textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Overseeing committee registration, international liaisons…"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Btn onClick={save} disabled={saving || !form.role.trim() || !form.wing.trim()}>
                      {saving ? "Saving…" : editing ? "💾 Update Sub-EB Member" : "➕ Add Sub-EB Member"}
                    </Btn>
                    {editing && (
                      <Btn
                        variant="ghost"
                        onClick={() => {
                          setEditing(null);
                          setForm(BLANK_SUB);
                          setCustomWing(false);
                        }}
                      >
                        Cancel
                      </Btn>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* List */}
            <div className="lg:col-span-3 space-y-4">
              {/* Wing Filter */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                <span className="text-xs font-bold text-white/50 flex-shrink-0">Filter:</span>
                <button
                  type="button"
                  onClick={() => setWingFilter("all")}
                  className="px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all"
                  style={{
                    background: wingFilter === "all" ? "var(--un-blue)" : "rgba(255,255,255,0.06)",
                    color: wingFilter === "all" ? "white" : "var(--text-muted)",
                  }}
                >
                  All Wings ({allSubEbItems.length})
                </button>
                {existingWings.map((w) => {
                  const count = allSubEbItems.filter((m) => (m.wing || "").trim() === w).length;
                  if (count === 0 && wingFilter !== w) return null;
                  return (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setWingFilter(w)}
                      className="px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all"
                      style={{
                        background: wingFilter === w ? "var(--un-blue)" : "rgba(255,255,255,0.06)",
                        color: wingFilter === w ? "white" : "var(--text-muted)",
                      }}
                    >
                      {w.split(" ")[0]} ({count})
                    </button>
                  );
                })}
              </div>

              {filteredSubEbItems.length === 0 ? (
                <div className="glass rounded-xl p-8 border border-white/10 text-center">
                  <p className="text-white/60 text-sm">No Sub-EB members in this wing yet.</p>
                  <p className="text-xs text-white/40 mt-1">Use the form on the left to add a member.</p>
                </div>
              ) : (
                filteredSubEbItems.map((m, idx) => (
                  <div
                    key={m.id}
                    className="glass rounded-xl p-4 border border-white/15 flex flex-col sm:flex-row sm:items-center gap-4 card-hover"
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-extrabold text-lg flex-shrink-0 overflow-hidden border border-white/15"
                      style={{ background: "linear-gradient(135deg, var(--un-blue), #0369a1)" }}
                    >
                      {m.image ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={m.image} alt={m.name} className="w-full h-full object-cover" />
                      ) : (
                        m.initial
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span
                          className="badge text-[10px] font-mono"
                          style={{ background: "rgba(14,165,233,0.15)", color: "var(--un-blue-bright)" }}
                        >
                          {m.wing || "General Operations"}
                        </span>
                        {!m.is_active && (
                          <span
                            className="badge text-[10px]"
                            style={{ background: "rgba(239,68,68,0.15)", color: "#f87171" }}
                          >
                            Hidden
                          </span>
                        )}
                      </div>
                      <h4 className="text-white font-bold text-base leading-snug">
                        {m.role}{" "}
                        <span className="text-xs font-semibold ml-1" style={{ color: "var(--gold-bright)" }}>
                          ({m.name})
                        </span>
                      </h4>
                      <p className="text-xs sm:text-sm mt-0.5 line-clamp-2" style={{ color: "var(--text-muted)" }}>
                        {m.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap">
                      <Btn
                        variant="ghost"
                        onClick={() => moveOrder(filteredSubEbItems, idx, -1)}
                        disabled={idx === 0}
                      >
                        ↑
                      </Btn>
                      <Btn
                        variant="ghost"
                        onClick={() => moveOrder(filteredSubEbItems, idx, 1)}
                        disabled={idx === filteredSubEbItems.length - 1}
                      >
                        ↓
                      </Btn>
                      <Btn
                        variant="ghost"
                        onClick={() => {
                          setEditing(m);
                          setForm({
                            role: m.role,
                            name: m.name,
                            initial: m.initial,
                            description: m.description,
                            image: m.image || "",
                            body_type: "sub_eb",
                            wing: m.wing || STANDARD_WINGS[0],
                          });
                          setCustomWing(!STANDARD_WINGS.includes(m.wing || ""));
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                      >
                        Edit
                      </Btn>
                      <Btn variant="ghost" onClick={() => toggleActive(m)}>
                        {m.is_active ? "Hide" : "Show"}
                      </Btn>
                      <Btn variant="danger" onClick={() => del(m.id)}>
                        Delete
                      </Btn>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ══════════════════════════════════════════════════════════════
           EXECUTIVE BODY (EB) / SECRETARIAT SECTION
        ══════════════════════════════════════════════════════════════ */
        <div className="space-y-6">
          <div className="glass rounded-2xl p-5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="badge glass-blue text-[10px]" style={{ color: "var(--gold-bright)" }}>
                  Apex Leadership
                </span>
                <h3 className="text-white font-extrabold text-base">Executive Body (Secretariat) Management</h3>
              </div>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                Manage the apex leadership of NSUMUNC (Secretary-General, President, USGs, Treasurer). Updates /team and /executive-body.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="/executive-body"
                target="_blank"
                className="px-3 py-1.5 rounded-lg text-xs font-bold border border-white/15 text-white/80 hover:text-white glass"
              >
                View Live EB Page ↗
              </a>
            </div>
          </div>

          <div className="grid lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2">
              <div className="glass rounded-2xl p-6 border border-white/15 sticky top-28">
                <h2 className="text-white font-extrabold text-lg mb-5">
                  {editing ? `✏️ Edit: ${editing.role}` : "➕ Add Executive Member"}
                </h2>
                <div className="space-y-4">
                  <div>
                    <Label>Position / Role *</Label>
                    <Input
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value })}
                      placeholder="e.g. Secretary-General or President"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <Label>Full Name (or TBA)</Label>
                      <Input
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Full Name or TBA"
                      />
                    </div>
                    <div>
                      <Label>Initial</Label>
                      <Input
                        value={form.initial}
                        maxLength={1}
                        onChange={(e) =>
                          setForm({ ...form, initial: e.target.value.charAt(0).toUpperCase() })
                        }
                        placeholder="Auto"
                      />
                    </div>
                  </div>
                  <ImageField
                    label="Portrait Photo (Optional)"
                    value={form.image}
                    onChange={(url) => setForm({ ...form, image: url })}
                    notify={notify}
                  />
                  <div>
                    <Label>Bio / Responsibilities</Label>
                    <Textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Role responsibilities…"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Btn onClick={save} disabled={saving || !form.role.trim()}>
                      {saving ? "Saving…" : editing ? "💾 Update Member" : "➕ Add Member"}
                    </Btn>
                    {editing && (
                      <Btn
                        variant="ghost"
                        onClick={() => {
                          setEditing(null);
                          setForm(BLANK_EB);
                        }}
                      >
                        Cancel
                      </Btn>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3 space-y-2.5">
              {ebItems.map((m, idx) => (
                <div key={m.id} className="glass rounded-xl p-4 border border-white/15 flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-extrabold text-lg flex-shrink-0 overflow-hidden border border-white/15"
                    style={{ background: "linear-gradient(135deg, var(--un-blue), var(--gold))" }}
                  >
                    {m.image ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={m.image} alt={m.name} className="w-full h-full object-cover" />
                    ) : (
                      m.initial
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-white font-bold text-base">
                        {m.role}{" "}
                        <span className="text-xs font-semibold ml-1" style={{ color: "var(--gold-bright)" }}>
                          ({m.name})
                        </span>
                      </h3>
                      {!m.is_active && (
                        <span
                          className="badge"
                          style={{ background: "rgba(239,68,68,0.15)", color: "#f87171", fontSize: "10px" }}
                        >
                          Hidden
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm mt-0.5 line-clamp-2" style={{ color: "var(--text-muted)" }}>
                      {m.description}
                    </p>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <Btn
                      variant="ghost"
                      onClick={() => moveOrder(ebItems, idx, -1)}
                      disabled={idx === 0}
                    >
                      ↑
                    </Btn>
                    <Btn
                      variant="ghost"
                      onClick={() => moveOrder(ebItems, idx, 1)}
                      disabled={idx === ebItems.length - 1}
                    >
                      ↓
                    </Btn>
                    <Btn
                      variant="ghost"
                      onClick={() => {
                        setEditing(m);
                        setForm({
                          role: m.role,
                          name: m.name,
                          initial: m.initial,
                          description: m.description,
                          image: m.image || "",
                          body_type: "executive",
                          wing: "",
                        });
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    >
                      Edit
                    </Btn>
                    <Btn variant="ghost" onClick={() => toggleActive(m)}>
                      {m.is_active ? "Hide" : "Show"}
                    </Btn>
                    <Btn variant="danger" onClick={() => del(m.id)}>
                      Delete
                    </Btn>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB 5: ACHIEVEMENTS & AWARD WINNERS
═══════════════════════════════════════════════════════════════════ */
function AchievementsTab({
  initial,
  settings,
  onSettingsChange,
  onSaveKeys,
  savingSettings,
  notify,
}: {
  initial: DbAchievement[];
  settings: Record<string, string>;
  onSettingsChange: (s: Record<string, string>) => void;
  onSaveKeys: (keys: string[]) => void;
  savingSettings: boolean;
  notify: (text: string, type?: "ok" | "err") => void;
}) {
  const [items, setItems] = useState(initial);
  const [editing, setEditing] = useState<DbAchievement | null>(null);
  const BLANK = {
    conference: "Eastern Model United Nations 2026",
    name: "",
    award: "",
    image: "/emun-jahidul.jpg",
  };
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);

  const reload = async () => {
    try {
      const r = await fetch(`/api/admin/achievements?_t=${Date.now()}`, { cache: "no-store" });
      if (r.ok) {
        const d = await r.json();
        if (Array.isArray(d.achievements)) {
          setItems(d.achievements);
        }
      }
    } catch (err) {
      console.error("reload achievements error:", err);
    }
  };

  const toggleActive = async (a: DbAchievement) => {
    const nextActive = a.is_active ? 0 : 1;
    setItems((prev) =>
      prev.map((item) => (item.id === a.id ? { ...item, is_active: nextActive } : item))
    );
    notify(a.is_active ? "Winner card hidden from public site" : "Winner card visible on public site ✓", "ok");

    try {
      const res = await fetch(`/api/admin/achievements/${a.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...a, is_active: nextActive }),
      });
      if (!res.ok) {
        setItems((prev) =>
          prev.map((item) => (item.id === a.id ? { ...item, is_active: a.is_active } : item))
        );
        notify("Failed to update winner visibility", "err");
      } else {
        await reload();
      }
    } catch {
      setItems((prev) =>
        prev.map((item) => (item.id === a.id ? { ...item, is_active: a.is_active } : item))
      );
      notify("Network error updating visibility", "err");
    }
  };

  const saveAward = async () => {
    setSaving(true);
    try {
      const res = editing
        ? await fetch(`/api/admin/achievements/${editing.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...form, is_active: editing.is_active }),
          })
        : await fetch("/api/admin/achievements", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
          });
      const data = await res.json();
      if (!res.ok) {
        notify(data.error || "Failed to save award winner", "err");
      } else {
        setEditing(null);
        setForm(BLANK);
        notify(editing ? "Award winner updated ✓" : "Award winner added ✓", "ok");
        await reload();
      }
    } catch {
      notify("Network error saving award winner", "err");
    } finally {
      setSaving(false);
    }
  };

  const del = async (id: number) => {
    if (!confirm("Delete this achievement card?")) return;
    const res = await fetch(`/api/admin/achievements/${id}`, { method: "DELETE" });
    if (res.ok) {
      notify("Achievement card deleted", "ok");
      await reload();
    }
  };

  const startEditWinner = (a: DbAchievement) => {
    setEditing(a);
    setForm({
      conference: a.conference,
      name: a.name,
      award: a.award,
      image: a.image,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-8">
      {/* Individual Award Winners CRUD */}
      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
          <div className="glass rounded-2xl p-6 border border-white/15">
            <h2 className="text-white font-extrabold text-lg mb-5">
              {editing ? `✏️ Edit Winner: ${editing.name}` : "➕ Add Award Winner Card"}
            </h2>
            <div className="space-y-4">
              <div>
                <Label>Winner Full Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Jahidul Dihaz"
                />
              </div>
              <div>
                <Label>Award Title &amp; Committee *</Label>
                <Input
                  value={form.award}
                  onChange={(e) => setForm({ ...form, award: e.target.value })}
                  placeholder="Editor in Chief — IP"
                />
              </div>
              <div>
                <Label>Conference Name *</Label>
                <Input
                  value={form.conference}
                  onChange={(e) => setForm({ ...form, conference: e.target.value })}
                  placeholder="Eastern Model United Nations 2026"
                />
              </div>
              <ImageField
                label="Winner Photo"
                value={form.image}
                onChange={(url) => setForm({ ...form, image: url })}
                notify={notify}
              />
              <div className="flex gap-2">
                <Btn onClick={saveAward} disabled={saving || !form.name.trim() || !form.award.trim()}>
                  {saving ? "Saving…" : editing ? "💾 Update Winner" : "➕ Add Winner"}
                </Btn>
                {editing && (
                  <Btn
                    variant="ghost"
                    onClick={() => {
                      setEditing(null);
                      setForm(BLANK);
                    }}
                  >
                    Cancel
                  </Btn>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-3">
          {items.map((a) => (
            <div
              key={a.id}
              className="glass-gold rounded-xl p-4 sm:p-5 border border-gold/25 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-16 h-16 rounded-xl overflow-hidden border border-gold/30 flex-shrink-0 bg-black/40">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={a.image} alt={a.name} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="badge glass" style={{ color: "var(--gold-bright)", fontSize: "10px" }}>
                      🏆 {a.conference}
                    </span>
                    {!a.is_active && (
                      <span
                        className="badge"
                        style={{ background: "rgba(239,68,68,0.15)", color: "#f87171", fontSize: "10px" }}
                      >
                        Hidden
                      </span>
                    )}
                  </div>
                  <h3 className="text-white font-bold text-lg truncate">{a.name}</h3>
                  <p className="text-sm font-semibold truncate" style={{ color: "var(--gold-bright)" }}>
                    {a.award}
                  </p>
                </div>
              </div>
              <div className="flex gap-1.5 flex-shrink-0">
                <Btn
                  variant="ghost"
                  onClick={() => {
                    setEditing(null);
                    setForm(BLANK);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  title="Add new winner"
                >
                  + Add
                </Btn>
                <Btn variant="ghost" onClick={() => startEditWinner(a)}>
                  Edit
                </Btn>
                <Btn variant="ghost" onClick={() => toggleActive(a)}>
                  {a.is_active ? "Hide" : "Show"}
                </Btn>
                <Btn variant="danger" onClick={() => del(a.id)}>
                  Delete
                </Btn>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Delegation Spotlight on Home Page */}
      <SettingsCard
        title="🌟 Featured Delegation Card & Section Heading (Home Page)"
        subtitle="Controls the delegation team card next to the award winners on the Home page."
        settings={settings}
        onSettingsChange={onSettingsChange}
        onSaveKeys={onSaveKeys}
        saving={savingSettings}
        fields={[
          ["emun_tag", "Section Bracket Tag", "recent achievement"],
          ["emun_title", "Section Title", "Eastern Model"],
          ["emun_accent", "Section Accent Title", "United Nations 2026"],
          ["emun_subtitle", "Section Subtitle", "", "textarea"],
          ["emun_team_tag", "Team Card Small Tag", "delegation"],
          ["emun_team_title", "Team Card Heading", "NSU MUN Club Team"],
          ["emun_team_subtitle", "Team Card Subtitle", "Eastern Model UN 2026"],
          ["emun_award_badge", "Award Card Badge Label", "🏆 Award Winner"],
          ["emun_team_image", "Featured Delegation Team Photo", "/emun-team.jpg", "image"],
        ]}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB 6: PHOTO GALLERY
═══════════════════════════════════════════════════════════════════ */
function GalleryTab({
  initial,
  settings,
  onSettingsChange,
  onSaveKeys,
  savingSettings,
  notify,
}: {
  initial: DbGalleryItem[];
  settings: Record<string, string>;
  onSettingsChange: (s: Record<string, string>) => void;
  onSaveKeys: (keys: string[]) => void;
  savingSettings: boolean;
  notify: (text: string, type?: "ok" | "err") => void;
}) {
  const [items, setItems] = useState(initial);
  const [editing, setEditing] = useState<DbGalleryItem | null>(null);
  const BLANK = { src: "", caption: "", category: "Conference", year: "2026" };
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);

  const reload = async () => {
    try {
      const r = await fetch(`/api/admin/gallery?_t=${Date.now()}`, { cache: "no-store" });
      if (r.ok) {
        const d = await r.json();
        if (Array.isArray(d.gallery)) {
          setItems(d.gallery);
        }
      }
    } catch (err) {
      console.error("reload gallery error:", err);
    }
  };

  const toggleActive = async (g: DbGalleryItem) => {
    const nextActive = g.is_active ? 0 : 1;
    setItems((prev) =>
      prev.map((item) => (item.id === g.id ? { ...item, is_active: nextActive } : item))
    );
    notify(g.is_active ? "Photo hidden from public site" : "Photo visible on public site ✓", "ok");

    try {
      const res = await fetch(`/api/admin/gallery/${g.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...g, is_active: nextActive }),
      });
      if (!res.ok) {
        setItems((prev) =>
          prev.map((item) => (item.id === g.id ? { ...item, is_active: g.is_active } : item))
        );
        notify("Failed to update photo visibility", "err");
      } else {
        await reload();
      }
    } catch {
      setItems((prev) =>
        prev.map((item) => (item.id === g.id ? { ...item, is_active: g.is_active } : item))
      );
      notify("Network error updating visibility", "err");
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = editing
        ? await fetch(`/api/admin/gallery/${editing.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...form, is_active: editing.is_active }),
          })
        : await fetch("/api/admin/gallery", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
          });
      const data = await res.json();
      if (!res.ok) {
        notify(data.error || "Failed to save gallery photo", "err");
      } else {
        setEditing(null);
        setForm(BLANK);
        notify(editing ? "Gallery photo updated ✓" : "Photo added to Gallery ✓", "ok");
        await reload();
      }
    } catch {
      notify("Network error saving gallery photo", "err");
    } finally {
      setSaving(false);
    }
  };

  const del = async (id: number) => {
    if (!confirm("Delete this gallery photo?")) return;
    const res = await fetch(`/api/admin/gallery/${id}`, { method: "DELETE" });
    if (res.ok) {
      notify("Gallery photo deleted", "ok");
      await reload();
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
          <div className="glass rounded-2xl p-6 border border-white/15">
            <h2 className="text-white font-extrabold text-lg mb-5">
              {editing ? "✏️ Edit Gallery Photo" : "➕ Add Photo to Gallery"}
            </h2>
            <div className="space-y-4">
              <ImageField
                label="Photo (Click Upload or paste path) *"
                value={form.src}
                onChange={(url) => setForm({ ...form, src: url })}
                notify={notify}
              />
              <div>
                <Label>Caption *</Label>
                <Input
                  value={form.caption}
                  onChange={(e) => setForm({ ...form, caption: e.target.value })}
                  placeholder="NSU MUN Club Team — Eastern MUN 2026"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Category</Label>
                  <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    <option value="Conference">Conference</option>
                    <option value="Achievement">Achievement</option>
                    <option value="Recruitment">Recruitment</option>
                    <option value="Celebration">Celebration</option>
                  </Select>
                </div>
                <div>
                  <Label>Year</Label>
                  <Input
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: e.target.value })}
                    placeholder="2026"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Btn onClick={save} disabled={saving || !form.src.trim() || !form.caption.trim()}>
                  {saving ? "Saving…" : editing ? "💾 Update Photo" : "➕ Add to Gallery"}
                </Btn>
                {editing && (
                  <Btn
                    variant="ghost"
                    onClick={() => {
                      setEditing(null);
                      setForm(BLANK);
                    }}
                  >
                    Cancel
                  </Btn>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 grid sm:grid-cols-2 gap-3">
          {items.map((g) => (
            <div
              key={g.id}
              className="glass rounded-xl p-3.5 border border-white/15 flex flex-col justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <div className="w-16 h-16 rounded-lg overflow-hidden border border-white/15 flex-shrink-0 bg-black/40">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={g.src} alt={g.caption} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="badge glass-blue" style={{ color: "var(--un-blue-bright)", fontSize: "10px" }}>
                      {g.category} · {g.year}
                    </span>
                    {!g.is_active && (
                      <span
                        className="badge"
                        style={{ background: "rgba(239,68,68,0.15)", color: "#f87171", fontSize: "10px" }}
                      >
                        Hidden
                      </span>
                    )}
                  </div>
                  <p className="text-white font-bold text-sm leading-snug line-clamp-2">{g.caption}</p>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Btn
                  variant="ghost"
                  onClick={() => {
                    setEditing(null);
                    setForm(BLANK);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  title="Add new photo"
                >
                  + Add
                </Btn>
                <Btn
                  variant="ghost"
                  onClick={() => {
                    setEditing(g);
                    setForm({ src: g.src, caption: g.caption, category: g.category, year: g.year });
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  Edit
                </Btn>
                <Btn variant="ghost" onClick={() => toggleActive(g)}>
                  {g.is_active ? "Hide" : "Show"}
                </Btn>
                <Btn variant="danger" onClick={() => del(g.id)}>
                  Delete
                </Btn>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gallery Page Header & Social Prompt */}
      <SettingsCard
        title="🖼️ Gallery Page Header & Social Album Buttons"
        subtitle="Edit the headings and social media buttons on /gallery."
        settings={settings}
        onSettingsChange={onSettingsChange}
        onSaveKeys={onSaveKeys}
        saving={savingSettings}
        fields={[
          ["gallery_header_tag", "Header Bracket Tag", "visual journey"],
          ["gallery_header_title", "Header Title", "Our"],
          ["gallery_header_accent", "Header Accent Word", "Gallery"],
          ["gallery_header_subtitle", "Header Subtitle", "", "textarea"],
          ["gallery_social_text", "Bottom Social Prompt Text", "See more high-resolution albums on our official social channels"],
          ["gallery_fb_label", "Facebook Button Label", "Facebook Photos"],
          ["gallery_ig_label", "Instagram Button Label", "Instagram · @nsumunc"],
        ]}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB 7: CONTACT PAGE, MESSAGES INBOX & NEWSLETTER SUBSCRIBERS
═══════════════════════════════════════════════════════════════════ */
function ContactInboxTab({
  initialMessages,
  initialSubscribers,
  settings,
  onSettingsChange,
  onSaveKeys,
  onSaveSubset,
  savingSettings,
  notify,
}: {
  initialMessages: ContactMessage[];
  initialSubscribers: NewsletterSubscriber[];
  settings: Record<string, string>;
  onSettingsChange: (s: Record<string, string>) => void;
  onSaveKeys: (keys: string[]) => void;
  onSaveSubset: (u: Record<string, string>, msg?: string) => Promise<void>;
  savingSettings: boolean;
  notify: (text: string, type?: "ok" | "err") => void;
}) {
  const [items, setItems] = useState(initialMessages);
  const [subs, setSubs] = useState(initialSubscribers);
  const [selected, setSelected] = useState<ContactMessage | null>(null);

  const [subjectsList, setSubjectsList] = useState<string[]>(() => {
    try {
      return JSON.parse(settings.contact_subjects_json || "[]");
    } catch {
      return ["Join the Club", "NSUIMUN Registration", "Partnership / Sponsorship", "General Inquiry"];
    }
  });

  const markRead = async (id: number) => {
    await fetch("/api/admin/messages", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setItems((prev) => prev.map((m) => (m.id === id ? { ...m, is_read: 1 } : m)));
  };

  const delMsg = async (id: number) => {
    if (!confirm("Delete this message?")) return;
    await fetch("/api/admin/messages", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setItems((prev) => prev.filter((m) => m.id !== id));
    if (selected?.id === id) setSelected(null);
    notify("Message deleted", "ok");
  };

  const delSub = async (id: number) => {
    if (!confirm("Remove this subscriber?")) return;
    await fetch("/api/admin/subscribers", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setSubs((prev) => prev.filter((s) => s.id !== id));
    notify("Subscriber removed", "ok");
  };

  return (
    <div className="space-y-8">
      {/* Inbox */}
      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 space-y-2 max-h-[60vh] overflow-y-auto pr-1">
          <h3 className="text-white font-extrabold text-base mb-2">
            ✉️ Contact Messages ({items.length})
          </h3>
          {items.length === 0 && (
            <p className="text-center py-10 text-sm" style={{ color: "var(--text-faint)" }}>
              No messages yet.
            </p>
          )}
          {items.map((m) => (
            <button
              key={m.id}
              onClick={() => {
                setSelected(m);
                if (!m.is_read) markRead(m.id);
              }}
              className="w-full text-left glass rounded-xl p-4 border transition-all hover:border-white/25"
              style={{
                borderColor: selected?.id === m.id ? "var(--un-blue)" : "rgba(255,255,255,0.12)",
                background: selected?.id === m.id ? "rgba(14,165,233,0.12)" : undefined,
              }}
            >
              <div className="flex items-start gap-3">
                {!m.is_read && (
                  <span
                    className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                    style={{ background: "var(--un-blue-bright)" }}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-white font-bold text-sm truncate">{m.name}</span>
                    <span className="text-xs flex-shrink-0" style={{ color: "var(--text-faint)" }}>
                      {new Date(m.created_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>
                  <p className="text-xs font-semibold truncate mt-0.5" style={{ color: "var(--gold-bright)" }}>
                    {m.subject}
                  </p>
                  <p className="text-xs truncate mt-0.5" style={{ color: "var(--text-muted)" }}>
                    {m.message}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="lg:col-span-3">
          {selected ? (
            <div className="glass rounded-2xl p-6 border border-white/15">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h3 className="text-white font-extrabold text-xl">{selected.name}</h3>
                  <a
                    href={`mailto:${selected.email}`}
                    className="text-sm font-semibold hover:text-white transition-colors"
                    style={{ color: "var(--un-blue-bright)" }}
                  >
                    {selected.email}
                  </a>
                </div>
                <Btn variant="danger" onClick={() => delMsg(selected.id)}>
                  Delete
                </Btn>
              </div>
              <div className="glass rounded-xl p-3.5 mb-4 border border-white/15">
                <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-faint)" }}>
                  Subject
                </p>
                <p className="text-white font-semibold text-sm">{selected.subject}</p>
              </div>
              <div className="glass rounded-xl p-3.5 border border-white/15">
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-faint)" }}>
                  Message
                </p>
                <p className="text-sm sm:text-base leading-relaxed" style={{ color: "var(--text-base)" }}>
                  {selected.message}
                </p>
              </div>
            </div>
          ) : (
            <div className="glass rounded-2xl p-10 border border-white/15 flex items-center justify-center h-full min-h-[200px]">
              <p className="text-sm" style={{ color: "var(--text-faint)" }}>
                Select a message on the left to read
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Newsletter Subscribers */}
      <div className="glass rounded-2xl p-6 border border-white/15">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-extrabold text-base">
            📬 Newsletter Subscribers ({subs.length})
          </h3>
          {subs.length > 0 && (
            <Btn
              variant="ghost"
              onClick={() => {
                navigator.clipboard.writeText(subs.map((s) => s.email).join(", "));
                notify("Copied all subscriber emails to clipboard!", "ok");
              }}
            >
              📋 Copy All Emails
            </Btn>
          )}
        </div>
        {subs.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--text-faint)" }}>
            No newsletter subscribers yet.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {subs.map((s) => (
              <div
                key={s.id}
                className="glass rounded-xl px-4 py-2.5 border border-white/15 flex items-center justify-between gap-2"
              >
                <span className="text-sm font-medium text-white truncate">{s.email}</span>
                <button
                  onClick={() => delSub(s.id)}
                  className="text-xs text-red-400 hover:text-red-300 font-bold"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contact Page Copy & Subject Options */}
      <SettingsCard
        title="📞 Contact Page Text & Newsletter Box"
        subtitle="Edit all headings and labels on /contact."
        settings={settings}
        onSettingsChange={onSettingsChange}
        onSaveKeys={onSaveKeys}
        saving={savingSettings}
        fields={[
          ["contact_header_tag", "Header Bracket Tag", "get in touch"],
          ["contact_header_title", "Header Title", "Contact"],
          ["contact_header_accent", "Header Accent Word", "Us"],
          ["contact_header_subtitle", "Header Subtitle", "", "textarea"],
          ["contact_channels_tag", "Left Card Tag", "direct channels"],
          ["contact_channels_title", "Left Card Heading", "Reach Out"],
          ["contact_form_title", "Contact Form Heading", "Send Us a Message"],
          ["contact_form_btn_label", "Submit Button Text", "Send Message"],
          ["newsletter_title", "Newsletter Card Title", "Stay Updated"],
          ["newsletter_subtitle", "Newsletter Card Subtitle", "", "textarea"],
        ]}
      />

      <div className="glass rounded-2xl p-6 border border-white/15">
        <div className="flex items-center justify-between mb-3">
          <Label>Contact Form Subject Dropdown Options (One option per line)</Label>
          <Btn
            onClick={() =>
              onSaveSubset(
                { contact_subjects_json: JSON.stringify(subjectsList.filter((s) => s.trim().length > 0)) },
                "Subject dropdown options saved ✓"
              )
            }
            disabled={savingSettings}
          >
            💾 Save Subjects
          </Btn>
        </div>
        <Textarea
          rows={5}
          value={subjectsList.join("\n")}
          onChange={(e) => setSubjectsList(e.target.value.split("\n"))}
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB 8: GLOBAL BRANDING, NAVBAR, FOOTER & ADMIN PASSWORD
═══════════════════════════════════════════════════════════════════ */
function BrandingSecurityTab({
  settings,
  onSettingsChange,
  onSaveKeys,
  onSaveSubset,
  saving,
  notify,
}: {
  settings: Record<string, string>;
  onSettingsChange: (s: Record<string, string>) => void;
  onSaveKeys: (keys: string[]) => void;
  onSaveSubset: (u: Record<string, string>, msg?: string) => Promise<void>;
  saving: boolean;
  notify: (text: string, type?: "ok" | "err") => void;
}) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handlePasswordChange = async () => {
    if (!newPassword.trim() || newPassword.trim().length < 4) {
      notify("Password must be at least 4 characters", "err");
      return;
    }
    if (newPassword !== confirmPassword) {
      notify("Passwords do not match", "err");
      return;
    }
    await onSaveSubset({ admin_password: newPassword.trim() }, "Admin password updated ✓");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="space-y-8">
      <SettingsCard
        title="🌐 Global Club Identity, Navbar & Footer"
        subtitle="Changes here update the Navbar, Footer, About Page, and Contact Page across the entire website."
        settings={settings}
        onSettingsChange={onSettingsChange}
        onSaveKeys={onSaveKeys}
        saving={saving}
        notify={notify}
        fields={[
          ["club_name", "Club Full Name", "NSU Model UN Club"],
          ["club_short_name", "Club Short Name (Navbar & Footer)", "NSUMUNC"],
          ["club_university", "University Name", "North South University"],
          ["club_founded", "Founded Year", "2012"],
          ["club_tagline", "Official Tagline", "Diplomacy at its Best"],
          ["club_logo_image", "Custom Club Logo Image (Leave empty for default UN globe icon)", "", "image"],
          ["nsu_logo_image", "North South University (NSU) Monogram Logo", "/nsu-monogram.svg", "image"],
          ["nav_cta_label", "Navbar Top-Right Button Label", "Join Us"],
          ["nav_cta_href", "Navbar Top-Right Button Link", "/contact"],
          ["club_email", "Official Contact Email", "nsumunc@gmail.com"],
          ["club_facebook", "Facebook Page URL", "https://www.facebook.com/NSUMUNC"],
          ["club_instagram", "Instagram URL", "https://www.instagram.com/nsumunc/"],
          ["club_followers", "Social Follower Count", "705+"],
          ["club_location", "Campus Location", "North South University, Dhaka, Bangladesh"],
          ["footer_bio_extra", "Footer Bio Description", "", "textarea"],
          ["footer_watermark", "Footer Giant Outline Watermark", "NSUMUNC · DIPLOMACY"],
          ["footer_copyright", "Footer Copyright Line", "© 2026 NSU Model UN Club. All rights reserved."],
        ]}
      />

      {/* Dedicated Password Changer */}
      <div className="glass rounded-2xl p-6 border border-white/15">
        <h2 className="text-white font-extrabold text-lg mb-2">🔐 Change Admin Password</h2>
        <p className="text-xs mb-5" style={{ color: "var(--text-faint)" }}>
          Update the password used to log in at <code>/admin/login</code>.
        </p>
        <div className="grid sm:grid-cols-2 gap-4 max-w-xl">
          <div>
            <Label>New Password</Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
            />
          </div>
          <div>
            <Label>Confirm New Password</Label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat new password"
            />
          </div>
        </div>
        <div className="mt-4">
          <Btn onClick={handlePasswordChange} disabled={saving || !newPassword.trim()}>
            🔑 Update Admin Password
          </Btn>
        </div>
      </div>
    </div>
  );
}
