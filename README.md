# ExitKit

**Move out without the deposit fight.** ExitKit walks roommates through a move-out handover - room-condition photos, meter readings, agreed deductions - and turns it into one shareable pack with an exact per-person deposit settlement.

Built for **RevenueCat Shipaton 2026, Next Gen (student) category**. Android app (Capacitor + React), one-time in-app purchase via the RevenueCat SDK.

---

## The problem, in plain words

Every roommate group has the same last-week fight: "the wall was already stained", "who has the final electricity bill?", "why am I paying for your broken chair?" The deposit comes back late, short, or with a friendship casualty.

Nobody writes anything down because writing it down is a chore.

## What ExitKit does

1. **Setup** - name the flat, the move-out date, the roommates, and who paid how much deposit.
2. **Guided walkthrough** - four room templates (bedroom, kitchen, bathroom, living room) with checklists. Tap OK or Issue, add photos with captions. Ten minutes, done together.
3. **Meters & bills** - final electricity/water/gas readings and the deductions everyone agrees on, each shared equally or charged to one person.
4. **Settlement** - the exact per-person math, in integer paise. Shared deductions split equally; rounding leftovers are distributed in a fixed order, so every phone shows the same numbers. No float drift, no "your app cheated".
5. **The pack** - a polished PDF: cover, every photo with captions, checklist results, meter readings, deductions, and the settlement table. That PDF is the thing you hand to the landlord.

## The monetization (and why it's this shape)

- **Free:** the whole walkthrough, evidence ledger, settlement math, and a pack preview.
- **Paid once:** unlock the polished, shareable PDF handover pack - a **one-time, non-consumable** purchase through the **RevenueCat SDK** (`exitkit_pack_unlock`, entitlement `handover_pack`), with restore support.

No subscription, on purpose: a move-out is an episodic, high-value moment. The paywall sits exactly where the value is - walking into the deposit discussion with a coherent pack in hand.

## RevenueCat Test Store (how the demo purchase works)

The app ships configured for the **RevenueCat Test Store**, so the purchase flow in the demo is a *genuine SDK purchase and entitlement grant* - not a fake modal - with no real charges:

1. In the RevenueCat dashboard, create a Test Store app.
2. Add a non-consumable product `exitkit_pack_unlock` to the default offering.
3. Create an entitlement `handover_pack` and attach the product.
4. Put the Test Store API key in `src/lib/purchases.ts` (`TEST_STORE_API_KEY`).
5. Run on Android (`npx cap sync`, open in Android Studio). Buy once -> entitlement active -> PDF unlocked. Reinstall -> Restore.

## Running it

```bash
npm install
npm run dev      # browser preview (everything except the actual purchase)
npm test         # settlement + pack tests
npm run build    # production web build
npx cap add android && npx cap sync   # then open android/ in Android Studio
```

## What's inside

```
src/lib/settlement.ts  integer-paise settlement, deterministic rounding, order-independent
src/lib/pack.ts        handover pack structure + readiness checklist
src/lib/pdf.ts         the paid artifact: multi-page PDF pack (pdf-lib, fully on-device)
src/lib/purchases.ts   RevenueCat config, purchase, entitlement gate, restore
src/lib/templates.ts   the 4 fixed room templates + meter kinds (scope kept tight)
src/test/              settlement & pack tests
```

Privacy: everything lives on the device (localStorage). No account, no cloud, no upload.

Deliberately cut to keep the build honest: auth, cloud sync, OCR, AI features, legal advice. ExitKit records what roommates agreed on - it does not arbitrate.

## Built with

React, TypeScript, Vite, Capacitor, RevenueCat Purchases SDK, pdf-lib, Vitest. AI coding assistance (Claude) was used during development. All money math is deterministic integer arithmetic covered by tests.

---

*Built fresh in September 2026 for RevenueCat Shipaton 2026 (Next Gen) by Navin Venkatesan (team: Maverick).*
