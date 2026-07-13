# Shallow Modules Analysis: Architecture Deepening Opportunities

**Repository**: bsh-mfe (Angular Native Federation Monorepo)  
**Date**: 2026-07-12  
**Scope**: Shell/shared modules, session/auth flow, compatibility barrels, pass-through modules

---

## Executive Summary

This analysis identifies **5 shallow modules** where understanding one concept requires bouncing across many files — violating **locality** (the principle that related code should be co-located). Each candidate fails the **deletion test**: removing it breaks many consumers, but the module itself contains little cohesive logic — it's a **seam** or **pass-through** that distributes implementation across the codebase without providing **leverage**.

**Current status note**: this document describes the canonical `equity-auth` protocol module used by the Shell and each Remote MFE.

---

## Vocabulary

| Term | Meaning in This Analysis |
|------|--------------------------|
| **Module** | A cohesive unit of code (service, NgModule, library, barrel) with a single responsibility |
| **Interface** | The public contract (types, tokens, channels) that consumers depend on |
| **Implementation** | The private logic that fulfills the interface |
| **Seam** | A boundary where two modules meet — often a channel, token, or shared type |
| **Leverage** | The ratio of value provided to complexity introduced. High leverage = small code, big impact |
| **Locality** | How close related code lives together. Poor locality = bouncing across files to understand one concept |
| **Deletion Test** | "If I delete this module, what breaks?" — reveals whether a module is a true abstraction or just glue |

---

## Candidate 1: CompatImportsModule (Compat Barrel)

### File Cluster
```
/projects/shell/src/app/shared/compat-barrel.ts (130 lines)
```

### What It Is
An `NgModule` that imports and re-exports **60+ Angular Material, CDK, Flex Layout, and Angular modules** — everything from `MatAutocompleteModule` to `MatTreeModule`, plus `CommonModule`, `FormsModule`, `RouterLink`, `TranslatePipe`, etc.

### Why Locality Is Poor
- **Zero cohesion**: A component importing `COMPAT_IMPORTS` gets 60 modules whether it needs 1 or 60
- **No intent revelation**: Reading a component's imports tells you nothing about what it actually uses
- **Change amplification**: Adding a new Material module requires editing this central file, touching all consumers' compilation
- **Tree-shaking defeat**: All 60 modules enter the bundle graph even if unused

### Deletion Test
```
DELETE compat-barrel.ts → 40+ shell components fail to compile
```
But no *logic* is lost — only import statements. The module provides **zero leverage**; it's pure indirection.

### Deepening Opportunity
**Replace with direct standalone imports** in each component. Angular v22+ defaults to standalone components — the `NgModule` wrapper is legacy baggage. Each component should import exactly what it uses:
```typescript
// Instead of: imports: [COMPAT_IMPORTS]
// Do:
imports: [MatButtonModule, MatIconModule, RouterLink, TranslatePipe]
```
**Leverage gained**: Explicit dependencies, better tree-shaking, faster compilation, readable intent.

---

## Candidate 2: Equity-Auth Library (Distributed Auth Seam)

### File Cluster
```
/projects/equity-auth/src/lib/
  ├── auth-state.model.ts       (34 lines)  ← Interface
  ├── auth-command.model.ts     (8 lines)   ← Interface
  ├── auth-event-registry.ts    (10 lines)  ← Seam (channel names + registry access)
  ├── remote-auth-state.service.ts (52 lines)  ← Remote MFE implementation
  ├── remote-auth-command.service.ts (23 lines)  ← Remote MFE implementation
  └── remote-auth.interceptor.ts (30 lines)  ← Remote MFE implementation

/projects/shell/src/app/shared/equity-auth/
  ├── auth-state-publisher.service.ts (10 lines)  ← Shell implementation
  └── auth-command-listener.service.ts (37 lines)  ← Shell implementation

/projects/shell/src/app/shared/services/session/
  ├── session.service.ts (647 lines)  ← Core auth state + logic
  ├── session.resolver.ts (32 lines)
  └── session.resolver.ts (32 lines)

/projects/shell/src/app/shared/guards/
  └── auth.guard.ts (70 lines)
```

