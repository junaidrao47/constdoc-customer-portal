"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Mail, UserRound } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { messageForError } from "@/lib/errors";
import { formatDate } from "@/lib/format";
import { useLocale } from "@/lib/use-locale";
import { t } from "@/lib/messages";
import { StatusBadge } from "@/components/status-badge";
import { SegmentedProgress } from "@/components/phases-stepper";
import type { CustomerDocument, Dashboard } from "@/lib/types";

export default function DashboardPage() {
  const locale = useLocale();

  const dashboard = useQuery({
    queryKey: ["customer-dashboard"],
    queryFn: () => apiRequest<Dashboard>("/customers/me/dashboard"),
  });
  const documents = useQuery({
    queryKey: ["customer-documents"],
    queryFn: () => apiRequest<CustomerDocument[]>("/customers/me/documents"),
  });

  const data = dashboard.data;
  const docs = documents.data ?? [];

  // Group documents by their owning service for the "documents by service" view (§11.6).
  const groups = new Map<string, { name: string; docs: CustomerDocument[] }>();
  for (const doc of docs) {
    const key = doc.service?.id ?? "none";
    const name = doc.service
      ? (locale === "en" ? doc.service.nameEn : doc.service.nameEs)
      : locale === "en"
        ? "Other"
        : "Otros";
    if (!groups.has(key)) groups.set(key, { name, docs: [] });
    groups.get(key)!.docs.push(doc);
  }

  const recent = [...docs]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 6);

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[.18em] text-primary">{t(locale, "dash.title")}</p>
      <h1 className="mt-2 font-serif text-4xl">
        {data ? t(locale, "dash.hello", { name: data.profile.name ?? data.profile.email }) : t(locale, "dash.title")}
      </h1>

      {dashboard.isError && (
        <p role="alert" className="mt-6 text-sm text-destructive">
          {messageForError(dashboard.error, locale)}
        </p>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Manager card */}
        <section className="border border-border bg-card p-6 lg:col-span-1">
          <h2 className="font-serif text-xl">{t(locale, "dash.manager")}</h2>
          {dashboard.isLoading ? (
            <p className="mt-3 text-sm text-muted-foreground">{t(locale, "state.loading")}</p>
          ) : data?.manager ? (
            <div className="mt-4 flex items-start gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <UserRound size={18} />
              </span>
              <div className="min-w-0">
                <p className="truncate font-medium">{data.manager.name ?? data.manager.email}</p>
                <a
                  href={`mailto:${data.manager.email}`}
                  className="mt-0.5 flex items-center gap-1 text-sm text-primary"
                >
                  <Mail size={13} /> <span className="truncate">{data.manager.email}</span>
                </a>
              </div>
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">{t(locale, "dash.noManager")}</p>
          )}
        </section>

        {/* Services / packages */}
        <section className="border border-border bg-card p-6 lg:col-span-2">
          <h2 className="font-serif text-xl">{t(locale, "dash.services")}</h2>
          {dashboard.isLoading ? (
            <p className="mt-3 text-sm text-muted-foreground">{t(locale, "state.loading")}</p>
          ) : data && data.subscriptions.length > 0 ? (
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {data.subscriptions.map((sub, index) => (
                <li key={(sub.id as string) ?? index} className="border border-border p-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{locale === "en" ? "Package" : "Paquete"}</span>
                    {sub.status && <StatusBadge status={sub.status} locale={locale} />}
                  </div>
                  {(sub.startDate || sub.endDate) && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {sub.startDate ? formatDate(sub.startDate) : "—"} →{" "}
                      {sub.endDate ? formatDate(sub.endDate) : "—"}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">{t(locale, "dash.noServices")}</p>
          )}
        </section>
      </div>

      {/* Documents by service */}
      <section className="mt-8">
        <h2 className="font-serif text-2xl">{t(locale, "dash.documents")}</h2>
        {documents.isLoading && (
          <p className="mt-4 text-sm text-muted-foreground">{t(locale, "state.loading")}</p>
        )}
        {documents.isError && (
          <p role="alert" className="mt-4 text-sm text-destructive">
            {messageForError(documents.error, locale)}
          </p>
        )}
        {documents.isSuccess && docs.length === 0 && (
          <p className="mt-4 text-sm text-muted-foreground">{t(locale, "doc.noDocuments")}</p>
        )}
        <div className="mt-5 grid gap-6">
          {[...groups.entries()].map(([key, group]) => (
            <div key={key} className="border border-border bg-card p-5">
              <h3 className="font-serif text-lg">{group.name}</h3>
              <ul className="mt-4 grid gap-4">
                {group.docs.map((doc) => (
                  <li key={doc.id} className="border-t border-border pt-4 first:border-t-0 first:pt-0">
                    <Link href={`/dashboard/documents/${doc.id}`} className="group block">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-medium group-hover:text-primary">{doc.fileName}</p>
                        <StatusBadge status={doc.status} locale={locale} />
                      </div>
                      <div className="mt-3">
                        {doc.phaseStatuses.length > 0 ? (
                          <SegmentedProgress statuses={doc.phaseStatuses} />
                        ) : (
                          <p className="text-xs text-muted-foreground">{t(locale, "dash.noPhases")}</p>
                        )}
                      </div>
                      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                        <span>{doc.progress.completed}/{doc.progress.total} · {doc.progress.percent}%</span>
                        {doc.nextTargetDate && (
                          <span>
                            {t(locale, "dash.nextTarget")}: {formatDate(doc.nextTargetDate)}
                          </span>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Recent activity */}
      <section className="mt-8 border border-border bg-card p-6">
        <h2 className="font-serif text-xl">{t(locale, "dash.recent")}</h2>
        {recent.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">{t(locale, "dash.noRecent")}</p>
        ) : (
          <ul className="mt-4 grid gap-3">
            {recent.map((doc) => (
              <li key={doc.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <Link href={`/dashboard/documents/${doc.id}`} className="font-medium hover:text-primary">
                  {doc.fileName}
                </Link>
                <span className="flex items-center gap-3 text-xs text-muted-foreground">
                  {t(locale, "dash.updated")} {formatDate(doc.updatedAt)}
                  <StatusBadge status={doc.status} locale={locale} />
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
