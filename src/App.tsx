import { useEffect, useState } from 'react';
import { ArrowUpRight, BarChart3, CircleHelp, FileText, LayoutDashboard, PanelLeftClose, ReceiptText, ShieldCheck, Wallet, X } from 'lucide-react';
import type { Invoice, Transaction, View, Workspace } from './types';
import { loadWorkspace, saveWorkspace } from './lib/storage';
import { seedWorkspace } from './lib/seed';
import { localToday } from './lib/finance';
import { upsertTransaction, deleteTransaction, createInvoice as addInvoice, transitionInvoice, deleteInvoice } from './lib/ledger';
import { Overview } from './pages/Overview';
import { Transactions } from './pages/Transactions';
import { Invoices } from './pages/Invoices';
import { Tax } from './pages/Tax';
import { Reports } from './pages/Reports';

const nav: { key: View; label: string; icon: typeof LayoutDashboard }[] = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'transactions', label: 'Transactions', icon: ReceiptText },
  { key: 'invoices', label: 'Invoices', icon: FileText },
  { key: 'tax', label: 'Tax planning', icon: Wallet },
  { key: 'reports', label: 'Reports & data', icon: BarChart3 },
];

export default function App() {
  const [data, setData] = useState<Workspace>(loadWorkspace);
  const [view, setView] = useState<View>('overview');
  const [openNewSignal, setOpenNewSignal] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notice, setNotice] = useState('');
  useEffect(() => { saveWorkspace(data); }, [data]);
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 3000);
    return () => window.clearTimeout(timer);
  }, [notice]);
  function toast(message: string) { setNotice(message); }
  function navigate(page: View) { setView(page); setMobileOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  function addTransaction() { navigate('transactions'); setOpenNewSignal(s => s + 1); }
  function saveTransaction(record: Transaction) {
    setData(p => upsertTransaction(p, record)); toast('Transaction saved');
  }
  function removeTransaction(id: string) {
    setData(p => deleteTransaction(p, id)); toast('Transaction deleted');
  }
  function createInvoice(input: Omit<Invoice, 'id' | 'number'>) {
    const id = crypto.randomUUID();
    setData(p => addInvoice(p, input, id)); toast('Invoice created');
  }
  function changeInvoice(id: string, command: 'send' | 'pay') {
    const transactionId = crypto.randomUUID();
    const paymentDate = localToday();
    setData(p => transitionInvoice(p, id, command, transactionId, paymentDate));
    toast(command === 'send' ? 'Invoice marked as sent' : 'Payment recorded — income updated');
  }
  function removeInvoice(id: string) {
    setData(p => deleteInvoice(p, id)); toast('Invoice removed');
  }
  function setRate(rate: number) { setData(p => ({ ...p, reservePercent: rate })); }
  function reset() {
    if (!window.confirm('Reset all records to the original fictional demo data? This cannot be undone.')) return;
    setData(seedWorkspace()); toast('Demo data restored'); navigate('overview');
  }
  return <div className="app-shell">
    <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="brand"><div className="brand-mark"><span>m</span></div><div className="brand-name">margin<span>.</span><small>Independent finance</small></div><button className="mobile-close" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X size={20}/></button></div>
      <div className="workspace-chip"><div className="workspace-avatar">JV</div><div><strong>{data.businessName}</strong><span>Demo workspace</span></div><span className="workspace-chevron">⌄</span></div>
      <p className="nav-caption">WORKSPACE</p>
      <nav aria-label="Main navigation">{nav.map(({ key, label, icon: Icon }) => <button key={key} className={`nav-link ${view === key ? 'active' : ''}`} onClick={() => navigate(key)}><Icon size={18} strokeWidth={1.9}/><span>{label}</span>{view === key && <span className="active-notch"/>}</button>)}</nav>
      <div className="side-bottom"><div className="side-help"><div className="help-top"><ShieldCheck size={18}/><span>Simple by design</span></div><p>Just the financial essentials for independent work.</p></div><span className="side-version">MARGIN / v1.0 · Local demo</span></div>
    </aside>
    {mobileOpen && <div className="mobile-scrim" onClick={() => setMobileOpen(false)} />}
    <div className="main-side">
      <header className="topbar"><button className="menu-toggle icon-button" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><PanelLeftClose size={20}/></button><div className="breadcrumbs"><span>Workspace</span><span className="crumb-separator">/</span><strong>{nav.find(x => x.key === view)?.label}</strong></div><div className="top-right"><span className="demo-badge"><span className="online-dot" /> DEMO DATA</span><div className="top-divider"/><div className="top-avatar">JV</div></div></header>
      <main className="content">{view === 'overview' && <Overview data={data} onView={navigate} onNew={addTransaction} onPaid={id => { if (window.confirm('Record full payment for this invoice?')) changeInvoice(id, 'pay'); }}/>}<div hidden={view !== 'transactions'}><Transactions data={data} save={saveTransaction} remove={removeTransaction} openNewSignal={openNewSignal}/></div>{view === 'invoices' && <Invoices data={data} create={createInvoice} change={changeInvoice} remove={removeInvoice}/ >}{view === 'tax' && <Tax data={data} setRate={setRate}/ >}{view === 'reports' && <Reports data={data} onReset={reset}/ >}
        <footer className="page-footer"><span>© 2026 MARGIN · A personal project for freelancers</span><span><CircleHelp size={14}/> Local demo · Not tax or accounting advice</span><a href="https://www.irs.gov/businesses/small-businesses-self-employed" target="_blank" rel="noopener noreferrer">Tax resources <ArrowUpRight size={13}/></a></footer>
      </main>
    </div>
    {notice && <div className="toast" role="status"><ShieldCheck size={18}/>{notice}</div>}
  </div>;
}
