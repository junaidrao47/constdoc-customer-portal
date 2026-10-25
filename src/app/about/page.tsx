import type { Metadata } from "next";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";
import { aboutImage } from "@/data/site-images";

export const metadata: Metadata = {
  title: "Quiénes somos",
  description:
    "Conoce a Grupo G2H · Servicios Integrales: gestionamos permisos y documentos de cumplimiento ante el gobierno en México, de principio a fin.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <PublicHeader />
      <section className="mx-auto max-w-4xl px-6 py-20">
        <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[.18em] text-primary">
          <ShieldCheck size={16} /> About Grupo G2H
        </p>
        <h1 className="mt-4 font-serif text-5xl leading-tight sm:text-6xl">
          Compliance work should feel clear, accountable, and ready.
        </h1>
        {aboutImage && (
          <div className="relative mt-10 aspect-[16/7] w-full overflow-hidden rounded-[20px] shadow-[var(--elev-3)]">
            <Image
              src={aboutImage}
              alt="Recepción corporativa moderna de Grupo G2H"
              fill
              sizes="(max-width: 768px) 100vw, 896px"
              className="object-cover"
              priority={false}
            />
          </div>
        )}
        <div className="mt-10 grid gap-8 text-lg leading-8 text-muted-foreground md:grid-cols-2">
          <p>
            Grupo G2H brings services, quotations, documents, approvals, and renewal milestones into
            one dependable workspace for construction teams.
          </p>
          <p>
            Our approach keeps every handoff visible: customers know what is needed, staff know what
            to review, and managers have a reliable record of progress.
          </p>
        </div>
      </section>
      <PublicFooter />
    </main>
  );
}
