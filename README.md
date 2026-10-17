# Customer Churn Prediction & Retention System

A complete, end-to-end machine learning project that predicts customer churn using the IBM Telco Customer Churn dataset, explains model decisions with SHAP, and generates actionable retention suggestions.

---

## Table of Contents

- [Problem Statement](#problem-statement)
- [Project Goals](#project-goals)
- [Dataset](#dataset)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [How to Run](#how-to-run)
- [Workflow](#workflow)
- [Model Performance](#model-performance)
- [Key Findings](#key-findings)
- [Limitations & Disclaimers](#limitations--disclaimers)
- [License](#license)

---

## Problem Statement

Businesses lose customers when people cancel a service or move to a competitor. This project uses historical customer data to train a machine learning model that estimates which customers may churn, explains which attributes influenced the predictions, and produces rule-based retention suggestions.

## Project Goals

1. Understand and prepare a customer churn dataset.
2. Explore customer characteristics and churn patterns through EDA.
3. Build a reproducible preprocessing and ML pipeline.
4. Train and compare classification models (Logistic Regression, Random Forest, XGBoost).
5. Evaluate models using Precision, Recall, F1-score, and ROC-AUC.
6. Explain predictions with Explainable AI (SHAP).
7. Generate customer-level churn risk scores and retention suggestions.
8. Save the trained pipeline and document reproducibility.

## Dataset

- **Source:** [IBM Telco Customer Churn](https://www.kaggle.com/datasets/blastchar/telco-customer-churn) (Kaggle)
- **Records:** ~7,043 customers
- **Features:** 21 columns including demographics, services, billing, and contract information
- **Target:** `Churn` (Yes/No → 1/0)
- **Churn Rate:** ~26.5% (moderate class imbalance)

See [`docs/data_dictionary.md`](docs/data_dictionary.md) for detailed column descriptions.

## Technology Stack

| Technology | Purpose |
|---|---|
| Python 3.12 | Core language |
| Pandas / NumPy | Data manipulation |
| Scikit-learn | Preprocessing, pipelines, validation, baseline models |
| XGBoost | Gradient-boosted tree classifier |
| SHAP | Explainable AI — feature attribution |
| Matplotlib / Seaborn | Visualisations |
| Joblib | Model serialisation |
| Pytest | Automated testing |

## Project Structure

```
customer-churn-prediction/
├── data/
│   ├── raw/                          # Original dataset (not committed)
│   └── processed/                    # Derived data (not committed)
├── notebooks/
│   ├── 01_data_understanding.ipynb   # Load, inspect, validate
│   ├── 02_data_quality_and_preprocessing.ipynb  # Clean, split, pipeline
│   ├── 03_eda.ipynb                  # Exploratory analysis & charts
│   ├── 04_feature_engineering.ipynb  # New features & leakage checks
│   ├── 05_model_training.ipynb       # Train, compare, evaluate
│   └── 06_model_explainability.ipynb # SHAP explanations
├── src/
│   ├── __init__.py
│   ├── data_preprocessing.py         # Loading, cleaning, pipeline
│   ├── feature_engineering.py        # Custom feature transformations
│   ├── train.py                      # Model definitions & training
│   ├── evaluate.py                   # Metrics, plots, reports
│   ├── explain.py                    # SHAP explanations
│   └── predict.py                    # Risk scoring & retention rules
├── models/                           # Saved model artifacts
├── reports/
│   ├── figures/                      # Charts & plots
│   ├── model_comparison.csv          # Cross-validation results
│   ├── evaluation_summary.md         # Final test metrics
│   └── customer_churn_predictions.csv # Prediction output
├── docs/
│   ├── data_dictionary.md            # Column descriptions
│   └── retention_rules.md            # Risk thresholds & actions
├── tests/
│   ├── test_preprocessing.py
│   └── test_predictions.py
├── run_pipeline.py                   # End-to-end execution script
├── .gitignore
├── requirements.txt
└── README.md
```

## Setup & Installation

### Prerequisites
- Python 3.10+ 
- pip
- Kaggle CLI (for dataset download) — `pip install kaggle`

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/your-username/customer-churn-prediction.git
cd customer-churn-prediction

# 2. Create and activate virtual environment
python -m venv venv
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Download the dataset
kaggle datasets download -d blastchar/telco-customer-churn -p data/raw --unzip

# 5. Verify setup
python -c "import pandas, sklearn, xgboost, shap; print('All imports OK')"
```

## How to Run

### Full Pipeline (Recommended)

```bash
python run_pipeline.py
```

This runs the complete workflow: data loading → cleaning → feature engineering → model training → evaluation → SHAP explanations → prediction report.

### Individual Notebooks

Open notebooks in order (01 through 06) for step-by-step exploration:

```bash
jupyter notebook notebooks/
```

### Run Tests

```bash
python -m pytest tests/ -v
```

### Generate Predictions for New Data

```python
from src.predict import predict_churn

results = predict_churn("path/to/new_customers.csv")
```

## Workflow

```
Raw CSV → Validate → Clean → Feature Engineering → Train/Test Split
    → Preprocess (ColumnTransformer) → Cross-Validate Models
    → Select Best Model → Final Test Evaluation
    → SHAP Explanations → Risk Scores → Retention Suggestions → Reports
```

## Model Performance

Performance metrics will be populated after running the pipeline. See [`reports/evaluation_summary.md`](reports/evaluation_summary.md) for final results.

| Metric | Score |
|---|---|
| Precision | *Run pipeline* |
| Recall | *Run pipeline* |
| F1-Score | *Run pipeline* |
| ROC-AUC | *Run pipeline* |

## Key Findings

*(Populated after running EDA and model training)*

1. **Contract type** is the strongest predictor — month-to-month customers churn at significantly higher rates.
2. **Short tenure** customers are at highest risk.
3. **Higher monthly charges** correlate with higher churn.
4. **Lack of protective services** (security, tech support, backup) increases predicted churn.
5. **Electronic check** payment method is associated with higher churn.

## Limitations & Disclaimers

- **Model predictions are estimates**, not guarantees.
- **SHAP explains model behaviour**, not causal relationships.
- **Retention suggestions are rule-based** and have not been validated through controlled intervention studies.
- Results are specific to this dataset and may not generalise to other populations or time periods.
- **No business savings are claimed** without real-world validation.

## License

This project is for educational and portfolio purposes. The dataset is provided by IBM under its sample data terms.
