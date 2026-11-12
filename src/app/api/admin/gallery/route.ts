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
    const rows = getDb().prepare("SELECT * FROM gallery_items ORDER BY sort_order ASC, id ASC").all();
    return NextResponse.json({ gallery: rows });
  } catch (err) {
    console.error("GET /api/admin/gallery error:", err);
    return NextResponse.json({ error: "Failed to load gallery" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const g = await guard();
  if (g) return g;
  try {
    const { src, caption, category = "Conference", year = "2026" } = await req.json();
    if (!src?.trim() || !caption?.trim()) {
      return NextResponse.json({ error: "Photo and Caption are required" }, { status: 400 });
    }
    const db = getDb();
    const maxOrder =
      (db.prepare("SELECT MAX(sort_order) as m FROM gallery_items").get() as { m: number | null }).m ?? 0;
    const r = db
      .prepare("INSERT INTO gallery_items (src, caption, category, year, sort_order) VALUES (?, ?, ?, ?, ?)")
      .run(src.trim(), caption.trim(), category || "Conference", (year || "2026").trim(), maxOrder + 1);
    revalidatePath("/", "layout");
    return NextResponse.json({ id: r.lastInsertRowid, success: true }, { status: 201 });
  } catch (err) {
    console.error("POST /api/admin/gallery error:", err);
    return NextResponse.json({ error: "Failed to add gallery photo" }, { status: 500 });
  }
}
