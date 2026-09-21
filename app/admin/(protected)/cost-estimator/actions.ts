"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function updateCostEstimatorRates(formData: FormData) {
  const user = await getSessionUser();
  if (!user) throw new Error("Unauthorized");

  const num = (name: string, fallback: number) => {
    const value = parseFloat(String(formData.get(name)));
    return Number.isFinite(value) && value >= 0 ? value : fallback;
  };

  const data = {
    cementPerBag: num("cementPerBag", 850),
    sandPerCuFt: num("sandPerCuFt", 90),
    aggregatePerCuFt: num("aggregatePerCuFt", 85),
    brickPerPc: num("brickPerPc", 18),
    steelPerKg: num("steelPerKg", 115),
    economyRatePerSqFt: num("economyRatePerSqFt", 2800),
    standardRatePerSqFt: num("standardRatePerSqFt", 3500),
    premiumRatePerSqFt: num("premiumRatePerSqFt", 4500),
  };

  await prisma.costEstimatorRates.upsert({
    where: { id: "singleton" },
    update: data,
    create: { id: "singleton", ...data },
  });

  revalidatePath("/admin/cost-estimator");
  revalidatePath("/cost-estimator");
}
