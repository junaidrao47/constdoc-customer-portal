"use client";

import { FileStack, UploadCloud, Landmark, FileCheck2 } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { useLocale } from "@/lib/use-locale";
import { t } from "@/lib/messages";

const ICONS = [FileStack, UploadCloud, Landmark, FileCheck2];

/** The 4-step "how it works" sequence. Numbered because the order is real information. */
export function HowItWorks() {
  const locale = useLocale();
  const steps = [
    { t: t(locale, "home.how.s1t"), b: t(locale, "home.how.s1b") },
    { t: t(locale, "home.how.s2t"), b: t(locale, "home.how.s2b") },
    { t: t(locale, "home.how.s3t"), b: t(locale, "home.how.s3b") },
    { t: t(locale, "home.how.s4t"), b: t(locale, "home.how.s4b") },
  ];

  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <Reveal>
        <p className="eyebrow text-xs text-primary">{t(locale, "home.how.eyebrow")}</p>
        <h2 className="heading mt-2 text-4xl sm:text-5xl">{t(locale, "home.how.title")}</h2>
      </Reveal>
      <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, i) => {
          const Icon = ICONS[i];
          return (
            <Reveal key={step.t} delay={i * 80}>
              <li className="relative flex h-full flex-col rounded-xl border border-border bg-card p-6 shadow-[var(--elev-1)]">
                <div className="flex items-center justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-md bg-accent/10 text-accent">
                    <Icon size={22} strokeWidth={1.75} />
                  </span>
                  <span className="heading text-5xl leading-none text-border">{i + 1}</span>
                </div>
                <h3 className="heading mt-5 text-xl">{step.t}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.b}</p>
              </li>
            </Reveal>
          );
        })}
      </ol>
    </section>
  );
}
