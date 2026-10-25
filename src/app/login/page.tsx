"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { z } from "zod";
import { useAuth } from "@/lib/auth-context";

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

type FormErrors = Partial<Record<"email" | "password", string>>;

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError("");
    const parsed = loginSchema.safeParse(form);
    if (!parsed.success) {
      const next: FormErrors = {};
      for (const issue of parsed.error.issues)
        next[issue.path[0] as "email" | "password"] = issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    setIsSubmitting(true);
    try {
      await login(parsed.data.email, parsed.data.password);
      router.replace("/dashboard");
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "We could not sign you in. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-primary px-5 py-10 text-foreground">
      <section className="w-full max-w-md border border-primary-foreground/10 bg-background p-7 shadow-2xl sm:p-10">
        <Link href="/" className="font-serif text-2xl font-bold">
          Grupo <span className="text-primary">G2H</span>
        </Link>
        <p className="mt-12 text-xs font-bold uppercase tracking-[.18em] text-primary">
          Customer portal
        </p>
        <h1 className="mt-3 font-serif text-4xl">Welcome back.</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Sign in to manage your documents, quotations, and compliance milestones.
        </p>
        <form className="mt-8 space-y-5" onSubmit={submit} noValidate>
          <div>
            <label htmlFor="email" className="block text-sm font-semibold">
              Email address
            </label>
            <input
              id="email"
              name="email"
              autoComplete="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              type="email"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "email-error" : undefined}
              className="mt-2 h-12 w-full border border-border bg-card px-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            {errors.email && (
              <p id="email-error" className="mt-1 text-xs text-destructive">
                {errors.email}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-semibold">
              Password
            </label>
            <input
              id="password"
              name="password"
              autoComplete="current-password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              type="password"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? "password-error" : undefined}
              className="mt-2 h-12 w-full border border-border bg-card px-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            {errors.password && (
              <p id="password-error" className="mt-1 text-xs text-destructive">
                {errors.password}
              </p>
            )}
          </div>
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
            className="h-12 w-full bg-primary font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Signing in..." : "Sign in securely"}
          </button>
        </form>
        <p className="mt-7 text-sm text-muted-foreground">
          New customer?{" "}
          <Link href="/register" className="font-semibold text-primary">
            Create an account
          </Link>
        </p>
      </section>
    </main>
  );
}
