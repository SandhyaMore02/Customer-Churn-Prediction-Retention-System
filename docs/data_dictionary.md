# Data Dictionary — IBM Telco Customer Churn Dataset

## Overview

- **Source:** IBM Sample Data / Kaggle (Telco Customer Churn)
- **Records:** ~7,043 customers
- **Target:** `Churn` — whether the customer left within the last month

## Column Descriptions

| Column | Type | Description |
|---|---|---|
| `customerID` | String | Unique customer identifier. **Not a predictive feature.** |
| `gender` | Categorical | Customer gender: Male, Female |
| `SeniorCitizen` | Binary (0/1) | Whether the customer is a senior citizen. Converted to Yes/No during preprocessing. |
| `Partner` | Categorical | Whether the customer has a partner: Yes, No |
| `Dependents` | Categorical | Whether the customer has dependents: Yes, No |
| `tenure` | Numeric (int) | Number of months the customer has stayed with the company |
| `PhoneService` | Categorical | Whether the customer has phone service: Yes, No |
| `MultipleLines` | Categorical | Whether the customer has multiple lines: Yes, No, No phone service |
| `InternetService` | Categorical | Customer's internet service provider: DSL, Fiber optic, No |
| `OnlineSecurity` | Categorical | Whether the customer has online security: Yes, No, No internet service |
| `OnlineBackup` | Categorical | Whether the customer has online backup: Yes, No, No internet service |
| `DeviceProtection` | Categorical | Whether the customer has device protection: Yes, No, No internet service |
| `TechSupport` | Categorical | Whether the customer has tech support: Yes, No, No internet service |
| `StreamingTV` | Categorical | Whether the customer has streaming TV: Yes, No, No internet service |
| `StreamingMovies` | Categorical | Whether the customer has streaming movies: Yes, No, No internet service |
| `Contract` | Categorical | The contract term: Month-to-month, One year, Two year |
| `PaperlessBilling` | Categorical | Whether the customer has paperless billing: Yes, No |
| `PaymentMethod` | Categorical | Payment method: Electronic check, Mailed check, Bank transfer (automatic), Credit card (automatic) |
| `MonthlyCharges` | Numeric (float) | The amount charged to the customer monthly |
| `TotalCharges` | Numeric (float) | The total amount charged to the customer. **Note:** In the raw file this is stored as a string; blank values (new customers with tenure=0) are converted to NaN during cleaning. |
| `Churn` | Binary | **Target variable.** Whether the customer churned: Yes → 1, No → 0 |

## Engineered Features

| Feature | Type | Description | Rationale |
|---|---|---|---|
| `tenure_group` | Categorical | Tenure bucketed into ranges (0-1 Year, 1-2 Years, etc.) | Helps identify churn patterns at different lifecycle stages |
| `total_services` | Numeric (int) | Count of subscribed services (Phone, Security, Backup, etc.) | Customers with more services may be less likely to churn |
| `avg_monthly_charge` | Numeric (float) | TotalCharges / tenure (or MonthlyCharges if tenure=0) | Captures historical pricing context |
| `charge_increase` | Binary (0/1) | 1 if current MonthlyCharges > avg_monthly_charge | May indicate a recent price increase |
| `has_internet` | Binary (0/1) | 1 if InternetService ≠ 'No' | Simplifies internet-related analysis |
| `has_phone_and_internet` | Binary (0/1) | 1 if both PhoneService='Yes' and InternetService≠'No' | Bundle indicator |

## Potential Leakage Concerns

- `customerID`: Identifier only — excluded from features.
- `Churn`: Target variable — never used as an input feature.
- `TotalCharges`: Correlated with tenure but represents historical data available at prediction time — acceptable to use.

## Notes

- Column names and exact values may differ between dataset versions. Always inspect the downloaded file.
- The dataset represents a snapshot; it does not track customer behaviour over time.
