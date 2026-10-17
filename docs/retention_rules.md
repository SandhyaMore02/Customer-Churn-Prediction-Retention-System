# Retention Rules Documentation

## Overview

This document describes the transparent, rule-based retention suggestions generated
by the Customer Churn Prediction system. These rules are **starting points** for
discussion with business stakeholders — they are not guaranteed interventions.

## Risk Thresholds

| Risk Level | Probability Range | Description |
|---|---|---|
| **High** | ≥ 0.70 | Strong model signal for potential churn |
| **Medium** | 0.40 – 0.69 | Moderate churn risk |
| **Low** | < 0.40 | Low predicted churn probability |

> **Note:** These thresholds were selected based on validation data analysis.
> They should be adjusted based on business requirements, cost of intervention,
> and cost of losing a customer.

## Retention Actions by Risk Level

### High Risk (≥ 0.70)

| Contract Type | Suggested Action |
|---|---|
| Month-to-month | Offer discounted annual contract with loyalty bonus |
| One year | Proactive check-in call; offer service upgrade bundle |
| Two year | Priority support access; satisfaction survey and follow-up |
| Default | Escalate to retention specialist for personalised review |

### Medium Risk (0.40 – 0.69)

| Contract Type | Suggested Action |
|---|---|
| Month-to-month | Send targeted retention email with contract upgrade offer |
| One year | Offer complementary service trial (e.g., security or backup) |
| Two year | Loyalty reward acknowledgement; satisfaction check |
| Default | Include in next retention campaign batch |

### Low Risk (< 0.40)

| Contract Type | Suggested Action |
|---|---|
| Default | Standard engagement — no immediate action required |

## Important Disclaimers

1. **Model predictions are estimates**, not guarantees. A "High risk" customer may
   not actually leave, and a "Low risk" customer might.

2. **SHAP explanations describe model behaviour**, not the causal reasons why a
   customer might churn.

3. **Retention actions are suggestions** based on common business practices.
   Their effectiveness has not been validated through a controlled intervention study.

4. **These rules should be reviewed periodically** and updated based on:
   - Actual retention campaign results
   - Changes in product offerings or pricing
   - Updated model performance on new data

## Rule Change Log

| Date | Change | Rationale |
|---|---|---|
| Initial | Baseline rules defined | Based on common telco retention strategies |
