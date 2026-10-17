# Customer Churn Prediction & Retention System
## Professional Implementation Plan

**Project type:** End-to-end machine learning project  
**Primary language:** Python  
**Level:** Beginner-friendly, built using professional development practices  
**Status:** Complete (All Phases Implemented & Verified)  
**Version:** 1.0

---

## 1. Project Overview

### 1.1 Problem Statement

Businesses lose customers when people cancel a service or move to a competitor. Losing customers can reduce revenue and increase the cost of finding new customers.

This project will use historical customer data to train a machine learning model that estimates which customers may churn. It will also explain which customer attributes influenced the model's predictions and produce practical, rule-based retention suggestions.

### 1.2 Project Goals

1. Understand and prepare a customer churn dataset.
2. Explore customer characteristics and churn patterns.
3. Build a reproducible preprocessing and machine learning pipeline.
4. Train and compare classification models.
5. Evaluate models using Precision, Recall, F1-score, and ROC-AUC.
6. Explain model predictions with Explainable AI (SHAP).
7. Generate customer-level churn risk scores and retention suggestions.
8. Save the trained pipeline and document how to reproduce the results.

### 1.3 What the System Will and Will Not Do

**It will:**
- Learn patterns from labelled historical customer records.
- Estimate churn probability for eligible new records.
- explain model behaviour with feature-attribution methods.
- Prioritize customers using documented risk thresholds.
- Suggest possible retention actions using transparent business rules.

**It will not:**
- Guarantee that a customer will or will not leave.
- Prove that a feature causes churn.
- Guarantee that a retention offer will work.
- Claim business savings without a real-world intervention study.

---

## 2. Technology Stack

Use the requested stack as the core of the project.

| Technology | Purpose |
|---|---|
| Python | Main programming language |
| Pandas | Read, inspect, clean, and transform tabular data |
| NumPy | Numerical operations |
| Scikit-learn | Preprocessing, pipelines, train/test split, baseline models, validation, and evaluation |
| XGBoost | Gradient-boosted tree classification model |
| Statistics | Understand distributions, rates, imbalance, and evaluation results |
| EDA | Explore churn patterns using tables and visualizations |
| Feature engineering | Prepare useful model inputs |
| Explainable AI (SHAP) | Explain global feature importance and individual predictions |
| Matplotlib / Seaborn | Visualizations for EDA and evaluation |
| Joblib | Save and load the fitted model pipeline |
| Pytest | Automated checks for key functions and predictions |
| Git / GitHub | Version control and project sharing |

**Scope note:** SHAP, Matplotlib, Seaborn, Joblib, and Pytest are supporting tools for implementing and validating the requested project. They do not replace the core stack.

**Initial version:** A Python project with notebooks, reusable source code, saved model artifacts, and CSV prediction reports. A web dashboard or API can be considered later, but is not required for the first version.

---

## 3. Dataset Plan

### 3.1 Recommended Starting Dataset

Start with the **IBM Telco Customer Churn** dataset, commonly available through public learning repositories and Kaggle mirrors. Before use, record the exact source URL, version, licence/terms, and download date in the README.

The dataset typically includes customer information such as:
- Tenure
- Contract type
- Monthly and total charges
- Services subscribed to
- Payment method
- Churn label

Column names and data types can differ between copies. Inspect the downloaded file rather than assuming every copy is identical.

### 3.2 Target Variable

The target is the historical churn label, commonly represented as `Churn` with values such as `Yes` and `No`.

For modelling, convert the label to:
- `1` = churned
- `0` = did not churn

Do not use the target label as an input feature.

### 3.3 Dataset Checks

Before modelling:
1. Confirm the file loads correctly.
2. Record row and column counts.
3. Inspect column names and data types.
4. Check missing values, duplicates, and invalid values.
5. Confirm the target labels and churn rate.
6. Identify identifiers that should not be used as predictive features.
7. Check for leakage: exclude fields that would not be available at the moment a prediction is intended to be made.

---

## 4. End-to-End Workflow

```text
Raw customer CSV
       |
       v
Data validation and understanding
       |
       v
Exploratory Data Analysis (EDA)
       |
       v
Train / test split
       |
       v
Preprocessing + feature engineering
       |
       v
Baseline model and candidate models
       |
       v
Cross-validation and model comparison
       |
       v
Final evaluation on untouched test set
       |
       v
SHAP explanations
       |
       v
Customer risk scores and retention suggestions
       |
       v
Saved model + reports + documentation
```

