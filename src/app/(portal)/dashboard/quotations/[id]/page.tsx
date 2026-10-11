"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { apiRequest, downloadRequest } from "@/lib/api";
import type { Quotation } from "@/lib/types";
import { formatMoney } from "@/lib/format";

export default function QuotationDetailPage() {
  const params = useParams<{ id: string }>();
  const quotation = useQuery({
    queryKey: ["customer-quotation", params.id],
    queryFn: () => apiRequest<Quotation>(`/customers/me/quotations/${params.id}`),
  });
  if (quotation.isLoading) return <p>Loading quotation...</p>;
  if (quotation.isError || !quotation.data)
    return (
      <p className="border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
        Quotation could not be loaded.
      </p>
    );
  const record = quotation.data;
  return (
    <article className="max-w-2xl border border-border bg-card p-6">
      <p className="text-xs font-bold uppercase tracking-[.18em] text-primary">Quotation detail</p>
      <h1 className="mt-2 font-serif text-4xl">
        {formatMoney(record.totalPrice, record.currency)}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Status: {record.status} · {record.workerCount} workers
      </p>
      <div className="mt-8 space-y-3">
        {(record.items ?? []).map((item) => (
          <div
            className="flex justify-between border-b border-border py-3 text-sm"
            key={item.serviceId}
          >
            <span>{item.service?.name ?? item.serviceId}</span>
            <span>{formatMoney(item.price, record.currency)}</span>
          </div>
        ))}
      </div>
      <button
        className="mt-8 bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
        onClick={() =>
          void downloadRequest(`/quotations/${record.id}/pdf`, `quotation-${record.id}.pdf`)
        }
      >
        Download PDF
      </button>
    </article>
  );
}
