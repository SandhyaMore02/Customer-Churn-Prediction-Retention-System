import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { RiskPill } from "@/components/common/RiskPill";
import { money, type Customer } from "@/lib/churn-data";

interface CustomerTableProps {
  customers: Customer[];
  onSelect: (customer: Customer) => void;
  compact?: boolean;
}

export function CustomerTable({
  customers,
  onSelect,
  compact = false,
}: CustomerTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[680px] text-left text-xs">
        <thead>
          <tr className="border-b text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {["Customer ID", "Risk score", "Contract", "Tenure", "Monthly charges", ""].map(
              (label) => (
                <th className="pb-3 pr-4 font-semibold" key={label}>
                  {label}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c.id} className="border-b last:border-0 hover:bg-muted/35 transition-colors">
              <td className="py-3 pr-4 font-semibold">{c.id}</td>
              <td className="py-3 pr-4">
                <div className="flex items-center gap-2">
                  <Progress value={c.score} className="h-1.5 w-16" />
                  <RiskPill score={c.score} />
                </div>
              </td>
              <td className="py-3 pr-4 text-muted-foreground">{c.contract}</td>
              <td className="py-3 pr-4 text-muted-foreground">{c.tenure} mo</td>
              <td className="py-3 pr-4 font-semibold">{money(c.monthly)}</td>
              <td className="py-3 text-right">
                <Button variant="ghost" size="sm" onClick={() => onSelect(c)}>
                  {compact ? "Details" : "View details"}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
