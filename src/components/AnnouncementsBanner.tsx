import { getDb, Announcement } from "@/lib/db";

const styles: Record<string, { card: string; label: string; dot: string }> = {
  recruitment: {
    card: "glass-gold",
    label: "var(--gold-bright)",
    dot: "var(--gold-bright)",
  },
  achievement: {
    card: "glass-blue",
    label: "var(--un-blue-bright)",
    dot: "var(--un-blue)",
  },
  event: {
    card: "glass",
    label: "var(--text-base)",
    dot: "rgba(255,255,255,0.6)",
  },
  general: {
    card: "glass",
    label: "var(--text-base)",
    dot: "rgba(255,255,255,0.6)",
  },
};

const icons: Record<string, string> = {
  recruitment: "✦",
  achievement: "🏆",
  event: "📅",
  general: "📢",
};

export default function AnnouncementsBanner({
  heading = "Latest Updates",
  announcements,
}: {
  heading?: string;
  announcements?: Announcement[];
}) {
  const items =
    announcements ??
    (getDb()
      .prepare("SELECT * FROM announcements WHERE is_active = 1 ORDER BY created_at DESC LIMIT 6")
      .all() as Announcement[]);

  if (!items.length) return null;

  return (
    <section
      className="py-12 px-4 border-y"
      style={{ background: "var(--navy-surface)", borderColor: "var(--border-subtle)" }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "var(--un-blue-bright)" }} />
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
            {heading}
          </span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((a) => {
            const s = styles[a.category] ?? styles.general;
            return (
              <div key={a.id} className={`${s.card} rounded-2xl p-5 card-hover border border-white/15`}>
                <div className="flex items-start gap-3">
                  <span className="text-lg flex-shrink-0 mt-0.5">{icons[a.category] ?? "📢"}</span>
                  <div>
                    <h3 className="text-white font-bold text-base leading-snug mb-1.5">{a.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                      {a.body}
                    </p>
                    <p className="text-xs font-medium mt-2.5" style={{ color: "var(--text-faint)" }}>
                      {new Date(a.created_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
