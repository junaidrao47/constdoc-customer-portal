"use client";

import Link from "next/link";
import { useLocale } from "@/lib/use-locale";
import { t } from "@/lib/messages";
import { BrandLogo } from "@/components/brand-logo";

export function PublicFooter() {
  const locale = useLocale();
  const year = new Date().getFullYear();

  const explore = [
    { href: "/services", label: t(locale, "nav.services") },
    { href: "/packages", label: t(locale, "nav.packages") },
    { href: "/about", label: t(locale, "nav.about") },
    { href: "/faq", label: t(locale, "nav.faq") },
    { href: "/contact", label: t(locale, "nav.contact") },
  ];
  const legal = [
    { href: "/privacy", label: t(locale, "footer.privacy") },
    { href: "/terms", label: t(locale, "footer.terms") },
    { href: "/cookies", label: t(locale, "footer.cookies") },
  ];

  return (
    <footer className="blueprint-grid mt-auto bg-ink text-paper/70">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <BrandLogo tone="dark" className="text-[18px]" />
            <p className="mt-4 max-w-xs text-sm leading-6">{t(locale, "footer.tagline")}</p>
          </div>

          <div>
            <p className="eyebrow text-xs text-paper">{t(locale, "footer.explore")}</p>
            <ul className="mt-4 flex flex-col gap-2.5 text-sm">
              {explore.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="transition-colors hover:text-paper">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="eyebrow text-xs text-paper">{t(locale, "footer.legal")}</p>
            <ul className="mt-4 flex flex-col gap-2.5 text-sm">
              {legal.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="transition-colors hover:text-paper">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="eyebrow text-xs text-paper">{t(locale, "footer.contact")}</p>
            {/* Placeholder contact details — replace with the client's real inbox and number. */}
            <ul className="mt-4 flex flex-col gap-2.5 text-sm">
              <li>
                <a href="mailto:contacto@grupog2h.com" className="hover:text-paper">
                  contacto@grupog2h.com
                </a>
              </li>
              <li>
                <span className="select-all">+52 55 0000 0000</span>
              </li>
              <li>Veracruz · Xalapa, México</li>
            </ul>
            <Link
              href="/login"
              className="heading mt-5 inline-block rounded-md bg-accent px-5 py-2.5 text-sm uppercase tracking-wide text-paper hover:bg-accent-hover"
            >
              {t(locale, "nav.portal")}
            </Link>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} Grupo G2H · Servicios Integrales. {t(locale, "footer.rights")}
          </p>
          <p>MXN · es-MX / EN</p>
        </div>
      </div>
    </footer>
  );
}
