"""
paths.py
--------
Centralized repository and artifact path resolution.
Ensures correct paths whether running from repo root or backend/ directory.
"""

from pathlib import Path


def get_repo_root() -> Path:
    p = Path(__file__).resolve()
    for parent in [p.parent, p.parent.parent, p.parent.parent.parent]:
        if (parent / "models").exists() and (parent / "data").exists():
            return parent
    return p.parent.parent


REPO_ROOT = get_repo_root()
MODELS_DIR = REPO_ROOT / "models"
REPORTS_DIR = REPO_ROOT / "reports"
FIGURES_DIR = REPORTS_DIR / "figures"
DATA_DIR = REPO_ROOT / "data"
RAW_DATA_DIR = DATA_DIR / "raw"
PROCESSED_DATA_DIR = DATA_DIR / "processed"
