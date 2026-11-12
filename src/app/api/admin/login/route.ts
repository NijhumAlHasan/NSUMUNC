import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { generateToken, getAdminPassword, COOKIE_NAME, SESSION_DURATION } from "@/lib/auth";

interface RateLimitEntry {
  count: number;
  lockedUntil: number;
  firstAttempt: number;
}

const attemptsMap = new Map<string, RateLimitEntry>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes lockout

function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "127.0.0.1";
}

function cleanupOldEntries(now: number) {
  if (attemptsMap.size > 1000) {
    for (const [ip, entry] of attemptsMap.entries()) {
      if (now > entry.lockedUntil && now - entry.firstAttempt > LOCKOUT_MS) {
        attemptsMap.delete(ip);
      }
    }
  }
}

export async function POST(req: Request) {
  try {
    const clientIp = getClientIp(req);
    const now = Date.now();
    cleanupOldEntries(now);

    const record = attemptsMap.get(clientIp);

    // Check if client is locked out
    if (record && record.lockedUntil > now) {
      const remainingMin = Math.max(1, Math.ceil((record.lockedUntil - now) / 60000));
      return NextResponse.json(
        { error: `Too many failed attempts. Locked out for ${remainingMin} more minute${remainingMin > 1 ? "s" : ""}.` },
        { status: 429 }
      );
    }

    const { password } = await req.json();
    if (!password) {
      return NextResponse.json({ error: "Password required." }, { status: 400 });
    }

    const correctPassword = getAdminPassword();

    if (password !== correctPassword) {
      const count = (record && now - record.firstAttempt < LOCKOUT_MS) ? record.count + 1 : 1;
      const firstAttempt = (record && now - record.firstAttempt < LOCKOUT_MS) ? record.firstAttempt : now;
      const lockedUntil = count >= MAX_ATTEMPTS ? now + LOCKOUT_MS : 0;

      attemptsMap.set(clientIp, { count, lockedUntil, firstAttempt });

      if (lockedUntil > 0) {
        return NextResponse.json(
          { error: "Too many failed attempts. Locked out for 15 minutes." },
          { status: 429 }
        );
      }

      const remainingAttempts = MAX_ATTEMPTS - count;
      return NextResponse.json(
        { error: `Incorrect password. ${remainingAttempts} attempt${remainingAttempts === 1 ? "" : "s"} remaining.` },
        { status: 401 }
      );
    }

    // Success — clear any recorded failed attempts
    attemptsMap.delete(clientIp);

    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, generateToken(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_DURATION,
      path: "/",
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
