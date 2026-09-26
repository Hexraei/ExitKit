import type { Handover, RoomCheck, RoomPhoto } from './types';
import { ROOM_TEMPLATES } from './templates';

export interface PackSection {
  roomId: string;
  roomName: string;
  photos: RoomPhoto[];
  checks: RoomCheck[];
  openIssues: RoomCheck[];
}

/** Assemble the handover pack structure used by both the preview and the PDF. */
export function buildPack(h: Handover): PackSection[] {
  return ROOM_TEMPLATES.map((t) => {
    const checks = h.checks.filter((c) => c.roomId === t.id);
    return {
      roomId: t.id,
      roomName: t.name,
      photos: h.photos.filter((p) => p.roomId === t.id),
      checks,
      openIssues: checks.filter((c) => !c.ok),
    };
  });
}

export interface PackCompleteness {
  complete: boolean;
  missing: string[];
}

/** What a judge/landlord would ask for. The app shows this as a readiness list. */
export function checkCompleteness(h: Handover): PackCompleteness {
  const missing: string[] = [];
  if (!h.propertyLabel.trim()) missing.push('Name the property (e.g. "2BHK, Kotturpuram - flat 3B").');
  if (!h.moveOutDate) missing.push('Set the move-out date.');
  if (h.roommates.length < 2) missing.push('Add at least two roommates with their deposit shares.');
  if (h.roommates.some((r) => r.depositPaidPaise <= 0)) missing.push('Every roommate needs a deposit amount.');
  for (const t of ROOM_TEMPLATES) {
    if (!h.photos.some((p) => p.roomId === t.id)) missing.push(`Add at least one ${t.name} photo.`);
    if (!h.checks.some((c) => c.roomId === t.id)) missing.push(`Walk through the ${t.name} checklist.`);
  }
  if (h.meters.length === 0) missing.push('Record at least one meter reading.');
  return { complete: missing.length === 0, missing };
}
