import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { ServicesSection, PackagesSection } from "@/components/catalog-sections";
import { PricingCalculator } from "@/components/pricing-calculator";
import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";
import { getPublicPackages, getPublicServices } from "@/lib/public-api";

export default async function HomePage() {
  const [services, packages] = await Promise.all([getPublicServices(), getPublicPackages()]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <PublicHeader />
      <section className="mx-auto grid max-w-7xl gap-12 px-6 pb-20 pt-16 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
        <div>
          <p className="mb-5 flex items-center gap-2 text-sm font-bold uppercase tracking-[.18em] text-primary">
            <ShieldCheck size={16} /> Construction compliance, made clear
          </p>
          <h1 className="max-w-3xl font-serif text-5xl leading-[1.02] sm:text-7xl">
            Keep every project ready for the next inspection.
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-muted-foreground">
            A calm, accountable workspace for documents, services, quotations, and compliance
            milestones.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href="/services#calculator"
              className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground"
            >
              Calculate estimate <ArrowRight size={17} />
            </Link>
            <Link
              href="/register"
              className="rounded-full border border-border px-6 py-3 font-semibold"
            >
              Create account
            </Link>
          </div>
        </div>
        <div className="min-h-[390px] rounded-[2rem] bg-primary p-8 text-primary-foreground shadow-xl">
          <div className="flex h-full flex-col justify-between">
            <ShieldCheck size={42} className="text-accent" />
            <div>
              <p className="text-sm text-primary-foreground/60">One accountable place</p>
              <p className="mt-2 max-w-sm font-serif text-4xl leading-tight">
                From first quote to approved file.
              </p>
            </div>
          </div>
        </div>
      </section>
      <ServicesSection services={services} compact />
      <PackagesSection packages={packages} compact />
      <PricingCalculator />
      <PublicFooter />
    </main>
  );
}
