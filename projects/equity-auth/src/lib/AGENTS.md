# Equity Auth Library Notes

## Overview
- This library is the cross-MFE auth contract. It does not own shell session state; it defines the Native Federation channels, remote auth subscriber, command emitter, and auth header interceptor.

## Where to look
- Channel names + registry access: `auth-event-registry.ts`
- Shared auth payload shape: `auth-state.model.ts`
- Auth commands: `auth-command.model.ts`, `remote-auth-command.service.ts`
- Remote auth subscription bootstrap: `remote-auth-state.service.ts`
- Header attachment: `remote-auth.interceptor.ts`

## Conventions
- Keep this library focused on cross-app auth communication. Shell-specific orchestration belongs in `projects/shell/src/app/shared/equity-auth/` or shell session services.
- `provideRemoteAuthChannel()` is the expected remote bootstrap entrypoint; remote apps should not instantiate registry plumbing themselves.
- The interceptor intentionally skips asset/federation metadata URLs. Preserve those exclusions when changing request logic.

## Anti-patterns
- Do not make this library depend on shell-only services or shell directory structure.
- Do not duplicate channel strings outside `auth-event-registry.ts`.
- Do not assume remotes create their own registry; the shell sets `window.__NF_REGISTRY__` first.

## Verification
- Build this library with `pnpm ng build equity-auth` when changing public exports or remote auth services.
- If auth channel behavior changes, verify at least one remote (`swift`) and the shell build together.
