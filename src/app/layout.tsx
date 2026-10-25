import type { Metadata } from "next";
import { Inter, Roboto_Condensed, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { SiteJsonLd } from "@/components/seo/json-ld";
import { getServerLocale } from "@/lib/locale";
import { SITE_URL } from "@/lib/site";

const body = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const heading = Roboto_Condensed({
  variable: "--font-heading-face",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
});

const mono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Grupo G2H — Servicios Integrales", template: "%s · Grupo G2H" },
  description:
    "Grupo G2H · Servicios Integrales — gestión de permisos y documentos de cumplimiento en México. Compramos un paquete, subes tus documentos y nosotros gestionamos la aprobación ante el gobierno.",
  applicationName: "Grupo G2H",
  keywords: [
    "Grupo G2H",
    "Servicios Integrales",
    "gestión de permisos México",
    "documentos de cumplimiento",
    "trámites gubernamentales",
    "government document approval Mexico",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Grupo G2H — Servicios Integrales",
    title: "Grupo G2H — Servicios Integrales",
    description:
      "Gestión de permisos y documentos de cumplimiento en México. Compra un paquete, sube tus documentos y nosotros gestionamos la aprobación ante el gobierno.",
    url: SITE_URL,
    locale: "es_MX",
    alternateLocale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Grupo G2H — Servicios Integrales",
    description: "Gestión de permisos y documentos de cumplimiento en México.",
  },
  robots: { index: true, follow: true },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getServerLocale();
  return (
    <html
      lang={locale === "en" ? "en" : "es-MX"}
      className={`${body.variable} ${heading.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteJsonLd />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
