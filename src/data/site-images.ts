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
export const heroImage: string | null = null;

export const AVAILABLE_CATEGORY_IMAGES: readonly string[] = [];

export function categoryImage(slug?: string | null): string | null {
  return slug && AVAILABLE_CATEGORY_IMAGES.includes(slug) ? `/images/category-${slug}.jpg` : null;
}
