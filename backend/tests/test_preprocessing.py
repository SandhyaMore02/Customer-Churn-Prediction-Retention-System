"""
tests/test_preprocessing.py
----------------------------
Automated tests for data loading, cleaning, and preprocessing functions.
"""

import pytest
import pandas as pd
import numpy as np
from pathlib import Path

import sys
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.data_preprocessing import (
    clean_data,
    validate_dataset,
    separate_features_target,
    split_data,
    build_preprocessor,
    identify_column_types,
    TARGET_COL,
    ID_COL,
)
from src.feature_engineering import engineer_features


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture
def sample_raw_data():
    """Create a small sample DataFrame mimicking the Telco dataset."""
    return pd.DataFrame({
        "customerID": ["C001", "C002", "C003", "C004", "C005",
                        "C006", "C007", "C008", "C009", "C010"],
        "gender": ["Male", "Female", "Male", "Female", "Male",
                    "Female", "Male", "Female", "Male", "Female"],
        "SeniorCitizen": [0, 1, 0, 0, 1, 0, 0, 1, 0, 0],
        "Partner": ["Yes", "No", "Yes", "No", "Yes",
                    "No", "Yes", "No", "Yes", "No"],
        "Dependents": ["No", "No", "Yes", "No", "No",
                       "Yes", "No", "No", "Yes", "No"],
        "tenure": [1, 34, 2, 45, 2, 8, 22, 10, 28, 62],
        "PhoneService": ["No", "Yes", "Yes", "No", "Yes",
                         "Yes", "Yes", "No", "Yes", "Yes"],
        "MultipleLines": ["No phone service", "No", "No", "No phone service", "No",
                          "Yes", "Yes", "No phone service", "No", "Yes"],
        "InternetService": ["DSL", "DSL", "DSL", "DSL", "Fiber optic",
                            "Fiber optic", "No", "DSL", "Fiber optic", "DSL"],
        "OnlineSecurity": ["No", "Yes", "Yes", "Yes", "No",
                           "No", "No internet service", "Yes", "No", "Yes"],
        "OnlineBackup": ["Yes", "No", "Yes", "No", "No",
                         "No", "No internet service", "Yes", "Yes", "Yes"],
        "DeviceProtection": ["No", "Yes", "No", "Yes", "No",
                             "Yes", "No internet service", "No", "Yes", "Yes"],
        "TechSupport": ["No", "Yes", "No", "Yes", "No",
                        "No", "No internet service", "No", "Yes", "Yes"],
        "StreamingTV": ["No", "No", "No", "Yes", "No",
                        "Yes", "No internet service", "No", "Yes", "Yes"],
        "StreamingMovies": ["No", "No", "No", "Yes", "No",
                            "Yes", "No internet service", "No", "Yes", "No"],
        "Contract": ["Month-to-month", "One year", "Month-to-month", "One year",
                      "Month-to-month", "Month-to-month", "Two year",
                      "Month-to-month", "One year", "Two year"],
        "PaperlessBilling": ["Yes", "No", "Yes", "No", "Yes",
                             "Yes", "No", "Yes", "No", "No"],
        "PaymentMethod": [
            "Electronic check", "Mailed check", "Mailed check",
            "Bank transfer (automatic)", "Electronic check",
            "Electronic check", "Credit card (automatic)",
            "Electronic check", "Bank transfer (automatic)",
            "Credit card (automatic)",
        ],
        "MonthlyCharges": [29.85, 56.95, 53.85, 42.30, 70.70,
                           99.65, 19.70, 30.20, 104.80, 56.15],
        "TotalCharges": ["29.85", "1889.50", "108.15", "1840.75", "151.65",
                         "820.50", "346.45", " ", "2971.55", "3487.95"],
        "Churn": ["Yes", "No", "Yes", "No", "Yes",
                  "Yes", "No", "No", "No", "No"],
    })


@pytest.fixture
def cleaned_data(sample_raw_data):
    """Return cleaned data."""
    return clean_data(sample_raw_data)


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

