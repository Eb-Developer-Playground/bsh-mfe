# Equity Auth Flow

Equity Auth is the cross-MFE protocol for authentication state and commands. The Shell remains the owner of the browser session, token lifecycle, redirects, and logout HTTP calls. Remote MFEs consume the published state and emit commands through the Native Federation event registry.

```mermaid
sequenceDiagram
    autonumber
    participant Browser
    participant Shell as Shell SessionService
    participant Publisher as AuthStatePublisherService
    participant Registry as Native Federation Registry
    participant RemoteState as RemoteAuthStateService
    participant RemoteCommand as RemoteAuthCommandService
    participant Admin as Admin Portal Auth

    Browser->>Shell: boot shell
    Shell->>Shell: restore encrypted access_token / expires_at
    Shell->>Publisher: publishAuthState()
    Publisher->>Registry: update auth.state
    Registry-->>RemoteState: replay latest auth.state
    RemoteState-->>Browser: remote interceptors/components read auth signal

    alt remote needs login
        RemoteCommand->>Registry: emit auth.command login
        Registry-->>Shell: AuthCommandListenerService handles login
        Shell->>Admin: redirect to login with returnUrl, lang, bankId
    else remote needs logout
        RemoteCommand->>Registry: emit auth.command logout
        Registry-->>Shell: AuthCommandListenerService handles logout
        Shell->>Admin: POST /authorization/logout
        Shell->>Shell: clear encrypted session storage
        Shell->>Publisher: publish anonymous auth.state
        Publisher->>Registry: update auth.state
    else remote needs refresh
        RemoteCommand->>Registry: emit auth.command refresh
        Registry-->>Shell: AuthCommandListenerService handles updateSession
        Shell->>Admin: POST /oauth/microsoft grant_type=reissue_token
        Shell->>Shell: store encrypted access_token / expires_at
        Shell->>Publisher: publish authenticated auth.state
        Publisher->>Registry: update auth.state
    end
```

## Ownership boundaries

- Shell owns the session lifecycle, encrypted token storage, login redirect, logout call, token refresh, and the canonical `AuthState` projection.
- `equity-auth` owns shared protocol contracts and remote-side adapters:
  - `auth.state` for replayable state updates.
  - `auth.command` for remote-to-shell commands.
  - `RemoteAuthStateService` for remote signal state.
  - `RemoteAuthCommandService` for login/logout/refresh commands.
- Remotes must not read Shell session internals directly; they depend on `equity-auth` only.
