/**
 * Client-logo roster for the trust band.
 *
 * The SVGs live in `public/clients/` (one per client). To add or remove a logo, drop the file
 * in that directory and add/remove its entry here: `slug` is the base file name, `file` is the
 * public path, `name` is the accessible label shown to screen readers and on hover.
 *
 * While the array is empty, <TrustBand/> renders nothing (the section stays out of the page
 * rather than showing empty tiles).
 */
export interface Client {
  slug: string;
  name: string;
  /** Public path, e.g. `/clients/<slug>.svg`. */
  file: string;
}

export const clients: Client[] = [
  { slug: "cemex", name: "Cemex", file: "/clients/cemex.svg" },
  { slug: "fedex", name: "FedEx", file: "/clients/fedex.svg" },
  { slug: "banamex", name: "Banamex", file: "/clients/banamex.svg" },
  { slug: "sherwin-williams", name: "Sherwin-Williams", file: "/clients/sherwin-williams.svg" },
  { slug: "herbalife", name: "Herbalife", file: "/clients/herbalife.svg" },
  { slug: "comex", name: "Comex", file: "/clients/comex.svg" },
  { slug: "coppel", name: "Coppel", file: "/clients/coppel.svg" },
  { slug: "imss", name: "IMSS", file: "/clients/imss.svg" },
  { slug: "schott", name: "Schott", file: "/clients/schott.svg" },
  { slug: "gulf-oil", name: "Gulf Oil", file: "/clients/gulf-oil.svg" },
  { slug: "carls-jr", name: "Carl's Jr.", file: "/clients/carls-jr.svg" },
  { slug: "bennigan", name: "Bennigan's", file: "/clients/bennigan.svg" },
  { slug: "pilgrims-pride", name: "Pilgrim's Pride", file: "/clients/pilgrims-pride.svg" },
  { slug: "sf-express", name: "SF Express", file: "/clients/sf-express.svg" },
];

export const clientsAvailable = clients.length > 0;
