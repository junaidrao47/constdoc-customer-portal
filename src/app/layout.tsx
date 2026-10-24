import type { Metadata } from "next";
import { Inter, Roboto_Condensed, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { getServerLocale } from "@/lib/locale";

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
  title: { default: "Grupo G2H — Servicios Integrales", template: "%s · Grupo G2H" },
  description:
    "Grupo G2H · Servicios Integrales — gestión de permisos y documentos de cumplimiento en México.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getServerLocale();
  return (
    <html
      lang={locale === "en" ? "en" : "es-MX"}
      className={`${body.variable} ${heading.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
