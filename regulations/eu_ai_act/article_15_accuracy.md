# EU AI Act 2024 — Article 15: Accuracy, Robustness and Cybersecurity

**Regulation:** EU AI Act (Regulation (EU) 2024/1689)
**Jurisdiction:** EU
**Article:** Article 15
**Domain Tags:** healthcare, fintech, hiring, insurance, all
**Effective Date:** August 2026

## Text

High-risk AI systems shall be designed and developed in such a way that they achieve an appropriate level of accuracy, robustness and cybersecurity, and that they perform consistently in those respects throughout their lifecycle.

The levels of accuracy and the relevant accuracy metrics of high-risk AI systems shall be declared in the accompanying instructions of use.

High-risk AI systems shall be as resilient as possible regarding errors, faults or inconsistencies that may occur within the system or the environment in which the system operates, in particular due to their interaction with natural persons or other systems. Technical and organisational measures shall be taken in this regard.

The robustness of high-risk AI systems may be achieved through technical redundancy solutions, which may include backup or fail-safe plans.

High-risk AI systems that continue to learn after being placed on the market or put into service shall be developed in such a way as to eliminate or reduce as far as possible the risk of possibly biased outputs influencing input for future operations ('feedback loops'), and as to ensure that any such feedback loops are duly addressed with appropriate mitigation measures.

## Compliance Requirements

- AI systems must achieve appropriate levels of accuracy across all demographic groups
- Accuracy metrics must be declared and documented
- Feedback loops that amplify bias must be identified and mitigated
- Robustness testing must include fairness stability under distribution shifts

## Violation Indicators

- Significant accuracy disparities between demographic groups
- Equalized Odds Difference exceeding acceptable thresholds
- False Positive Rate disparity between protected groups
- Evidence of feedback loops amplifying initial bias
- Model drift causing increasing discrimination over time
