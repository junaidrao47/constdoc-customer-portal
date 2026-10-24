import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { tOptional, type Locale } from "@/lib/messages";

type Tone = "success" | "warning" | "danger" | "neutral";

/**
 * Colour per status. The *set* of document statuses and the allowed transitions are owned
 * by the API (`GET /documents/statuses`) and drive the action buttons — never a hardcoded
 * list. Labels are resolved through i18n keyed by the same `document.status.<value>` key the
 * contract publishes (see messages.ts). Colour is not part of that contract — the backend
 * states it is the frontend's job — so this tone map is the only presentation detail that
 * stays local. Unknown statuses humanise.
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
  // account statuses (§11.1)
  pending_approval: "warning",
  suspended: "danger",
  // phase statuses (§11.5)
  not_started: "neutral",
  in_progress: "warning",
  completed: "success",
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
  prefix = "document.status",
  className,
}: {
  status: string;
  locale?: Locale;
  /** i18n key namespace for the label, e.g. "phase.status" or "account.status". */
  prefix?: string;
  className?: string;
}) {
  const label = tOptional(locale, `${prefix}.${status}`) ?? status.replaceAll("_", " ");
  const tone = TONE[status] ?? "neutral";
  return (
    <Badge variant="outline" className={cn("border-transparent", TONE_CLASSES[tone], className)}>
      {label}
    </Badge>
  );
}
