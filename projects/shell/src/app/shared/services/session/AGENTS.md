# Session Service Notes

## Overview
- This directory is the shell-owned session facade split into leaf services. Treat `session.service.ts` as a stable public adapter, not the place to re-concentrate logic.

## Where to look
- Session restore / auth-state build: `session-auth-transition.service.ts`
- Roles, permissions, feature flags: `session-authorization.service.ts`
- Encrypted storage: `session-storage.service.ts`
- JWT decode: `session-token-decoder.service.ts`
- Redirects / return URL / cross-app navigation: `session-navigation.service.ts`
- Timeout dialog flow: `session-inactivity.service.ts`
- Logout HTTP protocol: `session-logout.service.ts`
- Subsidiary + locale projections: `session-profile-projection.service.ts`

## Conventions
- Keep `SessionService` as a facade with backward-compatible getters/methods for existing shell callers.
- New session behavior should land in a leaf service first, then be delegated from `SessionService` only if existing callers need the facade API.
- Prefer typed interfaces (`ILoginResponse`, `IUserRole`, `IUserPermission`) over widening to `any`.
- `SessionService` currently exposes both signals and observable compatibility APIs; do not remove one casually without checking all shell callers.

## Anti-patterns
- Do not add new encryption or `localStorage` logic directly to `session.service.ts`.
- Do not reintroduce service barrels in this directory.
- Do not publish auth state from arbitrary callers; keep publication routed through the session/auth transition path.

## Verification
- After changes here, run `pnpm ng build shell --configuration development`.
- If the change affects auth behavior visible to remotes, also run `pnpm ng build swift --configuration development`.
- Existing Native Federation “No meta data found for shared lib …” warnings are noise unless paired with a new build error.
