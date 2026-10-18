"""
feature_engineering.py
----------------------
Custom feature engineering transformations.

These are applied *before* the preprocessing pipeline's encoding/scaling steps,
or as part of the pipeline when possible.

Design principles:
- Every feature must be explainable.
- No feature uses the churn label or post-prediction information.
- Transformations are reproducible.
"""

import pandas as pd
import numpy as np


def add_tenure_group(df: pd.DataFrame) -> pd.DataFrame:
    """Add a tenure_group column based on tenure ranges.

    Groups:
        0-12   → '0-1 Year'
        13-24  → '1-2 Years'
        25-48  → '2-4 Years'
        49-60  → '4-5 Years'
        61+    → '5+ Years'

    The original tenure column is retained.
    """
    df = df.copy()
    bins = [0, 12, 24, 48, 60, np.inf]
    labels = ["0-1 Year", "1-2 Years", "2-4 Years", "4-5 Years", "5+ Years"]
    df["tenure_group"] = pd.cut(df["tenure"], bins=bins, labels=labels, right=True)
    return df


def add_total_services(df: pd.DataFrame) -> pd.DataFrame:
    """Count the number of additional services a customer subscribes to.

    Services considered (when columns are present):
        PhoneService, MultipleLines, InternetService,
        OnlineSecurity, OnlineBackup, DeviceProtection,
        TechSupport, StreamingTV, StreamingMovies

    A service counts as subscribed if its value is 'Yes' (not 'No' or
    'No internet service' / 'No phone service').
    """
    df = df.copy()
    service_cols = [
        "PhoneService",
        "MultipleLines",
        "OnlineSecurity",
        "OnlineBackup",
        "DeviceProtection",
        "TechSupport",
        "StreamingTV",
        "StreamingMovies",
    ]
    present_cols = [c for c in service_cols if c in df.columns]
    if present_cols:
        df["total_services"] = df[present_cols].apply(
            lambda row: sum(1 for v in row if v == "Yes"), axis=1
        )
    return df


def add_avg_monthly_charge(df: pd.DataFrame) -> pd.DataFrame:
    """Compute average monthly charge = TotalCharges / tenure.

    Handles tenure == 0 by setting avg to MonthlyCharges.
    """
    df = df.copy()
    if "TotalCharges" in df.columns and "tenure" in df.columns:
        df["avg_monthly_charge"] = np.where(
            df["tenure"] > 0,
            df["TotalCharges"] / df["tenure"],
            df["MonthlyCharges"],
        )
    return df


def add_charge_increase_flag(df: pd.DataFrame) -> pd.DataFrame:
    """Flag customers whose current MonthlyCharges exceed their historical average.

    This may suggest a recent price increase for the customer.
    """
    df = df.copy()
    if "avg_monthly_charge" in df.columns and "MonthlyCharges" in df.columns:
        df["charge_increase"] = (
            df["MonthlyCharges"] > df["avg_monthly_charge"]
        ).astype(int)
    return df


def add_has_internet(df: pd.DataFrame) -> pd.DataFrame:
    """Binary flag: does the customer have any internet service?"""
    df = df.copy()
    if "InternetService" in df.columns:
        df["has_internet"] = (df["InternetService"] != "No").astype(int)
    return df


def add_has_phone_and_internet(df: pd.DataFrame) -> pd.DataFrame:
    """Binary flag: customer has both phone and internet services."""
    df = df.copy()
    if "PhoneService" in df.columns and "InternetService" in df.columns:
        df["has_phone_and_internet"] = (
            (df["PhoneService"] == "Yes") & (df["InternetService"] != "No")
        ).astype(int)
    return df


# ---------------------------------------------------------------------------
# Master feature engineering function
# ---------------------------------------------------------------------------

def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """Apply all feature engineering transformations.

    This is the single entry point called from notebooks and pipelines.
    Each transformation is safe to run independently.
    """
    df = add_tenure_group(df)
    df = add_total_services(df)
    df = add_avg_monthly_charge(df)
    df = add_charge_increase_flag(df)
    df = add_has_internet(df)
    df = add_has_phone_and_internet(df)

    new_cols = [
        "tenure_group",
        "total_services",
        "avg_monthly_charge",
        "charge_increase",
        "has_internet",
        "has_phone_and_internet",
    ]
    created = [c for c in new_cols if c in df.columns]
    print(f"Feature engineering added {len(created)} columns: {created}")

    return df
