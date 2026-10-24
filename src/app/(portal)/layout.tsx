"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useAccountGate } from "@/lib/account-gate";
import { WaitingForApproval } from "@/components/waiting-for-approval";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const { session, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { state, accountStatus } = useAccountGate();

  // Redirects run in an effect so we never call router during render.
  useEffect(() => {
    if (state === "unauthenticated") router.replace("/login");
    else if (state === "wrong-role") router.replace("/");
    else if (state === "needs-onboarding") router.replace("/onboarding");
  }, [state, router]);

  if (state === "loading" || state === "unauthenticated" || state === "wrong-role" || state === "needs-onboarding") {
    return <div className="min-h-screen bg-background" />;
  }
  if (state === "blocked") return <WaitingForApproval accountStatus={accountStatus} />;

  const navItem = (href: string, label: string, active: boolean) => (
    <Link
      className={`block whitespace-nowrap px-3 py-2 text-sm ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
      href={href}
    >
      {label}
    </Link>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/dashboard" className="font-serif text-2xl font-bold">
            Const<span className="text-primary">Doc</span>
          </Link>
          <div className="flex items-center gap-5 text-sm">
            <span className="hidden text-muted-foreground sm:block">
              {session?.user.name ?? session?.user.email}
            </span>
            <button
              onClick={() => {
                void logout();
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
            {navItem("/dashboard", "Overview", pathname === "/dashboard")}
            {navItem("/dashboard/documents", "Documents", pathname.startsWith("/dashboard/documents"))}
            {navItem("/dashboard/quotations", "Quotations", pathname.startsWith("/dashboard/quotations"))}
            {navItem("/dashboard/billing", "Billing", pathname === "/dashboard/billing")}
          </div>
        </nav>
        <main className="min-w-0 p-6 sm:p-10">{children}</main>
      </div>
    </div>
  );
}
