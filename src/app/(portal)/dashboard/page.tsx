"use client";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { apiRequest } from "@/lib/api";
import type { Dashboard } from "@/lib/types";
import { StatusBadge } from "@/components/status-badge";
export default function DashboardPage() {
  const dashboard = useQuery({
    queryKey: ["customer-dashboard"],
    queryFn: () => apiRequest<Dashboard>("/customers/me/dashboard"),
  });
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[.18em] text-primary">
        Customer workspace
      </p>
      <h1 className="mt-2 font-serif text-4xl">Your compliance overview</h1>
      <p className="mt-3 text-muted-foreground">
        A clear view of the files and service milestones that need your attention.
      </p>
      {dashboard.isError && (
        <p className="mt-8 bg-destructive/10 p-4 text-sm text-destructive">
          Unable to load your dashboard.
        </p>
      )}
      {dashboard.data && (
        <>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <Stat label="Documents" value={dashboard.data.stats.documentsCount} />
            <Stat label="Needs attention" value={dashboard.data.attention.documents} />
            <Stat label="Unpaid invoices" value={dashboard.data.attention.unpaidInvoices} />
          </div>
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <section className="border border-border bg-card p-6">
              <h2 className="font-serif text-2xl">Recent documents</h2>
              {dashboard.data.documents.map((document) => (
                <div
                  className="mt-4 flex items-center justify-between border-b border-border pb-3 text-sm"
                  key={document.id}
                >
                  <span>{document.fileName}</span>
                  <StatusBadge status={document.status} />
                </div>
              ))}
              <Link
                className="mt-6 inline-block text-sm font-semibold text-primary"
                href="/dashboard/documents"
              >
                View documents
              </Link>
            </section>
            <section className="border border-border bg-card p-6">
              <h2 className="font-serif text-2xl">Billing snapshot</h2>
              {dashboard.data.invoices.map((invoice) => (
                <div
                  className="mt-4 flex items-center justify-between border-b border-border pb-3 text-sm"
                  key={String(invoice.id)}
                >
                  <span>Invoice {String(invoice.id).slice(0, 8)}</span>
                  <span>{String(invoice.status)}</span>
                </div>
              ))}
              <Link
                className="mt-6 inline-block text-sm font-semibold text-primary"
                href="/dashboard/billing"
              >
                View billing
              </Link>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-border bg-card p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 font-serif text-4xl">{value}</p>
    </div>
  );
}
