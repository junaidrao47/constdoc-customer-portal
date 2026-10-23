"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest, downloadRequest } from "@/lib/api";
import { useStatusContract, canResubmit } from "@/lib/documents";
import { messageForError } from "@/lib/errors";
import { formatDate } from "@/lib/format";
import { t, type Locale } from "@/lib/messages";
import { StatusBadge } from "@/components/status-badge";
import { VersionRow } from "@/components/document-preview";
import { UploadDropzone } from "@/components/upload-dropzone";
import type { DocumentHistoryEntry, DocumentRecord, DocumentVersion } from "@/lib/types";
import { useState } from "react";

export function DocumentDetail({
  document,
  locale,
}: {
  document: DocumentRecord;
  locale: Locale;
}) {
  const client = useQueryClient();
  const contract = useStatusContract();
  const [downloadError, setDownloadError] = useState("");

  const versions = useQuery({
    queryKey: ["doc-versions", document.id],
    queryFn: () => apiRequest<DocumentVersion[]>(`/documents/${document.id}/versions`),
  });
  const history = useQuery({
    queryKey: ["doc-history", document.id],
    queryFn: () => apiRequest<DocumentHistoryEntry[]>(`/documents/${document.id}/history`),
  });

  const refresh = () => {
    void client.invalidateQueries({ queryKey: ["customer-documents"] });
    void client.invalidateQueries({ queryKey: ["customer-checklist"] });
    void client.invalidateQueries({ queryKey: ["doc-versions", document.id] });
    void client.invalidateQueries({ queryKey: ["doc-history", document.id] });
  };

  const sortedVersions = [...(versions.data ?? [])].sort((a, b) => a.versionNo - b.versionNo);
  const hasOfficial = sortedVersions.some((v) => v.kind === "official") || Boolean(document.approvedDownloadUrl);
  const resubmit = canResubmit(contract.data, document.status);

  async function downloadOfficial() {
    setDownloadError("");
    try {
      const target = await apiRequest<{ downloadUrl: string; downloadMode: "s3" | "local" }>(
        `/documents/${document.id}/approved-download-url`,
      );
      if (target.downloadMode === "s3") {
        window.open(target.downloadUrl, "_blank", "noopener");
        return;
      }
      await downloadRequest(
        `/documents/${document.id}/download?version=approved`,
        document.approvedFileName ?? document.fileName,
      );
    } catch (cause) {
      setDownloadError(messageForError(cause, locale));
    }
  }

  return (
    <div className="grid gap-6 px-1 pb-6">
      <div className="flex items-center gap-3">
        <StatusBadge status={document.status} locale={locale} />
        {hasOfficial && (
          <button
            type="button"
            onClick={() => void downloadOfficial()}
            className="rounded-full border border-success/40 bg-success/10 px-4 py-1.5 text-sm font-semibold text-success"
          >
            {t(locale, "doc.downloadOfficial")}
          </button>
        )}
      </div>
      {downloadError && (
        <p role="alert" className="text-sm text-destructive">
          {downloadError}
        </p>
      )}

      {resubmit && (
        <section className="grid gap-2">
          <h3 className="text-sm font-semibold">{t(locale, "doc.uploadNewVersion")}</h3>
          <UploadDropzone mode="version" documentId={document.id} onComplete={refresh} />
        </section>
      )}

      <section className="grid gap-2">
        <h3 className="text-sm font-semibold">
          {t(locale, "doc.versions")} ({sortedVersions.length})
        </h3>
        {versions.isLoading && <p className="text-sm text-muted-foreground">{t(locale, "state.loading")}</p>}
        {versions.isError && (
          <p role="alert" className="text-sm text-destructive">
            {messageForError(versions.error, locale)}
          </p>
        )}
        <ul className="grid gap-2">
          {sortedVersions.map((version) => (
            <VersionRow key={version.id} documentId={document.id} version={version} />
          ))}
        </ul>
      </section>

      <section className="grid gap-2">
        <h3 className="text-sm font-semibold">{t(locale, "doc.timeline")}</h3>
        {history.isLoading && <p className="text-sm text-muted-foreground">{t(locale, "state.loading")}</p>}
        {history.isError && (
          <p role="alert" className="text-sm text-destructive">
            {messageForError(history.error, locale)}
          </p>
        )}
        <ol className="grid gap-3 border-l border-border pl-4">
          {(history.data ?? []).map((entry) => (
            <li key={entry.id} className="relative">
              <span className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-primary" />
              <div className="flex flex-wrap items-center gap-2 text-sm">
                {entry.fromStatus && <StatusBadge status={entry.fromStatus} locale={locale} />}
                <span aria-hidden>→</span>
                <StatusBadge status={entry.toStatus} locale={locale} />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatDate(entry.createdAt)}
                {entry.changedBy ? ` · ${entry.changedBy.name ?? entry.changedBy.email}` : ""}
              </p>
              {entry.note && <p className="mt-1 text-sm">{entry.note}</p>}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
