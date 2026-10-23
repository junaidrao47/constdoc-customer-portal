/**
 * Services and packages have no slug in the API and no single-item endpoint, so detail
 * pages carry a readable-but-stable slug of `slugify(name)-<id>`. The trailing id is the
 * only part that resolves the item; the name prefix is cosmetic and may change with the
 * locale, which is exactly why it is not what we look the item up by.
 */

const UUID_TAIL = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function toSlug(name: string, id: string): string {
  const prefix = slugify(name);
  return prefix ? `${prefix}-${id}` : id;
}

/** The id embedded at the tail of a slug, or the whole value when it is already an id. */
export function idFromSlug(slug: string): string {
  const match = slug.match(UUID_TAIL);
  return match ? match[0] : slug;
}
