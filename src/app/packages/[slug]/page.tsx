import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/format";
import { getServerLocale } from "@/lib/locale";
import { getPublicPackages } from "@/lib/public-api";
import { idFromSlug } from "@/lib/slug";
import type { Package } from "@/lib/types";

export const revalidate = 300;

async function findPackage(slug: string): Promise<Package | null> {
  const locale = await getServerLocale();
  const result = await getPublicPackages(locale);
  if (!result.ok) return null;
  const id = idFromSlug(slug);
  return result.data.find((pkg) => pkg.id === id) ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const pkg = await findPackage(slug);
  return { title: pkg?.name ?? "Package" };
}

export default async function PackageDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pkg = await findPackage(slug);
  if (!pkg) notFound();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <PublicHeader />
      <section className="mx-auto max-w-3xl px-6 py-16">
        <Link href="/packages" className="text-sm font-semibold text-primary">
          ← Packages
        </Link>
        <div className="mt-6 flex flex-wrap items-center gap-2">
          {pkg.category?.name && (
            <Badge variant="outline" className="border-primary/30 bg-primary/5 text-primary">
              {pkg.category.name}
            </Badge>
          )}
          {pkg.isFeatured && <Badge className="bg-accent text-accent-foreground">Featured</Badge>}
        </div>
        <h1 className="mt-4 font-serif text-5xl leading-tight">{pkg.name}</h1>
        {pkg.description && (
          <p className="mt-6 text-lg leading-8 text-muted-foreground">{pkg.description}</p>
        )}
        <p className="mt-8 text-4xl font-semibold">{formatMoney(pkg.price)}</p>
        <p className="mt-1 text-sm text-muted-foreground">{pkg.durationDays} day service period</p>

        {pkg.services.length > 0 && (
          <div className="mt-8 border-t border-border pt-6">
            <h2 className="font-serif text-2xl">Included services</h2>
            <ul className="mt-4 space-y-2">
              {pkg.services.map((service) => (
                <li key={service.id} className="flex gap-2 text-sm text-muted-foreground">
                  <Check aria-hidden size={16} className="mt-0.5 shrink-0 text-success" />
                  {service.name}
                </li>
              ))}
            </ul>
          </div>
        )}

        <Link
          href="/services#calculator"
          className="mt-8 inline-block rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
        >
          Get a quote
        </Link>
      </section>
      <PublicFooter />
    </main>
  );
}
