"""
predict.py
----------
Generate churn predictions, risk scores, and retention suggestions for new customers.

This module loads the saved pipeline, validates input data, produces churn
probabilities, assigns risk bands, and applies transparent retention rules.
"""

import pandas as pd
import numpy as np
from pathlib import Path

from src.data_preprocessing import ID_COL, TARGET_COL, EXCLUDE_COLS, clean_data
from src.feature_engineering import engineer_features
from src.train import load_model


# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

REPORTS_DIR = Path(__file__).resolve().parent.parent / "reports"

# Risk thresholds — documented and transparent
# These should be validated on the training/validation data and adjusted per
# business requirements before deployment.
RISK_THRESHOLDS = {
    "High": 0.7,     # probability >= 0.7
    "Medium": 0.4,   # 0.4 <= probability < 0.7
    "Low": 0.0,      # probability < 0.4
}

# Retention rules — transparent, rule-based suggestions.
# These are starting points for discussion with business stakeholders,
# NOT guaranteed interventions.
RETENTION_RULES = {
    "High": {
        "Month-to-month": "Offer discounted annual contract with loyalty bonus",
        "One year": "Proactive check-in call; offer service upgrade bundle",
        "Two year": "Priority support access; satisfaction survey and follow-up",
        "default": "Escalate to retention specialist for personalised review",
    },
    "Medium": {
        "Month-to-month": "Send targeted retention email with contract upgrade offer",
        "One year": "Offer complementary service trial (e.g., security or backup)",
        "Two year": "Loyalty reward acknowledgement; satisfaction check",
        "default": "Include in next retention campaign batch",
    },
    "Low": {
        "default": "Standard engagement — no immediate action required",
    },
}


# ---------------------------------------------------------------------------
# Risk Assignment
# ---------------------------------------------------------------------------

def assign_risk_level(probability: float) -> str:
    """Assign a risk level based on churn probability.

    Uses the documented RISK_THRESHOLDS.
    """
    if probability >= RISK_THRESHOLDS["High"]:
        return "High"
    elif probability >= RISK_THRESHOLDS["Medium"]:
        return "Medium"
    else:
        return "Low"


def suggest_retention_action(
    risk_level: str,
    contract_type: str | None = None,
) -> str:
    """Return a rule-based retention suggestion.

    Parameters
    ----------
    risk_level : str — 'High', 'Medium', or 'Low'
    contract_type : str, optional — e.g., 'Month-to-month', 'One year', 'Two year'
    """
    rules = RETENTION_RULES.get(risk_level, RETENTION_RULES["Low"])
    if contract_type and contract_type in rules:
        return rules[contract_type]
    return rules.get("default", "No specific action defined")


# ---------------------------------------------------------------------------
# Input Validation
# ---------------------------------------------------------------------------

def validate_input(df: pd.DataFrame, required_cols: list[str] | None = None) -> list[str]:
    """Validate that the input DataFrame has the required columns.

    Returns a list of warning messages (empty if all checks pass).
    """
    warnings_list = []
    if df.empty:
        warnings_list.append("WARNING: Input DataFrame is empty.")

    if required_cols:
        missing = [c for c in required_cols if c not in df.columns]
        if missing:
            warnings_list.append(f"WARNING: Missing columns: {missing}")

    # Check for all-null columns
    null_cols = [c for c in df.columns if df[c].isnull().all()]
    if null_cols:
        warnings_list.append(f"WARNING: Columns with all null values: {null_cols}")

    return warnings_list


# ---------------------------------------------------------------------------
# Prediction Pipeline
# ---------------------------------------------------------------------------

def predict_churn(
    input_path: str | Path,
    model_path: str | None = None,
    threshold: float = 0.5,
    save_report: bool = True,
) -> pd.DataFrame:
    """Generate churn predictions for new customer data.

    Parameters
    ----------
    input_path : str or Path — path to CSV with new customer records
    model_path : str, optional — model filename (default: 'churn_model.joblib')
    threshold : float — classification threshold
    save_report : bool — whether to save the predictions CSV

    Returns
    -------
    pd.DataFrame with columns:
        customer_id, churn_probability, churn_predicted, risk_level, suggested_action
    """
    # Load model
    if model_path:
        pipeline = load_model(model_path)
    else:
        pipeline = load_model()

    # Load and prepare data
    df = pd.read_csv(input_path)
    print(f"Loaded {len(df)} customer records from {input_path}")

    # Preserve IDs and contract info before cleaning
    customer_ids = df[ID_COL].copy() if ID_COL in df.columns else pd.Series(range(len(df)), name="customer_id")
    contract_types = df["Contract"].copy() if "Contract" in df.columns else None

    # Clean and engineer features
    df = clean_data(df)
    df = engineer_features(df)

    # Remove target if present (this might be a labeled dataset used for testing)
    if TARGET_COL in df.columns:
        df = df.drop(columns=[TARGET_COL])

    # Remove ID column
    if ID_COL in df.columns:
        df = df.drop(columns=[ID_COL])

    # Validate
    warnings_list = validate_input(df)
    for w in warnings_list:
        print(w)

    # Predict
    probabilities = pipeline.predict_proba(df)[:, 1]
    predictions = (probabilities >= threshold).astype(int)

    # Build output
    output = pd.DataFrame({
        "customer_id": customer_ids.values,
        "churn_probability": np.round(probabilities, 4),
        "churn_predicted": predictions,
        "risk_level": [assign_risk_level(p) for p in probabilities],
    })

    # Add retention suggestions
    if contract_types is not None:
        output["contract_type"] = contract_types.values
        output["suggested_action"] = [
            suggest_retention_action(risk, contract)
            for risk, contract in zip(output["risk_level"], output["contract_type"])
        ]
    else:
        output["suggested_action"] = [
            suggest_retention_action(risk) for risk in output["risk_level"]
        ]

    # Sort by risk
    risk_order = {"High": 0, "Medium": 1, "Low": 2}
    output["_risk_sort"] = output["risk_level"].map(risk_order)
    output = output.sort_values(["_risk_sort", "churn_probability"], ascending=[True, False])
    output = output.drop(columns=["_risk_sort"]).reset_index(drop=True)

    # Summary
    print(f"\nPrediction Summary:")
    print(f"  Total customers: {len(output)}")
    for level in ["High", "Medium", "Low"]:
        count = (output["risk_level"] == level).sum()
        print(f"  {level} risk: {count} ({count / len(output) * 100:.1f}%)")

    # Save
    if save_report:
        REPORTS_DIR.mkdir(parents=True, exist_ok=True)
        report_path = REPORTS_DIR / "customer_churn_predictions.csv"
        output.to_csv(report_path, index=False)
        print(f"\nPredictions saved to {report_path}")

    return output
