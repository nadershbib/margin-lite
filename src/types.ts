export type TransactionKind = 'income' | 'expense';
export interface Transaction {
  id: string;
  date: string; // local ISO calendar date, YYYY-MM-DD
  description: string;
  amountCents: number; // nonnegative integer
  kind: TransactionKind;
  category: string;
  business: boolean;
  client?: string;
  invoiceId?: string;
}
export type InvoiceStatus = 'draft' | 'sent' | 'paid';
export interface Invoice {
  id: string;
  number: string;
  client: string;
  description: string;
  amountCents: number;
  issuedAt: string;
  dueAt: string;
  status: InvoiceStatus;
}
export interface Workspace {
  businessName: string;
  reservePercent: number;
  transactions: Transaction[];
  invoices: Invoice[];
}
export type View = 'overview' | 'transactions' | 'invoices' | 'tax' | 'reports';
