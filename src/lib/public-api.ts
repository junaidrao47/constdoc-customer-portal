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

async function getPublic<T>(path: string): Promise<T> {
  try {
    const response = await fetch(`${API_URL}${path}`, {
      next: { revalidate: 60 },
    });
    if (!response.ok) {
      return [] as T;
    }
    const payload = (await response.json()) as { data?: T };
    return payload.data ?? ({} as T);
  } catch {
    return [] as T;
  }
}

export function getPublicServices() {
  return getPublic<Service[]>("/public/services");
}

export function getPublicPackages() {
  return getPublic<Package[]>("/public/packages");
}

export function getPublicLocations() {
  return getPublic<Location[]>("/public/locations");
}

export function getPublicIndustries() {
  return getPublic<Industry[]>("/public/industries");
}

export function getPublicWorkerRanges() {
  return getPublic<WorkerRange[]>("/public/worker-ranges");
}

export function getPublicCatalogCategories() {
  return getPublic<CatalogCategory[]>("/public/catalog/categories");
}

export function getPublicCatalogItems(query = "") {
  return getPublic<PaginatedCatalogItems>(`/public/catalog/items${query ? `?${query}` : ""}`);
}
