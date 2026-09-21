"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { deleteUploadedFile } from "@/lib/uploads";

export async function setHeroVideo(url: string) {
  const user = await getSessionUser();
  if (!user) throw new Error("Unauthorized");

  const previous = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });

  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: { heroVideoUrl: url },
    create: { id: "singleton", heroVideoUrl: url },
  });

  if (previous?.heroVideoUrl && previous.heroVideoUrl !== url) {
    await deleteUploadedFile(previous.heroVideoUrl);
  }

  revalidatePath("/admin/hero");
  revalidatePath("/");
}

export async function resetHeroVideo() {
  const user = await getSessionUser();
  if (!user) throw new Error("Unauthorized");

  const previous = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });

  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: { heroVideoUrl: null },
    create: { id: "singleton", heroVideoUrl: null },
  });

  if (previous?.heroVideoUrl) {
    await deleteUploadedFile(previous.heroVideoUrl);
  }

  revalidatePath("/admin/hero");
  revalidatePath("/");
}
