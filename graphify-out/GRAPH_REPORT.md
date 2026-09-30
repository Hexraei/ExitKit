# Graph Report - ExitKit  (2026-09-30)

## Corpus Check
- Corpus is ~17,264 words - fits in a single context window. You may not need a graph.

## Summary
- 174 nodes · 282 edges · 20 communities (13 shown, 7 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 12 edges (avg confidence: 0.82)
- Token cost: 136,260 input · 0 output

## Community Hubs (Navigation)
- App Shell & Purchases
- Capacitor & NPM Config
- Product Concepts (README)
- Walkthrough & Pack Readiness
- TypeScript Config
- Settlement Money Math
- Android Example Tests
- PDF Pack Generation
- Runtime Dependencies
- Dev Dependencies
- Setup Screen UI
- Gradle Wrapper Script
- App Icon Design
- Android MainActivity

## God Nodes (most connected - your core abstractions)
1. `App()` - 16 edges
2. `compilerOptions` - 13 edges
3. `toPaise()` - 7 edges
4. `buildPackPdf()` - 7 edges
5. `computeSettlement()` - 7 edges
6. `scripts` - 6 edges
7. `formatPaise()` - 6 edges
8. `buildPack()` - 6 edges
9. `emptyHandover()` - 6 edges
10. `Handover` - 6 edges

## Surprising Connections (you probably didn't know these)
- `TEST_STORE_API_KEY` --references--> `RevenueCat Test Store`  [EXTRACTED]
  src/lib/purchases.ts → README.md
- `index.html App Shell` --conceptually_related_to--> `ExitKit`  [INFERRED]
  index.html → README.md
- `App()` --calls--> `formatPaise()`  [EXTRACTED]
  src/App.tsx → src/lib/money.ts
- `App()` --calls--> `toPaise()`  [EXTRACTED]
  src/App.tsx → src/lib/money.ts
- `App()` --calls--> `buildPack()`  [EXTRACTED]
  src/App.tsx → src/lib/pack.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **ExitKit Five-Step Move-Out Flow** — readme_setup_step, readme_guided_walkthrough, readme_meters_and_bills, readme_settlement, readme_handover_pack [EXTRACTED 1.00]
- **RevenueCat PDF Unlock Gate** — src_lib_purchases, readme_revenuecat_test_store, readme_exitkit_pack_unlock, readme_handover_pack_entitlement, readme_restore_purchases, readme_handover_pack [EXTRACTED 1.00]
- **Setup step input flow** — screenshots_setup_screen_1179x2556_step_nav, screenshots_setup_screen_1179x2556_flat_people_form, screenshots_setup_screen_1179x2556_roommates_deposits, screenshots_setup_screen_1179x2556_deposit_settlement [INFERRED 0.75]

## Communities (20 total, 7 thin omitted)

### Community 0 - "App Shell & Purchases"
Cohesion: 0.16
Nodes (19): Restore Purchases, @capacitor/core, react, @revenuecat/purchases-capacitor, App(), Step, STEPS, buyUnlock() (+11 more)

### Community 1 - "Capacitor & NPM Config"
Cohesion: 0.09
Nodes (20): config, name, private, scripts, build, cap:sync, dev, preview (+12 more)

### Community 2 - "Product Concepts (README)"
Cohesion: 0.11
Nodes (18): index.html App Shell, #root Mount Point, Bricolage Grotesque + Outfit Fonts, Capacitor Android App, ExitKit, exitkit_pack_unlock Product, Handover PDF Pack, handover_pack Entitlement (+10 more)

### Community 3 - "Walkthrough & Pack Readiness"
Cohesion: 0.18
Nodes (14): Guided Walkthrough, Four Room Templates, vitest, checkCompleteness(), PackCompleteness, PackSection, ROOM_TEMPLATES, RoomTemplate (+6 more)

### Community 4 - "TypeScript Config"
Cohesion: 0.13
Nodes (14): compilerOptions, isolatedModules, jsx, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch (+6 more)

### Community 5 - "Settlement Money Math"
Cohesion: 0.29
Nodes (10): formatPaise(), toPaise(), computeSettlement(), splitEqually(), Deduction, MeterReading, Roommate, Settlement (+2 more)

### Community 6 - "Android Example Tests"
Cohesion: 0.24
Nodes (8): ExampleInstrumentedTest, ExampleUnitTest, androidx.test.ext.junit.runners.AndroidJUnit4, assert, context, instrumentationregistry, org.junit.runner.RunWith, org.junit.Test

### Community 7 - "PDF Pack Generation"
Cohesion: 0.22
Nodes (10): pdf-lib, pdf-lib, buildPack(), ACCENT, buildPackPdf(), INK, jpegBytes(), MUTED (+2 more)

### Community 8 - "Runtime Dependencies"
Cohesion: 0.25
Nodes (8): dependencies, @capacitor/android, @capacitor/core, lucide-react, pdf-lib, react, react-dom, @revenuecat/purchases-capacitor

### Community 9 - "Dev Dependencies"
Cohesion: 0.25
Nodes (8): devDependencies, @capacitor/cli, @types/react, @types/react-dom, typescript, vite, @vitejs/plugin-react, vitest

### Community 10 - "Setup Screen UI"
Cohesion: 0.33
Nodes (7): Deposit Settlement Concept, The Flat and the People Form, ExitKit Header and Tagline, Local-Only Data Privacy Promise, Roommates and Deposit Contributions, ExitKit Setup Screen (1179x2556), Step Navigation Bar (1 Setup)

### Community 11 - "Gradle Wrapper Script"
Cohesion: 0.83
Nodes (3): gradlew script, die(), warn()

### Community 12 - "App Icon Design"
Cohesion: 0.67
Nodes (4): ExitKit App Icon, Checkmark Completion Badge, Document/Form Panel Mark, Teal-Green Brand Color

## Knowledge Gaps
- **61 isolated node(s):** `config`, `name`, `private`, `version`, `type` (+56 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 71 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `Runtime Dependencies` to `Capacitor & NPM Config`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `Dev Dependencies` to `Capacitor & NPM Config`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **Why does `@capacitor/core` connect `App Shell & Purchases` to `Capacitor & NPM Config`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **What connects `config`, `name`, `private` to the rest of the system?**
  _61 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Capacitor & NPM Config` be split into smaller, more focused modules?**
  _Cohesion score 0.09090909090909091 - nodes in this community are weakly interconnected._
- **Should `Product Concepts (README)` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._
- **Should `TypeScript Config` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._