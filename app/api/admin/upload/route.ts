import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getSessionUser } from "@/lib/auth";
import { slugify } from "@/lib/slugify";

const ALLOWED_SECTIONS = [
  "hero",
  "categories",
  "designs",
  "design-portfolio",
  "construction-projects",
  "projects",
  "media-coverage",
  "services",
  "team",
  "testimonials",
  "social",
] as const;

const MAX_SIZE_BYTES = 200 * 1024 * 1024; // 200MB

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
  "image/svg+xml": "svg",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  const section = formData?.get("section");

  if (!(file instanceof File) || typeof section !== "string") {
    return NextResponse.json({ error: "Missing file or section" }, { status: 400 });
  }

  if (!ALLOWED_SECTIONS.includes(section as (typeof ALLOWED_SECTIONS)[number])) {
    return NextResponse.json({ error: "Invalid section" }, { status: 400 });
  }

  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");
  if (!isImage && !isVideo) {
    return NextResponse.json({ error: "File must be an image or video" }, { status: 400 });
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "File is too large (max 200MB)" }, { status: 413 });
  }

  const ext = EXT_BY_MIME[file.type];
  if (!ext) {
    return NextResponse.json({ error: `Unsupported file type: ${file.type}` }, { status: 400 });
  }

  const baseName = slugify(file.name.replace(/\.[^.]+$/, "")) || "file";
  const pathname = `uploads/${section}/${baseName}-${crypto.randomUUID()}.${ext}`;

  // Persist to Vercel Blob so uploads survive on serverless/ephemeral hosts
  // (Vercel's filesystem is read-only at runtime). The store is public, so the
  // returned URL is directly usable in <img>/next/image.
  const blob = await put(pathname, file, {
    access: "public",
    contentType: file.type,
  });

  return NextResponse.json({
    url: blob.url,
    mediaType: isVideo ? "video" : "image",
  });
}
