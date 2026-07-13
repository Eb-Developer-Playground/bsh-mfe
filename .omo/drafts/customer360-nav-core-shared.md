# customer360-nav-core-shared draft

status: plan-written
intent: clear
review_required: false
pending_action: user chooses `/start-work` or high-accuracy review

## Scope selected by user

- Migrate/reconcile `projects/Customer360Web/src/app/home/navigation/` into `projects/customer360/` only.
- Continue migration work for cross-cutting `core/` and `shared/` layers alongside navigation.
- Preserve the current successful `ng build customer360` baseline.

## Components ledger

1. navigation-local-customer360
   - outcome: Customer360 owns a local navigation component based on the legacy `home/navigation` source, not shell navigation.
   - status: owner decision resolved by user: Customer360 only.
   - evidence: `projects/Customer360Web/src/app/home/navigation/*`; `projects/shell/src/app/home/navigation/*`; `projects/customer360/src/app/home/navigation` absent.

2. core-layer-parity
   - outcome: Bring target `core/` into parity with functional legacy code while retaining Angular v22/standalone compile behavior.
   - status: planning.
   - evidence: legacy has 57 `.ts` files; target has 51 `.ts` files plus 2 `.legacy.ts`; source top-level `core/auth/` and `core/resolvers.ts` are missing in target.

3. shared-layer-parity
   - outcome: Bring target `shared/` into compile-safe parity for migrated and upcoming feature modules.
   - status: planning.
   - evidence: legacy `shared/` has components/dialogs/directives/form-controls/interceptors/models/modules/pipes/providers/services/static/utils/validators; target lacks `providers/`, has broad tsconfig exclusions for `shared/components`, `shared/directives`, and `shared/modules/upload-docs`.

4. build-safety
   - outcome: Every implementation wave preserves `ng build customer360` success and records output to next `build-output-N.md` file.
   - status: planning.
   - evidence: `build-output-3.md` is successful baseline; `projects/customer360/tsconfig.app.json` currently excludes unfinished surfaces.

## Approach proposed

Plan a dependency-safe sequence:
1. Add customer360-local navigation under `projects/customer360/src/app/home/navigation/`, converted to Angular v22 standalone style and using customer360-local `BSHServices`, `SessionService`, `MenuItem`, and translate/material imports.
2. Core parity pass: compare every legacy `core/**` file against target; migrate missing functional files, reconcile `.legacy.ts` replacements, and avoid bringing legacy NgModules except where explicitly transformed into routes/standalone providers.
3. Shared parity pass: focus first on provider/service/barrel files and currently excluded surfaces needed by migrated features (`shared/directives`, `shared/modules/upload-docs`, selected `shared/components`). Convert or expose standalone imports instead of reviving NgModules.
4. Tighten `tsconfig.app.json` excludes only after each subtree compiles; do not remove all exclusions at once.
5. Verification after each wave: `ng build customer360 2>&1 | tee build-output-<next>.md`; grep output for hard errors; inspect generated `dist/customer360`.

## Default decisions recorded

- Test strategy: tests-after with agent-executed QA, because the current task is migration/reconciliation of existing behavior and no dedicated failing tests exist for this slice.
- Preserve deprecated `cards/` skip rule.
- Do not touch shell navigation in this plan, per user decision.
- Do not introduce new NgModules; existing NgModule files are cleanup targets or transformation sources only.
- User added refinement: directives and components should be converted to standalone-compatible Angular v22 code in the most minimal way. This means no `standalone: true`, no broad modernization, no template/style/API rewrites unless required for compilation, and only required decorator `imports`/barrel updates.

## Approval gate

User approved plan generation. Detailed plan written at `.omo/plans/customer360-nav-core-shared.md`. Approval authorized planning only, not implementation.

## Metis review receipt

- Session: `ses_0b266a9abffeh8NWnY693sIIQv`
- Findings folded in: no `standalone: true`, no explicit OnPush, TranslatePipe not TranslateModule, HostBinding/HostListener conversion, explicit handling for `core/auth`, `core/resolvers.ts`, `shared/providers`, 23 NgModule files, 2 `.legacy.ts` services, baseline rebuild before edits, static gates after each wave.
