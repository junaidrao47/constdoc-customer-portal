import { Suspense } from "react";
import type { Metadata } from "next";
import { CatalogBrowser } from "@/components/catalog-browser";
import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";
import { getPublicCategories } from "@/lib/public-api";
import { getServerLocale } from "@/lib/locale";

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
  const locale = await getServerLocale();
  const categories = await getPublicCategories(locale);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <PublicHeader />
      <section className="mx-auto max-w-7xl px-6 pb-2 pt-16">
        <p className="text-sm font-bold uppercase tracking-[.18em] text-primary">Service packages</p>
        <h1 className="mt-3 max-w-3xl font-serif text-5xl leading-tight sm:text-6xl">
          A structured starting point for your next stage.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
          Compare configured packages and choose a service period that fits your operation.
        </p>
      </section>
      <Suspense fallback={null}>
        <CatalogBrowser kind="packages" categories={categories.ok ? categories.data : []} locale={locale} />
      </Suspense>
      <PublicFooter />
    </main>
  );
}
