import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = path.extname(file.name).toLowerCase() || ".jpg";
    const allowed = [".jpg", ".jpeg", ".png", ".webp", ".svg", ".gif", ".avif"];
    if (!allowed.includes(ext)) {
      return NextResponse.json({ error: "Unsupported image format" }, { status: 400 });
    }

    if (process.env.VERCEL) {
      const mime = file.type || "image/jpeg";
      const base64Url = `data:${mime};base64,${buffer.toString("base64")}`;
      return NextResponse.json({ url: base64Url, success: true }, { status: 201 });
    }

    const baseName = path
      .basename(file.name, path.extname(file.name))
      .replace(/[^a-zA-Z0-9_-]/g, "-")
      .slice(0, 40);
    const filename = `${Date.now()}-${baseName || "image"}${ext}`;

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, filename);
    fs.writeFileSync(filePath, buffer);

    return NextResponse.json({ url: `/uploads/${filename}`, success: true }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
