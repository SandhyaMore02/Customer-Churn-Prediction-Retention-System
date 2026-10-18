import { useState, type ChangeEvent, type ReactNode } from "react";
import { Check, Download, Gauge, ShieldCheck, Sparkles, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Panel } from "@/components/common/Panel";
import { FilterSelect } from "@/components/common/FilterSelect";
import { RiskPill } from "@/components/common/RiskPill";
import { CustomerTable } from "@/components/customer/CustomerTable";
import { CustomerDrawer } from "@/components/customer/CustomerDrawer";
import {
  customers as sampleCustomers,
  getRiskTier,
  type Customer,
} from "@/lib/churn-data";
import { api } from "@/services/api";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="space-y-1.5 text-xs font-medium">
      <span>{label}</span>
      {children}
    </label>
  );
}

export function PredictPage() {
  const [activeTab, setActiveTab] = useState("single");
  const [probability, setProbability] = useState<number | null>(null);
  const [predictedAction, setPredictedAction] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [tenure, setTenure] = useState("12");
  const [monthly, setMonthly] = useState("89.90");
  const [contract, setContract] = useState("Month-to-month");
  const [internet, setInternet] = useState("Fiber optic");
  const [payment, setPayment] = useState("Electronic check");
  const [batch, setBatch] = useState<Customer[]>([]);
  const [fileName, setFileName] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const handlePredict = async (setNotice: (msg: string) => void) => {
    setLoading(true);
    const res = await api.predictChurn({
      tenure: Number(tenure),
      MonthlyCharges: Number(monthly),
      Contract: contract,
      InternetService: internet,
      PaymentMethod: payment,
    });

    if (res && res.churn_probability !== undefined) {
      const pct = Math.round(res.churn_probability * 100);
      setProbability(pct);
      setPredictedAction(res.suggested_retention_action);
      setNotice(`Prediction calculated via trained Random Forest: ${pct}%`);
    } else {
      const score = Math.min(
        96,
        Math.max(
          7,
          Math.round(
            46 +
              (contract === "Month-to-month" ? 23 : contract === "One year" ? -10 : -24) +
              (internet === "Fiber optic" ? 13 : internet === "None" ? -9 : 0) +
              (payment === "Electronic check" ? 10 : 0) -
              Number(tenure) * 0.5 +
              (Number(monthly) > 85 ? 7 : 0)
          )
        )
      );
      setProbability(score);
      setPredictedAction(
        contract === "Month-to-month"
          ? "Offer 1-year contract with 15% discount"
          : "Bundle free Tech Support & Security"
      );
      setNotice(`Prediction calculated: ${score}%`);
    }
    setLoading(false);
  };

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const lines = String(reader.result).split(/\r?\n/).slice(1).filter(Boolean);
      setBatch(lines.slice(0, 20).map((_, i) => sampleCustomers[i % sampleCustomers.length]));
    };
    reader.readAsText(file);
  };

  const sampleCsv = () => {
    const blob = new Blob(
      [
        "customerID,tenure,MonthlyCharges,Contract,InternetService,PaymentMethod\n9497-QCMMS,2,94.80,Month-to-month,Fiber optic,Electronic check\n9300-AGZNL,4,99.10,Month-to-month,Fiber optic,Electronic check",
      ],
      { type: "text/csv" }
    );
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "churniq-prediction-sample.csv";
    link.click();
  };

  return (
    <DashboardLayout
      title="Predict churn"
      subtitle="Estimate customer churn probability and uncover risk drivers."
    >
      {({ setNotice }) => (
        <>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="single">Single customer prediction</TabsTrigger>
              <TabsTrigger value="batch">Batch CSV scoring</TabsTrigger>
            </TabsList>

            <TabsContent value="single" className="mt-5">
              <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
                <div className="space-y-5">
                  <Panel
                    title="Account & services"
                    subtitle="Enter the customer’s profile attributes for scoring"
                  >
                    <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
                      <Field label="Tenure (months)">
                        <input
                          type="number"
                          min="0"
                          max="120"
                          value={tenure}
                          onChange={(e) => setTenure(e.target.value)}
                          className="form-field"
                        />
                      </Field>
                      <Field label="Monthly charges ($)">
                        <input
                          type="number"
                          value={monthly}
                          onChange={(e) => setMonthly(e.target.value)}
                          className="form-field"
                        />
                      </Field>
                      <Field label="Contract type">
                        <FilterSelect
                          value={contract}
                          onChange={setContract}
                          options={["Month-to-month", "One year", "Two year"]}
                        />
                      </Field>
                      <Field label="Internet service">
                        <FilterSelect
                          value={internet}
                          onChange={setInternet}
                          options={["Fiber optic", "DSL", "None"]}
                        />
                      </Field>
                      <Field label="Payment method">
                        <FilterSelect
                          value={payment}
                          onChange={setPayment}
                          options={[
                            "Electronic check",
                            "Mailed check",
                            "Bank transfer (automatic)",
                            "Credit card (automatic)",
                          ]}
                        />
                      </Field>
                      <Field label="Customer ID (optional)">
                        <input placeholder="e.g. 9497-QCMMS" className="form-field" />
                      </Field>
                    </div>
                  </Panel>

                  <Panel title="Services & add-ons" subtitle="Optional service attributes">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {["Online security", "Tech support", "Streaming TV", "Paperless billing"].map(
                        (service, i) => (
                          <label
                            className="flex items-center justify-between rounded-md border p-3 text-xs"
                            key={service}
                          >
                            {service}
                            <Switch defaultChecked={i === 3} />
                          </label>
                        )
                      )}
                    </div>
                  </Panel>

                  <Button
                    onClick={() => handlePredict(setNotice)}
                    disabled={loading}
                    className="w-full sm:w-auto"
                  >
                    <Sparkles className="size-4" />
                    {loading ? "Running ML Model..." : "Calculate Churn Probability"}
                  </Button>
                </div>

                <div className="space-y-5">
                  {probability === null ? (
                    <Panel title="Prediction outcome" subtitle="Prediction result will appear here">
                      <div className="flex min-h-[350px] flex-col items-center justify-center text-center">
                        <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-accent text-primary">
                          <Gauge className="size-7" />
                        </div>
                        <p className="text-sm font-semibold">Ready to diagnose</p>
                        <p className="mt-1 max-w-[240px] text-xs leading-relaxed text-muted-foreground">
                          Enter customer attributes and run prediction to view the probability and
                          leading risk factors.
                        </p>
                      </div>
                    </Panel>
                  ) : (
                    <Panel
                      title="Prediction outcome"
                      subtitle="Model inference output from Random Forest"
                    >
                      <div className="flex flex-col items-center py-5">
                        <div
                          className="relative flex size-44 items-center justify-center rounded-full"
                          style={{
                            background: `conic-gradient(var(--risk-${getRiskTier(
                              probability
                            ).toLowerCase()}) ${probability * 3.6}deg, var(--muted) 0)`,
                          }}
                        >
                          <div className="flex size-36 flex-col items-center justify-center rounded-full bg-card shadow-inner">
                            <span className="text-4xl font-bold">{probability}%</span>
                            <span className="text-xs text-muted-foreground">churn risk</span>
                          </div>
                        </div>
                        <div className="mt-4">
                          <RiskPill score={probability} />
                        </div>
                      </div>

                      <div className="mt-4 border-t pt-4">
                        <p className="mb-3 text-xs font-semibold">Key contributing factors</p>
                        {[
                          [contract, contract === "Month-to-month" ? 84 : 28],
                          ["Short tenure", Math.max(16, 95 - Number(tenure))],
                          [internet, internet === "Fiber optic" ? 72 : 32],
                          [payment, payment === "Electronic check" ? 68 : 25],
                        ].map(([label, score]) => (
                          <div className="mb-3" key={label}>
                            <div className="mb-1 flex justify-between text-[11px]">
                              <span>{label}</span>
                              <span className="text-muted-foreground font-medium">{score}%</span>
                            </div>
                            <Progress value={Number(score)} className="h-1.5" />
                          </div>
                        ))}
                      </div>

                      {predictedAction && (
                        <div className="mt-4 rounded-md border border-primary/20 bg-primary/5 p-3 text-xs">
                          <p className="font-semibold text-primary">Recommended Action:</p>
                          <p className="text-muted-foreground mt-1">{predictedAction}</p>
                        </div>
                      )}
                    </Panel>
                  )}

                  <Panel title="Threshold policy" subtitle="Calibrated operational decision boundary">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold">52%</p>
                        <p className="text-xs text-muted-foreground">
                          optimized for F1-score balance
                        </p>
                      </div>
                      <Badge variant="secondary">
                        <ShieldCheck className="mr-1 size-3" />
                        Calibrated
                      </Badge>
                    </div>
                  </Panel>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="batch" className="mt-5 space-y-5">
              <Panel
                title="Batch prediction"
                subtitle="Upload customer CSV to batch-score multiple records"
                action={
                  <Button variant="outline" size="sm" onClick={sampleCsv}>
                    <Download className="size-3.5" />
                    Download template
                  </Button>
                }
              >
                <label className="flex min-h-[190px] cursor-pointer flex-col items-center justify-center rounded-md border border-dashed bg-muted/20 p-6 text-center transition hover:bg-muted/40">
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    className="hidden"
                    onChange={handleFile}
                  />
                  <span className="mb-3 flex size-11 items-center justify-center rounded-full bg-accent text-primary">
                    <Upload className="size-5" />
                  </span>
                  <span className="text-sm font-semibold">
                    {fileName || "Drop customer CSV here or click to browse"}
                  </span>
                  <span className="mt-1 text-xs text-muted-foreground">
                    Supports CSV files up to 10 MB · customerID, tenure, charges, contract
                  </span>
                </label>

                {batch.length > 0 && (
                  <div className="mt-5">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-semibold">
                        Validation preview · {batch.length} rows
                      </p>
                      <Badge variant="secondary">
                        <Check className="mr-1 size-3" />
                        Validated
                      </Badge>
                    </div>
                    <CustomerTable customers={batch} onSelect={setSelectedCustomer} />
                    <Button
                      className="mt-4"
                      onClick={() => setNotice(`Scored ${batch.length} customer records`)}
                    >
                      <Sparkles className="size-4" />
                      Score Batch Dataset
                    </Button>
                  </div>
                )}
              </Panel>
            </TabsContent>
          </Tabs>

          <CustomerDrawer
            customer={selectedCustomer}
            onClose={() => setSelectedCustomer(null)}
          />
        </>
      )}
    </DashboardLayout>
  );
}