class TestCleanData:
    """Tests for the clean_data function."""

    def test_target_encoded_binary(self, cleaned_data):
        """Target column should be 0 and 1 only."""
        assert set(cleaned_data[TARGET_COL].unique()).issubset({0, 1})

    def test_total_charges_numeric(self, cleaned_data):
        """TotalCharges should be float, not string."""
        assert cleaned_data["TotalCharges"].dtype == np.float64

    def test_blank_total_charges_becomes_nan(self, cleaned_data):
        """Blank TotalCharges (' ') should become NaN."""
        # Row C008 had ' ' for TotalCharges
        c008 = cleaned_data[cleaned_data["customerID"] == "C008"]
        assert c008["TotalCharges"].isna().all()

    def test_senior_citizen_categorical(self, cleaned_data):
        """SeniorCitizen should be converted to Yes/No strings."""
        assert cleaned_data["SeniorCitizen"].dtype == "object"
        assert set(cleaned_data["SeniorCitizen"].unique()).issubset({"Yes", "No"})

    def test_no_duplicates(self, cleaned_data):
        """No duplicate rows after cleaning."""
        assert cleaned_data.duplicated().sum() == 0


class TestValidateDataset:
    """Tests for the validate_dataset function."""

    def test_returns_expected_keys(self, sample_raw_data):
        report = validate_dataset(sample_raw_data)
        expected_keys = {"n_rows", "n_cols", "columns", "dtypes", "target_values",
                         "churn_rate", "missing_values", "duplicate_rows"}
        assert expected_keys.issubset(set(report.keys()))

    def test_churn_rate_valid(self, sample_raw_data):
        report = validate_dataset(sample_raw_data)
        assert 0 <= report["churn_rate"] <= 1


class TestSeparateFeatures:
    """Tests for separate_features_target."""

    def test_target_not_in_features(self, cleaned_data):
        X, y, ids = separate_features_target(cleaned_data)
        assert TARGET_COL not in X.columns

    def test_id_not_in_features(self, cleaned_data):
        X, y, ids = separate_features_target(cleaned_data)
        assert ID_COL not in X.columns

    def test_y_is_series(self, cleaned_data):
        X, y, ids = separate_features_target(cleaned_data)
        assert isinstance(y, pd.Series)

    def test_ids_preserved(self, cleaned_data):
        X, y, ids = separate_features_target(cleaned_data)
        assert len(ids) == len(X)


class TestSplitData:
    """Tests for train/test splitting."""

    def test_no_data_loss(self, cleaned_data):
        X, y, _ = separate_features_target(cleaned_data)
        X_train, X_test, y_train, y_test = split_data(X, y)
        assert len(X_train) + len(X_test) == len(X)

    def test_stratification(self, cleaned_data):
        X, y, _ = separate_features_target(cleaned_data)
        X_train, X_test, y_train, y_test = split_data(X, y)
        # Both sets should have churners
        train_rate = y_train.mean()
        overall_rate = y.mean()
        # Allow some tolerance due to small sample
        assert abs(train_rate - overall_rate) < 0.2


class TestPreprocessor:
    """Tests for the preprocessing pipeline."""

    def test_preprocessor_transforms(self, cleaned_data):
        X, y, _ = separate_features_target(cleaned_data)
        num_cols, cat_cols = identify_column_types(X)
        preprocessor = build_preprocessor(num_cols, cat_cols)
        X_transformed = preprocessor.fit_transform(X)
        assert X_transformed.shape[0] == X.shape[0]
        assert X_transformed.shape[1] > 0

    def test_preprocessor_handles_unseen_categories(self, cleaned_data, sample_raw_data):
        """Preprocessor should handle unseen categories with handle_unknown='ignore'."""
        X, y, _ = separate_features_target(cleaned_data)
        num_cols, cat_cols = identify_column_types(X)
        preprocessor = build_preprocessor(num_cols, cat_cols)
        preprocessor.fit(X)

        # Create a test row with an unseen category
        test_row = X.iloc[[0]].copy()
        test_row["Contract"] = "Three year"  # unseen
        X_test = preprocessor.transform(test_row)
        assert X_test.shape[0] == 1


class TestFeatureEngineering:
    """Tests for feature engineering functions."""

    def test_engineer_features_adds_columns(self, cleaned_data):
        df = engineer_features(cleaned_data)
        assert "tenure_group" in df.columns
        assert "total_services" in df.columns
        assert "avg_monthly_charge" in df.columns

    def test_no_target_leakage(self, cleaned_data):
        """Engineered features should not use the target column."""
        # Remove target, run engineering, confirm no error
        df_no_target = cleaned_data.drop(columns=[TARGET_COL])
        result = engineer_features(df_no_target)
        assert "tenure_group" in result.columns
