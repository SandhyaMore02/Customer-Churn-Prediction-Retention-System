import { Badge } from "@/components/ui/badge";
import { getRiskTier } from "@/lib/churn-data";

export function RiskPill({ score, tier }: { score?: number; tier?: string }) {
  const label = tier ?? (score === undefined ? "Low" : getRiskTier(score));
  const normalized = label.toLowerCase();
  const colorClass =
    normalized === "high"
      ? "text-red-500 bg-red-500/10"
      : normalized === "medium"
      ? "text-amber-500 bg-amber-500/10"
      : "text-emerald-500 bg-emerald-500/10";
  const dotColor =
    normalized === "high"
      ? "bg-red-500"
      : normalized === "medium"
      ? "bg-amber-500"
      : "bg-emerald-500";

  return (
    <Badge
      variant="outline"
      className={`gap-1.5 border-transparent ${colorClass} px-2 py-0.5 text-xs font-medium`}
    >
      <span className={`size-1.5 rounded-full ${dotColor}`} />
      {label}
      {score !== undefined && <span className="font-semibold">{score}%</span>}
    </Badge>
  );
}
