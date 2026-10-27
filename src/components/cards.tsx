"use client";

import Link from "next/link";
import { ArrowRight, Boxes, Check, FileText, Layers } from "lucide-react";
import type { CategoryWithCount, Package, Service } from "@/lib/types";
import { formatMoney } from "@/lib/format";
import { t, type Locale } from "@/lib/messages";
import { toSlug } from "@/lib/slug";
import { categoryImage } from "@/data/site-images";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TiltCard } from "@/components/tilt-card";
import { cn } from "@/lib/utils";

const MAX_SERVICES = 4;

/**
 * Resolves an API image reference for the browser. The backend serves per-package images at
 * `/api/public/catalog/images/...` (a path on the API origin, not the portal) in local mode,
 * or as an absolute S3 URL. An absolute URL is used as-is; a path is prefixed with the API
 * origin derived from `NEXT_PUBLIC_API_URL` (its `/api` suffix stripped).
 */
const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api").replace(
  /\/api\/?$/,
  "",
);
function resolveImageUrl(url?: string | null): string | null {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_ORIGIN}${url.startsWith("/") ? "" : "/"}${url}`;
}

/**
 * Fixed-ratio media header. Uses the item's own `imageUrl` when present, otherwise tries
 * `/images/category-<slug>.jpg`; if neither resolves the photo hides and a gradient-and-icon
 * panel shows, so cards never wait on an image or shift layout.
 */
function CardMedia({
  icon: Icon,
  slug,
  imageUrl,
  dark = false,
}: {
  icon: typeof FileText;
  slug?: string | null;
  imageUrl?: string | null;
  dark?: boolean;
}) {
  const src = resolveImageUrl(imageUrl) ?? categoryImage(slug);
  return (
    <div
      aria-hidden
      className={cn(
        "relative flex aspect-[16/9] w-full items-center justify-center overflow-hidden",
        dark
          ? "bg-gradient-to-br from-white/10 to-accent/30"
          : "bg-gradient-to-br from-accent/15 via-accent/5 to-ink/10",
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <Icon className={dark ? "text-paper/70" : "text-accent/60"} size={44} strokeWidth={1.25} />
      )}
    </div>
  );
}

function CategoryBadge({ name, onDark = false }: { name?: string | null; onDark?: boolean }) {
  if (!name) return null;
  return (
    <Badge
      variant="outline"
      className={cn(
        "backdrop-blur-sm",
        onDark
          ? "border-white/25 bg-white/10 text-paper"
          : "border-accent/30 bg-paper/90 text-accent",
      )}
      style={{ transform: "translateZ(45px)" }}
    >
      {name}
    </Badge>
  );
}

function PriceChip({ value, onDark = false, locale }: { value: number; onDark?: boolean; locale: Locale }) {
  return (
    <p
      className={cn("text-sm font-semibold", onDark ? "text-paper" : "text-accent")}
      style={{ transform: "translateZ(30px)" }}
    >
      {t(locale, "card.from")} {formatMoney(value)} MXN
    </p>
  );
}

const SHELL =
  "group/card relative flex h-full flex-col overflow-hidden rounded-xl border transition-shadow focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2";

export function ServiceCard({ service, locale }: { service: Service; locale: Locale }) {
  const href = `/services/${toSlug(service.name, service.id)}`;
  return (
    <TiltCard className="h-full">
      <article className={cn(SHELL, "border-border bg-card shadow-[var(--elev-1)] group-hover/tilt:shadow-[var(--elev-3)]")}>
        <div className="relative">
          <CardMedia icon={FileText} slug={service.category?.slug} imageUrl={service.imageUrl} />
          <div className="absolute left-4 top-4">
            <CategoryBadge name={service.category?.name} />
          </div>
        </div>
        <div className="flex flex-1 flex-col p-6">
          <h3 className="heading text-2xl" style={{ transform: "translateZ(20px)" }}>
            {service.name}
          </h3>
          {service.description && (
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
              {service.description}
            </p>
          )}
          <div className="mt-4">
            <PriceChip value={service.basePrice} locale={locale} />
          </div>
          <Link
            href={href}
            className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-semibold text-accent outline-none"
          >
            {t(locale, "card.viewService")}
            <ArrowRight size={15} className="transition-transform group-hover/tilt:translate-x-0.5" />
          </Link>
        </div>
      </article>
    </TiltCard>
  );
}

export function PackageCard({ pkg, locale }: { pkg: Package; locale: Locale }) {
  const href = `/packages/${toSlug(pkg.name, pkg.id)}`;
  const extra = Math.max(0, pkg.services.length - MAX_SERVICES);
  const featured = pkg.isFeatured;
  return (
    <TiltCard className="h-full">
      <article
        className={cn(
          SHELL,
          featured
            ? "border-white/10 bg-ink text-paper shadow-[var(--elev-4)]"
            : "border-border bg-card shadow-[var(--elev-1)] group-hover/tilt:shadow-[var(--elev-3)]",
        )}
      >
        {featured && (
          <span
            className="heading absolute right-0 top-5 z-10 bg-accent px-4 py-1 text-xs uppercase tracking-wider text-paper shadow-[var(--elev-2)]"
            style={{ transform: "translateZ(50px)" }}
          >
            ★ {locale === "en" ? "Featured" : "Destacado"}
          </span>
        )}
        <div className="relative">
          <CardMedia icon={Boxes} slug={pkg.category?.slug} imageUrl={pkg.imageUrl} dark={featured} />
          <div className="absolute left-4 top-4">
            <CategoryBadge name={pkg.category?.name} onDark={featured} />
          </div>
        </div>
        <div className={cn("flex flex-1 flex-col", featured ? "p-8" : "p-6")}>
          <h3 className={cn("heading", featured ? "text-3xl" : "text-2xl")} style={{ transform: "translateZ(20px)" }}>
            {pkg.name}
          </h3>
          <p className={cn("mt-1 text-xs font-bold uppercase tracking-widest", featured ? "text-paper/60" : "text-muted-foreground")}>
            {pkg.type}
          </p>
          {pkg.description && (
            <p className={cn("mt-3 line-clamp-2 text-sm leading-6", featured ? "text-paper/75" : "text-muted-foreground")}>
              {pkg.description}
            </p>
          )}
          <p className={cn("heading mt-4", featured ? "text-4xl" : "text-3xl")} style={{ transform: "translateZ(30px)" }}>
            {formatMoney(pkg.price)} <span className="text-base font-normal opacity-70">MXN</span>
          </p>
          <p className={cn("mt-1 text-sm", featured ? "text-paper/70" : "text-muted-foreground")}>
            {pkg.durationDays} {locale === "en" ? "day service period" : "días de vigencia"}
          </p>
          {pkg.services.length > 0 && (
            <div className={cn("mt-5 border-t pt-4", featured ? "border-white/15" : "border-border")}>
              <p className="text-sm font-medium">{t(locale, "card.includedServices")}</p>
              <ul className="mt-2 space-y-1.5">
                {pkg.services.slice(0, MAX_SERVICES).map((service) => (
                  <li
                    key={service.id}
                    className={cn("flex gap-2 text-sm", featured ? "text-paper/80" : "text-muted-foreground")}
                  >
                    <Check aria-hidden size={15} className="mt-0.5 shrink-0 text-success" />
                    {service.name}
                  </li>
                ))}
              </ul>
              {extra > 0 && (
                <p className={cn("mt-2 text-xs font-medium", featured ? "text-accent" : "text-accent")}>
                  {t(locale, "card.moreServices", { n: extra })}
                </p>
              )}
            </div>
          )}
          <Link
            href={href}
            className={cn(
              "heading mt-auto inline-flex items-center justify-center gap-1.5 rounded-md px-5 py-2.5 text-sm uppercase tracking-wide outline-none",
              "mt-6",
              featured
                ? "bg-accent text-paper hover:bg-accent-hover"
                : "bg-accent text-paper hover:bg-accent-hover",
            )}
            style={{ transform: "translateZ(25px)" }}
          >
            {t(locale, "card.viewPackage")}
            <ArrowRight size={15} />
          </Link>
        </div>
      </article>
    </TiltCard>
  );
}

export function CategoryCard({ category, locale }: { category: CategoryWithCount; locale: Locale }) {
  const total = (category.serviceCount ?? 0) + (category.packageCount ?? 0);
  return (
    <TiltCard className="h-full">
      <Link
        href={`/services?category=${encodeURIComponent(category.slug)}`}
        className={cn(SHELL, "border-border bg-card shadow-[var(--elev-1)] outline-none group-hover/tilt:shadow-[var(--elev-3)]")}
      >
        <div className="relative">
          <CardMedia icon={Layers} slug={category.slug} />
          <div className="absolute left-4 top-4">
            <CategoryBadge name={category.name} />
          </div>
        </div>
        <div className="flex flex-1 flex-col p-6">
          <h3 className="heading text-xl">{category.name}</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {total} {locale === "en" ? "items" : "elementos"}
          </p>
        </div>
      </Link>
    </TiltCard>
  );
}

export function CardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-[var(--elev-1)]">
      <Skeleton className="aspect-[16/9] w-full rounded-none" />
      <div className="flex flex-col gap-3 p-6">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
  );
}
