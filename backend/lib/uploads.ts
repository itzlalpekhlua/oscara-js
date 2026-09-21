import { unlink } from "node:fs/promises";
import path from "node:path";

const UPLOADS_PREFIX = "/uploads/";

/** Best-effort delete of a file previously written by the upload route. No-ops on
 * anything not under /uploads/ (seeded Unsplash URLs, the hardcoded hero fallback, etc). */
export async function deleteUploadedFile(url: string | null | undefined): Promise<void> {
  if (!url || !url.startsWith(UPLOADS_PREFIX)) return;

  const relative = url.replace(/^\//, "");
  const resolved = path.join(process.cwd(), "public", relative);

  try {
    await unlink(resolved);
  } catch {
    // Missing file or already deleted — nothing to do.
  }
}
