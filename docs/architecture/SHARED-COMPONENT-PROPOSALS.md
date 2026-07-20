# Shared Component Proposals

**Repository**: bsh-mfe (Angular Native Federation Monorepo)
**Date**: 2026-07-20
**Scope**: Strategy for UI components shared across shell, customer360, swift, and onboarding

---

## Problem Statement

Today, "shared" UI in this monorepo means one of three things — all of them problematic:

1. **Duplication**: `DocumentsUploadComponent` exists twice — once in
   `projects/shell/src/app/shared/modules/upload-docs/` and once in
   `projects/customer360/src/app/shared/modules/upload-docs/`. The copies have already
   drifted (the shell version injects `SessionService` and `DocumentsService` and grew
   `submitOnUpload`/`ticket`/`ticketId` inputs; the customer360 copy did not).
2. **God dialogs**: components like `VerifyBioDialogComponent` and
   `VerifySignatoryBioDialogComponent` in `projects/shell/src/app/shared/components/`
   inject **20+ services** each. They cannot be reused by a remote MFE without dragging the
   entire shell service graph across the federation boundary.
3. **Federation exposure as sharing**: customer360 exposes `./SearchComponent` via
   `federation.config.mjs` so other apps can load it at runtime. This works, but every
   exposed component becomes a public contract, and it only shares *compiled Angular
   components*, not design-system primitives.

Both proposals below reduce the amount of code that must cross MFE boundaries, and make
what does cross the boundary **stateless and contract-driven**.

---

## Proposal 1: Adopt `@equity/ebk-web-components` for Design-System Primitives

### What It Is

`@equity/ebk-web-components` (v1.0.7, already in root `package.json`) is the Equity
design-system component library. It ships Angular-consumable components such as
`EqButtonComponent`, already in use:

```typescript
// projects/customer360/src/app/home/search/search.component.ts
import { EqButtonComponent } from '@equity/ebk-web-components';
```

### Why It Solves the Sharing Problem

- **No ownership question**: primitives (buttons, inputs, cards, pills, badges, loaders)
  live outside the monorepo. No app is the "owner" that others must depend on.
- **No federation coupling**: each MFE imports the library directly; there is no runtime
  handshake between shell and remotes for a button to render consistently.
- **Replaces homegrown primitives**: components like `PillsComponent`, `InfoBoxComponent`,
  `SkeletonLoaderComponent`, `ButtonItemMenuComponent`, and `ListItemComponent` in
  `projects/shell/src/app/shared/components/` are candidates for deletion once an ebk
  equivalent covers them.

### Usage Rules

1. **Prefer ebk primitives over Material and over homegrown components** for any new UI.
   Reach for `MatButtonModule` only when ebk has no equivalent.
2. **Import the specific component**, never a barrel of everything:
   ```typescript
   imports: [EqButtonComponent]
   ```
3. **Do not wrap ebk components** in local pass-through components "for convenience".
   Wrappers reintroduce the shallow-module problem documented in
   `SHALLOW-MODULES-ANALYSIS.md`.
4. **Do not add `CUSTOM_ELEMENTS_SCHEMA`** to consume ebk components — the Angular
   entrypoints are typed components. Blanket schemas hide template errors.

### Known Federation Gotchas (already handled — do not regress)

- The library's transitive `lodash` dependency is CJS-only. Named ESM imports from
  `@equity/ebk-web-components` fail when the library is pre-bundled as a shared federation
  chunk. Two mitigations are in place:
  - `pnpm.overrides` in root `package.json` maps `@equity/ebk-web-components>lodash` to
    `lodash-es`.
  - `lodash` is listed in the `skip` array in `projects/customer360/federation.config.mjs`
    so the library is bundled inline per-remote rather than shared.
- When a second app starts consuming the library, replicate the `skip` entry in that app's
  `federation.config.mjs`. Do **not** attempt to share `@equity/ebk-web-components` as a
  federation singleton until the CJS issue is resolved upstream.

### What ebk Does NOT Cover

Domain components — anything that knows about customers, accounts, tickets, documents, or
biometrics. Those are the subject of Proposal 2.

---

## Proposal 2: Convert Common-but-Coupled Components into Presentational Components

### The Pattern

Split each shared domain component into two layers:

| Layer | Lives where | Knows about |
|-------|------------|-------------|
| **Presentational component** | shared location (or duplicated verbatim until a shared lib exists) | inputs + outputs only. No services, no `localStorage`, no `Router`, no `MatDialog` opening, no HTTP |
| **Smart container** | each consuming app | services, session state, navigation, dialog orchestration |

Presentational components follow the repo's standalone conventions:

```typescript
@Component({
  selector: 'app-documents-upload',
  imports: [EqButtonComponent, ReactiveFormsModule /* exact imports only */],
  template: `...`,
})
export class DocumentsUploadComponent {
  documentSpecs = input<IDocumentSpec[]>([]);
  allowedFileTypes = input<string[] | null>(null);
  showConfirmation = input(false);

  confirmed = output<boolean>();
  uploaded = output<IUploadedDocument[]>();
  cameraRequested = output<IDocumentSpec>();
}
```

Rules:

- **`input()` / `output()` functions**, never decorators.
- **`computed()`** for derived state; no `ngOnChanges` bookkeeping.
- **Every side effect becomes an output event.** If the current component calls
  `this.documentsService.upload(...)`, the presentational version emits
  `uploaded`/`uploadRequested` and the container performs the call.
- **No `COMPAT_IMPORTS`** — exact standalone imports only (see AGENTS.md and
  `SHALLOW-MODULES-ANALYSIS.md` Candidate 1).
- **No `CUSTOM_ELEMENTS_SCHEMA`.**

