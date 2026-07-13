# Deepening Roadmap

This roadmap records the highest-leverage deepening opportunities found in the current monorepo shape. The focus is locality for maintainers and leverage for callers and tests.

## 1. Session module decomposition

**Files**
- `projects/shell/src/app/shared/services/session/session.service.ts`
- `projects/shell/src/app/shared/equity-auth/auth-state-publisher.service.ts`
- `projects/shell/src/app/shared/equity-auth/auth-command-listener.service.ts`
- `projects/shell/src/app/shared/guards/auth.guard.ts`

**Problem**
- The Session module is shallow at its interface because callers must know about token storage, refresh, roles, feature-role checks, inactivity handling, and federation publishing through one large interface.
- The implementation mixes UI concerns, storage concerns, auth protocol concerns, and workflow authorization concerns.
- Tests that cross this seam must carry too much configuration and too many dependencies.

**Solution**
- Deepen the Session module by splitting infrastructure and workflow logic behind a smaller Session facade.
- Extract focused modules such as token storage, token parsing, auth transition orchestration, and workflow authorization.
- Keep the Shell as the single adapter that owns session transitions while moving protocol publishing into a narrower seam.

**Progress**
- Extracted encrypted browser session storage into `SessionStorageService` so `SessionService` no longer owns encryption/decryption fallback logic directly.
- Extracted JWT user decoding into `SessionTokenDecoderService` so token parsing has a single adapter around `jwt-decode`.
- Extracted restoration/auth transition policy into `SessionAuthTransitionService`, which now owns session restoration shape and published `AuthState` construction.
- Extracted workflow authorization policy into `SessionAuthorizationService`, which now owns role, permission, feature-role, and process-flow checks.
- Extracted redirect/login URL construction and return-url storage into `SessionNavigationService`, so browser navigation concerns no longer live in the main session facade.
- Extracted inactivity timeout dialog orchestration into `SessionInactivityService`, so the shell-specific logout/relogin prompt is isolated from token and authorization policy.
- Extracted logout HTTP/protocol handling into `SessionLogoutService`, leaving `SessionService` responsible only for session-state reset and public API coordination.
- Extracted subsidiary and locale projection helpers into `SessionProfileProjectionService`, so derived session read-model data no longer lives beside transport/auth logic.
- Kept the public `SessionService` interface unchanged for existing guards, interceptors, dialogs, and auth command listeners.
- The remaining Session facade mostly coordinates extracted seams and keeps the legacy public contract stable for callers.
- Next safe seams, if we keep going, are equity-auth channel ownership and any remaining user-display helper projections.

**Benefits**
- Better locality: bugs in token lifecycle or workflow authorization live in one place instead of a 600+ line module.
- More leverage: callers learn a smaller interface and tests can exercise one concept at a time.

## 2. Compat barrel removal

**Files**
- `projects/shell/src/app/shared/compat-barrel.ts`
- `projects/swift/src/app/shared-stubs/compat-barrel.ts`
- `projects/swift/src/app/shared-stubs/compat-imports.ts`
- Broad consumer set across shell and swift standalone modules

**Problem**
- The compat barrel seam is shallow: the interface is effectively a grab-bag of Angular, CDK, Material, Flex Layout, and pipe imports.
- Understanding what a module needs requires bouncing away from the module into a giant barrel.
- The deletion test shows the seam is load-bearing only as indirection; complexity would reappear as explicit imports, which is the more local shape.

**Solution**
- Replace compat barrels with direct standalone imports in each module.
- Group repeated import sets only where two adapters prove a real seam, not as a global catch-all barrel.

**Progress**
- Replaced `COMPAT_IMPORTS` in the first leaf batch with exact standalone imports for:
  - `shared/components/header/header.component.ts`
  - `shared/modules/loader/loader.component.ts`
  - `shared/modules/notifications/notifications.component.ts`
  - `shared/modules/ticket-note/ticket-note.component.ts`
- Replaced `COMPAT_IMPORTS` in the first dialog batch with exact standalone imports for:
  - `shared/dialogs/radio-options/radio-options.dialog.ts`
  - `shared/dialogs/restricted-country-dialog/restricted-country.dialog.ts`
  - `shared/dialogs/timeout-dialog/timeout.dialog.ts`
  - `shared/dialogs/question/question.dialog.ts`
  - `shared/dialogs/image-preview/image-preview.dialog.ts`
