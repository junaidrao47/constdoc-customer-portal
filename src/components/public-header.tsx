"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { useLocale, setLocaleCookie } from "@/lib/use-locale";
import { t, type Locale } from "@/lib/messages";
import type { CategoryWithCount } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { BrandLogo } from "@/components/brand-logo";
import { OfferBar } from "@/components/offer-bar";
import { cn } from "@/lib/utils";

function useCategories() {
  return useQuery({
    queryKey: ["public-categories-nav"],
    queryFn: () => apiRequest<CategoryWithCount[]>("/public/categories"),
    staleTime: 5 * 60 * 1000,
  });
}

function LanguageSwitcher({ locale }: { locale: Locale }) {
  const router = useRouter();
  const client = useQueryClient();
  function setLocale(next: Locale) {
    if (next === locale) return;
    setLocaleCookie(next);
    void client.invalidateQueries();
    router.refresh();
  }
  return (
    <div className="flex items-center gap-0.5 text-sm" role="group" aria-label="Language">
      {(["es", "en"] as const).map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLocale(code)}
          aria-pressed={locale === code}
          className={cn(
            "rounded px-2 py-1 uppercase transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            locale === code ? "font-semibold text-accent" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {code}
        </button>
      ))}
    </div>
  );
}

export function PublicHeader() {
  const locale = useLocale();
  const categories = useCategories();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "/services", label: t(locale, "nav.services") },
    { href: "/packages", label: t(locale, "nav.packages") },
    { href: "/about", label: t(locale, "nav.about") },
    { href: "/contact", label: t(locale, "nav.contact") },
    { href: "/faq", label: t(locale, "nav.faq") },
  ];
  const cats = categories.data ?? [];
  const countOf = (c: CategoryWithCount) => (c.serviceCount ?? 0) + (c.packageCount ?? 0);

  return (
    <>
      <OfferBar />
      <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-border bg-background/80 shadow-[var(--elev-1)] backdrop-blur-md"
          : "border-b border-transparent bg-background",
      )}
    >
      <nav
        className={cn(
          "mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 transition-all duration-300",
          scrolled ? "py-3" : "py-5",
        )}
      >
        <Link href="/" aria-label="Grupo G2H — home" className="flex items-center">
          <BrandLogo
            tone="light"
            className={cn("transition-all duration-300", scrolled ? "text-[15px]" : "text-[17px]")}
          />
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-5 text-sm lg:flex">
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center gap-1 outline-none transition-colors hover:text-accent focus-visible:text-accent">
              {t(locale, "nav.categories")}
              <ChevronDown size={15} />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[min(92vw,560px)] p-3">
              {cats.length === 0 ? (
                <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                  {categories.isLoading ? t(locale, "state.loading") : "—"}
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-1">
                  {cats.map((category) => (
                    <Link
                      key={category.id}
                      href={`/services?category=${encodeURIComponent(category.slug)}`}
                      className="flex items-center justify-between gap-3 rounded-md px-3 py-2.5 text-sm transition-colors hover:bg-muted"
                    >
                      <span className="font-medium">{category.name}</span>
                      <span className="rounded-full bg-muted px-2 text-xs text-muted-foreground">
                        {countOf(category)}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-accent">
              {link.label}
            </Link>
          ))}
          <LanguageSwitcher locale={locale} />
          <Button asChild variant="outline" size="sm">
            <Link href="/services#calculator">{t(locale, "nav.requestQuote")}</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/login">{t(locale, "nav.portal")}</Link>
          </Button>
        </div>

        {/* Mobile */}
        <div className="flex items-center gap-2 lg:hidden">
          <LanguageSwitcher locale={locale} />
          <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
            <SheetTrigger
              aria-label={t(locale, "nav.menu")}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border"
            >
              <Menu size={18} />
            </SheetTrigger>
            <SheetContent className="w-80 overflow-y-auto">
              <SheetHeader>
                <SheetTitle className="heading">{t(locale, "nav.menu")}</SheetTitle>
              </SheetHeader>
              <div className="grid gap-1 px-4 pb-6">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setDrawerOpen(false)}
                    className="rounded-md px-2 py-3 text-base hover:bg-muted"
                  >
                    {link.label}
                  </Link>
                ))}
                {cats.length > 0 && (
                  <div className="mt-2 border-t border-border pt-2">
                    <p className="eyebrow px-2 py-2 text-xs text-muted-foreground">
                      {t(locale, "nav.categories")}
                    </p>
                    {cats.map((category) => (
                      <Link
                        key={category.id}
                        href={`/services?category=${encodeURIComponent(category.slug)}`}
                        onClick={() => setDrawerOpen(false)}
                        className="flex items-center justify-between rounded-md px-2 py-2.5 text-sm text-muted-foreground hover:bg-muted"
                      >
                        {category.name}
                        <span className="text-xs">{countOf(category)}</span>
                      </Link>
                    ))}
                  </div>
                )}
                <Button asChild variant="outline" className="mt-3 w-full">
                  <Link href="/services#calculator" onClick={() => setDrawerOpen(false)}>
                    {t(locale, "nav.requestQuote")}
                  </Link>
                </Button>
                <Button asChild className="mt-2 w-full">
                  <Link href="/login" onClick={() => setDrawerOpen(false)}>
                    {t(locale, "nav.portal")}
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
      </header>
    </>
  );
}
