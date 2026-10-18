"""
run_pipeline.py
---------------
End-to-end pipeline execution script.

Runs the complete workflow:
1. Load and validate the dataset
2. Clean and engineer features
3. Split into train/test
4. Cross-validate candidate models
5. Train the best model
6. Evaluate on the test set
7. Generate SHAP explanations
8. Produce customer risk scores and retention suggestions
9. Save all artifacts

Usage:
    python run_pipeline.py
"""

import sys
import os
import warnings

# Force UTF-8 encoding for console output on Windows
if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass
if sys.stderr and hasattr(sys.stderr, "reconfigure"):
    try:
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

import matplotlib
matplotlib.use("Agg")

warnings.filterwarnings("ignore")

from pathlib import Path

def _find_repo_root() -> Path:
    p = Path(__file__).resolve()
    for parent in [p.parent, p.parent.parent]:
        if (parent / "data").exists() and (parent / "models").exists():
            return parent
    return p.parent

PROJECT_ROOT = _find_repo_root()
BACKEND_DIR = Path(__file__).resolve().parent

for p in [str(PROJECT_ROOT), str(BACKEND_DIR)]:
    if p not in sys.path:
        sys.path.insert(0, p)

from src.data_preprocessing import (
    load_raw_data,
    clean_data,
    validate_dataset,
    separate_features_target,
    split_data,
    identify_column_types,
    build_preprocessor,
    TARGET_COL,
)
from src.feature_engineering import engineer_features
from src.train import (
    cross_validate_models,
    train_final_model,
    save_model,
    save_comparison_report,
)
from src.evaluate import (
    compute_metrics,
    print_classification_report,
    plot_confusion_matrix,
    plot_roc_curve,
    plot_precision_recall_curve,
    plot_model_comparison,
    find_optimal_threshold,
    generate_evaluation_summary,
)
from src.explain import (
    get_shap_explainer,
    plot_shap_summary,
    plot_shap_bar,
    explain_individual,
    get_top_features,
)
from src.predict import predict_churn

import numpy as np


