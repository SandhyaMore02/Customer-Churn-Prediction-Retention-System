"""
data_preprocessing.py
---------------------
Data loading, validation, cleaning, and preprocessing pipeline construction.

This module provides functions to:
1. Load the raw Telco Customer Churn dataset.
2. Validate schema and data quality.
3. Clean and type-cast columns.
4. Build a scikit-learn ColumnTransformer + Pipeline for reproducible preprocessing.
"""

import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer


# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

RAW_DATA_DIR = Path(__file__).resolve().parent.parent / "data" / "raw"
PROCESSED_DATA_DIR = Path(__file__).resolve().parent.parent / "data" / "processed"

TARGET_COL = "Churn"
ID_COL = "customerID"
RANDOM_STATE = 42
TEST_SIZE = 0.2

# Columns that should NOT be used as features
EXCLUDE_COLS = [ID_COL, TARGET_COL]

# Expected categorical and numeric columns (after cleaning).
# These will be confirmed at runtime; this is the expected schema for the
# standard IBM Telco dataset.
EXPECTED_CATEGORICAL = [
    "gender",
    "SeniorCitizen",
    "Partner",
    "Dependents",
    "PhoneService",
    "MultipleLines",
    "InternetService",
    "OnlineSecurity",
    "OnlineBackup",
    "DeviceProtection",
    "TechSupport",
    "StreamingTV",
    "StreamingMovies",
    "Contract",
    "PaperlessBilling",
    "PaymentMethod",
]

EXPECTED_NUMERIC = [
    "tenure",
    "MonthlyCharges",
    "TotalCharges",
]


# ---------------------------------------------------------------------------
# Data Loading
# ---------------------------------------------------------------------------

def load_raw_data(filepath: str | Path | None = None) -> pd.DataFrame:
    """Load the raw CSV dataset.

    Parameters
    ----------
    filepath : str or Path, optional
        Explicit path to the CSV file.  If ``None``, looks for the first CSV
        in ``data/raw/``.

    Returns
    -------
    pd.DataFrame
    """
    if filepath is None:
        csv_files = list(RAW_DATA_DIR.glob("*.csv"))
        if not csv_files:
            raise FileNotFoundError(
                f"No CSV files found in {RAW_DATA_DIR}. "
                "Download the dataset first."
            )
        filepath = csv_files[0]
    filepath = Path(filepath)
    if not filepath.exists():
        raise FileNotFoundError(f"File not found: {filepath}")

    df = pd.read_csv(filepath)
    print(f"Loaded {filepath.name}: {df.shape[0]} rows, {df.shape[1]} columns")
    return df


# ---------------------------------------------------------------------------
# Data Validation
# ---------------------------------------------------------------------------

def validate_dataset(df: pd.DataFrame) -> dict:
    """Run basic validation checks and return a summary dict.

    Checks performed:
    - Row / column counts
    - Target column presence and label values
    - Missing value counts
    - Duplicate rows and duplicate IDs
    """
    report = {}
    report["n_rows"] = len(df)
    report["n_cols"] = len(df.columns)
    report["columns"] = list(df.columns)
    report["dtypes"] = df.dtypes.astype(str).to_dict()

    # Target
    if TARGET_COL not in df.columns:
        raise ValueError(f"Target column '{TARGET_COL}' not found in dataset.")
    report["target_values"] = df[TARGET_COL].value_counts().to_dict()
    report["churn_rate"] = (
        df[TARGET_COL].map({"Yes": 1, "No": 0, 1: 1, 0: 0}).mean()
    )

    # Missing
    missing = df.isnull().sum()
    report["missing_values"] = missing[missing > 0].to_dict()

    # Duplicates
    report["duplicate_rows"] = int(df.duplicated().sum())
    if ID_COL in df.columns:
        report["duplicate_ids"] = int(df[ID_COL].duplicated().sum())

    return report


# ---------------------------------------------------------------------------
# Data Cleaning
# ---------------------------------------------------------------------------

def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    """Clean the raw dataframe.

    Steps:
    1. Strip whitespace from string columns.
    2. Convert TotalCharges to numeric (blank strings → NaN).
    3. Convert SeniorCitizen (0/1 int) to categorical Yes/No for consistency.
    4. Map target to binary 0/1.
    5. Drop exact duplicate rows if any.
    """
    df = df.copy()

    # Strip whitespace from object columns
    for col in df.select_dtypes(include="object").columns:
        df[col] = df[col].str.strip()

    # TotalCharges: the original dataset encodes blanks as " "
    if "TotalCharges" in df.columns:
        df["TotalCharges"] = pd.to_numeric(df["TotalCharges"], errors="coerce")

    # SeniorCitizen: convert 0/1 → No/Yes for uniform categorical handling
    if "SeniorCitizen" in df.columns and df["SeniorCitizen"].dtype in (
        "int64",
        "int32",
        "float64",
    ):
        df["SeniorCitizen"] = df["SeniorCitizen"].map({0: "No", 1: "Yes"})

    # Target encoding
    if df[TARGET_COL].dtype == "object":
        df[TARGET_COL] = df[TARGET_COL].map({"Yes": 1, "No": 0})
        if df[TARGET_COL].isnull().any():
            raise ValueError(
                "Unexpected target values found after mapping. "
                f"Unique values: {df[TARGET_COL].unique()}"
            )
        df[TARGET_COL] = df[TARGET_COL].astype(int)

    # Drop duplicates
    n_dup = df.duplicated().sum()
    if n_dup > 0:
        print(f"Dropping {n_dup} duplicate rows.")
        df = df.drop_duplicates().reset_index(drop=True)

    return df


