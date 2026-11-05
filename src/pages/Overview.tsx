import { ArrowRight, Banknote, ChartNoAxesCombined, CircleDollarSign, FileClock, Plus, ReceiptText } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { View, Workspace } from '../types';
import { financialSummary, invoiceStatus, localToday, money, monthSeries, readableDate } from '../lib/finance';
import { Empty, MiniTransaction, PageIntro, Stat } from '../components/Common';

export function Overview({ data, onView, onNew, onPaid }: { data: Workspace; onView: (view: View) => void; onNew: () => void; onPaid: (id: string) => void }) {
  const summary = financialSummary(data);
  const recent = [...data.transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  const pending = data.invoices.filter(i => i.status === 'sent').sort((a, b) => a.dueAt.localeCompare(b.dueAt)).slice(0, 3);
  const chart = monthSeries(data.transactions).slice(5, 11);
  const today = localToday();
  return <>
    <PageIntro eyebrow="YOUR WORKSPACE" title="Good to see you, Jordan." subtitle="Here's a clear picture of how business is going." action={<button className="primary-button" onClick={onNew}><Plus size={16} /> Add transaction</button>} />
    <div className="stats-grid">
      <Stat title="Total income" value={money(summary.revenue)} note="2026 · Money received" icon={<Banknote size={18} />} />
      <Stat title="Business expenses" value={money(summary.expenses)} note="2026 · Business purchases" icon={<ReceiptText size={18} />} />
      <Stat title="Net profit" value={money(summary.profit)} note="Income minus expenses" icon={<ChartNoAxesCombined size={18} />} accent />
      <Stat title="Tax savings target" value={money(summary.reserve)} note={`${data.reservePercent}% of positive profit · Not tax due`} icon={<CircleDollarSign size={18} />} />
    </div>
    <div className="dashboard-grid">
      <section className="surface chart-panel">
        <div className="section-head"><div><h2>Money coming in & going out</h2><p>Monthly cash activity · Jun–Nov 2026</p></div><div className="legend"><span><i className="legend-dot revenue"/> Income</span><span><i className="legend-dot expenses"/> Expenses</span></div></div>
        <div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><BarChart data={chart} barGap={5} margin={{ top: 10, right: 3, left: -19, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#eef0eb" strokeDasharray="3 5" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#88928d', fontSize: 12 }} dy={12}/>
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#88928d', fontSize: 12 }} tickFormatter={v => `$${Number(v)/1000}k`} />
          <Tooltip cursor={{ fill: '#f5f7f3' }} formatter={v => money(Number(v) * 100)} contentStyle={{ borderRadius: 12, border: '1px solid #e8ece6', boxShadow: '0 8px 25px #1a2a2215' }} />
          <Bar dataKey="revenue" fill="#245f4b" radius={[5, 5, 0, 0]} maxBarSize={26} name="Income" />
          <Bar dataKey="expenses" fill="#b8cfc2" radius={[5, 5, 0, 0]} maxBarSize={26} name="Expenses" />
        </BarChart></ResponsiveContainer></div>
        <div className="subtle-note">Revenue counts only payments actually recorded. Unpaid invoices are excluded.</div>
      </section>
      <section className="surface tax-widget">
        <div className="small-icon"><CircleDollarSign size={22} /></div>
        <div className="eyebrow">STAY AHEAD</div>
        <h2>Set a little aside for tax season.</h2>
        <p>Based on your recorded profit, a {data.reservePercent}% savings target could help you plan. It's a budgeting rule, not your actual tax bill.</p>
        <div className="reserve-number">{money(summary.reserve)}</div>
        <div className="reserve-track"><span style={{ width: `${data.reservePercent}%` }}/></div>
        <button className="text-link" onClick={() => onView('tax')}>Explore tax planning <ArrowRight size={16} /></button>
        <span className="tax-decoration">M</span>
      </section>
    </div>
    <div className="two-col">
      <section className="surface list-panel">
        <div className="section-head"><div><h2>Recent activity</h2><p>Latest recorded money movement</p></div><button className="text-link" onClick={() => onView('transactions')}>View all <ArrowRight size={16}/></button></div>
        {recent.length ? recent.map(t => <MiniTransaction key={t.id} transaction={t} />) : <Empty title="No activity yet" detail="Add a transaction to get started." />}
      </section>
      <section className="surface list-panel">
        <div className="section-head"><div><h2>Waiting on payment</h2><p>{pending.length} invoices to keep an eye on</p></div><button className="text-link" onClick={() => onView('invoices')}>All invoices <ArrowRight size={16}/></button></div>
        {pending.length ? pending.map(i => <div key={i.id} className="invoice-row"><span className="invoice-icon"><FileClock size={18}/></span><div className="invoice-main"><strong>{i.client}</strong><span>{i.number} · Due {readableDate(i.dueAt)}</span></div><div className="invoice-side"><strong>{money(i.amountCents)}</strong><span className={`status ${invoiceStatus(i, today)}`}>{invoiceStatus(i, today)}</span></div><button className="tiny-pay" title={`Record payment for ${i.number}`} onClick={() => onPaid(i.id)}>Paid?</button></div>) : <Empty title="You're all caught up" detail="No outstanding sent invoices." />}
      </section>
    </div>
  </>;
}
