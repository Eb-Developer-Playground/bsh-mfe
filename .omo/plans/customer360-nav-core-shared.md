# customer360-nav-core-shared - Work Plan

## TL;DR (For humans)

**What you'll get:** an execution-ready migration slice that brings `Customer360Web` navigation, `core/`, and `shared/` parity into `projects/customer360` without breaking the current successful `ng build customer360` baseline. Directives and components are converted in the most minimal standalone-compatible way: remove NgModule reliance, add only required decorator imports/exports, and avoid cosmetic rewrites.

**Why this approach:** the target already builds, but it does so by excluding unfinished shared/core surfaces. This plan migrates the cross-cutting layer in small dependency-safe waves: navigation first, then core gaps, then shared providers/directives/upload-docs/components, with a build captured after each wave.

**What it will NOT do:** it will not touch `projects/shell/`, will not migrate the remaining 22 feature modules, will not resurrect NgModules, will not touch deprecated `cards/`, and will not remove feature-module `.module.ts` files except for `shared/directives/directives.module.ts` if its directives are successfully standalone-enabled.

**Effort:** medium-large migration slice; expect multiple build/fix cycles.

**Risk:** highest risk is un-excluding `shared/components/**`, `shared/directives/**`, and `shared/modules/upload-docs/**` because they may reveal latent Angular v22 errors. The plan deliberately un-excludes one surface at a time.

**Decisions already made:** navigation goes into `projects/customer360/` only; shell navigation is out of scope. Tests are tests-after with agent-executed QA. High-accuracy review was not requested.

## Scope

### In scope

1. **Customer360-local navigation**
   - Source: `projects/Customer360Web/src/app/home/navigation/navigation.component.ts`
   - Source: `projects/Customer360Web/src/app/home/navigation/navigation.component.html`
   - Source: `projects/Customer360Web/src/app/home/navigation/navigation.component.scss`
   - Target: `projects/customer360/src/app/home/navigation/`
   - User decision: target is **Customer360 only**, not shell.

2. **Core migration/parity**
   - Source root: `projects/Customer360Web/src/app/core/`
   - Target root: `projects/customer360/src/app/core/`
   - Reconcile missing top-level source items:
     - `core/auth/` -> migrate as standalone-compatible target code under `projects/customer360/src/app/core/auth/`.
     - `core/resolvers.ts` -> migrate to `projects/customer360/src/app/core/resolvers.ts`.
   - Reconcile existing legacy services:
     - `projects/customer360/src/app/core/services/account/account.service.legacy.ts`
     - `projects/customer360/src/app/core/services/account-management/account-management.service.legacy.ts`

3. **Shared migration/parity**
   - Source root: `projects/Customer360Web/src/app/shared/`
   - Target root: `projects/customer360/src/app/shared/`
   - Add missing `shared/providers/` using source `paginator-localization.class.ts`.
   - Convert/activate currently excluded target surfaces in safe waves:
     - `shared/directives/**/*.ts`
     - `shared/modules/upload-docs/**/*.ts`
     - selected `shared/components/**/*.ts` required by migrated features.

4. **Build baseline preservation**
   - Current known-good baseline: `build-output-3.md`.
   - Every wave writes the next available `build-output-N.md` file.

### Out of scope / Must NOT have

- Do not edit `projects/shell/`.
- Do not migrate dashboard/search/tickets or the 22 not-started customer feature modules.
- Do not migrate or touch deprecated `projects/customer360/src/app/home/customer/cards/` except preserving its skip markers.
- Do not add or revive NgModules.
- Do not perform broad modernization while converting directives/components. Minimal conversion only: keep behavior/templates/styles intact unless a build error requires a targeted change.
- Do not add `standalone: true` to Angular decorators; Angular v22 standalone is default per repo instructions.
- Do not explicitly set `changeDetection: ChangeDetectionStrategy.OnPush`.
- Do not use `TranslateModule`; use `TranslatePipe`.
- Do not use `@HostBinding` / `@HostListener`; convert to decorator `host` metadata if encountered.
- Do not rewrite `*ngIf`/`*ngFor` to native control flow unless needed for the specific migrated file to compile or satisfy an existing repo rule in touched code.
- Do not refactor RxJS state to signals unless the file is newly created or the existing code fails to compile without the refactor.
- Do not remove all `tsconfig.app.json` exclusions at once.
- Do not keep adding exclusions as a way to force a green build; any new exclusion must be treated as a failed wave and reverted unless separately approved.

## Verification strategy

### Baseline command

