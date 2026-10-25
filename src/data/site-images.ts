/**
 * Which photos the client has added under `public/images/`.
 *
 * ADAPTER — the image files do not exist in the repo yet, so every entry is "absent" and the
 * UI shows its gradient / icon fallback with no broken-image requests. When the files land at
 * the documented paths, flip the flags:
 *   - hero:     set `heroImage` to "/images/hero.jpg"
 *   - category: add the category slug to `AVAILABLE_CATEGORY_IMAGES` (file `/images/category-<slug>.jpg`)
 * Nothing else needs to change; <Hero/> and the cards read these.
 */
export const heroImage: string | null = "/images/hero.jpg";

/** Banner for the "Quiénes somos" / About page. */
export const aboutImage: string | null = "/images/about.jpg";

/**
 * Category slugs that have a staged photo at `/images/category-<slug>.jpg`. These match the
 * PROPOSAL category slugs in docs/research/market-notes.md; the images light up automatically
 * once the demo seed (W1) creates categories with these slugs. Credits: public/images/_credits.json.
 */
export const AVAILABLE_CATEGORY_IMAGES: readonly string[] = [
  "fiscal",
  "laboral",
  "ambiental",
  "licencias",
  "apertura",
];

export function categoryImage(slug?: string | null): string | null {
  return slug && AVAILABLE_CATEGORY_IMAGES.includes(slug) ? `/images/category-${slug}.jpg` : null;
}
