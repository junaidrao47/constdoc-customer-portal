"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resolveImageUrl } from "@/lib/media";
import type { HeroPayload, HeroSlide, HeroTransition } from "@/lib/public-api";

/** Off-screen transform/opacity for each transition style (opacity/transform only — no layout). */
function hiddenStyle(transition: HeroTransition, isPrevious: boolean): React.CSSProperties {
  if (transition === "zoom") return { opacity: 0, transform: "scale(1.06)" };
  if (transition === "slide") return { opacity: 0, transform: `translateX(${isPrevious ? "-6%" : "6%"})` };
  return { opacity: 0 };
}

/**
 * Public homepage hero carousel.
 *
 * Reads slides + settings from GET /public/hero. Autoplays with each slide's own duration and
 * the configured transition (opacity/transform only, GPU-friendly), pauses on hover/focus and
 * via a visible button, supports arrow keys, dots and touch swipe, and respects
 * prefers-reduced-motion (no autoplay, no transition). The first image is eager + high
 * priority; the rest are lazy. The section has a fixed min-height so there is zero layout shift.
 */
export function HeroCarousel({ data }: { data: HeroPayload }) {
  const { slides, settings } = data;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const prevIndex = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const count = slides.length;
  const go = useCallback(
    (next: number) => {
      prevIndex.current = index;
      setIndex(((next % count) + count) % count);
    },
    [index, count],
  );

  const autoplayOn = settings.autoplay && !paused && !reducedMotion && count > 1;

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (!autoplayOn) return;
    const duration = slides[index]?.durationMs ?? settings.defaultDurationMs;
    timer.current = setTimeout(() => {
      prevIndex.current = index;
      setIndex((i) => (settings.loop ? (i + 1) % count : Math.min(i + 1, count - 1)));
    }, duration);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [autoplayOn, index, slides, settings.defaultDurationMs, settings.loop, count]);

  // Touch swipe.
  const touchX = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    touchX.current = e.touches[0]?.clientX ?? null;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current === null) return;
    const delta = (e.changedTouches[0]?.clientX ?? touchX.current) - touchX.current;
    if (Math.abs(delta) > 40) go(index + (delta < 0 ? 1 : -1));
    touchX.current = null;
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(index + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(index - 1);
    }
  };

  const transitionMs = reducedMotion ? 0 : settings.transitionMs;

  return (
    <section
      role="region"
      aria-roledescription="carousel"
      aria-label="Grupo G2H highlights"
      tabIndex={0}
      onKeyDown={onKeyDown}
      onMouseEnter={() => settings.pauseOnHover && setPaused(true)}
      onMouseLeave={() => settings.pauseOnHover && setPaused(false)}
      onFocus={() => settings.pauseOnHover && setPaused(true)}
      onBlur={(e) => settings.pauseOnHover && !e.currentTarget.contains(e.relatedTarget as Node) && setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      className="relative isolate flex min-h-[640px] items-center overflow-hidden outline-none lg:min-h-[86vh]"
      style={{ fontSize: `${settings.baseTextScale}rem` }}
    >
      {/* brand gradient fallback, always present behind the slides */}
      <div
        aria-hidden
        className="blueprint-grid absolute inset-0 -z-20"
        style={{ background: "linear-gradient(135deg, #15171a 0%, #2b2f33 55%, #3a2410 100%)" }}
      />

      {slides.map((slide, i) => (
        <Slide
          key={slide.id}
          slide={slide}
          active={i === index}
          isPrevious={i === prevIndex.current}
          eager={i === 0}
          transitionMs={transitionMs}
          durationMs={slide.durationMs ?? settings.defaultDurationMs}
          reducedMotion={reducedMotion}
          headingFont={settings.headingFont}
          bodyFont={settings.bodyFont}
        />
      ))}

      {/* polite announcement, silenced while autoplay is running (per WAI-ARIA APG) */}
      <p className="sr-only" aria-live={autoplayOn ? "off" : "polite"}>
        Slide {index + 1} of {count}
      </p>

      {count > 1 && (
        <>
          <CarouselButton className="left-3" label="Previous slide" onClick={() => go(index - 1)}>
            <ChevronLeft size={20} />
          </CarouselButton>
          <CarouselButton className="right-3" label="Next slide" onClick={() => go(index + 1)}>
            <ChevronRight size={20} />
          </CarouselButton>

          <div className="absolute inset-x-0 bottom-6 z-10 flex items-center justify-center gap-3">
            <button
              type="button"
              aria-label={paused ? "Play carousel" : "Pause carousel"}
              onClick={() => setPaused((p) => !p)}
              className="grid h-8 w-8 place-items-center rounded-full bg-black/40 text-white backdrop-blur hover:bg-black/60"
            >
              {paused || !settings.autoplay ? <Play size={14} /> : <Pause size={14} />}
            </button>
            <div className="flex gap-2">
              {slides.map((slide, i) => (
                <button
                  key={slide.id}
                  type="button"
                  aria-label={`Go to slide ${i + 1}`}
                  aria-current={i === index}
                  onClick={() => go(i)}
                  className={`h-2 rounded-full transition-all ${i === index ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/80"}`}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
}

function Slide({
  slide,
  active,
  isPrevious,
  eager,
  transitionMs,
  durationMs,
  reducedMotion,
  headingFont,
  bodyFont,
}: {
  slide: HeroSlide;
  active: boolean;
  isPrevious: boolean;
  eager: boolean;
  transitionMs: number;
  durationMs: number;
  reducedMotion: boolean;
  headingFont: string;
  bodyFont: string;
}) {
  // Ken Burns: the active image slowly zooms in over its full display time (plus the
  // outgoing transition), anchored on the focal point. Disabled for reduced-motion.
  const kenBurns = active && !reducedMotion;
  const textShadow = "0 2px 14px rgba(0,0,0,0.55), 0 1px 3px rgba(0,0,0,0.4)";
  return (
    <div
      role="group"
      aria-roledescription="slide"
      aria-hidden={!active}
      className="absolute inset-0 -z-10"
      style={{
        transition: `opacity ${transitionMs}ms ease, transform ${transitionMs}ms ease`,
        ...(active ? { opacity: 1, transform: "none" } : hiddenStyle(slide.transition, isPrevious)),
        pointerEvents: active ? undefined : "none",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={resolveImageUrl(slide.imageUrl) ?? ""}
        alt={slide.alt ?? ""}
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : "low"}
        decoding="async"
        sizes="100vw"
        className="absolute inset-0 h-full w-full object-cover"
        style={{
          objectPosition: `${slide.focalX}% ${slide.focalY}%`,
          transformOrigin: `${slide.focalX}% ${slide.focalY}%`,
          animation: kenBurns ? `kenburns ${durationMs + transitionMs}ms ease-out both` : undefined,
        }}
      />
      {/* legibility overlay (admin-controlled strength) */}
      <div aria-hidden className="absolute inset-0 bg-black" style={{ opacity: slide.overlayOpacity }} />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ background: "linear-gradient(90deg, rgba(8,9,11,0.82) 0%, rgba(8,9,11,0.55) 34%, rgba(8,9,11,0.15) 68%, rgba(8,9,11,0) 100%)" }}
      />

      <div className="relative mx-auto flex h-full max-w-7xl items-center px-6">
        <div className="max-w-2xl text-paper">
          {slide.headline && (
            <h1
              className="text-4xl leading-[1.04] sm:text-6xl lg:text-7xl"
              style={{ fontFamily: `'${headingFont}', var(--font-heading-face), sans-serif`, fontWeight: 700, textShadow }}
            >
              {slide.headline}
            </h1>
          )}
          {slide.subheadline && (
            <p
              className="mt-6 max-w-xl text-lg leading-8 text-paper/90"
              style={{ fontFamily: `'${bodyFont}', var(--font-body), sans-serif`, textShadow }}
            >
              {slide.subheadline}
            </p>
          )}
          {slide.ctaLabel && slide.ctaUrl && (
            <div className="mt-9">
              <Button asChild size="lg" tabIndex={active ? 0 : -1}>
                <Link href={slide.ctaUrl}>{slide.ctaLabel}</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CarouselButton({
  className,
  label,
  onClick,
  children,
}: {
  className: string;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`absolute top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/35 text-white backdrop-blur transition-colors hover:bg-black/60 ${className}`}
    >
      {children}
    </button>
  );
}
