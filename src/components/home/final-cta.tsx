"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/lib/use-locale";
import { t } from "@/lib/messages";

export function FinalCta() {
  const locale = useLocale();
  return (
    <section
      className="blueprint-grid"
      style={{ background: "linear-gradient(120deg, #15171a 0%, #2b2f33 70%, #5a2d0e 100%)" }}
    >
      <div className="mx-auto max-w-7xl px-6 py-20 text-paper">
        <Reveal>
          <div className="max-w-2xl">
            <h2 className="heading text-4xl leading-tight sm:text-5xl">{t(locale, "home.final.title")}</h2>
            <p className="mt-5 max-w-xl text-lg leading-8 text-paper/80">{t(locale, "home.final.body")}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/register">
                  {t(locale, "home.final.primary")} <ArrowRight size={17} />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/30 bg-white/5 text-paper hover:bg-white/15 hover:text-paper"
              >
                <Link href="/services#calculator">{t(locale, "home.final.secondary")}</Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
