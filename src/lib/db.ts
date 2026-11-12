import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { type NavItem, type NavSubItem, defaultNavItems } from "./nav";
import { type FacultyAdvisorData, defaultFacultyAdvisor } from "./advisor";
export { type FacultyAdvisorData, defaultFacultyAdvisor };
import {
  clubInfo as defaultClubInfo,
  stats as defaultStats,
  values as defaultValues,
  founder as defaultFounder,
  missionVision as defaultMissionVision,
  currentTenure as defaultTenure,
  recentAchievements as defaultAchievements,
  galleryItems as defaultGallery,
} from "./data";

const isVercel = Boolean(process.env.VERCEL);
const ORIGINAL_DB = path.join(process.cwd(), "data", "nsumunc.db");
const DB_PATH = isVercel ? path.join("/tmp", "nsumunc.db") : ORIGINAL_DB;

if (isVercel) {
  try {
    if (!fs.existsSync(DB_PATH) && fs.existsSync(ORIGINAL_DB)) {
      fs.copyFileSync(ORIGINAL_DB, DB_PATH);
    }
  } catch (err) {
    console.error("Failed to copy db to /tmp on Vercel:", err);
  }
} else {
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
}

let db: Database.Database | null = null;
let schemaVersion = 0;
const CURRENT_SCHEMA_VERSION = 3;

function openConnection(): Database.Database {
  const conn = new Database(DB_PATH, { timeout: 5000 });
  conn.pragma("busy_timeout = 5000");
  conn.pragma("journal_mode = DELETE");
  conn.pragma("synchronous = NORMAL");
  conn.pragma("foreign_keys = ON");
  return conn;
}

export function getDb(): Database.Database {
  if (!db || !db.open) {
    db = openConnection();
    schemaVersion = 0;
  } else {
    try {
      db.prepare("SELECT 1").get();
    } catch {
      try {
        db.close();
      } catch {}
      db = openConnection();
      schemaVersion = 0;
    }
  }
  if (schemaVersion < CURRENT_SCHEMA_VERSION) {
    initSchema(db);
    schemaVersion = CURRENT_SCHEMA_VERSION;
  }
  return db;
}

