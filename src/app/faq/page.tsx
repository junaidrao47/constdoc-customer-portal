import type { Metadata } from "next";
import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";

export const metadata: Metadata = {
  title: "Preguntas frecuentes",
  description:
    "Preguntas frecuentes sobre cotizaciones, carga de documentos, fases de aprobación y descargas en Grupo G2H · Servicios Integrales.",
  alternates: { canonical: "/faq" },
};

const questions = [
  {
    question: "How do I get a quotation?",
    answer:
      "Use the pricing calculator with your industry, location, and team size. Create an account to save and manage the estimate.",
  },
  {
    question: "How are documents reviewed?",
    answer:
      "Upload your compliance files through the customer portal. Assigned staff review them and update the status so you always know what needs attention.",
  },
  {
    question: "Can I track expiry dates?",
    answer:
      "Yes. Documents and quotations carry status and expiry information, with renewal reminders planned through the platform.",
  },
  {
    question: "Can I change a saved quotation?",
    answer:
      "A saved quotation preserves the pricing snapshot used at the time it was created. You can create a new estimate when your requirements change.",
  },
];

export default function FaqPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <PublicHeader />
      <section className="mx-auto max-w-4xl px-6 py-20">
        <p className="text-sm font-bold uppercase tracking-[.18em] text-primary">FAQ</p>
        <h1 className="mt-3 font-serif text-5xl">Common questions, answered.</h1>
        <div className="mt-10 space-y-4">
          {questions.map((item) => (
            <details key={item.question} className="border border-border bg-card p-6">
              <summary className="cursor-pointer font-serif text-xl">{item.question}</summary>
              <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>
      <PublicFooter />
    </main>
  );
}
