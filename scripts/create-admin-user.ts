import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function readArg(name: string): string | undefined {
  const prefix = `--${name}=`;
  const arg = process.argv.find((a) => a.startsWith(prefix));
  return arg ? arg.slice(prefix.length) : undefined;
}

async function main() {
  const email = readArg("email") ?? process.env.ADMIN_EMAIL;
  const password = readArg("password") ?? process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error(
      "Usage: npm run admin:create -- --email=you@example.com --password=your-password\n" +
        "(or set ADMIN_EMAIL / ADMIN_PASSWORD env vars)"
    );
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("Password must be at least 8 characters.");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash, role: "owner" },
  });

  console.log(`Admin user ready for ${email}. You can now log in at /admin/login.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
