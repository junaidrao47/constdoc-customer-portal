"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { apiRequest } from "@/lib/api";
import { messageForError } from "@/lib/errors";
import { useLocale } from "@/lib/use-locale";
import { t } from "@/lib/messages";
import type { Checklist, DocumentRecord } from "@/lib/types";
import { StatusBadge } from "@/components/status-badge";
import { DocumentDetail } from "@/components/document-detail";
import { UploadDropzone } from "@/components/upload-dropzone";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded bg-muted" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full bg-primary transition-all" style={{ width: `${value}%` }} />
    </div>
  );
}

export default function DocumentsPage() {
  const locale = useLocale();
  const [selected, setSelected] = useState<DocumentRecord | null>(null);

  const checklist = useQuery({
    queryKey: ["customer-checklist"],
    queryFn: () => apiRequest<Checklist>("/customers/me/checklist"),
  });
  const documents = useQuery({
    queryKey: ["customer-documents"],
    queryFn: () => apiRequest<DocumentRecord[]>("/customers/me/documents"),
  });

  const docs = documents.data ?? [];
  const docById = new Map(docs.map((doc) => [doc.id, doc]));

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[.18em] text-primary">Document centre</p>
      <h1 className="mt-2 font-serif text-4xl">Your compliance files</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
        Upload each required document, track its review, and download the approved file when it is
        ready.
      </p>

      {/* Checklist */}
      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl">{t(locale, "doc.checklist")}</h2>
          {checklist.data && (
            <span className="text-sm text-muted-foreground">{checklist.data.completion}%</span>
          )}
        </div>
        {checklist.data && (
          <div className="mt-3">
            <ProgressBar value={checklist.data.completion} />
          </div>
        )}
        {checklist.isLoading && (
          <p className="mt-4 text-sm text-muted-foreground">{t(locale, "state.loading")}</p>
        )}
        {checklist.isError && (
          <p role="alert" className="mt-4 text-sm text-destructive">
            {messageForError(checklist.error, locale)}
          </p>
        )}
        {checklist.isSuccess && checklist.data.services.length === 0 && (
          <p className="mt-4 text-sm text-muted-foreground">
            {locale === "en"
              ? "No required documents yet. Your advisor will add them once a service is active."
              : "Aún no hay documentos requeridos. Tu asesor los agregará cuando haya un servicio activo."}
          </p>
        )}

        <div className="mt-6 grid gap-6">
          {checklist.data?.services.map((service) => (
            <div key={service.serviceId} className="border border-border bg-card p-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-serif text-xl">{service.serviceName}</h3>
                <span className="text-sm text-muted-foreground">{service.completion}%</span>
              </div>
              <div className="mt-2">
                <ProgressBar value={service.completion} />
              </div>
              <ul className="mt-4 grid gap-3">
                {service.requirements.map((requirement) => {
                  const doc = requirement.documentId ? docById.get(requirement.documentId) : null;
                  return (
                    <li key={requirement.id} className="border-t border-border pt-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="font-medium">
                            {requirement.name}
                            {!requirement.isRequired && (
                              <span className="ml-2 text-xs text-muted-foreground">(optional)</span>
                            )}
                          </p>
                          {requirement.description && (
                            <p className="text-sm text-muted-foreground">{requirement.description}</p>
                          )}
                        </div>
                        <StatusBadge
                          status={requirement.status ?? (requirement.submitted ? "under_review" : "pending")}
                          locale={locale}
                        />
                      </div>
                      {requirement.submitted && doc ? (
                        <button
                          type="button"
                          onClick={() => setSelected(doc)}
                          className="mt-2 text-sm font-semibold text-primary"
                        >
                          {t(locale, "doc.timeline")} →
                        </button>
                      ) : (
                        <div className="mt-3">
                          <UploadDropzone
                            mode="new"
                            serviceId={service.serviceId}
                            requirementId={requirement.id}
                            onComplete={() => {
                              void checklist.refetch();
                              void documents.refetch();
                            }}
                          />
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* All documents */}
      <section className="mt-10 border border-border bg-card p-6">
        <h2 className="font-serif text-2xl">{t(locale, "doc.versions")}</h2>
        {documents.isLoading && (
          <p className="mt-4 text-sm text-muted-foreground">{t(locale, "state.loading")}</p>
        )}
        {documents.isError && (
          <p role="alert" className="mt-4 text-sm text-destructive">
            {messageForError(documents.error, locale)}
          </p>
        )}
        <div className="mt-5 space-y-3">
          {docs.map((doc) => (
            <div
              key={doc.id}
              className="flex flex-wrap items-center justify-between gap-3 border-b border-border py-3"
            >
              <div>
                <p className="font-medium">{doc.fileName}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(doc.createdAt).toLocaleDateString()}
                </p>
                <StatusBadge status={doc.status} locale={locale} className="mt-1" />
              </div>
              <button
                type="button"
                onClick={() => setSelected(doc)}
                className="bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
              >
                {t(locale, "doc.timeline")}
              </button>
            </div>
          ))}
        </div>
        {documents.isSuccess && docs.length === 0 && (
          <p className="mt-5 text-sm text-muted-foreground">{t(locale, "doc.noDocuments")}</p>
        )}
      </section>

      <Sheet open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle className="truncate">{selected?.fileName}</SheetTitle>
          </SheetHeader>
          <div className="px-4">
            {selected && (
              <DocumentDetail
                document={docById.get(selected.id) ?? selected}
                locale={locale}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
