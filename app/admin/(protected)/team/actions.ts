"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { deleteUploadedFile } from "@/lib/uploads";

async function requireUser() {
  const user = await getSessionUser();
  if (!user) throw new Error("Unauthorized");
}

function refresh() {
  revalidatePath("/admin/team");
  revalidatePath("/team");
}

export async function createTeamMember(formData: FormData) {
  await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Name is required");

  const count = await prisma.teamMember.count();
  if (count >= 2) throw new Error("Only two team profiles are allowed — Chairman and Managing Director. Delete one first.");

  const maxOrder = await prisma.teamMember.aggregate({ _max: { order: true } });

  await prisma.teamMember.create({
    data: {
      name,
      role: String(formData.get("role") ?? "").trim(),
      description: (formData.get("description") as string) || null,
      image: (formData.get("image") as string) || null,
      order: (maxOrder._max.order ?? -1) + 1,
    },
  });

  refresh();
}

export async function updateTeamMember(id: string, formData: FormData) {
  await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Name is required");

  await prisma.teamMember.update({
    where: { id },
    data: {
      name,
      role: String(formData.get("role") ?? "").trim(),
      description: (formData.get("description") as string) || null,
      image: (formData.get("image") as string) || null,
    },
  });

  refresh();
}

export async function deleteTeamMember(id: string) {
  await requireUser();
  const member = await prisma.teamMember.delete({ where: { id } });
  if (member.image) await deleteUploadedFile(member.image);
  refresh();
}

export async function toggleTeamMemberPublished(id: string, published: boolean) {
  await requireUser();
  await prisma.teamMember.update({ where: { id }, data: { published } });
  refresh();
}

export async function reorderTeamMember(id: string, direction: "up" | "down") {
  await requireUser();
  const members = await prisma.teamMember.findMany({ orderBy: { order: "asc" } });
  const index = members.findIndex((m) => m.id === id);
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapIndex < 0 || swapIndex >= members.length) return;

  const a = members[index];
  const b = members[swapIndex];
  await prisma.$transaction([
    prisma.teamMember.update({ where: { id: a.id }, data: { order: b.order } }),
    prisma.teamMember.update({ where: { id: b.id }, data: { order: a.order } }),
  ]);

  refresh();
}
