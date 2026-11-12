import { cookies } from "next/headers";
import { getDb } from "./db";

const COOKIE_NAME = "nsumunc_admin";
const SESSION_DURATION = 60 * 60 * 8; // 8 hours

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;

  const expected = generateToken();
  return token === expected;
}

export function generateToken(): string {
  const secret = process.env.ADMIN_SESSION_SECRET || "change-me-in-production";
  return Buffer.from(`nsumunc-admin:${secret}`).toString("base64url");
}

export function getAdminPassword(): string {
  try {
    const db = getDb();
    const row = db
      .prepare("SELECT value FROM site_settings WHERE key = 'admin_password'")
      .get() as { value?: string } | undefined;
    if (row?.value && row.value.trim().length > 0) {
      return row.value.trim();
    }
  } catch {
    // Fallback to environment variable if DB read fails
  }
  return process.env.ADMIN_PASSWORD || "nsumunc2026";
}

export { COOKIE_NAME, SESSION_DURATION };
