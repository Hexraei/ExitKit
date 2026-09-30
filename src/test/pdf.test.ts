import { describe, it, expect } from 'vitest';
import { buildPackPdf } from '../lib/pdf';
import { emptyHandover } from '../lib/store';
import { toPaise } from '../lib/money';

describe('buildPackPdf', () => {
  it('renders rupee amounts and non-Latin text without throwing', async () => {
    const h = emptyHandover();
    h.propertyLabel = '2BHK, Kotturpuram – flat 3B';
    h.moveOutDate = '2026-09-30';
    h.roommates = [
      { id: 'a', name: 'அருண்', depositPaidPaise: toPaise(8000) },
      { id: 'b', name: 'Bala “B” 🙂', depositPaidPaise: toPaise(8000) },
    ];
    h.deductions = [{ id: 'd', label: 'Final electricity bill', amountPaise: toPaise(1200.5), chargedTo: null }];
    const bytes = await buildPackPdf(h);
    expect(new TextDecoder().decode(bytes.slice(0, 5))).toBe('%PDF-');
  });
});
