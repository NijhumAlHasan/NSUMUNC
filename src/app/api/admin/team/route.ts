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
    const rows = getDb().prepare("SELECT * FROM team_members ORDER BY sort_order ASC, id ASC").all();
    return NextResponse.json({ team: rows });
  } catch (err) {
    console.error("GET /api/admin/team error:", err);
    return NextResponse.json({ error: "Failed to load team members" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const g = await guard();
  if (g) return g;
  try {
    const {
      role,
      name = "TBA",
      initial,
      description = "",
      image = null,
      body_type = "executive",
      wing = "",
    } = await req.json();
    if (!role?.trim()) {
      return NextResponse.json({ error: "Role is required" }, { status: 400 });
    }
    const cleanName = (name || "TBA").trim();
    const cleanBodyType = body_type === "sub_eb" ? "sub_eb" : "executive";
    const cleanWing = (wing || "").trim();
    const computedInitial = (
      initial?.trim() ||
      (cleanName !== "TBA" ? cleanName.charAt(0) : role.trim().charAt(0)) ||
      "M"
    )
      .charAt(0)
      .toUpperCase();

    const db = getDb();
    const maxOrder =
      (db.prepare("SELECT MAX(sort_order) as m FROM team_members").get() as { m: number | null }).m ?? 0;
    const r = db
      .prepare(
        "INSERT INTO team_members (role, name, initial, description, image, body_type, wing, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
      )
      .run(
        role.trim(),
        cleanName,
        computedInitial,
        description.trim(),
        image?.trim() || null,
        cleanBodyType,
        cleanWing,
        maxOrder + 1
      );
    revalidatePath("/", "layout");
    return NextResponse.json({ id: r.lastInsertRowid, success: true }, { status: 201 });
  } catch (err) {
    console.error("POST /api/admin/team error:", err);
    return NextResponse.json({ error: "Failed to add team member" }, { status: 500 });
  }
}
