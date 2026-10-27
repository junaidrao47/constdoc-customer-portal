import type { Metadata } from "next";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { getServerLocale } from "@/lib/locale";
import { getPublicContent } from "@/lib/public-api";

/**
 * Privacy notice (Aviso de Privacidad).
 *
 * Content is admin-editable through the CMS (`privacy.title` / `privacy.body` /
 * `privacy.effectiveDate`). Until the client fills and PUBLISHES it, this renders a clearly
 * marked TEMPLATE with [CLIENT_TO_CONFIRM] placeholders.
 *
 * [LEGAL_REVIEW_REQUIRED] — the template below is a structural starting point only. It is NOT
 * legal advice and makes no compliance claim. The client's own legal counsel must review and
 * approve the final text (Ley Federal de Protección de Datos Personales en Posesión de los
 * Particulares) before go-live. This marker lives in code and in the admin editor; it is never
 * shown to site visitors.
 *
 * Locale is cookie-based (no /en · /es-MX split), so this is one URL — matching the rest of the
 * site. See docs/decision-log.md.
 */

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Aviso de Privacidad · Privacy Notice",
  description: "Aviso de privacidad de Grupo G2H — cómo recabamos, usamos y protegemos tus datos personales.",
  alternates: { canonical: "/privacy" },
};

interface Section {
  heading: string;
  body: string;
}

const TEMPLATE: Record<"es" | "en", { title: string; intro: string; sections: Section[] }> = {
  es: {
    title: "Aviso de Privacidad",
    intro:
      "En cumplimiento con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares, Grupo G2H pone a tu disposición el siguiente aviso de privacidad.",
    sections: [
      { heading: "1. Responsable", body: "El responsable del tratamiento de tus datos personales es [CLIENT_TO_CONFIRM: razón social / RFC], con domicilio en [CLIENT_TO_CONFIRM: domicilio]." },
      { heading: "2. Datos que recabamos", body: "Nombre, datos de contacto (correo electrónico y teléfono), datos fiscales y los documentos que nos proporcionas para los trámites contratados." },
      { heading: "3. Finalidades primarias", body: "Prestar los servicios contratados, gestionar trámites y aprobaciones ante las autoridades, emitir cotizaciones y facturas, y dar seguimiento a tu cuenta." },
      { heading: "4. Finalidades secundarias", body: "Enviarte información sobre nuevos servicios o promociones. Puedes oponerte a estas finalidades en cualquier momento escribiendo a [CLIENT_TO_CONFIRM: correo de contacto]." },
      { heading: "5. Derechos ARCO", body: "Tienes derecho a Acceder, Rectificar, Cancelar u Oponerte al tratamiento de tus datos. Para ejercerlos, envía tu solicitud a [CLIENT_TO_CONFIRM: correo de contacto]." },
      { heading: "6. Transferencias", body: "Tus datos podrán ser transferidos a las autoridades competentes únicamente para los trámites que solicites. No se realizan transferencias comerciales a terceros sin tu consentimiento." },
      { heading: "7. Limitación de uso o divulgación", body: "Puedes limitar el uso o divulgación de tus datos mediante solicitud al correo de contacto indicado." },
      { heading: "8. Uso de cookies", body: "El sitio utiliza cookies y tecnologías similares para recordar tu idioma y mejorar tu experiencia. Puedes deshabilitarlas desde tu navegador." },
      { heading: "9. Cambios al aviso", body: "Este aviso puede actualizarse. La versión vigente estará siempre disponible en esta página." },
      { heading: "10. Contacto", body: "Para cualquier duda sobre este aviso, escríbenos a [CLIENT_TO_CONFIRM: correo de contacto]." },
    ],
  },
  en: {
    title: "Privacy Notice",
    intro:
      "In accordance with Mexico's Federal Law on Protection of Personal Data Held by Private Parties, Grupo G2H provides the following privacy notice.",
    sections: [
      { heading: "1. Data controller", body: "The controller of your personal data is [CLIENT_TO_CONFIRM: legal entity / RFC], located at [CLIENT_TO_CONFIRM: address]." },
      { heading: "2. Data we collect", body: "Name, contact details (email and phone), tax information, and the documents you provide for the services you engage." },
      { heading: "3. Primary purposes", body: "To provide the contracted services, manage filings and approvals before the authorities, issue quotations and invoices, and administer your account." },
      { heading: "4. Secondary purposes", body: "To send you information about new services or promotions. You may object to these purposes at any time by writing to [CLIENT_TO_CONFIRM: contact email]." },
      { heading: "5. ARCO rights", body: "You have the right to Access, Rectify, Cancel or Oppose the processing of your data. To exercise them, send your request to [CLIENT_TO_CONFIRM: contact email]." },
      { heading: "6. Transfers", body: "Your data may be transferred to the competent authorities solely for the filings you request. No commercial transfers to third parties are made without your consent." },
      { heading: "7. Limiting use or disclosure", body: "You may limit the use or disclosure of your data by request to the contact email above." },
      { heading: "8. Cookies", body: "The site uses cookies and similar technologies to remember your language and improve your experience. You can disable them in your browser." },
      { heading: "9. Changes to this notice", body: "This notice may be updated. The current version will always be available on this page." },
      { heading: "10. Contact", body: "For any questions about this notice, write to us at [CLIENT_TO_CONFIRM: contact email]." },
    ],
  },
};

export default async function PrivacyPage() {
  const locale = await getServerLocale();
  const content = await getPublicContent(locale);

  const cms = content.ok ? content.data : {};
  const cmsTitle = cms["privacy.title"]?.value;
  const cmsBody = cms["privacy.body"]?.value;
  const effectiveDate = cms["privacy.effectiveDate"]?.value;

  const tpl = TEMPLATE[locale];
  const usingTemplate = !cmsBody || cmsBody.trim().length === 0;

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <PublicHeader />
      <article className="mx-auto w-full max-w-3xl px-6 py-16">
        <h1 className="heading text-4xl leading-tight sm:text-5xl">{cmsTitle || tpl.title}</h1>
        {effectiveDate && (
          <p className="mt-3 text-sm text-muted-foreground">
            {locale === "en" ? "Effective date" : "Fecha de entrada en vigor"}: {effectiveDate}
          </p>
        )}

        {usingTemplate ? (
          <div className="mt-8 space-y-6">
            <p className="leading-7 text-muted-foreground">{tpl.intro}</p>
            {tpl.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="heading text-xl">{section.heading}</h2>
                <p className="mt-2 leading-7">{section.body}</p>
              </section>
            ))}
          </div>
        ) : (
          <div className="mt-8 whitespace-pre-wrap leading-7">{cmsBody}</div>
        )}
      </article>
      <PublicFooter />
    </main>
  );
}
