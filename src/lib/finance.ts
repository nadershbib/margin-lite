import type { Invoice, InvoiceStatus, Transaction, Workspace } from '../types';

export function toCents(value: string): number | null {
  const clean = value.trim();
  if (!/^\d{1,9}(\.\d{1,2})?$/.test(clean)) return null;
  const [whole, fraction = ''] = clean.split('.');
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  return Number.isSafeInteger(cents) && cents > 0 ? cents : null;
}

export function money(cents: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
}

export function shortMoney(cents: number): string {
  if (Math.abs(cents) < 100000) return money(cents);
  return `$${(cents / 100000).toFixed(1)}k`;
}

export function readableDate(date: string): string {
  return new Date(`${date}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function localToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function totals(transactions: Transaction[]) {
  let revenue = 0;
  let expenses = 0;
  for (const t of transactions) {
    if (!t.business) continue;
    if (t.kind === 'income') revenue += t.amountCents;
    else expenses += t.amountCents;
  }
  return { revenue, expenses, profit: revenue - expenses };
}

export function invoiceStatus(invoice: Invoice, today = localToday()): InvoiceStatus | 'overdue' {
  return invoice.status === 'sent' && invoice.dueAt < today ? 'overdue' : invoice.status;
}

export function invoiceTotals(invoices: Invoice[], today = localToday()) {
  return invoices.reduce((out, invoice) => {
    if (invoice.status === 'paid') { out.paid += invoice.amountCents; return out; }
    if (invoice.status === 'sent') {
      out.outstanding += invoice.amountCents;
      if (invoice.dueAt < today) out.overdue += invoice.amountCents;
    }
    return out;
  }, { outstanding: 0, overdue: 0, paid: 0 });
}

export function monthSeries(transactions: Transaction[], year = 2026) {
  return Array.from({ length: 12 }, (_, idx) => {
    const month = `${year}-${String(idx + 1).padStart(2, '0')}`;
    const selected = transactions.filter(t => t.business && t.date.startsWith(month));
    const { revenue, expenses } = totals(selected);
    return {
      name: new Date(year, idx, 1).toLocaleDateString('en-US', { month: 'short' }),
      month, revenue: revenue / 100, expenses: expenses / 100
    };
  });
}

export function byCategory(transactions: Transaction[]) {
  const groups = new Map<string, number>();
  for (const t of transactions) {
    if (t.kind !== 'expense' || !t.business) continue;
    groups.set(t.category, (groups.get(t.category) || 0) + t.amountCents);
  }
  return Array.from(groups, ([category, amountCents]) => ({ category, amountCents }))
    .sort((a, b) => b.amountCents - a.amountCents);
}

/** 2026 IRS simplified regular method. No W-2 wages or special cases are modeled. */
export function selfEmploymentTax2026(netProfitCents: number) {
  const profit = Math.max(0, netProfitCents);
  const netEarnings = Math.round(profit * 0.9235);
  const thresholdCents = 40000;
  const ssWageBaseCents = 18450000;
  const taxable = netEarnings >= thresholdCents;
  const socialSecurity = taxable ? Math.round(Math.min(netEarnings, ssWageBaseCents) * 0.124) : 0;
  const medicare = taxable ? Math.round(netEarnings * 0.029) : 0;
  return {
    netEarnings,
    socialSecurity,
    medicare,
    total: socialSecurity + medicare,
    thresholdReached: taxable,
    ruleYear: 2026,
    wageBaseCents: ssWageBaseCents
  };
}

export function reserveSuggestion(profitCents: number, rate: number) {
  return Math.round(Math.max(0, profitCents) * rate / 100);
}

export function financialSummary(data: Workspace) {
  const accounting = totals(data.transactions);
  return { ...accounting, invoices: invoiceTotals(data.invoices), reserve: reserveSuggestion(accounting.profit, data.reservePercent) };
}

export function csvEscape(value: string | number): string {
  let s = String(value);
  // Escape spreadsheet formulas in cells originating from user input.
  if (/^[\s]*[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replaceAll('"', '""')}"`;
}

export function transactionCsv(transactions: Transaction[]): string {
  const rows = [['Date', 'Description', 'Type', 'Amount USD', 'Category', 'Business', 'Client'],
    ...transactions.map(t => [t.date, t.description, t.kind, (t.amountCents / 100).toFixed(2), t.category, t.business ? 'Yes' : 'No', t.client || ''])];
  return rows.map(r => r.map(csvEscape).join(',')).join('\r\n');
}

export function downloadText(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const href = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = href; link.download = filename;
  document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(href), 1500);
}
