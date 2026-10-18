import { ArrowDownRight, type LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  note: string;
  delta: string;
  icon: LucideIcon;
  tone?: "primary" | "risk-high" | "risk-medium";
}

export function MetricCard({
  title,
  value,
  note,
  delta,
  icon: Icon,
  tone = "primary",
}: MetricCardProps) {
  const toneClass =
    tone === "risk-high"
      ? "text-red-500 bg-red-500/10"
      : tone === "risk-medium"
      ? "text-amber-500 bg-amber-500/10"
      : "text-primary bg-primary/10";

  return (
    <section className="rounded-lg border bg-card p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <span className={`flex size-9 items-center justify-center rounded-md ${toneClass}`}>
          <Icon className="size-4" />
        </span>
      </div>
      <p className="mt-4 font-display text-3xl font-semibold tracking-tight">{value}</p>
      <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
        <span className="font-medium text-emerald-600 dark:text-emerald-400">
          <ArrowDownRight className="mr-0.5 inline size-3.5" />
          {delta}
        </span>
        {note}
      </p>
    </section>
  );
}
