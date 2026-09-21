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
  revalidatePath("/admin/testimonials");
  revalidatePath("/testimonials");
  revalidatePath("/");
}

export async function createTestimonial(formData: FormData) {
  await requireUser();
  const customerName = String(formData.get("customerName") ?? "").trim();
  if (!customerName) throw new Error("Customer name is required");

  const maxOrder = await prisma.testimonial.aggregate({ _max: { order: true } });

  const ratingRaw = (formData.get("rating") as string) || "";

  await prisma.testimonial.create({
    data: {
      kind: (formData.get("kind") as string) || "review",
      customerName,
      reviewText: (formData.get("reviewText") as string) || null,
      location: (formData.get("location") as string) || null,
      rating: ratingRaw ? Number(ratingRaw) : null,
      response: (formData.get("response") as string) || null,
      videoUrl: (formData.get("videoUrl") as string) || null,
      thumbnail: (formData.get("thumbnail") as string) || null,
      order: (maxOrder._max.order ?? -1) + 1,
    },
  });

  refresh();
}

export async function updateTestimonial(id: string, formData: FormData) {
  await requireUser();
  const customerName = String(formData.get("customerName") ?? "").trim();
  if (!customerName) throw new Error("Customer name is required");

  const ratingRaw = (formData.get("rating") as string) || "";

  await prisma.testimonial.update({
    where: { id },
    data: {
      kind: (formData.get("kind") as string) || "review",
      customerName,
      reviewText: (formData.get("reviewText") as string) || null,
      location: (formData.get("location") as string) || null,
      rating: ratingRaw ? Number(ratingRaw) : null,
      response: (formData.get("response") as string) || null,
      videoUrl: (formData.get("videoUrl") as string) || null,
      thumbnail: (formData.get("thumbnail") as string) || null,
    },
  });

  refresh();
}

export async function deleteTestimonial(id: string) {
  await requireUser();
  const testimonial = await prisma.testimonial.delete({ where: { id } });
  if (testimonial.videoUrl) await deleteUploadedFile(testimonial.videoUrl);
  if (testimonial.thumbnail) await deleteUploadedFile(testimonial.thumbnail);
  refresh();
}

export async function toggleTestimonialPublished(id: string, published: boolean) {
  await requireUser();
  await prisma.testimonial.update({ where: { id }, data: { published } });
  refresh();
}

export async function reorderTestimonial(id: string, direction: "up" | "down") {
  await requireUser();
  const rows = await prisma.testimonial.findMany({ orderBy: { order: "asc" } });
  const index = rows.findIndex((r) => r.id === id);
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapIndex < 0 || swapIndex >= rows.length) return;

  const a = rows[index];
  const b = rows[swapIndex];
  await prisma.$transaction([
    prisma.testimonial.update({ where: { id: a.id }, data: { order: b.order } }),
    prisma.testimonial.update({ where: { id: b.id }, data: { order: a.order } }),
  ]);

  refresh();
}
