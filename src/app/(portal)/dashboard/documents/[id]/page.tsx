"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { messageForError } from "@/lib/errors";
import { formatDate } from "@/lib/format";
import { useLocale } from "@/lib/use-locale";
import { t } from "@/lib/messages";
import { StatusBadge } from "@/components/status-badge";
import { PhasesStepper, SegmentedProgress } from "@/components/phases-stepper";
import { DocumentDetail } from "@/components/document-detail";
import type { DocumentDetail as DocumentDetailData } from "@/lib/types";

export default function CustomerDocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const locale = useLocale();

  const doc = useQuery({
    queryKey: ["doc-detail", id],
    queryFn: () => apiRequest<DocumentDetailData>(`/documents/${id}`),
  });

  return (
    <div className="grid gap-8">
      <Link href="/dashboard/documents" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
        <ArrowLeft size={15} /> {t(locale, "doc.back")}
      </Link>

      {doc.isLoading && <p className="text-sm text-muted-foreground">{t(locale, "state.loading")}</p>}
      {doc.isError && (
        <p role="alert" className="text-sm text-destructive">
          {messageForError(doc.error, locale)}
        </p>
      )}

      {doc.data && (
        <>
          <header>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-serif text-3xl">{doc.data.fileName}</h1>
              <StatusBadge status={doc.data.status} locale={locale} />
            </div>
            {doc.data.targetDate && (
              <p className="mt-2 text-sm text-muted-foreground">
                {t(locale, "doc.overallTarget")}: {formatDate(doc.data.targetDate)}
              </p>
            )}
            {doc.data.phases.length > 0 && (
              <div className="mt-4 max-w-md">
                <SegmentedProgress statuses={doc.data.phases.map((p) => p.status)} />
                <p className="mt-2 text-xs text-muted-foreground">
                  {doc.data.progress.completed}/{doc.data.progress.total} · {doc.data.progress.percent}%
                </p>
              </div>
            )}
          </header>

          {/* Approval phases (read-only, §11.6) */}
          <section className="border border-border bg-card p-6">
            <h2 className="font-serif text-xl">{t(locale, "doc.phases")}</h2>
            <div className="mt-5">
              {doc.data.phases.length > 0 ? (
                <PhasesStepper documentId={id} phases={doc.data.phases} locale={locale} />
              ) : (
                <p className="text-sm text-muted-foreground">{t(locale, "doc.noPhases")}</p>
              )}
            </div>
          </section>

          {/* Viewer (version previews), versions, timeline, resubmit, official download */}
          <section className="border border-border bg-card p-6">
            <DocumentDetail document={doc.data} locale={locale} />
          </section>
        </>
      )}
    </div>
  );
}
