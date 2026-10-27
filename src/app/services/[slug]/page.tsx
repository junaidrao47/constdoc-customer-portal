import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/format";
import { getServerLocale } from "@/lib/locale";
import { resolveImageUrl } from "@/lib/media";
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

  const imageSrc = resolveImageUrl(service.imageUrl);
  const whatsIncluded = service.whatsIncluded ?? [];
  const processSteps = service.processSteps ?? [];

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

        {imageSrc && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageSrc}
            alt={service.name}
            className="mt-10 aspect-[16/9] w-full rounded-2xl object-cover shadow-[var(--elev-2)]"
          />
        )}

        {whatsIncluded.length > 0 && (
          <section className="mt-14">
            <h2 className="font-serif text-3xl leading-tight">What&apos;s included</h2>
            <ul className="mt-6 grid gap-3">
              {whatsIncluded.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                    <Check size={15} strokeWidth={3} />
                  </span>
                  <span className="text-base leading-7 text-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {processSteps.length > 0 && (
          <section className="mt-14">
            <h2 className="font-serif text-3xl leading-tight">How it works</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              What happens once you purchase this service.
            </p>
            <ol className="mt-8 grid gap-6">
              {processSteps.map((step, i) => (
                <li key={i} className="flex gap-4">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {i + 1}
                  </span>
                  <div className="pt-1">
                    <p className="font-semibold leading-tight">{step.title}</p>
                    {step.description && (
                      <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{step.description}</p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        <div className="mt-14 flex flex-col gap-4 rounded-2xl border border-border bg-muted/30 p-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Starting from</p>
            <p className="text-3xl font-semibold text-primary">{formatMoney(service.basePrice)}</p>
          </div>
          <Link
            href="/services#calculator"
            className="inline-block rounded-full bg-primary px-6 py-3 text-center text-sm font-semibold text-primary-foreground"
          >
            Build an estimate
          </Link>
        </div>
      </section>
      <PublicFooter />
    </main>
  );
}