- Replaced `COMPAT_IMPORTS` in the next small shared-component batch with exact standalone imports for:
  - `shared/components/info-box/info-box.component.ts`
  - `shared/components/file-box/file-box.component.ts`
  - `shared/components/list-item/list-item.component.ts`
- Removed unnecessary compat-barrel imports from:
  - `shared/small-loading-spinner/small-loading-spinner.component.ts`
  - `shared/components/skeleton-loader/skeleton-loader.component.ts`
- `CompatImportsModule` and `home/customer/material.module.ts` still exist, but the first mechanical migration batch is build-green.
- The next low-risk compat slice is the next set of small standalone/shared components before larger form and customer-profile components.

**Benefits**
- Better locality: a module’s import list becomes its real interface.
- More leverage: tests and refactors can reason about exact dependencies instead of a hidden bundle.

## 2b. Shared service barrel reduction

**Files**
- `projects/shell/src/app/shared/services/index.ts`
- Runtime consumers importing from `@app/shared/services`, `@shared/services`, `src/app/shared/services`, or relative `../services` barrels

**Problem**
- The shared services barrel hides which consumers actually need `ApiService`, `SessionService`, `UIService`, or `StaticDataService`.
- It makes dependency search noisy and encourages broad imports from one synthetic entry point.

**Solution**
- Replace barrel imports with explicit service file imports.
- Shrink the barrel only after runtime consumers stop depending on it.

**Progress**
- Removed `BSHServices` entirely by inlining its only runtime use into `home/navigation/navigation.component.ts`.
- Replaced the first set of `@app/shared/services` runtime imports with explicit file imports for `SessionService`, `ApiService`, and `UIService` in build-green batches.
- Remaining barrel usage is now spec-only; runtime imports no longer depend on `shared/services/index.ts`.
- Removed `shared/services/index.ts` after converting the remaining shell spec imports to direct file imports.

**Benefits**
- Better locality: callers show their real dependency file instead of a synthetic barrel.
- Easier codemods: future service moves affect fewer unrelated imports.

## 3. Feature flag protocol deepening

**Files**
- `projects/shell/src/app/core/feature-flags/feature-flag.service.ts`
- `projects/shell/src/app/core/feature-flags/feature-flag.guard.ts`
- `projects/shell/src/app/core/feature-flags/feature-flow.guard.ts`
- `projects/shell/src/environments/environment*.ts`

**Problem**
- Feature Flag logic is split between environment configuration, service logic, and multiple guard/directive adapters.
- The interface currently asks callers to know both enablement and configured flow details.
- Configuration drift by subsidiary is easy because the seam is spread across environment files and route guards.

**Solution**
- Deepen the Feature Flag module into a workflow policy module that exposes a smaller interface such as "is this workflow available for this subsidiary?".
- Move configuration interpretation behind one seam and let guards/directives become thin adapters.

**Benefits**
- Better locality: subsidiary workflow rules sit behind one module.
- More leverage: routes, directives, and tests use the same interface and stop re-encoding policy concepts.

## 4. Remote configuration consolidation

**Files**
- `projects/swift/src/app/app.config.ts`
- `projects/onboarding/src/app/app.config.ts`
- `projects/customer360/src/app/app.config.ts`

**Problem**
- Each Remote MFE repeats the same Equity Auth setup through `provideRemoteAuthChannel()` and `remoteAuthInterceptor`.
- This seam is real — all remotes share it — but the implementation is repeated manually.

**Solution**
- Introduce a deeper Remote MFE bootstrap module or provider factory inside `equity-auth` or a remote-platform module.
- Let remotes opt into a single interface for shared auth and baseline runtime setup.

**Benefits**
- Better locality: remote bootstrap concerns are documented and implemented in one place.
- More leverage: new remotes add one adapter instead of repeating setup patterns.

## Recommended sequence

1. Session module decomposition
2. Feature flag protocol deepening
3. Remote configuration consolidation
4. Compat barrel removal

The first three modules create leverage by shrinking caller knowledge. The compat-barrel cleanup is still worthwhile, but its leverage is lower unless paired with a broader standalone-import cleanup campaign.
