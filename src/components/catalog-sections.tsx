import Link from "next/link";
import { Check } from "lucide-react";
import type { Package, Service } from "@/lib/types";
import { formatMoney } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

/**
 * Where every package CTA goes.
 *
 * It is a plain link to the existing calculator, and the package is deliberately not
 * carried across: no quotation can reference a package anywhere in the stack. The
 * quotation schema is `{ workerCount, locationId, industryId, serviceIds }` with no
 * `packageId`, nothing persists a package against a quote, and there is no public
 * quote-request endpoint. Prefilling would also mislead — the calculator prices
 * workers × location × industry + services and ignores the package's own price.
 */
export const QUOTE_HREF = "/services#calculator";

/**
 * A failed read. Shown in place of the data it replaces, so one dead section does not
 * blank a whole page. A server component cannot retry on click, so the honest recovery
 * is a reload plus a way to reach a human.
 */
export function CatalogError({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="border border-destructive/30 bg-destructive/10 p-6 text-sm text-destructive"
    >
      <p className="font-semibold">{message}</p>
      <p className="mt-2">
        Reload the page to try again. If it keeps happening, contact us and we will price your
        project directly.
      </p>
      <Link href="/contact" className="mt-4 inline-block font-semibold underline">
        Contact us
      </Link>
    </div>
  );
}

/** An empty catalogue, written as an invitation to act rather than a dead end. */
export function CatalogEmpty({
  title,
  body,
  actionHref,
  actionLabel,
}: {
  title: string;
  body: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="border border-border bg-card p-8">
      <p className="font-serif text-2xl">{title}</p>
      <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">{body}</p>
      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="mt-6 inline-block rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}

export function ServicesSection({
  services,
  compact = false,
}: {
  services: Service[];
  compact?: boolean;
}) {
  const visibleServices = compact ? services.slice(0, 6) : services;
  return (
    <section className="border-y border-border bg-primary-foreground/60">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <p className="text-sm font-bold uppercase tracking-[.18em] text-primary">Services</p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="mt-2 font-serif text-4xl">Support for the work that matters.</h2>
          {compact && (
            <Link href="/services" className="text-sm font-semibold text-primary">
              View all services
            </Link>
          )}
        </div>
        {visibleServices.length > 0 ? (
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {visibleServices.map((service) => (
              <article key={service.id} className="border border-border bg-background p-6">
                <h3 className="font-serif text-2xl">{service.name}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {service.description ??
                    "Practical compliance support for active construction teams."}
                </p>
                <p className="mt-6 font-semibold text-primary">
                  From {formatMoney(service.basePrice)}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-10">
            <CatalogEmpty
              title="No services are published yet."
              body="The service catalogue is still being set up. Contact us and we will walk you through what your project needs."
              actionHref="/contact"
              actionLabel="Contact us"
            />
          </div>
        )}
      </div>
    </section>
  );
}

/** One package. Shared by the full grid and the home page's featured row. */
function PackageCard({ pkg }: { pkg: Package }) {
  return (
    <article className="flex flex-col border border-border bg-card p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary">{pkg.type}</p>
          <h3 className="mt-2 font-serif text-2xl">{pkg.name}</h3>
        </div>
        {pkg.isFeatured && (
          <Badge className="shrink-0 bg-accent text-accent-foreground">Featured</Badge>
        )}
      </div>

      {pkg.description && (
        <p className="mt-4 text-sm leading-6 text-muted-foreground">{pkg.description}</p>
      )}

      <p className="mt-6 text-3xl font-semibold">{formatMoney(pkg.price)}</p>
      <p className="mt-1 text-sm text-muted-foreground">{pkg.durationDays} day service period</p>

      <div className="mt-6 border-t border-border pt-5">
        <p className="text-sm font-medium">Included services</p>
        {pkg.services.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {pkg.services.map((service) => (
              <li key={service.id} className="flex gap-2 text-sm text-muted-foreground">
                <Check aria-hidden size={16} className="mt-0.5 shrink-0 text-success" />
                {service.name}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            Services for this package are agreed with you directly.
          </p>
        )}
      </div>

      {/* mt-auto keeps the CTA on the bottom edge so cards of different heights line up. */}
      <Link
        href={QUOTE_HREF}
        className="mt-auto block pt-6 text-center text-sm font-semibold text-primary"
      >
        <span className="block rounded-full bg-primary px-6 py-3 text-primary-foreground">
          Get a quote
        </span>
      </Link>
    </article>
  );
}

/**
 * The full catalogue. Rendered in the order the API returned, which is
 * `isFeatured DESC, sortOrder ASC, name ASC` — re-sorting here is not possible anyway,
 * because `sortOrder` is not serialised.
 */
export function PackagesSection({ packages }: { packages: Package[] }) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {packages.map((pkg) => (
          <PackageCard key={pkg.id} pkg={pkg} />
        ))}
      </div>
    </section>
  );
}

/** The home page's row. Featured packages only, at most three, or nothing at all. */
export function FeaturedPackagesSection({ packages }: { packages: Package[] }) {
  const featured = packages.filter((pkg) => pkg.isFeatured).slice(0, 3);
  if (featured.length === 0) return null;

  return (
    <section className="border-y border-border bg-secondary">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-serif text-4xl">Packages built for common setups.</h2>
          <Link href="/packages" className="text-sm font-semibold text-primary">
            Compare all packages
          </Link>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {featured.map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg} />
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Packages against the services they bundle.
 *
 * Desktop only: a matrix this wide cannot be read on a phone, where the cards already
 * list each package's services. Plain table markup rather than `components/ui/table`,
 * which is a client component — nothing here is interactive, so it should ship no JS.
 */
export function PackageComparisonTable({ packages }: { packages: Package[] }) {
  const serviceNames = [
    ...new Set(packages.flatMap((pkg) => pkg.services.map((service) => service.name))),
  ].sort((a, b) => a.localeCompare(b));

  // Nothing to compare with one package, or with no bundled services at all.
  if (packages.length < 2 || serviceNames.length === 0) return null;

  return (
    <section className="hidden border-t border-border bg-card lg:block">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="font-serif text-4xl">What each package covers.</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          Every service we bundle, and the packages that include it.
        </p>
        <table className="mt-10 w-full border-collapse text-left text-sm">
          <caption className="sr-only">Services included in each package</caption>
          <thead>
            <tr className="border-b border-border">
              <th scope="col" className="py-4 pr-4 align-bottom font-medium">
                Service
              </th>
              {packages.map((pkg) => (
                <th key={pkg.id} scope="col" className="px-4 py-4 text-center align-bottom">
                  <span className="block font-serif text-lg font-normal">{pkg.name}</span>
                  <span className="mt-1 block text-xs font-normal text-muted-foreground">
                    {formatMoney(pkg.price)}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {serviceNames.map((name) => (
              <tr key={name} className="border-b border-border">
                <th scope="row" className="py-3 pr-4 font-normal">
                  {name}
                </th>
                {packages.map((pkg) => {
                  const included = pkg.services.some((service) => service.name === name);
                  return (
                    <td key={pkg.id} className="px-4 py-3 text-center">
                      {included ? (
                        <>
                          <Check aria-hidden size={18} className="mx-auto text-success" />
                          <span className="sr-only">Included</span>
                        </>
                      ) : (
                        <>
                          <span aria-hidden className="text-muted-foreground">
                            &mdash;
                          </span>
                          <span className="sr-only">Not included</span>
                        </>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
