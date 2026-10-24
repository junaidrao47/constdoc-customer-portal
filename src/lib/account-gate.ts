"use client";

import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "./api";
import { useAuth } from "./auth-context";
import type { AccountStatus, OnboardingResponse } from "./types";

export type GateState =
  | "loading"
  | "unauthenticated"
  | "wrong-role"
  | "blocked"
  | "needs-onboarding"
  | "ready";

export interface Gate {
  state: GateState;
  /** Resolved account status (missing on older sessions is treated as approved). */
  accountStatus: AccountStatus;
}

/**
 * The single source of truth for what an authenticated customer may see (§11.1/§11.4),
 * shared by the portal and onboarding layouts so the rule lives in one place:
 *
 *   loading          → still resolving the session or the onboarding flag; render nothing
 *   unauthenticated  → no session; send to /login
 *   wrong-role       → a staff/admin token in the customer portal; send home
 *   blocked          → pending_approval or suspended; show the waiting screen
 *   needs-onboarding → approved but onboarding not finished; send to /onboarding
 *   ready            → approved and onboarded; render the portal
 *
 * The onboarding completeness is read once (and cached briefly) only for an approved
 * customer, so a pending user never calls a gated endpoint.
 */
export function useAccountGate(): Gate {
  const { session, isLoading } = useAuth();
  const role = session?.user.role;
  const accountStatus = (session?.user.accountStatus ?? "approved") as AccountStatus;
  const isApprovedCustomer = Boolean(session) && role === "customer" && accountStatus === "approved";

  const onboarding = useQuery({
    queryKey: ["onboarding-gate"],
    queryFn: () => apiRequest<OnboardingResponse>("/customers/me/onboarding"),
    enabled: isApprovedCustomer,
    staleTime: 30_000,
  });

  if (isLoading) return { state: "loading", accountStatus };
  if (!session) return { state: "unauthenticated", accountStatus };
  if (role !== "customer") return { state: "wrong-role", accountStatus };
  if (accountStatus !== "approved") return { state: "blocked", accountStatus };
  if (onboarding.isLoading) return { state: "loading", accountStatus };
  if (onboarding.data) {
    return { state: onboarding.data.onboarding.completed ? "ready" : "needs-onboarding", accountStatus };
  }
  // Onboarding flag could not be read (transient error): let the page render and surface
  // its own error state rather than trapping the user on a blank screen.
  return { state: "ready", accountStatus };
}
