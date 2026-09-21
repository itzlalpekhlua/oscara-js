import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { absoluteUrl } from "@/lib/site";

// Content is admin-editable, so the sitemap is generated per request rather
// than frozen at build time.
export const dynamic = "force-dynamic";

const STATIC_PATHS: Array<{ path: string; priority: number }> = [
  { path: "/", priority: 1 },
  { path: "/services", priority: 0.9 },
  { path: "/projects", priority: 0.9 },
  { path: "/construction-projects", priority: 0.9 },
  { path: "/design", priority: 0.9 },
  { path: "/cost-estimator", priority: 0.7 },
  { path: "/team", priority: 0.6 },
  { path: "/testimonials", priority: 0.6 },
  { path: "/social", priority: 0.5 },
  { path: "/contact", priority: 0.8 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, constructionProjects, designWorks] = await Promise.all([
    prisma.project.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    }),
    prisma.constructionProject.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    }),
    prisma.designWork.findMany({
      where: { published: true },
      select: { slug: true, kind: true, scope: true, updatedAt: true },
    }),
  ]);

  const now = new Date();

  const staticEntries = STATIC_PATHS.map(({ path, priority }) => ({
    url: absoluteUrl(path),
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority,
  }));

  const projectEntries = projects.map((project) => ({
    url: absoluteUrl(`/projects/${project.slug}`),
    lastModified: project.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const constructionEntries = constructionProjects.map((project) => ({
    url: absoluteUrl(`/construction-projects/${project.slug}`),
    lastModified: project.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Design detail pages live at /design/[kind]/[scope]/[slug]; the kind and
  // scope listing pages above them are derived from the same records.
  const designListings = new Map<string, Date>();
  for (const work of designWorks) {
    for (const path of [`/design/${work.kind}`, `/design/${work.kind}/${work.scope}`]) {
      const existing = designListings.get(path);
      if (!existing || existing < work.updatedAt) {
        designListings.set(path, work.updatedAt);
      }
    }
  }

  const designListingEntries = Array.from(designListings, ([path, lastModified]) => ({
    url: absoluteUrl(path),
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const designEntries = designWorks.map((work) => ({
    url: absoluteUrl(`/design/${work.kind}/${work.scope}/${work.slug}`),
    lastModified: work.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    ...staticEntries,
    ...projectEntries,
    ...constructionEntries,
    ...designListingEntries,
    ...designEntries,
  ];
}
