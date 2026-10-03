import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#f7f3eb] text-[#203a3a]">
      <PublicHeader />
      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[.9fr_1.1fr]">
        <div>
          <p className="text-sm font-bold uppercase tracking-[.18em] text-[#bb6b36]">
            Contact
          </p>
          <h1 className="mt-3 font-serif text-5xl leading-tight">
            Let us make the next step clear.
          </h1>
          <p className="mt-6 text-lg leading-8 text-[#53605d]">
            Tell us what your project needs. Our team can help you choose a
            service, prepare a quotation, or organize your compliance documents.
          </p>
          <div className="mt-10 space-y-4 text-sm">
            <p className="flex items-center gap-3">
              <Mail className="text-[#bb6b36]" size={18} />{" "}
              hello@constdoc.example
            </p>
            <p className="flex items-center gap-3">
              <Phone className="text-[#bb6b36]" size={18} /> +92 300 0000000
            </p>
          </div>
        </div>
        <div className="border border-[#203a3a]/10 bg-white p-8">
          <h2 className="font-serif text-3xl">Start online</h2>
          <p className="mt-3 leading-7 text-[#53605d]">
            Create an account to save quotations, upload documents, and track
            review progress.
          </p>
          <Link
            href="/register"
            className="mt-7 inline-flex bg-[#203a3a] px-6 py-3 font-semibold text-white"
          >
            Create customer account
          </Link>
        </div>
      </section>
      <PublicFooter />
    </main>
  );
}
