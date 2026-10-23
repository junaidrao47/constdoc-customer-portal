import type { Locale } from "./messages";

export const LOCALE_COOKIE = "locale";
export const DEFAULT_LOCALE: Locale = "es";

export function normalizeLocale(value: string | undefined | null): Locale {
  return value === "en" ? "en" : "es";
}

/** Server components: the active locale from the cookie (Next 16 `cookies()` is async). */
export async function getServerLocale(): Promise<Locale> {
  const { cookies } = await import("next/headers");
  const store = await cookies();
  return normalizeLocale(store.get(LOCALE_COOKIE)?.value);
}

/** Client: the active locale read from `document.cookie` (defaults to es on the server). */
export function readClientLocale(): Locale {
  if (typeof document === "undefined") return DEFAULT_LOCALE;
  const match = document.cookie.match(/(?:^|;\s*)locale=(en|es)\b/);
  return normalizeLocale(match?.[1]);
}

/** The BCP-47 value for the `Accept-Language` header the API localizes on. */
export function acceptLanguage(locale: Locale): string {
  return locale === "en" ? "en" : "es-MX";
}