Before product-code changes, executor must run:

```bash
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use 22 >/dev/null 2>&1
set -o pipefail
npx ng build customer360 2>&1 | tee build-output-4.md
```

Acceptance:
- exit code `0`
- output contains `Application bundle generation complete`
- output contains `Output location: .../dist/customer360`
- no lines matching `✘ [ERROR]`, `ERRR`, or `[ERROR]`

If baseline fails before edits, stop and report the baseline regression; do not migrate.

### Mandatory after every wave

Use the next available output filename (`build-output-5.md`, `build-output-6.md`, etc.):

```bash
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use 22 >/dev/null 2>&1
set -o pipefail
npx ng build customer360 2>&1 | tee build-output-<N>.md
```

Then verify:

```bash
```

Acceptance: count is `0`.

### Static gates after every wave

```bash
grep -r "standalone: true" projects/customer360/src/app || true
grep -r "ChangeDetectionStrategy.OnPush\|OnPush" projects/customer360/src/app || true
grep -r "TranslateModule" projects/customer360/src/app || true
grep -rE "@HostBinding|@HostListener" projects/customer360/src/app || true
grep -r "@NgModule" projects/customer360/src/app --include='*.ts' || true
```

Acceptance:
- no new `standalone: true`
- no new explicit `OnPush`
- no `TranslateModule` in migrated files
- no `@HostBinding` / `@HostListener` in migrated files
- `@NgModule` only appears in pre-existing excluded feature `.module.ts` files until those are separately cleaned; this plan may eliminate `shared/directives/directives.module.ts` if successful.

## Execution strategy

Execute in dependency order. Each todo is a single worker action with its own build or targeted verification. Do not proceed to the next wave if the current wave has hard build errors.

### Decisions folded in from Metis review

- `core/auth/`: migrate into customer360 as standalone-compatible code, but do **not** wire `/auth` into root routes unless an existing customer360 route imports it. This preserves functional code without changing route behavior.
- `core/resolvers.ts`: migrate as `projects/customer360/src/app/core/resolvers.ts`; do not wire it unless a route already references it.
- `shared/providers/`: migrate `paginator-localization.class.ts` and wire `MatPaginatorIntl` provider in `app.config.ts` only after build confirms imports resolve.
- 23 feature NgModule files: keep out of scope except `shared/directives/directives.module.ts`; do not delete feature module leftovers in this slice.
- 2 `.legacy.ts` files: reconcile by removing imports to legacy files and deleting only if the non-legacy replacements compile and no references remain.
- Directives/components: use minimal standalone-compatible conversion. For directives, remove module dependency and export from barrels; do not add `standalone: true`. For components, add only required `imports` entries and replace unavailable module imports with standalone imports such as `TranslatePipe`, Angular Material standalone modules, and specific directives/pipes/components.

## Todos

### Wave 0 — Fresh baseline and inventory lock

1. [x] **Repository root: Run fresh customer360 build before edits - expect current baseline still green**
   - References:
     - `build-output-3.md`
     - `projects/customer360/tsconfig.app.json`
   - Steps:
     - Run the baseline command from `## Verification strategy` and save to `build-output-4.md`.
   - Acceptance:
     - `build-output-4.md` exists.
     - build exits `0`.
     - hard-error grep count is `0`.
   - Happy QA:
     - Inspect `dist/customer360/` exists after build.
   - Failure QA:
     - If build fails before edits, stop and report `build-output-4.md` as stale-baseline evidence.
   - Commit: no commit yet; baseline artifact only.

2. [x] **projects/customer360/src/app: Snapshot compile exclusions and migration markers - expect no accidental scope expansion**
   - References:
     - `projects/customer360/tsconfig.app.json:20-62`
     - `projects/customer360/src/app/home/customer/cards/DEPRECATED.md`
     - `projects/customer360/src/app/home/customer/cards/.deprecated`
   - Steps:
     - Record the current `exclude` list.
     - Confirm `cards` deprecation markers remain.
     - Confirm the two `.legacy.ts` files exist before reconciliation.
   - Acceptance:
     - Worker records list of pre-existing exclusions in notes.
     - No product-code edits in this todo.
   - Happy QA:
     - Grep finds `DEPRECATED.md` and `.deprecated` under cards.
   - Failure QA:
     - If cards markers are missing, stop; do not touch cards.
   - Commit: no commit yet.

### Wave 1 — Customer360-local navigation

