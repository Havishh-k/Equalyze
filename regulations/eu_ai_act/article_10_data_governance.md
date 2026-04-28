# EU AI Act 2024 — Article 10: Data and Data Governance

**Regulation:** EU AI Act (Regulation (EU) 2024/1689)
**Jurisdiction:** EU
**Article:** Article 10
**Domain Tags:** healthcare, fintech, hiring, insurance, all
**Effective Date:** August 2026

## Text

High-risk AI systems which make use of techniques involving the training of AI models with data shall be developed on the basis of training, validation and testing data sets that meet the quality criteria referred to in paragraphs 2 to 5.

Training, validation and testing data sets shall be subject to data governance and management practices appropriate for the intended purpose of the high-risk AI system. Those practices shall concern in particular:

(a) the relevant design choices;
(b) data collection processes and the origin of data, and in the case of personal data, the original purpose of the data collection;
(c) relevant data-preparation processing operations, such as annotation, labelling, cleaning, updating, enrichment and aggregation;
(d) the formulation of relevant assumptions, notably with respect to the information that the data are supposed to measure and represent;
(e) an assessment of the availability, quantity and suitability of the data sets that are needed;
(f) examination in view of possible biases that are likely to affect the health and safety of persons, have a negative impact on fundamental rights or lead to discrimination prohibited under Union law, especially where data outputs influence inputs for future operations;
(g) appropriate measures to detect, prevent and mitigate possible biases identified according to point (f).

## Compliance Requirements

- Training data must be examined for biases affecting fundamental rights
- Specific measures must be taken to detect, prevent and mitigate identified biases
- Data governance practices must be documented and appropriate for the intended purpose
- Bias in training data that leads to discriminatory outcomes constitutes a violation

## Violation Indicators

- Training data with underrepresentation of protected groups (representation bias)
- Proxy variables in feature set that correlate with protected attributes
- Statistical bias amplification between training data and model outputs
- Absence of documented bias detection procedures for training data
