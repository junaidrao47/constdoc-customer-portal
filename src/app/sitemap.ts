import type { MetadataRoute } from "next";
import { absoluteUrl, PUBLIC_ROUTES } from "@/lib/site";
import { getPublicPackages, getPublicServices } from "@/lib/public-api";
import { toSlug } from "@/lib/slug";

/**
 * XML sitemap: the static public routes plus one entry per published service and package
 * detail page. The catalogue reads return a value on failure (never throw), so a dead API
 * degrades to the static routes instead of failing the build.
 *
 * Note: locale is cookie-based (no `/en` · `/es-MX` path split), so each page has one URL and
 * per-locale `alternates.languages` are intentionally omitted — see docs/decision-log.md.
 */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = PUBLIC_ROUTES.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const [services, packages] = await Promise.all([getPublicServices(), getPublicPackages()]);

  const serviceEntries: MetadataRoute.Sitemap = services.ok
    ? services.data.map((s) => ({
        url: absoluteUrl(`/services/${toSlug(s.name, s.id)}`),
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.6,
      }))
    : [];

  const packageEntries: MetadataRoute.Sitemap = packages.ok
    ? packages.data.map((p) => ({
        url: absoluteUrl(`/packages/${toSlug(p.name, p.id)}`),
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.6,
      }))
    : [];

  return [...staticEntries, ...serviceEntries, ...packageEntries];
}
