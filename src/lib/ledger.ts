import type { Invoice, Transaction, Workspace } from '../types';

/** Pure updates keep business invariants independent of the UI. */
export function upsertTransaction(state: Workspace, record: Transaction): Workspace {
  if (state.transactions.some(t => t.id === record.id)) {
    // Invoice payments are immutable through the transaction editor.
    return { ...state, transactions: state.transactions.map(t => t.id === record.id && !t.invoiceId ? record : t) };
  }
  return { ...state, transactions: [record, ...state.transactions] };
}

export function deleteTransaction(state: Workspace, id: string): Workspace {
  return { ...state, transactions: state.transactions.filter(t => t.id !== id || !!t.invoiceId) };
}

export function createInvoice(state: Workspace, input: Omit<Invoice, 'id' | 'number'>, id: string): Workspace {
  const maxNumber = state.invoices.reduce((max, i) => Math.max(max, Number(i.number.split('-')[1]) || 1000), 1000);
  return { ...state, invoices: [{ ...input, id, number: `INV-${maxNumber + 1}` }, ...state.invoices] };
}

export function transitionInvoice(state: Workspace, id: string, command: 'send' | 'pay', transactionId: string, paymentDate: string): Workspace {
  const invoice = state.invoices.find(i => i.id === id);
  if (!invoice) return state;
  if (command === 'send') {
    if (invoice.status !== 'draft') return state;
    return { ...state, invoices: state.invoices.map(i => i.id === id ? { ...i, status: 'sent' } : i) };
  }
  if (invoice.status !== 'sent' || state.transactions.some(t => t.invoiceId === id)) return state;
  const payment: Transaction = {
    id: transactionId, date: paymentDate,
    description: `${invoice.number} · ${invoice.client}`, amountCents: invoice.amountCents,
    kind: 'income', category: 'Invoice payment', business: true, client: invoice.client, invoiceId: invoice.id
  };
  return { ...state, invoices: state.invoices.map(i => i.id === id ? { ...i, status: 'paid' } : i), transactions: [payment, ...state.transactions] };
}

export function deleteInvoice(state: Workspace, id: string): Workspace {
  return { ...state, invoices: state.invoices.filter(i => i.id !== id || i.status === 'paid') };
}