# ---------------------------------------------------------------------------
# Feature / Target Separation
# ---------------------------------------------------------------------------

def separate_features_target(
    df: pd.DataFrame,
) -> tuple[pd.DataFrame, pd.Series, pd.Series | None]:
    """Separate features (X), target (y), and customer IDs.

    Returns
    -------
    X : pd.DataFrame   — feature columns only
    y : pd.Series      — binary target
    ids : pd.Series or None — customer identifiers (for reporting only)
    """
    ids = df[ID_COL] if ID_COL in df.columns else None
    y = df[TARGET_COL]
    X = df.drop(columns=[c for c in EXCLUDE_COLS if c in df.columns])
    return X, y, ids


# ---------------------------------------------------------------------------
# Train / Test Split
# ---------------------------------------------------------------------------

def split_data(
    X: pd.DataFrame,
    y: pd.Series,
    test_size: float = TEST_SIZE,
    random_state: int = RANDOM_STATE,
) -> tuple[pd.DataFrame, pd.DataFrame, pd.Series, pd.Series]:
    """Stratified train/test split.

    Returns
    -------
    X_train, X_test, y_train, y_test
    """
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=test_size,
        random_state=random_state,
        stratify=y,
    )
    print(
        f"Train: {X_train.shape[0]} rows | "
        f"Test: {X_test.shape[0]} rows | "
        f"Train churn rate: {y_train.mean():.3f} | "
        f"Test churn rate: {y_test.mean():.3f}"
    )
    return X_train, X_test, y_train, y_test


# ---------------------------------------------------------------------------
# Preprocessing Pipeline
# ---------------------------------------------------------------------------

def identify_column_types(X: pd.DataFrame) -> tuple[list[str], list[str]]:
    """Identify numeric and categorical feature columns from the dataframe."""
    numeric_cols = []
    categorical_cols = []

    for col in X.columns:
        if col in EXCLUDE_COLS:
            continue
        if X[col].dtype in ("float64", "float32", "int64", "int32"):
            numeric_cols.append(col)
        else:
            categorical_cols.append(col)

    return numeric_cols, categorical_cols


def build_preprocessor(
    numeric_cols: list[str],
    categorical_cols: list[str],
) -> ColumnTransformer:
    """Build a ColumnTransformer for numeric and categorical features.

    Numeric pipeline:
        SimpleImputer(strategy='median') → StandardScaler

    Categorical pipeline:
        SimpleImputer(strategy='most_frequent') → OneHotEncoder (handle_unknown='ignore')
    """
    numeric_pipeline = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler()),
        ]
    )

    categorical_pipeline = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="most_frequent")),
            (
                "encoder",
                OneHotEncoder(handle_unknown="ignore", sparse_output=False),
            ),
        ]
    )

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", numeric_pipeline, numeric_cols),
            ("cat", categorical_pipeline, categorical_cols),
        ],
        remainder="drop",
    )

    return preprocessor


def get_feature_names(preprocessor: ColumnTransformer) -> list[str]:
    """Extract feature names from a fitted ColumnTransformer."""
    return list(preprocessor.get_feature_names_out())


# ---------------------------------------------------------------------------
# Convenience: full preprocessing run
# ---------------------------------------------------------------------------

def run_preprocessing(filepath: str | Path | None = None):
    """Convenience function to run the full preprocessing pipeline.

    Returns a dict with all artefacts needed for modelling.
    """
    df = load_raw_data(filepath)
    report = validate_dataset(df)
    print(f"\nDataset validation report:")
    for k, v in report.items():
        if k != "dtypes":
            print(f"  {k}: {v}")

    df = clean_data(df)
    X, y, ids = separate_features_target(df)
    X_train, X_test, y_train, y_test = split_data(X, y)

    numeric_cols, categorical_cols = identify_column_types(X_train)
    print(f"\nNumeric features ({len(numeric_cols)}): {numeric_cols}")
    print(f"Categorical features ({len(categorical_cols)}): {categorical_cols}")

    preprocessor = build_preprocessor(numeric_cols, categorical_cols)

    return {
        "X_train": X_train,
        "X_test": X_test,
        "y_train": y_train,
        "y_test": y_test,
        "ids": ids,
        "preprocessor": preprocessor,
        "numeric_cols": numeric_cols,
        "categorical_cols": categorical_cols,
        "report": report,
    }
