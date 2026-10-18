import { useMemo, useState } from "react";
import { ArrowDown, ChevronLeft, ChevronRight, Download, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Panel } from "@/components/common/Panel";
import { FilterSelect } from "@/components/common/FilterSelect";
import { RiskPill } from "@/components/common/RiskPill";
import { CustomerDrawer } from "@/components/customer/CustomerDrawer";
import {
  customers as sampleCustomers,
  getRiskTier,
  money,
  type Customer,
} from "@/lib/churn-data";

export function CustomersPage() {
  const [query, setQuery] = useState("");
  const [tier, setTier] = useState("All tiers");
  const [contract, setContract] = useState("All contracts");
  const [internet, setInternet] = useState("All services");
  const [payment, setPayment] = useState("All payment methods");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortDesc, setSortDesc] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const filtered = useMemo(
    () =>
      sampleCustomers
        .filter(
          (c) =>
            c.id.toLowerCase().includes(query.toLowerCase()) &&
            (tier === "All tiers" || getRiskTier(c.score) === tier.replace(" risk", "")) &&
            (contract === "All contracts" || c.contract === contract) &&
            (internet === "All services" || c.internet === internet) &&
            (payment === "All payment methods" || c.payment === payment)
        )
        .sort((a, b) => (sortDesc ? b.score - a.score : a.score - b.score)),
    [query, tier, contract, internet, payment, sortDesc]
  );

  const rows = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleExportCsv = (setNotice: (msg: string) => void) => {
    const rowsCsv = [
      "customerID,riskScore,riskTier,contract,internet,tenure,monthlyCharges,totalCharges,payment",
      ...filtered.map(
        (c) =>
          `${c.id},${c.score},${getRiskTier(c.score)},${c.contract},${c.internet},${c.tenure},${
            c.monthly
          },${c.total},${c.payment}`
      ),
    ].join("\n");
    const url = URL.createObjectURL(new Blob([rowsCsv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "churniq-customers-risk.csv";
    a.click();
    URL.revokeObjectURL(url);
    setNotice("Filtered customer CSV exported successfully");
  };

  return (
    <DashboardLayout
      title="Customer risk explorer"
      subtitle="Find, filter, and understand every customer at risk."
    >
      {({ setNotice }) => (
        <>
          <Panel
            title="Customer risk registry"
            subtitle={`${filtered.length.toLocaleString()} matching records from Telco dataset`}
            action={
              <Button variant="outline" size="sm" onClick={() => handleExportCsv(setNotice)}>
                <Download className="size-3.5" />
                Export CSV
              </Button>
            }
          >
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <div className="relative min-w-[210px] flex-1">
                <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search by customer ID…"
                  className="h-9 w-full rounded-md border bg-background pl-8 pr-3 text-xs outline-none focus:border-ring"
                />
              </div>
              <FilterSelect
                value={tier}
                onChange={setTier}
                options={["All tiers", "High risk", "Medium risk", "Low risk"]}
              />
              <FilterSelect
                value={contract}
                onChange={setContract}
                options={["All contracts", "Month-to-month", "One year", "Two year"]}
              />
              <FilterSelect
                value={internet}
                onChange={setInternet}
                options={["All services", "Fiber optic", "DSL", "None"]}
              />
              <FilterSelect
                value={payment}
                onChange={setPayment}
                options={[
                  "All payment methods",
                  "Electronic check",
                  "Mailed check",
                  "Bank transfer (automatic)",
                  "Credit card (automatic)",
                ]}
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] text-left text-xs">
                <thead>
                  <tr className="border-y bg-muted/40 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {[
                      "Customer ID",
                      "Risk score",
                      "Contract",
                      "Internet",
                      "Tenure",
                      "Monthly charges",
                      "Total charges",
                      "Payment method",
                      "",
                    ].map((label) => (
                      <th key={label} className="px-3 py-3 font-semibold">
                        {label === "Risk score" ? (
                          <button
                            className="inline-flex items-center gap-1 cursor-pointer"
                            onClick={() => setSortDesc(!sortDesc)}
                          >
                            {label}
                            <ArrowDown
                              className={`size-3 transition-transform ${sortDesc ? "" : "rotate-180"}`}
                            />
                          </button>
                        ) : (
                          label
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((c) => (
                    <tr
                      key={c.id}
                      className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-3 py-3 font-semibold text-foreground">{c.id}</td>
                      <td className="px-3 py-3">
                        <div className="flex min-w-[135px] items-center gap-2">
                          <Progress value={c.score} className="h-1.5 w-12" />
                          <RiskPill score={c.score} />
                        </div>
                      </td>
                      <td className="px-3 py-3 text-muted-foreground">{c.contract}</td>
                      <td className="px-3 py-3 text-muted-foreground">{c.internet}</td>
                      <td className="px-3 py-3 text-muted-foreground">{c.tenure} mo</td>
                      <td className="px-3 py-3 font-semibold">{money(c.monthly)}</td>
                      <td className="px-3 py-3 text-muted-foreground">{money(c.total)}</td>
                      <td className="px-3 py-3 text-muted-foreground">{c.payment}</td>
                      <td className="px-3 py-2 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedCustomer(c)}
                        >
                          Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
              <span className="text-xs text-muted-foreground">
                Showing {filtered.length ? (page - 1) * pageSize + 1 : 0}–
                {Math.min(page * pageSize, filtered.length)} of {filtered.length}
              </span>
              <div className="flex items-center gap-2">
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="h-8 rounded border bg-background px-2 text-xs"
                >
                  <option value={10}>10 per page</option>
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                </select>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8"
                  aria-label="Previous page"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <span className="text-xs font-medium">
                  {page} / {Math.max(1, Math.ceil(filtered.length / pageSize))}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8"
                  aria-label="Next page"
                  disabled={page >= Math.ceil(filtered.length / pageSize)}
                  onClick={() => setPage(page + 1)}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          </Panel>

          <CustomerDrawer
            customer={selectedCustomer}
            onClose={() => setSelectedCustomer(null)}
          />
        </>
      )}
    </DashboardLayout>
  );
}
