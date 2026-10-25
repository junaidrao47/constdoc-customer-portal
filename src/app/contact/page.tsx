import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Contacta a Grupo G2H · Servicios Integrales. Escríbenos tu consulta sobre permisos, documentos y trámites de cumplimiento en México.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <PublicHeader />

      {/* Page intro */}
      <section className="border-b border-border bg-paper">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <p className="text-sm font-bold uppercase tracking-[.18em] text-primary">Contact us</p>
          <h1 className="mt-3 max-w-3xl font-serif text-5xl leading-tight sm:text-6xl">
            Let us make the next step clear.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            Tell us what your project needs. Our team can help you choose a service, prepare a
            quotation, or organize your compliance documents.
          </p>
        </div>
      </section>

      {/* Form + aside */}
      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.4fr_.8fr]">
        <div>
          <h2 className="mb-5 font-serif text-3xl">Send us a message</h2>
          <ContactForm />
        </div>

        <aside className="flex flex-col gap-8">
          <div className="border border-border bg-card p-8">
            <h3 className="font-serif text-2xl">Reach us directly</h3>
            <div className="mt-6 space-y-5 text-sm">
              <a
                href="mailto:contacto@grupog2h.com"
                className="flex items-start gap-3 hover:text-primary"
              >
                <Mail className="mt-0.5 shrink-0 text-primary" size={18} />
                <span>contacto@grupog2h.com</span>
              </a>
              <a href="tel:+5215512345678" className="flex items-start gap-3 hover:text-primary">
                <Phone className="mt-0.5 shrink-0 text-primary" size={18} />
                <span>+52 55 1234 5678</span>
              </a>
              <p className="flex items-start gap-3">
                <MapPin className="mt-0.5 shrink-0 text-primary" size={18} />
                <span>Ciudad de México · Monterrey · Guadalajara</span>
              </p>
            </div>
          </div>

          <div className="border border-border bg-ink p-8 text-paper">
            <p className="text-xs font-bold uppercase tracking-[.18em] text-paper/60">
              Already know what you need?
            </p>
            <h3 className="mt-3 font-serif text-2xl">Start online</h3>
            <p className="mt-3 leading-7 text-paper/75">
              Create an account to save quotations, upload documents, and track review progress.
            </p>
            <Link
              href="/register"
              className="mt-6 inline-flex items-center gap-2 bg-accent px-6 py-3 text-sm font-semibold text-paper hover:bg-accent-hover"
            >
              Create customer account
              <ArrowRight size={16} />
            </Link>
          </div>
        </aside>
      </section>

      <PublicFooter />
    </main>
  );
}
