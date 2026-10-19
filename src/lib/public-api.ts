import type {
  Industry,
  Location,
  Package,
  Service,
  WorkerRange,
  CatalogCategory,
  PaginatedCatalogItems,
} from "./types";

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

async function getPublic<T>(path: string): Promise<ApiResult<T>> {
  try {
    const response = await fetch(`${API_URL}${path}`, {
      // Next 16 does not cache `fetch` by default, so this per-request option — not the
      // segment-level `revalidate` export — is what actually makes the public pages ISR.
      next: { revalidate: 60 },
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

export function getPublicServices(): Promise<ApiResult<Service[]>> {
  return getPublic<Service[]>("/public/services");
}

export function getPublicPackages(): Promise<ApiResult<Package[]>> {
  return getPublic<Package[]>("/public/packages");
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
