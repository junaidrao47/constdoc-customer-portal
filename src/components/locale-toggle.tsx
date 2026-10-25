"use client";

import { useQueryClient } from "@tanstack/react-query";
import { setLocaleCookie, useLocale } from "@/lib/use-locale";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/messages";

/**
 * ES/EN switch for the authenticated area. `useLocale` is backed by a reactive store,
 * so flipping the cookie re-renders every `t(locale, …)` string immediately; invalidating
 * queries also refetches API content with the new `Accept-Language`.
 */
export function LocaleToggle({ className }: { className?: string }) {
  const locale = useLocale();
  const client = useQueryClient();

  function setLocale(next: Locale) {
    if (next === locale) return;
    setLocaleCookie(next);
    void client.invalidateQueries();
  }

  return (
    <div className={cn("flex items-center gap-0.5 text-sm", className)} role="group" aria-label="Language">
      {(["es", "en"] as const).map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLocale(code)}
          aria-pressed={locale === code}
          className={cn(
            "rounded px-2 py-1 uppercase transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            locale === code ? "font-semibold text-primary" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {code}
        </button>
      ))}
    </div>
  );
}
