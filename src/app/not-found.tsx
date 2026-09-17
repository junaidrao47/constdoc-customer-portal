import Link from "next/link";

export default function NotFound() { return <main className="flex min-h-screen items-center justify-center bg-[#f7f3eb] px-6 text-center text-[#203a3a]"><section><p className="text-sm font-bold uppercase tracking-[.18em] text-[#bb6b36]">404</p><h1 className="mt-3 font-serif text-4xl">Page not found</h1><p className="mt-3 text-sm text-[#53605d]">That customer portal page is not available.</p><Link className="mt-6 inline-flex bg-[#203a3a] px-5 py-2.5 text-sm font-semibold text-white" href="/dashboard">Return to dashboard</Link></section></main>; }
