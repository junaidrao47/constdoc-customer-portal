"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Clock, ShieldAlert } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useLocale } from "@/lib/use-locale";
import { t } from "@/lib/messages";
import { LocaleToggle } from "@/components/locale-toggle";
import type { AccountStatus } from "@/lib/types";

/**
 * The only screen a pending_approval or suspended customer may see (§11.1): the status
 * message, a contact link and sign-out. No portal data, no navigation into the app.
 */
export function WaitingForApproval({ accountStatus }: { accountStatus: AccountStatus }) {
  const locale = useLocale();
  const { logout } = useAuth();
  const router = useRouter();
  const suspended = accountStatus === "suspended";

  return (
    <main className="flex min-h-screen items-center justify-center bg-primary px-5 py-10 text-foreground">
      <section className="w-full max-w-md border border-primary-foreground/10 bg-background p-7 text-center shadow-2xl sm:p-10">
        <div className="flex items-center justify-between">
          <span className="font-serif text-2xl font-bold">
            Grupo <span className="text-primary">G2H</span>
          </span>
          <LocaleToggle />
        </div>
        <div className="mt-8 flex justify-center">
          <span
            className={`flex h-14 w-14 items-center justify-center rounded-full ${suspended ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning"}`}
          >
            {suspended ? <ShieldAlert size={26} /> : <Clock size={26} />}
          </span>
        </div>
        <h1 className="mt-6 font-serif text-3xl">
          {t(locale, suspended ? "waiting.suspended.title" : "waiting.pending.title")}
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {t(locale, suspended ? "waiting.suspended.body" : "waiting.pending.body")}
        </p>
        <div className="mt-8 grid gap-3">
          <Link
            href="/contact"
            className="h-12 w-full border border-primary bg-primary font-semibold leading-[3rem] text-primary-foreground transition hover:bg-primary/90"
          >
            {t(locale, "waiting.contact")}
          </Link>
          <button
            type="button"
            onClick={() => {
              void logout();
              router.replace("/login");
            }}
            className="h-12 w-full border border-border font-semibold transition hover:bg-muted"
          >
            {t(locale, "waiting.signOut")}
          </button>
        </div>
      </section>
    </main>
  );
}
