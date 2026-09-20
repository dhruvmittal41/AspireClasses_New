import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { catalog } from "@/lib/data";
export const revalidate = 3600;
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { exams, bundles } = await catalog();
  return [
    "",
    "/exams",
    "/contact",
    ...exams.map((e) => "/exams/" + e.slug),
    ...bundles.map((b) => "/details/bundle/" + b.id),
  ].map((path) => ({
    url: site.url + path,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));
}
