import { ArrowRight, Lightbulb } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { RiskPill } from "@/components/common/RiskPill";
import { money, type Customer } from "@/lib/churn-data";

interface CustomerDrawerProps {
  customer: Customer | null;
  onClose: () => void;
}

export function CustomerDrawer({ customer, onClose }: CustomerDrawerProps) {
  return (
    <Sheet open={customer !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-[480px]">
        <SheetHeader>
          <SheetTitle>Customer 360° Profile</SheetTitle>
          <SheetDescription>
            Personalized machine learning risk diagnosis and recommended retention strategy.
          </SheetDescription>
        </SheetHeader>
        {customer && (
          <div className="mt-7 space-y-6">
            <div className="flex items-center gap-3">
              <Avatar className="size-12">
                <AvatarFallback className="bg-accent text-accent-foreground font-bold">
                  {customer.id.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-bold text-base">{customer.id}</p>
                <p className="text-xs text-muted-foreground">{customer.tenure} months customer tenure</p>
              </div>
              <RiskPill score={customer.score} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                ["Monthly charges", money(customer.monthly)],
                ["Total charges", money(customer.total)],
                ["Contract type", customer.contract],
                ["Payment method", customer.payment],
                ["Internet service", customer.internet],
                ["Tenure", `${customer.tenure} months`],
              ].map(([title, value]) => (
                <div className="rounded-md border p-3 bg-muted/20" key={title}>
                  <p className="text-[11px] text-muted-foreground">{title}</p>
                  <p className="mt-1 text-sm font-semibold">{value}</p>
                </div>
              ))}
            </div>

            <div>
              <p className="mb-3 text-sm font-semibold">Leading risk contributors</p>
              {[
                ["Tenure vulnerability", Math.max(12, 100 - customer.tenure)],
                ["Contract flexibility", customer.contract === "Month-to-month" ? 91 : 27],
                ["Monthly bill pressure", customer.monthly > 85 ? 75 : 39],
                ["Service gap (no security)", customer.onlineSecurity === "No" ? 82 : 24],
              ].map(([label, value]) => (
                <div className="mb-3" key={label}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span>{label}</span>
                    <span className="text-muted-foreground font-medium">{value}%</span>
                  </div>
                  <Progress value={Number(value)} className="h-1.5" />
                </div>
              ))}
            </div>

            <div className="rounded-md border border-primary/30 bg-primary/5 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-primary">
                <Lightbulb className="size-4 text-primary" />
                Recommended Retention Action
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {customer.contract === "Month-to-month"
                  ? "Offer discounted 1-year annual contract with a 15% loyalty bonus to secure commitment and reduce monthly turnover risk."
                  : `Provide a free 60-day Tech Support & Security trial for this ${customer.internet} subscriber and schedule a success check-in.`}
              </p>
              <Button className="mt-4 w-full" size="sm">
                Create Retention Action <ArrowRight className="size-3.5" />
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
