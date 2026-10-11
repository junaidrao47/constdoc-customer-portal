"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <section className="max-w-md border border-destructive/30 bg-card p-8 text-center shadow-lg">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-primary">
          Something went wrong
        </p>
        <h1 className="mt-3 font-serif text-3xl">We could not load this page.</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Please try again. Your account and documents are still safe.
        </p>
        <button
          className="mt-6 bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          onClick={() => reset()}
        >
          Try again
        </button>
      </section>
    </main>
  );
}
