# WealthMend (Prototype)

A mobile-first wealth and budgeting prototype with connected-account style flows, net-worth goals, and investment trend monitoring.

## What this version includes

- A **monthly plan** screen with grouped categories and line-item progress.
- An **accounts** screen for cash, bank, investment, retirement, and liabilities.
- A **recent activity** feed for transaction-style tracking.
- An **investments** screen with mock connection controls for Fidelity and Unibank.
- Net worth display plus user-added **net worth goals** with progress to each target.
- Investment performance graph with range switching for:
  - per minute
  - per hour
  - per day
  - per 4 hours
  - per 5 days
  - per month
  - per year
  - YTD

> Note: Fidelity/Unibank connection is currently a UI prototype toggle in this static demo. Real account linking requires secure backend integrations and institution APIs.

## Run locally

```bash
python3 -m http.server 4173
```

Then open <http://localhost:4173>.
