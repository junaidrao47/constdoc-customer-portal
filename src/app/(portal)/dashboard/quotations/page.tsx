"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { apiRequest } from "@/lib/api";
import type { Quotation } from "@/lib/types";

const labels: Record<string, string> = { draft: "Draft", sent: "Sent", under_review: "Under review", accepted: "Accepted", rejected: "Rejected", expired: "Expired" };

export default function QuotationsPage() {
  const client = useQueryClient();
  const quotations = useQuery({ queryKey: ["customer-quotations"], queryFn: () => apiRequest<Quotation[]>("/customers/me/quotations") });
  const action = useMutation({ mutationFn: ({ id, status }: { id: string; status: "accepted" | "rejected" }) => apiRequest(`/customers/me/quotations/${id}/${status === "accepted" ? "accept" : "reject"}`, { method: "POST", body: JSON.stringify(status === "rejected" ? { reason: "Customer declined" } : {}) }), onSuccess: () => client.invalidateQueries({ queryKey: ["customer-quotations"] }) });
  return <section><header className="mb-8 border-b border-[#203a3a]/10 pb-6"><p className="text-sm font-bold uppercase tracking-[.18em] text-[#bb6b36]">Your estimates</p><h1 className="mt-2 font-serif text-4xl">Quotations</h1><p className="mt-3 text-[#53605d]">Review, accept, or download your saved service estimates.</p></header>{quotations.isError && <p className="border border-red-200 bg-red-50 p-4 text-sm text-red-800">Could not load quotations.</p>}<div className="space-y-3">{(quotations.data ?? []).map((quotation) => <article className="border border-[#203a3a]/10 bg-white p-5" key={quotation.id}><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="font-mono text-xs text-[#53605d]">{quotation.id}</p><p className="mt-2 text-lg font-semibold">PKR {Number(quotation.totalPrice).toLocaleString()}</p><p className="mt-1 text-sm text-[#53605d]">{quotation.workerCount} workers · {new Date(quotation.createdAt).toLocaleDateString()}</p></div><span className="bg-[#f2e7db] px-3 py-1 text-xs font-bold uppercase tracking-wider">{labels[quotation.status]}</span></div><div className="mt-5 flex flex-wrap gap-3"><Link className="border border-[#203a3a]/20 px-4 py-2 text-sm font-semibold" href={`/dashboard/quotations/${quotation.id}`}>View details</Link>{quotation.status === "sent" || quotation.status === "under_review" ? <><button className="bg-[#203a3a] px-4 py-2 text-sm font-semibold text-white" onClick={() => action.mutate({ id: quotation.id, status: "accepted" })}>Accept</button><button className="border border-red-200 px-4 py-2 text-sm font-semibold text-red-700" onClick={() => action.mutate({ id: quotation.id, status: "rejected" })}>Reject</button></> : null}</div></article>)}</div>{quotations.isSuccess && quotations.data.length === 0 && <p className="py-12 text-center text-sm text-[#53605d]">No saved quotations yet. Calculate an estimate on the public website, then create an account to save it.</p>}</section>;
}
