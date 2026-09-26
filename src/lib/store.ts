import type { Handover } from './types';

const KEY = 'exitkit-handover-v1';

export function emptyHandover(): Handover {
  return {
    propertyLabel: '',
    moveOutDate: '',
    roommates: [],
    photos: [],
    checks: [],
    meters: [],
    deductions: [],
  };
}

/** Local-only persistence. No account, no cloud - the pack lives on this device. */
export function saveHandover(h: Handover): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(h));
  } catch {
    // storage full (large photos) - the app keeps working in-memory
  }
}

export function loadHandover(): Handover {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyHandover();
    const parsed = JSON.parse(raw) as Handover;
    return { ...emptyHandover(), ...parsed };
  } catch {
    return emptyHandover();
  }
}

export function clearHandover(): void {
  localStorage.removeItem(KEY);
}
