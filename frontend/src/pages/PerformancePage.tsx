import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Check, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Panel } from "@/components/common/Panel";

export function PerformancePage() {
  const roc = Array.from({ length: 11 }, (_, i) => ({
    fpr: i / 10,
    tpr: [0, 0.41, 0.58, 0.68, 0.75, 0.81, 0.86, 0.9, 0.94, 0.97, 1][i],
    precision: [1, 0.93, 0.85, 0.76, 0.68, 0.61, 0.55, 0.48, 0.41, 0.33, 0.265][i],
  }));

  const metrics = [
    ["Accuracy", "76.9%", "+1.2%", TrendingUp],
    ["Precision", "55.2%", "+2.4%", TrendingUp],
    ["Recall", "69.5%", "+0.8%", TrendingUp],
    ["F1-score", "61.5%", "+1.6%", TrendingUp],
    ["ROC-AUC", "83.9%", "+0.7%", TrendingUp],
  ] as const;

  return (
    <DashboardLayout
      title="Model performance"
      subtitle="Monitor the quality and reliability of churn predictions."
    >
      {() => (
        <>
          <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {metrics.map(([label, value, delta, Icon]) => (
              <div key={label} className="rounded-lg border bg-card p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <Icon className="size-3.5 text-emerald-500" />
                </div>
                <p className="mt-3 text-2xl font-bold">{value}</p>
                <p className="mt-1 text-[10px] text-emerald-600 dark:text-emerald-400">
                  {delta} <span className="text-muted-foreground">vs baseline</span>
                </p>
              </div>
            ))}
          </div>

          <div className="mb-5 grid gap-5 xl:grid-cols-3">
            <Panel title="Confusion matrix" subtitle="Test evaluation · threshold 0.52">
              <div className="grid grid-cols-[100px_1fr_1fr] gap-1.5 text-center text-[11px]">
                <div />
                <div className="pb-2 text-muted-foreground font-medium">Pred: Retained</div>
                <div className="pb-2 text-muted-foreground font-medium">Pred: Churn</div>
                <div className="flex items-center justify-center text-muted-foreground font-medium">
                  Actual: Retained
                </div>
                <div className="flex h-20 flex-col items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <strong className="text-xl font-bold">828</strong>
                  <span className="text-[10px]">True Negative</span>
                </div>
                <div className="flex h-20 flex-col items-center justify-center rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <strong className="text-xl font-bold">207</strong>
                  <span className="text-[10px]">False Positive</span>
                </div>
                <div className="flex items-center justify-center text-muted-foreground font-medium">
                  Actual: Churn
                </div>
                <div className="flex h-20 flex-col items-center justify-center rounded-md bg-red-500/10 text-red-600 dark:text-red-400">
                  <strong className="text-xl font-bold">114</strong>
                  <span className="text-[10px]">False Negative</span>
                </div>
                <div className="flex h-20 flex-col items-center justify-center rounded-md bg-primary/10 text-primary">
                  <strong className="text-xl font-bold">260</strong>
                  <span className="text-[10px]">True Positive</span>
                </div>
              </div>
            </Panel>

            <Panel
              title="ROC curve"
              subtitle="True positive rate vs. false positive rate · AUC 0.839"
            >
              <div className="h-[245px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={roc} margin={{ top: 12, right: 16, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis
                      dataKey="fpr"
                      type="number"
                      domain={[0, 1]}
                      tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                      axisLine={false}
                    />
                    <YAxis
                      dataKey="tpr"
                      type="number"
                      domain={[0, 1]}
                      tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                      axisLine={false}
                    />
                    <Tooltip />
                    <Line
                      dataKey="tpr"
                      stroke="var(--color-primary)"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      dataKey="fpr"
                      stroke="var(--color-muted-foreground)"
                      strokeDasharray="4 4"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="size-2 rounded-full bg-primary" />
                  Random Forest
                </span>
                <span className="flex items-center gap-1">
                  <span className="size-2 rounded-full bg-muted-foreground" />
                  Random Guess
                </span>
              </div>
            </Panel>

            <Panel title="Precision–recall curve" subtitle="Precision by recall · AUC 0.610">
              <div className="h-[245px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={roc} margin={{ top: 12, right: 16, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis
                      dataKey="tpr"
                      type="number"
                      domain={[0, 1]}
                      tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                      axisLine={false}
                    />
                    <YAxis
                      dataKey="precision"
                      type="number"
                      domain={[0, 1]}
                      tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                      axisLine={false}
                    />
                    <Tooltip />
                    <Area
                      dataKey="precision"
                      stroke="var(--risk-low)"
                      fill="var(--risk-low)"
                      fillOpacity={0.15}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Panel>
          </div>

          <Panel
            title="Candidate model evaluation benchmark"
            subtitle="Stratified 5-fold cross-validation on IBM Telco dataset"
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[670px] text-left text-xs">
                <thead>
                  <tr className="border-y bg-muted/40 text-[10px] uppercase tracking-wide text-muted-foreground">
                    {[
                      "Algorithm",
                      "Accuracy",
                      "Precision",
                      "Recall",
                      "F1 score",
                      "ROC-AUC",
                      "Production status",
                    ].map((x) => (
                      <th className="px-4 py-3 font-semibold" key={x}>
                        {x}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    [
                      "Logistic Regression",
                      "74.2%",
                      "51.3%",
                      "63.1%",
                      "56.6%",
                      "80.1%",
                      "Candidate",
                    ],
                    [
                      "Random Forest",
                      "76.9%",
                      "55.2%",
                      "69.5%",
                      "61.5%",
                      "83.9%",
                      "Selected best",
                    ],
                    [
                      "XGBoost",
                      "77.4%",
                      "56.1%",
                      "68.2%",
                      "61.5%",
                      "83.5%",
                      "Candidate",
                    ],
                  ].map((r) => (
                    <tr key={r[0]} className="border-b last:border-0 hover:bg-muted/20">
                      <td className="px-4 py-3 font-semibold">{r[0]}</td>
                      {r.slice(1, 6).map((v, i) => (
                        <td className="px-4 py-3 text-muted-foreground" key={`${r[0]}-${i}`}>
                          {v}
                        </td>
                      ))}
                      <td className="px-4 py-3">
                        {r[6] === "Selected best" ? (
                          <Badge className="bg-primary text-primary-foreground font-semibold">
                            <Check className="mr-1 size-3" />
                            Selected Best
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Candidate</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </>
      )}
    </DashboardLayout>
  );
}
