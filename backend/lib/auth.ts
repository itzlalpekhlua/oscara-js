import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { sessionCookie, verifySession } from "@/lib/session";

export async function getSessionUser() {
  const store = await cookies();
  const token = store.get(sessionCookie.name)?.value;
  const payload = await verifySession(token);
  if (!payload) return null;

  const user = await prisma.adminUser.findUnique({ where: { id: payload.uid } });
  if (!user) return null;
  return user;
}
