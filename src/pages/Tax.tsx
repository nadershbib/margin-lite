import { CircleHelp, ExternalLink, ShieldCheck, Wallet } from 'lucide-react';
import type { Workspace } from '../types';
import { money, reserveSuggestion, selfEmploymentTax2026, totals } from '../lib/finance';
import { PageIntro } from '../components/Common';

export function Tax({ data, setRate }: { data: Workspace; setRate: (value: number) => void }) {
  const { revenue, expenses, profit } = totals(data.transactions);
  const tax = selfEmploymentTax2026(profit);
  const reserve = reserveSuggestion(profit, data.reservePercent);
  return <>
    <PageIntro eyebrow="2026 · EDUCATIONAL ESTIMATES" title="Tax planning, without the headache." subtitle="Understand what you've earned and set a practical savings target." />
    <div className="tax-columns">
      <section className="surface tax-main">
        <div className="tax-header"><div className="small-icon"><Wallet size={20}/></div><span className="soft-label">YOUR SAVINGS TARGET</span></div>
        <div className="tax-big">{money(reserve)}</div>
        <p className="tax-lead">Money you could consider setting aside based on recorded 2026 business profit.</p>
        <div className="slider-header"><strong>Save {data.reservePercent}% of profit</strong><span>15% – 40%</span></div>
        <input aria-label="Savings percentage" className="range" type="range" min="15" max="40" step="1" value={data.reservePercent} onChange={e => setRate(Number(e.target.value))}/>
        <div className="range-labels"><span>More cash now</span><span>More savings cushion</span></div>
        <div className="tax-steps">
          <div><span>Total income collected</span><strong>{money(revenue)}</strong></div>
          <div><span>Business expenses</span><strong>− {money(expenses)}</strong></div>
          <div className="profit-step"><span>Recorded net profit</span><strong>{money(profit)}</strong></div>
          <div><span>Chosen savings rate</span><strong>× {data.reservePercent}%</strong></div>
          <div className="result-step"><strong>Suggested savings target</strong><strong>{money(reserve)}</strong></div>
        </div>
        <p className="disclaimer">This percentage is a customizable budgeting guideline, not an IRS tax calculation or amount due. It does not account for your other income, credits, deductions, prior payments, or state taxes.</p>
      </section>
      <section className="side-stack">
        <div className="surface se-card">
          <div className="section-head"><div><h2>Self-employment tax</h2><p>Simple 2026 federal estimate</p></div><span className="outline-circle"><CircleHelp size={18}/></span></div>
          <div className="se-number">{money(tax.total)}</div>
          <p className="muted">Estimated Social Security + Medicare tax from recorded business profit, assuming no W-2 Social Security wages.</p>
          <div className="se-breakdown"><div><span>Net earnings (92.35% of profit)</span><strong>{money(tax.netEarnings)}</strong></div><div><span>Social Security (12.4%, capped)</span><strong>{money(tax.socialSecurity)}</strong></div><div><span>Medicare (2.9%)</span><strong>{money(tax.medicare)}</strong></div></div>
          <p className="disclaimer">Calculation uses the 2026 $184,500 Social Security wage base and the $400 net earnings threshold. It is not a complete income-tax estimate; W-2 wages, additional Medicare tax, special cases, and other taxes are not modeled. All figures reflect recorded 2026 activity, not a full-year projection.</p>
          <a className="text-link" href="https://www.irs.gov/businesses/small-businesses-self-employed/self-employment-tax-social-security-and-medicare-taxes" target="_blank" rel="noopener noreferrer">IRS self-employment tax guidance <ExternalLink size={15}/></a>
        </div>
        <div className="surface explainer-card"><ShieldCheck size={22}/><h3>Know where every number came from.</h3><p>No black-box estimates here. We only count business income received, subtract business expenses paid, and apply clearly displayed formulas.</p></div>
      </section>
    </div>
  </>;
}
