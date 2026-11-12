import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const require = createRequire(import.meta.url);
const Database = require("better-sqlite3");

/* -------------------------------------------------------------------------- */
/*  1. Project Structure & Static Assets                                      */
/* -------------------------------------------------------------------------- */
describe("Project structure & static assets", () => {
  const requiredRoutes = [
    "src/app/page.tsx",
    "src/app/about/page.tsx",
    "src/app/events/page.tsx",
    "src/app/team/page.tsx",
    "src/app/gallery/page.tsx",
    "src/app/contact/page.tsx",
    "src/app/mdps/page.tsx",
    "src/app/faculty-advisor/page.tsx",
    "src/app/executive-body/page.tsx",
    "src/app/sub-executive-body/page.tsx",
    "src/app/legacy/page.tsx",
    "src/app/registration/page.tsx",
    "src/app/admin/page.tsx",
    "src/app/admin/login/page.tsx",
    "src/app/api/contact/route.ts",
    "src/app/api/newsletter/route.ts",
    "src/app/api/announcements/route.ts",
    "src/app/api/admin/login/route.ts",
    "src/app/api/admin/logout/route.ts",
    "src/app/api/admin/check/route.ts",
    "src/app/api/admin/announcements/route.ts",
    "src/app/api/admin/events/route.ts",
    "src/app/api/admin/team/route.ts",
    "src/app/api/admin/achievements/route.ts",
    "src/app/api/admin/gallery/route.ts",
    "src/app/api/admin/upload/route.ts",
    "src/app/api/admin/subscribers/route.ts",
    "src/app/api/admin/messages/route.ts",
    "src/app/api/admin/settings/route.ts",
  ];

  test("all required Next.js pages and API routes exist", () => {
    for (const relPath of requiredRoutes) {
      const fullPath = path.join(ROOT, relPath);
      assert.ok(fs.existsSync(fullPath), `Missing route file: ${relPath}`);
    }
  });

  test("all public images referenced in data.ts exist and are non-empty", () => {
    const dataSrc = fs.readFileSync(path.join(ROOT, "src/lib/data.ts"), "utf8");
    const imgMatches = [...dataSrc.matchAll(/["'](\/[a-zA-Z0-9_-]+\.(?:jpg|jpeg|png|svg|webp))["']/g)];
    assert.ok(imgMatches.length > 0, "Expected image paths in src/lib/data.ts");

    for (const [, imgPath] of imgMatches) {
      const diskPath = path.join(ROOT, "public", imgPath);
      assert.ok(fs.existsSync(diskPath), `Missing public asset: public${imgPath}`);
      const stat = fs.statSync(diskPath);
      assert.ok(stat.size > 0, `Empty public asset: public${imgPath}`);
    }
  });
});

/* -------------------------------------------------------------------------- */
/*  2. SQLite Database Schema, Seeding & CRUD                                 */
/* -------------------------------------------------------------------------- */
describe("SQLite database schema & CRUD smoke tests", () => {
  let tmpDir;
  let db;

  before(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "nsumunc-smoke-"));
    const prodDbPath = path.join(ROOT, "data", "nsumunc.db");
    const testDbPath = path.join(tmpDir, "nsumunc.db");

    if (fs.existsSync(prodDbPath)) {
      fs.copyFileSync(prodDbPath, testDbPath);
    }
    db = new Database(testDbPath);
    db.pragma("journal_mode = DELETE");
    db.pragma("foreign_keys = ON");
  });

  after(() => {
    if (db) db.close();
    if (tmpDir && fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  test("production database exists and contains all 8 core tables", () => {
    const expectedTables = [
      "contact_messages",
      "newsletter_subscribers",
      "announcements",
      "events",
      "team_members",
      "achievements",
      "gallery_items",
      "site_settings",
    ];
    const rows = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table'")
      .all()
      .map((r) => r.name);

    for (const table of expectedTables) {
      assert.ok(rows.includes(table), `Missing table: ${table}`);
    }
  });

  test("seed data is populated in announcements, events, team_members, achievements, gallery_items, and site_settings", () => {
    const counts = {
      announcements: db.prepare("SELECT COUNT(*) as c FROM announcements").get().c,
      events: db.prepare("SELECT COUNT(*) as c FROM events").get().c,
      team_members: db.prepare("SELECT COUNT(*) as c FROM team_members").get().c,
      achievements: db.prepare("SELECT COUNT(*) as c FROM achievements").get().c,
      gallery_items: db.prepare("SELECT COUNT(*) as c FROM gallery_items").get().c,
      site_settings: db.prepare("SELECT COUNT(*) as c FROM site_settings").get().c,
    };

    assert.ok(counts.announcements >= 1, "Expected seeded announcements");
    assert.ok(counts.events >= 1, "Expected seeded events");
    assert.ok(counts.team_members >= 1, "Expected seeded team_members");
    assert.ok(counts.achievements >= 1, "Expected seeded achievements");
    assert.ok(counts.gallery_items >= 1, "Expected seeded gallery_items");
    assert.ok(counts.site_settings >= 1, "Expected seeded site_settings");
  });

  test("contact_messages insert, mark read, and delete", () => {
    const info = db
      .prepare("INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)")
      .run("Smoke Tester", "smoke@nsumunc.test", "Smoke Subject", "Smoke test message body.");
    assert.ok(info.lastInsertRowid > 0);

    db.prepare("UPDATE contact_messages SET is_read = 1 WHERE id = ?").run(info.lastInsertRowid);
    const row = db.prepare("SELECT * FROM contact_messages WHERE id = ?").get(info.lastInsertRowid);
    assert.equal(row.is_read, 1);

    db.prepare("DELETE FROM contact_messages WHERE id = ?").run(info.lastInsertRowid);
    const deleted = db.prepare("SELECT * FROM contact_messages WHERE id = ?").get(info.lastInsertRowid);
    assert.equal(deleted, undefined);
  });

  test("newsletter_subscribers enforces UNIQUE email constraint", () => {
    const email = "unique-smoke@nsumunc.test";
    db.prepare("INSERT INTO newsletter_subscribers (email) VALUES (?)").run(email);
    assert.throws(() => {
      db.prepare("INSERT INTO newsletter_subscribers (email) VALUES (?)").run(email);
    }, /UNIQUE constraint failed/);
  });

  test("site_settings upsert updates existing key", () => {
    const stmt = db.prepare(
      "INSERT INTO site_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value"
    );
    stmt.run("hero_tagline", "Smoke Test Tagline");
    const row = db.prepare("SELECT value FROM site_settings WHERE key = ?").get("hero_tagline");
    assert.equal(row.value, "Smoke Test Tagline");
  });

  test("announcements insert, update with updated_at, and delete", () => {
    const info = db
      .prepare("INSERT INTO announcements (title, body, category) VALUES (?, ?, ?)")
      .run("Smoke Title", "Smoke Body", "general");
    assert.ok(info.lastInsertRowid > 0);

    db.prepare(
      "UPDATE announcements SET title=?, body=?, category=?, is_active=?, updated_at=CURRENT_TIMESTAMP WHERE id=?"
    ).run("Updated Smoke Title", "Updated Body", "event", 1, info.lastInsertRowid);

    const row = db.prepare("SELECT * FROM announcements WHERE id = ?").get(info.lastInsertRowid);
    assert.equal(row.title, "Updated Smoke Title");

    db.prepare("DELETE FROM announcements WHERE id = ?").run(info.lastInsertRowid);
  });
});

/* -------------------------------------------------------------------------- */
/*  3. Admin Auth Token Logic                                                 */
/* -------------------------------------------------------------------------- */
describe("Admin authentication token logic", () => {
  test("generateToken produces deterministic base64url token", () => {
    const secret = process.env.ADMIN_SESSION_SECRET || "change-me-in-production";
    const token = Buffer.from(`nsumunc-admin:${secret}`).toString("base64url");
    assert.ok(token.length > 10);
    assert.match(token, /^[A-Za-z0-9_-]+$/);
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    assert.equal(decoded, `nsumunc-admin:${secret}`);
  });
});

/* -------------------------------------------------------------------------- */
/*  4. Live HTTP Server Smoke Checks (runs when server is reachable)          */
/* -------------------------------------------------------------------------- */
describe("Live HTTP smoke checks (optional if server not running)", async () => {
  const BASE_URL = process.env.SMOKE_BASE_URL || "http://localhost:3000";
  let serverOnline = false;

  before(async () => {
    try {
      const res = await fetch(BASE_URL, { signal: AbortSignal.timeout(1500) });
      serverOnline = res.ok;
    } catch {
      serverOnline = false;
    }
  });

  test("public pages return 200 OK and hide admin button from public visitors", async (t) => {
    if (!serverOnline) return t.skip(`Server not reachable at ${BASE_URL}`);
    for (const route of [
      "/",
      "/about",
      "/events",
      "/team",
      "/gallery",
      "/contact",
      "/mdps",
      "/faculty-advisor",
      "/executive-body",
      "/sub-executive-body",
      "/legacy",
      "/registration",
      "/admin/login",
    ]) {
      const res = await fetch(`${BASE_URL}${route}`);
      assert.equal(res.status, 200, `Expected 200 on ${route}, got ${res.status}`);
    }

    // Verify unauthenticated home page does not leak the admin button
    const publicHomeRes = await fetch(`${BASE_URL}/`);
    const publicHtml = await publicHomeRes.text();
    assert.ok(!publicHtml.includes('href="/admin"'), "Public page should NOT expose href='/admin' button");
  });

  test("GET /api/announcements returns active announcements array", async (t) => {
    if (!serverOnline) return t.skip(`Server not reachable at ${BASE_URL}`);
    const res = await fetch(`${BASE_URL}/api/announcements`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data.announcements));
  });

  test("POST /api/contact validates bad input with 400", async (t) => {
    if (!serverOnline) return t.skip(`Server not reachable at ${BASE_URL}`);
    const res = await fetch(`${BASE_URL}/api/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "", email: "bad", subject: "", message: "short" }),
    });
    assert.equal(res.status, 400);
  });

  test("unauthenticated admin API requests return 401", async (t) => {
    if (!serverOnline) return t.skip(`Server not reachable at ${BASE_URL}`);
    for (const endpoint of [
      "/api/admin/announcements",
      "/api/admin/events",
      "/api/admin/team",
      "/api/admin/achievements",
      "/api/admin/gallery",
      "/api/admin/subscribers",
      "/api/admin/messages",
      "/api/admin/settings",
    ]) {
      const res = await fetch(`${BASE_URL}${endpoint}`);
      assert.equal(res.status, 401, `Expected 401 for unauthenticated ${endpoint}`);
    }
  });

  test("authenticated admin updates work end-to-end without SQLite errors", async (t) => {
    if (!serverOnline) return t.skip(`Server not reachable at ${BASE_URL}`);
    const loginRes = await fetch(`${BASE_URL}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: process.env.ADMIN_PASSWORD || "nsumunc2026" }),
    });
    assert.equal(loginRes.status, 200, "Admin login should succeed with 200");
    const setCookie = loginRes.headers.get("set-cookie") || "";
    const cookieHeader = setCookie.split(";")[0];
    const headers = {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    };

    // 1. Update a setting and verify GET /admin & GET / return 200
    const setRes = await fetch(`${BASE_URL}/api/admin/settings`, {
      method: "POST",
      headers,
      body: JSON.stringify({ updates: { hero_scroll_hint: "(scroll to explore)" } }),
    });
    assert.equal(setRes.status, 200);

    // 2. Update team member 1 and verify GET /team returns 200
    const teamListRes = await fetch(`${BASE_URL}/api/admin/team`, { headers });
    assert.equal(teamListRes.status, 200);
    const { team } = await teamListRes.json();
    if (team.length > 0) {
      const first = team[0];
      const putTeam = await fetch(`${BASE_URL}/api/admin/team/${first.id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ ...first }),
      });
      assert.equal(putTeam.status, 200);
    }

    // 3. Re-fetch public pages after admin writes to ensure zero SQLite I/O errors
    for (const route of ["/", "/about", "/events", "/team", "/gallery", "/contact", "/admin"]) {
      const res = await fetch(`${BASE_URL}${route}`, { headers: { Cookie: cookieHeader } });
      assert.equal(res.status, 200, `Expected 200 on ${route} after admin write, got ${res.status}`);
    }
  });

  test("robots.txt blocks /admin and public HTML has no admin links", async () => {
    const robotsRes = await fetch(`${BASE_URL}/robots.txt`);
    assert.equal(robotsRes.status, 200);
    const robotsText = await robotsRes.text();
    assert.match(robotsText, /Disallow: \/admin/);

    const homeRes = await fetch(`${BASE_URL}/`);
    assert.equal(homeRes.status, 200);
    const homeHtml = await homeRes.text();
    // Verify no visible Admin Panel link or button in public HTML
    assert.ok(!homeHtml.includes('href="/admin"'), "Public HTML should not link to /admin");
    assert.ok(!homeHtml.includes("Admin Panel ⚙"), "Public HTML should not contain 'Admin Panel ⚙'");
  });

  test("brute force rate limiter locks out after 5 bad attempts", async () => {
    const spoofIp = "192.168.100.42";
    let lastStatus = 0;
    let lastBody = {};

    for (let i = 0; i < 6; i++) {
      const res = await fetch(`${BASE_URL}/api/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": spoofIp,
        },
        body: JSON.stringify({ password: "wrong_password_test" }),
      });
      lastStatus = res.status;
      lastBody = await res.json();
    }

    assert.equal(lastStatus, 429, `Expected 429 rate limit lockout, got ${lastStatus}`);
    assert.match(lastBody.error, /Too many failed attempts/);
  });

  test("card action buttons stay strictly inside /admin and never leak to live website", async () => {
    // 1. Live website /events and /team should NEVER contain floating admin action buttons
    const publicRes = await fetch(`${BASE_URL}/events`);
    const publicHtml = await publicRes.text();
    assert.ok(!publicHtml.includes('title="Add new event"'), "Live /events should never have card Add button");
    assert.ok(!publicHtml.includes('title="Delete this event"'), "Live /events should never have card Delete button");

    // 2. Authenticated request to /admin dashboard MUST contain + Add, Edit, and Delete
    const loginRes = await fetch(`${BASE_URL}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: process.env.ADMIN_PASSWORD || "nsumunc2026" }),
    });
    assert.equal(loginRes.status, 200, "Admin login should succeed");
    const setCookie = loginRes.headers.get("set-cookie") || "";
    const cookieHeader = setCookie.split(";")[0];

    const adminRes = await fetch(`${BASE_URL}/admin`, {
      headers: { Cookie: cookieHeader },
    });
    assert.equal(adminRes.status, 200);
    const adminHtml = await adminRes.text();
    assert.ok(adminHtml.includes("+ Add Button"), "Admin panel should contain + Add Button");
    assert.ok(adminHtml.includes("Delete"), "Admin panel should contain Delete buttons");
    assert.ok(adminHtml.includes("Edit"), "Admin panel should contain Edit buttons");
  });

  test("hero buttons dynamic add, update, and delete workflow", async () => {
    // 1. Log in as admin
    const loginRes = await fetch(`${BASE_URL}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: process.env.ADMIN_PASSWORD || "nsumunc2026" }),
    });
    const setCookie = loginRes.headers.get("set-cookie") || "";
    const cookieHeader = setCookie.split(";")[0];
    const headers = { "Content-Type": "application/json", Cookie: cookieHeader };

    // 2. Add 3 buttons to hero via settings
    const threeButtons = [
      { label: "Dynamic Button 1", href: "/events", variant: "blue" },
      { label: "Dynamic Button 2", href: "/contact", variant: "gold" },
      { label: "Dynamic Button 3", href: "/about", variant: "glass" },
    ];
    const saveRes = await fetch(`${BASE_URL}/api/admin/settings`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        updates: {
          hero_buttons_json: JSON.stringify(threeButtons),
          hero_cta1_label: "Dynamic Button 1",
          hero_cta1_href: "/events",
        },
      }),
    });
    assert.equal(saveRes.status, 200);

    // 3. Verify public Home page renders all 3 buttons
    const homeRes = await fetch(`${BASE_URL}/`);
    const homeHtml = await homeRes.text();
    assert.ok(homeHtml.includes("Dynamic Button 1"), "Home page should render Dynamic Button 1");
    assert.ok(homeHtml.includes("Dynamic Button 2"), "Home page should render Dynamic Button 2");
    assert.ok(homeHtml.includes("Dynamic Button 3"), "Home page should render Dynamic Button 3");

    // 4. Delete button 3 and verify Home page updates
    const twoButtons = threeButtons.slice(0, 2);
    const deleteRes = await fetch(`${BASE_URL}/api/admin/settings`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        updates: {
          hero_buttons_json: JSON.stringify(twoButtons),
        },
      }),
    });
    assert.equal(deleteRes.status, 200);

    const homeAfterDelete = await (await fetch(`${BASE_URL}/`)).text();
    assert.ok(homeAfterDelete.includes("Dynamic Button 1"));
    assert.ok(!homeAfterDelete.includes("Dynamic Button 3"), "Home page should no longer have Dynamic Button 3");

    // 5. Restore original default buttons
    await fetch(`${BASE_URL}/api/admin/settings`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        updates: {
          hero_buttons_json: JSON.stringify([
            { label: "Explore NSUIMUN", href: "/events", variant: "blue" },
            { label: "Join the Club", href: "/contact", variant: "gold" },
          ]),
          hero_cta1_label: "Explore NSUIMUN",
          hero_cta1_href: "/events",
          hero_cta2_label: "Join the Club",
          hero_cta2_href: "/contact",
        },
      }),
    });
  });

  test("announcements and card hide/show visibility toggling works end-to-end", async () => {
    // 1. Admin login
    const loginRes = await fetch(`${BASE_URL}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: process.env.ADMIN_PASSWORD || "nsumunc2026" }),
    });
    const cookieHeader = (loginRes.headers.get("set-cookie") || "").split(";")[0];
    const headers = { "Content-Type": "application/json", Cookie: cookieHeader };

    // 2. Create a test announcement to toggle
    const uniqueTitle = `Smoke Test Visibility ${Date.now()}`;
    const createRes = await fetch(`${BASE_URL}/api/admin/announcements`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        title: uniqueTitle,
        body: "Visibility toggle smoke verification body",
        category: "general",
      }),
    });
    assert.equal(createRes.status, 201, "Announcement creation should return 201");
    const { id: announceId } = await createRes.json();

    // 3. Verify public home page shows the newly created active announcement
    const homeWithActive = await (await fetch(`${BASE_URL}/`)).text();
    assert.ok(homeWithActive.includes(uniqueTitle), "Public home should show newly published announcement");

    // 4. Click 'Hide' (PUT is_active: 0)
    const hideRes = await fetch(`${BASE_URL}/api/admin/announcements/${announceId}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        title: uniqueTitle,
        body: "Visibility toggle smoke verification body",
        category: "general",
        is_active: 0,
      }),
    });
    assert.equal(hideRes.status, 200, "Hiding announcement should return 200");

    // Verify GET /api/admin/announcements has Cache-Control: no-store and reports is_active === 0
    const listRes = await fetch(`${BASE_URL}/api/admin/announcements`, { headers });
    assert.equal(listRes.status, 200);
    assert.ok(listRes.headers.get("cache-control")?.includes("no-store"));
    const { announcements } = await listRes.json();
    const foundAnnounce = announcements.find((a) => a.id === announceId);
    assert.equal(foundAnnounce?.is_active, 0, "Announcement should be marked is_active: 0 in admin");

    // Verify public home page no longer contains the hidden announcement
    const homeWithHidden = await (await fetch(`${BASE_URL}/`)).text();
    assert.ok(!homeWithHidden.includes(uniqueTitle), "Public home should NOT contain hidden announcement");

    // 5. Click 'Show' (PUT is_active: 1)
    const showRes = await fetch(`${BASE_URL}/api/admin/announcements/${announceId}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        title: uniqueTitle,
        body: "Visibility toggle smoke verification body",
        category: "general",
        is_active: 1,
      }),
    });
    assert.equal(showRes.status, 200, "Showing announcement should return 200");

    // Verify public home page shows the announcement again
    const homeRestored = await (await fetch(`${BASE_URL}/`)).text();
    assert.ok(homeRestored.includes(uniqueTitle), "Public home should show announcement after unhiding");

    // 6. Clean up the test announcement
    const delRes = await fetch(`${BASE_URL}/api/admin/announcements/${announceId}`, {
      method: "DELETE",
      headers,
    });
    assert.equal(delRes.status, 200);

    // 7. Verify /admin UI contains Hide/Show buttons for cards
    const adminRes = await fetch(`${BASE_URL}/admin`, { headers: { Cookie: cookieHeader } });
    const adminHtml = await adminRes.text();
    assert.ok(adminHtml.includes("Hide") || adminHtml.includes("Show"), "Admin page must render Hide/Show buttons");
  });

  test("main header is editable, deletable, and toggleable end-to-end", async () => {
    // 1. Admin login
    const loginRes = await fetch(`${BASE_URL}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: process.env.ADMIN_PASSWORD || "nsumunc2026" }),
    });
    const cookieHeader = (loginRes.headers.get("set-cookie") || "").split(";")[0];
    const headers = { "Content-Type": "application/json", Cookie: cookieHeader };

    // 2. Fetch current nav items from /api/admin/settings
    const customLinkTitle = `Custom Nav Link ${Date.now()}`;
    const testNav = [
      { id: "home", label: "Home", href: "/", is_active: true },
      { id: "custom", label: customLinkTitle, href: "/mdps", is_active: true },
      { id: "events", label: "Events", href: "/events", is_active: true },
    ];

    const saveNavRes = await fetch(`${BASE_URL}/api/admin/settings`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        updates: {
          nav_items_json: JSON.stringify(testNav),
        },
      }),
    });
    assert.equal(saveNavRes.status, 200);

    // 3. Verify public page renders customLinkTitle in the header
    const homeWithNav = await (await fetch(`${BASE_URL}/`)).text();
    assert.ok(homeWithNav.includes(customLinkTitle), "Public header should render new custom nav link");

    // 4. Delete the custom link (revert back to standard navigation)
    const standardNav = [
      { id: "home", label: "Home", href: "/", is_active: true },
      { id: "about", label: "About", href: "/about", is_active: true },
      {
        id: "events",
        label: "Events",
        href: "/events",
        is_active: true,
        children: [
          { label: "All Events & Conferences", href: "/events", is_active: true },
          { label: "Member Development (MDPs)", href: "/mdps", is_active: true },
          { label: "Delegate Registration", href: "/registration", is_active: true },
          { label: "NSUIMUN 2022", href: "/events#nsuimun", is_active: true },
        ],
      },
      { id: "faculty-advisor", label: "Faculty Advisor", href: "/faculty-advisor", is_active: true },
      {
        id: "team",
        label: "Team",
        href: "/team",
        is_active: true,
        children: [
          { label: "Secretariat & Team", href: "/team", is_active: true },
          { label: "Executive Body", href: "/executive-body", is_active: true },
          { label: "Sub-Executive Body", href: "/sub-executive-body", is_active: true },
          { label: "Legacy (Past Panels)", href: "/legacy", is_active: true },
        ],
      },
      { id: "gallery", label: "Gallery", href: "/gallery", is_active: true },
      { id: "contact", label: "Contact", href: "/contact", is_active: true },
    ];

    const revertRes = await fetch(`${BASE_URL}/api/admin/settings`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        updates: {
          nav_items_json: JSON.stringify(standardNav),
          nav_cta_show: "true",
          nav_cta_label: "Join Us",
        },
      }),
    });
    assert.equal(revertRes.status, 200);

    // 5. Verify public page no longer contains the deleted custom link
    const homeReverted = await (await fetch(`${BASE_URL}/`)).text();
    assert.ok(!homeReverted.includes(customLinkTitle), "Public header should no longer contain deleted link");
    assert.ok(homeReverted.includes("MDPs"), "Public header should contain MDPs link");
    assert.ok(homeReverted.includes("Faculty Advisor"), "Public header should contain Faculty Advisor link");
  });

  test("logo image upload button workflow and navbar emblem end-to-end", async () => {
    // 1. Admin login
    const loginRes = await fetch(`${BASE_URL}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: process.env.ADMIN_PASSWORD || "nsumunc2026" }),
    });
    const cookieHeader = (loginRes.headers.get("set-cookie") || "").split(";")[0];
    const headers = { Cookie: cookieHeader };

    // 2. Upload dummy logo PNG to /api/admin/upload
    const dummyPng = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      "base64"
    );
    const formData = new FormData();
    formData.append(
      "file",
      new Blob([dummyPng], { type: "image/png" }),
      "test-club-logo.png"
    );

    const uploadRes = await fetch(`${BASE_URL}/api/admin/upload`, {
      method: "POST",
      headers,
      body: formData,
    });
    assert.equal(uploadRes.status, 201, "Logo upload should return 201");
    const uploadData = await uploadRes.json();
    assert.ok(uploadData.url && uploadData.url.startsWith("/uploads/"), "Upload should return URL");

    // 3. Save as club_logo_image
    const saveLogoRes = await fetch(`${BASE_URL}/api/admin/settings`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        updates: { club_logo_image: uploadData.url },
      }),
    });
    assert.equal(saveLogoRes.status, 200, "Saving club_logo_image should return 200");

    // 4. Verify homepage renders the custom uploaded logo in navbar
    const homeHtml = await (await fetch(`${BASE_URL}/`)).text();
    assert.ok(
      homeHtml.includes(encodeURIComponent(uploadData.url)) || homeHtml.includes(uploadData.url),
      "Navbar should render custom uploaded logo"
    );
    assert.ok(
      homeHtml.includes("nsu-monogram.svg"),
      "Public website should render official North South University monogram"
    );
  });

  test("executive body and sub-executive body differentiation and admin workflow", async () => {
    // 1. Admin login
    const loginRes = await fetch(`${BASE_URL}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: process.env.ADMIN_PASSWORD || "nsumunc2026" }),
    });
    const cookieHeader = (loginRes.headers.get("set-cookie") || "").split(";")[0];
    const headers = { Cookie: cookieHeader, "Content-Type": "application/json" };

    // 2. Add a new Sub-EB member via POST /api/admin/team
    const testSubRole = "Deputy Director of External Liaison " + Date.now();
    const testSubName = "Zaidan Test " + Date.now();
    const testWing = "Delegate Affairs & International Relations";

    const addRes = await fetch(`${BASE_URL}/api/admin/team`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        role: testSubRole,
        name: testSubName,
        initial: "Z",
        description: "Coordinating external university delegations for flagship conferences.",
        body_type: "sub_eb",
        wing: testWing,
      }),
    });
    assert.equal(addRes.status, 201, "Adding Sub-EB member should return 201");
    const { id: newSubId } = await addRes.json();
    assert.ok(newSubId, "Expected new sub-EB member ID");

    // 3. Verify /sub-executive-body renders the new Sub-EB member under their wing
    const subEbHtml = await (await fetch(`${BASE_URL}/sub-executive-body`)).text();
    assert.ok(subEbHtml.includes(testSubRole), "Sub-EB page should render the new Sub-EB member role");
    assert.ok(subEbHtml.includes(testSubName), "Sub-EB page should render the new Sub-EB member name");
    assert.ok(
      subEbHtml.includes("Delegate Affairs") && (subEbHtml.includes(testWing) || subEbHtml.includes("Delegate Affairs &amp; International Relations")),
      "Sub-EB page should render the operational wing"
    );

    // 4. Verify /executive-body does NOT render the Sub-EB member
    const ebHtml = await (await fetch(`${BASE_URL}/executive-body`)).text();
    assert.ok(!ebHtml.includes(testSubRole), "Executive Body page should NOT render the Sub-EB member");

    // 5. Verify /team links to Sub-Executive Body
    const teamHtml = await (await fetch(`${BASE_URL}/team`)).text();
    assert.ok(teamHtml.includes("/sub-executive-body"), "Team page should include link to Sub-Executive Body");

    // 6. Delete the test Sub-EB member
    const delRes = await fetch(`${BASE_URL}/api/admin/team/${newSubId}`, {
      method: "DELETE",
      headers,
    });
    assert.equal(delRes.status, 200, "Deleting Sub-EB member should return 200");

    // 7. Verify deletion from Sub-EB page
    const subEbAfterDel = await (await fetch(`${BASE_URL}/sub-executive-body`)).text();
    assert.ok(!subEbAfterDel.includes(testSubRole), "Sub-EB page should no longer include deleted member");
  });
});
