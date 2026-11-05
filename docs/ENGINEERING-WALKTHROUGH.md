# MARGIN — engineering walkthrough

## 60-second demo pitch

“I wanted a simple bookkeeping helper for a freelancer, rather than a complicated accounting platform. MARGIN tracks money received, expenses paid, and invoices awaiting payment. It's built in React and TypeScript with a local-first data store so someone can try it immediately. The calculations aren't mixed into the UI: pure TypeScript functions handle cash-basis totals, invoice balances, categorized expenses, and a simplified, explicitly labeled 2026 self-employment tax example. I represent amounts in integer cents to avoid rounding issues. When an invoice is paid, it creates one immutable linked income record; repeating that action can't double-count cash. I included unit tests for those rules and CSV export, and made the design usable on mobile. For production, I'd add an authenticated server, real database, audit trail, and financial review.”

## Three engineering decisions worth discussing

1. **Cents, not floats.** Transaction amounts are integer cents, validated at input. Formatting happens only in the view. Reporting sums the integer amounts.
2. **Cash basis with linked payments.** A sent invoice increases the *outstanding* figure, not income. Only the explicit payment transition creates an income transaction. The transition checks invoice status and the presence of an existing linked payment.
3. **Transparent rules.** 2026 self-employment tax is in `src/lib/finance.ts`, separate from React; the UI shows each component of the calculation and states which cases it does not support.

## Demonstration sequence

- Open Overview and point to the live profit and expense chart.
- Add an expense in Transactions, then return to Overview and show the totals change.
- Create a sent invoice, explain why the income total does not rise.
- Click **Record paid**, show that invoice is paid and exactly one income record appears.
- Change the Tax Planning savings slider and show where the number comes from.
- Export transactions to CSV.

## Truthful boundary

This is a functional local-first demo using synthetic customer and transaction records, not a certified tax program or a real client deployment. It does not prove VITA volunteering or professional tax preparation experience. A real implementation needs a backend database with transactions, authentication, access controls, reconciliation, backup/restore, and a tax specialist's review.
