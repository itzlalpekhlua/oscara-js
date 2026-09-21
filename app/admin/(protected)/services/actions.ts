"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { deleteUploadedFile } from "@/lib/uploads";
import { slugify } from "@/lib/slugify";

async function requireUser() {
  const user = await getSessionUser();
  if (!user) throw new Error("Unauthorized");
}

function refresh() {
  revalidatePath("/admin/services");
  revalidatePath("/services");
  revalidatePath("/");
}

export async function createService(formData: FormData) {
  await requireUser();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("Title is required");

  const parentId = (formData.get("parentId") as string) || null;
  const maxOrder = await prisma.service.aggregate({ where: { parentId }, _max: { order: true } });

  await prisma.service.create({
    data: {
      title,
      slug: slugify(title),
      description: (formData.get("description") as string) || null,
      image: (formData.get("image") as string) || null,
      mediaType: (formData.get("mediaType") as string) || "image",
      parentId,
      order: (maxOrder._max.order ?? -1) + 1,
    },
  });

  refresh();
}

export async function updateService(id: string, formData: FormData) {
  await requireUser();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("Title is required");

  await prisma.service.update({
    where: { id },
    data: {
      title,
      slug: slugify(title),
      description: (formData.get("description") as string) || null,
      image: (formData.get("image") as string) || null,
      mediaType: (formData.get("mediaType") as string) || "image",
    },
  });

  refresh();
}

export async function deleteService(id: string) {
  await requireUser();
  const children = await prisma.service.findMany({ where: { parentId: id } });
  const service = await prisma.service.delete({ where: { id } });
  if (service.image) await deleteUploadedFile(service.image);
  for (const child of children) {
    if (child.image) await deleteUploadedFile(child.image);
  }
  refresh();
}

export async function toggleServicePublished(id: string, published: boolean) {
  await requireUser();
  await prisma.service.update({ where: { id }, data: { published } });
  refresh();
}

export async function reorderService(id: string, direction: "up" | "down") {
  await requireUser();
  const current = await prisma.service.findUnique({ where: { id } });
  if (!current) return;

  const siblings = await prisma.service.findMany({ where: { parentId: current.parentId }, orderBy: { order: "asc" } });
  const index = siblings.findIndex((s) => s.id === id);
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapIndex < 0 || swapIndex >= siblings.length) return;

  const a = siblings[index];
  const b = siblings[swapIndex];
  await prisma.$transaction([
    prisma.service.update({ where: { id: a.id }, data: { order: b.order } }),
    prisma.service.update({ where: { id: b.id }, data: { order: a.order } }),
  ]);

  refresh();
}
