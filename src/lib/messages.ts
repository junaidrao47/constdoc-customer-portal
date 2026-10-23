/**
 * UI chrome strings for the new components, in both site languages.
 *
 * DB-managed content (service/package/category names, descriptions) is localized by the
 * API via `Accept-Language`; this dictionary only covers the fixed chrome the components
 * render themselves. next-intl is not wired into this app yet — the keys are structured so
 * swapping to `t(key)` later is a one-file change.
 */
export type Locale = "es" | "en";

const DICT = {
  es: {
    "nav.services": "Servicios",
    "nav.packages": "Paquetes",
    "nav.about": "Nosotros",
    "nav.contact": "Contacto",
    "nav.faq": "Preguntas",
    "nav.categories": "Categorías",
    "nav.portal": "Portal de clientes",
    "nav.menu": "Menú",
    "nav.requestQuote": "Solicitar cotización",
    "card.from": "Desde",
    "card.includedServices": "Servicios incluidos",
    "card.moreServices": "+{n} más",
    "card.viewService": "Ver servicio",
    "card.viewPackage": "Ver paquete",
    "card.getQuote": "Obtener cotización",
    "filter.all": "Todas",
    "filter.empty": "No hay nada publicado en esta categoría todavía.",
    "calc.services": "Servicios",
    "calc.package": "Paquete (opcional)",
    "calc.packageNone": "Sin paquete",
    "calc.packagePrice": "Precio del paquete",
    "calc.selectServices": "Elige uno o más servicios",
    "upload.drop": "Arrastra archivos aquí o elige un archivo",
    "upload.cancel": "Cancelar",
    "upload.retry": "Reintentar",
    "upload.uploading": "Subiendo…",
    "upload.queueEmpty": "Sin archivos en cola.",
    "doc.checklist": "Documentos requeridos",
    "doc.completion": "Progreso",
    "doc.timeline": "Historial",
    "doc.versions": "Versiones",
    "doc.uploadNewVersion": "Subir nueva versión",
    "doc.downloadOfficial": "Descargar archivo oficial",
    "doc.noDocuments": "Aún no has subido documentos.",
    "state.loading": "Cargando…",
    "state.error": "No se pudo cargar. Inténtalo de nuevo.",
  },
  en: {
    "nav.services": "Services",
    "nav.packages": "Packages",
    "nav.about": "About",
    "nav.contact": "Contact",
    "nav.faq": "FAQ",
    "nav.categories": "Categories",
    "nav.portal": "Customer portal",
    "nav.menu": "Menu",
    "nav.requestQuote": "Request a quote",
    "card.from": "From",
    "card.includedServices": "Included services",
    "card.moreServices": "+{n} more",
    "card.viewService": "View service",
    "card.viewPackage": "View package",
    "card.getQuote": "Get a quote",
    "filter.all": "All",
    "filter.empty": "Nothing is published in this category yet.",
    "calc.services": "Services",
    "calc.package": "Package (optional)",
    "calc.packageNone": "No package",
    "calc.packagePrice": "Package price",
    "calc.selectServices": "Choose one or more services",
    "upload.drop": "Drag files here or choose a file",
    "upload.cancel": "Cancel",
    "upload.retry": "Retry",
    "upload.uploading": "Uploading…",
    "upload.queueEmpty": "No files queued.",
    "doc.checklist": "Required documents",
    "doc.completion": "Progress",
    "doc.timeline": "Timeline",
    "doc.versions": "Versions",
    "doc.uploadNewVersion": "Upload new version",
    "doc.downloadOfficial": "Download official file",
    "doc.noDocuments": "You haven't uploaded any documents yet.",
    "state.loading": "Loading…",
    "state.error": "Could not load. Please try again.",
  },
} as const;

export type MessageKey = keyof (typeof DICT)["es"];

export function t(locale: Locale, key: MessageKey, vars?: Record<string, string | number>): string {
  let text: string = DICT[locale][key] ?? DICT.es[key] ?? key;
  if (vars) for (const [k, v] of Object.entries(vars)) text = text.replace(`{${k}}`, String(v));
  return text;
}
