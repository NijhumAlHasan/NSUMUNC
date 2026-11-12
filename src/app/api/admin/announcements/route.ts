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
    const rows = db.prepare("SELECT * FROM announcements ORDER BY created_at DESC, id DESC").all();
    return NextResponse.json(
      { announcements: rows },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
    );
  } catch (err) {
    console.error("GET /api/admin/announcements error:", err);
    return NextResponse.json({ error: "Failed to load announcements" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const g = await guard();
  if (g) return g;
  try {
    const { title, body, category = "general" } = await req.json();
    if (!title?.trim() || !body?.trim()) {
      return NextResponse.json({ error: "Title and body are required" }, { status: 400 });
    }
    const db = getDb();
    const r = db
      .prepare("INSERT INTO announcements (title, body, category) VALUES (?,?,?)")
      .run(title.trim(), body.trim(), category || "general");
    revalidatePath("/", "layout");
    return NextResponse.json({ id: r.lastInsertRowid, success: true }, { status: 201 });
  } catch (err) {
    console.error("POST /api/admin/announcements error:", err);
    return NextResponse.json({ error: "Failed to create announcement" }, { status: 500 });
  }
}
