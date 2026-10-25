import { Suspense } from "react";
import type { Metadata } from "next";
import { CatalogBrowser } from "@/components/catalog-browser";
import { PricingCalculator } from "@/components/pricing-calculator";
import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";
import { getPublicCategories } from "@/lib/public-api";
import { getServerLocale } from "@/lib/locale";

export const metadata: Metadata = {
  title: "Servicios",
  description:
    "Servicios de gestión documental y trámites de cumplimiento en México: cotiza en línea, sube tus documentos y sigue cada fase de aprobación.",
  alternates: { canonical: "/services" },
};

/** See the note on `revalidate` in `/packages`: the real caching is per-fetch. */
export const revalidate = 300;

export default async function ServicesPage() {
  const locale = await getServerLocale();
  const categories = await getPublicCategories(locale);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <PublicHeader />
      <section className="mx-auto max-w-7xl px-6 pb-2 pt-16">
        <p className="text-sm font-bold uppercase tracking-[.18em] text-primary">What we handle</p>
        <h1 className="mt-3 max-w-3xl font-serif text-5xl leading-tight sm:text-6xl">
          Practical compliance support for active projects.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
          Choose the support your team needs, then use the calculator to shape a first estimate.
        </p>
      </section>
      <Suspense fallback={null}>
        <CatalogBrowser kind="services" categories={categories.ok ? categories.data : []} locale={locale} />
      </Suspense>
      <PricingCalculator />
      <PublicFooter />
    </main>
  );
}
