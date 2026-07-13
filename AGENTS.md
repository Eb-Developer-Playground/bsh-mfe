# AGENTS.md

## What this repo is
- Angular 22 Native Federation monorepo with 4 apps and 1 shared auth library:
  - `projects/shell` — host app, owns session/auth state and creates `window.__NF_REGISTRY__` in `src/main.ts`
  - `projects/swift`, `projects/onboarding`, `projects/customer360` — remotes
  - `projects/equity-auth` — shared auth/event-channel library used by remotes and shell

## Commands that are actually useful
- Install: `pnpm install`
- Run all apps: `pnpm start:all`
- Run one app:
  - `pnpm ng serve shell`
  - `pnpm ng serve swift`
  - `pnpm ng serve onboarding`
  - `pnpm ng serve customer360`
- Build one app for verification:
  - `pnpm ng build shell --configuration development`
  - `pnpm ng build swift --configuration development`
  - `pnpm ng build onboarding --configuration development`
  - `pnpm ng build customer360 --configuration development`
- Build shared auth library: `pnpm ng build equity-auth`
- Run one test target: `pnpm ng test <project>`

## Ports and dev-server behavior
- Fixed dev-server ports live under each app's `serve-original` target in `angular.json`:
  - shell `4200`
  - customer360 `4201`
  - swift `4202`
  - onboarding `4203`
- The Native Federation `serve` target may use port `0` internally; prefer the explicit `ng serve <project>` workflow above instead of inferring random ports.

## Auth / federation wiring you should not miss
- Shell bootstrap creates the shared Native Federation event registry in `projects/shell/src/main.ts` before app bootstrap.
- Shell auth command intake is eagerly started via `ENVIRONMENT_INITIALIZER` in `projects/shell/src/app/app.config.ts`, which instantiates `AuthCommandListenerService`.
- Shell publishes auth state through `projects/shell/src/app/shared/equity-auth/auth-state-publisher.service.ts`.
- Remotes subscribe through `provideRemoteAuthChannel()` and attach auth headers with `remoteAuthInterceptor` in each remote `app.config.ts`.
- If you change auth/session behavior, verify **both** shell and swift builds at minimum. They are the fastest way to catch broken shared-auth assumptions.

## Session architecture (current state)
- `SessionService` in shell is now a facade over focused services in `projects/shell/src/app/shared/services/session/`.
- Key delegated seams already exist:
  - storage: `session-storage.service.ts`
  - token decode: `session-token-decoder.service.ts`
  - auth transition: `session-auth-transition.service.ts`
  - authorization: `session-authorization.service.ts`
  - navigation: `session-navigation.service.ts`
  - inactivity: `session-inactivity.service.ts`
  - logout: `session-logout.service.ts`
  - profile projection: `session-profile-projection.service.ts`
- Do not re-expand `SessionService`; add or adjust leaf services instead.

## Import / cleanup conventions specific to this repo
- `projects/shell/src/app/shared/services/index.ts` has been removed. Use direct service file imports; do not recreate service barrels.
- `projects/shell/src/app/shared/compat-barrel.ts` still exists but is being actively unwound. Prefer exact standalone imports in touched components; do not add new `COMPAT_IMPORTS` usage unless absolutely necessary.
- Many files were recently migrated from barrels to explicit imports. Before adding a convenience barrel back, search nearby files and follow the explicit-import direction.

## Swift-specific gotcha
- `projects/swift/tsconfig.app.json` maps `@shared/*` to `src/shared/*` first, then `src/app/shared-stubs/*`.
- Those `shared-stubs` are a compatibility layer, not a signal to copy shell internals into Swift. Prefer consuming `equity-auth` for auth state and only extend stubs when the remote truly lacks a shell-owned implementation.

- Keep components small and focused on a single responsibility
- Do NOT use constructor DI with `private` when the dependency is used in a class field initializer. Move field init to constructor body or use `inject()`.
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Prefer inline templates for small components
- Prefer Signal Forms (`@angular/forms/signals`) for new forms. They are stable in Angular v22+ and provide signal-based state, type-safe field access, and schema-based validation
- When not using Signal Forms, prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- When using external templates/styles, use paths relative to the component TS file.
- `TranslateModule` is NOT exported from `@ngx-translate/core` v18+. Use `TranslatePipe` instead in `imports` arrays.

### Migration Patterns

When converting NgModule-based components to standalone in Angular v22:
- Add `imports` array to @Component (do NOT set `standalone: true`)
- Replace `TranslateModule` with `TranslatePipe` in imports
- Replace `@angular/flex-layout` attributes (`fxLayout`, `fxFlex`, `fxLayoutAlign`, `fxLayoutGap`) with CSS classes
- Replace `moment` with native `Date` methods
- Move class field initializers that reference constructor-injected dependencies into the constructor body
- Use bracket notation for `queryParams` access (`queryParams['key']` not `queryParams.key`)
- Use bracket notation for form control access when using `ReturnType<UntypedFormBuilder['group']>` typing
## Verification expectations for agent edits
- For shell auth/session changes: run `pnpm ng build shell --configuration development`.
- For remote auth or Swift changes: also run `pnpm ng build swift --configuration development`.
- Native Federation builds emit many `No meta data found for shared lib ...` warnings; treat them as existing noise unless a new error accompanies them.

## Source files worth reading before risky changes
- `projects/shell/src/main.ts`
- `projects/shell/src/app/app.config.ts`
- `projects/shell/src/app/shared/equity-auth/auth-command-listener.service.ts`
- `projects/shell/src/app/shared/services/session/session.service.ts`
- `projects/equity-auth/src/lib/*.ts`
- `projects/*/src/app/app.config.ts` for remote auth wiring

## Local sub-guides
- `projects/shell/src/app/shared/services/session/AGENTS.md` — shell session facade + leaf-service seam rules
- `projects/equity-auth/src/lib/AGENTS.md` — auth channel contract and remote auth library guidance
- `projects/swift/src/app/shared-stubs/AGENTS.md` — Swift compatibility-layer rules and when not to extend stubs
