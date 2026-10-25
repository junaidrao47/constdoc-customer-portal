import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/site";

/**
 * PWA / install manifest. Icons reference assets that exist in `public/` (the scalable brand mark
 * and the raster logo) so no icon request 404s. Colours mirror the design tokens in globals.css
 * (accent #e8590c, paper background).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${BRAND.name} — ${BRAND.tagline}`,
    short_name: BRAND.name,
    description:
      "Gestión de permisos y documentos de cumplimiento en México · Document compliance and government-approval services.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#e8590c",
    lang: "es-MX",
    icons: [
      { src: "/brand-mark.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/logo.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
