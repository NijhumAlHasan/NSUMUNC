import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const db = getDb();
  const tokenRow = db
    .prepare("SELECT value FROM site_settings WHERE key = 'preview_invite_token'")
    .get() as { value: string } | undefined;
  const claimedRow = db
    .prepare("SELECT value FROM site_settings WHERE key = 'preview_claimed_device'")
    .get() as { value: string } | undefined;

  const activeToken = tokenRow?.value;
  const claimedDevice = claimedRow?.value;

  // Read current cookie from request
  const cookieHeader = req.headers.get("cookie") || "";
  const existingCookieMatch = cookieHeader.match(/nsumunc_preview_device=([^;]+)/);
  const existingDeviceId = existingCookieMatch ? existingCookieMatch[1] : null;

  if (!activeToken || token !== activeToken) {
    return new NextResponse(
      `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Invalid Invite</title><meta name="viewport" content="width=device-width, initial-scale=1"/><style>body{background:#03060f;color:#fff;font-family:system-ui;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center}.card{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.15);padding:2.5rem;border-radius:1.5rem;max-width:24rem}h1{font-size:1.5rem;margin:1rem 0 .5rem}p{color:rgba(255,255,255,0.6);font-size:.9rem}a{color:#0ea5e9;font-size:.8rem;text-decoration:none}</style></head><body><div class="card"><div style="font-size:2.5rem">⛔</div><h1>Invalid Invite Link</h1><p>This invite link is invalid or has expired.</p><a href="/admin/login">Site Owner? Sign in to Admin →</a></div></body></html>`,
      { headers: { "content-type": "text/html; charset=utf-8" }, status: 403 }
    );
  }

  // Already claimed by this exact device
  if (claimedDevice && existingDeviceId === claimedDevice) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Already claimed by a different device!
  if (claimedDevice && claimedDevice.trim() !== "") {
    return new NextResponse(
      `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Invite Already Claimed</title><meta name="viewport" content="width=device-width, initial-scale=1"/><style>body{background:#03060f;color:#fff;font-family:system-ui;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center}.card{background:rgba(255,255,255,0.05);border:1px solid rgba(239,68,68,0.3);padding:2.5rem;border-radius:1.5rem;max-width:24rem}h1{font-size:1.5rem;margin:1rem 0 .5rem;color:#f87171}p{color:rgba(255,255,255,0.7);font-size:.9rem;line-height:1.5}.hint{color:rgba(255,255,255,0.4);font-size:.75rem;margin-top:1rem}</style></head><body><div class="card"><div style="font-size:2.5rem">🔒</div><h1>Invite Already Claimed</h1><p>This single-use invite link has already been opened and locked to another device.</p><div class="hint">For security, forwarding or reusing this invite link is blocked. Only 1 device may access this preview.</div></div></body></html>`,
      { headers: { "content-type": "text/html; charset=utf-8" }, status: 403 }
    );
  }

  // First time opening: Claim and bind to this device!
  const newDeviceId = "dev-" + Math.random().toString(36).substring(2, 15) + "-" + Date.now();
  db.prepare(
    "INSERT OR REPLACE INTO site_settings (key, value, updated_at) VALUES ('preview_claimed_device', ?, CURRENT_TIMESTAMP)"
  ).run(newDeviceId);

  const res = NextResponse.redirect(new URL("/", req.url));
  res.cookies.set("nsumunc_preview_device", newDeviceId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return res;
}
