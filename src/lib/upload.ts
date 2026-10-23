import { ApiError } from "./api";
import { acceptLanguage, readClientLocale } from "./locale";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

export interface UploadTarget {
  uploadMode: "s3" | "local";
  upload: { method: string; url: string; fields: Record<string, string> };
  versionId: string;
}

export interface ProgressOptions {
  onProgress?: (percent: number) => void;
  signal?: AbortSignal;
}

/**
 * Sends the bytes for an issued upload target with a real progress bar.
 *
 * `fetch` cannot report upload progress, so this uses `XMLHttpRequest`. In S3 mode it
 * POSTs the multipart form to the presigned S3 URL (the policy is the credential — no
 * bearer); in local mode it POSTs to the API's version-upload route with the token. S3's
 * own `content-length-range`/type conditions enforce size and type server-side.
 */
export function putBytes(
  documentId: string,
  target: UploadTarget,
  file: File,
  token: string | null,
  { onProgress, signal }: ProgressOptions = {},
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const isS3 = target.uploadMode === "s3";
    const url = isS3
      ? target.upload.url
      : `${API_URL}/documents/${documentId}/versions/${target.versionId}/upload`;
    xhr.open("POST", url);
    if (!isS3 && token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    if (signal) {
      if (signal.aborted) {
        reject(new DOMException("Upload cancelled", "AbortError"));
        return;
      }
      signal.addEventListener("abort", () => xhr.abort(), { once: true });
    }

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    });
    xhr.addEventListener("abort", () => reject(new DOMException("Upload cancelled", "AbortError")));
    xhr.addEventListener("error", () => reject(new ApiError("NETWORK", 0, { code: "NETWORK" })));
    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
        return;
      }
      let code: string | undefined;
      let message = "The upload failed.";
      try {
        const payload = JSON.parse(xhr.responseText);
        code = payload?.error?.code;
        message = payload?.error?.message ?? message;
      } catch {
        // S3 returns XML on error; the status code is enough to map it.
      }
      reject(new ApiError(message, xhr.status, { code }));
    });

    const form = new FormData();
    if (isS3) for (const [k, v] of Object.entries(target.upload.fields)) form.append(k, v);
    form.append("file", file);
    xhr.send(form);
  });
}

/** Creates a version intent (first upload or a resubmission) for the API locale. */
export async function createUploadTarget(
  path: string,
  body: Record<string, unknown>,
  token: string | null,
): Promise<UploadTarget & { document?: { id: string } }> {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept-Language": acceptLanguage(readClientLocale()),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const payload = (await response.json().catch(() => null)) as
    | { data?: UploadTarget & { document?: { id: string } }; error?: { code?: string; message?: string } }
    | null;
  if (!response.ok || !payload?.data) {
    throw new ApiError(payload?.error?.message ?? "Could not start the upload.", response.status, {
      code: payload?.error?.code,
    });
  }
  return payload.data;
}
