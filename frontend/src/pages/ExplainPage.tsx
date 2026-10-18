import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CircleHelp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Panel } from "@/components/common/Panel";
import { RiskPill } from "@/components/common/RiskPill";
import {
  customers as sampleCustomers,
  featureData,
} from "@/lib/churn-data";

export function ExplainPage() {
  const [selected, setSelected] = useState(sampleCustomers[0].id);
  const customer = sampleCustomers.find((c) => c.id === selected) ?? sampleCustomers[0];

  const waterfall = [
    { feature: "Base value (E[f(x)])", impact: 0.18 },
    { feature: "Short tenure (< 12 mo)", impact: 0.21 },
    { feature: "Month-to-month contract", impact: 0.17 },
    { feature: "Fiber optic internet", impact: 0.1 },
    { feature: "No online security", impact: 0.08 },
    { feature: "Two-year contract term", impact: -0.12 },
    { feature: "Automatic payment", impact: -0.06 },
  ];

  return (
    <DashboardLayout
      title="Explainable AI"
      subtitle="Understand the signals behind every model prediction."
    >
      {() => (
        <>
          <div className="mb-5 flex items-start gap-3 rounded-md border border-primary/20 bg-accent/35 p-4">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <CircleHelp className="size-4" />
            </span>
            <div>
              <p className="text-sm font-semibold">SHAP Signal Attribution vs. Causality</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                SHAP (SHapley Additive exPlanations) values indicate the marginal contribution of
                each feature to the model’s prediction relative to the base rate. They show
                statistical association, not proof that altering a single variable will prevent
                churn.
              </p>
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <Panel
              title="Global feature importance"
              subtitle="Mean absolute SHAP impact across all 7,043 customers"
              action={<Badge variant="secondary">TreeExplainer</Badge>}
            >
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={featureData}
                    layout="vertical"
                    margin={{ top: 0, right: 28, bottom: 0, left: 25 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={false}
                      stroke="var(--color-border)"
                    />
                    <XAxis
                      type="number"
                      tickFormatter={(v) => Number(v).toFixed(2)}
                      tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      dataKey="feature"
                      type="category"
                      width={152}
                      tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <ReferenceLine x={0} stroke="var(--color-border)" />
                    <Tooltip formatter={(v) => Number(v).toFixed(3)} />
                    <Bar dataKey="impact" radius={[0, 4, 4, 0]}>
                      {featureData.map((item) => (
                        <Cell
                          key={item.feature}
                          fill={item.impact > 0 ? "var(--risk-high)" : "var(--risk-low)"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 flex justify-center gap-5 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-xs bg-red-500" />
                  Increases churn risk
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-xs bg-emerald-500" />
                  Decreases churn risk
                </span>
              </div>
            </Panel>

            <Panel
              title="Customer-level explanation"
              subtitle="Waterfall contribution view for individual account"
              action={
                <select
                  value={selected}
                  onChange={(e) => setSelected(e.target.value)}
                  className="h-8 max-w-[150px] rounded-md border bg-background px-2 text-xs cursor-pointer"
                >
                  {sampleCustomers.slice(0, 10).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.id}
                    </option>
                  ))}
                </select>
              }
            >
              <div className="mb-4 flex items-center gap-3 rounded-md bg-muted/40 p-3">
                <div className="flex-1">
                  <p className="text-xs font-semibold">{customer.id}</p>
                  <p className="text-[11px] text-muted-foreground">
                    Predicted churn risk for account
                  </p>
                </div>
                <RiskPill score={customer.score} />
              </div>

              <div className="space-y-3">
                {waterfall.map((item) => (
                  <div
                    className="grid grid-cols-[130px_1fr_45px] items-center gap-2"
                    key={item.feature}
                  >
                    <span className="truncate text-[11px] text-muted-foreground">
                      {item.feature}
                    </span>
                    <div className="relative h-5">
                      <div
                        className={`absolute top-1 h-3 rounded-xs ${
                          item.impact >= 0
                            ? "left-1/2 bg-red-500/80"
                            : "right-1/2 bg-emerald-500/80"
                        }`}
                        style={{ width: `${Math.abs(item.impact) * 170}%` }}
                      />
                      <div className="absolute left-1/2 top-0 h-5 border-l border-border" />
                    </div>
                    <span
                      className={`text-right text-[11px] font-semibold ${
                        item.impact >= 0 ? "text-red-500" : "text-emerald-500"
                      }`}
                    >
                      {item.impact > 0 ? "+" : ""}
                      {item.impact.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-5 border-t pt-4">
                <p className="text-xs font-semibold">Interpreting Waterfall Signals</p>
                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                  Positive values push the probability higher toward churn. Negative values
                  decrease the churn likelihood relative to the overall population base rate (18%).
                </p>
              </div>
            </Panel>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
