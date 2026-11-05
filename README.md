# MARGIN — Simple freelancer finance tracker

A small, functional React + TypeScript app for a freelancer who just wants to know **what came in, what went out, who still owes them money, and roughly how much to set aside**. Built as an illustrative personal project around a friend's freelance workflow; the data is fictional, not a claim of prior real-world use or deployment.

## Launch locally

Requires Node.js 20.19+ (or Node 22.12+).

```bash
npm install
npm run dev
```

Open **http://localhost:5173**. No API keys, paid services, database configuration, or account required.

Test and production build:

```bash
npm test
npm run build
```

## The genuinely working parts

- **Overview**: Year-to-date cash income, business expenses, profit, savings goal, a chart computed from transaction records, recent transactions, unpaid invoices.
- **Transactions**: Create, edit, search, filter, and delete income/expense records. Mark purchases as personal to exclude them from the business totals. Export as CSV.
- **Invoices**: Create as draft or sent, mark draft as sent, and record full payment. Payment creates **exactly one linked income transaction**. An unpaid invoice does **not** count as cash received. A paid invoice/payment link cannot be edited or deleted independently.
- **Tax planning**: Adjustable 15–40% savings target and an educational simplified **2026 self-employment tax** calculation with explicit assumptions and IRS source.
- **Reports & data**: Cash-basis profit and loss, expense categories, CSV export, JSON backup, and restore fictional demo records.
- **Persistence**: Saves changes in this browser's `localStorage`, across reloads. Starts with internally consistent fictional demo data.
- **Accessibility**: Semantic buttons/tables, keyboard-friendly forms, keyboard-dismissable dialogs, focus indicators, and responsive layout.

## Deliberate scope / limitations

This is a **single-user, local-first prototype**, not a SaaS platform or a tax filing tool. It does **not** have a server, authentication, cloud sync, bank connections, payroll, real payments, invoice PDF generation, partial invoice payments, data encryption at rest, or multi-user access. Clearing browser data deletes changes; export a JSON backup if records matter. JSON backup is an export only, not a restore/import facility.

**Tax scope:** The displayed savings target is a chosen % of positive recorded profit, **not an IRS liability estimate**. The separate self-employment tax calculation illustrates the regular 2026 method: adjusted net earnings (92.35%), Social Security (12.4%, capped at the $184,500 wage base) and Medicare (2.9%), with the $400 net-earnings threshold. The app assumes **no W-2 Social Security wages** and no other self-employment special circumstances, and intentionally does not estimate federal income tax, state taxes, additional Medicare tax, credits, the half-SE-tax deduction, QBI, or filing payments. The transactions are not an annual forecast. This simplified model is not suitable for determining actual tax due.

Reference: [IRS: Self-employment tax](https://www.irs.gov/businesses/small-businesses-self-employed/self-employment-tax-social-security-and-medicare-taxes). Also see [IRS Publication 505](https://www.irs.gov/publications/p505). **Educational only; not accounting, tax, or legal advice.**

## Architecture

- `src/types.ts` — explicit transaction, invoice, and workspace types.
- `src/lib/finance.ts` — money parsing, cash-basis aggregates, invoice balances, 2026 educational SE tax, exports. All calculations are independent of React and tested.
- `src/lib/ledger.ts` — pure invoice/transaction update rules, double-counting prevention.
- `src/lib/seed.ts` — deterministic fictional studio data. Paid invoices correspond to exactly one linked transaction.
- `src/lib/storage.ts` — localStorage persistence and basic structural validation.
- `src/pages/` — each working product page, with UI-specific state and forms.
- `src/components/` — shared modal, KPI, activity views.
- `src/tests/finance.test.ts` — unit tests of financial invariants and tax calculation.

## Short interview explanation

> “I built a compact freelancer bookkeeping tool using React and TypeScript. The main problem was keeping cash income, business expenses, and unpaid invoices organized in one place. My key design decision was to separate financial calculations into pure functions and represent all money as integer cents. I also made invoice payments create one linked income transaction to avoid double-counting. There’s a small educational tax-planning module that applies documented 2026 self-employment tax assumptions and makes the limitations visible. It’s a local-first prototype, not a production tax application.”

## Example walkthrough

1. Open Overview and note total profit.
2. Select **Add transaction**, add a $120 software expense, and save.
3. Return to Overview. Expenses increase and profit/savings target decrease.
4. Open Invoices; create a $900 sent invoice. Outstanding grows, but cash income stays the same.
5. Record payment. Outstanding falls and cash income increases by exactly $900.
6. Open Tax Planning. Change the savings percentage and inspect the calculation steps.
7. Export the CSV from Reports.

## Improvements before real-world use

Move storage to an authenticated backend with a transactional database; implement migrations, audit logs, access control and backups; add reconciliation against actual bank entries, support partial payments and full tax-profile inputs, improve PDF and CSV import support, and obtain domain review before offering tax guidance.
