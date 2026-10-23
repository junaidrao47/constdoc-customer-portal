"use client";

import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "./api";
import type { DocumentStatus, StatusContract } from "./types";

/** The document status contract — the single source of truth for statuses and flow. */
export function useStatusContract() {
  return useQuery({
    queryKey: ["document-statuses"],
    queryFn: () => apiRequest<StatusContract>("/documents/statuses"),
    staleTime: 30 * 60 * 1000,
  });
}

/**
 * Whether the customer may add a new version from `status`. A first upload is allowed
 * while `pending`; a resubmission is whatever the contract lets the customer do from the
 * current status (today: `rejected → pending`). Never hardcodes the flow.
 */
export function canResubmit(contract: StatusContract | undefined, status: DocumentStatus): boolean {
  if (status === "pending") return true;
  return (contract?.transitionsByRole.customer?.[status]?.length ?? 0) > 0;
}
