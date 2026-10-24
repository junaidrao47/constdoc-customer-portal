import { z } from "zod";
import { t, type Locale } from "./messages";
import type { Onboarding } from "./types";

/** The wizard's working state — all strings so inputs stay controlled. */
export interface OnboardingForm {
  persona: string;
  legalName: string;
  contactName: string;
  phone: string;
  state: string;
  city: string;
  notificationEmails: string[];
  needs: string[];
}

export type OnboardingField = keyof OnboardingForm;
export type StepErrors = Partial<Record<OnboardingField, string>>;

export const TOTAL_STEPS = 3;

export function emptyForm(): OnboardingForm {
  return {
    persona: "",
    legalName: "",
    contactName: "",
    phone: "",
    state: "",
    city: "",
    notificationEmails: [""],
    needs: [],
  };
}

export function formFromOnboarding(o: Onboarding): OnboardingForm {
  return {
    persona: o.persona ?? "",
    legalName: o.legalName ?? "",
    contactName: o.contactName ?? "",
    phone: o.phone ?? "",
    state: o.state ?? "",
    city: o.city ?? "",
    notificationEmails: o.notificationEmails.length ? [...o.notificationEmails] : [""],
    needs: [...o.needs],
  };
}

/** Maps the UI locale to the backend's `preferred_locale` enum. */
export function backendLocale(locale: Locale): "en" | "es-MX" {
  return locale === "en" ? "en" : "es-MX";
}

function isEmail(value: string): boolean {
  return z.string().email().safeParse(value.trim()).success;
}

/** Per-step zod schema with messages localized through the same `t()` dictionary. */
export function stepSchema(step: number, locale: Locale) {
  if (step === 0) {
    return z.object({ persona: z.string().min(1, t(locale, "onb.err.persona")) });
  }
  if (step === 1) {
    return z.object({
      legalName: z.string().trim().min(1, t(locale, "onb.err.legalName")),
      contactName: z.string().trim().min(1, t(locale, "onb.err.contactName")),
      phone: z.string().trim().min(6, t(locale, "onb.err.phone")),
      state: z.string().trim().min(1, t(locale, "onb.err.state")),
      city: z.string().trim().min(1, t(locale, "onb.err.city")),
      notificationEmails: z
        .array(z.string())
        .transform((list) => list.map((e) => e.trim()).filter(Boolean))
        .pipe(
          z
            .array(z.string().email(t(locale, "onb.err.email")))
            .min(1, t(locale, "onb.err.emailsMin"))
            .max(3, t(locale, "onb.err.emailsMax")),
        ),
    });
  }
  // Step 3 (needs) has no required fields — nothing blocks finishing.
  return z.object({});
}

/** Validates one step and returns field→message errors ({} when the step is valid). */
export function validateStep(step: number, form: OnboardingForm, locale: Locale): StepErrors {
  const result = stepSchema(step, locale).safeParse(form);
  if (result.success) return {};
  const errors: StepErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as OnboardingField | undefined;
    if (field && !errors[field]) errors[field] = issue.message;
  }
  return errors;
}

/** The first step (0-based) that is not yet valid — where a returning user resumes. */
export function firstIncompleteStep(o: Onboarding, locale: Locale): number {
  const form = formFromOnboarding(o);
  for (let step = 0; step < TOTAL_STEPS; step += 1) {
    if (Object.keys(validateStep(step, form, locale)).length > 0) return step;
  }
  return TOTAL_STEPS - 1;
}

/**
 * A PUT body that carries only individually-valid fields, so autosaving partial
 * progress never trips the backend's per-field rules (phone ≥ 6, emails valid, …).
 */
export function buildOnboardingPayload(form: OnboardingForm, locale: Locale): Record<string, unknown> {
  const payload: Record<string, unknown> = { locale: backendLocale(locale) };
  if (form.persona) payload.persona = form.persona;
  if (form.legalName.trim()) payload.legalName = form.legalName.trim();
  if (form.contactName.trim()) payload.contactName = form.contactName.trim();
  if (form.phone.trim().length >= 6) payload.phone = form.phone.trim();
  if (form.state.trim()) payload.state = form.state.trim();
  if (form.city.trim()) payload.city = form.city.trim();

  const emails = form.notificationEmails.map((e) => e.trim()).filter(isEmail).slice(0, 3);
  if (emails.length) payload.notificationEmails = emails;

  const needs = form.needs.map((n) => n.trim()).filter(Boolean).slice(0, 50);
  if (needs.length) payload.needs = needs;

  return payload;
}
