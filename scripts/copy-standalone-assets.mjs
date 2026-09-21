// Next.js's `output: "standalone"` build traces only the JS import graph, so
// it misses two things every standalone deploy needs: the CSS/JS chunks in
// .next/static, and (defensively) the public/ folder. Without the first, the
// deployed site loads with no styling at all. Runs automatically after every
// `next build` via the "postbuild" script — no manual copy step to forget.
import { cpSync, existsSync, rmSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const standaloneDir = path.join(root, ".next", "standalone");

if (!existsSync(standaloneDir)) {
  console.log("[copy-standalone-assets] .next/standalone not found — skipping (output: \"standalone\" not in use).");
  process.exit(0);
}

cpSync(path.join(root, ".next", "static"), path.join(standaloneDir, ".next", "static"), { recursive: true });
cpSync(path.join(root, "public"), path.join(standaloneDir, "public"), { recursive: true });

// Next.js copies the local .env into the standalone output. That file holds the
// development ADMIN_SESSION_SECRET and SQLite path, so shipping it would put a
// dev secret in the deploy artifact and risk overriding the host's real
// configuration. Production supplies its own environment, so drop it.
const leakedEnvFiles = [".env", ".env.local", ".env.development", ".env.development.local"];
const removed = leakedEnvFiles.filter((name) => {
  const target = path.join(standaloneDir, name);
  if (!existsSync(target)) return false;
  rmSync(target);
  return true;
});

console.log("[copy-standalone-assets] Copied .next/static and public/ into .next/standalone/.");
if (removed.length > 0) {
  console.log(`[copy-standalone-assets] Removed development env file(s) from the bundle: ${removed.join(", ")}`);
}
