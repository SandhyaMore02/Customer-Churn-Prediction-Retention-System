/**
 * api.ts
 * ------
 * Centralized API client service for ChurnIQ frontend.
 * Communicates with FastAPI backend (/api/*) when available,
 * and falls back gracefully to local Telco datasets if the backend is offline.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

export interface DashboardResponse {
  total_customers: number;
  churn_rate: number;
  retained_rate: number;
  risk_distribution: {
    High: number;
    Medium: number;
    Low: number;
  };
  contract_churn_rates: Record<string, { rate: number; count: number }>;
  model_threshold: number;
}

export interface PredictionPayload {
  customerID?: string;
  gender?: string;
  SeniorCitizen?: number;
  Partner?: string;
  Dependents?: string;
  tenure: number;
  PhoneService?: string;
  MultipleLines?: string;
  InternetService: string;
  OnlineSecurity?: string;
  OnlineBackup?: string;
  DeviceProtection?: string;
  TechSupport?: string;
  StreamingTV?: string;
  StreamingMovies?: string;
  Contract: string;
  PaperlessBilling?: string;
  PaymentMethod: string;
  MonthlyCharges: number;
  TotalCharges?: number;
}

export interface PredictionResponse {
  customerID: string;
  churn_probability: number;
  predicted_churn: boolean;
  risk_level: "Low" | "Medium" | "High";
  decision_threshold: number;
  suggested_retention_action: string;
  top_risk_factors?: Array<{ factor: string; impact: string }>;
}

export interface ModelMetricsResponse {
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  roc_auc: number;
  tuned_threshold: number;
  confusion_matrix: {
    true_negative: number;
    false_positive: number;
    false_negative: number;
    true_positive: number;
  };
  model_comparison?: Array<{
    model: string;
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
    roc_auc: number;
    status: string;
  }>;
}

export interface HealthResponse {
  status: string;
  model_loaded: boolean;
  model_type: string;
  cached_customers: number;
  api_version: string;
}

export const api = {
  /**
   * Check backend server health status
   */
  async checkHealth(): Promise<HealthResponse> {
    try {
      const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(3000) });
      if (!res.ok) throw new Error("Health check failed");
      return await res.json();
    } catch {
      return {
        status: "offline",
        model_loaded: false,
        model_type: "RandomForestClassifier",
        cached_customers: 7043,
        api_version: "1.0.0 (demo mode)",
      };
    }
  },

  /**
   * Fetch executive dashboard summary metrics
   */
  async getDashboard(): Promise<DashboardResponse | null> {
    try {
      const res = await fetch(`${API_BASE}/dashboard`, { signal: AbortSignal.timeout(4000) });
      if (!res.ok) throw new Error("Dashboard endpoint unavailable");
      return await res.json();
    } catch (e) {
      console.warn("Using offline dashboard fixtures:", e);
      return null;
    }
  },

  /**
   * Run real-time machine learning prediction using trained Random Forest
   */
  async predictChurn(payload: PredictionPayload): Promise<PredictionResponse | null> {
    try {
      const res = await fetch(`${API_BASE}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) throw new Error(`Prediction error: ${res.statusText}`);
      return await res.json();
    } catch (e) {
      console.warn("Backend prediction failed, falling back to local estimator:", e);
      return null;
    }
  },

  /**
   * Upload batch CSV for scoring
   */
  async predictBatch(file: File): Promise<any | null> {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${API_BASE}/predict/batch`, {
        method: "POST",
        body: formData,
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) throw new Error(`Batch scoring error: ${res.statusText}`);
      return await res.json();
    } catch (e) {
      console.warn("Backend batch scoring unavailable:", e);
      return null;
    }
  },

  /**
   * Fetch model metrics
   */
  async getModelMetrics(): Promise<ModelMetricsResponse | null> {
    try {
      const res = await fetch(`${API_BASE}/model/metrics`, { signal: AbortSignal.timeout(4000) });
      if (!res.ok) throw new Error("Metrics endpoint unavailable");
      return await res.json();
    } catch (e) {
      console.warn("Backend metrics unavailable:", e);
      return null;
    }
  },
};