export const DEFAULT_SETTINGS: Record<string, string> = {
  // Branding & Global
  club_name: defaultClubInfo.name,
  club_short_name: defaultClubInfo.shortName,
  club_university: defaultClubInfo.university,
  club_founded: String(defaultClubInfo.founded),
  club_tagline: defaultClubInfo.tagline,
  club_logo_image: "",
  nsu_logo_image: "/nsu-monogram.svg",
  nsu_logo_show: "true",
  nav_cta_label: "Join Us",
  nav_cta_href: "/contact",
  club_email: defaultClubInfo.email,
  club_facebook: defaultClubInfo.facebook,
  club_instagram: defaultClubInfo.instagram,
  club_location: defaultClubInfo.location,
  club_followers: defaultClubInfo.followers,
  footer_bio_extra: "Rooted in the legacy of the United Nations — peace, human rights, and international cooperation.",
  footer_watermark: "NSUMUNC · DIPLOMACY",
  footer_copyright: `© 2026 ${defaultClubInfo.name}. All rights reserved.`,

  // Hero & Tenure
  hero_tag: "where diplomacy goes global",
  hero_badge_text: `Recruitment ${defaultTenure.number} · ${defaultTenure.theme}`,
  hero_headline_1: "NSU Model",
  hero_headline_2: "UN Club",
  hero_tagline: defaultClubInfo.tagline,
  hero_subtext: `North South University · Dhaka, Bangladesh — Cultivating future diplomats, leaders, and global citizens since ${defaultClubInfo.founded}.`,
  hero_cta1_label: "Explore NSUIMUN",
  hero_cta1_href: "/events",
  hero_cta2_label: "Join the Club",
  hero_cta2_href: "/contact",
  hero_buttons_json: JSON.stringify([
    { label: "Explore NSUIMUN", href: "/events", variant: "blue" },
    { label: "Join the Club", href: "/contact", variant: "gold" },
  ]),
  hero_stamp_text: "NSUMUNC • DIPLOMACY AT ITS BEST • ",
  hero_scroll_hint: "(scroll to explore)",
  recruitment_number: String(defaultTenure.number),
  recruitment_theme: defaultTenure.theme,
  recruitment_description:
    "The 14th recruitment cycle welcomed 17 new members into the NSUMUNC family. Orientation was held at AUDI801 on October 12th.",

  // Home Sections
  announcements_heading: "Latest Updates",
  stats_tag: "by the numbers",
  stats_title: "A Legacy of",
  stats_accent: "Diplomatic Impact",
  stats_subtitle: "Over a decade of debates, international delegations, and Bangladesh's flagship MUN conferences.",
  emun_tag: "recent achievement",
  emun_title: "Eastern Model",
  emun_accent: "United Nations 2026",
  emun_subtitle: "NSU MUN Club represented North South University with distinction and brought home top honors.",
  emun_team_image: "/emun-team.jpg",
  emun_team_tag: "delegation",
  emun_team_title: "NSU MUN Club Team",
  emun_team_subtitle: "Eastern Model UN 2026",
  emun_award_badge: "🏆 Award Winner",
  showcase_tag: "explore milestones",
  showcase_title: "Conferences &",
  showcase_accent: "Flagship Editions",
  showcase_subtitle: "Hover or tap any milestone below to inspect our conferences, delegations, and recruitment cycles.",
  values_tag: "six pillars",
  values_title: "Our Core",
  values_accent: "Values",
  values_subtitle: "The foundational principles guiding every NSUMUNC session, conference, and diplomat.",

  // UN Day / Spotlight Card
  unday_tag: "october 24 · un day",
  unday_title: "United Nations Day",
  unday_quote: "Stronger Together for a More Peaceful and Sustainable World",
  unday_description:
    "NSUMUNC celebrated United Nations Day on October 24th, 2026 — honoring the founding principles of peace, development, and human rights.",
  unday_image: "/un-day.jpg",
  unday_blockquote: "The United Nations was not created to take us to heaven, but to save us from hell.",
  unday_blockquote_author: "Dag Hammarskjöld",

  // Home Bottom CTA
  home_cta_tag: "start your journey",
  home_cta_title: "Ready to Become a",
  home_cta_accent: "Diplomat?",
  home_cta_subtitle:
    "Join one of North South University's most prestigious clubs and gain skills in diplomacy, public speaking, and global affairs.",
  home_cta_btn1_label: "Apply Now",
  home_cta_btn1_href: "/contact",
  home_cta_btn2_label: "Learn More",
  home_cta_btn2_href: "/about",

  // About Page
  about_header_tag: "about agency & legacy",
  about_header_title: "Who We",
  about_header_accent: "Are",
  about_header_subtitle:
    "Rooted in the legacy of the United Nations — an institution founded on principles of peace, human rights, and international cooperation.",
  about_story_tag: "our story",
  about_story_title: "A Decade of Diplomatic Excellence",
  about_story_intro:
    "The NSU Model UN Club (NSUMUNC) was founded in 2012 at North South University, one of Bangladesh's premier private universities. Since its inception, the club has treaded the path of excellence.",
  about_description: defaultClubInfo.description,
  about_story_extra:
    "Our signature event, NSUIMUN (North South University International Model United Nations), has grown to become the largest MUN conference in Bangladesh — a four-day spectacle with participants from across the globe.",
  mission_section_tag: "purpose & direction",
  mission_section_title: "Mission &",
  mission_section_accent: "Vision",
  mission_section_subtitle: "Building tomorrow's diplomats through debate, negotiation, and international affairs simulation.",
  mission_card_tag: "001 · mission",
  mission_card_title: "Our Mission",
  mission_text: defaultMissionVision.mission,
  vision_card_tag: "002 · vision",
  vision_card_title: "Our Vision",
  vision_text: defaultMissionVision.vision,
  founder_section_tag: "origins",
  founder_section_title: "The Founder",
  founder_achievements_heading: "Notable Achievements",

  // Events Page
  events_header_tag: "events & conferences",
  events_header_title: "NSUIMUN &",
  events_header_accent: "Beyond",
  events_header_subtitle:
    "From organizing Bangladesh's largest MUN conference to representing NSU at international stages — our legacy of excellence continues.",
  events_cta_tag: "upcoming edition",
  events_cta_title: "Stay Tuned for NSUIMUN 2026",
  events_cta_subtitle: "Follow our social media pages for the latest updates, registration details, and announcements.",
  events_cta_btn1_label: "Get Notified",
  events_cta_btn1_href: "/contact",
  events_cta_btn2_label: "Follow on Facebook",

  // Team Page
  team_header_tag: "recruitment 14 · leadership",
  team_header_title: "Meet the",
  team_header_accent: "Secretariat",
  team_header_subtitle: "The dedicated individuals shaping the resurgence of NSU Model UN Club.",
  team_awards_tag: "eastern mun 2026",
  team_awards_title: "Recent",
  team_awards_accent: "Award Winners",
  team_awards_subtitle: "Delegates recognized for outstanding diplomacy and journalism.",
  team_cta_tag: "become a leader",
  team_cta_title: "Want to Join the Secretariat?",
  team_cta_subtitle:
    "We're always looking for passionate, dedicated individuals. If you have a love for diplomacy and a drive for excellence, we want to hear from you.",
  team_cta_btn_label: "Reach Out to Us",
  team_cta_btn_href: "/contact",

  // Gallery Page
  gallery_header_tag: "visual journey",
  gallery_header_title: "Our",
  gallery_header_accent: "Gallery",
  gallery_header_subtitle: "Moments from NSUIMUN, Eastern MUN 2026, Recruitment 14, and more — captured in time.",
  gallery_social_text: "See more high-resolution albums on our official social channels",
  gallery_fb_label: "Facebook Photos",
  gallery_ig_label: "Instagram · @nsumunc",

  // Contact Page
  contact_header_tag: "get in touch",
  contact_header_title: "Contact",
  contact_header_accent: "Us",
  contact_header_subtitle: "Questions about joining NSUMUNC, registering for NSUIMUN, or partnering with us?",
  contact_channels_tag: "direct channels",
  contact_channels_title: "Reach Out",
  contact_form_title: "Send a Message",
  contact_form_btn_label: "Send Message",
  newsletter_title: "Stay Updated",
  newsletter_subtitle: "Get notified about NSUIMUN registrations and club announcements.",

  // Structured JSON Lists
  stats_json: JSON.stringify(defaultStats),
  values_json: JSON.stringify(defaultValues),
  founder_json: JSON.stringify({ ...defaultFounder, image: "" }),
  marquee_json: JSON.stringify([
    "NSU MODEL UN CLUB",
    "DIPLOMACY AT ITS BEST",
    "SHAPE THE RESURGENCE",
    "NSUIMUN BANGLADESH",
    "NORTH SOUTH UNIVERSITY",
  ]),
  contact_subjects_json: JSON.stringify([
    "Join the Club",
    "NSUIMUN Registration",
    "Partnership / Sponsorship",
    "General Inquiry",
    "Media / Press",
  ]),
  nav_cta_show: "true",
  nav_items_json: JSON.stringify(defaultNavItems),
  faculty_advisor_json: JSON.stringify(defaultFacultyAdvisor),
};

