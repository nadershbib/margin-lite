import type { Invoice, Transaction, Workspace } from '../types';
const txn = (id: string, date: string, description: string, kind: Transaction['kind'], amountCents: number, category: string, client?: string, business = true, invoiceId?: string): Transaction =>
  ({ id, date, description, kind, amountCents, category, client, business, invoiceId });

const invoices: Invoice[] = [
  { id: 'invoice-1', number: 'INV-1001', client: 'Cedar Creative', description: 'Brand design package', amountCents: 240000, issuedAt: '2026-08-10', dueAt: '2026-08-30', status: 'paid' },
  { id: 'invoice-2', number: 'INV-1002', client: 'Westbrook Coffee', description: 'Product photo session', amountCents: 185000, issuedAt: '2026-09-05', dueAt: '2026-09-25', status: 'paid' },
  { id: 'invoice-3', number: 'INV-1003', client: 'North Coast Homes', description: 'Website redesign', amountCents: 320000, issuedAt: '2026-10-04', dueAt: '2026-10-28', status: 'paid' },
  { id: 'invoice-4', number: 'INV-1004', client: 'Studio Noa', description: 'Social campaign assets', amountCents: 125000, issuedAt: '2026-10-29', dueAt: '2026-11-17', status: 'sent' },
  { id: 'invoice-5', number: 'INV-1005', client: 'Atlas Wellness', description: 'Landing page design', amountCents: 210000, issuedAt: '2026-10-25', dueAt: '2026-11-08', status: 'sent' },
  { id: 'invoice-6', number: 'INV-1006', client: 'Fable Goods', description: 'Catalog photography', amountCents: 98000, issuedAt: '2026-10-12', dueAt: '2026-10-24', status: 'sent' },
];
const transactions: Transaction[] = [
  txn('tx-1', '2026-06-04', 'June site maintenance', 'income', 132000, 'Client work', 'Maple Studio'),
  txn('tx-2', '2026-06-10', 'Figma Professional', 'expense', 1500, 'Software'),
  txn('tx-3', '2026-06-18', 'Office supplies', 'expense', 8300, 'Office'),
  txn('tx-4', '2026-07-06', 'Website content package', 'income', 220000, 'Client work', 'Harbor Collective'),
  txn('tx-5', '2026-07-17', 'Adobe Creative Cloud', 'expense', 5999, 'Software'),
  txn('tx-6', '2026-07-22', 'Marketing campaign', 'expense', 23000, 'Marketing'),
  txn('tx-7', '2026-08-20', 'INV-1001 · Cedar Creative', 'income', 240000, 'Invoice payment', 'Cedar Creative', true, 'invoice-1'),
  txn('tx-8', '2026-08-04', 'Domain renewal', 'expense', 1800, 'Software'),
  txn('tx-9', '2026-08-15', 'Camera accessories', 'expense', 34200, 'Equipment'),
  txn('tx-10', '2026-09-12', 'INV-1002 · Westbrook Coffee', 'income', 185000, 'Invoice payment', 'Westbrook Coffee', true, 'invoice-2'),
  txn('tx-11', '2026-09-13', 'Adobe Creative Cloud', 'expense', 5999, 'Software'),
  txn('tx-12', '2026-09-21', 'Co-working day pass', 'expense', 3600, 'Office'),
  txn('tx-13', '2026-09-27', 'Editing gig', 'income', 92000, 'Client work', 'Northshore Media'),
  txn('tx-14', '2026-10-19', 'INV-1003 · North Coast Homes', 'income', 320000, 'Invoice payment', 'North Coast Homes', true, 'invoice-3'),
  txn('tx-15', '2026-10-02', 'Figma Professional', 'expense', 1500, 'Software'),
  txn('tx-16', '2026-10-08', 'Travel for client shoot', 'expense', 12800, 'Travel'),
  txn('tx-17', '2026-10-14', 'Coffee shop personal purchase', 'expense', 1750, 'Personal', undefined, false),
  txn('tx-18', '2026-10-28', 'Cloud storage', 'expense', 1200, 'Software'),
  txn('tx-19', '2026-11-01', 'Newsletter layout', 'income', 78000, 'Client work', 'Harbor Collective'),
  txn('tx-20', '2026-11-02', 'Adobe Creative Cloud', 'expense', 5999, 'Software'),
  txn('tx-21', '2026-11-03', 'Business cards', 'expense', 3800, 'Marketing'),
];
export function seedWorkspace(): Workspace {
  return { businessName: 'Jordan Vale Studio', reservePercent: 25,
    invoices: invoices.map(i => ({ ...i })), transactions: transactions.map(t => ({ ...t })) };
}
