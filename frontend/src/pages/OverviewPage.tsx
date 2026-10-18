import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  ArrowRight,
  CircleHelp,
  Target,
  TrendingDown,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MetricCard } from "@/components/common/MetricCard";
import { Panel } from "@/components/common/Panel";
import { CustomerTable } from "@/components/customer/CustomerTable";
import { CustomerDrawer } from "@/components/customer/CustomerDrawer";
import {
  customers as sampleCustomers,
  churnData,
  contractData,
  riskData,
  tenureData,
  type Customer,
} from "@/lib/churn-data";

export function OverviewPage() {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const highRiskCustomers = sampleCustomers.filter((c) => c.score >= 70).slice(0, 5);

  return (
    <DashboardLayout
      title="Executive overview"
      subtitle="A clear picture of customer health and churn risk."
    >
      {() => (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              title="Total customers"
              value="7,043"
              note="analyzed in portfolio"
              delta="2.4%"
              icon={Users}
            />
            <MetricCard
              title="High-risk customers"
              value="1,418"
              note="of total customer base (20.1%)"
              delta="1.2%"
              icon={AlertTriangle}
              tone="risk-high"
            />
            <MetricCard
              title="Predicted churn rate"
              value="26.5%"
              note="vs. historical baseline"
              delta="0.8%"
              icon={TrendingDown}
              tone="risk-medium"
            />
            <MetricCard
              title="Retention attention required"
              value="2,979"
              note="high + medium risk segments"
              delta="3.1%"
              icon={Target}
              tone="risk-high"
            />
          </div>

          <div className="mb-5 grid gap-5 xl:grid-cols-3">
            <Panel
              title="Churn distribution"
              subtitle="Customer retention split"
              action={
                <Button variant="ghost" size="icon" aria-label="Churn chart information">
                  <CircleHelp className="size-4 text-muted-foreground" />
                </Button>
              }
            >
              <div className="grid items-center gap-3 sm:grid-cols-[1fr_0.9fr]">
                <div className="relative h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={churnData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={66}
                        outerRadius={88}
                        paddingAngle={4}
                        strokeWidth={0}
                      >
                        {churnData.map((entry) => (
                          <Cell key={entry.name} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold">73.5%</span>
                    <span className="text-[11px] text-muted-foreground">retained</span>
                  </div>
                </div>
                <div className="space-y-4">
                  {churnData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <span className="size-2.5 rounded-xs" style={{ background: item.fill }} />
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">{item.name}</p>
                        <p className="mt-0.5 text-sm font-semibold">{item.value}%</p>
                      </div>
                    </div>
                  ))}
                  <div className="border-t pt-3 text-[11px] text-muted-foreground">
                    7,043 active accounts evaluated
                  </div>
                </div>
              </div>
            </Panel>

            <Panel title="Risk tier distribution" subtitle="Current customer portfolio">
              <div className="mb-4 flex items-baseline gap-2">
                <span className="text-2xl font-bold">7,043</span>
                <span className="text-xs text-muted-foreground">customers scored</span>
              </div>
              <div className="flex h-3 overflow-hidden rounded-full">
                {riskData.map((item) => (
                  <div
                    key={item.name}
                    style={{ width: `${(item.value / 7043) * 100}%`, background: item.fill }}
                  />
                ))}
              </div>
              <div className="mt-5 space-y-3">
                {riskData.map((item) => (
                  <div className="flex items-center gap-2" key={item.name}>
                    <span className="size-2 rounded-full" style={{ background: item.fill }} />
                    <span className="flex-1 text-xs text-muted-foreground">{item.name}</span>
                    <span className="text-xs font-semibold">{item.value.toLocaleString()}</span>
                    <span className="w-11 text-right text-xs text-muted-foreground">
                      {((item.value / 7043) * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="Churn rate by contract" subtitle="Monthly churn likelihood">
              <div className="h-[245px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={contractData}
                    layout="vertical"
                    margin={{ top: 4, right: 18, bottom: 0, left: 8 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={false}
                      stroke="var(--color-border)"
                    />
                    <XAxis
                      type="number"
                      domain={[0, 50]}
                      tickFormatter={(v) => `${v}%`}
                      tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={100}
                      tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip formatter={(v) => `${v}%`} />
                    <Bar
                      dataKey="rate"
                      fill="var(--color-primary)"
                      radius={[0, 4, 4, 0]}
                      barSize={18}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Panel>
          </div>

          <div className="grid gap-5 xl:grid-cols-5">
            <Panel
              title="Churn by tenure"
              subtitle="Churn rate drops as tenure increases"
              className="xl:col-span-2"
            >
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={tenureData} margin={{ top: 12, right: 8, left: -18, bottom: 0 }}>
                    <defs>
                      <linearGradient id="tenureFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.25} />
                        <stop offset="90%" stopColor="var(--color-primary)" stopOpacity={0.01} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="var(--color-border)"
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tickFormatter={(v) => `${v}%`}
                      tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip formatter={(v) => `${v}%`} />
                    <Area
                      dataKey="churn"
                      stroke="var(--color-primary)"
                      strokeWidth={2}
                      fill="url(#tenureFill)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Panel>

            <Panel
              title="Highest risk customers"
              subtitle="Accounts requiring immediate retention review"
              action={
                <Link
                  to="/customers"
                  className="flex items-center gap-1 text-xs font-semibold text-primary"
                >
                  View all <ArrowRight className="size-3.5" />
                </Link>
              }
              className="xl:col-span-3"
            >
              <CustomerTable
                customers={highRiskCustomers}
                onSelect={setSelectedCustomer}
                compact
              />
            </Panel>
          </div>

          <CustomerDrawer
            customer={selectedCustomer}
            onClose={() => setSelectedCustomer(null)}
          />
        </>
      )}
    </DashboardLayout>
  );
}
