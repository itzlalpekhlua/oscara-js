import { prisma } from "@/lib/prisma";
import { GoldLabel } from "@/components/ui/GoldLabel";
import { Reveal } from "@/components/ui/Reveal";
import { AmbientGlow } from "@/components/ui/AmbientGlow";
import { CostEstimatorTool } from "@/components/CostEstimatorTool";

const DEFAULT_RATES = {
  cementPerBag: 850,
  sandPerCuFt: 90,
  aggregatePerCuFt: 85,
  brickPerPc: 18,
  steelPerKg: 115,
  economyRatePerSqFt: 2800,
  standardRatePerSqFt: 3500,
  premiumRatePerSqFt: 4500,
};

export default async function CostEstimatorPage() {
  const saved = await prisma.costEstimatorRates.findUnique({ where: { id: "singleton" } });
  const rates = saved
    ? {
        cementPerBag: saved.cementPerBag,
        sandPerCuFt: saved.sandPerCuFt,
        aggregatePerCuFt: saved.aggregatePerCuFt,
        brickPerPc: saved.brickPerPc,
        steelPerKg: saved.steelPerKg,
        economyRatePerSqFt: saved.economyRatePerSqFt,
        standardRatePerSqFt: saved.standardRatePerSqFt,
        premiumRatePerSqFt: saved.premiumRatePerSqFt,
      }
    : DEFAULT_RATES;

  return (
    <div className="relative overflow-hidden bg-ink-950 pt-32 pb-28">
      <AmbientGlow />
      <div className="relative mx-auto max-w-4xl px-6 text-center md:px-10">
        <Reveal>
          <GoldLabel>Plan Your Budget</GoldLabel>
        </Reveal>
        <Reveal delay={0.1}>
          <h1 className="mt-4 font-display text-5xl font-bold text-gold-3d sm:text-6xl md:text-7xl">Cost Estimator</h1>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="mx-auto mt-8 max-w-xl text-base text-bone/60 sm:text-lg">
            Work out material quantities and a rough project budget for your build in Nepal — instantly, before you talk to us.
          </p>
        </Reveal>
      </div>

      <div className="relative mx-auto mt-16 max-w-6xl px-6 md:px-10">
        <Reveal delay={0.2}>
          <CostEstimatorTool rates={rates} />
        </Reveal>
      </div>
    </div>
  );
}
