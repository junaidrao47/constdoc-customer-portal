import Link from "next/link";
import { ArrowRight, Boxes, Check, FileText, Layers } from "lucide-react";
import type { CategoryWithCount, Package, Service } from "@/lib/types";
import { formatMoney } from "@/lib/format";
import { t, type Locale } from "@/lib/messages";
import { toSlug } from "@/lib/slug";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const MAX_SERVICES = 4;

/** A fixed-ratio gradient-and-icon header so cards never shift layout waiting on an image. */
function CardMedia({ icon: Icon, className }: { icon: typeof FileText; className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "flex aspect-[16/9] w-full items-center justify-center bg-gradient-to-br from-primary/15 via-primary/5 to-accent/15",
        className,
      )}
    >
      <Icon className="text-primary/60" size={44} strokeWidth={1.25} />
    </div>
  );
}

function CategoryBadge({ name }: { name?: string | null }) {
  if (!name) return null;
  return (
    <Badge variant="outline" className="border-primary/30 bg-primary/5 text-primary">
      {name}
    </Badge>
  );
}

/** Focus + hover affordance shared by the linked cards. */
const CARD_CLASS =
  "group flex flex-col overflow-hidden border border-border bg-card transition-shadow hover:shadow-lg focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2";

export function ServiceCard({ service, locale }: { service: Service; locale: Locale }) {
  const href = `/services/${toSlug(service.name, service.id)}`;
  return (
    <article className={CARD_CLASS}>
      <CardMedia icon={FileText} />
      <div className="flex flex-1 flex-col p-6">
        <CategoryBadge name={service.category?.name} />
        <h3 className="mt-3 font-serif text-2xl">{service.name}</h3>
        {service.description && (
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
            {service.description}
          </p>
        )}
        <p className="mt-4 font-semibold text-primary">
          {t(locale, "card.from")} {formatMoney(service.basePrice)}
        </p>
        <Link
          href={href}
          className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-semibold text-primary outline-none"
        >
          {t(locale, "card.viewService")}
          <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </article>
  );
}

export function PackageCard({ pkg, locale }: { pkg: Package; locale: Locale }) {
  const href = `/packages/${toSlug(pkg.name, pkg.id)}`;
  const extra = Math.max(0, pkg.services.length - MAX_SERVICES);
  return (
    <article className={CARD_CLASS}>
      <CardMedia icon={Boxes} />
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-3">
          <CategoryBadge name={pkg.category?.name} />
          {pkg.isFeatured && (
            <Badge className="shrink-0 bg-accent text-accent-foreground">★</Badge>
          )}
        </div>
        <h3 className="mt-3 font-serif text-2xl">{pkg.name}</h3>
        <p className="mt-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          {pkg.type}
        </p>
        <p className="mt-4 text-3xl font-semibold">{formatMoney(pkg.price)}</p>
        <p className="mt-1 text-sm text-muted-foreground">{pkg.durationDays} days</p>
        {pkg.services.length > 0 && (
          <div className="mt-5 border-t border-border pt-4">
            <p className="text-sm font-medium">{t(locale, "card.includedServices")}</p>
            <ul className="mt-2 space-y-1.5">
              {pkg.services.slice(0, MAX_SERVICES).map((service) => (
                <li key={service.id} className="flex gap-2 text-sm text-muted-foreground">
                  <Check aria-hidden size={15} className="mt-0.5 shrink-0 text-success" />
                  {service.name}
                </li>
              ))}
            </ul>
            {extra > 0 && (
              <p className="mt-2 text-xs font-medium text-primary">
                {t(locale, "card.moreServices", { n: extra })}
              </p>
            )}
          </div>
        )}
        <Link
          href={href}
          className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-semibold text-primary outline-none"
        >
          {t(locale, "card.viewPackage")}
          <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </article>
  );
}

export function CategoryCard({ category, locale }: { category: CategoryWithCount; locale: Locale }) {
  const total = (category.serviceCount ?? 0) + (category.packageCount ?? 0);
  return (
    <Link
      href={`/services?category=${encodeURIComponent(category.slug)}`}
      className={cn(CARD_CLASS, "outline-none")}
    >
      <CardMedia icon={Layers} />
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-serif text-xl">{category.name}</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {total} {locale === "en" ? "items" : "elementos"}
        </p>
      </div>
    </Link>
  );
}

export function CardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden border border-border bg-card">
      <Skeleton className="aspect-[16/9] w-full" />
      <div className="flex flex-col gap-3 p-6">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
  );
}
