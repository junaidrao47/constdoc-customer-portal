"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest, ApiError } from "@/lib/api";
import { useLocale } from "@/lib/use-locale";

// Mirrors the server's ContactInquirySchema so a bad value is caught before the round trip;
// the API still validates and its message is shown on failure.
const contactSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(40).optional(),
  message: z.string().trim().min(1).max(5000),
});

type Field = "firstName" | "lastName" | "email" | "phone" | "message";
type FieldErrors = Partial<Record<Field, string>>;

const COPY = {
  en: {
    firstName: "First name",
    lastName: "Last name",
    email: "E-mail address",
    phone: "Phone (optional)",
    message: "Your message",
    send: "Send message",
    sending: "Sending…",
    successTitle: "Thank you — your message is on its way.",
    successBody: "A member of our team will get back to you shortly at the email you provided.",
    another: "Send another message",
    required: "This field is required.",
    badEmail: "Enter a valid email address.",
    failed: "We couldn't send your message. Please try again.",
    consent:
      "By submitting this form you agree that we may contact you about your inquiry.",
  },
  es: {
    firstName: "Nombre",
    lastName: "Apellido",
    email: "Correo electrónico",
    phone: "Teléfono (opcional)",
    message: "Tu mensaje",
    send: "Enviar mensaje",
    sending: "Enviando…",
    successTitle: "Gracias — tu mensaje está en camino.",
    successBody: "Un miembro de nuestro equipo te responderá pronto al correo que proporcionaste.",
    another: "Enviar otro mensaje",
    required: "Este campo es obligatorio.",
    badEmail: "Ingresa un correo electrónico válido.",
    failed: "No pudimos enviar tu mensaje. Inténtalo de nuevo.",
    consent: "Al enviar este formulario aceptas que podamos contactarte sobre tu consulta.",
  },
} as const;

const EMPTY = { firstName: "", lastName: "", email: "", phone: "", message: "" };

export function ContactForm() {
  const locale = useLocale();
  const t = COPY[locale];
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");

  function update(field: Field, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError("");
    const parsed = contactSchema.safeParse(form);
    if (!parsed.success) {
      const next: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as Field;
        next[field] = field === "email" ? t.badEmail : t.required;
      }
      setErrors(next);
      return;
    }

    setStatus("submitting");
    try {
      await apiRequest<{ received: true }>("/public/contact", {
        method: "POST",
        body: JSON.stringify(parsed.data),
      });
      setStatus("success");
      setForm(EMPTY);
    } catch (error) {
      setStatus("idle");
      setSubmitError(error instanceof ApiError ? error.message : t.failed);
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-start gap-4 border border-border bg-card p-8">
        <CheckCircle2 className="text-primary" size={40} strokeWidth={1.5} />
        <h2 className="font-serif text-3xl">{t.successTitle}</h2>
        <p className="leading-7 text-muted-foreground">{t.successBody}</p>
        <Button variant="outline" onClick={() => setStatus("idle")}>
          {t.another}
        </Button>
      </div>
    );
  }

  const invalid = (field: Field) => Boolean(errors[field]);

  return (
    <form onSubmit={submit} noValidate className="border border-border bg-card p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="firstName" label={t.firstName} error={errors.firstName}>
          <Input
            id="firstName"
            value={form.firstName}
            onChange={(e) => update("firstName", e.target.value)}
            aria-invalid={invalid("firstName")}
            autoComplete="given-name"
          />
        </Field>
        <Field id="lastName" label={t.lastName} error={errors.lastName}>
          <Input
            id="lastName"
            value={form.lastName}
            onChange={(e) => update("lastName", e.target.value)}
            aria-invalid={invalid("lastName")}
            autoComplete="family-name"
          />
        </Field>
        <Field id="email" label={t.email} error={errors.email}>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            aria-invalid={invalid("email")}
            autoComplete="email"
          />
        </Field>
        <Field id="phone" label={t.phone} error={errors.phone}>
          <Input
            id="phone"
            type="tel"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            autoComplete="tel"
          />
        </Field>
      </div>

      <div className="mt-5">
        <Field id="message" label={t.message} error={errors.message}>
          <Textarea
            id="message"
            rows={6}
            value={form.message}
            onChange={(e) => update("message", e.target.value)}
            aria-invalid={invalid("message")}
          />
        </Field>
      </div>

      {submitError && (
        <p role="alert" className="mt-4 text-sm font-medium text-destructive">
          {submitError}
        </p>
      )}

      <Button type="submit" disabled={status === "submitting"} className="mt-6 w-full sm:w-auto">
        {status === "submitting" ? (
          <>
            <Loader2 className="animate-spin" size={16} /> {t.sending}
          </>
        ) : (
          t.send
        )}
      </Button>
      <p className="mt-4 text-xs leading-5 text-muted-foreground">{t.consent}</p>
    </form>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
