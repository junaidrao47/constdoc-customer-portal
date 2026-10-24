import { cn } from "@/lib/utils";
import { BrandMark } from "@/components/brand-logo";

/**
 * Loading animation built from the brand mark alone (the 3-D cube, no wordmark).
 * The three faces pulse in sequence — a light sweep that reads as "assembling" —
 * while the whole mark gently floats. Motion is defined in globals.css under
 * `.brand-loader`, and disabled under prefers-reduced-motion.
 */
export function BrandLoader({
  tone = "light",
  className,
  markClassName,
  label,
}: {
  tone?: "light" | "dark";
  className?: string;
  markClassName?: string;
  label?: string;
}) {
  return (
    <div role="status" aria-live="polite" className={cn("inline-flex flex-col items-center gap-4", className)}>
      <div className="brand-loader">
        <BrandMark tone={tone} animated className={cn("h-16 w-auto", markClassName)} />
      </div>
      {label ? (
        <span className={cn("eyebrow text-xs", tone === "dark" ? "text-paper/60" : "text-muted-foreground")}>
          {label}
        </span>
      ) : null}
      <span className="sr-only">Loading…</span>
    </div>
  );
}
