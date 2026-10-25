/**
 * Canonical public-site configuration for SEO (sitemap, robots, canonical URLs, structured data).
 *
 * The site base URL is environment-driven so staging and production differ without code changes.
 * It defaults to the confirmed brand domain (docs/CLIENT-FACTS.md). Trailing slash is trimmed so
 * `${SITE_URL}${path}` always joins cleanly.
 */
const RAW_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://grupog2h.com";

export const SITE_URL = RAW_SITE_URL.replace(/\/+$/, "");

export const BRAND = {
  name: "Grupo G2H",
  tagline: "Servicios Integrales",
  /** Confirmed contact inbox on the brand domain (docs/CLIENT-FACTS.md). */
  email: "contacto@grupog2h.com",
} as const;

/** Static public routes included in the sitemap, with their relative crawl priority. */
export const PUBLIC_ROUTES: ReadonlyArray<{
  path: string;
  priority: number;
  changeFrequency: "daily" | "weekly" | "monthly" | "yearly";
}> = [
  { path: "/", priority: 1.0, changeFrequency: "weekly" },
  { path: "/services", priority: 0.9, changeFrequency: "weekly" },
  { path: "/packages", priority: 0.9, changeFrequency: "weekly" },
  { path: "/about", priority: 0.7, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.7, changeFrequency: "monthly" },
  { path: "/faq", priority: 0.6, changeFrequency: "monthly" },
];

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
