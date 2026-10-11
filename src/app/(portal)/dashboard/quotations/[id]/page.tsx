"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { apiRequest, downloadRequest } from "@/lib/api";
import type { Quotation } from "@/lib/types";

export default function QuotationDetailPage() {
  const params = useParams<{ id: string }>();
  const quotation = useQuery({
    queryKey: ["customer-quotation", params.id],
    queryFn: () => apiRequest<Quotation>(`/customers/me/quotations/${params.id}`),
  });
  if (quotation.isLoading) return <p>Loading quotation...</p>;
  if (quotation.isError || !quotation.data)
    return (
      <p className="border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        Quotation could not be loaded.
      </p>
    );
  const record = quotation.data;
  return (
    <article className="max-w-2xl border border-[#203a3a]/10 bg-white p-6">
      <p className="text-xs font-bold uppercase tracking-[.18em] text-[#bb6b36]">
        Quotation detail
      </p>
      <h1 className="mt-2 font-serif text-4xl">PKR {Number(record.totalPrice).toLocaleString()}</h1>
      <p className="mt-2 text-sm text-[#53605d]">
        Status: {record.status} · {record.workerCount} workers
      </p>
      <div className="mt-8 space-y-3">
        {(record.items ?? []).map((item) => (
          <div
            className="flex justify-between border-b border-[#203a3a]/10 py-3 text-sm"
            key={item.serviceId}
          >
            <span>{item.service?.name ?? item.serviceId}</span>
            <span>PKR {Number(item.price).toLocaleString()}</span>
          </div>
        ))}
      </div>
      <button
        className="mt-8 bg-[#203a3a] px-5 py-3 text-sm font-semibold text-white"
        onClick={() =>
          void downloadRequest(`/quotations/${record.id}/pdf`, `quotation-${record.id}.pdf`)
        }
      >
        Download PDF
      </button>
    </article>
  );
}
