import { useEffect, type ReactNode } from 'react';
import { X, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { Transaction } from '../types';
import { money, readableDate } from '../lib/finance';

export function Modal({ title, description, close, children }: { title: string; description?: string; close: () => void; children: ReactNode }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') close(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [close]);
  return <div className="modal-overlay" onMouseDown={e => { if (e.target === e.currentTarget) close(); }} role="presentation">
    <section className="modal" role="dialog" aria-modal="true" aria-label={title}>
      <div className="modal-head"><div><h2>{title}</h2>{description && <p className="muted">{description}</p>}</div><button aria-label="Close" className="icon-button" onClick={close}><X size={19} /></button></div>
      {children}
    </section>
  </div>;
}

export function PageIntro({ eyebrow, title, subtitle, action }: { eyebrow?: string; title: string; subtitle: string; action?: ReactNode }) {
  return <div className="page-intro"><div>{eyebrow && <div className="eyebrow">{eyebrow}</div>}<h1>{title}</h1><p>{subtitle}</p></div>{action && <div className="intro-action">{action}</div>}</div>;
}

export function Stat({ title, value, note, icon, accent = false }: { title: string; value: string; note: string; icon: ReactNode; accent?: boolean }) {
  return <div className={`stat-card ${accent ? 'accent-stat' : ''}`}><div className="stat-top"><span>{title}</span><span className="stat-icon">{icon}</span></div><div className="stat-value">{value}</div><p className="stat-note">{note}</p></div>;
}

export function TransactionIcon({ kind }: { kind: Transaction['kind'] }) {
  return <span className={`tx-icon ${kind}`}>
    {kind === 'income' ? <ArrowDownRight size={18} /> : <ArrowUpRight size={18} />}
  </span>;
}

export function MiniTransaction({ transaction }: { transaction: Transaction }) {
  return <div className="activity-row"><TransactionIcon kind={transaction.kind} />
    <div className="activity-info"><strong>{transaction.description}</strong><span>{transaction.category} · {readableDate(transaction.date)}</span></div>
    <strong className={transaction.kind === 'income' ? 'positive' : 'amount-dark'}>{transaction.kind === 'income' ? '+' : '−'}{money(transaction.amountCents)}</strong>
  </div>;
}

export function Empty({ title, detail }: { title: string; detail: string }) {
  return <div className="empty-state"><strong>{title}</strong><p>{detail}</p></div>;
}