The test set must remain untouched during model selection. Any learned preprocessing steps must be fitted on training data only. Prefer a Scikit-learn `Pipeline` and `ColumnTransformer` to keep transformations and model training together.

---

## 5. Step-by-Step Implementation

### Phase 0 — Set Up the Development Environment

**Tasks**
1. Create a project folder and Git repository.
2. Create and activate a Python virtual environment.
3. Install the project dependencies.
4. Add a `.gitignore` file.
5. Verify Python and package versions.

**Deliverables**
- Working environment
- `requirements.txt`
- `.gitignore`
- Initial Git commit

**Completion criteria**
- The project imports all required packages without errors.
- Local environment files and large/private data files are not accidentally committed.

### Phase 1 — Obtain and Understand the Dataset

**Tasks**
1. Download the selected dataset.
2. Store the original file in `data/raw/`.
3. Load it with Pandas.
4. Inspect sample rows, shape, columns, data types, and summary statistics.
5. Create a short data dictionary.
6. Confirm target labels and check for potential leakage.

**Deliverables**
- Raw dataset
- `notebooks/01_data_understanding.ipynb`
- Dataset notes in the README or `docs/data_dictionary.md`

**Completion criteria**
- Each important column has a known meaning and data type.
- The target variable is identified and its label mapping is documented.

### Phase 2 — Data Quality and Preprocessing

**Tasks**
1. Check duplicate rows and duplicate customer identifiers.
2. Check missing, blank, malformed, and impossible values.
3. Convert columns to appropriate data types.
4. Decide how to handle missing values based on the observed data.
5. Exclude identifiers and leakage-prone fields from model inputs.
6. Separate features (`X`) from the target (`y`).
7. Split into training and test sets using a fixed random seed and stratification where appropriate.
8. Build preprocessing using `ColumnTransformer`:
   - Numeric columns: impute missing values if needed; scale for models that benefit from scaling.
   - Categorical columns: impute if needed and one-hot encode unknown-safe categories.
9. Keep all learned transformations inside the pipeline.

**Deliverables**
- `src/data_preprocessing.py`
- `notebooks/02_data_quality_and_preprocessing.ipynb`

**Completion criteria**
- Preprocessing works on training and unseen test rows.
- No target leakage occurs.
- Test data does not influence fitted preprocessing.

### Phase 3 — Exploratory Data Analysis (EDA)

**Tasks**
1. Calculate the overall churn rate.
2. Examine numeric feature distributions.
3. Compare churn rates across categorical groups.
4. Investigate tenure, contract, charges, payment method, and service features where present.
5. Visualize class balance and useful relationships.
6. Write a few evidence-based observations with counts or rates.
7. Avoid interpreting correlation as proof of causation.

**Suggested charts**
- Churn class-count bar chart
- Churn rate by contract type
- Tenure distribution by churn status
- Monthly charges by churn status
- Correlation plot for suitable numeric features

**Deliverable**
- `notebooks/03_eda.ipynb`
- Saved figures under `reports/figures/`

**Completion criteria**
- Every chart has a title, labelled axes, and a short interpretation.
- Findings are based on the actual dataset rather than assumptions.

### Phase 4 — Feature Engineering

**Tasks**
1. Confirm which features would be known at prediction time.
2. Correct data types and encode categorical variables.
3. Create new features only when there is a clear business reason.
4. Avoid features that reveal the future outcome.
5. Document any feature creation and its rationale.
6. Keep transformations reproducible inside the pipeline when possible.

**Potential examples**
- Tenure groups for analysis (retain original tenure if useful).
- Service-count features, if the source columns support a clear definition.
- Contract or billing indicators created by the encoder rather than manually duplicated.

**Deliverables**
- `src/feature_engineering.py` if reusable custom features are needed
- `notebooks/04_feature_engineering.ipynb`

**Completion criteria**
- Features are explainable and reproducible.
- No feature uses the churn label or information unavailable at prediction time.

### Phase 5 — Train Candidate Models

**Models**
1. Logistic Regression — baseline.
2. Random Forest — non-linear tree ensemble.
3. XGBoost Classifier — boosted tree model.

