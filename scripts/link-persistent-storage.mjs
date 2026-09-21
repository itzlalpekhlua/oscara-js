// Makes public/uploads point at a persistent volume in production, so files
// the admin panel saves survive redeploys/restarts on hosts with ephemeral
// container filesystems (Railway, Render, Fly.io, etc).
//
// No-op locally and on any host where DATA_DIR isn't set — local dev keeps
// writing straight into public/uploads exactly as before.
import { existsSync, lstatSync, mkdirSync, readdirSync, renameSync, rmdirSync, symlinkSync, unlinkSync } from "node:fs";
import path from "node:path";

const dataDir = process.env.DATA_DIR;

if (!dataDir) {
  console.log("[link-persistent-storage] DATA_DIR not set — skipping (local dev behavior unchanged).");
  process.exit(0);
}

const uploadsTarget = path.join(dataDir, "uploads");
const uploadsLink = path.join(process.cwd(), "public", "uploads");

mkdirSync(uploadsTarget, { recursive: true });

if (existsSync(uploadsLink)) {
  const stat = lstatSync(uploadsLink);

  if (stat.isSymbolicLink()) {
    console.log("[link-persistent-storage] public/uploads is already linked — nothing to do.");
    process.exit(0);
  }

  if (stat.isDirectory()) {
    console.log("[link-persistent-storage] Moving existing public/uploads content into the persistent volume...");
    try {
      for (const entry of readdirSync(uploadsLink)) {
        renameSync(path.join(uploadsLink, entry), path.join(uploadsTarget, entry));
      }
      rmdirSync(uploadsLink);
    } catch (err) {
      console.warn(
        `[link-persistent-storage] Could not auto-migrate existing uploads (${err.message}). ` +
          `Move the contents of public/uploads into ${uploadsTarget} manually, then redeploy.`
      );
      process.exit(0);
    }
  } else {
    unlinkSync(uploadsLink);
  }
}

// "junction" is only meaningful on Windows and is ignored elsewhere — safe
// to pass unconditionally so this also works for local Windows testing.
symlinkSync(uploadsTarget, uploadsLink, "junction");
console.log(`[link-persistent-storage] Linked public/uploads -> ${uploadsTarget}`);
