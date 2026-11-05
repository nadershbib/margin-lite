import { useMemo, useState, type FormEvent } from 'react';
import { Download, Pencil, Plus, Search, Trash2, Info } from 'lucide-react';
import type { Transaction, TransactionKind, Workspace } from '../types';
import { downloadText, money, readableDate, toCents, transactionCsv, localToday } from '../lib/finance';
import { Empty, Modal, PageIntro, TransactionIcon } from '../components/Common';

const CATEGORIES = ['Client work', 'Invoice payment', 'Software', 'Equipment', 'Marketing', 'Travel', 'Office', 'Supplies', 'Meals', 'Other', 'Personal'];

type Props = { data: Workspace; save: (record: Transaction) => void; remove: (id: string) => void; openNewSignal: number; newRequested?: boolean };

export function Transactions({ data, save, remove, openNewSignal }: Props) {
  const [edit, setEdit] = useState<Transaction | 'new' | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | TransactionKind>('all');
  // The overview's add button switches tabs; the signal opens the same form.
  const [lastSignal, setLastSignal] = useState(openNewSignal);
  if (openNewSignal !== lastSignal) { setLastSignal(openNewSignal); setEdit('new'); }
  const filtered = useMemo(() => [...data.transactions].filter(t => {
    const matchesText = `${t.description} ${t.category} ${t.client || ''}`.toLowerCase().includes(search.toLowerCase());
    return matchesText && (filter === 'all' || t.kind === filter);
  }).sort((a, b) => b.date.localeCompare(a.date)), [data.transactions, search, filter]);
  const exportCsv = () => downloadText(transactionCsv(filtered), 'margin-transactions.csv', 'text/csv;charset=utf-8');
  return <>
    <PageIntro eyebrow="BOOKKEEPING, SIMPLIFIED" title="Transactions" subtitle="Every dollar in and out, neatly in one place." action={<div className="actions"><button className="secondary-button" onClick={exportCsv}><Download size={16}/> Export CSV</button><button className="primary-button" onClick={() => setEdit('new')}><Plus size={16}/> New transaction</button></div>}/>
    <div className="surface table-panel">
      <div className="table-toolbar"><div className="search-field"><Search size={17}/><input aria-label="Search transactions" placeholder="Search transactions..." value={search} onChange={e => setSearch(e.target.value)} /></div><div className="pills">{(['all', 'income', 'expense'] as const).map(k => <button key={k} className={filter === k ? 'selected' : ''} onClick={() => setFilter(k)}>{k === 'all' ? 'All' : k === 'income' ? 'Income' : 'Expenses'}</button>)}</div></div>
      <div className="table-scroll"><table className="data-table"><thead><tr><th>TRANSACTION</th><th>DATE</th><th>CATEGORY</th><th>TYPE</th><th className="align-right">AMOUNT</th><th className="align-right">ACTIONS</th></tr></thead><tbody>
        {filtered.map(t => <tr key={t.id}><td><div className="table-title"><TransactionIcon kind={t.kind}/><span><strong>{t.description}</strong><small>{t.client || (t.business ? 'Business' : 'Personal')}</small></span></div></td><td>{readableDate(t.date)}</td><td><span className="category-pill">{t.category}</span></td><td><span className={`kind ${t.kind}`}>{t.kind}</span></td><td className={`align-right numeric ${t.kind === 'income' ? 'positive' : ''}`}>{t.kind === 'income' ? '+' : '−'}{money(t.amountCents)}</td><td className="align-right"><div className="table-actions">{t.invoiceId ? <span className="linked" title="Managed through the related invoice"><Info size={17}/> Linked</span> : <><button className="icon-button" aria-label={`Edit ${t.description}`} onClick={() => setEdit(t)}><Pencil size={16}/></button><button className="icon-button danger-hover" aria-label={`Delete ${t.description}`} onClick={() => { if (window.confirm(`Delete “${t.description}”?`)) remove(t.id); }}><Trash2 size={16}/></button></>}</div></td></tr>)}
      </tbody></table></div>{filtered.length === 0 && <Empty title="Nothing to show" detail="Try a different search, or add a transaction."/>}
      <div className="table-foot">Showing {filtered.length} of {data.transactions.length} transactions <span>Changes save automatically on this device.</span></div>
    </div>
    {edit && <TransactionEditor key={edit === 'new' ? `new-${openNewSignal}` : edit.id} initial={edit === 'new' ? undefined : edit} close={() => setEdit(null)} onSave={record => { save(record); setEdit(null); }}/>}  
  </>;
}

export function TransactionEditor({ initial, close, onSave }: { initial?: Transaction; close: () => void; onSave: (record: Transaction) => void }) {
  const [description, setDescription] = useState(initial?.description || '');
  const [amount, setAmount] = useState(initial ? (initial.amountCents / 100).toFixed(2) : '');
  const [date, setDate] = useState(initial?.date || localToday());
  const [kind, setKind] = useState<TransactionKind>(initial?.kind || 'expense');
  const [category, setCategory] = useState(initial?.category || 'Software');
  const [client, setClient] = useState(initial?.client || '');
  const [business, setBusiness] = useState(initial?.business ?? true);
  const [error, setError] = useState('');
  function submit(e: FormEvent) {
    e.preventDefault();
    const cents = toCents(amount);
    if (!description.trim() || !cents || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(`${date}T12:00:00`))) { setError('Enter a description, valid date and positive amount (up to 2 decimals).'); return; }
    onSave({ id: initial?.id || crypto.randomUUID(), description: description.trim(), amountCents: cents, kind, date, category, client: client.trim() || undefined, business, invoiceId: initial?.invoiceId });
  }
  return <Modal title={initial ? 'Edit transaction' : 'New transaction'} description="Keep records tidy — you can edit these later." close={close}>
    <form className="form-grid" onSubmit={submit}>
      <label className="field full">Description<input autoFocus required maxLength={100} value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g. Adobe subscription" /></label>
      <label className="field">Amount (USD)<input required inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" /></label>
      <label className="field">Date<input type="date" required value={date} onChange={e => setDate(e.target.value)} /></label>
      <label className="field">Type<select value={kind} onChange={e => setKind(e.target.value as TransactionKind)}><option value="income">Income received</option><option value="expense">Expense paid</option></select></label>
      <label className="field">Category<select value={category} onChange={e => setCategory(e.target.value)}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></label>
      <label className="field full">Client (optional)<input maxLength={80} value={client} onChange={e => setClient(e.target.value)} placeholder="Client or payer" /></label>
      <label className="check-field"><input type="checkbox" checked={business} onChange={e => setBusiness(e.target.checked)}/><span>Count toward business finances <small>Uncheck for personal transactions.</small></span></label>
      {error && <p className="form-error">{error}</p>}
      <div className="form-footer"><button type="button" className="secondary-button" onClick={close}>Cancel</button><button type="submit" className="primary-button">{initial ? 'Save changes' : 'Add transaction'}</button></div>
    </form>
  </Modal>;
}
