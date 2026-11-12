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
    const rows = getDb().prepare("SELECT * FROM achievements ORDER BY sort_order ASC, id ASC").all();
    return NextResponse.json({ achievements: rows });
  } catch (err) {
    console.error("GET /api/admin/achievements error:", err);
    return NextResponse.json({ error: "Failed to load achievements" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const g = await guard();
  if (g) return g;
  try {
    const { conference, name, award, image = "/emun-team.jpg" } = await req.json();
    if (!conference?.trim() || !name?.trim() || !award?.trim()) {
      return NextResponse.json({ error: "Conference, Winner Name, and Award are required" }, { status: 400 });
    }
    const db = getDb();
    const maxOrder =
      (db.prepare("SELECT MAX(sort_order) as m FROM achievements").get() as { m: number | null }).m ?? 0;
    const r = db
      .prepare("INSERT INTO achievements (conference, name, award, image, sort_order) VALUES (?, ?, ?, ?, ?)")
      .run(conference.trim(), name.trim(), award.trim(), image?.trim() || "/emun-team.jpg", maxOrder + 1);
    revalidatePath("/", "layout");
    return NextResponse.json({ id: r.lastInsertRowid, success: true }, { status: 201 });
  } catch (err) {
    console.error("POST /api/admin/achievements error:", err);
    return NextResponse.json({ error: "Failed to create achievement" }, { status: 500 });
  }
}
