# ChurnIQ — Customer Churn Intelligence & Retention Platform

An enterprise-quality AI/ML and analytics platform designed to predict customer churn, diagnose underlying risk factors using Explainable AI (SHAP), and execute data-backed retention strategies.

Built on the **IBM Telco Customer Churn** dataset (7,043 customers, 26.5% churn rate), featuring a high-performance **Random Forest** classification engine, a production **FastAPI REST API**, and a modern B2B SaaS frontend generated with **Lovable AI** and integrated directly into this repository.

---

## 🌐 Live Application & Links

- **🚀 Live Production Web App:** [https://churniq-analytics.lovable.app](https://churniq-analytics.lovable.app)
- **⚡ Live Preview URL:** [https://id-preview--ad8e75a2-b5d7-49e3-9ae4-22aae6a9096d.lovable.app](https://id-preview--ad8e75a2-b5d7-49e3-9ae4-22aae6a9096d.lovable.app)
- **🎨 Lovable Cloud Project:** [Churn Intelligence Hub](https://lovable.dev/projects/ad8e75a2-b5d7-49e3-9ae4-22aae6a9096d)
- **📡 Local API Swagger Docs:** `http://localhost:8000/docs` (when running `uvicorn src.api:app`)

---

## Table of Contents

- [Platform Overview](#platform-overview)
- [The 8 Required Screens](#the-8-required-screens)
- [Architecture & Technology Stack](#architecture--technology-stack)
- [Project Structure](#project-structure)
- [Quickstart Guide](#quickstart-guide)
  - [1. Backend & ML Pipeline Setup](#1-backend--ml-pipeline-setup)
  - [2. Frontend Setup & Run](#2-frontend-setup--run)
  - [3. Running the FastAPI Server](#3-running-the-fastapi-server)
- [FastAPI REST API Endpoints](#fastapi-rest-api-endpoints)
- [Model Performance & Comparison](#model-performance--comparison)
- [Explainable AI (SHAP) Insights](#explainable-ai-shap-insights)
- [Automated Testing](#automated-testing)
- [Disclaimers & Limitations](#disclaimers--limitations)

---

## Platform Overview

ChurnIQ answers three critical business questions immediately:
1. **Which customers are at risk of leaving?** (Calibrated probability score + risk tiers: Low < 40%, Medium 40–70%, High ≥ 70%).
2. **Why are they at risk?** (Global and customer-level TreeExplainer SHAP attribution waterfall charts).
3. **What actions should the business take to retain them?** (Automated rule-based retention playbooks with status workflows).

---

## The 8 Required Screens

| Screen | Route | Description |
|---|---|---|
| **1. Executive Overview** | `/` | KPI summary cards (7,043 customers, 1,418 high risk, 26.5% churn, 2,979 attention required), churn distribution donut, risk tier distribution bar, contract churn rates, tenure curve, and top high-risk accounts table. |
| **2. Customer Risk Explorer** | `/customers` | Full customer table with search, multi-attribute filtering (risk tier, contract, internet, payment), score progress bars, sortable columns, CSV export, and 360° slide-over profile drawer. |
| **3. Predict Churn** | `/predict` | Interactive prediction cockpit: single-account prediction calling the trained ML model, risk gauge visualization, factor drivers, and batch CSV scoring preview. |
| **4. Explainable AI** | `/explain` | SHAP TreeExplainer feature importance, positive/negative risk contributors, and individual customer waterfall charts explaining marginal impact vs. baseline. |
| **5. Retention Strategies** | `/retention` | Action board tracking retention outreach plays (Suggested, In Progress, Contacted, Retained, Lost), priority badges, due dates, and custom notes. |
| **6. Model Performance** | `/performance` | Evaluation suite: Accuracy (76.9%), Precision (55.2%), Recall (69.5%), F1-Score (61.5%), ROC-AUC (83.9%), Confusion Matrix, ROC Curve, and PR Curve. |
| **7. Data & Model Info** | `/info` | Dataset specifications, 21-feature taxonomy, end-to-end ColumnTransformer pipeline stages, and hyperparameter configuration. |
| **8. Settings** | `/settings` | Risk tier slider boundaries, light/dark mode switch, compact table row toggles, and notification digest preferences. |

---

## Architecture & Technology Stack

```
┌────────────────────────────────────────────────────────┐
│           ChurnIQ SaaS Frontend (React 19)             │
│   Vite · Tailwind CSS v4 · Recharts · Radix UI · Lucide│
└───────────────────────────┬────────────────────────────┘
                            │ HTTP / JSON
                            ▼
┌────────────────────────────────────────────────────────┐
│             FastAPI ML Backend Service                 │
│  /api/health · /api/dashboard · /api/predict · /metrics│
└───────────────────────────┬────────────────────────────┘
                            │ Scikit-learn Pipeline
                            ▼
┌────────────────────────────────────────────────────────┐
│           Trained Random Forest Classifier             │
│  StandardScaler · OneHotEncoder · Cost-Tuned (0.52)    │
│  SHAP TreeExplainer Attribution Engine                 │
└────────────────────────────────────────────────────────┘
```

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4 (`oklch` enterprise tokens), Recharts, Radix UI primitives, Lucide React, React Router.
- **Backend API:** FastAPI, Uvicorn, Pydantic v2.
- **Machine Learning:** Scikit-learn (RandomForestClassifier, LogisticRegression, Pipeline, ColumnTransformer), XGBoost, SHAP 0.45+ (TreeExplainer).
- **Data & Evaluation:** Pandas, NumPy, Matplotlib, Seaborn, Joblib.
- **Testing:** Pytest (38 automated unit, integration, and API tests).

---

## Project Structure

```
customer-churn-prediction/
├── frontend/                          # ChurnIQ React + Vite Frontend Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── churniq/
│   │   │   │   └── ChurnWorkspace.tsx # Master 8-screen SaaS workspace component
│   │   │   └── ui/                   # Radix UI primitives (Button, Badge, Sheet, etc.)
│   │   ├── lib/
│   │   │   ├── churn-data.ts         # Telco data fixtures, metrics & TypeScript types
│   │   │   └── utils.ts              # Class name merging utility
│   │   ├── services/
│   │   │   └── api.ts                # API client with FastAPI integration & fallback
│   │   ├── App.tsx                   # Client-side router configuration
│   │   ├── index.css                 # Enterprise design system with oklch & dark theme
│   │   └── main.tsx                  # React root mount
│   ├── .env.example                  # VITE_API_BASE_URL configuration
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── data/
│   ├── raw/Telco-Customer-Churn.csv  # 7,043 raw records
│   └── processed/                    # Cleaned train/test splits
├── models/
│   └── churn_model.joblib            # Trained production Random Forest model
├── notebooks/                        # 6 fully-executed analytical notebooks
│   ├── 01_data_understanding.ipynb
│   ├── 02_data_quality_and_preprocessing.ipynb
│   ├── 03_eda.ipynb
│   ├── 04_feature_engineering.ipynb
│   ├── 05_model_training.ipynb
│   └── 06_model_explainability.ipynb
├── reports/
│   ├── figures/                      # 16 publication-ready charts
│   ├── customer_churn_predictions.csv# Pre-scored dataset with risk levels & actions
│   └── model_comparison.csv          # 5-fold cross-validation comparison
├── src/
│   ├── api.py                        # FastAPI REST API application
│   ├── data_preprocessing.py         # Cleaning, encoding, and pipeline definitions
│   ├── evaluate.py                   # Confusion matrix, ROC, PR curve evaluations
│   ├── explain.py                    # SHAP TreeExplainer attribution
│   ├── feature_engineering.py        # Domain features (tenure buckets, charge ratios)
│   ├── predict.py                    # Inference pipeline, risk tiers & retention rules
│   └── train.py                      # Model training & serialization
├── tests/                            # 38 pytest automated test cases
│   ├── test_api.py
│   ├── test_explain.py
│   ├── test_predictions.py
│   └── test_preprocessing.py
├── run_pipeline.py                   # Master end-to-end execution script
├── requirements.txt                  # Python dependencies
└── README.md
```

---

## Quickstart Guide

### 1. Backend & ML Pipeline Setup

```bash
# Clone the repository
git clone <repo-url>
cd "Customer Churn Prediction & Retention System"

# Activate virtual environment
.\venv\Scripts\activate      # Windows
# source venv/bin/activate   # macOS / Linux

# Install dependencies
pip install -r requirements.txt

# Run the end-to-end ML training and evaluation pipeline
python run_pipeline.py

# Run all 38 tests
pytest -q
```

### 2. Frontend Setup & Run

```bash
# Navigate to the frontend directory
cd frontend

# Install npm dependencies
npm install

# Start local development server (runs on http://localhost:5173)
npm run dev

# Or build for production
npm run build
```

### 3. Running the FastAPI Server

To connect the frontend directly to the trained Scikit-learn model:

```bash
# In project root with venv activated:
uvicorn src.api:app --reload --port 8000
```

Once running:
- Interactive API Docs (Swagger): [http://localhost:8000/docs](http://localhost:8000/docs)
- API Health Status: [http://localhost:8000/api/health](http://localhost:8000/api/health)

---

## FastAPI REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check, model status, and metadata |
| `GET` | `/api/dashboard` | Executive KPIs, portfolio risk distribution, contract rates |
| `GET` | `/api/customers` | Searchable, filterable, and paginated customer list |
| `POST`| `/api/predict` | Real-time single customer inference using Random Forest |
| `POST`| `/api/predict/batch` | Batch CSV prediction with downloadable results |
| `GET` | `/api/model/metrics` | Confusion matrix, ROC-AUC, Precision, Recall, F1 scores |
| `GET` | `/api/model/features` | Global SHAP feature importance scores |
| `GET` | `/api/retention` | Prioritized retention recommendations |

---

## Model Performance & Comparison

Evaluated on the held-out test set (1,409 customers) with balanced threshold calibration (threshold = `0.52`):

| Algorithm | Accuracy | Precision | Recall | F1-Score | ROC-AUC | Decision |
|---|---|---|---|---|---|---|
| **Random Forest (Selected)** | **76.9%** | **55.2%** | **69.5%** | **61.5%** | **0.839** | **Selected Best** |
| XGBoost Classifier | 77.4% | 56.1% | 68.2% | 61.5% | 0.835 | Candidate |
| Logistic Regression | 74.2% | 51.3% | 63.1% | 56.6% | 0.801 | Baseline |

---

## Explainable AI (SHAP) Insights

Top factors influencing customer churn:
1. **Contract Type (Month-to-month):** Strongest positive driver of churn (+0.075 SHAP).
2. **Tenure (Months as customer):** Strongest protective factor against churn (-0.039 SHAP).
3. **Internet Service (Fiber Optic):** Associated with higher churn (+0.036 SHAP) due to higher price point and service sensitivity.
4. **Two-Year Contract:** Strongest stabilizing commitment (-0.031 SHAP).
5. **No Online Security / Tech Support:** Correlated with elevated churn (+0.030 SHAP).

---

## Automated Testing

All 38 automated tests pass cleanly across unit, integration, and API layers:
```bash
pytest -v
# ================= 38 passed in 6.98s =================
```

---

## Disclaimers & Limitations

- **Predictive Estimates:** Model predictions are statistical estimates based on historical patterns, not deterministic outcomes.
- **Attribution vs. Causation:** SHAP values measure feature association with model predictions; they do not prove that altering an attribute will directly prevent churn.
- **Rule-Based Retention:** Recommendations are operational guidance and should be validated through structured A/B experimentation.
