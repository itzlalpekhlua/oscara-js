// Creates the gitignored .env a fresh clone needs to boot in development.
//
// Two things belong in .env for local work:
//   1. ADMIN_SESSION_SECRET — a secret that must never be committed, so a new
//      checkout has none and admin login/session signing fails without it.
//   2. The Neon Postgres connection strings — the Prisma CLI (`db push`,
//      `db seed`) only reads .env, not Next.js' .env.development.local, so it
//      needs DATABASE_URL / DATABASE_URL_UNPOOLED present here too.
//
// This fills in dev defaults once; it never overwrites values already in .env,
// and production supplies all of these through the host's own environment.
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, appendFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const envPath = resolve(dirname(fileURLToPath(import.meta.url)), "..", ".env");

// The v0/Vercel sandbox exposes the project's real env (including the Neon
// integration variables) in this file. Copy the database URLs from it so local
// Prisma CLI commands talk to the same Neon database the app uses at runtime.
const sandboxEnvPath = "/vercel/share/.env.project";
function readSandboxValue(key) {
  if (!existsSync(sandboxEnvPath)) return null;
  const line = readFileSync(sandboxEnvPath, "utf8")
    .split("\n")
    .find((l) => new RegExp(`^${key}=`).test(l));
  if (!line) return null;
  const raw = line.slice(line.indexOf("=") + 1).trim();
  // Strip surrounding quotes if present; re-quote uniformly below.
  return raw.replace(/^['"]|['"]$/g, "");
}

const dbUrl = readSandboxValue("DATABASE_URL");
const dbUrlUnpooled =
  readSandboxValue("DATABASE_URL_UNPOOLED") || readSandboxValue("POSTGRES_URL_NON_POOLING");

const defaults = {
  ADMIN_SESSION_SECRET: `"${randomBytes(32).toString("hex")}"`,
  ...(dbUrl ? { DATABASE_URL: `"${dbUrl}"` } : {}),
  ...(dbUrlUnpooled ? { DATABASE_URL_UNPOOLED: `"${dbUrlUnpooled}"` } : {}),
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
