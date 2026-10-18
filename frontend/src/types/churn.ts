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

export type Screen =
  | "overview"
  | "customers"
  | "predict"
  | "explain"
  | "retention"
  | "performance"
  | "info"
  | "settings";
