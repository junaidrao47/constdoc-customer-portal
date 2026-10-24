"use client";

import { AnimatedCounter } from "@/components/animated-counter";
import { Reveal } from "@/components/reveal";
import { useLocale } from "@/lib/use-locale";
import { t } from "@/lib/messages";

/** Stats band on dark ink + blueprint grid, with count-up numbers. */
export function StatsBand() {
  const locale = useLocale();
  const stats = [
    { value: 60, suffix: "+", label: t(locale, "home.stats.l1") },
    { value: 1200, suffix: "+", label: t(locale, "home.stats.l2") },
    { value: 14, suffix: "", label: t(locale, "home.stats.l3") },
  ];

  return (
    <section className="blueprint-grid bg-ink text-paper">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <Reveal>
          <h2 className="heading text-3xl sm:text-4xl">{t(locale, "home.stats.title")}</h2>
        </Reveal>
        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 80}>
              <div className="border-l-2 border-accent pl-5">
                <AnimatedCounter
                  value={s.value}
                  suffix={s.suffix}
                  className="heading block text-5xl sm:text-6xl text-paper"
                />
                <p className="mt-2 text-sm text-paper/70">{s.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
