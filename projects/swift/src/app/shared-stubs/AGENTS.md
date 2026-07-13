# Swift Shared Stubs Notes

## Overview
- `shared-stubs/` is a compatibility layer for Swift-only gaps. It is not a copy of shell shared code and should shrink as real shared contracts become available.

## Where to look
- Compatibility services: `services/index.ts`
- Shared static fallback data: `static/index.ts`
- Compat imports barrel: `compat-barrel.ts`, `compat-imports.ts`
- Stubbed documents-upload pieces: `documents-upload*/`
- Validators and pipes used by transaction screens: `validators/`, `translate.pipe.ts`, `pipes/`

## Conventions
- `projects/swift/tsconfig.app.json` resolves `@shared/*` to `src/shared/*` first, then falls back to `src/app/shared-stubs/*`.
- Prefer real shared contracts (`equity-auth`, true shared code under `src/shared/`) before extending a stub.
- The local `SessionService` adapter in `services/index.ts` now reads from `RemoteAuthStateService`; keep it thin and derived from remote auth state rather than recreating shell session logic.

## Anti-patterns
- Do not copy shell `SessionService` or shell shared modules into this directory.
- Do not add new long-lived business logic to stubs when a real shared module could own it.
- Do not assume stub data structures are authoritative; they are compatibility shims.

## Verification
- After changing anything under `shared-stubs/` that touches auth or transaction forms, run `pnpm ng build swift --configuration development`.
- If the stub change depends on shell-published auth state, also run `pnpm ng build shell --configuration development`.
