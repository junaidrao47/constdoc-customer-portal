"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, Menu } from "lucide-react";
import { useState } from "react";
import { apiRequest } from "@/lib/api";
import { useLocale, setLocaleCookie } from "@/lib/use-locale";
import { t, type Locale } from "@/lib/messages";
import type { CategoryWithCount } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
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
    <div className="flex items-center gap-1 text-sm" role="group" aria-label="Language">
      {(["es", "en"] as const).map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLocale(code)}
          aria-pressed={locale === code}
          className={cn(
            "rounded px-2 py-1 uppercase transition-colors",
            locale === code ? "font-semibold text-primary" : "text-muted-foreground hover:text-foreground",
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

  const links = [
    { href: "/services", label: t(locale, "nav.services") },
    { href: "/packages", label: t(locale, "nav.packages") },
    { href: "/about", label: t(locale, "nav.about") },
    { href: "/contact", label: t(locale, "nav.contact") },
    { href: "/faq", label: t(locale, "nav.faq") },
  ];
  const cats = categories.data ?? [];

  return (
    <header className="border-b border-border">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-5">
        <Link href="/" aria-label="Grupo G2H — home" className="flex items-center">
          <Image
            src="/logo.png"
            alt="Grupo G2H — Servicios Integrales"
            width={960}
            height={429}
            priority
            className="h-10 w-auto"
          />
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-5 text-sm lg:flex">
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center gap-1 outline-none transition-colors hover:text-primary focus-visible:text-primary">
              {t(locale, "nav.categories")}
              <ChevronDown size={15} />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64">
              {cats.length === 0 ? (
                <DropdownMenuItem disabled>
                  {categories.isLoading ? t(locale, "state.loading") : "—"}
                </DropdownMenuItem>
              ) : (
                cats.map((category) => (
                  <DropdownMenuItem key={category.id} asChild>
                    <Link href={`/services?category=${encodeURIComponent(category.slug)}`}>
                      {category.name}
                    </Link>
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-primary">
              {link.label}
            </Link>
          ))}
          <LanguageSwitcher locale={locale} />
          <Link
            href="/services#calculator"
            className="rounded-full border border-primary px-4 py-2 font-semibold text-primary"
          >
            {t(locale, "nav.requestQuote")}
          </Link>
          <Link
            href="/login"
            className="rounded-full bg-primary px-5 py-2.5 font-semibold text-primary-foreground"
          >
            {t(locale, "nav.portal")}
          </Link>
        </div>

        {/* Mobile */}
        <div className="flex items-center gap-2 lg:hidden">
          <LanguageSwitcher locale={locale} />
          <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
            <SheetTrigger
              aria-label={t(locale, "nav.menu")}
              className="inline-flex h-10 w-10 items-center justify-center rounded border border-border"
            >
              <Menu size={18} />
            </SheetTrigger>
            <SheetContent className="w-80 overflow-y-auto">
              <SheetHeader>
                <SheetTitle>{t(locale, "nav.menu")}</SheetTitle>
              </SheetHeader>
              <div className="grid gap-1 px-4 pb-6">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setDrawerOpen(false)}
                    className="rounded px-2 py-3 text-base hover:bg-muted"
                  >
                    {link.label}
                  </Link>
                ))}
                {cats.length > 0 && (
                  <div className="mt-2 border-t border-border pt-2">
                    <p className="px-2 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {t(locale, "nav.categories")}
                    </p>
                    {cats.map((category) => (
                      <Link
                        key={category.id}
                        href={`/services?category=${encodeURIComponent(category.slug)}`}
                        onClick={() => setDrawerOpen(false)}
                        className="rounded px-2 py-2.5 text-sm text-muted-foreground hover:bg-muted"
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                )}
                <Link
                  href="/services#calculator"
                  onClick={() => setDrawerOpen(false)}
                  className="mt-3 rounded-full border border-primary px-4 py-3 text-center font-semibold text-primary"
                >
                  {t(locale, "nav.requestQuote")}
                </Link>
                <Link
                  href="/login"
                  onClick={() => setDrawerOpen(false)}
                  className="mt-2 rounded-full bg-primary px-4 py-3 text-center font-semibold text-primary-foreground"
                >
                  {t(locale, "nav.portal")}
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