3. [x] **projects/customer360/src/app/home/navigation: Add standalone-compatible navigation component from legacy - expect component compiles locally**
   - References:
     - `projects/Customer360Web/src/app/home/navigation/navigation.component.ts`
     - `projects/Customer360Web/src/app/home/navigation/navigation.component.html`
     - `projects/Customer360Web/src/app/home/navigation/navigation.component.scss`
     - `projects/shell/src/app/home/navigation/navigation.component.ts` for current Angular v22 compatibility pattern only; do not edit shell.
     - `projects/customer360/src/app/shared/services/session/session.service.ts`
     - `projects/customer360/src/app/shared/services/bsh-services.ts`
     - `projects/customer360/src/app/shared/models`
   - Steps:
     - Create `projects/customer360/src/app/home/navigation/`.
     - Copy legacy TS/HTML/SCSS behavior.
     - Convert constructor DI to `inject()` where safe.
     - Replace `Subject<any>` with typed `Subject<void>` or signal/effect pattern; do not use `any`.
     - Add component `imports` for Angular Material, RouterLink/RouterLinkActive, control-flow dependencies, and `TranslatePipe`.
     - Do not set `standalone: true`.
     - Keep routes/layout wiring out of this todo.
   - Acceptance:
     - `navigation.component.ts/html/scss` exist under target.
     - No `standalone: true`, no explicit `OnPush`, no `TranslateModule`.
     - TypeScript imports resolve.
   - Happy QA:
     - Run `npx ng build customer360 2>&1 | tee build-output-5.md`; expect exit `0` and hard-error count `0`.
   - Failure QA:
     - If missing `MenuItem`/`SessionService`/`BSHServices` imports fail, fix via target-local imports only; do not import from shell or Customer360Web.
   - Commit: `feat(customer360): add local navigation component`.

4. [x] **projects/customer360/src/app: Wire navigation only if a customer360 layout entry exists - expect no route restructuring**
   - References:
     - `projects/customer360/src/app/app.html`
     - `projects/customer360/src/app/app.ts`
     - `projects/customer360/src/app/app.routes.ts`
     - `projects/customer360/src/app/home/navigation/navigation.component.ts`
   - Steps:
     - Inspect current `app.html`/layout.
     - If `app.html` is only a router outlet, add navigation only in a minimal layout wrapper that preserves all existing route behavior.
     - Do not restructure the 10 existing feature route entries.
     - If adding navigation would duplicate shell layout in the host, still follow the user decision: customer360-local navigation is in scope.
   - Acceptance:
     - Existing feature paths in `app.routes.ts` remain unchanged.
     - Customer360 local navigation is renderable from the app root or documented as a present component awaiting visual integration if no layout hook exists.
   - Happy QA:
     - Run `npx ng build customer360 2>&1 | tee build-output-6.md`; expect exit `0`.
   - Failure QA:
     - If adding the component triggers Material import errors, fix imports in the navigation component only; do not add NgModules.
   - Commit: `feat(customer360): render local navigation`.

### Wave 2 — Core parity

5. **projects/customer360/src/app/core: Migrate missing `resolvers.ts` from legacy - expect resolver APIs compile without route behavior changes**
   - References:
     - `projects/Customer360Web/src/app/core/resolvers.ts`
     - `projects/customer360/src/app/core/resolvers/customer-account-resolver.service.ts`
     - `projects/customer360/src/app/core/resolvers/feature-roles.resolver.ts`
     - `projects/customer360/src/app/shared/services/api.service.ts`
     - `projects/customer360/src/app/shared/services/session/session.service.ts`
   - Steps:
     - Add `projects/customer360/src/app/core/resolvers.ts`.
     - Preserve `resolvePermissions` and `resolveRoles` functions.
     - Prefer functional resolver exports; keep class resolver only if referenced by migrated code.
     - Replace constructor DI in any retained class with `inject()` if practical.
     - Fix index-signature access with bracket notation where TypeScript requires it.
   - Acceptance:
     - `core/resolvers.ts` compiles.
     - No route file is changed unless it already references the migrated resolver.
   - Happy QA:
     - Run `npx ng build customer360 2>&1 | tee build-output-7.md`; expect exit `0`.
   - Failure QA:
     - If `SessionService` lacks `roles`/`authVersion` APIs, stop and record exact missing members; do not invent session state semantics.
   - Commit: `feat(customer360): migrate core permission resolvers`.

