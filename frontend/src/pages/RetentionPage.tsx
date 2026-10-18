import { useState } from "react";
import {
  Activity,
  CalendarDays,
  Lightbulb,
  MoreHorizontal,
  Plus,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Panel } from "@/components/common/Panel";
import { FilterSelect } from "@/components/common/FilterSelect";
import { RiskPill } from "@/components/common/RiskPill";
import { customers as sampleCustomers } from "@/lib/churn-data";

export function RetentionPage() {
  const [priority, setPriority] = useState("All priorities");
  const [statusFilter, setStatusFilter] = useState("All status");

  const [actions, setActions] = useState(() =>
    sampleCustomers.slice(0, 9).map((customer, index) => ({
      customer,
      status: ([
        "Suggested",
        "In Progress",
        "Contacted",
        "Suggested",
        "Retained",
        "Suggested",
        "In Progress",
        "Contacted",
        "Suggested",
      ] as const)[index],
      due: `Nov ${10 + index}, 2025`,
      priority:
        customer.score >= 80 ? "High" : customer.score >= 55 ? "Medium" : "Low",
      suggestion:
        customer.contract === "Month-to-month"
          ? "Offer 1-year annual plan + 15% loyalty bonus"
          : "Provide 60-day free Tech Support & Security trial",
    }))
  );

  const filtered = actions.filter(
    (action) =>
      (priority === "All priorities" || action.priority === priority) &&
      (statusFilter === "All status" || action.status === statusFilter)
  );

  const update = (id: string, status: typeof actions[number]["status"]) =>
    setActions(
      actions.map((action) =>
        action.customer.id === id ? { ...action, status } : action
      )
    );

  const metricCards = [
    {
      label: "Suggested",
      count: actions.filter((a) => a.status === "Suggested").length,
      Icon: Lightbulb,
    },
    {
      label: "In progress",
      count: actions.filter((a) => a.status === "In Progress").length,
      Icon: Activity,
    },
    {
      label: "Contacted",
      count: actions.filter((a) => a.status === "Contacted").length,
      Icon: Users,
    },
    {
      label: "Retained",
      count: actions.filter((a) => a.status === "Retained").length,
      Icon: ShieldCheck,
    },
  ];

  return (
    <DashboardLayout
      title="Retention strategies"
      subtitle="Turn churn signals into measurable customer outcomes."
    >
      {({ setNotice }) => (
        <>
          <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metricCards.map(({ label, count, Icon }) => (
              <div
                className="flex items-center gap-3 rounded-lg border bg-card p-4 shadow-sm"
                key={label}
              >
                <span className="flex size-9 items-center justify-center rounded-md bg-accent text-primary">
                  <Icon className="size-4" />
                </span>
                <div>
                  <p className="text-xl font-bold">{count}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              </div>
            ))}
          </div>

          <Panel
            title="Retention action board"
            subtitle="Prioritized retention playbooks matched to customer risk drivers"
            action={
              <Button
                size="sm"
                onClick={() => setNotice("New retention task queued for account management")}
              >
                <Plus className="size-3.5" />
                New task
              </Button>
            }
          >
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <FilterSelect
                value={priority}
                onChange={setPriority}
                options={["All priorities", "High", "Medium", "Low"]}
              />
              <FilterSelect
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  "All status",
                  "Suggested",
                  "In Progress",
                  "Contacted",
                  "Retained",
                  "Lost",
                ]}
              />
              <span className="ml-auto text-xs text-muted-foreground">
                {filtered.length} active plays
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-xs">
                <thead>
                  <tr className="border-y bg-muted/40 text-[10px] uppercase tracking-wide text-muted-foreground">
                    {[
                      "Customer",
                      "Risk",
                      "Recommended playbook",
                      "Priority",
                      "Follow-up date",
                      "Status",
                      "",
                    ].map((x) => (
                      <th className="px-3 py-3 font-semibold" key={x}>
                        {x}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(({ customer, priority: level, suggestion, status }) => (
                    <tr
                      key={customer.id}
                      className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-3 py-3 font-semibold">
                        {customer.id}
                        <div className="mt-0.5 text-[10px] font-normal text-muted-foreground">
                          {customer.contract} · {customer.internet}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <RiskPill score={customer.score} />
                      </td>
                      <td className="max-w-[230px] px-3 py-3 text-muted-foreground">
                        {suggestion}
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            level === "High"
                              ? "bg-red-500/10 text-red-500"
                              : level === "Medium"
                              ? "bg-amber-500/10 text-amber-500"
                              : "bg-emerald-500/10 text-emerald-500"
                          }`}
                        >
                          {level}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <label className="flex items-center gap-1.5 text-muted-foreground">
                          <CalendarDays className="size-3" />
                          <input
                            aria-label={`Follow-up date for ${customer.id}`}
                            type="date"
                            defaultValue="2025-11-20"
                            className="w-[116px] bg-transparent text-[10px]"
                          />
                        </label>
                      </td>
                      <td className="px-3 py-3">
                        <select
                          aria-label={`Status for ${customer.id}`}
                          value={status}
                          onChange={(e) => update(customer.id, e.target.value as typeof status)}
                          className="h-7 rounded border bg-background px-1.5 text-[10px] font-medium"
                        >
                          {["Suggested", "In Progress", "Contacted", "Retained", "Lost"].map(
                            (value) => (
                              <option key={value} value={value}>
                                {value}
                              </option>
                            )
                          )}
                        </select>
                      </td>
                      <td className="px-2 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          aria-label={`More actions for ${customer.id}`}
                        >
                          <MoreHorizontal className="size-4" />
                        </Button>
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
