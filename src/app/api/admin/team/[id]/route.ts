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
    const existing = db.prepare("SELECT * FROM team_members WHERE id=?").get(id) as Record<string, unknown> | undefined;
    if (!existing) {
      return NextResponse.json({ error: "Team member not found" }, { status: 404 });
    }

    const role = (body.role ?? existing.role ?? "").toString().trim();
    const name = (body.name ?? existing.name ?? "TBA").toString().trim() || "TBA";
    const initial = (
      body.initial?.toString().trim() ||
      (name !== "TBA" ? name.charAt(0) : role.charAt(0)) ||
      "M"
    )
      .charAt(0)
      .toUpperCase();
    const description = (body.description ?? existing.description ?? "").toString().trim();
    const image = body.image !== undefined ? (body.image?.toString().trim() || null) : (existing.image ?? null);
    const bodyType = body.body_type !== undefined ? (body.body_type === "sub_eb" ? "sub_eb" : "executive") : (existing.body_type ?? "executive");
    const wing = body.wing !== undefined ? body.wing.toString().trim() : (existing.wing ?? "");
    const sortOrder = body.sort_order !== undefined ? Number(body.sort_order) : Number(existing.sort_order ?? 0);
    const isActive = body.is_active !== undefined ? Number(body.is_active) : Number(existing.is_active ?? 1);

    db.prepare(
      "UPDATE team_members SET role=?, name=?, initial=?, description=?, image=?, body_type=?, wing=?, sort_order=?, is_active=?, updated_at=CURRENT_TIMESTAMP WHERE id=?"
    ).run(role, name, initial, description, image, bodyType, wing, sortOrder, isActive, id);
    revalidatePath("/", "layout");
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PUT /api/admin/team/[id] error:", err);
    return NextResponse.json({ error: "Failed to update team member" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await guard();
  if (g) return g;
  try {
    const { id } = await params;
    getDb().prepare("DELETE FROM team_members WHERE id=?").run(id);
    revalidatePath("/", "layout");
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/admin/team/[id] error:", err);
    return NextResponse.json({ error: "Failed to delete team member" }, { status: 500 });
  }
}
