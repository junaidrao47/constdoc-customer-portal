import { ShieldCheck } from "lucide-react";
import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#f7f3eb] text-[#203a3a]">
      <PublicHeader />
      <section className="mx-auto max-w-4xl px-6 py-20">
        <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[.18em] text-[#bb6b36]">
          <ShieldCheck size={16} /> About ConstDoc
        </p>
        <h1 className="mt-4 font-serif text-5xl leading-tight sm:text-6xl">
          Compliance work should feel clear, accountable, and ready.
        </h1>
        <div className="mt-10 grid gap-8 text-lg leading-8 text-[#53605d] md:grid-cols-2">
          <p>
            ConstDoc brings services, quotations, documents, approvals, and renewal milestones into
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
