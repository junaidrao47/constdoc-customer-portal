"use client";

import { useSyncExternalStore } from "react";
import { DEFAULT_LOCALE, LOCALE_COOKIE, readClientLocale } from "./locale";
import type { Locale } from "./messages";

/**
 * Reactive locale, read from the `locale` cookie.
 *
 * `useSyncExternalStore` is the right tool here: it renders `getServerSnapshot`
 * (the default) during SSR and hydration, then swaps to the cookie value on the client
 * without a hydration mismatch — and without a `setState`-in-effect that the React 19
 * lint rules (rightly) reject.
 */
const listeners = new Set<() => void>();

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getSnapshot(): Locale {
  return readClientLocale();
}

function getServerSnapshot(): Locale {
  return DEFAULT_LOCALE;
}

/** Persists the chosen locale and notifies every `useLocale` subscriber. */
export function setLocaleCookie(next: Locale): void {
  if (typeof document !== "undefined") {
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
  }
  listeners.forEach((listener) => listener());
}

export function useLocale(): Locale {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
