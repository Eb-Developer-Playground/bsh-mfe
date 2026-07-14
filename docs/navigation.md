# Navigation

This repo uses a **shell-owned Angular Router model** for navigation.

Navigation is owned by the **Shell** through Angular Router, and the Shell decides when to:

- render a local page
- load a remote MFE through Native Federation
- send the user to an external portal URL
- redirect to login when session state is missing or expired

The important consequence is that the shell exposes a fixed top-level route structure and the left navigation builds links directly from environment URLs plus current session context.

## The actual entrypoints

### Shell routing

Top-level navigation starts in:

- `projects/shell/src/app/app.routes.ts`

The shell owns the root route tree:

- `''` → guarded shell home
- `'customer360'` → lazy remote component
- `'onboarding'` → lazy remote component
- `'swift'` → lazy remote child routes
- `**` → redirect back to `''`

The key pattern is:

- **Shell owns top-level route mounting**
- **Remotes own their internal route trees once mounted**

Examples:

- `customer360` is loaded with `loadRemoteModule('customer360', './Component')`
- `onboarding` is loaded with `loadRemoteModule('onboarding', './Component')`
- `swift` is loaded with `loadRemoteModule('swift', './Routes')`

That difference matters: Swift exposes routes, while Customer360 and Onboarding currently expose a root component.

### Remote routing

Remote entry routes live in:

- `projects/swift/src/app/app.routes.ts`
- `projects/onboarding/src/app/app.routes.ts`
- `projects/customer360/src/app/app.routes.ts`

Current shape:

- `swift` has its own internal routing for `dashboard` and `services`
- `onboarding` routes are currently empty
- `customer360` routes are currently empty

So for this repo today, **the shell route contract is the important navigation API**.

## The shell navigation menu

The left navigation is built in:

- `projects/shell/src/app/home/navigation/navigation.component.ts`

This is the real menu source of truth now that `BSHServices` has been removed.

`NavigationComponent` builds menu items from:

- `SessionService.user.reissue`
- `SessionService.userBank`
- `SessionProfileProjectionService.getCurrentLanguage()`
- environment URLs such as:
  - `swiftUrl`
  - `customerOnboardingUrl`
  - `adminPortalUrl`
  - `cardsPortalUrl`

The menu has two different link styles:

- **internal shell navigation** uses `[routerLink]`
- **external portal navigation** uses `[href]`

That distinction is encoded by `sub_menu` on `MenuItem`.

### Current menu shape

The current shell menu is effectively:

- `MENU.MY-DASHBOARD` → internal route `/dashboard`
- `MENU.MORE` → collapsible parent
  - `MENU.CUSTOMER-MAIN` → external URL
  - `MENU.CUSTOMER-ONBOARDING` → external URL
  - `MENU.CUSTOMER-SWIFT` → external URL
  - `MENU.CARD-PORTAL` → external URL

This means the shell is currently mixing:

- host-rendered route navigation
- federated remote mounting
- full-page external portal jumps

in the same nav component.

## Service portal cards

There is also a second navigation surface in:

- `projects/shell/src/app/home/service-portal/service-portal.ts`

This defines static service cards with routes like:

- `/onboarding`
- `/customer360`
- `/swift`

These are shell-owned entry routes to remote MFEs.

## Auth-gated navigation

The shell auth guard is:

- `projects/shell/src/app/shared/guards/auth.guard.ts`

This is the load-bearing route protection behavior.

What it does:

1. allows navigation immediately when `environment.bypassAuth` is enabled
2. checks query params for:
   - `rt`
   - `bankId`
   - `lang`
3. when `rt` exists, exchanges it for an access token via `SessionService.updateSession()`
4. strips the query string and redirects back to the clean route after successful auth
5. persists the original URL via `SessionService.setUrlParameter()` before forcing login when no valid session exists

So navigation protection in this repo is **not** a simple `isLoggedIn` gate. It is part of the login return flow from the admin portal.

## Breadcrumb/title metadata

The shell route entries carry route data such as:

- `title`
- `breadcrumb`

This is how shell-owned navigation surfaces label the route once mounted.

If a route is added at the shell level and should participate in breadcrumb/title behavior, it should follow the same route-data pattern.

## Feature-flag route gating

Feature flags are separate from auth, but they affect navigability at the route layer.

Relevant files:

- `projects/shell/src/app/core/feature-flags/feature-flag.service.ts`
- `projects/shell/src/app/core/feature-flags/feature-flag.guard.ts`
- `projects/shell/src/app/core/feature-flags/feature-flow.guard.ts`

The important project-specific rule is:

- **feature gating is shell-owned and subsidiary-aware**

Route guards derive the current subsidiary from `SessionService.subsidiary`, then evaluate `environment.featureFlags` through `FeatureFlagService`.

There are two different checks:

- `featureFlagGuard` → feature enabled for subsidiary
- `featureFlowGuard` → feature enabled **and** exact configured flow matches

That means navigation availability in this repo depends on two separate shell-owned concerns:

- auth/session validity
- feature/subsidiary policy

## Architectural boundary

Navigation contracts in this repo are defined by:

- shell routes in `projects/shell/src/app/app.routes.ts`
- remote internal routes inside each mounted MFE
- shell menu generation in `projects/shell/src/app/home/navigation/navigation.component.ts`

So if navigation changes, update the shell route tree or shell menu-building logic first, then adjust remote internal routes only where needed.

## Practical rules for future edits

- Add top-level remote mounting routes in `projects/shell/src/app/app.routes.ts`
- Update shell menu generation in `projects/shell/src/app/home/navigation/navigation.component.ts` when changing user-facing navigation
- Preserve the distinction between `[routerLink]` and `[href]` menu items
- If auth flow changes, re-check `auth.guard.ts` because navigation and login-return handling are coupled
- If feature gating changes, re-check both `featureFlagGuard` and `featureFlowGuard`
- For navigation changes that affect federated auth assumptions, verify both:
  - `pnpm ng build shell --configuration development`
  - `pnpm ng build swift --configuration development`
