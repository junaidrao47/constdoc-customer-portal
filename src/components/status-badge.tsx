import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/messages";

type Tone = "success" | "warning" | "danger" | "neutral";

/**
 * Colour per status. The *set* of document statuses and the allowed transitions are owned
 * by the API (`GET /documents/statuses`) and drive the action buttons — never a hardcoded
 * list. Colours are not part of that contract, so this tone map (and the localized labels
 * below) is the only presentation detail that stays local. Unknown statuses humanise.
 */
const TONE: Record<string, Tone> = {
  pending: "neutral",
  under_review: "warning",
  approved: "success",
  submitted_to_government: "warning",
  rejected: "danger",
  expiring_soon: "warning",
  expired: "danger",
  // quotations / invoices reuse this badge
  draft: "neutral",
  sent: "warning",
  accepted: "success",
  converted: "success",
  cancelled: "neutral",
  issued: "neutral",
  partially_paid: "warning",
  paid: "success",
  overdue: "danger",
};

const LABELS: Record<Locale, Record<string, string>> = {
  es: {
    pending: "Pendiente",
    under_review: "En revisión",
    approved: "Aprobado",
    submitted_to_government: "Enviado al gobierno",
    rejected: "Rechazado",
    expiring_soon: "Por vencer",
    expired: "Vencido",
  },
  en: {
    pending: "Pending",
    under_review: "Under review",
    approved: "Approved",
    submitted_to_government: "Submitted to government",
    rejected: "Rejected",
    expiring_soon: "Expiring soon",
    expired: "Expired",
  },
};

const TONE_CLASSES: Record<Tone, string> = {
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-destructive/10 text-destructive",
  neutral: "bg-muted text-muted-foreground",
};

export function StatusBadge({
  status,
  locale = "es",
  className,
}: {
  status: string;
  locale?: Locale;
  className?: string;
}) {
  const label = LABELS[locale][status] ?? status.replaceAll("_", " ");
  const tone = TONE[status] ?? "neutral";
  return (
    <Badge variant="outline" className={cn("border-transparent", TONE_CLASSES[tone], className)}>
      {label}
    </Badge>
  );
}
