import { prisma } from "@/lib/prisma";
import { Hero } from "@/components/home/Hero";
import { About } from "@/components/home/About";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { MediaCoverage } from "@/components/home/MediaCoverage";
import { WhyChooseOjaskaraa } from "@/components/home/WhyChooseOjaskaraa";
import { TestimonialsTeaser } from "@/components/home/TestimonialsTeaser";
import { FinalCta } from "@/components/home/FinalCta";

export default async function HomePage() {
  const [firstProject, settings, testimonials, mediaFeatures] = await Promise.all([
    prisma.project.findFirst({
      where: { published: true },
      orderBy: { order: "asc" },
      select: { featuredImage: true },
    }),
    prisma.siteSettings.findUnique({ where: { id: "singleton" } }),
    prisma.testimonial.findMany({
      where: { published: true, kind: { not: "photo" } },
      orderBy: { order: "asc" },
    }),
    prisma.mediaFeature.findMany({
      where: { published: true },
      orderBy: { order: "asc" },
    }),
  ]);

  const heroImage = firstProject?.featuredImage ?? "";

  return (
    <>
      <Hero heroImage={heroImage} heroVideoUrl={settings?.heroVideoUrl} />
      <About
        title={settings?.introTitle}
        body={settings?.introBody}
        yearsInBusiness={13}
        projectsCompleted={200}
      />
      <WhyChooseUs />
      <MediaCoverage features={mediaFeatures} />
      <WhyChooseOjaskaraa />
      <TestimonialsTeaser testimonials={testimonials} />

      <FinalCta title={settings?.finalCtaTitle ?? null} body={settings?.finalCtaBody ?? null} phone={settings?.phone} />
    </>
  );
}
