"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { apiRequest } from "@/lib/api";
import type { Quotation } from "@/lib/types";
import { formatMoney } from "@/lib/format";
import { StatusBadge } from "@/components/status-badge";

export default function QuotationsPage() {
  const client = useQueryClient();
  const quotations = useQuery({
    queryKey: ["customer-quotations"],
    queryFn: () => apiRequest<Quotation[]>("/customers/me/quotations"),
  });
  const action = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "accepted" | "rejected" }) =>
      apiRequest(`/customers/me/quotations/${id}/${status === "accepted" ? "accept" : "reject"}`, {
        method: "POST",
        body: JSON.stringify(status === "rejected" ? { reason: "Customer declined" } : {}),
      }),
    onSuccess: () => client.invalidateQueries({ queryKey: ["customer-quotations"] }),
  });
  return (
    <section>
      <header className="mb-8 border-b border-border pb-6">
        <p className="text-sm font-bold uppercase tracking-[.18em] text-primary">Your estimates</p>
        <h1 className="mt-2 font-serif text-4xl">Quotations</h1>
        <p className="mt-3 text-muted-foreground">
          Review, accept, or download your saved service estimates.
        </p>
      </header>
      {quotations.isError && (
        <p className="border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Could not load quotations.
        </p>
      )}
      <div className="space-y-3">
        {(quotations.data ?? []).map((quotation) => (
          <article className="border border-border bg-card p-5" key={quotation.id}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-mono text-xs text-muted-foreground">{quotation.id}</p>
                <p className="mt-2 text-lg font-semibold">
                  {formatMoney(quotation.totalPrice, quotation.currency)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {quotation.workerCount} workers ·{" "}
                  {new Date(quotation.createdAt).toLocaleDateString()}
                </p>
              </div>
              <StatusBadge status={quotation.status} />
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                className="border border-border px-4 py-2 text-sm font-semibold"
                href={`/dashboard/quotations/${quotation.id}`}
              >
                View details
              </Link>
              {quotation.status === "sent" || quotation.status === "under_review" ? (
                <>
                  <button
                    className="bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                    onClick={() => action.mutate({ id: quotation.id, status: "accepted" })}
                  >
                    Accept
                  </button>
                  <button
                    className="border border-destructive/30 px-4 py-2 text-sm font-semibold text-destructive"
                    onClick={() => action.mutate({ id: quotation.id, status: "rejected" })}
                  >
                    Reject
                  </button>
                </>
              ) : null}
            </div>
          </article>
        ))}
      </div>
      {quotations.isSuccess && quotations.data.length === 0 && (
        <p className="py-12 text-center text-sm text-muted-foreground">
          No saved quotations yet. Calculate an estimate on the public website, then create an
          account to save it.
        </p>
      )}
    </section>
  );
}
