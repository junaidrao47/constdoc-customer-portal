import type { Metadata } from "next";
import {
  CatalogEmpty,
  CatalogError,
  PackageComparisonTable,
  PackagesSection,
  QUOTE_HREF,
} from "@/components/catalog-sections";
import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";
import { getPublicPackages } from "@/lib/public-api";

export const metadata: Metadata = {
  title: "Packages",
};

/**
 * Bounds how stale the catalogue can get. The actual caching comes from the per-request
 * `next: { revalidate: 60 }` in `public-api.ts`, because Next 16 does not cache `fetch`
 * by default; this export documents the segment and caps it.
 */
export const revalidate = 300;

export default async function PackagesPage() {
  const result = await getPublicPackages();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <PublicHeader />
      <section className="mx-auto max-w-7xl px-6 pb-6 pt-16">
        <p className="text-sm font-bold uppercase tracking-[.18em] text-primary">
          Service packages
        </p>
        <h1 className="mt-3 max-w-3xl font-serif text-5xl leading-tight sm:text-6xl">
          A structured starting point for your next stage.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
          Compare configured packages and choose a service period that fits your operation.
        </p>
      </section>

      {!result.ok ? (
        <section className="mx-auto max-w-7xl px-6 py-16">
          <CatalogError message={result.error} />
        </section>
      ) : result.data.length === 0 ? (
        <section className="mx-auto max-w-7xl px-6 py-16">
          <CatalogEmpty
            title="No packages are published yet."
            body="You can still price your project from individual services — pick your team size, location and industry and the calculator will give you an estimate."
            actionHref={QUOTE_HREF}
            actionLabel="Build an estimate"
          />
        </section>
      ) : (
        <>
          <PackagesSection packages={result.data} />
          <PackageComparisonTable packages={result.data} />
        </>
      )}

      <PublicFooter />
    </main>
  );
}
