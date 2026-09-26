import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import type { Handover } from './types';
import { buildPack } from './pack';
import { computeSettlement } from './settlement';
import { formatPaise } from './money';
import { ROOM_TEMPLATES, METER_KINDS } from './templates';

const INK = rgb(0.12, 0.14, 0.13);
const MUTED = rgb(0.4, 0.44, 0.42);
const ACCENT = rgb(0.05, 0.42, 0.35);

async function jpegBytes(dataUrl: string): Promise<Uint8Array | null> {
  try {
    const res = await fetch(dataUrl);
    return new Uint8Array(await res.arrayBuffer());
  } catch {
    return null;
  }
}

/**
 * The paid artifact: a polished, shareable handover pack PDF.
 * Cover -> room-by-room photo evidence + checklist -> meter readings ->
 * agreed deductions -> per-person settlement.
 */
export async function buildPackPdf(h: Handover): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  const addPage = () => {
    const page = doc.addPage([595, 842]); // A4
    return page;
  };
  const text = (page: any, s: string, x: number, y: number, size = 11, f = font, color = INK) => {
    page.drawText(s, { x, y, size, font: f, color });
  };

  // Cover
  const cover = addPage();
  text(cover, 'ExitKit Handover Pack', 50, 770, 26, bold, ACCENT);
  text(cover, h.propertyLabel, 50, 730, 16, bold);
  text(cover, `Move-out date: ${h.moveOutDate}`, 50, 706, 12, font, MUTED);
  text(cover, 'Roommates:', 50, 670, 12, bold);
  h.roommates.forEach((r, i) => {
    text(cover, `${r.name} - deposit paid ${formatPaise(r.depositPaidPaise)}`, 70, 650 - i * 18);
  });
  text(cover, 'Prepared with ExitKit. Photos and notes recorded by the roommates during the', 50, 120, 9, font, MUTED);
  text(cover, 'guided move-out walkthrough. Settlement math is exact to the paise.', 50, 108, 9, font, MUTED);

  // Room sections
  const pack = buildPack(h);
  for (const section of pack) {
    const page = addPage();
    text(page, section.roomName, 50, 790, 20, bold, ACCENT);
    let y = 760;
    if (section.openIssues.length > 0) {
      text(page, 'Open issues:', 50, y, 12, bold);
      y -= 18;
      for (const c of section.openIssues) {
        text(page, `- ${c.item}${c.note ? `: ${c.note}` : ''}`, 60, y);
        y -= 16;
      }
      y -= 8;
    } else {
      text(page, 'Checklist walked: no open issues recorded.', 50, y, 11, font, MUTED);
      y -= 24;
    }
    for (const c of section.checks.filter((c) => c.ok).slice(0, 6)) {
      text(page, `OK - ${c.item}${c.note ? ` (${c.note})` : ''}`, 60, y, 10, font, MUTED);
      y -= 14;
    }
    y -= 10;
    // photos, 2 per row
    let x = 50;
    let count = 0;
    for (const p of section.photos.slice(0, 4)) {
      const bytes = await jpegBytes(p.dataUrl);
      if (!bytes) continue;
      try {
        const img = await doc.embedJpg(bytes);
        const w = 230;
        const hgt = (img.height / img.width) * w;
        if (y - hgt < 60) break;
        page.drawImage(img, { x, y: y - hgt, width: w, height: hgt });
        if (p.note) text(page, p.note.slice(0, 44), x, y - hgt - 12, 8, font, MUTED);
        x += 250;
        count++;
        if (count % 2 === 0) {
          x = 50;
          y -= hgt + 28;
        }
      } catch {
        // skip un-embeddable photo
      }
    }
  }

  // Meters + deductions + settlement
  const fin = addPage();
  let y = 790;
  text(fin, 'Meter readings at handover', 50, y, 16, bold, ACCENT);
  y -= 24;
  for (const m of h.meters) {
    const label = METER_KINDS.find((k) => k.kind === m.kind)?.label ?? m.kind;
    text(fin, `${label}: ${m.value} ${m.unit}  (${new Date(m.takenAt).toLocaleDateString('en-IN')})`, 60, y);
    y -= 16;
  }
  y -= 20;
  text(fin, 'Agreed deductions', 50, y, 16, bold, ACCENT);
  y -= 24;
  if (h.deductions.length === 0) {
    text(fin, 'None - full deposit returned.', 60, y, 11, font, MUTED);
    y -= 16;
  }
  for (const d of h.deductions) {
    const who = d.chargedTo ? (h.roommates.find((r) => r.id === d.chargedTo)?.name ?? '?') : 'shared equally';
    text(fin, `${d.label}: ${formatPaise(d.amountPaise)} (${who})`, 60, y);
    y -= 16;
  }
  y -= 20;
  text(fin, 'Per-person settlement', 50, y, 16, bold, ACCENT);
  y -= 24;
  const s = computeSettlement(h.roommates, h.deductions);
  for (const l of s.lines) {
    text(fin, `${l.name}`, 60, y, 12, bold);
    text(fin, `paid ${formatPaise(l.depositPaidPaise)}  -  share of deductions ${formatPaise(l.shareOfDeductionsPaise)}  =  ${l.netPaise >= 0 ? `${formatPaise(l.netPaise)} back` : `${formatPaise(-l.netPaise)} still owed`}`, 60, y - 15);
    y -= 40;
  }
  y -= 6;
  text(fin, `Totals: deposit ${formatPaise(s.totalDepositPaise)} | deductions ${formatPaise(s.totalDeductionsPaise)} | returned ${formatPaise(s.totalReturnedPaise)}`, 50, y, 10, font, MUTED);

  return doc.save();
}

export const TEMPLATE_NAMES = ROOM_TEMPLATES.map((t) => t.name);
