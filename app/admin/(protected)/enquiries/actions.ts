"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

async function requireUser() {
  const user = await getSessionUser();
  if (!user) throw new Error("Unauthorized");
}

function refresh() {
  revalidatePath("/admin/enquiries");
}

export async function markEnquiryStatus(id: string, status: "new" | "read" | "handled") {
  await requireUser();
  await prisma.enquiry.update({ where: { id }, data: { status } });
  refresh();
}

export async function deleteEnquiry(id: string) {
  await requireUser();
  await prisma.enquiry.delete({ where: { id } });
  refresh();
}
