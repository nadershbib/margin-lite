import { describe, expect, it } from 'vitest';
import { byCategory, csvEscape, invoiceStatus, invoiceTotals, monthSeries, reserveSuggestion, selfEmploymentTax2026, toCents, totals, transactionCsv } from '../lib/finance';
import { seedWorkspace } from '../lib/seed';
import { upsertTransaction, deleteTransaction, createInvoice, transitionInvoice, deleteInvoice } from '../lib/ledger';

describe('money parsing', () => {
  it('preserves cents precisely', () => { expect(toCents('10.05')).toBe(1005); expect(toCents('0.01')).toBe(1); expect(toCents('10')).toBe(1000); });
  it('rejects invalid and nonpositive amounts', () => { expect(toCents('1.234')).toBeNull(); expect(toCents('-10')).toBeNull(); expect(toCents('0')).toBeNull(); expect(toCents('abc')).toBeNull(); });
});

describe('business accounting', () => {
  const demo = seedWorkspace();
  it('excludes personal spending from profit', () => {
    const results = totals(demo.transactions);
    const sumIncome = demo.transactions.filter(t => t.kind === 'income' && t.business).reduce((s, t) => s + t.amountCents, 0);
    const sumExpense = demo.transactions.filter(t => t.kind === 'expense' && t.business).reduce((s, t) => s + t.amountCents, 0);
    expect(results).toEqual({ revenue: sumIncome, expenses: sumExpense, profit: sumIncome - sumExpense });
    expect(demo.transactions.find(t => t.id === 'tx-17')?.business).toBe(false);
  });
  it('paid invoice has exactly one cash transaction; unpaid invoices do not count as income', () => {
    for (const i of demo.invoices) {
      const linked = demo.transactions.filter(t => t.invoiceId === i.id);
      expect(linked.length).toBe(i.status === 'paid' ? 1 : 0);
      if (linked.length) expect(linked[0].amountCents).toBe(i.amountCents);
    }
  });
  it('calculates outstanding and overdue invoices without drafts', () => {
    const i = invoiceTotals(demo.invoices, '2026-11-04');
    expect(i.outstanding).toBe(125000 + 210000 + 98000);
    expect(i.overdue).toBe(98000);
    expect(invoiceStatus(demo.invoices[3], '2026-11-04')).toBe('sent');
    expect(invoiceStatus(demo.invoices[5], '2026-11-04')).toBe('overdue');
  });
  it('aggregates months and categories from records, not constants', () => {
    const months = monthSeries(demo.transactions);
    expect(months[9].revenue).toBe(3200);
    expect(byCategory(demo.transactions).some(c => c.category === 'Software')).toBe(true);
  });
});

describe('2026 educational tax estimates', () => {
  it('does not apply self-employment tax under $400 adjusted earnings', () => {
    expect(selfEmploymentTax2026(40000).total).toBe(0);
    expect(selfEmploymentTax2026(43314).total).toBeGreaterThan(0);
  });
  it('uses 92.35%, 12.4% SS and 2.9% Medicare above threshold', () => {
    const t = selfEmploymentTax2026(1000000); // $10,000 profit
    expect(t.netEarnings).toBe(923500);
    expect(t.socialSecurity).toBe(114514);
    expect(t.medicare).toBe(26782);
    expect(t.total).toBe(141296);
  });
  it('caps the Social Security portion at 2026 wage base', () => {
    const t = selfEmploymentTax2026(30000000);
    expect(t.socialSecurity).toBe(Math.round(18450000 * .124));
  });
  it('never suggests saving a negative amount', () => {
    expect(reserveSuggestion(-10000, 25)).toBe(0);
    expect(reserveSuggestion(10500, 25)).toBe(2625);
  });
});

describe('CSV data safety', () => {
  it('escapes Excel-formula cells and double quotes', () => {
    expect(csvEscape('=1+1')).toBe('"\'=1+1"');
    expect(csvEscape('A "quoted" label')).toBe('"A ""quoted"" label"');
    expect(transactionCsv([{ id:'x', date:'2026-01-01', description:'=HYPERLINK("bad")', kind:'expense', amountCents:100, category:'Other', business:true }])).toContain("'=HYPERLINK");
  });
});


describe('invoice state transitions', () => {
  it('creates unique invoice numbers and does not count unpaid invoices as revenue', () => {
    const initial = seedWorkspace();
    const next = createInvoice(initial, {client: 'Test Co', description:'Brand work', amountCents:90000, issuedAt:'2026-11-01',dueAt:'2026-11-30',status:'sent'}, 'new-invoice');
    expect(next.invoices[0].number).toBe('INV-1007');
    expect(totals(next.transactions)).toEqual(totals(initial.transactions));
  });
  it('records a full invoice payment exactly once, even if action repeats', () => {
    const initial = seedWorkspace();
    const once = transitionInvoice(initial, 'invoice-4', 'pay', 'payment-1', '2026-11-04');
    const twice = transitionInvoice(once, 'invoice-4', 'pay', 'payment-2', '2026-11-04');
    expect(once.transactions.filter(t => t.invoiceId === 'invoice-4')).toHaveLength(1);
    expect(twice.transactions.filter(t => t.invoiceId === 'invoice-4')).toHaveLength(1);
    expect(totals(once.transactions).revenue - totals(initial.transactions).revenue).toBe(125000);
    expect(deleteTransaction(once, 'payment-1').transactions).toHaveLength(once.transactions.length);
    expect(deleteInvoice(once, 'invoice-4').invoices).toHaveLength(once.invoices.length);
    const modified = { ...once.transactions[0], amountCents: 100 };
    expect(upsertTransaction(once, modified).transactions[0].amountCents).toBe(125000);
  });
  it('allows sending a draft, but not paying it before sending', () => {
    const initial = createInvoice(seedWorkspace(), { client:'Draft Co', description:'Logo', amountCents:70000, issuedAt:'2026-11-01', dueAt:'2026-11-20', status:'draft'}, 'draft-1');
    expect(transitionInvoice(initial,'draft-1','pay','p1','2026-11-04')).toEqual(initial);
    expect(transitionInvoice(initial,'draft-1','send','p1','2026-11-04').invoices[0].status).toBe('sent');
  });
});
