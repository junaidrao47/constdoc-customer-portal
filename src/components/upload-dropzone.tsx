"use client";

import { useRef, useState } from "react";
import { UploadCloud, X } from "lucide-react";
import { apiRequest, ApiError } from "@/lib/api";
import { messageForError } from "@/lib/errors";
import { useLocale } from "@/lib/use-locale";
import { t, type Locale } from "@/lib/messages";
import { useAuth } from "@/lib/auth-context";
import { createUploadTarget, putBytes } from "@/lib/upload";

const MAX_BYTES = 25 * 1024 * 1024;
const ALLOWED = [
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".tif",
  ".tiff",
];

type ItemStatus = "queued" | "uploading" | "done" | "error";
interface QueueItem {
  id: string;
  file: File;
  status: ItemStatus;
  progress: number;
  error?: string;
  controller?: AbortController;
}

export interface UploadDropzoneProps {
  /**
   * How to create the version intent. `new` starts a brand-new document
   * (`POST /documents/upload-url`) with the given service/requirement; `version` adds a
   * resubmission to an existing document (`POST /documents/:id/versions/upload-intent`).
   */
  mode: "new" | "version";
  documentId?: string;
  serviceId?: string;
  requirementId?: string;
  onComplete?: () => void;
}

function validate(file: File, locale: Locale): string | null {
  const ext = `.${file.name.split(".").pop()?.toLowerCase() ?? ""}`;
  if (!ALLOWED.includes(ext)) return messageForError(new ApiError("", 415, { code: "FILE_TYPE_NOT_ALLOWED" }), locale);
  if (file.size === 0) return locale === "en" ? "The file is empty." : "El archivo está vacío.";
  if (file.size > MAX_BYTES) return messageForError(new ApiError("", 413, { code: "FILE_TOO_LARGE" }), locale);
  return null;
}

export function UploadDropzone({
  mode,
  documentId,
  serviceId,
  requirementId,
  onComplete,
}: UploadDropzoneProps) {
  const { session } = useAuth();
  const token = session?.accessToken ?? null;
  const locale = useLocale();
  const [items, setItems] = useState<QueueItem[]>([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  function patch(id: string, next: Partial<QueueItem>) {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...next } : item)));
  }

  async function run(item: QueueItem) {
    const controller = new AbortController();
    patch(item.id, { status: "uploading", progress: 0, error: undefined, controller });
    try {
      const createPath =
        mode === "new"
          ? "/documents/upload-url"
          : `/documents/${documentId}/versions/upload-intent`;
      const body: Record<string, unknown> = {
        fileName: item.file.name,
        contentType: item.file.type || "application/octet-stream",
        ...(mode === "new" ? { serviceId, requirementId } : {}),
      };
      const target = await createUploadTarget(createPath, body, token);
      const docId = target.document?.id ?? documentId!;
      await putBytes(docId, target, item.file, token, {
        onProgress: (percent) => patch(item.id, { progress: percent }),
        signal: controller.signal,
      });
      await apiRequest(`/documents/${docId}/versions/${target.versionId}/confirm`, { method: "POST" });
      patch(item.id, { status: "done", progress: 100 });
      onComplete?.();
    } catch (cause) {
      if (cause instanceof DOMException && cause.name === "AbortError") {
        patch(item.id, { status: "error", error: locale === "en" ? "Cancelled." : "Cancelado." });
        return;
      }
      patch(item.id, { status: "error", error: messageForError(cause, locale) });
    }
  }

  function enqueue(files: FileList | File[]) {
    const next: QueueItem[] = [];
    for (const file of Array.from(files)) {
      const invalid = validate(file, locale);
      const id = `${file.name}-${file.size}-${crypto.randomUUID()}`;
      next.push({
        id,
        file,
        status: invalid ? "error" : "queued",
        progress: 0,
        error: invalid ?? undefined,
      });
    }
    setItems((current) => [...current, ...next]);
    for (const item of next) if (item.status === "queued") void run(item);
  }

  return (
    <div className="grid gap-3">
      <div
        className={`flex flex-col items-center gap-2 border border-dashed p-5 text-center text-sm ${dragging ? "border-primary bg-primary/5" : "border-border"}`}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          if (event.dataTransfer.files?.length) enqueue(event.dataTransfer.files);
        }}
      >
        <UploadCloud className="text-primary" size={22} />
        <p className="text-muted-foreground">{t(locale, "upload.drop")}</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ALLOWED.join(",")}
          className="hidden"
          onChange={(event) => {
            if (event.target.files?.length) enqueue(event.target.files);
            event.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-full border border-primary px-4 py-1.5 text-xs font-semibold text-primary"
        >
          {t(locale, "upload.drop")}
        </button>
      </div>

      {items.length > 0 && (
        <ul className="grid gap-2">
          {items.map((item) => (
            <li key={item.id} className="border border-border bg-card p-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate">{item.file.name}</span>
                {item.status === "uploading" && (
                  <button
                    type="button"
                    aria-label={t(locale, "upload.cancel")}
                    onClick={() => item.controller?.abort()}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
              {item.status === "uploading" && (
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded bg-muted">
                  <div className="h-full bg-primary transition-all" style={{ width: `${item.progress}%` }} />
                </div>
              )}
              {item.status === "done" && <p className="mt-1 text-xs text-success">100%</p>}
              {item.status === "error" && (
                <div className="mt-1 flex items-center justify-between gap-2">
                  <p role="alert" className="text-xs text-destructive">
                    {item.error}
                  </p>
                  <button
                    type="button"
                    onClick={() => void run({ ...item, status: "queued", progress: 0 })}
                    className="text-xs font-semibold text-primary"
                  >
                    {t(locale, "upload.retry")}
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
