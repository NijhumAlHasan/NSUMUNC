import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

function isValidEmail(e: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email?.trim() || !isValidEmail(email)) {
      return NextResponse.json({ error: "Valid email required." }, { status: 400 });
    }
    const db = getDb();
    try {
      db.prepare("INSERT INTO newsletter_subscribers (email) VALUES (?)").run(email.trim().toLowerCase());
    } catch {
      // UNIQUE constraint — already subscribed
      return NextResponse.json({ message: "You're already subscribed!" }, { status: 200 });
    }
    return NextResponse.json({ success: true, message: "Subscribed successfully!" }, { status: 201 });
  } catch (error) {
    console.error("POST /api/newsletter error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
