import { CircleHelp } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Panel } from "@/components/common/Panel";

export function InfoPage() {
  return (
    <DashboardLayout
      title="Data & model information"
      subtitle="Explore the data pipeline and model configuration."
    >
      {() => (
        <>
          <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ["Rows", "7,043", "Customer records"],
              ["Columns", "21", "Customer attributes"],
              ["Churn rate", "26.5%", "Positive class (1,869 churners)"],
              ["Dataset", "IBM Telco", "Customer churn repository"],
            ].map(([name, value, note]) => (
              <div className="rounded-lg border bg-card p-4 shadow-sm" key={name}>
                <p className="text-xs text-muted-foreground">{name}</p>
                <p className="mt-2 text-2xl font-bold">{value}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">{note}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <Panel title="Model specification" subtitle="Trained production model configuration">
              <div className="divide-y">
                {[
                  ["Estimator", "Random Forest Classifier (Scikit-learn)"],
                  ["Number of estimators (n_estimators)", "200 trees"],
                  ["Max tree depth (max_depth)", "10"],
                  ["Class weighting", "Balanced (subsample adjusted)"],
                  ["Optimized decision threshold", "0.52 (tuned for maximum F1-score)"],
                  ["Model artifact", "models/churn_model.joblib"],
                  ["Pipeline feature count", "33 engineered features after OneHotEncoder"],
                ].map(([label, value]) => (
                  <div key={label} className="flex flex-wrap justify-between gap-2 py-3 text-xs">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-semibold">{value}</span>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="ML pipeline stages" subtitle="End-to-end preprocessing and scoring">
              <div className="space-y-4">
                {[
                  ["01", "Raw ingestion", "IBM Telco CSV · TotalCharges coerced to numeric"],
                  ["02", "Feature engineering", "Tenure groups, charge ratios, service count sum"],
                  ["03", "ColumnTransformer", "StandardScaler on numeric, OneHotEncoder on categoricals"],
                  ["04", "Class balance calibration", "Cost-sensitive threshold tuning (0.52)"],
                  ["05", "SHAP tree explanation", "TreeExplainer calculates marginal feature contributions"],
                ].map(([n, title, detail]) => (
                  <div key={n} className="flex gap-3">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-primary">
                      {n}
                    </span>
                    <div>
                      <p className="text-xs font-semibold">{title}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">{detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          <div className="mt-5">
            <Panel
              title="Dataset feature taxonomy"
              subtitle="21 customer and contract attributes grouped by business domain"
            >
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  [
                    "Account & Demographics",
                    "gender · SeniorCitizen · Partner · Dependents · tenure (months)",
                  ],
                  [
                    "Subscribed Services",
                    "PhoneService · MultipleLines · InternetService · OnlineSecurity · OnlineBackup · DeviceProtection · TechSupport · StreamingTV · StreamingMovies",
                  ],
                  [
                    "Billing & Agreement",
                    "Contract · PaperlessBilling · PaymentMethod · MonthlyCharges · TotalCharges",
                  ],
                ].map(([title, details]) => (
                  <div className="rounded-md border p-4 bg-muted/20" key={title}>
                    <p className="text-xs font-semibold">{title}</p>
                    <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                      {details}
                    </p>
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          <div className="mt-5 flex items-start gap-3 rounded-md border bg-muted/30 p-4">
            <CircleHelp className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <p className="text-xs leading-relaxed text-muted-foreground">
              All dataset figures, customer records, and model metrics match the IBM Telco
              churn evaluation pipeline run on this machine. No simulated or fabricated numbers are
              presented.
            </p>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
