import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const tokenRow = db
    .prepare("SELECT value FROM site_settings WHERE key = 'preview_invite_token'")
    .get() as { value: string } | undefined;
  const claimedRow = db
    .prepare("SELECT value FROM site_settings WHERE key = 'preview_claimed_device'")
    .get() as { value: string } | undefined;
  const activeRow = db
    .prepare("SELECT value FROM site_settings WHERE key = 'preview_mode_active'")
    .get() as { value: string } | undefined;

  let token = tokenRow?.value;
  if (!token) {
    token = "nsu-" + Math.random().toString(36).substring(2, 10);
    db.prepare(
      "INSERT OR REPLACE INTO site_settings (key, value, updated_at) VALUES ('preview_invite_token', ?, CURRENT_TIMESTAMP)"
    ).run(token);
  }

  return NextResponse.json({
    token,
    claimed: Boolean(claimedRow?.value && claimedRow.value.trim() !== ""),
    active: activeRow?.value !== "false",
  });
}

export async function POST(req: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { action } = await req.json().catch(() => ({ action: "" }));
  const db = getDb();

  if (action === "reset" || action === "generate") {
    const newToken = "nsu-" + Math.random().toString(36).substring(2, 10);
    db.prepare(
      "INSERT OR REPLACE INTO site_settings (key, value, updated_at) VALUES ('preview_invite_token', ?, CURRENT_TIMESTAMP)"
    ).run(newToken);
    db.prepare(
      "INSERT OR REPLACE INTO site_settings (key, value, updated_at) VALUES ('preview_claimed_device', '', CURRENT_TIMESTAMP)"
    ).run();

    return NextResponse.json({
      success: true,
      token: newToken,
      claimed: false,
    });
  }

  if (action === "toggle") {
    const activeRow = db
      .prepare("SELECT value FROM site_settings WHERE key = 'preview_mode_active'")
      .get() as { value: string } | undefined;
    const nextState = activeRow?.value === "false" ? "true" : "false";
    db.prepare(
      "INSERT OR REPLACE INTO site_settings (key, value, updated_at) VALUES ('preview_mode_active', ?, CURRENT_TIMESTAMP)"
    ).run(nextState);

    return NextResponse.json({ success: true, active: nextState === "true" });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
