import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminAuthenticated } from "@/lib/auth";
import { getDb } from "@/lib/db";

async function guard() {
  if (!(await isAdminAuthenticated()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return null;
}

export async function GET() {
  const g = await guard();
  if (g) return g;
  try {
    const db = getDb();
    const rows = db.prepare("SELECT * FROM events ORDER BY sort_order ASC, id ASC").all();
    return NextResponse.json({ events: rows });
  } catch (err) {
    console.error("GET /api/admin/events error:", err);
    return NextResponse.json({ error: "Failed to load events" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const g = await guard();
  if (g) return g;
  try {
    const body = await req.json();
    const {
      year,
      title,
      short_title,
      theme,
      date_label,
      description,
      image,
      type = "conference",
      status = "upcoming",
      delegates,
      committees,
      days,
    } = body;
    if (!year?.trim() || !title?.trim() || !description?.trim()) {
      return NextResponse.json({ error: "Year, Title, and Description are required" }, { status: 400 });
    }
    const db = getDb();
    const maxOrder =
      (db.prepare("SELECT MAX(sort_order) as m FROM events").get() as { m: number | null }).m ?? 0;
    const r = db
      .prepare(
        `INSERT INTO events (year,title,short_title,theme,date_label,description,image,type,status,delegates,committees,days,sort_order)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`
      )
      .run(
        year.trim(),
        title.trim(),
        (short_title || title).trim(),
        (theme || "").trim(),
        (date_label || year).trim(),
        description.trim(),
        (image || "/emun-team.jpg").trim(),
        type || "conference",
        status || "upcoming",
        delegates ? String(delegates).trim() : null,
        committees ? Number(committees) : null,
        days ? Number(days) : null,
        maxOrder + 1
      );
    revalidatePath("/", "layout");
    return NextResponse.json({ id: r.lastInsertRowid, success: true }, { status: 201 });
  } catch (err) {
    console.error("POST /api/admin/events error:", err);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
