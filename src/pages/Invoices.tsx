import { useState, type FormEvent } from 'react';
import { Check, CirclePlus, Clock3, Send, Trash2 } from 'lucide-react';
import type { Invoice, Workspace } from '../types';
import { invoiceStatus, invoiceTotals, localToday, money, readableDate, toCents } from '../lib/finance';
import { Empty, Modal, PageIntro, Stat } from '../components/Common';

export function Invoices({ data, create, change, remove }: { data: Workspace; create: (invoice: Omit<Invoice, 'id' | 'number'>) => void; change: (id: string, command: 'send' | 'pay') => void; remove: (id: string) => void }) {
  const [newOpen, setNewOpen] = useState(false);
  const t = invoiceTotals(data.invoices);
  const list = [...data.invoices].sort((a, b) => b.issuedAt.localeCompare(a.issuedAt));
  return <>
    <PageIntro eyebrow="GET PAID, STAY ORGANIZED" title="Invoices" subtitle="Follow what you're owed without a spreadsheet." action={<button className="primary-button" onClick={() => setNewOpen(true)}><CirclePlus size={16}/> Create invoice</button>} />
    <div className="stats-grid triple"><Stat title="Outstanding" value={money(t.outstanding)} note="Sent and still unpaid" icon={<Clock3 size={18}/>} /><Stat title="Overdue" value={money(t.overdue)} note="Past due date" icon={<Clock3 size={18}/>} /><Stat title="Paid invoices" value={money(t.paid)} note="Linked to recorded income" icon={<Check size={18}/>} accent /></div>
    <section className="surface table-panel"><div className="section-head padded"><div><h2>All invoices</h2><p>Payments automatically appear in transactions</p></div><span className="record-count">{list.length} total</span></div>
      <div className="table-scroll"><table className="data-table"><thead><tr><th>INVOICE</th><th>CLIENT</th><th>DUE</th><th>STATUS</th><th className="align-right">AMOUNT</th><th className="align-right">ACTION</th></tr></thead><tbody>{list.map(i => <tr key={i.id}><td><strong className="invoice-number">{i.number}</strong><small className="block muted">{i.description}</small></td><td><strong>{i.client}</strong></td><td>{readableDate(i.dueAt)}</td><td><span className={`status ${invoiceStatus(i)}`}>{invoiceStatus(i)}</span></td><td className="align-right numeric">{money(i.amountCents)}</td><td className="align-right"><div className="table-actions">{i.status === 'draft' && <button className="subtle-button" onClick={() => change(i.id, 'send')}><Send size={14}/> Mark sent</button>}{i.status === 'sent' && <button className="subtle-button" onClick={() => { if (window.confirm(`Record full payment of ${money(i.amountCents)} for ${i.number}?`)) change(i.id, 'pay'); }}><Check size={14}/> Record paid</button>}{i.status !== 'paid' && <button className="icon-button danger-hover" title="Delete invoice" aria-label={`Delete ${i.number}`} onClick={() => { if (window.confirm(`Delete invoice ${i.number}?`)) remove(i.id); }}><Trash2 size={16}/></button>}{i.status === 'paid' && <span className="linked"><Check size={16}/> Recorded</span>}</div></td></tr>)}</tbody></table></div>
      {!list.length && <Empty title="No invoices" detail="Create an invoice to start tracking what clients owe." />}
    </section>
    <p className="helper-paragraph">Accounting rule: a draft or unpaid invoice isn't counted as cash income. When you record payment, MARGIN creates one linked income transaction and prevents duplicate recording.</p>
    {newOpen && <InvoiceEditor close={() => setNewOpen(false)} onCreate={i => { create(i); setNewOpen(false); }}/>} 
  </>;
}

function InvoiceEditor({ close, onCreate }: { close: () => void; onCreate: (invoice: Omit<Invoice, 'id' | 'number'>) => void }) {
  const [client, setClient] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [issuedAt, setIssuedAt] = useState(localToday());
  const [dueAt, setDueAt] = useState(localToday());
  const [status, setStatus] = useState<'draft' | 'sent'>('sent');
  const [error, setError] = useState('');
  function submit(e: FormEvent) {
    e.preventDefault(); const cents = toCents(amount);
    if (!client.trim() || !description.trim() || !cents || !issuedAt || !dueAt || dueAt < issuedAt) { setError('Enter all fields, a positive amount, and a due date on or after issue date.'); return; }
    onCreate({ client: client.trim(), description: description.trim(), amountCents: cents, issuedAt, dueAt, status });
  }
  return <Modal title="Create invoice" description="Add a client and the amount they owe." close={close}>
    <form className="form-grid" onSubmit={submit}>
      <label className="field full">Client name<input required autoFocus maxLength={80} placeholder="e.g. North Coast Studio" value={client} onChange={e => setClient(e.target.value)}/></label>
      <label className="field full">Project / service<input required maxLength={120} placeholder="e.g. Website design" value={description} onChange={e => setDescription(e.target.value)}/></label>
      <label className="field full">Amount (USD)<input required inputMode="decimal" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)}/></label>
      <label className="field">Issue date<input required type="date" value={issuedAt} onChange={e => setIssuedAt(e.target.value)}/></label>
      <label className="field">Due date<input required type="date" min={issuedAt} value={dueAt} onChange={e => setDueAt(e.target.value)}/></label>
      <label className="field full">Status<select value={status} onChange={e => setStatus(e.target.value as 'draft'|'sent')}><option value="sent">Sent / awaiting payment</option><option value="draft">Draft (not yet sent)</option></select></label>
      {error && <p className="form-error">{error}</p>}
      <div className="form-footer"><button type="button" className="secondary-button" onClick={close}>Cancel</button><button type="submit" className="primary-button">Create invoice</button></div>
    </form>
  </Modal>;
}