**Tasks**
1. Build a pipeline for each model using the same preprocessing approach where appropriate.
2. Use a stratified training/validation approach or stratified cross-validation.
3. Establish a baseline before tuning.
4. Use `random_state` where supported.
5. Track parameters, validation metrics, and notes.
6. Consider class weighting or other imbalance methods only after inspecting the data; apply any resampling only inside training folds.

**Deliverables**
- `src/train.py`
- `notebooks/05_model_training.ipynb`
- `reports/model_comparison.csv`

**Completion criteria**
- Models are evaluated on comparable folds.
- The selected model is chosen using business-relevant metrics, not test-set performance.

### Phase 6 — Evaluate and Select a Model

**Required metrics**
- **Precision:** Of customers predicted to churn, the proportion who actually churned.
- **Recall:** Of customers who actually churned, the proportion correctly identified.
- **F1-score:** Harmonic mean of precision and recall.
- **ROC-AUC:** How well the model ranks churners above non-churners across thresholds.

**Tasks**
1. Generate predictions and churn probabilities.
2. Calculate all required metrics.
3. Plot a confusion matrix and ROC curve.
4. Compare candidate models.
5. Choose a classification threshold based on business needs and validation data.
6. Evaluate the selected model once on the untouched test set.
7. Document limitations and any signs of overfitting.

**Deliverables**
- `src/evaluate.py`
- `reports/evaluation_summary.md`
- Evaluation figures

**Completion criteria**
- Metrics are reproducible.
- Test-set results are reported only after model and threshold decisions are made.
- No performance number is invented or promised in advance.

### Phase 7 — Explain Predictions with SHAP

**Tasks**
1. Install and configure SHAP for the selected model.
2. Explain a representative sample of model predictions.
3. Create a global summary plot of feature contributions.
4. Explain individual customer predictions.
5. Translate technical explanations into clear business language.
6. Record that SHAP describes model behaviour and does not establish causality.

**Deliverables**
- `src/explain.py`
- `notebooks/06_model_explainability.ipynb`
- SHAP figures under `reports/figures/`

**Completion criteria**
- Global and individual explanations can be reproduced.
- Feature names are understandable after preprocessing.
- Explanations are not presented as proof of cause.

### Phase 8 — Generate Risk Scores and Retention Suggestions

**Tasks**
1. Load the saved pipeline and a new customer CSV.
2. Validate that required columns are present.
3. Produce a churn probability for each eligible customer.
4. Assign risk bands using thresholds chosen from validation results and business requirements.
5. Add transparent, documented retention rules.
6. Export a report with customer identifier, probability, risk band, and suggested action.
7. Avoid including unnecessary personal information in reports.

**Example output schema**

| customer_id | churn_probability | risk_level | suggested_action |
|---|---:|---|---|
| Example ID | 0.82 | High | Review contract suitability |

This is a schema example, not an actual prediction. Risk thresholds and action rules must be documented and validated.

**Deliverables**
- `src/predict.py`
- `reports/customer_churn_predictions.csv`
- `docs/retention_rules.md`

**Completion criteria**
- New records are processed using the same fitted pipeline.
- The output probability is between 0 and 1.
- Risk categories and retention rules are traceable to documented decisions.

### Phase 9 — Testing and Quality Checks

**Tasks**
1. Test data-loading and validation functions.
2. Test preprocessing with missing and unseen categorical values.
3. Test that prediction output has the expected columns and valid probabilities.
4. Test model save/load behaviour.
5. Run the complete workflow on a small sample.
6. Check that notebooks and scripts run from a clean environment.

**Deliverables**
- `tests/`
- Passing test results

**Completion criteria**
- Core functions have automated tests.
- The saved model can be loaded and used on new records.
- Common data errors return clear messages.

### Phase 10 — Documentation and GitHub Delivery

**Tasks**
1. Write the project README.
2. Document the problem, dataset source, setup, workflow, metrics, and limitations.
3. Add selected charts and a sample output with fictional or safely anonymized identifiers.
4. Include dependency installation and run commands.
5. Record model and dataset versions where possible.
6. Remove secrets, private customer data, and unnecessary large files.
7. Commit the completed project and publish it to GitHub.

