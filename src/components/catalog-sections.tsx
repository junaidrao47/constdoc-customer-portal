import Link from "next/link";
import type { Package, Service } from "@/lib/types";
import { formatMoney } from "@/lib/format";
import { t, type Locale } from "@/lib/messages";
import { DEFAULT_LOCALE } from "@/lib/locale";
import { Check } from "lucide-react";
import { PackageCard, ServiceCard } from "@/components/cards";

/** Where a generic package/estimate CTA goes: the calculator. */
export const QUOTE_HREF = "/services#calculator";

/** Centers and caps a grid so 1–2 items never look half-empty. */
function gridShell(count: number): string {
  if (count <= 1) return "mx-auto grid max-w-sm gap-5";
  if (count === 2) return "mx-auto grid max-w-3xl gap-5 sm:grid-cols-2";
  return "grid gap-5 sm:grid-cols-2 lg:grid-cols-3";
}

/**
 * A failed read, shown in place of the data it replaces so one dead section does not blank a
 * whole page. A server component cannot retry on click, so the honest recovery is a reload
 * plus a way to reach a human.
 */
export function CatalogError({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-sm text-destructive"
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
    <div className="rounded-xl border border-border bg-card p-8 shadow-[var(--elev-1)]">
      <p className="heading text-2xl">{title}</p>
      <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">{body}</p>
      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="heading mt-6 inline-block rounded-md bg-accent px-6 py-3 text-sm uppercase tracking-wide text-paper hover:bg-accent-hover"
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
  locale = DEFAULT_LOCALE,
}: {
  services: Service[];
  compact?: boolean;
  locale?: Locale;
}) {
  const visible = compact ? services.slice(0, 6) : services;
  return (
    <section className="border-y border-border bg-paper">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-xs text-primary">{t(locale, "home.services.eyebrow")}</p>
            <h2 className="heading mt-2 text-4xl sm:text-5xl">{t(locale, "home.services.title")}</h2>
          </div>
          {compact && (
            <Link href="/services" className="text-sm font-semibold text-accent">
              {t(locale, "home.services.viewAll")} →
            </Link>
          )}
        </div>
        {visible.length > 0 ? (
          <div className={`mt-12 ${gridShell(visible.length)}`}>
            {visible.map((service) => (
              <ServiceCard key={service.id} service={service} locale={locale} />
            ))}
          </div>
        ) : (
          <div className="mt-10">
            <CatalogEmpty
              title={locale === "en" ? "No services published yet." : "Aún no hay servicios publicados."}
              body={
                locale === "en"
                  ? "The catalogue is still being set up. Contact us and we'll scope what your project needs."
                  : "El catálogo aún se está configurando. Contáctanos y definimos lo que tu proyecto necesita."
              }
              actionHref="/contact"
              actionLabel={t(locale, "nav.contact")}
            />
          </div>
        )}
      </div>
    </section>
  );
}

/** The full catalogue grid, rendered in the API's order. */
export function PackagesSection({
  packages,
  locale = DEFAULT_LOCALE,
}: {
  packages: Package[];
  locale?: Locale;
}) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className={gridShell(packages.length)}>
        {packages.map((pkg) => (
          <PackageCard key={pkg.id} pkg={pkg} locale={locale} />
        ))}
      </div>
    </section>
  );
}

/** The home page's featured row: featured packages only, at most three, or nothing. */
export function FeaturedPackagesSection({
  packages,
  locale = DEFAULT_LOCALE,
}: {
  packages: Package[];
  locale?: Locale;
}) {
  const featured = packages.filter((pkg) => pkg.isFeatured).slice(0, 3);
  if (featured.length === 0) return null;

  return (
    <section className="border-y border-border bg-background">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="heading text-4xl sm:text-5xl">{t(locale, "home.packages.title")}</h2>
          <Link href="/packages" className="text-sm font-semibold text-accent">
            {t(locale, "home.packages.compare")} →
          </Link>
        </div>
        <div className={`mt-12 ${gridShell(featured.length)}`}>
          {featured.map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg} locale={locale} />
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Packages against the services they bundle. Desktop only — a matrix this wide can't be read
 * on a phone, where the cards already list each package's services. Plain table markup (ships
 * no JS).
 */
export function PackageComparisonTable({ packages }: { packages: Package[] }) {
  const serviceNames = [
    ...new Set(packages.flatMap((pkg) => pkg.services.map((service) => service.name))),
  ].sort((a, b) => a.localeCompare(b));

  if (packages.length < 2 || serviceNames.length === 0) return null;

  return (
    <section className="hidden border-t border-border bg-card lg:block">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="heading text-4xl">What each package covers.</h2>
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
                  <span className="heading block text-lg font-normal">{pkg.name}</span>
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
