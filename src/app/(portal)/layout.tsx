"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const { session, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  if (isLoading) return <div className="min-h-screen bg-background" />;
  if (!session) {
    router.replace("/login");
    return null;
  }
  if (session.user.role !== "customer") {
    router.replace("/");
    return null;
  }
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/dashboard" className="font-serif text-2xl font-bold">
            Const<span className="text-primary">Doc</span>
          </Link>
          <div className="flex items-center gap-5 text-sm">
            <span className="hidden text-muted-foreground sm:block">
              {session.user.name ?? session.user.email}
            </span>
            <button
              onClick={() => {
                logout();
                router.replace("/");
              }}
              className="font-semibold text-primary"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl lg:grid-cols-[220px_1fr]">
        <nav className="border-b border-border bg-card p-4 lg:min-h-[calc(100vh-81px)] lg:border-b-0 lg:border-r">
          <div className="flex gap-2 overflow-auto lg:block lg:space-y-1">
            <Link
              className={`block whitespace-nowrap px-3 py-2 text-sm ${pathname === "/dashboard" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
              href="/dashboard"
            >
              Overview
            </Link>
            <Link
              className={`block whitespace-nowrap px-3 py-2 text-sm ${pathname === "/dashboard/documents" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
              href="/dashboard/documents"
            >
              Documents
            </Link>
            <Link
              className={`block whitespace-nowrap px-3 py-2 text-sm ${pathname.startsWith("/dashboard/quotations") ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
              href="/dashboard/quotations"
            >
              Quotations
            </Link>
            <Link
              className={`block whitespace-nowrap px-3 py-2 text-sm ${pathname === "/dashboard/billing" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
              href="/dashboard/billing"
            >
              Billing
            </Link>
          </div>
        </nav>
        <main className="min-w-0 p-6 sm:p-10">{children}</main>
      </div>
    </div>
  );
}
