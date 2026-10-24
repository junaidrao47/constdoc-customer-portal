"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useAccountGate } from "@/lib/account-gate";
import { useLocale } from "@/lib/use-locale";
import { t } from "@/lib/messages";
import { WaitingForApproval } from "@/components/waiting-for-approval";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();
  const router = useRouter();
  const locale = useLocale();
  const { state, accountStatus } = useAccountGate();

  useEffect(() => {
    if (state === "unauthenticated") router.replace("/login");
    else if (state === "wrong-role") router.replace("/");
  }, [state, router]);

  // "ready" (already onboarded) still renders the wizard — prefilled and editable (§11.4) —
  // and only the wizard's Finish navigates to /dashboard. This keeps autosave from ejecting
  // the user the moment the required fields become valid mid-wizard.
  if (state === "loading" || state === "unauthenticated" || state === "wrong-role") {
    return <div className="min-h-screen bg-background" />;
  }
  if (state === "blocked") return <WaitingForApproval accountStatus={accountStatus} />;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
          <span className="font-serif text-2xl font-bold">
            Const<span className="text-primary">Doc</span>
          </span>
          <button
            type="button"
            onClick={() => {
              void logout();
              router.replace("/login");
            }}
            className="text-sm font-semibold text-primary"
          >
            {t(locale, "waiting.signOut")}
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-10 sm:py-14">{children}</main>
    </div>
  );
}
