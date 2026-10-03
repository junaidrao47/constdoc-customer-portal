"use client";


  const listItems = documents.data ?? [];
import { useQuery } from "@tanstack/react-query";
  return <div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#bb6b36]">Document centre</p><h1 className="mt-2 font-serif text-4xl">Your compliance files</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[#53605d]">Files are uploaded through a protected route and reviewed by your compliance team.</p><section className="mt-8 border border-dashed border-[#bb6b36]/60 bg-white p-6"><h2 className="font-serif text-2xl">Add a document</h2><p className="mt-2 text-sm text-[#53605d]">PDF, office files, and images up to 25MB.</p><div className="mt-5 flex flex-wrap items-center gap-3"><input type="file" disabled={isUploading} onChange={(event) => { setFile(event.target.files?.[0] ?? null); setError(""); setMessage(""); }} accept={ALLOWED.join(",")} className="max-w-full text-sm" /><button disabled={!file || isUploading} onClick={() => void upload()} className="bg-[#203a3a] px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">{isUploading ? "Uploading securely..." : "Upload securely"}</button></div>{error && <p role="alert" className="mt-4 border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}{message && <p role="status" className="mt-4 border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p>}</section><section className="mt-8 border border-[#203a3a]/10 bg-white p-6"><h2 className="font-serif text-2xl">Uploaded files</h2>{documents.isError && <p role="alert" className="mt-4 text-sm text-red-700">{documents.error instanceof Error ? documents.error.message : "Files could not be loaded."}</p>}{documents.isLoading && <p className="mt-4 text-sm text-[#53605d]">Loading your files...</p>}<div className="mt-5 space-y-3">{listItems.map((document) => <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#203a3a]/10 py-3" key={document.id}><div><p className="font-medium">{document.fileName}</p><p className="text-xs text-[#53605d]">Added {new Date(document.createdAt).toLocaleDateString()}</p>{document.status && <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-[#bb6b36]">{document.status.replace("_", " ")}</p>}</div><div className="flex flex-wrap items-center gap-2"><a href={document.downloadUrl} target="_blank" rel="noreferrer" className="bg-[#203a3a] px-3 py-2 text-xs font-semibold text-white">Download original</a>{document.approvedDownloadUrl && <a href={document.approvedDownloadUrl} target="_blank" rel="noreferrer" className="border border-emerald-700 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">Download approved</a>}</div></div>)}</div>{documents.isSuccess && listItems.length === 0 && <p className="mt-5 text-sm text-[#53605d]">No documents uploaded yet.</p>}</section></div>;
import { ApiError, apiRequest } from "@/lib/api";
import type { DocumentRecord } from "@/lib/types";

const MAX_BYTES = 25 * 1024 * 1024;
const ALLOWED = [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff"];

export default function DocumentsPage() {
  const documents = useQuery({ queryKey: ["customer-documents"], queryFn: () => apiRequest<DocumentRecord[]>("/customers/me/documents") });
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  async function upload() {
    if (!file) return;
    setMessage(""); setError("");
    const extension = `.${file.name.split(".").pop()?.toLowerCase() ?? ""}`;
    if (!ALLOWED.includes(extension)) { setError(`This file type is not supported. Allowed: ${ALLOWED.join(", ")}`); return; }
    if (file.size === 0) { setError("The selected file is empty."); return; }
    if (file.size > MAX_BYTES) { setError("Files must be 25MB or smaller."); return; }
    setIsUploading(true);
    try {
      setMessage("Preparing secure upload...");
      const target = await apiRequest<{ document: DocumentRecord; uploadMode: string; uploadUrl: string; uploadMethod: string; uploadHeaders?: Record<string, string> }>("/documents/upload-url", { method: "POST", body: JSON.stringify({ fileName: file.name, contentType: file.type || "application/octet-stream" }) });
      if (target.uploadMethod === "PUT") {
        const response = await fetch(target.uploadUrl, { method: "PUT", headers: target.uploadHeaders, body: file });
        if (!response.ok) throw new Error("Secure storage rejected the upload. Please try again.");
      } else {
        const body = new FormData(); body.append("file", file);
        await apiRequest(`/documents/${target.document.id}/upload`, { method: "POST", body });
      }
      setMessage("Document uploaded successfully and is awaiting review."); setFile(null); void documents.refetch();
    } catch (cause) { setMessage(""); setError(cause instanceof ApiError || cause instanceof Error ? cause.message : "Upload failed. Please try again."); }
    finally { setIsUploading(false); }
  }

  return <div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#bb6b36]">Document centre</p><h1 className="mt-2 font-serif text-4xl">Your compliance files</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[#53605d]">Files are uploaded through a protected route and reviewed by your compliance team.</p><section className="mt-8 border border-dashed border-[#bb6b36]/60 bg-white p-6"><h2 className="font-serif text-2xl">Add a document</h2><p className="mt-2 text-sm text-[#53605d]">PDF, office files, and images up to 25MB.</p><div className="mt-5 flex flex-wrap items-center gap-3"><input type="file" disabled={isUploading} onChange={(event) => { setFile(event.target.files?.[0] ?? null); setError(""); setMessage(""); }} accept={ALLOWED.join(",")} className="max-w-full text-sm" /><button disabled={!file || isUploading} onClick={() => void upload()} className="bg-[#203a3a] px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">{isUploading ? "Uploading securely..." : "Upload securely"}</button></div>{error && <p role="alert" className="mt-4 border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}{message && <p role="status" className="mt-4 border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p>}</section><section className="mt-8 border border-[#203a3a]/10 bg-white p-6"><h2 className="font-serif text-2xl">Uploaded files</h2>{documents.isError && <p role="alert" className="mt-4 text-sm text-red-700">{documents.error instanceof Error ? documents.error.message : "Files could not be loaded."}</p>}{documents.isLoading && <p className="mt-4 text-sm text-[#53605d]">Loading your files...</p>}<div className="mt-5 space-y-3">{(documents.data ?? []).map((document) => <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#203a3a]/10 py-3" key={document.id}><div><p className="font-medium">{document.fileName}</p><p className="text-xs text-[#53605d]">Added {new Date(document.createdAt).toLocaleDateString()}</p></div><span className="bg-[#f2e7db] px-3 py-1 text-xs font-bold uppercase tracking-wider">{document.status.replace("_", " ")}</span></div>)}</div>{documents.isSuccess && documents.data.length === 0 && <p className="mt-5 text-sm text-[#53605d]">No documents uploaded yet.</p>}</section></div>;
}
