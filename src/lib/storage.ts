import type { Workspace } from '../types';
import { seedWorkspace } from './seed';
const KEY = 'margin-lite-workspace-v1';

function looksValid(input: unknown): input is Workspace {
  if (!input || typeof input !== 'object') return false;
  const d = input as Partial<Workspace>;
  return typeof d.businessName === 'string'
    && typeof d.reservePercent === 'number' && d.reservePercent >= 0 && d.reservePercent <= 100
    && Array.isArray(d.transactions) && Array.isArray(d.invoices)
    && d.transactions.every(t => t && typeof t.id === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(t.date) &&
      Number.isSafeInteger(t.amountCents) && t.amountCents > 0 && (t.kind === 'income' || t.kind === 'expense') &&
      typeof t.description === 'string' && typeof t.category === 'string' && typeof t.business === 'boolean')
    && d.invoices.every(i => i && typeof i.id === 'string' && typeof i.client === 'string' &&
      Number.isSafeInteger(i.amountCents) && i.amountCents > 0 && ['draft','sent','paid'].includes(i.status));
}
export function loadWorkspace(): Workspace {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return seedWorkspace();
    const parsed: unknown = JSON.parse(raw);
    return looksValid(parsed) ? parsed : seedWorkspace();
  } catch { return seedWorkspace(); }
}
export function saveWorkspace(data: Workspace) {
  try { localStorage.setItem(KEY, JSON.stringify(data)); }
  catch { /* Storage unavailable. Show in-session data; local persistence may be blocked. */ }
}
export function clearWorkspace() {
  localStorage.removeItem(KEY);
}
