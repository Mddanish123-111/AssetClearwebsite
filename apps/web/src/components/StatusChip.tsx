import clsx from "clsx";

const STYLES: Record<string, string> = {
  QUOTED: "bg-line/60 text-ink/70",
  SCHEDULED: "bg-steel/15 text-steel",
  IN_PROGRESS: "bg-amber/20 text-amber-900",
  AWAITING_DISPOSAL: "bg-steel/15 text-steel",
  COMPLETED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-rust/15 text-rust",
  PENDING: "bg-line/60 text-ink/70",
  RESELL: "bg-emerald-100 text-emerald-800",
  DONATE: "bg-steel/15 text-steel",
  RECYCLE: "bg-amber/20 text-amber-900",
  E_WASTE: "bg-amber/20 text-amber-900",
  LANDFILL: "bg-rust/15 text-rust",
  DATA_DESTRUCTION: "bg-ink/10 text-ink",
};

export function StatusChip({ value }: { value: string }) {
  return (
    <span className={clsx("status-chip", STYLES[value] ?? "bg-line/60 text-ink/70")}>
      {value.replace(/_/g, " ")}
    </span>
  );
}