### Why Events Instead of Injected Services

The shell copy of `DocumentsUploadComponent` injects `SessionService`, `DocumentsService`,
`UIService`, `ToastService`, and `TranslateService`. A remote MFE cannot host that
component without recreating (or stubbing) all five — which is exactly how
`projects/swift/src/app/shared-stubs/` came to exist. A presentational version needs
**zero** of them: the host app already has its own toast, translation, and upload
plumbing, and reacts to the emitted events with it.

### Candidate Components (ordered by value ÷ effort)

| # | Component | Current problem | Presentational split |
|---|-----------|----------------|----------------------|
| 1 | `DocumentsUploadComponent` (shell + customer360 copies) | Duplicated, drifted; shell copy injects `DocumentsService` + `SessionService` for `submitOnUpload` | Pure file-picker/list UI. Emits `uploaded`, `confirmed`, `cameraRequested`. Container does upload + toasts |
| 2 | `TicketDetailsComponent` | Shared via `ComponentsModule`, coupled to ticket services | Renders a ticket passed as `input()`; emits `actionSelected` |
| 3 | `AccountDetailSectionComponent` / `AccountCardComponent` | Read session/account services directly | Take account data as `input()`; emit `accountSelected` |
| 4 | `CustomerDetailsComponent` / `CustomerInformationComponent` family | Reads `localStorage['customerDetails']`, injects profile services | Take a customer projection as `input()`; emit `imagePreviewRequested`, `editRequested` |
| 5 | `ApprovalFormComponent` | Coupled to ticket/approval services | Form UI only; emits `approved` / `rejected` with payload |
| 6 | `VerifySkipBioComponent` | Injects 8 services, reads `localStorage['ticketId']`, self-navigates | Reason/comment/document form; emits `skipRequested` with the full payload. Container owns audit, ticket creation, navigation |
| 7 | `VerifyBioDialogComponent` / `VerifySignatoryBioDialogComponent` | 20+ injected services each; the worst coupling in the repo | Long-term target. Split into a fingerprint-capture presentational component (emits `captured`, `verified`) and per-flow containers. Do **not** attempt as the first migration |

### What Stays Smart

Not everything should be presentational. These remain containers by design:

- Dialog **hosts** (the thing passed to `MatDialog.open`) — they adapt `MAT_DIALOG_DATA`
  to inputs and outputs back to `dialogRef.close(...)`.
- Route-level components (`SearchComponent`, home pages).
- Anything owning a saga (bio verification orchestration, ticket submission flows).

The container/presentational boundary is the seam; the presentational side is the part
that becomes shareable.

### Distribution Model

Phase-dependent:

1. **Now**: presentational components live in the app that owns the flow. Because they
   have zero service dependencies, copying one to a second app is a verbatim copy with no
   stub layer — acceptable short-term, and drift is detectable by diff.
2. **When ≥2 apps need the same component**: promote it to a shared library alongside
   `projects/equity-auth` (e.g. `projects/equity-ui`). Only presentational components may
   enter this library — the zero-injection rule is the admission test.
3. **Never**: do not expose presentational components over Native Federation. Federation
   exposure is for routed features (`./Component`, `./Routes`), not for leaf UI.

---

## Decision Guide

```
Is it a design-system primitive (button, input, card, badge, loader)?
  → Use @equity/ebk-web-components. Delete the homegrown version.

Is it domain UI used (or likely to be used) by more than one flow/app?
  → Presentational component: input()/output() only, container owns services.

Is it a flow orchestrator (dialog host, route component, saga)?
  → Smart container. Keep it app-local. Compose presentational pieces inside it.
```

---

## Migration Sequence

1. **Stop the bleeding**: new components must follow the decision guide above. No new
   service-injecting "shared" components under `shared/components/`.
2. **DocumentsUploadComponent** first — it is the only *actively duplicated* component, so
   it validates the pattern and immediately kills a drift source. Extract the
   presentational core; each app keeps a thin container.
3. **Primitives sweep**: replace `PillsComponent`, `InfoBoxComponent`,
   `SkeletonLoaderComponent`, `ListItemComponent` with ebk equivalents where they exist.
   Each replacement shrinks `ComponentsModule` (which should eventually be deleted, per
   the compat-barrel unwinding direction).
4. **Ticket/account/customer display components** (candidates 2–5) as they are touched by
   feature work — opportunistic, not big-bang.
5. **Bio verification dialogs last**, after `SessionService` decomposition settles and the
   pattern is proven on simpler components.

### Verification Expectations

- Any change touching shell shared components: `pnpm ng build shell --configuration development`.
- If the component is consumed by a remote: also build that remote (at minimum
  `pnpm ng build swift --configuration development`, per AGENTS.md).
- Presentational components are trivially unit-testable (no mocking): add a spec asserting
  the input → rendered output and event-emission contract when extracting one.

---

## Definition of Done (per migrated component)

- [ ] No constructor/`inject()` service dependencies in the presentational component
- [ ] All state in via `input()`, all effects out via `output()`
- [ ] Exact standalone imports; no `COMPAT_IMPORTS`, no `CUSTOM_ELEMENTS_SCHEMA`
- [ ] ebk primitives used for buttons/inputs where available
- [ ] Duplicated copies deleted or reduced to identical files pending library promotion
- [ ] Shell (and affected remote) development builds pass

---

## Related Documents

- `docs/architecture/SHALLOW-MODULES-ANALYSIS.md` — compat-barrel and god-service context
- `docs/architecture/DEEPENING-ROADMAP.md`
- `docs/adr/0001-equity-auth-protocol.md` — precedent for a shared protocol library (`equity-auth`); `equity-ui` would follow the same shape
