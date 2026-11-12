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
    const body = await req.json();
    const db = getDb();
    const existing = db.prepare("SELECT * FROM gallery_items WHERE id=?").get(id) as Record<string, unknown> | undefined;
    if (!existing) {
      return NextResponse.json({ error: "Gallery photo not found" }, { status: 404 });
    }
    const src = (body.src ?? existing.src ?? "").toString().trim();
    const caption = (body.caption ?? existing.caption ?? "").toString().trim();
    const category = body.category || existing.category || "Conference";
    const year = (body.year ?? existing.year ?? "2026").toString().trim();
    const sortOrder = body.sort_order !== undefined ? Number(body.sort_order) : Number(existing.sort_order ?? 0);
    const isActive = body.is_active !== undefined ? Number(body.is_active) : Number(existing.is_active ?? 1);

    db.prepare(
      "UPDATE gallery_items SET src=?, caption=?, category=?, year=?, sort_order=?, is_active=?, updated_at=CURRENT_TIMESTAMP WHERE id=?"
    ).run(src, caption, category, year, sortOrder, isActive, id);
    revalidatePath("/", "layout");
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PUT /api/admin/gallery/[id] error:", err);
    return NextResponse.json({ error: "Failed to update gallery photo" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await guard();
  if (g) return g;
  try {
    const { id } = await params;
    getDb().prepare("DELETE FROM gallery_items WHERE id=?").run(id);
    revalidatePath("/", "layout");
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/admin/gallery/[id] error:", err);
    return NextResponse.json({ error: "Failed to delete gallery photo" }, { status: 500 });
  }
}