6. **projects/customer360/src/app/core/auth: Migrate legacy auth folder as standalone-compatible inactive surface - expect no root route behavior change**
   - References:
     - `projects/Customer360Web/src/app/core/auth/auth.component.ts`
     - `projects/Customer360Web/src/app/core/auth/auth.component.html`
     - `projects/Customer360Web/src/app/core/auth/auth.component.scss`
     - `projects/Customer360Web/src/app/core/auth/auth-routing.module.ts`
     - `projects/Customer360Web/src/app/core/auth/auth.module.ts`
     - `projects/Customer360Web/src/app/core/auth/material.module.ts`
   - Steps:
     - Create target `projects/customer360/src/app/core/auth/`.
     - Copy component template/style/logic.
     - Convert component to Angular v22 decorator rules: imports array, no `standalone: true`, no explicit `OnPush`.
     - Convert routing module to `auth.routes.ts` exporting `Routes`.
     - Do not copy `auth.module.ts` or `material.module.ts` as NgModules; use them only as source for component imports.
     - Do not add `/auth` to root `app.routes.ts` in this slice.
   - Acceptance:
     - `auth.component.ts/html/scss` and `auth.routes.ts` exist in target.
     - No `auth.module.ts`, `auth-routing.module.ts`, or `material.module.ts` is added to target.
     - Root route behavior unchanged.
   - Happy QA:
     - Run `npx ng build customer360 2>&1 | tee build-output-8.md`; expect exit `0`.
   - Failure QA:
     - If auth component depends on unavailable legacy shared modules, migrate only the direct standalone imports needed; do not un-exclude broad shared surfaces in this todo.
   - Commit: `feat(customer360): migrate core auth surface`.

7. **projects/customer360/src/app/core/services: Reconcile `.legacy.ts` service files - expect no consumers depend on legacy variants**
   - References:
     - `projects/customer360/src/app/core/services/account/account.service.ts`
     - `projects/customer360/src/app/core/services/account/account.service.legacy.ts`
     - `projects/customer360/src/app/core/services/account-management/account-management.service.ts`
     - `projects/customer360/src/app/core/services/account-management/account-management.service.legacy.ts`
     - `projects/Customer360Web/src/app/core/services/account/account.service.ts`
     - `projects/Customer360Web/src/app/core/services/account-management/account-management.service.ts`
   - Steps:
     - Search target for imports of `.legacy` files and legacy class names.
     - Compare legacy and non-legacy service public methods against source functional code.
     - Move any missing public methods from `.legacy.ts` into non-legacy services if required by migrated features.
     - Delete `.legacy.ts` files only after no references remain and build passes.
     - Remove the two `.legacy.ts` entries from `tsconfig.app.json` only if files are deleted.
   - Acceptance:
     - No target import references `.legacy` services.
     - Either `.legacy.ts` files are deleted and tsconfig excludes removed, or a documented blocker explains why they must remain excluded.
   - Happy QA:
     - Run `npx ng build customer360 2>&1 | tee build-output-9.md`; expect exit `0`.
   - Failure QA:
     - If method reconciliation changes API behavior, stop and report exact method diff rather than guessing business semantics.
   - Commit: `refactor(customer360): reconcile core legacy services`.

### Wave 3 — Shared providers and directives

8. **projects/customer360/src/app/shared/providers: Add paginator localization provider - expect MatPaginatorIntl can be provided from app config**
   - References:
     - `projects/Customer360Web/src/app/shared/providers/paginator-localization.class.ts`
     - `projects/customer360/src/app/app.config.ts`
     - `@angular/material/paginator` dependency already present in package.json.
   - Steps:
     - Create `projects/customer360/src/app/shared/providers/`.
     - Add `paginator-localization.class.ts` converted to target style.
     - Add barrel export if shared patterns use `index.ts`.
     - Wire `{ provide: MatPaginatorIntl, useClass: MyCustomPaginatorIntl }` in `app.config.ts`.
     - Use `inject(TranslateService)` rather than constructor DI if feasible.
   - Acceptance:
     - Provider file exists and compiles.
     - `app.config.ts` provides `MatPaginatorIntl` once.
   - Happy QA:
     - Run `npx ng build customer360 2>&1 | tee build-output-10.md`; expect exit `0`.
   - Failure QA:
     - If translation service injection fails, revert provider wiring but keep file migrated; report provider wiring blocker.
   - Commit: `feat(customer360): add paginator localization provider`.