def main():
    print("=" * 60)
    print("CUSTOMER CHURN PREDICTION & RETENTION SYSTEM")
    print("=" * 60)

    # ------------------------------------------------------------------
    # Phase 1: Load and Validate
    # ------------------------------------------------------------------
    print("\n" + "=" * 60)
    print("PHASE 1: DATA LOADING & VALIDATION")
    print("=" * 60)

    df_raw = load_raw_data()
    report = validate_dataset(df_raw)
    print(f"\nDataset: {report['n_rows']} rows, {report['n_cols']} columns")
    print(f"Churn rate: {report['churn_rate']:.4f} ({report['churn_rate']*100:.1f}%)")
    print(f"Missing values: {report.get('missing_values', 'None')}")
    print(f"Duplicate rows: {report['duplicate_rows']}")

    # ------------------------------------------------------------------
    # Phase 2: Clean Data
    # ------------------------------------------------------------------
    print("\n" + "=" * 60)
    print("PHASE 2: DATA CLEANING")
    print("=" * 60)

    df = clean_data(df_raw)
    print(f"Cleaned shape: {df.shape}")
    print(f"Target distribution: {df[TARGET_COL].value_counts().to_dict()}")

    # ------------------------------------------------------------------
    # Phase 3: Feature Engineering
    # ------------------------------------------------------------------
    print("\n" + "=" * 60)
    print("PHASE 3: FEATURE ENGINEERING")
    print("=" * 60)

    df = engineer_features(df)

    # ------------------------------------------------------------------
    # Phase 4: Split and Preprocess
    # ------------------------------------------------------------------
    print("\n" + "=" * 60)
    print("PHASE 4: TRAIN/TEST SPLIT & PREPROCESSING")
    print("=" * 60)

    X, y, ids = separate_features_target(df)
    X_train, X_test, y_train, y_test = split_data(X, y)

    numeric_cols, categorical_cols = identify_column_types(X_train)
    preprocessor = build_preprocessor(numeric_cols, categorical_cols)
    print(f"Numeric features ({len(numeric_cols)}): {numeric_cols}")
    print(f"Categorical features ({len(categorical_cols)}): {categorical_cols}")

    # ------------------------------------------------------------------
    # Phase 5: Cross-Validation
    # ------------------------------------------------------------------
    print("\n" + "=" * 60)
    print("PHASE 5: CROSS-VALIDATION MODEL COMPARISON")
    print("=" * 60)

    comparison_df = cross_validate_models(X_train, y_train, preprocessor)
    save_comparison_report(comparison_df)
    plot_model_comparison(comparison_df)

    # Select best model by F1
    best_model_name = comparison_df.loc[comparison_df["f1_mean"].idxmax(), "Model"]
    print(f"\n[OK] Selected model: {best_model_name}")

    # ------------------------------------------------------------------
    # Phase 6: Train Final Model
    # ------------------------------------------------------------------
    print("\n" + "=" * 60)
    print("PHASE 6: TRAINING FINAL MODEL")
    print("=" * 60)

    pipeline = train_final_model(X_train, y_train, preprocessor, model_name=best_model_name)
    save_model(pipeline)

    # Optimal threshold (on training data)
    y_train_prob = pipeline.predict_proba(X_train)[:, 1]
    optimal_threshold, _ = find_optimal_threshold(y_train, y_train_prob, metric="f1")

    # ------------------------------------------------------------------
    # Phase 7: Final Test Evaluation
    # ------------------------------------------------------------------
    print("\n" + "=" * 60)
    print("PHASE 7: FINAL TEST SET EVALUATION")
    print("=" * 60)

    y_test_prob = pipeline.predict_proba(X_test)[:, 1]
    y_test_pred = (y_test_prob >= optimal_threshold).astype(int)

    test_metrics = compute_metrics(y_test, y_test_pred, y_test_prob, threshold=optimal_threshold)
    print("\nFinal Test Metrics:")
    for k, v in test_metrics.items():
        print(f"  {k}: {v:.4f}")

    print_classification_report(y_test, y_test_pred)
    plot_confusion_matrix(y_test, y_test_pred, title=f"Confusion Matrix -- {best_model_name}")
    plot_roc_curve(y_test, y_test_prob, title=f"ROC Curve -- {best_model_name}")
    plot_precision_recall_curve(y_test, y_test_prob, title=f"PR Curve -- {best_model_name}")
    generate_evaluation_summary(test_metrics, model_name=best_model_name)

    # ------------------------------------------------------------------
    # Phase 8: SHAP Explanations
    # ------------------------------------------------------------------
    print("\n" + "=" * 60)
    print("PHASE 8: SHAP EXPLANATIONS")
    print("=" * 60)

    sample_size = min(500, len(X_test))
    X_sample = X_test.iloc[:sample_size]

    try:
        explainer, shap_values, X_transformed_df = get_shap_explainer(pipeline, X_sample)
        plot_shap_summary(shap_values, X_transformed_df)
        plot_shap_bar(shap_values, X_transformed_df)

        top_features = get_top_features(shap_values, X_transformed_df.columns.tolist(), top_n=10)
        print("\nTop 10 Features by SHAP Importance:")
        print(top_features.to_string(index=False))

        # Individual explanations
        y_sample_prob = pipeline.predict_proba(X_sample)[:, 1]
        high_risk_idx = int(np.argmax(y_sample_prob))
        low_risk_idx = int(np.argmin(y_sample_prob))

        expected_value = explainer.expected_value
        if isinstance(expected_value, (list, np.ndarray)):
            expected_value = expected_value[1] if len(expected_value) > 1 else expected_value[0]
        expected_value = float(expected_value)

        explain_individual(high_risk_idx, shap_values, X_transformed_df, expected_value)
        explain_individual(low_risk_idx, shap_values, X_transformed_df, expected_value)
        print("\n[OK] SHAP explanations saved to reports/figures/")
    except Exception as e:
        print(f"\n[WARNING] SHAP explanation failed: {e}")
        print("  Continuing without SHAP plots...")

    # ------------------------------------------------------------------
    # Phase 9: Generate Predictions Report
    # ------------------------------------------------------------------
    print("\n" + "=" * 60)
    print("PHASE 9: GENERATING CUSTOMER PREDICTIONS REPORT")
    print("=" * 60)

    # Use the raw data file for predictions (simulating new data input)
    raw_csv = list((PROJECT_ROOT / "data" / "raw").glob("*.csv"))
    if raw_csv:
        predict_churn(raw_csv[0], threshold=optimal_threshold)
    else:
        print("[WARNING] No raw CSV found for prediction report.")

    # ------------------------------------------------------------------
    # Done
    # ------------------------------------------------------------------
    print("\n" + "=" * 60)
    print("[SUCCESS] PIPELINE COMPLETE")
    print("=" * 60)
    print("\nArtifacts saved:")
    print("  * Model: models/churn_model.joblib")
    print("  * Model comparison: reports/model_comparison.csv")
    print("  * Evaluation summary: reports/evaluation_summary.md")
    print("  * Predictions: reports/customer_churn_predictions.csv")
    print("  * Figures: reports/figures/")
    print("  * Documentation: docs/")


if __name__ == "__main__":
    main()
