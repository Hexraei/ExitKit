import { describe, it, expect } from 'vitest';
import { buildPack, checkCompleteness } from '../lib/pack';
import { emptyHandover } from '../lib/store';
import { ROOM_TEMPLATES } from '../lib/templates';
import { toPaise } from '../lib/money';
import type { Handover } from '../lib/types';

const photo = (roomId: string) => ({ id: `p-${roomId}`, roomId, dataUrl: 'data:image/jpeg;base64,xx', note: '', takenAt: '2026-09-27T10:00:00Z' });
const check = (roomId: string, ok = true) => ({ roomId, item: 'Walls', ok, note: '' });

function fullHandover(): Handover {
  const h = emptyHandover();
  h.propertyLabel = '2BHK, Kotturpuram - flat 3B';
  h.moveOutDate = '2026-09-30';
  h.roommates = [
    { id: 'a', name: 'Ash', depositPaidPaise: toPaise(8000) },
    { id: 'b', name: 'Bala', depositPaidPaise: toPaise(8000) },
  ];
  for (const t of ROOM_TEMPLATES) {
    h.photos.push(photo(t.id));
    h.checks.push(check(t.id));
  }
  h.meters.push({ kind: 'electricity', value: 1234.5, unit: 'kWh', takenAt: '2026-09-27T10:00:00Z' });
  return h;
}

describe('buildPack', () => {
  it('groups photos and checks per room template', () => {
    const h = fullHandover();
    h.checks.push({ roomId: 'kitchen', item: 'Sink', ok: false, note: 'tap leaks' });
    const pack = buildPack(h);
    expect(pack).toHaveLength(4);
    const kitchen = pack.find((p) => p.roomId === 'kitchen')!;
    expect(kitchen.photos).toHaveLength(1);
    expect(kitchen.openIssues).toHaveLength(1);
    expect(kitchen.openIssues[0].note).toBe('tap leaks');
  });
});

describe('checkCompleteness', () => {
  it('a full handover is complete', () => {
    expect(checkCompleteness(fullHandover()).complete).toBe(true);
  });
  it('flags every missing piece in plain words', () => {
    const h = emptyHandover();
    const c = checkCompleteness(h);
    expect(c.complete).toBe(false);
    expect(c.missing.join(' ')).toMatch(/property/);
    expect(c.missing.join(' ')).toMatch(/move-out date/);
    expect(c.missing.join(' ')).toMatch(/two roommates/);
    expect(c.missing.filter((m) => m.includes('photo'))).toHaveLength(4);
    expect(c.missing.join(' ')).toMatch(/meter reading/);
  });
  it('flags a roommate with no deposit amount', () => {
    const h = fullHandover();
    h.roommates[1].depositPaidPaise = 0;
    expect(checkCompleteness(h).complete).toBe(false);
  });
});
