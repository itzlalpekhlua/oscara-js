// Creates the gitignored .env a fresh clone needs to boot in development.
// `.env` holds ADMIN_SESSION_SECRET, which must never be committed, so a new
// checkout has no env file at all and every Prisma query fails with
// "Environment variable not found: DATABASE_URL". This fills in dev defaults
// once; it never overwrites an existing file, and production still supplies
// its own values through the host's environment.
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, appendFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const envPath = resolve(dirname(fileURLToPath(import.meta.url)), "..", ".env");

const defaults = {
  DATABASE_URL: '"file:./dev.db"',
  ADMIN_SESSION_SECRET: `"${randomBytes(32).toString("hex")}"`,
  // SITE_URL is deliberately NOT defaulted here. Next.js resolves canonical and
  // Open Graph URLs while prerendering, so a dev value in .env would be baked
  // into the production HTML of any build run from a dev checkout. Unset means
  // the live domain from backend/lib/site.ts, which is right for every build.
};

if (!existsSync(envPath)) {
  writeFileSync(
    envPath,
    Object.entries(defaults)
      .map(([key, value]) => `${key}=${value}`)
      .join("\n") + "\n"
  );
  console.log("[env] created .env with development defaults");
} else {
  const existing = readFileSync(envPath, "utf8");
  const missing = Object.entries(defaults).filter(
    ([key]) => !new RegExp(`^\\s*${key}\\s*=`, "m").test(existing)
  );

  if (missing.length > 0) {
    appendFileSync(
      envPath,
      (existing.endsWith("\n") ? "" : "\n") +
        missing.map(([key, value]) => `${key}=${value}`).join("\n") +
        "\n"
    );
    console.log(`[env] added missing keys to .env: ${missing.map(([key]) => key).join(", ")}`);
  }
}