### What It Is
A **distributed seam** for cross-MFE authentication. The `equity-auth` library defines the **interface** (types, channel names, interceptor function), but the **implementation** is split:
- **Shell** owns: `SessionService` (token storage, login/logout, refresh), `AuthStatePublisherService` (pushes state to federation registry), `AuthCommandListenerService` (receives commands from remotes)
- **Each remote MFE** (swift, customer360, onboarding) owns: `RemoteAuthStateService` (subscribes to shell's auth state), `RemoteAuthCommandService` (sends login/logout/refresh commands), `remoteAuthInterceptor` (attaches token to HTTP requests)

### Why Locality Is Poor
To understand "how does a SWIFT request get an auth token?" you must trace:
1. `swift/app.config.ts` → imports `provideRemoteAuthChannel()` + `remoteAuthInterceptor`
2. `equity-auth/remote-auth.interceptor.ts` → injects `RemoteAuthStateService` → reads `accessToken`
3. `equity-auth/remote-auth-state.service.ts` → subscribes to `AUTH_STATE_CHANNEL` via federation registry
4. `shell/auth-state-publisher.service.ts` → publishes to `AUTH_STATE_CHANNEL` via federation registry
5. `shell/auth-command-listener.service.ts` → listens to `AUTH_COMMAND_CHANNEL` → calls `SessionService.login/logout/updateSession`
6. `shell/session.service.ts` → manages tokens, encrypts storage, decodes JWT, computes roles/permissions, publishes state via `AuthStatePublisherService`

**7 files across 3 projects** to understand one auth flow. The **interface** is in `equity-auth`, but the **behavior** is scattered.

### Deletion Test
```
DELETE equity-auth library → Shell + Swift + Customer360 + Onboarding all break
```
But the library itself is ~100 lines of types + 1 interceptor function. The real logic lives in shell (647 lines) and each remote. The library is a **thin seam** — necessary for federation, but a locality sinkhole.

### Deepening Opportunity
**Option A: Consolidate shell-side auth into a single `AuthFacade` service**  
Merge `SessionService` + `AuthStatePublisherService` + `AuthCommandListenerService` into one coherent module with clear public API. The session service currently mixes:
- Token storage/encryption (infrastructure)
- JWT decoding (parsing)
- Role/permission computation (domain logic)
- Feature flags (domain logic)
- Inactivity dialog (UI concern)
- Auth state publishing (federation seam)

**Option B: Make equity-auth a true "protocol" library**  
Move the federation channel logic *into* equity-auth as a proper `AuthChannel` service that both shell and remotes consume, rather than each side reimplementing registry subscription/emission.

**Leverage gained**: Single place to read the auth protocol; shell auth logic becomes testable in isolation; remotes become thinner.

---

## Candidate 3: SessionService (God Service)

### File Cluster
```
/projects/shell/src/app/shared/services/session/session.service.ts (647 lines)
```

### What It Is
A single `@Injectable` service that handles:
- Encrypted localStorage token management (AES encryption/decryption with legacy fallback)
- JWT decoding (`jwt-decode`)
- Login/logout/token refresh orchestration
- Session expiry tracking (moment.js)
- Role/permission computation (v1 vs v2 auth versions)
- Feature role/flag evaluation
- Inactivity countdown dialog (MatDialog)
- Auth state publishing to federation (`AuthStatePublisherService`)
- URL parameter management (return URLs, reissue tokens)
- Bank/subsidiary/locale resolution

### Why Locality Is Poor
- **7+ responsibilities** in one class — violates Single Responsibility Principle
- **Dual API surface**: Exposes both `Observable` (`isActive$`, `onChanged$`) AND `Signal` (`isActiveSignal`, `onChangedSignal`) for the same state
- **Mixed concerns**: Encryption, HTTP calls, UI dialogs, federation publishing, domain logic all intertwined
- **Testing burden**: Mocking `SessionService` requires faking HttpClient, MatDialog, Router, EncryptionService, LoaderService, localStorage, moment, jwt-decode

### Deletion Test
```
DELETE session.service.ts → AuthGuard, SessionResolver, AuthCommandListener, AuthStatePublisher, Home, BSHServices, and 20+ components all break
```
But the *concepts* (token storage, JWT parsing, role computation, federation publishing) don't disappear — they're just glued together.

### Deepening Opportunity
**Decompose into focused services with clear interfaces:**
```
TokenStorageService      → encrypt/decrypt, localStorage, expiry tracking
JwtTokenParser           → decode, extract claims, validate expiry
AuthStateMachine         → login/logout/refresh transitions, status enum
RolePermissionService    → compute roles/permissions from token claims
FeatureFlagService       → evaluate feature roles/flags
FederationAuthPublisher  → publish AuthState to NF registry
InactivityMonitor        → dialog + timeout logic (UI concern)
SessionFacade            → public API composing above (what components inject)
```
**Leverage gained**: Each piece is independently testable, replaceable, and readable. The `SessionFacade` becomes a thin **pass-through** (like BSHServices) but with *intentional* composition — not accidental accumulation.

---

## Candidate 4: BSHServices (Pass-Through Module)

### File Cluster
```
/projects/shell/src/app/shared/services/bsh-services.ts (78 lines)
```

### What It Is
A service that injects `SessionService` and exposes:
- `lang` getter → reads `localStorage['user-locale']`
- `MENU_ITEMS` getter → builds menu URLs using `SessionService.user.reissue`, environment URLs, bankId

### Why Locality Is Poor
- **Zero logic**: Every getter delegates to `SessionService` or `localStorage` or `environment`
- **Indirection without abstraction**: Consumers inject `BSHServices` instead of `SessionService` + `Environment` directly
- **Hidden coupling**: `MENU_ITEMS` builds URLs with hardcoded query params (`rt`, `bankId`, `lang`) — this logic is buried in a getter, not testable in isolation

### Deletion Test
```
DELETE bsh-services.ts → Only Home component and maybe 1-2 others break (they inject BSHServices for menu)
```
The *logic* (URL building, locale reading) is 5 lines of actual code. The other 73 lines are boilerplate.

### Deepening Opportunity
**Inline the logic where used** or extract a pure function:
```typescript
// shared/utils/menu-urls.ts
export function buildMenuUrls(session: SessionService, env: Environment): MenuItem[] { ... }
```
**Leverage gained**: Pure function = testable, no DI, no lifecycle, no mocking. Components import the function directly — **locality restored**.

---

## Candidate 5: Shared Services Barrel + Interceptors Barrel (Re-Export Barrels)

### File Clusters
```
/projects/shell/src/app/shared/services/index.ts (6 lines)
/projects/shell/src/app/shared/interceptors/index.ts (4 lines)
```

### What They Are
Pure re-export barrels:
```typescript
// services/index.ts
export { AccountService } from './account/account.service';
export { ApiService } from './api.service';
export { SessionService } from './session/session.service';
export { StaticDataService } from './static-data.service';
export { TimeoutService } from './timeout/timeout.service';
export { UIService } from './ui.service';

// interceptors/index.ts
export { ErrorInterceptor } from './error.interceptor';
export { HttpHeaderInterceptor } from './http-header.interceptor';
export { LoaderInterceptor } from './loader.interceptor';
export { NetworkSpeedInterceptor } from './network-speed.interceptor';
```

### Why Locality Is Poor
- **Hides module structure**: Consumers import from `@app/shared/services` — they don't know `SessionService` lives in `session/session.service.ts` while `AccountService` is in `account/account.service.ts`
- **Prevents tree-shaking**: Barrel exports pull in all side effects (though Angular DI is lazy, the import graph is opaque)
- **Zero leverage**: 10 lines of code, 0 logic. Just `export * from ...`

### Deletion Test
```
DELETE both barrels → ~30 import statements across shell change from:
  import { SessionService } from '@app/shared/services'
to:
  import { SessionService } from '@app/shared/services/session/session.service'
```
No logic lost. Only path length changes.

### Deepening Opportunity
**Remove barrels; use explicit relative paths or path aliases**. In a standalone component world, barrels are an anti-pattern — they obscure the true dependency graph. If a component needs `SessionService`, it should import from its actual location.

**Leverage gained**: Transparent dependency graph, easier refactoring (move file → update imports), no "phantom" coupling via barrel.

---

## Summary Table

| # | Module | Type | Files Touched | Deletion Impact | Leverage | Locality Score (1-5) |
|---|--------|------|---------------|-----------------|----------|---------------------|
| 1 | CompatImportsModule | Compatibility barrel (NgModule) | 1 file, 60+ exports | 40+ components break compilation | 0 (negative) | 1 |
| 2 | Equity-Auth Library | Distributed seam (protocol lib) | 11 files across 4 projects | All MFEs lose auth integration | Low (thin interface) | 2 |
| 3 | SessionService | God service | 1 file, 647 lines | AuthGuard, Resolver, 20+ components break | Medium (does too much) | 1 |
| 4 | BSHServices | Pass-through service | 1 file, 78 lines | Home component + few others | 0 (pure delegation) | 2 |
| 5 | Services/Interceptors Barrels | Re-export barrels | 2 files, 10 lines | Import path updates only | 0 | 3 |

---

## Recommended Deepening Sequence

1. **CompatImportsModule** → Highest impact, lowest risk. Delete → replace with direct standalone imports. Immediate bundle size and DX win.
   - **Progress**: first leaf batch migrated off `COMPAT_IMPORTS` (`HeaderComponent`, `LoaderComponent`, `NotificationsComponent`, `TicketNoteComponent`), the first dialog batch is now explicit (`RadioOptionsDialog`, `RestrictedCountryDialog`, `TimeoutDialog`, `QuestionDialog`, `ImagePreviewDialog`), the next small shared-component batch is explicit (`InfoBoxComponent`, `FileBoxComponent`, `ListItemComponent`), and two components now have no compat dependency at all (`SmallLoadingSpinnerComponent`, `SkeletonLoaderComponent`).

2. **BSHServices** → Trivial to inline/extract. Pure function replacement. Zero risk.
   - **Progress**: completed. `BSHServices` was deleted and its only runtime use was inlined into `home/navigation/navigation.component.ts`.

3. **Shared Barrels** → Mechanical cleanup. Improves code navigation.
   - **Progress**: completed for shell shared services. Runtime and spec-file imports were converted to direct file imports, and `projects/shell/src/app/shared/services/index.ts` was removed.

4. **SessionService** → Requires careful decomposition. Start by extracting `TokenStorageService` and `JwtTokenParser` (pure, no DI). Then `RolePermissionService`. Finally `FederationAuthPublisher`. Keep `SessionFacade` as the public API.
   - **Progress**: substantially completed. The facade now delegates to storage, token decoding, auth transition, authorization, navigation, inactivity, logout, and profile projection services.

5. **Equity-Auth Library** → Architectural decision. Either:
   - **Thicken the library**: Move federation channel logic into equity-auth as `AuthChannelService` (both shell and remotes inject it)
   - **Thin the library further**: Make it purely types + channel constants; document the protocol as a contract; let each side implement independently

---

## Documentation Update

This analysis should be referenced in:
- `docs/adr/0001-equity-auth-protocol.md`
- `docs/architecture/DEEPENING-ROADMAP.md`
