import { useEffect, useMemo, useState } from 'react';
import type { Deduction, Handover, MeterReading, Roommate } from './lib/types';
import { emptyHandover, loadHandover, saveHandover, clearHandover } from './lib/store';
import { computeSettlement } from './lib/settlement';
import { toPaise, formatPaise } from './lib/money';
import { ROOM_TEMPLATES, METER_KINDS } from './lib/templates';
import { buildPack, checkCompleteness } from './lib/pack';
import { buildPackPdf } from './lib/pdf';
import { configurePurchases, hasUnlock, buyUnlock, restoreUnlock } from './lib/purchases';
import { Capacitor } from '@capacitor/core';

let n = 0;
const id = (p: string) => `${p}-${Date.now().toString(36)}-${++n}`;

type Step = 'setup' | 'walk' | 'meters' | 'settle' | 'pack';
const STEPS: { id: Step; label: string }[] = [
  { id: 'setup', label: '1 Setup' },
  { id: 'walk', label: '2 Walkthrough' },
  { id: 'meters', label: '3 Meters & bills' },
  { id: 'settle', label: '4 Settlement' },
  { id: 'pack', label: '5 Pack' },
];

export default function App() {
  const [h, setH] = useState<Handover>(emptyHandover);
  const [step, setStep] = useState<Step>('setup');
  const [unlocked, setUnlocked] = useState(false);
  const [busy, setBusy] = useState<string>('');

  useEffect(() => {
    setH(loadHandover());
    configurePurchases().then(() => hasUnlock().then(setUnlocked)).catch(() => {});
  }, []);
  useEffect(() => { saveHandover(h); }, [h]);

  const patch = (p: Partial<Handover>) => setH((prev) => ({ ...prev, ...p }));
  const completeness = useMemo(() => checkCompleteness(h), [h]);
  const settlement = useMemo(
    () => (h.roommates.length ? computeSettlement(h.roommates, h.deductions) : null),
    [h.roommates, h.deductions],
  );

  const addPhoto = (roomId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      setH((prev) => ({
        ...prev,
        photos: [...prev.photos, { id: id('ph'), roomId, dataUrl, note: '', takenAt: new Date().toISOString() }],
      }));
    };
    reader.readAsDataURL(file);
  };

  const downloadPdf = async () => {
    setBusy('Building your PDF...');
    try {
      const bytes = await buildPackPdf(h);
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `exitkit-handover-${h.moveOutDate || 'pack'}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setBusy('');
    }
  };

  const unlock = async () => {
    setBusy('Opening the purchase...');
    try {
      const ok = await buyUnlock();
      setUnlocked(ok);
      if (!ok) setBusy('Purchase did not complete - nothing was charged.');
      else setBusy('');
    } catch (e) {
      setBusy(`Purchase failed: ${e instanceof Error ? e.message : 'unknown error'}`);
    }
  };

  const restore = async () => {
    setBusy('Restoring...');
    try {
      setUnlocked(await restoreUnlock());
      setBusy('');
    } catch {
      setBusy('Restore failed.');
    }
  };

  return (
    <div className="app">
      <header>
        <h1>ExitKit</h1>
        <p className="tag">Move out without the deposit fight.</p>
      </header>
      <nav className="steps">
        {STEPS.map((s) => (
          <button key={s.id} className={step === s.id ? 'on' : ''} onClick={() => setStep(s.id)}>{s.label}</button>
        ))}
      </nav>

      {step === 'setup' && (
        <section className="panel">
          <h2>The flat and the people</h2>
          <label>Property
            <input value={h.propertyLabel} onChange={(e) => patch({ propertyLabel: e.target.value })} placeholder="2BHK, Kotturpuram - flat 3B" />
          </label>
          <label>Move-out date
            <input type="date" value={h.moveOutDate} onChange={(e) => patch({ moveOutDate: e.target.value })} />
          </label>
          <h3>Roommates and who paid what deposit</h3>
          {h.roommates.map((r) => (
            <div className="row" key={r.id}>
              <input value={r.name} placeholder="Name" onChange={(e) => patch({ roommates: h.roommates.map((x) => x.id === r.id ? { ...x, name: e.target.value } : x) })} />
              <input inputMode="decimal" placeholder="Deposit paid (₹)" value={r.depositPaidPaise / 100 || ''} onChange={(e) => patch({ roommates: h.roommates.map((x) => x.id === r.id ? { ...x, depositPaidPaise: toPaise(Number(e.target.value) || 0) } : x) })} />
              <button className="ghost" onClick={() => patch({ roommates: h.roommates.filter((x) => x.id !== r.id) })}>x</button>
            </div>
          ))}
          <button className="ghost" onClick={() => patch({ roommates: [...h.roommates, { id: id('rm'), name: '', depositPaidPaise: 0 } as Roommate] })}>+ Add roommate</button>
          <p className="hint">Everything stays on this phone. No account, no upload.</p>
        </section>
      )}

      {step === 'walk' && (
        <section>
          {ROOM_TEMPLATES.map((t) => {
            const photos = h.photos.filter((p) => p.roomId === t.id);
            return (
              <div className="panel" key={t.id}>
                <h2>{t.name}</h2>
                {t.items.map((item) => {
                  const c = h.checks.find((x) => x.roomId === t.id && x.item === item);
                  return (
                    <div className="checkline" key={item}>
                      <button className={c ? (c.ok ? 'ok' : 'bad') : ''} onClick={() => {
                        const next = c ? (c.ok ? false : true) : true;
                        const others = h.checks.filter((x) => !(x.roomId === t.id && x.item === item));
                        patch({ checks: [...others, { roomId: t.id, item, ok: c ? !c.ok : false, note: c?.note ?? '' }] });
                        void next;
                      }}>
                        {c ? (c.ok ? 'OK' : 'Issue') : '...'}
                      </button>
                      <span>{item}</span>
                      {c && !c.ok && (
                        <input className="note" placeholder="what's wrong?" value={c.note} onChange={(e) => patch({ checks: h.checks.map((x) => x === c ? { ...x, note: e.target.value } : x) })} />
                      )}
                    </div>
                  );
                })}
                <div className="photos">
                  {photos.map((p) => (
                    <div className="thumb" key={p.id}>
                      <img src={p.dataUrl} alt={p.note || t.name} />
                      <input placeholder="caption" value={p.note} onChange={(e) => patch({ photos: h.photos.map((x) => x.id === p.id ? { ...x, note: e.target.value } : x) })} />
                    </div>
                  ))}
                  <label className="addphoto">
                    + photo
                    <input type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; if (f) addPhoto(t.id, f); e.target.value = ''; }} />
                  </label>
                </div>
              </div>
            );
          })}
        </section>
      )}

      {step === 'meters' && (
        <section className="panel">
          <h2>Final meter readings</h2>
          {METER_KINDS.map((mk) => {
            const m = h.meters.find((x) => x.kind === mk.kind);
            return (
              <label key={mk.kind}>{mk.label} ({mk.unit})
                <input inputMode="decimal" value={m?.value ?? ''} placeholder="reading on move-out day" onChange={(e) => {
                  const v = Number(e.target.value);
                  const others = h.meters.filter((x) => x.kind !== mk.kind);
                  if (e.target.value === '' || Number.isNaN(v)) patch({ meters: others });
                  else patch({ meters: [...others, { kind: mk.kind, value: v, unit: mk.unit, takenAt: new Date().toISOString() } as MeterReading] });
                }} />
              </label>
            );
          })}
          <h2>Agreed deductions</h2>
          <p className="hint">Only what everyone agrees on: unpaid bills, damage. Each is shared equally or charged to one person.</p>
          {h.deductions.map((d) => (
            <div className="row" key={d.id}>
              <input value={d.label} placeholder="e.g. Final electricity bill" onChange={(e) => patch({ deductions: h.deductions.map((x) => x.id === d.id ? { ...x, label: e.target.value } : x) })} />
              <input inputMode="decimal" placeholder="₹" value={d.amountPaise / 100 || ''} onChange={(e) => patch({ deductions: h.deductions.map((x) => x.id === d.id ? { ...x, amountPaise: toPaise(Number(e.target.value) || 0) } : x) })} />
              <select value={d.chargedTo ?? ''} onChange={(e) => patch({ deductions: h.deductions.map((x) => x.id === d.id ? { ...x, chargedTo: e.target.value || null } : x) })}>
                <option value="">shared</option>
                {h.roommates.map((r) => <option key={r.id} value={r.id}>{r.name || 'roommate'}</option>)}
              </select>
              <button className="ghost" onClick={() => patch({ deductions: h.deductions.filter((x) => x.id !== d.id) })}>x</button>
            </div>
          ))}
          <button className="ghost" onClick={() => patch({ deductions: [...h.deductions, { id: id('dd'), label: '', amountPaise: 0, chargedTo: null } as Deduction] })}>+ Add deduction</button>
        </section>
      )}

      {step === 'settle' && settlement && (
        <section className="panel">
          <h2>Who gets what back</h2>
          <p className="hint">Exact to the paise. Rounding leftovers are shared in a fixed order, so everyone sees the same numbers on every phone.</p>
          {settlement.lines.map((l) => (
            <div className="settleline" key={l.roommateId}>
              <strong>{l.name || 'Roommate'}</strong>
              <span>paid {formatPaise(l.depositPaidPaise)} - deductions {formatPaise(l.shareOfDeductionsPaise)}</span>
              <b className={l.netPaise >= 0 ? 'pos' : 'neg'}>{l.netPaise >= 0 ? `${formatPaise(l.netPaise)} back` : `owes ${formatPaise(-l.netPaise)}`}</b>
            </div>
          ))}
          <p className="hint">Totals: deposit {formatPaise(settlement.totalDepositPaise)} | deductions {formatPaise(settlement.totalDeductionsPaise)} | returned {formatPaise(settlement.totalReturnedPaise)}</p>
        </section>
      )}

      {step === 'pack' && (
        <section>
          <div className="panel">
            <h2>Handover pack readiness</h2>
            {completeness.complete ? (
              <p className="ok-text">Ready. Everything a landlord asks for is here.</p>
            ) : (
              <ul>{completeness.missing.map((m, i) => <li key={i}>{m}</li>)}</ul>
            )}
          </div>
          <div className="panel">
            <h2>Preview (free)</h2>
            {buildPack(h).map((s) => (
              <div key={s.roomId} className="preview-room">
                <strong>{s.roomName}</strong> - {s.photos.length} photo(s), {s.openIssues.length} open issue(s)
              </div>
            ))}
            <p className="hint">The full pack is a polished PDF: cover, every photo with captions, checklist results, meter readings, agreed deductions, and the per-person settlement.</p>
          </div>
          <div className="panel paywall">
            {unlocked ? (
              <>
                <h2>Unlocked</h2>
                <button onClick={downloadPdf} disabled={!completeness.complete || Boolean(busy)}>{busy || 'Download the full handover pack (PDF)'}</button>
                {!completeness.complete && <p className="hint">Finish the readiness list above first.</p>}
              </>
            ) : (
              <>
                <h2>Unlock the full pack</h2>
                <p>One payment, yours forever. No subscription - a move-out happens once, you pay once.</p>
                {Capacitor.isNativePlatform() ? (
                  <>
                    <button onClick={unlock} disabled={Boolean(busy)}>{busy || 'Unlock the PDF pack'}</button>
                    <button className="ghost" onClick={restore}>Restore a previous purchase</button>
                  </>
                ) : (
                  <p className="hint">Purchases run inside the Android app (RevenueCat). This browser preview shows everything except the actual payment.</p>
                )}
              </>
            )}
          </div>
          <button className="ghost danger" onClick={() => { if (confirm('Delete everything on this device?')) { clearHandover(); setH(emptyHandover()); } }}>Start over (deletes local data)</button>
        </section>
      )}
    </div>
  );
}
