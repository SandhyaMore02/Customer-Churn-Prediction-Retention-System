export type RiskTier = "Low" | "Medium" | "High";

export type Customer = {
  id: string;
  score: number;
  contract: "Month-to-month" | "One year" | "Two year";
  internet: "Fiber optic" | "DSL" | "None";
  payment: string;
  tenure: number;
  monthly: number;
  total: number;
  gender: string;
  senior: boolean;
  partner: boolean;
  dependents: boolean;
  phone: string;
  multipleLines: string;
  onlineSecurity: string;
  techSupport: string;
  paperless: boolean;
};

export function getRiskTier(score: number): RiskTier {
  if (score >= 70) return "High";
  if (score >= 40) return "Medium";
  return "Low";
}

const source: Array<[string, number, Customer["contract"], Customer["internet"], string, number, number, number]> = [
  ["9497-QCMMS", 94, "Month-to-month", "Fiber optic", "Electronic check", 2, 94.8, 189],
  ["9300-AGZNL", 89, "Month-to-month", "Fiber optic", "Electronic check", 4, 99.1, 396],
  ["7590-VHVEG", 82, "Month-to-month", "DSL", "Mailed check", 1, 29.9, 29.9],
  ["5575-GNVDE", 78, "Month-to-month", "Fiber optic", "Electronic check", 8, 89.7, 718],
  ["7795-CFOCW", 76, "Month-to-month", "Fiber optic", "Bank transfer (automatic)", 12, 85.2, 1022],
  ["9237-HQITU", 73, "One year", "Fiber optic", "Credit card (automatic)", 18, 96.3, 1733],
  ["1452-KIOVK", 68, "Month-to-month", "DSL", "Electronic check", 24, 79.2, 1901],
  ["6713-OKOMC", 64, "Month-to-month", "None", "Mailed check", 31, 20.1, 623],
  ["6388-TABGU", 57, "One year", "DSL", "Bank transfer (automatic)", 44, 56.4, 2482],
  ["9763-GRSKD", 48, "One year", "Fiber optic", "Electronic check", 51, 87.5, 4462],
  ["7469-LKBCI", 38, "Two year", "DSL", "Credit card (automatic)", 60, 55.3, 3318],
  ["8091-TTVAX", 24, "Two year", "Fiber optic", "Bank transfer (automatic)", 72, 101.4, 7300],
  ["0280-XJGEX", 18, "Two year", "Fiber optic", "Credit card (automatic)", 84, 103.2, 8669],
  ["5129-JLPIS", 12, "Two year", "DSL", "Bank transfer (automatic)", 96, 79.8, 7661],
  ["8779-QRDMV", 91, "Month-to-month", "Fiber optic", "Electronic check", 3, 98.5, 295],
  ["0526-SXDJP", 71, "Month-to-month", "DSL", "Mailed check", 9, 35.1, 316],
  ["1680-VDCWW", 43, "One year", "None", "Credit card (automatic)", 28, 19.7, 551],
  ["3668-QPYBK", 35, "Two year", "DSL", "Bank transfer (automatic)", 66, 61.2, 4039],
  ["2928-ISDMQ", 87, "Month-to-month", "Fiber optic", "Electronic check", 6, 92.2, 553],
  ["2040-OTWKI", 52, "One year", "Fiber optic", "Mailed check", 38, 81.7, 3105],
];

export const customers: Customer[] = source.map(([id, score, contract, internet, payment, tenure, monthly, total], i) => ({
  id,
  score,
  contract,
  internet,
  payment,
  tenure,
  monthly,
  total,
  gender: i % 2 ? "Female" : "Male",
  senior: i % 5 === 0,
  partner: i % 3 === 0,
  dependents: i % 4 === 0,
  phone: i % 6 === 0 ? "No" : "Yes",
  multipleLines: i % 3 === 0 ? "Yes" : "No",
  onlineSecurity: i % 4 === 0 ? "No" : "Yes",
  techSupport: i % 5 === 0 ? "No" : "Yes",
  paperless: i % 3 !== 0,
}));

export const riskData = [
  { name: "Low risk", value: 4063, fill: "var(--risk-low)" },
  { name: "Medium risk", value: 1562, fill: "var(--risk-medium)" },
  { name: "High risk", value: 1418, fill: "var(--risk-high)" },
];

export const churnData = [
  { name: "Retained", value: 73.5, fill: "var(--color-primary)" },
  { name: "Churned", value: 26.5, fill: "var(--risk-high)" },
];

export const contractData = [
  { name: "Month-to-month", rate: 42.7, customers: 3875 },
  { name: "One year", rate: 11.3, customers: 1473 },
  { name: "Two year", rate: 2.8, customers: 1695 },
];

export const tenureData = [
  { name: "0–12 mo", churn: 47 },
  { name: "13–24 mo", churn: 31 },
  { name: "25–36 mo", churn: 24 },
  { name: "37–48 mo", churn: 18 },
  { name: "49–60 mo", churn: 12 },
  { name: "61+ mo", churn: 8 },
];

export const featureData = [
  { feature: "Month-to-month contract", impact: 0.075 },
  { feature: "Tenure", impact: -0.039 },
  { feature: "Fiber optic internet", impact: 0.036 },
  { feature: "Two-year contract", impact: -0.031 },
  { feature: "No online security", impact: 0.03 },
  { feature: "TotalCharges", impact: -0.026 },
  { feature: "Electronic check", impact: 0.024 },
];

export const money = (value: number) => `$${value.toFixed(2)}`;
