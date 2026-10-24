"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Loader2, Plus, X } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { messageForError } from "@/lib/errors";
import { useLocale } from "@/lib/use-locale";
import { t } from "@/lib/messages";
import {
  TOTAL_STEPS,
  buildOnboardingPayload,
  firstIncompleteStep,
  formFromOnboarding,
  validateStep,
  type OnboardingForm,
  type StepErrors,
} from "@/lib/onboarding";
import type { OnboardingResponse } from "@/lib/types";

const PERSONAS = ["individual", "company"] as const;

export default function OnboardingPage() {
  const locale = useLocale();
  const router = useRouter();
  const client = useQueryClient();

  const [form, setForm] = useState<OnboardingForm | null>(null);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<StepErrors>({});
  const [finishError, setFinishError] = useState("");
  const hydrated = useRef(false);

  const query = useQuery({
    queryKey: ["customer-onboarding"],
    queryFn: () => apiRequest<OnboardingResponse>("/customers/me/onboarding"),
  });

  // Hydrate once from the server, resuming at the first incomplete step.
  useEffect(() => {
    if (query.data && !hydrated.current) {
      hydrated.current = true;
      setForm(formFromOnboarding(query.data.onboarding));
      setStep(firstIncompleteStep(query.data.onboarding, locale));
    }
  }, [query.data, locale]);

  const save = useMutation({
    mutationFn: (next: OnboardingForm) =>
      apiRequest<OnboardingResponse>("/customers/me/onboarding", {
        method: "PUT",
        body: JSON.stringify(buildOnboardingPayload(next, locale)),
      }),
    onSuccess: (data) => client.setQueryData(["customer-onboarding"], data),
  });

  // Debounced autosave whenever the form changes after hydration.
  useEffect(() => {
    if (!form || !hydrated.current) return;
    const timer = setTimeout(() => save.mutate(form), 800);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  if (query.isLoading || !form) {
    return <p className="text-sm text-muted-foreground">{t(locale, "state.loading")}</p>;
  }
  if (query.isError) {
    return (
      <p role="alert" className="text-sm text-destructive">
        {messageForError(query.error, locale)}
      </p>
    );
  }

  const patch = (next: Partial<OnboardingForm>) => setForm((current) => ({ ...current!, ...next }));

  function goNext() {
    const stepErrors = validateStep(step, form!, locale);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length > 0) return;
    save.mutate(form!);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  }

  function goBack() {
    setErrors({});
    setStep((s) => Math.max(s - 1, 0));
  }

  async function finish() {
    setFinishError("");
    // Re-validate every step; jump to the first that fails.
    for (let s = 0; s < TOTAL_STEPS; s += 1) {
      const stepErrors = validateStep(s, form!, locale);
      if (Object.keys(stepErrors).length > 0) {
        setStep(s);
        setErrors(stepErrors);
        return;
      }
    }
    try {
      const result = await save.mutateAsync(form!);
      if (!result.onboarding.completed) {
        setStep(firstIncompleteStep(result.onboarding, locale));
        return;
      }
      await client.invalidateQueries({ queryKey: ["onboarding-gate"] });
      router.replace("/dashboard");
    } catch (cause) {
      setFinishError(messageForError(cause, locale));
    }
  }

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[.18em] text-primary">{t(locale, "onb.title")}</p>
      <h1 className="mt-2 font-serif text-4xl">{t(locale, `onb.step${step + 1}.title` as never)}</h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{t(locale, "onb.subtitle")}</p>

      {/* Progress indicator */}
      <div className="mt-6 flex items-center gap-3">
        <div className="flex flex-1 gap-1.5">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <span
              key={i}
              className={`h-1.5 flex-1 rounded ${i <= step ? "bg-primary" : "bg-muted"}`}
            />
          ))}
        </div>
        <span className="text-xs text-muted-foreground">
          {t(locale, "onb.step", { n: step + 1, total: TOTAL_STEPS })}
        </span>
      </div>

      <div className="mt-8 border border-border bg-card p-6">
        {step === 0 && (
          <fieldset className="grid gap-3">
            <legend className="text-sm font-semibold">{t(locale, "onb.personaHelp")}</legend>
            {PERSONAS.map((persona) => (
              <label
                key={persona}
                className={`flex cursor-pointer items-center gap-3 border p-4 text-sm ${form.persona === persona ? "border-primary bg-primary/5" : "border-border"}`}
              >
                <input
                  type="radio"
                  name="persona"
                  value={persona}
                  checked={form.persona === persona}
                  onChange={() => patch({ persona })}
                  className="h-4 w-4 accent-[var(--primary)]"
                />
                {t(locale, `onb.persona.${persona}` as never)}
              </label>
            ))}
            {errors.persona && <p className="text-xs text-destructive">{errors.persona}</p>}
          </fieldset>
        )}

        {step === 1 && (
          <div className="grid gap-4">
            <Field label={t(locale, "onb.legalName")} error={errors.legalName}>
              <input
                className="h-11 w-full border border-border bg-background px-3 outline-none focus:border-primary"
                value={form.legalName}
                onChange={(e) => patch({ legalName: e.target.value })}
              />
            </Field>
            <Field label={t(locale, "onb.contactName")} error={errors.contactName}>
              <input
                className="h-11 w-full border border-border bg-background px-3 outline-none focus:border-primary"
                value={form.contactName}
                onChange={(e) => patch({ contactName: e.target.value })}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label={t(locale, "onb.phone")} error={errors.phone}>
                <input
                  className="h-11 w-full border border-border bg-background px-3 outline-none focus:border-primary"
                  value={form.phone}
                  onChange={(e) => patch({ phone: e.target.value })}
                />
              </Field>
              <Field label={t(locale, "onb.state")} error={errors.state}>
                <input
                  className="h-11 w-full border border-border bg-background px-3 outline-none focus:border-primary"
                  value={form.state}
                  onChange={(e) => patch({ state: e.target.value })}
                />
              </Field>
              <Field label={t(locale, "onb.city")} error={errors.city}>
                <input
                  className="h-11 w-full border border-border bg-background px-3 outline-none focus:border-primary"
                  value={form.city}
                  onChange={(e) => patch({ city: e.target.value })}
                />
              </Field>
            </div>
            <Field
              label={t(locale, "onb.notificationEmails")}
              error={errors.notificationEmails}
              hint={t(locale, "onb.notificationEmailsHelp")}
            >
              <div className="grid gap-2">
                {form.notificationEmails.map((email, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="email"
                      className="h-11 w-full border border-border bg-background px-3 outline-none focus:border-primary"
                      value={email}
                      onChange={(e) => {
                        const next = [...form.notificationEmails];
                        next[index] = e.target.value;
                        patch({ notificationEmails: next });
                      }}
                    />
                    {form.notificationEmails.length > 1 && (
                      <button
                        type="button"
                        aria-label={t(locale, "onb.remove")}
                        onClick={() =>
                          patch({ notificationEmails: form.notificationEmails.filter((_, i) => i !== index) })
                        }
                        className="shrink-0 text-muted-foreground hover:text-destructive"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
                {form.notificationEmails.length < 3 && (
                  <button
                    type="button"
                    onClick={() => patch({ notificationEmails: [...form.notificationEmails, ""] })}
                    className="inline-flex w-fit items-center gap-1 text-sm font-semibold text-primary"
                  >
                    <Plus size={14} /> {t(locale, "onb.addEmail")}
                  </button>
                )}
              </div>
            </Field>
          </div>
        )}

        {step === 2 && (
          <Field label={t(locale, "onb.needs")} hint={t(locale, "onb.needsHelp")}>
            <div className="grid gap-2">
              {form.needs.map((need, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    className="h-11 w-full border border-border bg-background px-3 outline-none focus:border-primary"
                    value={need}
                    onChange={(e) => {
                      const next = [...form.needs];
                      next[index] = e.target.value;
                      patch({ needs: next });
                    }}
                  />
                  <button
                    type="button"
                    aria-label={t(locale, "onb.remove")}
                    onClick={() => patch({ needs: form.needs.filter((_, i) => i !== index) })}
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => patch({ needs: [...form.needs, ""] })}
                className="inline-flex w-fit items-center gap-1 text-sm font-semibold text-primary"
              >
                <Plus size={14} /> {t(locale, "onb.addNeed")}
              </button>
            </div>
          </Field>
        )}
      </div>

      {/* Save indicator + nav */}
      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {save.isPending ? (
            <>
              <Loader2 size={13} className="animate-spin" /> {t(locale, "onb.saving")}
            </>
          ) : save.isSuccess ? (
            <>
              <Check size={13} className="text-success" /> {t(locale, "onb.savedAt")}
            </>
          ) : null}
        </span>
        <div className="flex gap-2">
          {step > 0 && (
            <button
              type="button"
              onClick={goBack}
              className="h-11 border border-border px-5 text-sm font-semibold transition hover:bg-muted"
            >
              {t(locale, "onb.back")}
            </button>
          )}
          {step < TOTAL_STEPS - 1 ? (
            <button
              type="button"
              onClick={goNext}
              className="h-11 bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              {t(locale, "onb.next")}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void finish()}
              disabled={save.isPending}
              className="h-11 bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
            >
              {t(locale, "onb.finish")}
            </button>
          )}
        </div>
      </div>
      {finishError && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {finishError}
        </p>
      )}
    </div>
  );
}

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="font-semibold">{label}</span>
      {hint && <span className="mt-0.5 block text-xs font-normal text-muted-foreground">{hint}</span>}
      <div className="mt-1.5">{children}</div>
      {error && <span className="mt-1 block text-xs text-destructive">{error}</span>}
    </label>
  );
}
