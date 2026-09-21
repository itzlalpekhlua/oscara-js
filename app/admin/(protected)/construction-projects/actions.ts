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
  revalidatePath("/admin/construction-projects");
  revalidatePath("/construction-projects");
  if (slug) revalidatePath(`/construction-projects/${slug}`);
}

export async function createConstructionProject(formData: FormData) {
  await requireUser();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("Title is required");

  const maxOrder = await prisma.constructionProject.aggregate({ _max: { order: true } });

  const project = await prisma.constructionProject.create({
    data: {
      title,
      slug: slugify(title),
      categoryLabel: (formData.get("categoryLabel") as string) || null,
      location: (formData.get("location") as string) || null,
      featuredImage: (formData.get("featuredImage") as string) || null,
      order: (maxOrder._max.order ?? -1) + 1,
    },
  });

  refresh(project.slug);
  redirect(`/admin/construction-projects/${project.id}`);
}

export async function updateConstructionProject(id: string, formData: FormData) {
  await requireUser();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("Title is required");

  const project = await prisma.constructionProject.update({
    where: { id },
    data: {
      title,
      slug: slugify(title),
      categoryLabel: (formData.get("categoryLabel") as string) || null,
      location: (formData.get("location") as string) || null,
      featuredImage: (formData.get("featuredImage") as string) || null,
    },
  });

  refresh(project.slug);
}

export async function deleteConstructionProject(id: string) {
  await requireUser();
  const images = await prisma.projectImage.findMany({ where: { projectId: id } });
  const project = await prisma.constructionProject.delete({ where: { id } });
  if (project.featuredImage) await deleteUploadedFile(project.featuredImage);
  for (const image of images) await deleteUploadedFile(image.url);
  refresh(project.slug);
}

export async function toggleConstructionProjectPublished(id: string, published: boolean) {
  await requireUser();
  const project = await prisma.constructionProject.update({ where: { id }, data: { published } });
  refresh(project.slug);
}

export async function reorderConstructionProject(id: string, direction: "up" | "down") {
  await requireUser();
  const rows = await prisma.constructionProject.findMany({ orderBy: { order: "asc" } });
  const index = rows.findIndex((r) => r.id === id);
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapIndex < 0 || swapIndex >= rows.length) return;

  const a = rows[index];
  const b = rows[swapIndex];
  await prisma.$transaction([
    prisma.constructionProject.update({ where: { id: a.id }, data: { order: b.order } }),
    prisma.constructionProject.update({ where: { id: b.id }, data: { order: a.order } }),
  ]);

  refresh();
}

export async function addProjectImage(projectId: string, url: string, mediaType: "image" | "video") {
  await requireUser();
  const maxOrder = await prisma.projectImage.aggregate({ where: { projectId }, _max: { order: true } });
  await prisma.projectImage.create({ data: { projectId, url, mediaType, order: (maxOrder._max.order ?? -1) + 1 } });

  const project = await prisma.constructionProject.findUnique({ where: { id: projectId } });
  revalidatePath(`/admin/construction-projects/${projectId}`);
  if (project) refresh(project.slug);
}

export async function deleteProjectImage(imageId: string) {
  await requireUser();
  const image = await prisma.projectImage.delete({ where: { id: imageId } });
  await deleteUploadedFile(image.url);

  const project = await prisma.constructionProject.findUnique({ where: { id: image.projectId } });
  revalidatePath(`/admin/construction-projects/${image.projectId}`);
  if (project) refresh(project.slug);
}

export async function reorderProjectImage(imageId: string, direction: "up" | "down") {
  await requireUser();
  const image = await prisma.projectImage.findUnique({ where: { id: imageId } });
  if (!image) return;

  const siblings = await prisma.projectImage.findMany({ where: { projectId: image.projectId }, orderBy: { order: "asc" } });
  const index = siblings.findIndex((s) => s.id === imageId);
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapIndex < 0 || swapIndex >= siblings.length) return;

  const a = siblings[index];
  const b = siblings[swapIndex];
  await prisma.$transaction([
    prisma.projectImage.update({ where: { id: a.id }, data: { order: b.order } }),
    prisma.projectImage.update({ where: { id: b.id }, data: { order: a.order } }),
  ]);

  revalidatePath(`/admin/construction-projects/${image.projectId}`);
}

export async function setProjectFeaturedImage(projectId: string, url: string) {
  await requireUser();
  const project = await prisma.constructionProject.update({ where: { id: projectId }, data: { featuredImage: url } });
  revalidatePath(`/admin/construction-projects/${projectId}`);
  refresh(project.slug);
}
