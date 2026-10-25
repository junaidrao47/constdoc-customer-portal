"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { useLocale } from "@/lib/use-locale";

interface SiteConfig {
  offerBar: { enabled: boolean; textEn: string; textEs: string; link: string };
}

/**
 * Admin-toggled announcement bar, shown above the public navigation. Visibility and copy
 * are controlled from the admin Settings page (app_settings → `/public/site-config`); this
 * renders nothing until an admin enables it with a message. It is not sticky, so it scrolls
 * away while the navbar below stays pinned.
 */
export function OfferBar() {
  const locale = useLocale();
  const { data } = useQuery({
    queryKey: ["public-site-config"],
    queryFn: () => apiRequest<SiteConfig>("/public/site-config"),
    staleTime: 5 * 60 * 1000,
  });

  const bar = data?.offerBar;
  if (!bar?.enabled) return null;
  const text = locale === "en" ? bar.textEn : bar.textEs;
  if (!text.trim()) return null;

  const body = (
    <span className="inline-flex items-center justify-center gap-1.5">
      {text}
      {bar.link && <ArrowRight className="size-3.5" aria-hidden />}
    </span>
  );

  return (
    <div className="bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-6 py-2 text-center text-sm font-medium">
        {bar.link ? (
          bar.link.startsWith("/") ? (
            <Link href={bar.link} className="transition hover:underline">
              {body}
            </Link>
          ) : (
            <a href={bar.link} className="transition hover:underline" target="_blank" rel="noreferrer">
              {body}
            </a>
          )
        ) : (
          body
        )}
      </div>
    </div>
  );
}
