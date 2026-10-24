"use client";

import { useState } from "react";
import { Download, Eye } from "lucide-react";
import { apiRequest, downloadRequest } from "@/lib/api";
import { messageForError } from "@/lib/errors";
import { useLocale } from "@/lib/use-locale";
import { formatDate } from "@/lib/format";
import type { DocumentVersion } from "@/lib/types";

const KIND_LABEL: Record<string, string> = {
  customer: "You",
  staff_on_behalf: "Staff",
  official: "Official",
  phase_result: "Result",
};

/** One version row: metadata plus inline preview (PDF/image) and an authenticated download. */
export function VersionRow({
  documentId,
  version,
}: {
  documentId: string;
  version: DocumentVersion;
}) {
  const locale = useLocale();
  const [preview, setPreview] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");

  const isPdf = version.mimeType === "application/pdf";
  const isImage = (version.mimeType ?? "").startsWith("image/");

  async function togglePreview() {
    setError("");
    if (open) {
      setOpen(false);
      return;
    }
    try {
      if (!preview) {
        const target = await apiRequest<{ downloadUrl: string }>(
          `/documents/${documentId}/versions/${version.id}/preview-url`,
        );
        setPreview(target.downloadUrl);
      }
      setOpen(true);
    } catch (cause) {
      setError(messageForError(cause, locale));
    }
  }

  async function download() {
    setError("");
    try {
      const target = await apiRequest<{ downloadUrl: string; downloadMode: "s3" | "local" }>(
        `/documents/${documentId}/versions/${version.id}/download-url`,
      );
      if (target.downloadMode === "s3") {
        window.open(target.downloadUrl, "_blank", "noopener");
        return;
      }
      await downloadRequest(
        `/documents/${documentId}/versions/${version.id}/download`,
        version.fileName,
      );
    } catch (cause) {
      setError(messageForError(cause, locale));
    }
  }

  return (
    <li className="border border-border bg-card p-3 text-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-medium">
            v{version.versionNo} · {version.fileName}
          </p>
          <p className="text-xs text-muted-foreground">
            {KIND_LABEL[version.kind] ?? version.kind} · {formatDate(version.createdAt)}
          </p>
        </div>
        <div className="flex shrink-0 gap-1">
          {(isPdf || isImage) && (
            <button
              type="button"
              aria-label={`Preview v${version.versionNo}`}
              onClick={() => void togglePreview()}
              className="inline-flex h-8 w-8 items-center justify-center rounded hover:bg-muted"
            >
              <Eye size={15} />
            </button>
          )}
          <button
            type="button"
            aria-label={`Download v${version.versionNo}`}
            onClick={() => void download()}
            className="inline-flex h-8 w-8 items-center justify-center rounded hover:bg-muted"
          >
            <Download size={15} />
          </button>
        </div>
      </div>
      {error && (
        <p role="alert" className="mt-1 text-xs text-destructive">
          {error}
        </p>
      )}
      {open && preview && (
        <div className="mt-3">
          {isPdf ? (
            <iframe title={`v${version.versionNo}`} src={preview} className="h-96 w-full border border-border" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt={version.fileName} className="max-h-96 w-auto border border-border" />
          )}
        </div>
      )}
    </li>
  );
}
