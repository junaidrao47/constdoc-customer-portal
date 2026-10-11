import type { Metadata } from "next";
import { ServicesSection } from "@/components/catalog-sections";
import { PricingCalculator } from "@/components/pricing-calculator";
import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";
import { getPublicServices } from "@/lib/public-api";

export const metadata: Metadata = {
  title: "Services",
};

export default async function ServicesPage() {
  const services = await getPublicServices();
  return (
    <main className="min-h-screen bg-background text-foreground">
      <PublicHeader />
      <section className="mx-auto max-w-7xl px-6 pb-6 pt-16">
        <p className="text-sm font-bold uppercase tracking-[.18em] text-primary">What we handle</p>
        <h1 className="mt-3 max-w-3xl font-serif text-5xl leading-tight sm:text-6xl">
          Practical compliance support for active projects.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
          Choose the support your team needs, then use the calculator to shape a first estimate.
        </p>
      </section>
      <ServicesSection services={services} />
      <PricingCalculator />
      <PublicFooter />
    </main>
  );
}
