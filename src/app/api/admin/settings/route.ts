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
    const rows = getDb().prepare("SELECT * FROM site_settings").all();
    const settings: Record<string, string> = {};
    (rows as { key: string; value: string }[]).forEach((r) => {
      if (r.key !== "admin_password") {
        settings[r.key] = r.value;
      }
    });
    return NextResponse.json({ settings });
  } catch (err) {
    console.error("GET /api/admin/settings error:", err);
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const g = await guard();
  if (g) return g;
  try {
    const { updates } = (await req.json()) as { updates: Record<string, string> };
    if (!updates || typeof updates !== "object") {
      return NextResponse.json({ error: "Invalid updates payload" }, { status: 400 });
    }
    const db = getDb();
    const stmt = db.prepare(
      "INSERT INTO site_settings (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=CURRENT_TIMESTAMP"
    );
    const tx = db.transaction((entries: [string, string][]) => {
      for (const [key, value] of entries) {
        if (key === "admin_password" && (!value || !String(value).trim())) {
          continue;
        }
        stmt.run(key, String(value ?? ""));
      }
    });
    tx(Object.entries(updates));
    revalidatePath("/", "layout");
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST /api/admin/settings error:", err);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
