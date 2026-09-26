export interface Roommate {
  id: string;
  name: string;
  /** What this person actually paid into the deposit, in paise (1/100 rupee). */
  depositPaidPaise: number;
}

export interface RoomPhoto {
  id: string;
  roomId: string;
  /** data-URL (jpeg) kept locally on the device. */
  dataUrl: string;
  note: string;
  takenAt: string; // ISO
}

export interface RoomCheck {
  roomId: string;
  item: string;
  ok: boolean;
  note: string;
}

export interface MeterReading {
  kind: 'electricity' | 'water' | 'gas';
  value: number;
  unit: string;
  takenAt: string;
  photoId?: string;
}

/** A deduction the roommates AGREED on: unpaid utility, damage, etc. */
export interface Deduction {
  id: string;
  label: string;
  amountPaise: number;
  /** Who caused/owns it. null = shared equally. */
  chargedTo: string | null;
}

export interface Handover {
  propertyLabel: string;
  moveOutDate: string;
  roommates: Roommate[];
  photos: RoomPhoto[];
  checks: RoomCheck[];
  meters: MeterReading[];
  deductions: Deduction[];
}

export interface SettlementLine {
  roommateId: string;
  name: string;
  depositPaidPaise: number;
  /** This person's share of all deductions. */
  shareOfDeductionsPaise: number;
  /** depositPaid - shareOfDeductions. Positive = money back to them; negative = they still owe. */
  netPaise: number;
}

export interface Settlement {
  lines: SettlementLine[];
  totalDepositPaise: number;
  totalDeductionsPaise: number;
  totalReturnedPaise: number;
}
