"use client";

import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { messageForError } from "@/lib/errors";
import { t, type Locale } from "@/lib/messages";
import type { CategoryWithCount, Package, Service } from "@/lib/types";
import { CardSkeleton, PackageCard, ServiceCard } from "@/components/cards";
import { CatalogEmpty } from "@/components/catalog-sections";
import { cn } from "@/lib/utils";

interface Props {
  kind: "services" | "packages";
  categories: CategoryWithCount[];
  locale: Locale;
}

/** The ?category= tab filter shared by the Services and Packages pages. */
export function CatalogBrowser({ kind, categories, locale }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const active = params.get("category") ?? "all";

  const query = useQuery({
    queryKey: ["catalog", kind, active],
    queryFn: () => {
      const qs = active === "all" ? "" : `?category=${encodeURIComponent(active)}`;
      return apiRequest<(Service | Package)[]>(`/public/${kind}${qs}`);
    },
  });

  function selectCategory(slug: string) {
    const next = new URLSearchParams(Array.from(params.entries()));
    if (slug === "all") next.delete("category");
    else next.set("category", slug);
    const queryString = next.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  }

  const countFor = (c: CategoryWithCount) =>
    kind === "services" ? (c.serviceCount ?? 0) : (c.packageCount ?? 0);
  const totalCount = categories.reduce((sum, c) => sum + countFor(c), 0);

  const tabs = [
    { slug: "all", name: t(locale, "filter.all"), count: totalCount || undefined },
    ...categories.map((c) => ({ slug: c.slug, name: c.name, count: countFor(c) })),
  ];

  const rows = query.data ?? [];

  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label={t(locale, "nav.categories")}>
        {tabs.map((tab) => {
          const selected = tab.slug === active;
          return (
            <button
              key={tab.slug}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => selectCategory(tab.slug)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                selected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card hover:border-primary/40",
              )}
            >
              {tab.name}
              {tab.count !== undefined && (
                <span
                  className={cn(
                    "rounded-full px-1.5 text-xs",
                    selected ? "bg-primary-foreground/20" : "bg-muted text-muted-foreground",
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-8">
        {query.isLoading && (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        )}

        {query.isError && (
          <div
            role="alert"
            className="border border-destructive/30 bg-destructive/10 p-6 text-sm text-destructive"
          >
            {messageForError(query.error, locale)}
          </div>
        )}

        {query.isSuccess && rows.length === 0 && (
          <CatalogEmpty
            title={t(locale, "filter.empty")}
            body={
              locale === "en"
                ? "Try another category, or get in touch and we'll scope it with you."
                : "Prueba otra categoría o contáctanos y lo definimos contigo."
            }
            actionHref="/contact"
            actionLabel={t(locale, "nav.contact")}
          />
        )}

        {query.isSuccess && rows.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {kind === "services"
              ? (rows as Service[]).map((service) => (
                  <ServiceCard key={service.id} service={service} locale={locale} />
                ))
              : (rows as Package[]).map((pkg) => (
                  <PackageCard key={pkg.id} pkg={pkg} locale={locale} />
                ))}
          </div>
        )}
      </div>
    </section>
  );
}
