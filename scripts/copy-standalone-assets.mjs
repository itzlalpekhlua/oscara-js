// Next.js's `output: "standalone"` build traces only the JS import graph, so
// it misses two things every standalone deploy needs: the CSS/JS chunks in
// .next/static, and (defensively) the public/ folder. Without the first, the
// deployed site loads with no styling at all. Runs automatically after every
// `next build` via the "postbuild" script — no manual copy step to forget.
import { cpSync, existsSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const standaloneDir = path.join(root, ".next", "standalone");

if (!existsSync(standaloneDir)) {
  console.log("[copy-standalone-assets] .next/standalone not found — skipping (output: \"standalone\" not in use).");
  process.exit(0);
}

cpSync(path.join(root, ".next", "static"), path.join(standaloneDir, ".next", "static"), { recursive: true });
cpSync(path.join(root, "public"), path.join(standaloneDir, "public"), { recursive: true });

console.log("[copy-standalone-assets] Copied .next/static and public/ into .next/standalone/.");
