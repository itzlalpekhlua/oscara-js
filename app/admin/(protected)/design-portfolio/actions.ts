"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { deleteUploadedFile } from "@/lib/uploads";
import { slugify } from "@/lib/slugify";

async function requireUser() {
  const user = await getSessionUser();
  if (!user) throw new Error("Unauthorized");
}

function refresh(kind?: string, scope?: string, slug?: string) {
  revalidatePath("/admin/design-portfolio");
  revalidatePath("/design");
  if (kind) revalidatePath(`/design/${kind}`);
  if (kind && scope) revalidatePath(`/design/${kind}/${scope}`);
  if (kind && scope && slug) revalidatePath(`/design/${kind}/${scope}/${slug}`);
}

export async function createDesignWork(formData: FormData) {
  await requireUser();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("Title is required");

  const kind = String(formData.get("kind") ?? "interior");
  const scope = String(formData.get("scope") ?? "residential");
  // Scoped per section (not a global counter) so new items always land at the end
  // of their own section. Uses max(order)+1, not count, so a new item never
  // collides with an existing order value after something has been deleted.
  const maxOrder = await prisma.designWork.aggregate({ where: { kind, scope }, _max: { order: true } });

  const work = await prisma.designWork.create({
    data: {
      title,
      slug: slugify(title),
      kind,
      scope,
      roomType: (formData.get("roomType") as string) || null,
      description: (formData.get("description") as string) || null,
      featuredImage: (formData.get("featuredImage") as string) || null,
      order: (maxOrder._max.order ?? -1) + 1,
    },
  });

  refresh(work.kind, work.scope, work.slug);
  redirect(`/admin/design-portfolio/${work.id}`);
}

export async function updateDesignWork(id: string, formData: FormData) {
  await requireUser();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("Title is required");

  const work = await prisma.designWork.update({
    where: { id },
    data: {
      title,
      slug: slugify(title),
      kind: String(formData.get("kind") ?? "interior"),
      scope: String(formData.get("scope") ?? "residential"),
      roomType: (formData.get("roomType") as string) || null,
      description: (formData.get("description") as string) || null,
      featuredImage: (formData.get("featuredImage") as string) || null,
    },
  });

  refresh(work.kind, work.scope, work.slug);
}

export async function deleteDesignWork(id: string) {
  await requireUser();
  const images = await prisma.designWorkImage.findMany({ where: { designWorkId: id } });
  const work = await prisma.designWork.delete({ where: { id } });
  if (work.featuredImage) await deleteUploadedFile(work.featuredImage);
  for (const image of images) await deleteUploadedFile(image.url);
  refresh(work.kind, work.scope, work.slug);
}

export async function toggleDesignWorkPublished(id: string, published: boolean) {
  await requireUser();
  const work = await prisma.designWork.update({ where: { id }, data: { published } });
  refresh(work.kind, work.scope, work.slug);
}

export async function reorderDesignWork(id: string, direction: "up" | "down") {
  await requireUser();
  const target = await prisma.designWork.findUnique({ where: { id } });
  if (!target) return;

  // Scoped to the same kind+scope group, matching the four sections shown in the
  // admin list (and the four sections shown on the public /design pages) — so
  // moving an item up/down only ever reorders it within its own section.
  const rows = await prisma.designWork.findMany({
    where: { kind: target.kind, scope: target.scope },
    orderBy: { order: "asc" },
  });
  const index = rows.findIndex((r) => r.id === id);
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapIndex < 0 || swapIndex >= rows.length) return;

  const a = rows[index];
  const b = rows[swapIndex];
  await prisma.$transaction([
    prisma.designWork.update({ where: { id: a.id }, data: { order: b.order } }),
    prisma.designWork.update({ where: { id: b.id }, data: { order: a.order } }),
  ]);

  refresh(target.kind, target.scope);
}

export async function addDesignWorkImage(designWorkId: string, url: string) {
  await requireUser();
  const maxOrder = await prisma.designWorkImage.aggregate({ where: { designWorkId }, _max: { order: true } });
  await prisma.designWorkImage.create({ data: { designWorkId, url, order: (maxOrder._max.order ?? -1) + 1 } });

  const work = await prisma.designWork.findUnique({ where: { id: designWorkId } });
  revalidatePath(`/admin/design-portfolio/${designWorkId}`);
  if (work) refresh(work.kind, work.scope, work.slug);
}

export async function deleteDesignWorkImage(imageId: string) {
  await requireUser();
  const image = await prisma.designWorkImage.delete({ where: { id: imageId } });
  await deleteUploadedFile(image.url);

  const work = await prisma.designWork.findUnique({ where: { id: image.designWorkId } });
  revalidatePath(`/admin/design-portfolio/${image.designWorkId}`);
  if (work) refresh(work.kind, work.scope, work.slug);
}

export async function reorderDesignWorkImage(imageId: string, direction: "up" | "down") {
  await requireUser();
  const image = await prisma.designWorkImage.findUnique({ where: { id: imageId } });
  if (!image) return;

  const siblings = await prisma.designWorkImage.findMany({ where: { designWorkId: image.designWorkId }, orderBy: { order: "asc" } });
  const index = siblings.findIndex((s) => s.id === imageId);
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapIndex < 0 || swapIndex >= siblings.length) return;

  const a = siblings[index];
  const b = siblings[swapIndex];
  await prisma.$transaction([
    prisma.designWorkImage.update({ where: { id: a.id }, data: { order: b.order } }),
    prisma.designWorkImage.update({ where: { id: b.id }, data: { order: a.order } }),
  ]);

  revalidatePath(`/admin/design-portfolio/${image.designWorkId}`);
}

export async function setDesignWorkFeaturedImage(designWorkId: string, url: string) {
  await requireUser();
  const work = await prisma.designWork.update({ where: { id: designWorkId }, data: { featuredImage: url } });
  revalidatePath(`/admin/design-portfolio/${designWorkId}`);
  refresh(work.kind, work.scope, work.slug);
}
