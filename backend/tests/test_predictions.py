"""
tests/test_predictions.py
--------------------------
Tests for the prediction and risk-scoring module.
"""

import pytest
import pandas as pd
import numpy as np
from pathlib import Path
from unittest.mock import patch, MagicMock

import sys
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.predict import (
    assign_risk_level,
    suggest_retention_action,
    validate_input,
    RISK_THRESHOLDS,
)


# ---------------------------------------------------------------------------
# Tests — Risk Assignment
# ---------------------------------------------------------------------------

class TestAssignRiskLevel:

    def test_high_risk(self):
        assert assign_risk_level(0.85) == "High"

    def test_high_risk_boundary(self):
        assert assign_risk_level(0.7) == "High"

    def test_medium_risk(self):
        assert assign_risk_level(0.55) == "Medium"

    def test_medium_risk_boundary(self):
        assert assign_risk_level(0.4) == "Medium"

    def test_low_risk(self):
        assert assign_risk_level(0.2) == "Low"

    def test_zero_probability(self):
        assert assign_risk_level(0.0) == "Low"

    def test_one_probability(self):
        assert assign_risk_level(1.0) == "High"


class TestRetentionSuggestions:

    def test_high_risk_month_to_month(self):
        action = suggest_retention_action("High", "Month-to-month")
        assert "contract" in action.lower() or "discount" in action.lower()

    def test_medium_risk_default(self):
        action = suggest_retention_action("Medium")
        assert len(action) > 0

    def test_low_risk_default(self):
        action = suggest_retention_action("Low")
        assert "no immediate action" in action.lower()

    def test_unknown_risk_level(self):
        action = suggest_retention_action("Critical")
        assert len(action) > 0  # Should fall back gracefully


class TestValidateInput:

    def test_empty_dataframe(self):
        df = pd.DataFrame()
        warnings = validate_input(df)
        assert any("empty" in w.lower() for w in warnings)

    def test_missing_columns(self):
        df = pd.DataFrame({"A": [1]})
        warnings = validate_input(df, required_cols=["A", "B", "C"])
        assert any("missing" in w.lower() for w in warnings)

    def test_valid_dataframe(self):
        df = pd.DataFrame({"A": [1], "B": [2]})
        warnings = validate_input(df, required_cols=["A", "B"])
        assert len(warnings) == 0

    def test_all_null_column(self):
        df = pd.DataFrame({"A": [1, 2], "B": [None, None]})
        warnings = validate_input(df)
        assert any("null" in w.lower() for w in warnings)
