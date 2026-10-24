"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/lib/use-locale";
import { t } from "@/lib/messages";
import { heroImage } from "@/data/site-images";

/** Hero. Full-bleed photo over a CSS gradient + blueprint-grid fallback, with a glass stat
 *  panel. Headline rises in on load; the panel gets a gentle scroll parallax (both disabled
 *  under reduced motion). If `/images/hero.jpg` is missing, the photo hides and the gradient
 *  fallback shows. */
export function Hero() {
  const locale = useLocale();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.transform = `translateY(${Math.min(window.scrollY, 400) * 0.06}px)`;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const chips = [t(locale, "home.hero.chip1"), t(locale, "home.hero.chip2"), t(locale, "home.hero.chip3")];

  return (
    <section className="relative isolate flex min-h-[640px] items-center overflow-hidden lg:min-h-[86vh]">
      {/* fallback: brand gradient + blueprint grid, always present */}
      <div
        aria-hidden
        className="blueprint-grid absolute inset-0 -z-20"
        style={{ background: "linear-gradient(135deg, #15171a 0%, #2b2f33 55%, #3a2410 100%)" }}
      />
      {/* photo layer — only when the file has been added (see data/site-images.ts) */}
      {heroImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={heroImage}
          alt=""
          aria-hidden
          className="ken-burns absolute inset-0 -z-10 h-full w-full object-cover"
        />
      )}
      {/* dark gradient overlay for legibility */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{ background: "linear-gradient(90deg, rgba(10,11,13,0.82) 0%, rgba(10,11,13,0.55) 45%, rgba(10,11,13,0.25) 100%)" }}
      />

      <div className="mx-auto grid w-full max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[1.15fr_.85fr] lg:items-center">
        <div className="max-w-2xl text-paper">
          <p className="eyebrow rise text-xs text-[#f6b38a]" style={{ animationDelay: "40ms" }}>
            {t(locale, "home.hero.eyebrow")}
          </p>
          <h1
            className="heading rise mt-5 text-4xl leading-[1.04] sm:text-6xl lg:text-7xl"
            style={{ animationDelay: "140ms" }}
          >
            {t(locale, "home.hero.title")}
          </h1>
          <p
            className="rise mt-6 max-w-xl text-lg leading-8 text-paper/80"
            style={{ animationDelay: "280ms" }}
          >
            {t(locale, "home.hero.sub")}
          </p>
          <div className="rise mt-9 flex flex-wrap gap-3" style={{ animationDelay: "420ms" }}>
            <Button asChild size="lg">
              <Link href="/services#calculator">
                {t(locale, "home.hero.calc")} <ArrowRight size={17} />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/30 bg-white/5 text-paper hover:bg-white/15 hover:text-paper"
            >
              <Link href="/register">{t(locale, "home.hero.create")}</Link>
            </Button>
          </div>
        </div>

        {/* glass stat panel — replaces the old empty card */}
        <div
          ref={panelRef}
          className="rise rounded-[20px] border border-white/15 bg-white/10 p-7 text-paper shadow-[var(--elev-4)] backdrop-blur-md"
          style={{ animationDelay: "560ms" }}
        >
          <p className="eyebrow text-[11px] text-paper/60">{t(locale, "home.hero.panelKicker")}</p>
          <p className="heading mt-3 text-2xl leading-tight">{t(locale, "home.hero.panelLine")}</p>
          <ul className="mt-6 flex flex-col gap-3">
            {chips.map((chip, i) => (
              <li
                key={chip}
                className="flex items-center gap-3 rounded-md border border-white/10 bg-white/5 px-4 py-3 text-sm"
              >
                <span className="heading grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent text-sm text-paper">
                  {i + 1}
                </span>
                {chip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
