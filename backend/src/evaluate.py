"""
evaluate.py
-----------
Model evaluation: metrics computation, confusion matrix, ROC curve, and reports.
"""

import pandas as pd
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    roc_curve,
    confusion_matrix,
    classification_report,
    precision_recall_curve,
)


# ---------------------------------------------------------------------------
# Constants
def _find_repo_root() -> Path:
    p = Path(__file__).resolve()
    for parent in p.parents:
        if (parent / "models").exists() and (parent / "data").exists():
            return parent
    return Path(__file__).resolve().parent.parent

REPORTS_DIR = _find_repo_root() / "reports"
FIGURES_DIR = REPORTS_DIR / "figures"


# ---------------------------------------------------------------------------
# Metrics
# ---------------------------------------------------------------------------

def compute_metrics(
    y_true: pd.Series | np.ndarray,
    y_pred: np.ndarray,
    y_prob: np.ndarray | None = None,
    threshold: float = 0.5,
) -> dict:
    """Compute classification metrics.

    Parameters
    ----------
    y_true : array-like — true binary labels
    y_pred : array-like — predicted binary labels
    y_prob : array-like, optional — predicted probabilities for the positive class
    threshold : float — classification threshold (for documentation)

    Returns
    -------
    dict of metric name → value
    """
    metrics = {
        "threshold": threshold,
        "accuracy": accuracy_score(y_true, y_pred),
        "precision": precision_score(y_true, y_pred, zero_division=0),
        "recall": recall_score(y_true, y_pred, zero_division=0),
        "f1": f1_score(y_true, y_pred, zero_division=0),
    }
    if y_prob is not None:
        metrics["roc_auc"] = roc_auc_score(y_true, y_prob)
    return metrics


def print_classification_report(
    y_true: pd.Series | np.ndarray,
    y_pred: np.ndarray,
) -> str:
    """Print and return a sklearn classification report."""
    report = classification_report(y_true, y_pred, target_names=["No Churn", "Churn"])
    print(report)
    return report


# ---------------------------------------------------------------------------
# Plots
# ---------------------------------------------------------------------------

def plot_confusion_matrix(
    y_true: np.ndarray,
    y_pred: np.ndarray,
    title: str = "Confusion Matrix",
    save: bool = True,
) -> plt.Figure:
    """Plot and optionally save a confusion matrix heatmap."""
    cm = confusion_matrix(y_true, y_pred)
    fig, ax = plt.subplots(figsize=(7, 5))
    sns.heatmap(
        cm,
        annot=True,
        fmt="d",
        cmap="Blues",
        xticklabels=["No Churn", "Churn"],
        yticklabels=["No Churn", "Churn"],
        ax=ax,
    )
    ax.set_xlabel("Predicted", fontsize=12)
    ax.set_ylabel("Actual", fontsize=12)
    ax.set_title(title, fontsize=14)
    plt.tight_layout()
    if save:
        FIGURES_DIR.mkdir(parents=True, exist_ok=True)
        fig.savefig(FIGURES_DIR / "confusion_matrix.png", dpi=150)
        print(f"Saved confusion matrix to {FIGURES_DIR / 'confusion_matrix.png'}")
    return fig


def plot_roc_curve(
    y_true: np.ndarray,
    y_prob: np.ndarray,
    title: str = "ROC Curve",
    save: bool = True,
) -> plt.Figure:
    """Plot and optionally save the ROC curve."""
    fpr, tpr, _ = roc_curve(y_true, y_prob)
    auc = roc_auc_score(y_true, y_prob)

    fig, ax = plt.subplots(figsize=(7, 5))
    ax.plot(fpr, tpr, color="#2563eb", lw=2, label=f"ROC Curve (AUC = {auc:.4f})")
    ax.plot([0, 1], [0, 1], color="gray", lw=1, linestyle="--", label="Random")
    ax.set_xlabel("False Positive Rate", fontsize=12)
    ax.set_ylabel("True Positive Rate", fontsize=12)
    ax.set_title(title, fontsize=14)
    ax.legend(loc="lower right")
    ax.grid(True, alpha=0.3)
    plt.tight_layout()
    if save:
        FIGURES_DIR.mkdir(parents=True, exist_ok=True)
        fig.savefig(FIGURES_DIR / "roc_curve.png", dpi=150)
        print(f"Saved ROC curve to {FIGURES_DIR / 'roc_curve.png'}")
    return fig


