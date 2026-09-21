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

function refresh(slug?: string) {
  revalidatePath("/admin/projects");
  revalidatePath("/projects");
  revalidatePath("/");
  if (slug) revalidatePath(`/projects/${slug}`);
}

export async function createProject(formData: FormData) {
  await requireUser();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("Title is required");

  const maxOrder = await prisma.project.aggregate({ _max: { order: true } });

  const project = await prisma.project.create({
    data: {
      title,
      slug: slugify(title),
      category: (formData.get("category") as string) || null,
      location: (formData.get("location") as string) || null,
      description: (formData.get("description") as string) || null,
      featuredImage: (formData.get("featuredImage") as string) || null,
      order: (maxOrder._max.order ?? -1) + 1,
    },
  });

  refresh(project.slug);
  redirect(`/admin/projects/${project.id}`);
}

export async function updateProject(id: string, formData: FormData) {
  await requireUser();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("Title is required");

  const project = await prisma.project.update({
    where: { id },
    data: {
      title,
      slug: slugify(title),
      category: (formData.get("category") as string) || null,
      location: (formData.get("location") as string) || null,
      description: (formData.get("description") as string) || null,
      featuredImage: (formData.get("featuredImage") as string) || null,
    },
  });

  refresh(project.slug);
}

export async function deleteProject(id: string) {
  await requireUser();
  const images = await prisma.projectGalleryImage.findMany({ where: { projectId: id } });
  const project = await prisma.project.delete({ where: { id } });
  if (project.featuredImage) await deleteUploadedFile(project.featuredImage);
  for (const image of images) await deleteUploadedFile(image.url);
  refresh(project.slug);
}

export async function toggleProjectPublished(id: string, published: boolean) {
  await requireUser();
  const project = await prisma.project.update({ where: { id }, data: { published } });
  refresh(project.slug);
}

export async function reorderProject(id: string, direction: "up" | "down") {
  await requireUser();
  const rows = await prisma.project.findMany({ orderBy: { order: "asc" } });
  const index = rows.findIndex((r) => r.id === id);
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapIndex < 0 || swapIndex >= rows.length) return;

  const a = rows[index];
  const b = rows[swapIndex];
  await prisma.$transaction([
    prisma.project.update({ where: { id: a.id }, data: { order: b.order } }),
    prisma.project.update({ where: { id: b.id }, data: { order: a.order } }),
  ]);

  refresh();
}

export async function addProjectGalleryImage(projectId: string, url: string, mediaType: "image" | "video") {
  await requireUser();
  const maxOrder = await prisma.projectGalleryImage.aggregate({ where: { projectId }, _max: { order: true } });
  await prisma.projectGalleryImage.create({ data: { projectId, url, mediaType, order: (maxOrder._max.order ?? -1) + 1 } });

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  revalidatePath(`/admin/projects/${projectId}`);
  if (project) refresh(project.slug);
}

export async function deleteProjectGalleryImage(imageId: string) {
  await requireUser();
  const image = await prisma.projectGalleryImage.delete({ where: { id: imageId } });
  await deleteUploadedFile(image.url);

  const project = await prisma.project.findUnique({ where: { id: image.projectId } });
  revalidatePath(`/admin/projects/${image.projectId}`);
  if (project) refresh(project.slug);
}

export async function reorderProjectGalleryImage(imageId: string, direction: "up" | "down") {
  await requireUser();
  const image = await prisma.projectGalleryImage.findUnique({ where: { id: imageId } });
  if (!image) return;

  const siblings = await prisma.projectGalleryImage.findMany({ where: { projectId: image.projectId }, orderBy: { order: "asc" } });
  const index = siblings.findIndex((s) => s.id === imageId);
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapIndex < 0 || swapIndex >= siblings.length) return;

  const a = siblings[index];
  const b = siblings[swapIndex];
  await prisma.$transaction([
    prisma.projectGalleryImage.update({ where: { id: a.id }, data: { order: b.order } }),
    prisma.projectGalleryImage.update({ where: { id: b.id }, data: { order: a.order } }),
  ]);

  revalidatePath(`/admin/projects/${image.projectId}`);
}

export async function setProjectFeaturedImage(projectId: string, url: string) {
  await requireUser();
  const project = await prisma.project.update({ where: { id: projectId }, data: { featuredImage: url } });
  revalidatePath(`/admin/projects/${projectId}`);
  refresh(project.slug);
}
