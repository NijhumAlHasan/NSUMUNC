import { NextResponse } from "next/server";
import { getDb, Announcement } from "@/lib/db";

export async function GET() {
  try {
    const db = getDb();
    const announcements = db
      .prepare("SELECT * FROM announcements WHERE is_active = 1 ORDER BY created_at DESC LIMIT 6")
      .all() as Announcement[];
    return NextResponse.json({ announcements });
  } catch (error) {
    console.error("GET /api/announcements error:", error);
    return NextResponse.json({ announcements: [] }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, body: bodyText, category = "general" } = body;

    if (!title?.trim() || !bodyText?.trim()) {
      return NextResponse.json({ error: "title and body are required" }, { status: 400 });
    }

    const db = getDb();
    const result = db
      .prepare("INSERT INTO announcements (title, body, category) VALUES (?, ?, ?)")
      .run(title.trim(), bodyText.trim(), category);

    return NextResponse.json({ id: result.lastInsertRowid, success: true }, { status: 201 });
  } catch (error) {
    console.error("POST /api/announcements error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
