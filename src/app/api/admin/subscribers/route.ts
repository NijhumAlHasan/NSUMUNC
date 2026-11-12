import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { getDb } from "@/lib/db";

async function guard() {
  if (!(await isAdminAuthenticated()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return null;
}

export async function GET() {
  const g = await guard(); if (g) return g;
  const rows = getDb().prepare("SELECT * FROM newsletter_subscribers ORDER BY created_at DESC").all();
  return NextResponse.json({ subscribers: rows });
}

export async function DELETE(req: Request) {
  const g = await guard(); if (g) return g;
  const { id } = await req.json();
  getDb().prepare("DELETE FROM newsletter_subscribers WHERE id=?").run(id);
  return NextResponse.json({ success: true });
}
