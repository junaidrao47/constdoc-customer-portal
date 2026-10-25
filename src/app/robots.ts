import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

/**
 * robots.txt — allow public crawling, keep the authenticated portal and onboarding out of the index,
 * and point crawlers at the sitemap. The dashboard/onboarding segments carry no public value and
 * would only create soft-404s behind the auth gate.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard/", "/onboarding/", "/login", "/register"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
