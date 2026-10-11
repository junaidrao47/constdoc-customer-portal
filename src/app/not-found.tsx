import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-center text-foreground">
      <section>
        <p className="text-sm font-bold uppercase tracking-[.18em] text-primary">404</p>
        <h1 className="mt-3 font-serif text-4xl">Page not found</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          That customer portal page is not available.
        </p>
        <Link
          className="mt-6 inline-flex bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          href="/dashboard"
        >
          Return to dashboard
        </Link>
      </section>
    </main>
  );
}
