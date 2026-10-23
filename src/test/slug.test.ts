import { describe, expect, it } from "vitest";
import { idFromSlug, slugify, toSlug } from "@/lib/slug";

const ID = "11111111-2222-4333-8444-555555555555";

describe("slug helpers", () => {
  it("builds a readable slug with the id at the tail", () => {
    expect(toSlug("Compliance Review", ID)).toBe(`compliance-review-${ID}`);
  });

  it("strips accents and punctuation", () => {
    expect(slugify("Gestión de Permisos (CDMX)")).toBe("gestion-de-permisos-cdmx");
  });

  it("recovers the id from a slug regardless of the name prefix or locale", () => {
    expect(idFromSlug(`compliance-review-${ID}`)).toBe(ID);
    expect(idFromSlug(`revision-de-cumplimiento-${ID}`)).toBe(ID);
  });

  it("falls back to the raw value when there is no id tail", () => {
    expect(idFromSlug(ID)).toBe(ID);
    expect(toSlug("", ID)).toBe(ID);
  });
});
