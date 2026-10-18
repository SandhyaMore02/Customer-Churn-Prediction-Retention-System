"""
tests/test_explain.py
---------------------
Automated tests for SHAP explainability functions.
"""

import pytest
import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.ensemble import RandomForestClassifier

import sys
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.explain import get_top_features, get_shap_explainer
from src.data_preprocessing import build_preprocessor


class TestExplain:
    """Tests for model explainability functions."""

    def test_get_top_features_order(self):
        """Top features should be sorted in descending order of mean absolute SHAP value."""
        # 10 samples, 3 features
        shap_values = np.array([
            [0.1, 0.5, 0.2],
            [0.2, 0.4, 0.1],
            [0.1, 0.6, 0.3],
        ])
        feature_names = ["feature_A", "feature_B", "feature_C"]
        df_top = get_top_features(shap_values, feature_names, top_n=3)

        assert len(df_top) == 3
        assert list(df_top["feature"]) == ["feature_B", "feature_C", "feature_A"]
        assert df_top["mean_abs_shap"].iloc[0] > df_top["mean_abs_shap"].iloc[1]

    def test_get_top_features_top_n(self):
        """Test limiting to top_n features."""
        shap_values = np.random.randn(20, 10)
        feature_names = [f"f_{i}" for i in range(10)]
        df_top = get_top_features(shap_values, feature_names, top_n=5)
        assert len(df_top) == 5
