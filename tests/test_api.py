"""
tests/test_api.py
-----------------
Automated tests for FastAPI REST API endpoints.
"""

import pytest
from pathlib import Path
from fastapi.testclient import TestClient

import sys
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.api import app

client = TestClient(app)


class TestApiEndpoints:
    """Test suite for FastAPI endpoints."""

    def test_health_check(self):
        """GET /api/health should return operational status."""
        response = client.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "operational"
        assert "model_loaded" in data

    def test_dashboard_summary(self):
        """GET /api/dashboard should return KPIs and chart metrics."""
        response = client.get("/api/dashboard")
        assert response.status_code == 200
        data = response.json()
        assert "kpis" in data
        assert "total_customers" in data["kpis"]
        assert "churn_distribution" in data
        assert "risk_tier_distribution" in data

    def test_predict_single_customer_high_risk(self):
        """POST /api/predict should predict high churn risk for short tenure and month-to-month."""
        payload = {
            "customerID": "TEST-001",
            "tenure": 1,
            "Contract": "Month-to-month",
            "InternetService": "Fiber optic",
            "PaymentMethod": "Electronic check",
            "MonthlyCharges": 99.5,
            "OnlineSecurity": "No",
            "TechSupport": "No",
        }
        response = client.post("/api/predict", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["customer_id"] == "TEST-001"
        assert 0.0 <= data["churn_probability"] <= 1.0
        assert data["risk_level"] in ["High", "Medium", "Low"]
        assert len(data["suggested_action"]) > 0
        assert isinstance(data["top_risk_factors"], list)

    def test_model_metrics(self):
        """GET /api/model/metrics should return evaluation metrics and comparisons."""
        response = client.get("/api/model/metrics")
        assert response.status_code == 200
        data = response.json()
        assert "metrics" in data
        assert "roc_auc" in data["metrics"]
        assert "confusion_matrix" in data
        assert "model_comparison" in data