function initSchema(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT NOT NULL,
      email      TEXT NOT NULL,
      subject    TEXT NOT NULL,
      message    TEXT NOT NULL,
      is_read    INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      email      TEXT NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS announcements (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      title      TEXT NOT NULL,
      body       TEXT NOT NULL,
      category   TEXT NOT NULL DEFAULT 'general',
      is_active  INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS events (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      year        TEXT NOT NULL,
      title       TEXT NOT NULL,
      short_title TEXT NOT NULL,
      theme       TEXT NOT NULL,
      date_label  TEXT NOT NULL,
      description TEXT NOT NULL,
      image       TEXT NOT NULL,
      type        TEXT NOT NULL DEFAULT 'conference',
      status      TEXT NOT NULL DEFAULT 'completed',
      delegates   TEXT,
      committees  INTEGER,
      days        INTEGER,
      sort_order  INTEGER NOT NULL DEFAULT 0,
      is_active   INTEGER NOT NULL DEFAULT 1,
      created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS team_members (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      role        TEXT NOT NULL,
      name        TEXT NOT NULL DEFAULT 'TBA',
      initial     TEXT NOT NULL,
      description TEXT NOT NULL,
      image       TEXT,
      body_type   TEXT NOT NULL DEFAULT 'executive',
      wing        TEXT DEFAULT '',
      sort_order  INTEGER NOT NULL DEFAULT 0,
      is_active   INTEGER NOT NULL DEFAULT 1,
      created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS achievements (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      conference  TEXT NOT NULL,
      name        TEXT NOT NULL,
      award       TEXT NOT NULL,
      image       TEXT NOT NULL,
      sort_order  INTEGER NOT NULL DEFAULT 0,
      is_active   INTEGER NOT NULL DEFAULT 1,
      created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS gallery_items (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      src         TEXT NOT NULL,
      caption     TEXT NOT NULL,
      category    TEXT NOT NULL DEFAULT 'Conference',
      year        TEXT NOT NULL DEFAULT '2026',
      sort_order  INTEGER NOT NULL DEFAULT 0,
      is_active   INTEGER NOT NULL DEFAULT 1,
      created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS site_settings (
      key        TEXT PRIMARY KEY,
      value      TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  /* ── Migrate columns on pre-existing tables ── */
  const msgCols = (database.prepare("PRAGMA table_info(contact_messages)").all() as { name: string }[]).map((c) => c.name);
  if (!msgCols.includes("is_read")) {
    database.exec("ALTER TABLE contact_messages ADD COLUMN is_read INTEGER NOT NULL DEFAULT 0");
  }

  const annCols = (database.prepare("PRAGMA table_info(announcements)").all() as { name: string }[]).map((c) => c.name);
  if (!annCols.includes("updated_at")) {
    database.exec("ALTER TABLE announcements ADD COLUMN updated_at DATETIME");
  }

  const teamCols = (database.prepare("PRAGMA table_info(team_members)").all() as { name: string }[]).map((c) => c.name);
  if (!teamCols.includes("image")) {
    database.exec("ALTER TABLE team_members ADD COLUMN image TEXT");
  }
  if (!teamCols.includes("body_type")) {
    database.exec("ALTER TABLE team_members ADD COLUMN body_type TEXT NOT NULL DEFAULT 'executive'");
  }
  if (!teamCols.includes("wing")) {
    database.exec("ALTER TABLE team_members ADD COLUMN wing TEXT DEFAULT ''");
  }

  /* ── Seed only if empty ── */
  const annCount = (database.prepare("SELECT COUNT(*) as c FROM announcements").get() as { c: number }).c;
  if (annCount === 0) {
    database.exec(`
      INSERT INTO announcements (title, body, category) VALUES
        ('Recruitment 14 — Shape the Resurgence', 'Congratulations to all 17 new recruits! Orientation was held at AUDI801 on 12th October at 6:00 PM. Welcome to the NSUMUNC family!', 'recruitment'),
        ('Eastern Model United Nations 2026', 'NSU MUN Club participated in Eastern MUN 2026. Congratulations to Somayea Afrin Sadia (Outstanding Delegate - NCSA) and Jahidul Dihaz (Editor in Chief - IP)!', 'achievement'),
        ('United Nations Day — October 24th', '"Stronger Together for a More Peaceful and Sustainable World." NSU MUN Club celebrated UN Day 2026.', 'event');
    `);
  }

  const evtCount = (database.prepare("SELECT COUNT(*) as c FROM events").get() as { c: number }).c;
  if (evtCount === 0) {
    database.exec(`
      INSERT INTO events (year, title, short_title, theme, date_label, description, image, type, status, delegates, committees, days, sort_order) VALUES
        ('2026','Eastern Model United Nations 2026','EMUN 2026','Participation','October 2026','NSU MUN Club sent a delegation to Eastern MUN 2026. The team brought home top awards — Jahidul Dihaz (Editor in Chief - IP) and Somayea Afrin Sadia (Outstanding Delegate - NCSA).','/emun-team.jpg','delegation','completed',NULL,NULL,NULL,1),
        ('2026','Recruitment 14 — Shape the Resurgence','Recruitment 14','Shape the Resurgence','October 2026','The 14th recruitment cycle welcomed 17 new members into the NSUMUNC family. Orientation was held at AUDI801 on October 12th at 6:00 PM.','/recruitment14-congrats.jpg','recruitment','completed',NULL,NULL,NULL,2),
        ('2022','NSUIMUN 2022','NSUIMUN V','Global Sustenance Through Solidarity','October 13–16, 2022','The 5th edition of NSUIMUN — the largest MUN conference in Bangladesh, featuring 7 committees, 500+ delegates, and 3 socials.','/recruitment14-orientation.jpg','conference','completed','500+',7,4,3),
        ('2019','NSUIMUN 2019','NSUIMUN IV','Diplomacy at its Best','2019','The 4th and biggest NSUIMUN — participants from across the globe, 8 committees, and a truly international experience.','/un-day.jpg','conference','completed','600+',8,4,4);
    `);
  }

  const teamCount = (database.prepare("SELECT COUNT(*) as c FROM team_members").get() as { c: number }).c;
  if (teamCount === 0) {
    database.exec(`
      INSERT INTO team_members (role, name, initial, description, body_type, wing, sort_order) VALUES
        ('Secretary-General','TBA','S','Leading NSUMUNC with a vision to redefine diplomatic excellence in Bangladesh.','executive','',1),
        ('Deputy Secretary-General','TBA','D','Supporting all administrative and academic affairs of the club.','executive','',2),
        ('Director-General','TBA','G','Overseeing operations, logistics, and conference execution.','executive','',3),
        ('USG — Conference Management','TBA','C','Managing all aspects of conference logistics and delegate experience.','executive','',4),
        ('USG — Public Relations','TBA','P','Leading communications, branding, and outreach.','executive','',5),
        ('USG — Delegate Affairs','TBA','A','Primary delegate point of contact across all conferences.','executive','',6),
        ('USG — Logistics','TBA','L','Ensuring flawless operations across every event and social.','executive','',7),
        ('Treasurer','TBA','T','Managing club finances, budgets, and sponsorships.','executive','',8);
    `);
  }

  const subEbCount = (
    database.prepare("SELECT COUNT(*) as c FROM team_members WHERE body_type = 'sub_eb'").get() as { c: number }
  ).c;
  if (subEbCount === 0) {
    const insertSub = database.prepare(
      "INSERT INTO team_members (role, name, initial, description, body_type, wing, sort_order) VALUES (?, ?, ?, ?, 'sub_eb', ?, ?)"
    );
    const subEbSeed: [string, string, string, string, string, number][] = [
      ["Director of Delegate Affairs", "Samiha Anjum", "S", "Overseeing 500+ national and international delegate applications for flagship conferences.", "Delegate Affairs & International Relations", 1],
      ["Deputy Director — Registrations", "Tahsin Al-Rashid", "T", "Managing credentials, delegate validation, and institutional delegation liaisons.", "Delegate Affairs & International Relations", 2],
      ["Associate — International Liaison", "Farhan Shahriar", "F", "Facilitating communication with foreign university delegations and diplomatic missions.", "Delegate Affairs & International Relations", 3],
      ["Head of Academic Research", "Nabeel Chowdhury", "N", "Curating study guides, policy dossiers, and RoP compliance across all committee simulations.", "Academics & Research Council", 4],
      ["Deputy Head — Crisis Strategy", "Anika Tabassum", "A", "Authoring real-time emergency crisis updates, backchannel storylines, and directives.", "Academics & Research Council", 5],
      ["Senior Academic Associate", "Wasif Rahman", "W", "Conducting training workshops for first-time delegates on draft resolution drafting.", "Academics & Research Council", 6],
      ["Director of Logistics", "Raiyan Kabir", "R", "Overseeing venue management, AUDI801 staging, recreation halls, and delegate materials.", "Logistics & Event Operations", 7],
      ["Deputy Director — Secretariat IT", "Zuhair Ahmed", "Z", "Directing committee voting screens, delegate portals, and conference tech infrastructure.", "Logistics & Event Operations", 8],
      ["Logistics Coordinator", "Maisha Rahman", "M", "Managing food, formal diplomatic banquet logistics, and transportation coordination.", "Logistics & Event Operations", 9],
      ["Head of Media & Publications", "Jahidul Dihaz", "J", "Directing official conference documentation, live coverage, and photo albums.", "Public Relations, Branding & Media", 10],
      ["Creative Lead — Visual Identity", "Sayed Mahmud", "S", "Designing conference visual assets, committee badges, certificates, and banners.", "Public Relations, Branding & Media", 11],
      ["PR & Press Secretary", "Rida Farheen", "R", "Liaising with university media partners, news publications, and social outreach.", "Public Relations, Branding & Media", 12],
    ];
    for (const [role, name, initial, desc, wing, order] of subEbSeed) {
      insertSub.run(role, name, initial, desc, wing, order);
    }
  }

  const achCount = (database.prepare("SELECT COUNT(*) as c FROM achievements").get() as { c: number }).c;
  if (achCount === 0) {
    const stmt = database.prepare(
      "INSERT INTO achievements (conference, name, award, image, sort_order) VALUES (?, ?, ?, ?, ?)"
    );
    defaultAchievements.forEach((a, i) => {
      stmt.run(a.conference, a.name, a.award, a.image, i + 1);
    });
  }

  const galCount = (database.prepare("SELECT COUNT(*) as c FROM gallery_items").get() as { c: number }).c;
  if (galCount === 0) {
    const stmt = database.prepare(
      "INSERT INTO gallery_items (src, caption, category, year, sort_order) VALUES (?, ?, ?, ?, ?)"
    );
    defaultGallery.forEach((g, i) => {
      stmt.run(g.src, g.caption, g.category, g.year, i + 1);
    });
  }

  /* Ensure all default settings keys exist without overwriting user-edited ones */
  const upsertSetting = database.prepare(
    "INSERT OR IGNORE INTO site_settings (key, value) VALUES (?, ?)"
  );
  for (const [key, val] of Object.entries(DEFAULT_SETTINGS)) {
    upsertSetting.run(key, val);
  }
}

/* ── Types ── */
export type ContactMessage = {
  id: number; name: string; email: string;
  subject: string; message: string;
  is_read: number; created_at: string;
};
export type NewsletterSubscriber = {
  id: number; email: string; created_at: string;
};
export type Announcement = {
  id: number; title: string; body: string;
  category: string; is_active: number;
  created_at: string; updated_at: string;
};
export type DbEvent = {
  id: number; year: string; title: string; short_title: string;
  theme: string; date_label: string; description: string;
  image: string; type: string; status: string;
  delegates: string | null; committees: number | null; days: number | null;
  sort_order: number; is_active: number;
  created_at: string; updated_at: string;
};
export type TeamMember = {
  id: number; role: string; name: string; initial: string;
  description: string; image?: string | null;
  body_type?: "executive" | "sub_eb";
  wing?: string;
  sort_order: number; is_active: number;
  created_at: string; updated_at: string;
};
export type DbAchievement = {
  id: number; conference: string; name: string; award: string;
  image: string; sort_order: number; is_active: number;
  created_at: string; updated_at: string;
};
export type DbGalleryItem = {
  id: number; src: string; caption: string; category: string;
  year: string; sort_order: number; is_active: number;
  created_at: string; updated_at: string;
};
export type SiteSetting = { key: string; value: string; updated_at: string };
export { type NavItem, type NavSubItem, defaultNavItems } from "./nav";

function safeJsonParse<T>(raw: string | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/**
 * Loads all live site content from SQLite with guaranteed fallbacks.
 */
export function getSiteContent() {
  const database = getDb();

  const rows = database.prepare("SELECT key, value FROM site_settings").all() as { key: string; value: string }[];
  const settings: Record<string, string> = { ...DEFAULT_SETTINGS };
  for (const r of rows) {
    if (r.value !== undefined && r.value !== null) {
      settings[r.key] = r.value;
    }
  }

  const announcements = database
    .prepare("SELECT * FROM announcements WHERE is_active = 1 ORDER BY created_at DESC LIMIT 6")
    .all() as Announcement[];

  const events = database
    .prepare("SELECT * FROM events WHERE is_active = 1 ORDER BY sort_order ASC, id ASC")
    .all() as DbEvent[];

  const team = database
    .prepare("SELECT * FROM team_members WHERE is_active = 1 ORDER BY sort_order ASC, id ASC")
    .all() as TeamMember[];

  const achievements = database
    .prepare("SELECT * FROM achievements WHERE is_active = 1 ORDER BY sort_order ASC, id ASC")
    .all() as DbAchievement[];

  const gallery = database
    .prepare("SELECT * FROM gallery_items WHERE is_active = 1 ORDER BY sort_order ASC, id ASC")
    .all() as DbGalleryItem[];

  const stats = safeJsonParse<{ value: string; label: string }[]>(settings.stats_json, defaultStats);
  const values = safeJsonParse<{ title: string; icon: string; description: string }[]>(
    settings.values_json,
    defaultValues
  );
  const founder = safeJsonParse<typeof defaultFounder & { image?: string }>(
    settings.founder_json,
    { ...defaultFounder, image: "" }
  );
  const marqueeItems = safeJsonParse<string[]>(settings.marquee_json, [
    "NSU MODEL UN CLUB",
    "DIPLOMACY AT ITS BEST",
    "SHAPE THE RESURGENCE",
    "NSUIMUN BANGLADESH",
    "NORTH SOUTH UNIVERSITY",
  ]);
  const contactSubjects = safeJsonParse<string[]>(settings.contact_subjects_json, [
    "Join the Club",
    "NSUIMUN Registration",
    "Partnership / Sponsorship",
    "General Inquiry",
    "Media / Press",
  ]);
  const navItems = safeJsonParse<NavItem[]>(settings.nav_items_json, defaultNavItems);
  const facultyAdvisor = safeJsonParse<FacultyAdvisorData>(
    settings.faculty_advisor_json,
    defaultFacultyAdvisor
  );

  return {
    settings,
    navItems,
    facultyAdvisor,
    announcements,
    events,
    team,
    achievements,
    gallery,
    stats,
    values,
    founder,
    marqueeItems,
    contactSubjects,
  };
}
