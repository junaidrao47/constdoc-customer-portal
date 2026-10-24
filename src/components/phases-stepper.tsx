"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { apiRequest, downloadRequest } from "@/lib/api";
import { messageForError } from "@/lib/errors";
import { formatDate } from "@/lib/format";
import { t, type Locale } from "@/lib/messages";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/status-badge";
import type { DocumentPhase, PhaseStatus } from "@/lib/types";

const SEGMENT: Record<PhaseStatus, string> = {
  completed: "bg-success",
  in_progress: "bg-warning",
  rejected: "bg-destructive",
  not_started: "bg-muted",
};

const DOT: Record<PhaseStatus, string> = {
  completed: "bg-success",
  in_progress: "bg-warning",
  rejected: "bg-destructive",
  not_started: "bg-border",
};

/** A segment per phase, coloured by status — the dashboard/doc progress bar (§11.6). */
export function SegmentedProgress({
  statuses,
  className,
}: {
  statuses: PhaseStatus[];
  className?: string;
}) {
  if (statuses.length === 0) {
    return <div className={cn("h-2 w-full rounded bg-muted", className)} aria-hidden />;
  }
  return (
    <div className={cn("flex gap-1", className)}>
      {statuses.map((status, index) => (
        <span key={index} className={cn("h-2 flex-1 rounded", SEGMENT[status] ?? "bg-muted")} />
      ))}
    </div>
  );
}

function phaseName(phase: DocumentPhase, locale: Locale): string {
  return (locale === "en" ? phase.nameEn : phase.nameEs) || phase.nameEn || phase.nameEs;
}

function PhaseRow({
  documentId,
  phase,
  locale,
  last,
}: {
  documentId: string;
  phase: DocumentPhase;
  locale: Locale;
  last: boolean;
}) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function downloadResult() {
    if (!phase.resultVersionId) return;
    setError("");
    setBusy(true);
    try {
      const target = await apiRequest<{ downloadUrl: string; downloadMode: "s3" | "local" }>(
        `/documents/${documentId}/versions/${phase.resultVersionId}/download-url`,
      );
      if (target.downloadMode === "s3") {
        window.open(target.downloadUrl, "_blank", "noopener");
      } else {
        await downloadRequest(
          `/documents/${documentId}/versions/${phase.resultVersionId}/download`,
          `${phaseName(phase, locale)}.pdf`,
        );
      }
    } catch (cause) {
      setError(messageForError(cause, locale));
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="relative pl-7">
      {!last && <span className="absolute left-[7px] top-4 h-full w-px bg-border" aria-hidden />}
      <span
        className={cn("absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full", DOT[phase.status] ?? "bg-border")}
        aria-hidden
      />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-medium">{phaseName(phase, locale)}</p>
        <StatusBadge status={phase.status} prefix="phase.status" locale={locale} />
      </div>
      {phase.department && <p className="text-xs text-muted-foreground">{phase.department}</p>}
      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {phase.targetDate && (
          <span>
            {t(locale, "doc.phaseTarget")}: {formatDate(phase.targetDate)}
          </span>
        )}
        {phase.completedAt && <span>{t(locale, "doc.completedOn", { date: formatDate(phase.completedAt) })}</span>}
      </div>
      {phase.note && <p className="mt-1 text-sm">{phase.note}</p>}
      {phase.status === "completed" && phase.resultVersionId && (
        <button
          type="button"
          onClick={() => void downloadResult()}
          disabled={busy}
          className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-success/40 bg-success/10 px-3 py-1 text-xs font-semibold text-success disabled:opacity-60"
        >
          <Download size={13} />
          {t(locale, "doc.downloadResult")}
        </button>
      )}
      {error && (
        <p role="alert" className="mt-1 text-xs text-destructive">
          {error}
        </p>
      )}
    </li>
  );
}

/** Read-only vertical stepper of a document's approval phases (§11.5/§11.6). */
export function PhasesStepper({
  documentId,
  phases,
  locale,
}: {
  documentId: string;
  phases: DocumentPhase[];
  locale: Locale;
}) {
  const ordered = [...phases].sort((a, b) => a.position - b.position);
  return (
    <ol className="grid gap-5">
      {ordered.map((phase, index) => (
        <PhaseRow
          key={phase.id}
          documentId={documentId}
          phase={phase}
          locale={locale}
          last={index === ordered.length - 1}
        />
      ))}
    </ol>
  );
}
