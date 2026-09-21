"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function updateSiteSettings(formData: FormData) {
  const user = await getSessionUser();
  if (!user) throw new Error("Unauthorized");

  const field = (name: string) => {
    const value = formData.get(name);
    return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
  };

  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: {
      tagline: field("tagline"),
      introTitle: field("introTitle"),
      introBody: field("introBody"),
      finalCtaTitle: field("finalCtaTitle"),
      finalCtaBody: field("finalCtaBody"),
      phone: field("phone"),
      phoneSecondary: field("phoneSecondary"),
      email: field("email"),
      address: field("address"),
      locationPrimaryName: field("locationPrimaryName"),
      locationPrimaryLabel: field("locationPrimaryLabel"),
      locationSecondaryName: field("locationSecondaryName"),
      locationSecondaryLabel: field("locationSecondaryLabel"),
      instagramUrl: field("instagramUrl"),
      facebookUrl: field("facebookUrl"),
      tiktokUrl: field("tiktokUrl"),
      whatsappUrl: field("whatsappUrl"),
    },
    create: {
      id: "singleton",
      tagline: field("tagline"),
      introTitle: field("introTitle"),
      introBody: field("introBody"),
      finalCtaTitle: field("finalCtaTitle"),
      finalCtaBody: field("finalCtaBody"),
      phone: field("phone"),
      phoneSecondary: field("phoneSecondary"),
      email: field("email"),
      address: field("address"),
      locationPrimaryName: field("locationPrimaryName"),
      locationPrimaryLabel: field("locationPrimaryLabel"),
      locationSecondaryName: field("locationSecondaryName"),
      locationSecondaryLabel: field("locationSecondaryLabel"),
      instagramUrl: field("instagramUrl"),
      facebookUrl: field("facebookUrl"),
      tiktokUrl: field("tiktokUrl"),
      whatsappUrl: field("whatsappUrl"),
    },
  });

  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");
}
