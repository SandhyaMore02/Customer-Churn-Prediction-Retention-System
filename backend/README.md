# ChurnIQ Backend Service & ML Engine

The Python backend service and machine learning pipeline for **ChurnIQ — Customer Churn Intelligence Platform**.

## Architecture

```
backend/
├── src/
│   ├── __init__.py
│   ├── api.py                    # FastAPI REST application
│   ├── data_preprocessing.py     # Ingestion, cleaning, splitting, ColumnTransformer
│   ├── feature_engineering.py    # Custom domain feature transformations
│   ├── train.py                  # Model training, cross-validation & serialization
│   ├── evaluate.py               # Confusion matrix, ROC curve, PR curve evaluations
│   ├── explain.py                # SHAP TreeExplainer feature attribution
│   ├── predict.py                # Real-time inference & rule-based retention playbooks
│   └── paths.py                  # Centralized path resolution
├── tests/
│   ├── test_api.py               # FastAPI endpoint tests
│   ├── test_explain.py           # SHAP explainer tests
│   ├── test_predictions.py       # Inference tests
│   └── test_preprocessing.py     # Preprocessing & cleaning tests
├── requirements.txt              # Backend Python dependencies
├── run_pipeline.py               # End-to-end pipeline execution script
└── README.md
```

## Running the Backend Server

```bash
# In the repository root with virtual environment activated:
uvicorn backend.src.api:app --reload --port 8000
```
- Interactive Swagger Documentation: [http://localhost:8000/docs](http://localhost:8000/docs)
- API Health Status: [http://localhost:8000/api/health](http://localhost:8000/api/health)

## Running the ML Pipeline

```bash
python backend/run_pipeline.py
```

## Running Backend Automated Tests

```bash
pytest backend/tests/ -v
```
