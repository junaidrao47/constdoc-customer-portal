import Link from "next/link";
import type { Package, Service } from "@/lib/types";

export function ServicesSection({
  services,
  compact = false,
}: {
  services: Service[];
  compact?: boolean;
}) {
  const visibleServices = compact ? services.slice(0, 6) : services;
  return (
    <section className="border-y border-[#203a3a]/10 bg-white/60">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <p className="text-sm font-bold uppercase tracking-[.18em] text-[#bb6b36]">Services</p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="mt-2 font-serif text-4xl">Support for the work that matters.</h2>
          {compact && (
            <Link href="/services" className="text-sm font-semibold text-[#bb6b36]">
              View all services
            </Link>
          )}
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {visibleServices.map((service) => (
            <article key={service.id} className="border border-[#203a3a]/10 bg-[#f7f3eb] p-6">
              <h3 className="font-serif text-2xl">{service.name}</h3>
              <p className="mt-3 text-sm leading-6 text-[#53605d]">
                {service.description ??
                  "Practical compliance support for active construction teams."}
              </p>
              <p className="mt-6 font-semibold text-[#bb6b36]">
                From {service.basePrice.toLocaleString()} PKR
              </p>
            </article>
          ))}
        </div>
        {services.length === 0 && (
          <p className="mt-6 text-sm text-[#53605d]">
            Services are being configured. Check back shortly.
          </p>
        )}
      </div>
    </section>
  );
}

export function PackagesSection({
  packages,
  compact = false,
}: {
  packages: Package[];
  compact?: boolean;
}) {
  const visiblePackages = compact ? packages.slice(0, 4) : packages;
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[.18em] text-[#bb6b36]">Packages</p>
          <h2 className="mt-2 font-serif text-4xl">Clear options for every stage.</h2>
        </div>
        {compact && (
          <Link href="/packages" className="text-sm font-semibold text-[#bb6b36]">
            Explore packages
          </Link>
        )}
      </div>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {visiblePackages.map((pkg) => (
          <article key={pkg.id} className="border border-[#203a3a]/10 bg-white p-6">
            <p className="text-xs font-bold uppercase tracking-widest text-[#bb6b36]">{pkg.type}</p>
            <h3 className="mt-3 font-serif text-2xl">{pkg.name}</h3>
            <p className="mt-4 text-xl font-semibold">{pkg.price.toLocaleString()} PKR</p>
            <p className="mt-2 text-sm text-[#53605d]">{pkg.durationDays} day service period</p>
          </article>
        ))}
      </div>
      {packages.length === 0 && (
        <p className="mt-6 text-sm text-[#53605d]">
          Packages are being configured. Check back shortly.
        </p>
      )}
    </section>
  );
}
