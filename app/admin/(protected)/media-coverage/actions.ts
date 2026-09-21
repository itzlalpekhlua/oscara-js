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
  revalidatePath("/admin/media-coverage");
  revalidatePath("/");
}

export async function createMediaFeature(formData: FormData) {
  await requireUser();
  const title = String(formData.get("title") ?? "").trim();
  const outlet = String(formData.get("outlet") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  if (!title) throw new Error("Title is required");
  if (!outlet) throw new Error("Outlet / channel is required");
  if (!url) throw new Error("Link is required");

  const maxOrder = await prisma.mediaFeature.aggregate({ _max: { order: true } });

  await prisma.mediaFeature.create({
    data: {
      title,
      outlet,
      url,
      type: String(formData.get("type") ?? "article"),
      thumbnail: (formData.get("thumbnail") as string) || null,
      order: (maxOrder._max.order ?? -1) + 1,
    },
  });

  refresh();
}

export async function updateMediaFeature(id: string, formData: FormData) {
  await requireUser();
  const title = String(formData.get("title") ?? "").trim();
  const outlet = String(formData.get("outlet") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  if (!title) throw new Error("Title is required");
  if (!outlet) throw new Error("Outlet / channel is required");
  if (!url) throw new Error("Link is required");

  await prisma.mediaFeature.update({
    where: { id },
    data: {
      title,
      outlet,
      url,
      type: String(formData.get("type") ?? "article"),
      thumbnail: (formData.get("thumbnail") as string) || null,
    },
  });

  refresh();
}

export async function deleteMediaFeature(id: string) {
  await requireUser();
  const feature = await prisma.mediaFeature.delete({ where: { id } });
  if (feature.thumbnail) await deleteUploadedFile(feature.thumbnail);
  refresh();
}

export async function toggleMediaFeaturePublished(id: string, published: boolean) {
  await requireUser();
  await prisma.mediaFeature.update({ where: { id }, data: { published } });
  refresh();
}

export async function reorderMediaFeature(id: string, direction: "up" | "down") {
  await requireUser();
  const rows = await prisma.mediaFeature.findMany({ orderBy: { order: "asc" } });
  const index = rows.findIndex((r) => r.id === id);
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapIndex < 0 || swapIndex >= rows.length) return;

  const a = rows[index];
  const b = rows[swapIndex];
  await prisma.$transaction([
    prisma.mediaFeature.update({ where: { id: a.id }, data: { order: b.order } }),
    prisma.mediaFeature.update({ where: { id: b.id }, data: { order: a.order } }),
  ]);

  refresh();
}
