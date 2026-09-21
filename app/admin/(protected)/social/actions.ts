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
  revalidatePath("/admin/social");
  revalidatePath("/social");
}

export async function createSocialPost(formData: FormData) {
  await requireUser();
  const embedUrl = String(formData.get("embedUrl") ?? "").trim();
  if (!embedUrl) throw new Error("Link is required");

  const maxOrder = await prisma.socialPost.aggregate({ _max: { order: true } });

  await prisma.socialPost.create({
    data: {
      platform: String(formData.get("platform") ?? "instagram"),
      embedUrl,
      caption: (formData.get("caption") as string) || null,
      thumbnail: (formData.get("thumbnail") as string) || null,
      order: (maxOrder._max.order ?? -1) + 1,
    },
  });

  refresh();
}

export async function updateSocialPost(id: string, formData: FormData) {
  await requireUser();
  const embedUrl = String(formData.get("embedUrl") ?? "").trim();
  if (!embedUrl) throw new Error("Link is required");

  await prisma.socialPost.update({
    where: { id },
    data: {
      platform: String(formData.get("platform") ?? "instagram"),
      embedUrl,
      caption: (formData.get("caption") as string) || null,
      thumbnail: (formData.get("thumbnail") as string) || null,
    },
  });

  refresh();
}

export async function deleteSocialPost(id: string) {
  await requireUser();
  const post = await prisma.socialPost.delete({ where: { id } });
  if (post.thumbnail) await deleteUploadedFile(post.thumbnail);
  refresh();
}

export async function toggleSocialPostPublished(id: string, published: boolean) {
  await requireUser();
  await prisma.socialPost.update({ where: { id }, data: { published } });
  refresh();
}

export async function reorderSocialPost(id: string, direction: "up" | "down") {
  await requireUser();
  const rows = await prisma.socialPost.findMany({ orderBy: { order: "asc" } });
  const index = rows.findIndex((r) => r.id === id);
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapIndex < 0 || swapIndex >= rows.length) return;

  const a = rows[index];
  const b = rows[swapIndex];
  await prisma.$transaction([
    prisma.socialPost.update({ where: { id: a.id }, data: { order: b.order } }),
    prisma.socialPost.update({ where: { id: b.id }, data: { order: a.order } }),
  ]);

  refresh();
}
