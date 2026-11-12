import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = body;

    if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }
    if (message.length < 10) {
      return NextResponse.json({ error: "Message must be at least 10 characters." }, { status: 400 });
    }

    const db = getDb();
    const result = db
      .prepare("INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)")
      .run(name.trim(), email.trim().toLowerCase(), subject.trim(), message.trim());

    return NextResponse.json({ success: true, id: result.lastInsertRowid }, { status: 201 });
  } catch (error) {
    console.error("POST /api/contact error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function GET() {
  try {
    const db = getDb();
    const messages = db
      .prepare("SELECT id, name, email, subject, created_at FROM contact_messages ORDER BY created_at DESC LIMIT 20")
      .all();
    return NextResponse.json({ messages });
  } catch (error) {
    console.error("GET /api/contact error:", error);
    return NextResponse.json({ messages: [] }, { status: 500 });
  }
}
