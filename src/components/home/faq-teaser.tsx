"use client";

import Link from "next/link";
import { ArrowRight, HelpCircle } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/lib/use-locale";
import { t } from "@/lib/messages";

export function FaqTeaser() {
  const locale = useLocale();
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <Reveal>
        <div className="flex flex-col items-start gap-6 rounded-[20px] border border-border bg-card p-8 shadow-[var(--elev-1)] sm:flex-row sm:items-center sm:justify-between sm:p-10">
          <div className="max-w-xl">
            <p className="eyebrow flex items-center gap-2 text-xs text-primary">
              <HelpCircle size={15} /> {t(locale, "home.faq.eyebrow")}
            </p>
            <h2 className="heading mt-3 text-3xl sm:text-4xl">{t(locale, "home.faq.title")}</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{t(locale, "home.faq.body")}</p>
          </div>
          <Button asChild size="lg" variant="outline">
            <Link href="/faq">
              {t(locale, "home.faq.cta")} <ArrowRight size={16} />
            </Link>
          </Button>
        </div>
      </Reveal>
    </section>
  );
}
