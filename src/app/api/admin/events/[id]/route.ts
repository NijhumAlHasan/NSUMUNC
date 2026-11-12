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
    const b = await req.json();
    const db = getDb();
    const existing = db.prepare("SELECT * FROM events WHERE id=?").get(id) as Record<string, unknown> | undefined;
    if (!existing) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    const year = (b.year ?? existing.year ?? "").toString().trim();
    const title = (b.title ?? existing.title ?? "").toString().trim();
    const shortTitle = (b.short_title || title).toString().trim();
    const theme = (b.theme ?? existing.theme ?? "").toString().trim();
    const dateLabel = (b.date_label || year).toString().trim();
    const description = (b.description ?? existing.description ?? "").toString().trim();
    const image = (b.image || existing.image || "/emun-team.jpg").toString().trim();
    const type = b.type || existing.type || "conference";
    const status = b.status || existing.status || "completed";
    const delegates = b.delegates ? String(b.delegates).trim() : null;
    const committees = b.committees ? Number(b.committees) : null;
    const days = b.days ? Number(b.days) : null;
    const sortOrder = b.sort_order !== undefined ? Number(b.sort_order) : Number(existing.sort_order ?? 0);
    const isActive = b.is_active !== undefined ? Number(b.is_active) : Number(existing.is_active ?? 1);

    db.prepare(
      `UPDATE events SET year=?,title=?,short_title=?,theme=?,date_label=?,description=?,image=?,type=?,status=?,
       delegates=?,committees=?,days=?,sort_order=?,is_active=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`
    ).run(
      year,
      title,
      shortTitle,
      theme,
      dateLabel,
      description,
      image,
      type,
      status,
      delegates,
      committees,
      days,
      sortOrder,
      isActive,
      id
    );
    revalidatePath("/", "layout");
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PUT /api/admin/events/[id] error:", err);
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await guard();
  if (g) return g;
  try {
    const { id } = await params;
    getDb().prepare("DELETE FROM events WHERE id=?").run(id);
    revalidatePath("/", "layout");
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/admin/events/[id] error:", err);
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}
