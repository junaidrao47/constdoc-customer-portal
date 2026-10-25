import { absoluteUrl, BRAND, SITE_URL } from "@/lib/site";

/**
 * Site-wide structured data (schema.org JSON-LD).
 *
 * Only *confirmed* facts (docs/CLIENT-FACTS.md) are emitted: name, url, logo, email, languages.
 * No address, phone, founding date, ratings or review counts are included because they are not
 * confirmed — emitting them would fabricate business facts (R3) and risk a structured-data penalty.
 * When the client confirms a physical address, upgrade `Organization` to `LocalBusiness` with
 * `address` + `telephone` + `openingHours`.
 *
 * The payload is a hard-coded constant (never user input), so serialising it into a
 * `<script type="application/ld+json">` tag is safe; `<` is still escaped defensively.
 */
function JsonLdScript({ data }: { data: Record<string, unknown> }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}

export function SiteJsonLd() {
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: `${BRAND.name} — ${BRAND.tagline}`,
    alternateName: BRAND.name,
    url: SITE_URL,
    logo: absoluteUrl("/logo.png"),
    email: BRAND.email,
    description:
      "Grupo G2H · Servicios Integrales ayuda a personas y empresas a obtener la aprobación de sus documentos ante el gobierno en México.",
    areaServed: { "@type": "Country", name: "México" },
    knowsLanguage: ["es-MX", "en"],
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: `${BRAND.name} — ${BRAND.tagline}`,
    inLanguage: ["es-MX", "en"],
    publisher: { "@id": `${SITE_URL}/#organization` },
  };

  return (
    <>
      <JsonLdScript data={organization} />
      <JsonLdScript data={website} />
    </>
  );
}
