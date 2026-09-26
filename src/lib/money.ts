/** Rupee/paise helpers. All money math happens in integer paise - never floats. */
export const toPaise = (rupees: number): number => Math.round(rupees * 100);

export function formatPaise(paise: number): string {
  const sign = paise < 0 ? '-' : '';
  const abs = Math.abs(paise);
  const r = Math.floor(abs / 100);
  const p = abs % 100;
  return `${sign}₹${r.toLocaleString('en-IN')}${p ? `.${String(p).padStart(2, '0')}` : ''}`;
}
