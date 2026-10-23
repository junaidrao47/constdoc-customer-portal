import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/format";
import { getServerLocale } from "@/lib/locale";
import { getPublicServices } from "@/lib/public-api";
import { idFromSlug } from "@/lib/slug";
import type { Service } from "@/lib/types";

export const revalidate = 300;

async function findService(slug: string): Promise<Service | null> {
  const locale = await getServerLocale();
  const result = await getPublicServices(locale);
  if (!result.ok) return null;
  const id = idFromSlug(slug);
  return result.data.find((service) => service.id === id) ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = await findService(slug);
  return { title: service?.name ?? "Service" };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = await findService(slug);
  if (!service) notFound();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <PublicHeader />
      <section className="mx-auto max-w-3xl px-6 py-16">
        <Link href="/services" className="text-sm font-semibold text-primary">
          ← Services
        </Link>
        {service.category?.name && (
          <div className="mt-6">
            <Badge variant="outline" className="border-primary/30 bg-primary/5 text-primary">
              {service.category.name}
            </Badge>
          </div>
        )}
        <h1 className="mt-4 font-serif text-5xl leading-tight">{service.name}</h1>
        {service.description && (
          <p className="mt-6 text-lg leading-8 text-muted-foreground">{service.description}</p>
        )}
        <p className="mt-8 text-2xl font-semibold text-primary">
          From {formatMoney(service.basePrice)}
        </p>
        <Link
          href="/services#calculator"
          className="mt-8 inline-block rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
        >
          Build an estimate
        </Link>
      </section>
      <PublicFooter />
    </main>
  );
}
