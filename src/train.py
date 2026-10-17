"""
train.py
--------
Model training: baseline (Logistic Regression), Random Forest, and XGBoost.

All models are wrapped in scikit-learn Pipelines that include the
ColumnTransformer preprocessor, so the same pipeline handles both
preprocessing and prediction.
"""

import pandas as pd
import numpy as np
import joblib
from pathlib import Path
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import StratifiedKFold, cross_validate
from xgboost import XGBClassifier

from src.data_preprocessing import build_preprocessor, identify_column_types


# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

MODELS_DIR = Path(__file__).resolve().parent.parent / "models"
REPORTS_DIR = Path(__file__).resolve().parent.parent / "reports"
RANDOM_STATE = 42
CV_FOLDS = 5
SCORING = ["precision", "recall", "f1", "roc_auc"]


# ---------------------------------------------------------------------------
# Model Definitions
# ---------------------------------------------------------------------------

def get_model_definitions() -> dict:
    """Return a dict of model_name → estimator instances (with defaults)."""
    return {
        "Logistic Regression": LogisticRegression(
            max_iter=1000,
            class_weight="balanced",
            random_state=RANDOM_STATE,
            solver="lbfgs",
        ),
        "Random Forest": RandomForestClassifier(
            n_estimators=200,
            max_depth=10,
            min_samples_split=5,
            class_weight="balanced",
            random_state=RANDOM_STATE,
            n_jobs=-1,
        ),
        "XGBoost": XGBClassifier(
            n_estimators=200,
            max_depth=5,
            learning_rate=0.1,
            scale_pos_weight=1,  # will be set dynamically
            random_state=RANDOM_STATE,
            eval_metric="logloss",
            n_jobs=-1,
        ),
    }


# ---------------------------------------------------------------------------
# Pipeline Construction
# ---------------------------------------------------------------------------

def build_model_pipeline(
    preprocessor,
    model,
) -> Pipeline:
    """Wrap a preprocessor and model into a single Pipeline."""
    return Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            ("classifier", model),
        ]
    )


# ---------------------------------------------------------------------------
# Cross-Validation
# ---------------------------------------------------------------------------

def cross_validate_models(
    X_train: pd.DataFrame,
    y_train: pd.Series,
    preprocessor=None,
    models: dict | None = None,
    cv_folds: int = CV_FOLDS,
) -> pd.DataFrame:
    """Run stratified cross-validation for each model and return a comparison table.

    Parameters
    ----------
    X_train : pd.DataFrame
    y_train : pd.Series
    preprocessor : ColumnTransformer or None
        If None, builds one from X_train.
    models : dict or None
        model_name → estimator.  If None, uses defaults.
    cv_folds : int

    Returns
    -------
    pd.DataFrame with one row per model and columns for each metric (mean ± std).
    """
    if preprocessor is None:
        num_cols, cat_cols = identify_column_types(X_train)
        preprocessor = build_preprocessor(num_cols, cat_cols)

    if models is None:
        models = get_model_definitions()

    # Set XGBoost scale_pos_weight based on class ratio
    n_neg = (y_train == 0).sum()
    n_pos = (y_train == 1).sum()
    if "XGBoost" in models and n_pos > 0:
        models["XGBoost"].set_params(scale_pos_weight=n_neg / n_pos)

    cv = StratifiedKFold(n_splits=cv_folds, shuffle=True, random_state=RANDOM_STATE)
    results = []

    for name, model in models.items():
        print(f"\nCross-validating {name}...")
        pipeline = build_model_pipeline(preprocessor, model)
        scores = cross_validate(
            pipeline,
            X_train,
            y_train,
            cv=cv,
            scoring=SCORING,
            return_train_score=False,
            n_jobs=-1,
        )
        row = {"Model": name}
        for metric in SCORING:
            key = f"test_{metric}"
            row[f"{metric}_mean"] = scores[key].mean()
            row[f"{metric}_std"] = scores[key].std()
        results.append(row)
        print(
            f"  Precision: {row['precision_mean']:.4f} (+/-{row['precision_std']:.4f}) | "
            f"Recall: {row['recall_mean']:.4f} (+/-{row['recall_std']:.4f}) | "
            f"F1: {row['f1_mean']:.4f} (+/-{row['f1_std']:.4f}) | "
            f"ROC-AUC: {row['roc_auc_mean']:.4f} (+/-{row['roc_auc_std']:.4f})"
        )

    comparison_df = pd.DataFrame(results)
    return comparison_df


# ---------------------------------------------------------------------------
# Training the Selected Model
# ---------------------------------------------------------------------------

def train_final_model(
    X_train: pd.DataFrame,
    y_train: pd.Series,
    preprocessor=None,
    model_name: str = "XGBoost",
    model=None,
) -> Pipeline:
    """Train the selected model on the full training set.

    Returns the fitted Pipeline.
    """
    if preprocessor is None:
        num_cols, cat_cols = identify_column_types(X_train)
        preprocessor = build_preprocessor(num_cols, cat_cols)

    if model is None:
        models = get_model_definitions()
        if model_name not in models:
            raise ValueError(
                f"Unknown model '{model_name}'. Choose from: {list(models.keys())}"
            )
        model = models[model_name]
        # Set XGBoost scale_pos_weight
        if model_name == "XGBoost":
            n_neg = (y_train == 0).sum()
            n_pos = (y_train == 1).sum()
            if n_pos > 0:
                model.set_params(scale_pos_weight=n_neg / n_pos)

    pipeline = build_model_pipeline(preprocessor, model)
    print(f"\nTraining {model_name} on full training set ({len(X_train)} rows)...")
    pipeline.fit(X_train, y_train)
    print("Training complete.")
    return pipeline


# ---------------------------------------------------------------------------
# Save / Load
# ---------------------------------------------------------------------------

def save_model(pipeline: Pipeline, filename: str = "churn_model.joblib") -> Path:
    """Save the fitted pipeline to disk."""
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    path = MODELS_DIR / filename
    joblib.dump(pipeline, path)
    print(f"Model saved to {path}")
    return path


def load_model(filename: str = "churn_model.joblib") -> Pipeline:
    """Load a saved pipeline from disk."""
    path = MODELS_DIR / filename
    if not path.exists():
        raise FileNotFoundError(f"Model file not found: {path}")
    pipeline = joblib.load(path)
    print(f"Model loaded from {path}")
    return pipeline


# ---------------------------------------------------------------------------
# Save comparison report
# ---------------------------------------------------------------------------

def save_comparison_report(comparison_df: pd.DataFrame) -> Path:
    """Save the model comparison table to CSV."""
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    path = REPORTS_DIR / "model_comparison.csv"
    comparison_df.to_csv(path, index=False)
    print(f"Model comparison saved to {path}")
    return path
