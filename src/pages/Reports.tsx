import { ArrowDownToLine, BarChart3, FileSpreadsheet, RotateCcw } from 'lucide-react';
import type { Workspace } from '../types';
import { byCategory, downloadText, money, totals, transactionCsv } from '../lib/finance';
import { PageIntro } from '../components/Common';

export function Reports({ data, onReset }: { data: Workspace; onReset: () => void }) {
  const summary = totals(data.transactions);
  const categories = byCategory(data.transactions);
  const max = Math.max(1, ...categories.map(c => c.amountCents));
  function exportJson() { downloadText(JSON.stringify(data, null, 2), 'margin-workspace-backup.json', 'application/json'); }
  function exportCsv() { downloadText(transactionCsv(data.transactions), 'margin-transactions.csv', 'text/csv;charset=utf-8'); }
  return <>
    <PageIntro eyebrow="NUMBERS THAT MAKE SENSE" title="Reports & data" subtitle="See where the money goes, and take your records with you." />
    <div className="reports-grid">
      <section className="surface report-card">
        <div className="section-head"><div><h2>Profit & loss · 2026</h2><p>Cash basis · Recorded business activity</p></div><span className="small-icon"><BarChart3 size={21}/></span></div>
        <div className="pnl"><div><span>Income received</span><strong className="positive">{money(summary.revenue)}</strong></div><div><span>Expenses paid</span><strong>{money(summary.expenses)}</strong></div><div className="pnl-total"><span>Net profit</span><strong>{money(summary.profit)}</strong></div></div>
      </section>
      <section className="surface report-card"><div className="section-head"><div><h2>Where your money goes</h2><p>Business expenses by category</p></div></div>
        {categories.length ? <div className="category-chart">{categories.map((c, idx) => <div className="category-line" key={c.category}><div><strong>{c.category}</strong><span>{money(c.amountCents)}</span></div><div className="bar-track"><span style={{ width: `${(c.amountCents / max) * 100}%`, opacity: Math.max(.45, 1 - idx * .09) }}/></div></div>)}</div> : <p className="muted">No business expenses recorded yet.</p>}
      </section>
    </div>
    <section className="surface export-panel"><div><h2>Your data stays yours.</h2><p>Download your ledger as a spreadsheet or back up the complete workspace. Stored locally in this browser — no account required.</p></div><div className="export-buttons"><button className="secondary-button" onClick={exportCsv}><FileSpreadsheet size={16}/> Export CSV</button><button className="primary-button" onClick={exportJson}><ArrowDownToLine size={16}/> Backup JSON</button></div></section>
    <section className="reset-panel"><div><h3>Start fresh with sample data</h3><p>Restore the original fictional studio records. Your edits will be lost, so download a backup first if needed.</p></div><button className="secondary-button" onClick={onReset}><RotateCcw size={15}/> Reset demo</button></section>
  </>;
}
