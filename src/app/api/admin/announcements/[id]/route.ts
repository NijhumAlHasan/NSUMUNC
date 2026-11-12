import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminAuthenticated } from "@/lib/auth";
import { getDb } from "@/lib/db";

async function guard() {
  if (!(await isAdminAuthenticated()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return null;
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await guard();
  if (g) return g;
  try {
    const { id } = await params;
    const { title, body, category = "general", is_active } = await req.json();
    if (!title?.trim() || !body?.trim()) {
      return NextResponse.json({ error: "Title and body are required" }, { status: 400 });
    }
    const activeVal = is_active !== undefined ? (is_active ? 1 : 0) : 1;
    const db = getDb();
    db.prepare(
      "UPDATE announcements SET title=?, body=?, category=?, is_active=?, updated_at=CURRENT_TIMESTAMP WHERE id=?"
    ).run(title.trim(), body.trim(), category || "general", activeVal, id);
    revalidatePath("/", "layout");
    return NextResponse.json(
      { success: true },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
    );
  } catch (err) {
    console.error("PUT /api/admin/announcements/[id] error:", err);
    return NextResponse.json({ error: "Failed to update announcement" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await guard();
  if (g) return g;
  try {
    const { id } = await params;
    getDb().prepare("DELETE FROM announcements WHERE id=?").run(id);
    revalidatePath("/", "layout");
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/admin/announcements/[id] error:", err);
    return NextResponse.json({ error: "Failed to delete announcement" }, { status: 500 });
  }
}
