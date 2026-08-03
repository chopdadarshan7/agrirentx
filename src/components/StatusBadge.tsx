import { cn } from "@/lib/utils";

/**
 * The single status → colour mapping for the entire app (plan, section 1).
 * Never invent a per-page colour for a status.
 */
const positive = ["approved", "confirmed", "completed", "paid", "available", "restored"];
const waiting = ["pending", "awaiting", "processing"];
const negative = ["rejected", "cancelled", "failed", "blocked", "suspended", "hidden", "deleted"];
const informational = ["active", "in-progress", "booked", "refunded"];

export type StatusTone = "green" | "amber" | "red" | "blue" | "slate";

export function statusTone(status: string): StatusTone {
  const s = status.toLowerCase();
  if (positive.includes(s)) return "green";
  if (waiting.includes(s)) return "amber";
  if (negative.includes(s)) return "red";
  if (informational.includes(s)) return "blue";
  return "slate";
}

const toneClasses: Record<StatusTone, string> = {
  green: "bg-success/15 text-success-foreground border-success/30",
  amber: "bg-warning/15 text-warning-foreground border-warning/30",
  red: "bg-destructive/12 text-destructive border-destructive/30",
  blue: "bg-info/12 text-info-foreground border-info/30",
  slate: "bg-muted text-muted-foreground border-border",
};

export function StatusBadge({
  status,
  label,
  className,
}: {
  status: string;
  label?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-xs font-medium capitalize",
        toneClasses[statusTone(status)],
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current opacity-70" />
      {label ?? status}
    </span>
  );
}
