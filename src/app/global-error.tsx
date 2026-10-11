"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-[#f7f3eb] text-[#203a3a]">
        <main className="flex min-h-screen items-center justify-center px-6 text-center">
          <section>
            <h1 className="font-serif text-3xl">ConstDoc is temporarily unavailable</h1>
            <p className="mt-3 text-sm text-[#53605d]">Please try again.</p>
            <button
              className="mt-6 bg-[#203a3a] px-5 py-2.5 text-sm font-semibold text-white"
              onClick={() => reset()}
            >
              Try again
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
