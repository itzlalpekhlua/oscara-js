import { del } from "@vercel/blob";

/** Best-effort delete of a file previously stored by the upload route. Only acts
 * on Vercel Blob URLs; no-ops on anything else (seeded Unsplash URLs, the
 * hardcoded hero fallback, and legacy local /uploads/ paths from older deploys). */
export async function deleteUploadedFile(url: string | null | undefined): Promise<void> {
  if (!url || !url.startsWith("https://") || !url.includes(".blob.vercel-storage.com/")) {
    return;
  }

  try {
    await del(url);
  } catch {
    // Missing blob or already deleted — nothing to do.
  }
}
