"use client";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
export default function BillingPage() {
  const subscriptions = useQuery({
    queryKey: ["subscriptions"],
    queryFn: () => apiRequest<Array<Record<string, string>>>("/customers/me/subscriptions"),
  });
  const invoices = useQuery({
    queryKey: ["invoices"],
    queryFn: () =>
      apiRequest<Array<Record<string, string | number | null>>>("/customers/me/invoices"),
  });
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[.18em] text-[#bb6b36]">Billing</p>
      <h1 className="mt-2 font-serif text-4xl">Services and invoices</h1>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="border border-[#203a3a]/10 bg-white p-6">
          <h2 className="font-serif text-2xl">Subscriptions</h2>
          {subscriptions.data?.map((item) => (
            <div className="mt-5 border-b border-[#203a3a]/10 pb-4" key={item.id}>
              <p className="font-semibold">{item.packageId}</p>
              <p className="mt-1 text-sm text-[#53605d]">
                {item.status} · {item.startDate} to {item.endDate}
              </p>
            </div>
          ))}
        </section>
        <section className="border border-[#203a3a]/10 bg-white p-6">
          <h2 className="font-serif text-2xl">Invoices</h2>
          {invoices.data?.map((item) => (
            <div
              className="mt-5 flex justify-between border-b border-[#203a3a]/10 pb-4 text-sm"
              key={String(item.id)}
            >
              <span>{String(item.id).slice(0, 8)}</span>
              <span>
                {String(item.amount)} · {String(item.status)}
              </span>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
