# ECOA — 12 CFR § 1002.4: General rules

**Regulation:** Equal Credit Opportunity Act (ECOA) / Regulation B
**Jurisdiction:** USA
**Article:** 12 CFR § 1002.4
**Domain Tags:** fintech, lending, finance
**Effective Date:** Active

## Text

(a) Discrimination. A creditor shall not discriminate against an applicant on a prohibited basis regarding any aspect of a credit transaction.

(b) Discouragement. A creditor shall not make any oral or written statement, in advertising or otherwise, to applicants or prospective applicants that would discourage on a prohibited basis a reasonable person from making or pursuing an application.

"Prohibited basis" means race, color, religion, national origin, sex, marital status, or age (provided that the applicant has the capacity to enter into a binding contract).

## Compliance Requirements

- Algorithmic credit models must not use prohibited bases directly
- Models must not use proxy variables that serve as functional equivalents to prohibited bases
- Credit decisions must not have a disparate impact on protected classes unless justified by legitimate business necessity

## Violation Indicators

- Disparate Impact Ratio < 0.80 on protected classes in loan approval rates
- Higher interest rates or worse terms offered to protected groups with identical credit profiles
- Use of zip code or similar geographic data as a proxy for race
- Counterfactual twin evidence showing different outcomes based only on protected characteristics
