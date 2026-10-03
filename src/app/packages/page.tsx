import { PackagesSection } from "@/components/catalog-sections";
import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";
import { getPublicPackages } from "@/lib/public-api";

export default async function PackagesPage() {
  const packages = await getPublicPackages();
  return (
    <main className="min-h-screen bg-[#f7f3eb] text-[#203a3a]">
      <PublicHeader />
      <section className="mx-auto max-w-7xl px-6 pb-6 pt-16">
        <p className="text-sm font-bold uppercase tracking-[.18em] text-[#bb6b36]">
          Service packages
        </p>
        <h1 className="mt-3 max-w-3xl font-serif text-5xl leading-tight sm:text-6xl">
          A structured starting point for your next stage.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-[#53605d]">
          Compare configured packages and choose a service period that fits your
          operation.
        </p>
      </section>
      <PackagesSection packages={packages} />
      <PublicFooter />
    </main>
  );
}
