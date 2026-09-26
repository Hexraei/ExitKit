import type { Deduction, Roommate, Settlement, SettlementLine } from './types';

/**
 * Deterministic deposit settlement.
 *
 * Rules (agreed with the roommates up front, shown plainly in the app):
 * - A deduction "charged to" one person comes out of that person's deposit.
 * - A shared deduction is split equally; rounding leftovers go one paise at a
 *   time to roommates in a fixed id order, so the result never depends on
 *   tap order, device, or floating point.
 * - Everything is integer paise. The sum of shares always equals the total.
 */
export function splitEqually(amountPaise: number, ids: string[]): Map<string, number> {
  const shares = new Map<string, number>();
  if (ids.length === 0) return shares;
  const sorted = [...ids].sort();
  const base = Math.floor(amountPaise / sorted.length);
  let remainder = amountPaise - base * sorted.length;
  for (const id of sorted) {
    shares.set(id, base);
  }
  for (const id of sorted) {
    if (remainder <= 0) break;
    shares.set(id, (shares.get(id) ?? 0) + 1);
    remainder--;
  }
  return shares;
}

export function computeSettlement(roommates: Roommate[], deductions: Deduction[]): Settlement {
  const ids = roommates.map((r) => r.id);
  const shareById = new Map<string, number>(ids.map((id) => [id, 0]));

  for (const d of deductions) {
    if (d.chargedTo) {
      if (!shareById.has(d.chargedTo)) {
        throw new Error(`Deduction "${d.label}" charges an unknown roommate ${d.chargedTo}`);
      }
      shareById.set(d.chargedTo, (shareById.get(d.chargedTo) ?? 0) + d.amountPaise);
    } else {
      const split = splitEqually(d.amountPaise, ids);
      for (const [id, part] of split) {
        shareById.set(id, (shareById.get(id) ?? 0) + part);
      }
    }
  }

  const lines: SettlementLine[] = roommates.map((r) => {
    const share = shareById.get(r.id) ?? 0;
    return {
      roommateId: r.id,
      name: r.name,
      depositPaidPaise: r.depositPaidPaise,
      shareOfDeductionsPaise: share,
      netPaise: r.depositPaidPaise - share,
    };
  });

  const totalDepositPaise = lines.reduce((s, l) => s + l.depositPaidPaise, 0);
  const totalDeductionsPaise = lines.reduce((s, l) => s + l.shareOfDeductionsPaise, 0);
  const totalReturnedPaise = lines.reduce((s, l) => s + l.netPaise, 0);

  return { lines, totalDepositPaise, totalDeductionsPaise, totalReturnedPaise };
}
