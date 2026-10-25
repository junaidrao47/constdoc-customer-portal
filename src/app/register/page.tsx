"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { z } from "zod";
import { useAuth } from "@/lib/auth-context";

const registrationSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Enter your full name.")
      .max(150, "Name must be 150 characters or fewer."),
    email: z.string().trim().toLowerCase().email("Enter a valid email address."),
    password: z
      .string()
      .min(8, "Use at least 8 characters.")
      .max(72, "Password must be 72 characters or fewer.")
      .regex(/[A-Z]/, "Add at least one uppercase letter.")
      .regex(/[a-z]/, "Add at least one lowercase letter.")
      .regex(/[0-9]/, "Add at least one number."),
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });
type FormErrors = Partial<Record<"name" | "email" | "password" | "confirmPassword", string>>;

export default function RegisterPage() {
  const { register: createAccount } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError("");
    const parsed = registrationSchema.safeParse(form);
    if (!parsed.success) {
      const next: FormErrors = {};
      for (const issue of parsed.error.issues)
        next[issue.path[0] as keyof FormErrors] = issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    setIsSubmitting(true);
    try {
      await createAccount(parsed.data.email, parsed.data.password, parsed.data.name);
      router.replace("/dashboard");
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "We could not create your account. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }
  const field = (name: keyof FormErrors, label: string, type: string, autocomplete: string) => (
    <div>
      <label htmlFor={name} className="block text-sm font-semibold">
        {label}
      </label>
      <input
        id={name}
        name={name}
        autoComplete={autocomplete}
        type={type}
        value={form[name]}
        onChange={(event) => setForm({ ...form, [name]: event.target.value })}
        aria-invalid={Boolean(errors[name])}
        aria-describedby={errors[name] ? `${name}-error` : undefined}
        className="mt-2 h-12 w-full border border-border bg-card px-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
      {errors[name] && (
        <p id={`${name}-error`} className="mt-1 text-xs text-destructive">
          {errors[name]}
        </p>
      )}
    </div>
  );
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-10 text-foreground">
      <section className="w-full max-w-lg border border-border bg-card p-7 shadow-xl sm:p-10">
        <Link href="/" className="font-serif text-2xl font-bold">
          Grupo <span className="text-primary">G2H</span>
        </Link>
        <p className="mt-12 text-xs font-bold uppercase tracking-[.18em] text-primary">
          Start securely
        </p>
        <h1 className="mt-3 font-serif text-4xl">Create your workspace.</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Your account keeps quotations, documents, and service updates in one protected place.
        </p>
        <form className="mt-8 space-y-5" onSubmit={submit} noValidate>
          {field("name", "Full name", "text", "name")}
          {field("email", "Email address", "email", "email")}
          {field("password", "Password", "password", "new-password")}
          <p className="-mt-2 text-xs text-muted-foreground">
            Use 8 to 72 characters with uppercase, lowercase, and a number.
          </p>
          {field("confirmPassword", "Confirm password", "password", "new-password")}
          {submitError && (
            <p
              role="alert"
              className="border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
            >
              {submitError}
            </p>
          )}
          <button
            disabled={isSubmitting}
            className="h-12 w-full bg-primary font-semibold text-primary-foreground transition hover:bg-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Creating account..." : "Create customer account"}
          </button>
        </form>
        <p className="mt-7 text-sm text-muted-foreground">
          Already registered?{" "}
          <Link href="/login" className="font-semibold text-primary">
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
