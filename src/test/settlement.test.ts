import { describe, it, expect } from 'vitest';
import { computeSettlement, splitEqually } from '../lib/settlement';
import { toPaise, formatPaise } from '../lib/money';
import type { Deduction, Roommate } from '../lib/types';

const R = (id: string, name: string, deposit: number): Roommate => ({ id, name, depositPaidPaise: toPaise(deposit) });

describe('splitEqually', () => {
  it('splits evenly when divisible', () => {
    const s = splitEqually(300, ['b', 'a', 'c']);
    expect(s.get('a')).toBe(100);
    expect(Array.from(s.values()).reduce((x, y) => x + y, 0)).toBe(300);
  });
  it('distributes the rounding leftover deterministically in id order', () => {
    const one = splitEqually(100, ['c', 'a', 'b']);
    const two = splitEqually(100, ['b', 'c', 'a']);
    // same result regardless of input order
    expect(Array.from(one.entries())).toEqual(Array.from(two.entries()));
    const total = Array.from(one.values()).reduce((x, y) => x + y, 0);
    expect(total).toBe(100);
    // 100 over 3 ids: sorted ids a,b,c -> a=34, b=33, c=33
    expect(one.get('a')).toBe(34);
    expect(one.get('b')).toBe(33);
    expect(one.get('c')).toBe(33);
  });
  it('handles a single roommate and zero roommates', () => {
    expect(splitEqually(500, ['x']).get('x')).toBe(500);
    expect(splitEqually(500, []).size).toBe(0);
  });
});

describe('computeSettlement', () => {
  it('no deductions: everyone gets their full deposit back', () => {
    const s = computeSettlement([R('a', 'Ash', 10000), R('b', 'Bala', 10000)], []);
    expect(s.totalDeductionsPaise).toBe(0);
    expect(s.lines.find((l) => l.roommateId === 'a')?.netPaise).toBe(toPaise(10000));
    expect(s.totalReturnedPaise).toBe(toPaise(20000));
  });
  it('shared deduction splits equally with exact totals', () => {
    const d: Deduction[] = [{ id: 'd1', label: 'Unpaid electricity', amountPaise: toPaise(901), chargedTo: null }];
    const s = computeSettlement([R('a', 'Ash', 5000), R('b', 'Bala', 5000)], d);
    expect(s.totalDeductionsPaise).toBe(toPaise(901));
    expect(s.totalReturnedPaise).toBe(toPaise(10000) - toPaise(901));
  });
  it('personal deduction hits only that person', () => {
    const d: Deduction[] = [{ id: 'd1', label: 'Broken window in Ash room', amountPaise: toPaise(1500), chargedTo: 'a' }];
    const s = computeSettlement([R('a', 'Ash', 5000), R('b', 'Bala', 5000)], d);
    expect(s.lines.find((l) => l.roommateId === 'a')?.netPaise).toBe(toPaise(3500));
    expect(s.lines.find((l) => l.roommateId === 'b')?.netPaise).toBe(toPaise(5000));
  });
  it('mixed shared + personal deductions stay consistent', () => {
    const d: Deduction[] = [
      { id: 'd1', label: 'Final water bill', amountPaise: toPaise(600), chargedTo: null },
      { id: 'd2', label: 'Wall damage', amountPaise: toPaise(2000), chargedTo: 'b' },
    ];
    const s = computeSettlement([R('a', 'Ash', 8000), R('b', 'Bala', 4000)], d);
    expect(s.totalDeductionsPaise).toBe(toPaise(2600));
    expect(s.totalReturnedPaise).toBe(toPaise(12000) - toPaise(2600));
    expect(s.lines.find((l) => l.roommateId === 'a')?.shareOfDeductionsPaise).toBe(toPaise(300));
    expect(s.lines.find((l) => l.roommateId === 'b')?.shareOfDeductionsPaise).toBe(toPaise(2300));
  });
  it('a net can go negative when deductions exceed a deposit', () => {
    const d: Deduction[] = [{ id: 'd1', label: 'Major damage', amountPaise: toPaise(9000), chargedTo: 'a' }];
    const s = computeSettlement([R('a', 'Ash', 5000)], d);
    expect(s.lines[0].netPaise).toBe(toPaise(-4000));
  });
  it('rejects a deduction charged to an unknown roommate', () => {
    const d: Deduction[] = [{ id: 'd1', label: 'x', amountPaise: 100, chargedTo: 'ghost' }];
    expect(() => computeSettlement([R('a', 'Ash', 1000)], d)).toThrow();
  });
  it('never depends on roommate order', () => {
    const d: Deduction[] = [{ id: 'd1', label: 'bill', amountPaise: toPaise(1000), chargedTo: null }];
    const s1 = computeSettlement([R('a', 'Ash', 5000), R('b', 'Bala', 3000), R('c', 'Chetan', 2000)], d);
    const s2 = computeSettlement([R('c', 'Chetan', 2000), R('b', 'Bala', 3000), R('a', 'Ash', 5000)], d);
    const key = (s: typeof s1) => s.lines.map((l) => `${l.roommateId}:${l.netPaise}`).sort().join(',');
    expect(key(s1)).toBe(key(s2));
  });
});

describe('money formatting', () => {
  it('formats paise as rupees', () => {
    expect(formatPaise(150050)).toBe('₹1,500.50');
    expect(formatPaise(5000)).toBe('₹50');
    expect(formatPaise(-400000)).toBe('-₹4,000');
  });
});
