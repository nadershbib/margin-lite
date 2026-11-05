# MARGIN Lite

A simple finance tracker for freelancers and independent contractors. MARGIN keeps income, expenses, and invoices in one place, with a dashboard that makes it easier to see how the business is doing.

**[Live demo](https://margin-lite.netlify.app/)**

## Features

- **Dashboard:** Income, expenses, net profit, recent activity, and monthly trends.
- **Transactions:** Add, edit, delete, search, and filter income and expenses. Export records to CSV.
- **Invoices:** Create invoices, track outstanding balances, and record payments.
- **Tax planning:** Set a savings percentage and explore a simplified 2026 self-employment tax calculation.
- **Reports:** Review cash-basis profit and loss, spending by category, and export financial records.

Changes are saved in the browser using `localStorage`. The app opens with sample data so you can try each feature immediately.

## Tech stack

React, TypeScript, Vite, Recharts, Lucide React, and Vitest. Hosted on Netlify.

## Run locally

Requires Node.js 20.19+ or 22.12+.

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

To run tests or create a production build:

```bash
npm test
npm run build
```

## How it works

Financial calculations live in `src/lib/finance.ts`, separate from the React components. Amounts are stored in integer cents to avoid floating-point rounding issues.

Reports use a cash-basis approach: an unpaid invoice is not counted as income. Recording an invoice payment creates a linked income transaction, preventing the payment from being counted twice.

The initial workspace contains sample clients, transactions, and invoices. You can reset it from **Reports & data**.

## Notes

This is a browser-based, single-user project. It does not connect to bank accounts, process payments, sync across devices, or submit tax forms. Data is stored locally in each browser and can be lost if browser storage is cleared.

Tax planning is educational and intentionally simplified. The savings percentage is a personal planning target, not a calculated tax obligation. See the [IRS self-employment tax guidance](https://www.irs.gov/businesses/small-businesses-self-employed/self-employment-tax-social-security-and-medicare-taxes) for official information.
