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
    const existing = db.prepare("SELECT * FROM achievements WHERE id=?").get(id) as Record<string, unknown> | undefined;
    if (!existing) {
      return NextResponse.json({ error: "Achievement not found" }, { status: 404 });
    }
    const conference = (body.conference ?? existing.conference ?? "").toString().trim();
    const name = (body.name ?? existing.name ?? "").toString().trim();
    const award = (body.award ?? existing.award ?? "").toString().trim();
    const image = (body.image || existing.image || "/emun-team.jpg").toString().trim();
    const sortOrder = body.sort_order !== undefined ? Number(body.sort_order) : Number(existing.sort_order ?? 0);
    const isActive = body.is_active !== undefined ? Number(body.is_active) : Number(existing.is_active ?? 1);

    db.prepare(
      "UPDATE achievements SET conference=?, name=?, award=?, image=?, sort_order=?, is_active=?, updated_at=CURRENT_TIMESTAMP WHERE id=?"
    ).run(conference, name, award, image, sortOrder, isActive, id);
    revalidatePath("/", "layout");
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PUT /api/admin/achievements/[id] error:", err);
    return NextResponse.json({ error: "Failed to update achievement" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await guard();
  if (g) return g;
  try {
    const { id } = await params;
    getDb().prepare("DELETE FROM achievements WHERE id=?").run(id);
    revalidatePath("/", "layout");
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/admin/achievements/[id] error:", err);
    return NextResponse.json({ error: "Failed to delete achievement" }, { status: 500 });
  }
}
