import { cn } from "@/lib/utils";

/**
 * Grupo G2H brand mark — the isometric 3-D cube, vectorised from the original logo.
 * Three flat tones carry the 3-D read: a light face, a mid face, and the ink letter
 * cut-outs (C / H / 2). Transparent background, so it never shows a "box" on any surface.
 *
 * `tone` swaps the palette for the surface it sits on:
 *   - "light"  → steel / graphite / ink   (concrete + white headers)
 *   - "dark"   → paper / steel / slate     (the ink footer)
 */

const VB = { w: 357, h: 387 };

const MARK = {
  light:
    "M206,3 205,101 156,125 146,103 51,150 54,247 150,211 149,186 100,206 98,165 205,120 206,248 4,328 108,380 292,380 356,364 356,159 291,94 269,100 269,70Z",
  mid:
    "M352,364 289,313 289,234 270,214 266,292 204,250 6,325 110,380 290,380Z M205,102 156,126 150,125 149,104 52,150 52,246 149,211 149,187 99,207 97,166 204,119Z M288,94 269,105 269,161 268,162 268,174 286,192 290,193 291,192 291,180 290,179 290,94Z",
  dark:
    "M288,233 269,216 267,296 219,312 198,304 96,341 178,380 213,380 281,360 264,346 212,362 193,349 192,344 286,313Z M205,103 154,127 149,126 148,105 144,105 53,150 52,246 148,211 148,188 99,207 96,166 205,118Z M287,95 270,104 269,175 287,192 290,192 289,95Z",
} as const;

type Tone = "light" | "dark";

const TONES: Record<Tone, { c1: string; c2: string; c3: string }> = {
  // light face / mid face / letter cut-outs
  light: { c1: "#8a9099", c2: "#4a5057", c3: "#15171a" },
  dark: { c1: "#e9e7e3", c2: "#aeb4bb", c3: "#6c727a" },
};

export function BrandMark({
  tone = "light",
  className,
  animated = false,
  title = "Grupo G2H",
}: {
  tone?: Tone;
  className?: string;
  /** adds per-face classes so the loader CSS can animate the three faces */
  animated?: boolean;
  title?: string;
}) {
  const c = TONES[tone];
  return (
    <svg
      viewBox={`0 0 ${VB.w} ${VB.h}`}
      className={cn("block", className)}
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d={MARK.light} fill={c.c1} fillRule="evenodd" className={animated ? "mk-f1" : undefined} />
      <path d={MARK.mid} fill={c.c2} fillRule="evenodd" className={animated ? "mk-f2" : undefined} />
      <path d={MARK.dark} fill={c.c3} fillRule="evenodd" className={animated ? "mk-f3" : undefined} />
    </svg>
  );
}

/**
 * Full horizontal lockup: cube mark + "GRUPO G2H / Servicios Integrales" wordmark,
 * set in the heading face (Roboto Condensed) to echo the original type.
 */
export function BrandLogo({
  tone = "light",
  className,
  markClassName,
}: {
  tone?: Tone;
  className?: string;
  markClassName?: string;
}) {
  const word = tone === "dark" ? "text-paper" : "text-ink";
  const sub = tone === "dark" ? "text-paper/55" : "text-muted-foreground";
  // The whole lockup scales with font-size: the mark is sized in em and the two
  // wordmark lines are em-relative, so a single `text-[…px]` on the root scales it all.
  return (
    <span className={cn("inline-flex items-center gap-[0.55em] text-[17px]", className)}>
      <BrandMark tone={tone} className={cn("h-[2.3em] w-auto shrink-0", markClassName)} />
      <span className="flex flex-col justify-center leading-none">
        <span className={cn("heading text-[1.25em] leading-[0.92] tracking-[0.015em]", word)}>
          GRUPO G2H
        </span>
        <span className={cn("eyebrow mt-[0.32em] text-[0.56em] leading-none", sub)}>
          Servicios Integrales
        </span>
      </span>
    </span>
  );
}