9. **projects/customer360/src/app/shared/directives: Activate directives without `DirectivesModule` - expect directives compile as standalone imports**
   - References:
     - `projects/customer360/src/app/shared/directives/directives.module.ts`
     - `projects/customer360/src/app/shared/directives/index.ts`
     - `projects/customer360/src/app/shared/directives/public-api.ts`
     - `projects/Customer360Web/src/app/shared/directives/`
     - `projects/customer360/tsconfig.app.json:24-26`
   - Steps:
     - For every directive in target `shared/directives/`, ensure it is Angular v22-compatible.
     - Apply the most minimal standalone conversion: do not alter selector names, host behavior, validators, input/output names, or public exports except where required for compilation.
     - Do not add `standalone: true`.
     - Replace `@HostBinding`/`@HostListener` with decorator `host` metadata if present.
     - Remove dependency on `directives.module.ts` by exporting directives via barrel files.
     - Delete `shared/directives/directives.module.ts` if no imports reference it.
     - Remove `src/app/shared/directives/**/*.ts` from `tsconfig.app.json` only after the directives compile.
   - Acceptance:
     - `shared/directives/**/*.ts` are no longer excluded.
     - `directives.module.ts` is deleted or remains excluded with explicit blocker note.
     - Build passes.
   - Happy QA:
     - Run `npx ng build customer360 2>&1 | tee build-output-11.md`; expect exit `0`.
   - Failure QA:
     - If one directive fails, fix that directive; do not re-add the broad exclusion unless reverting the wave.
   - Commit: `refactor(customer360): activate shared directives`.

### Wave 4 — Shared upload-docs and required components

10. **projects/customer360/src/app/shared/modules/upload-docs: Convert upload-docs to standalone-compatible exports - expect compile exclusion removed**
   - References:
     - `projects/customer360/src/app/shared/modules/upload-docs/`
     - `projects/Customer360Web/src/app/shared/modules/upload-docs/`
     - `projects/customer360/tsconfig.app.json:26`
     - `MIGRATION_HANDOVER.md:33-42` identifies upload-docs as critical dependency.
   - Steps:
     - Convert upload-docs components/directives/pipes to Angular v22 decorator rules.
     - Use minimal conversion only: preserve existing templates, styles, services, class names, selectors, input/output contracts, and public-api filenames unless they fail to compile.
     - Remove or ignore source NgModule files; do not add new NgModules.
     - Keep public APIs/barrels exporting standalone components, directives, pipes, models, and services.
     - Replace `TranslateModule` with `TranslatePipe` where needed.
     - Replace `ngClass`/`ngStyle` with class/style bindings only in files already touched for compilation; do not do template-wide cleanup in this slice.
     - Remove `src/app/shared/modules/upload-docs/**/*.ts` exclusion only after the subtree compiles.
   - Acceptance:
     - Upload-docs subtree compiles without broad tsconfig exclusion.
     - No `@NgModule`, `TranslateModule`, `standalone: true`, or explicit `OnPush` introduced.
   - Happy QA:
     - Run `npx ng build customer360 2>&1 | tee build-output-12.md`; expect exit `0`.
   - Failure QA:
     - If upload-docs pulls excluded shared components, migrate only the required direct dependency; do not activate all shared/components yet.
   - Commit: `refactor(customer360): activate upload docs shared module`.

11. **projects/customer360/src/app/shared/components: Activate only components required by current migrated features - expect no broad component explosion**
   - References:
     - `projects/customer360/src/app/shared/components/`
     - `projects/Customer360Web/src/app/shared/components/`
     - `projects/customer360/tsconfig.app.json:24,27-34`
     - Build outputs from Waves 10-12 showing missing component imports, if any.
   - Steps:
     - Identify components imported by currently wired customer360 routes and upload-docs.
     - Convert only those components first.
     - Apply minimal standalone conversion only: add required `imports`, swap `TranslateModule` to `TranslatePipe`, and replace module-only dependencies with direct standalone imports. Preserve behavior, templates, selectors, styles, and public APIs.
     - Remove specific component exclusions one by one after compile success.
     - Keep unrelated shared components excluded and document them as future migration debt.
   - Acceptance:
     - No currently wired feature imports a compile-excluded shared component.
     - Build passes.
     - `tsconfig.app.json` exclude list is shorter, never longer.
   - Happy QA:
     - Run `npx ng build customer360 2>&1 | tee build-output-13.md`; expect exit `0`.
   - Failure QA:
     - If activating a component cascades into a large feature migration, stop and document the dependency chain; do not expand into unrelated feature modules.
   - Commit: `refactor(customer360): activate required shared components`.

### Wave 5 — Final cleanup and documentation