def plot_precision_recall_curve(
    y_true: np.ndarray,
    y_prob: np.ndarray,
    title: str = "Precision-Recall Curve",
    save: bool = True,
) -> plt.Figure:
    """Plot and optionally save a precision-recall curve."""
    precision_vals, recall_vals, _ = precision_recall_curve(y_true, y_prob)

    fig, ax = plt.subplots(figsize=(7, 5))
    ax.plot(recall_vals, precision_vals, color="#059669", lw=2)
    ax.set_xlabel("Recall", fontsize=12)
    ax.set_ylabel("Precision", fontsize=12)
    ax.set_title(title, fontsize=14)
    ax.grid(True, alpha=0.3)
    plt.tight_layout()
    if save:
        FIGURES_DIR.mkdir(parents=True, exist_ok=True)
        fig.savefig(FIGURES_DIR / "precision_recall_curve.png", dpi=150)
        print(f"Saved PR curve to {FIGURES_DIR / 'precision_recall_curve.png'}")
    return fig


def plot_model_comparison(
    comparison_df: pd.DataFrame,
    save: bool = True,
) -> plt.Figure:
    """Bar chart comparing models on key metrics."""
    metrics_to_plot = ["precision_mean", "recall_mean", "f1_mean", "roc_auc_mean"]
    labels = ["Precision", "Recall", "F1", "ROC-AUC"]
    models = comparison_df["Model"].tolist()

    fig, ax = plt.subplots(figsize=(10, 6))
    x = np.arange(len(metrics_to_plot))
    width = 0.25

    for i, model_name in enumerate(models):
        row = comparison_df[comparison_df["Model"] == model_name].iloc[0]
        vals = [row[m] for m in metrics_to_plot]
        ax.bar(x + i * width, vals, width, label=model_name, alpha=0.85)

    ax.set_xticks(x + width * (len(models) - 1) / 2)
    ax.set_xticklabels(labels, fontsize=11)
    ax.set_ylabel("Score", fontsize=12)
    ax.set_title("Model Comparison (Cross-Validation)", fontsize=14)
    ax.set_ylim(0, 1)
    ax.legend()
    ax.grid(True, axis="y", alpha=0.3)
    plt.tight_layout()
    if save:
        FIGURES_DIR.mkdir(parents=True, exist_ok=True)
        fig.savefig(FIGURES_DIR / "model_comparison.png", dpi=150)
        print(f"Saved model comparison to {FIGURES_DIR / 'model_comparison.png'}")
    return fig


# ---------------------------------------------------------------------------
# Threshold Selection
# ---------------------------------------------------------------------------

def find_optimal_threshold(
    y_true: np.ndarray,
    y_prob: np.ndarray,
    metric: str = "f1",
) -> tuple[float, float]:
    """Find the probability threshold that maximises the given metric.

    Parameters
    ----------
    y_true : array-like
    y_prob : array-like — predicted probabilities
    metric : str — 'f1', 'recall', or 'precision'

    Returns
    -------
    best_threshold, best_score
    """
    thresholds = np.arange(0.1, 0.9, 0.01)
    best_score = 0.0
    best_threshold = 0.5

    for t in thresholds:
        y_pred = (y_prob >= t).astype(int)
        if metric == "f1":
            score = f1_score(y_true, y_pred, zero_division=0)
        elif metric == "recall":
            score = recall_score(y_true, y_pred, zero_division=0)
        elif metric == "precision":
            score = precision_score(y_true, y_pred, zero_division=0)
        else:
            raise ValueError(f"Unknown metric: {metric}")

        if score > best_score:
            best_score = score
            best_threshold = t

    print(f"Optimal threshold for {metric}: {best_threshold:.2f} (score: {best_score:.4f})")
    return best_threshold, best_score


# ---------------------------------------------------------------------------
# Evaluation Summary
# ---------------------------------------------------------------------------

def generate_evaluation_summary(
    metrics: dict,
    model_name: str = "Selected Model",
    save: bool = True,
) -> str:
    """Generate a markdown evaluation summary."""
    lines = [
        "# Model Evaluation Summary",
        "",
        f"## Model: {model_name}",
        "",
        "### Classification Metrics",
        "",
        "| Metric | Value |",
        "|---|---:|",
    ]
    for k, v in metrics.items():
        lines.append(f"| {k.replace('_', ' ').title()} | {v:.4f} |")

    lines.extend([
        "",
        "### Notes",
        "",
        "- Metrics computed on the held-out test set (not used during training or model selection).",
        "- Threshold was selected using cross-validation on the training set.",
        "- SHAP explanations describe model behaviour and do not establish causality.",
        "",
    ])

    summary = "\n".join(lines)

    if save:
        REPORTS_DIR.mkdir(parents=True, exist_ok=True)
        path = REPORTS_DIR / "evaluation_summary.md"
        path.write_text(summary, encoding="utf-8")
        print(f"Saved evaluation summary to {path}")

    return summary
