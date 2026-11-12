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
  const rows = getDb().prepare("SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 100").all();
  return NextResponse.json({ messages: rows });
}

export async function PUT(req: Request) {
  const g = await guard(); if (g) return g;
  const { id } = await req.json();
  getDb().prepare("UPDATE contact_messages SET is_read=1 WHERE id=?").run(id);
  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  const g = await guard(); if (g) return g;
  const { id } = await req.json();
  getDb().prepare("DELETE FROM contact_messages WHERE id=?").run(id);
  return NextResponse.json({ success: true });
}
