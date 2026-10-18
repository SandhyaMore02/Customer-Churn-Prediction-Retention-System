"""
explain.py
----------
SHAP-based model explainability.

Generates global and individual explanations for the selected model.
SHAP describes how the model makes decisions — it does NOT prove causation.
"""

import pandas as pd
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import shap
from pathlib import Path
from sklearn.pipeline import Pipeline


# ---------------------------------------------------------------------------
# Constants
def _find_repo_root() -> Path:
    p = Path(__file__).resolve()
    for parent in p.parents:
        if (parent / "models").exists() and (parent / "data").exists():
            return parent
    return Path(__file__).resolve().parent.parent

FIGURES_DIR = _find_repo_root() / "reports" / "figures"


# ---------------------------------------------------------------------------
# SHAP Explanations
# ---------------------------------------------------------------------------

def get_shap_explainer(pipeline: Pipeline, X_sample: pd.DataFrame):
    """Create a SHAP explainer appropriate for the model type.

    For tree-based models, uses TreeExplainer on the preprocessed data.
    For other models, falls back to a KernelExplainer (slower).

    Returns
    -------
    explainer, shap_values, X_transformed (DataFrame with feature names)
    """
    preprocessor = pipeline.named_steps["preprocessor"]
    classifier = pipeline.named_steps["classifier"]

    # Transform the sample data
    X_transformed = preprocessor.transform(X_sample)
    feature_names = list(preprocessor.get_feature_names_out())
    X_transformed_df = pd.DataFrame(X_transformed, columns=feature_names)

    # Choose explainer based on model type
    model_type = type(classifier).__name__
    if model_type in ("XGBClassifier", "RandomForestClassifier", "GradientBoostingClassifier"):
        explainer = shap.TreeExplainer(classifier)
        shap_values = explainer.shap_values(X_transformed_df)
        # For binary classification, XGBoost TreeExplainer returns a 2D array
        # RandomForest may return a list or a 3D array; take the positive class (class 1)
        if isinstance(shap_values, list):
            shap_values = shap_values[1]
        elif isinstance(shap_values, np.ndarray) and shap_values.ndim == 3 and shap_values.shape[2] == 2:
            shap_values = shap_values[:, :, 1]
    else:
        # Fallback to KernelExplainer with a small background sample
        background = shap.sample(X_transformed_df, min(100, len(X_transformed_df)))
        explainer = shap.KernelExplainer(classifier.predict_proba, background)
        shap_values = explainer.shap_values(X_transformed_df)
        if isinstance(shap_values, list):
            shap_values = shap_values[1]
        elif isinstance(shap_values, np.ndarray) and shap_values.ndim == 3 and shap_values.shape[2] == 2:
            shap_values = shap_values[:, :, 1]

    return explainer, shap_values, X_transformed_df


def plot_shap_summary(
    shap_values: np.ndarray,
    X_transformed_df: pd.DataFrame,
    title: str = "SHAP Feature Importance (Global)",
    max_display: int = 20,
    save: bool = True,
) -> plt.Figure:
    """Generate and save a SHAP summary (beeswarm) plot."""
    fig, ax = plt.subplots(figsize=(10, 8))
    plt.sca(ax)
    shap.summary_plot(
        shap_values,
        X_transformed_df,
        max_display=max_display,
        show=False,
    )
    plt.title(title, fontsize=14, pad=20)
    plt.tight_layout()
    if save:
        FIGURES_DIR.mkdir(parents=True, exist_ok=True)
        fig.savefig(FIGURES_DIR / "shap_summary.png", dpi=150, bbox_inches="tight")
        print(f"Saved SHAP summary plot to {FIGURES_DIR / 'shap_summary.png'}")
    return fig


def plot_shap_bar(
    shap_values: np.ndarray,
    X_transformed_df: pd.DataFrame,
    title: str = "SHAP Mean Absolute Feature Importance",
    max_display: int = 20,
    save: bool = True,
) -> plt.Figure:
    """Generate and save a SHAP bar plot of mean |SHAP values|."""
    fig, ax = plt.subplots(figsize=(10, 8))
    plt.sca(ax)
    shap.summary_plot(
        shap_values,
        X_transformed_df,
        plot_type="bar",
        max_display=max_display,
        show=False,
    )
    plt.title(title, fontsize=14, pad=20)
    plt.tight_layout()
    if save:
        FIGURES_DIR.mkdir(parents=True, exist_ok=True)
        fig.savefig(FIGURES_DIR / "shap_bar.png", dpi=150, bbox_inches="tight")
        print(f"Saved SHAP bar plot to {FIGURES_DIR / 'shap_bar.png'}")
    return fig


def explain_individual(
    idx: int,
    shap_values: np.ndarray,
    X_transformed_df: pd.DataFrame,
    expected_value: float,
    save: bool = True,
) -> plt.Figure:
    """Generate a SHAP waterfall / force plot for a single customer.

    Parameters
    ----------
    idx : int — row index in X_transformed_df
    """
    fig, ax = plt.subplots(figsize=(14, 4))
    plt.sca(ax)

    explanation = shap.Explanation(
        values=shap_values[idx],
        base_values=expected_value,
        data=X_transformed_df.iloc[idx].values,
        feature_names=X_transformed_df.columns.tolist(),
    )
    shap.plots.waterfall(explanation, show=False)
    plt.title(f"SHAP Explanation — Customer Index {idx}", fontsize=13, pad=15)
    plt.tight_layout()
    if save:
        FIGURES_DIR.mkdir(parents=True, exist_ok=True)
        fig.savefig(
            FIGURES_DIR / f"shap_individual_{idx}.png",
            dpi=150,
            bbox_inches="tight",
        )
        print(f"Saved individual SHAP plot for index {idx}")
    return fig


def get_top_features(
    shap_values: np.ndarray,
    feature_names: list[str],
    top_n: int = 10,
) -> pd.DataFrame:
    """Return a DataFrame of the top-N features by mean |SHAP value|."""
    mean_abs = np.abs(shap_values).mean(axis=0)
    importance = pd.DataFrame({
        "feature": feature_names,
        "mean_abs_shap": mean_abs,
    }).sort_values("mean_abs_shap", ascending=False)
    return importance.head(top_n).reset_index(drop=True)