12. **projects/customer360/tsconfig.app.json: Remove stale exclusions from completed surfaces - expect excludes only represent future scope**
   - References:
     - `projects/customer360/tsconfig.app.json`
     - Build outputs from Waves 0-4.
   - Steps:
     - Remove exclusions for surfaces proven to compile:
       - `shared/directives/**/*.ts` if Wave 9 succeeded.
       - `shared/modules/upload-docs/**/*.ts` if Wave 10 succeeded.
       - specific shared component exclusions proven by Wave 11.
       - two `.legacy.ts` service excludes if Wave 7 deleted files.
     - Keep out-of-scope feature-module excludes.
   - Acceptance:
     - Exclude list is shorter or unchanged with blocker notes; never longer.
     - Build passes.
   - Happy QA:
     - Run `npx ng build customer360 2>&1 | tee build-output-14.md`; expect exit `0`.
   - Failure QA:
     - If removing an exclusion reveals a hidden error, restore only that exclusion and record exact blocker path.
   - Commit: `chore(customer360): tighten migration excludes`.

13. **Migration notes: Update handover/progress notes for nav-core-shared slice - expect next worker can resume cleanly**
   - References:
     - `MIGRATION_HANDOVER.md`
     - `.omo/drafts/customer360-nav-core-shared.md`
     - `.omo/plans/customer360-nav-core-shared.md`
     - final build output from Wave 5.
   - Steps:
     - Update migration notes with completed surfaces, remaining exclusions, and exact next blockers.
     - Do not mark all shared/core as complete unless all exclusions are gone and build passes.
   - Acceptance:
     - Handover accurately states what was migrated and what remains.
     - Final build output path is referenced.
   - Happy QA:
     - Reviewer can read handover and identify remaining future work without inspecting git diff.
   - Failure QA:
     - If handover claims exceed actual build evidence, correct them before final verification.
   - Commit: `docs(customer360): document nav core shared migration progress`.

## Final verification wave

After all todos complete, run these in parallel where possible and require all to pass:

1. **F1 plan compliance audit**
   - Verify every in-scope path was handled.
   - Verify shell files under `projects/shell/` were not modified.
   - Verify deprecated `cards/` was not touched.

2. **F2 code quality/static audit**
   - Run static gates from `## Verification strategy`.
   - Confirm no new `NgModule`, `TranslateModule`, `standalone: true`, explicit `OnPush`, `@HostBinding`, or `@HostListener` in migrated files.

3. **F3 build verification**
   - Run final `ng build customer360 2>&1 | tee build-output-final-nav-core-shared.md`.
   - Confirm exit `0`, hard-error count `0`, and `dist/customer360` generated.

4. **F4 scope fidelity**
   - Confirm no migration of unrelated customer features began.
   - Confirm any remaining exclusions are documented as future work, not hidden failures.

## Commit strategy

Use small commits by wave:

1. `feat(customer360): add local navigation component`
2. `feat(customer360): render local navigation`
3. `feat(customer360): migrate core permission resolvers`
4. `feat(customer360): migrate core auth surface`
5. `refactor(customer360): reconcile core legacy services`
6. `feat(customer360): add paginator localization provider`
7. `refactor(customer360): activate shared directives`
8. `refactor(customer360): activate upload docs shared module`
9. `refactor(customer360): activate required shared components`
10. `chore(customer360): tighten migration excludes`
11. `docs(customer360): document nav core shared migration progress`

If a wave requires multiple fixes, keep commits atomic and do not mix product-code changes with build-output/doc updates unless the team prefers one migration commit.

## Success criteria

- `projects/customer360/src/app/home/navigation/` exists and compiles.
- Shell navigation remains untouched.
- `projects/customer360/src/app/core/resolvers.ts` exists and compiles.
- `projects/customer360/src/app/core/auth/` exists as standalone-compatible code without NgModules.
- `.legacy.ts` services are reconciled or explicitly documented as blockers.
- `projects/customer360/src/app/shared/providers/paginator-localization.class.ts` exists and provider wiring compiles.
- `shared/directives` and `shared/modules/upload-docs` are activated unless a documented blocker prevents it.
- `tsconfig.app.json` excludes are shorter or unchanged with explicit blocker notes; never longer.
- Final customer360 build exits `0` with no hard errors.
- No `standalone: true`, explicit `OnPush`, `TranslateModule`, `@HostBinding`, or `@HostListener` is introduced in migrated files.
- Directives/components are converted minimally: no broad formatting, control-flow, signal, style, selector, or public API rewrites beyond what is required to compile standalone-compatible Angular v22 code.
