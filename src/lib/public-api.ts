import type {
  Industry,
  Location,
  Package,
  Service,
  WorkerRange,
  CatalogCategory,
  CategoryWithCount,
  PaginatedCatalogItems,
} from "./types";
import { acceptLanguage, DEFAULT_LOCALE } from "./locale";
import type { Locale } from "./messages";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

/**
 * The outcome of a public read.
 *
 * A failure is a value here, not an exception, for two reasons. These calls run inside
 * statically rendered segments, where a throw fails `next build` instead of showing the
 * visitor a message. And the previous implementation returned `[] as T` for every
 * failure, which made a dead API indistinguishable from an empty catalogue — the page
 * said "being configured" when the truth was "we cannot reach the service". Callers now
 * have to branch on `ok`, which is the point.
 */
export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string };

async function getPublic<T>(path: string, locale: Locale = DEFAULT_LOCALE): Promise<ApiResult<T>> {
  try {
    // The API localizes on `Accept-Language`; headers are not part of Next's fetch cache
    // key, so a `_l` divider keeps the two locales' ISR entries from colliding (the public
    // routes ignore unknown query keys).
    const url = `${API_URL}${path}${path.includes("?") ? "&" : "?"}_l=${locale}`;
    const response = await fetch(url, {
      headers: { "Accept-Language": acceptLanguage(locale) },
      // Next 16 does not cache `fetch` by default, so this per-request option — not the
      // segment-level `revalidate` export — is what actually makes the public pages ISR.
      next: { revalidate: 60 },
      // Bound the wait so a slow (not dead) API cannot stall a request — or, critically,
      // stall `next build`, where a static/ISR segment that hangs past 60s fails the whole
      // build. On timeout the fetch aborts and the catch below returns ok:false, so a
      // production/CI/Docker build with no reachable API degrades to the static routes.
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      return { ok: false, error: `The catalogue service responded with ${response.status}.` };
    }

    const payload = (await response.json()) as { data?: T };
    if (payload.data === undefined) {
      // A 200 carrying no `data` is a broken envelope, not an empty result. The old code
      // cast `{}` to `T`, so an array-typed caller got an object and `.map` threw.
      return { ok: false, error: "The catalogue service returned an unexpected response." };
    }

    return { ok: true, data: payload.data };
  } catch {
    return { ok: false, error: "The catalogue service could not be reached." };
  }
}

function withCategory(path: string, categorySlug?: string): string {
  return categorySlug ? `${path}?category=${encodeURIComponent(categorySlug)}` : path;
}

export function getPublicServices(
  locale: Locale = DEFAULT_LOCALE,
  categorySlug?: string,
): Promise<ApiResult<Service[]>> {
  return getPublic<Service[]>(withCategory("/public/services", categorySlug), locale);
}

export function getPublicPackages(
  locale: Locale = DEFAULT_LOCALE,
  categorySlug?: string,
): Promise<ApiResult<Package[]>> {
  return getPublic<Package[]>(withCategory("/public/packages", categorySlug), locale);
}

export function getPublicCategories(locale: Locale = DEFAULT_LOCALE): Promise<ApiResult<CategoryWithCount[]>> {
  return getPublic<CategoryWithCount[]>("/public/categories", locale);
}

export function getPublicLocations(): Promise<ApiResult<Location[]>> {
  return getPublic<Location[]>("/public/locations");
}

export function getPublicIndustries(): Promise<ApiResult<Industry[]>> {
  return getPublic<Industry[]>("/public/industries");
}

export function getPublicWorkerRanges(): Promise<ApiResult<WorkerRange[]>> {
  return getPublic<WorkerRange[]>("/public/worker-ranges");
}

export function getPublicCatalogCategories(): Promise<ApiResult<CatalogCategory[]>> {
  return getPublic<CatalogCategory[]>("/public/catalog/categories");
}

export function getPublicCatalogItems(query = ""): Promise<ApiResult<PaginatedCatalogItems>> {
  return getPublic<PaginatedCatalogItems>(`/public/catalog/items${query ? `?${query}` : ""}`);
}

// ── Homepage CMS: hero carousel + editable content ───────────────────────────────

export type HeroTransition = "fade" | "slide" | "zoom";

export interface HeroSlide {
  id: string;
  imageUrl: string;
  alt: string | null;
  headline: string | null;
  subheadline: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
  durationMs: number;
  transition: HeroTransition;
  overlayOpacity: number;
  focalX: number;
  focalY: number;
}

export interface HeroSettings {
  autoplay: boolean;
  defaultDurationMs: number;
  transitionMs: number;
  pauseOnHover: boolean;
  loop: boolean;
  headingFont: string;
  bodyFont: string;
  baseTextScale: number;
}

export interface HeroPayload {
  slides: HeroSlide[];
  settings: HeroSettings;
}

export interface ContentValue {
  value: string;
  fontFamily: string | null;
  fontWeight: number | null;
  sizeStep: string | null;
}

export type SiteContent = Record<string, ContentValue>;

export function getPublicHero(locale: Locale = DEFAULT_LOCALE): Promise<ApiResult<HeroPayload>> {
  return getPublic<HeroPayload>(`/public/hero?locale=${locale}`, locale);
}

export function getPublicContent(locale: Locale = DEFAULT_LOCALE): Promise<ApiResult<SiteContent>> {
  return getPublic<SiteContent>(`/public/content?locale=${locale}`, locale);
}
