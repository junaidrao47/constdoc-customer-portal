import { CatalogError, FeaturedPackagesSection, ServicesSection } from "@/components/catalog-sections";
import { Hero } from "@/components/home/hero";
import { HeroCarousel } from "@/components/home/hero-carousel";
import { HowItWorks } from "@/components/home/how-it-works";
import { StatsBand } from "@/components/home/stats";
import { FaqTeaser } from "@/components/home/faq-teaser";
import { FinalCta } from "@/components/home/final-cta";
import { PricingCalculator } from "@/components/pricing-calculator";
import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";
import { TrustBand } from "@/components/trust-band";
import { getPublicHero, getPublicPackages, getPublicServices } from "@/lib/public-api";
import { getServerLocale } from "@/lib/locale";

/** The real caching is per-fetch in `public-api.ts`; this caps how stale the segment can get. */
export const revalidate = 300;

export default async function HomePage() {
  const locale = await getServerLocale();
  const [services, packages, hero] = await Promise.all([
    getPublicServices(locale),
    getPublicPackages(locale),
    getPublicHero(locale),
  ]);

  // The carousel takes over when an admin has published at least one active slide; otherwise the
  // original static hero is the graceful fallback (also covers an unreachable API).
  const hasSlides = hero.ok && hero.data.slides.length > 0;

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <PublicHeader />
      {hasSlides ? <HeroCarousel data={hero.data} /> : <Hero />}
      <TrustBand />

      {services.ok ? (
        <ServicesSection services={services.data} compact locale={locale} />
      ) : (
        <section className="mx-auto max-w-7xl px-6 py-16">
          <CatalogError message={services.error} />
        </section>
      )}

      <HowItWorks />

      {packages.ok ? (
        <FeaturedPackagesSection packages={packages.data} locale={locale} />
      ) : (
        <section className="mx-auto max-w-7xl px-6 py-16">
          <CatalogError message={packages.error} />
        </section>
      )}

      <StatsBand />
      <PricingCalculator />
      <FaqTeaser />
      <FinalCta />
      <PublicFooter />
    </main>
  );
}