**Deliverables**
- Professional `README.md`
- Reproducible source code and notebooks
- Documented results and visualizations
- Public GitHub repository, if desired

**Completion criteria**
- Another developer can follow the README to reproduce the project.
- Results are based on actual experiments.
- Dataset attribution and usage terms are documented.

---

## 6. Suggested Project Structure

```text
customer-churn-prediction/
├── data/
│   ├── raw/                     # Original dataset; usually not committed
│   └── processed/               # Optional derived data; usually not committed
├── notebooks/
│   ├── 01_data_understanding.ipynb
│   ├── 02_data_quality_and_preprocessing.ipynb
│   ├── 03_eda.ipynb
│   ├── 04_feature_engineering.ipynb
│   ├── 05_model_training.ipynb
│   └── 06_model_explainability.ipynb
├── src/
│   ├── __init__.py
│   ├── data_preprocessing.py
│   ├── feature_engineering.py
│   ├── train.py
│   ├── evaluate.py
│   ├── explain.py
│   └── predict.py
├── models/                      # Saved model artifacts; often not committed
├── reports/
│   ├── figures/
│   ├── model_comparison.csv
│   └── evaluation_summary.md
├── docs/
│   ├── data_dictionary.md
│   └── retention_rules.md
├── tests/
│   ├── test_preprocessing.py
│   └── test_predictions.py
├── .gitignore
├── requirements.txt
└── README.md
```

Create optional files only when they are needed. Keep the first version simple enough to understand and run.

---

## 7. Dependencies

Start with a `requirements.txt` containing the core and supporting packages:

```text
pandas
numpy
scikit-learn
xgboost
shap
matplotlib
seaborn
jupyter
joblib
pytest
```

After the environment works, record the tested package versions for reproducibility. Do not assume the latest versions of every package are always mutually compatible.

---

## 8. Model Selection Principles

- Start with a simple baseline.
- Compare models using the same validation method.
- Prioritize recall when missing churners is especially costly, but monitor precision because retention outreach also costs money.
- Select the classification threshold using validation data and business constraints.
- Use ROC-AUC alongside threshold-specific metrics.
- Report the final test-set results once.
- Do not promise a particular score before running the experiments.
- Consider probability calibration if the business will interpret scores as meaningful probabilities.

---

## 9. Risks and How We Will Handle Them

| Risk | How we will handle it |
|---|---|
| Data leakage | Split data correctly and fit transformations only on training data |
| Class imbalance | Inspect class distribution; use appropriate metrics and consider training-only techniques |
| Overfitting | Use cross-validation and a final untouched test set |
| Misleading explanations | Treat SHAP as model explanation, not causation |
| Poor retention recommendations | Keep rules transparent and test interventions before claiming impact |
| Dataset differences | Inspect actual column names, types, and source version |
| Reproducibility problems | Track dependencies, random seeds, and steps in the README |
| Sensitive data exposure | Avoid committing private data and unnecessary personal identifiers |

---

## 10. Final Deliverables

At completion, the repository should contain:

- [x] A documented customer churn dataset source.
- [x] Data-quality checks and EDA.
- [x] A reproducible preprocessing pipeline.
- [x] Baseline and candidate classification models.
- [x] A model comparison using Precision, Recall, F1-score, and ROC-AUC.
- [x] A final evaluation report and charts.
- [x] SHAP global and individual explanations.
- [x] A prediction script that accepts new customer records.
- [x] A customer risk and retention-suggestion report.
- [x] Automated tests for core behaviour.
- [x] A professional README with setup and reproduction instructions.
- [x] A GitHub repository that contains no secrets or private customer data.

---

## 11. Recommended Build Order for a Beginner

Build in small checkpoints rather than writing the entire project at once:

1. Set up Python and the project folder.
2. Load the dataset and understand its columns.
3. Clean and inspect the data.
4. Create EDA charts and write observations.
5. Build the preprocessing pipeline.
6. Train a baseline model.
7. Train and compare Random Forest and XGBoost.
8. Evaluate the chosen model.
9. Add SHAP explanations.
10. Generate risk scores and rule-based retention suggestions.
11. Add tests and finish the README.

**Working rule:** Complete and understand one checkpoint before moving to the next. The goal is not just to make code run; it is to understand why each step exists and be able to explain it in an interview.
