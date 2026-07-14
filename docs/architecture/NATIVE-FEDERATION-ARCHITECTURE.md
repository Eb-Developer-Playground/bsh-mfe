# Native Federation Architecture

The workspace uses Angular Native Federation for loading independently built MFEs and the Native Federation Orchestrator event registry for cross-MFE auth communication.

```mermaid
flowchart LR
    subgraph ShellApp[Shell application]
        Main[main.ts]
        Routes[app.routes.ts]
        Session[SessionService]
        Listener[AuthCommandListenerService]
        Publisher[AuthStatePublisherService]
    end

    subgraph Registry[window.__NF_REGISTRY__]
        StateChannel[auth.state]
        CommandChannel[auth.command]
    end

    subgraph EquityAuth[equity-auth library]
        Contracts[AuthState / AuthCommand contracts]
        RemoteState[RemoteAuthStateService]
        RemoteCommands[RemoteAuthCommandService]
        Interceptor[remoteAuthInterceptor]
    end

    subgraph Remotes[Remote MFEs]
        Customer360[customer360]
        Onboarding[onboarding]
        Swift[swift]
    end

    Main -->|initFederation federation.manifest.json| Routes
    Main -->|createRegistry| Registry
    Routes -->|loadRemoteModule customer360 ./Component| Customer360
    Routes -->|loadRemoteModule onboarding ./Component| Onboarding
    Routes -->|loadRemoteModule swift ./Routes| Swift

    Session -->|create AuthState| Publisher
    Publisher -->|update| StateChannel
    CommandChannel -->|on auth.command| Listener
    Listener -->|login/logout/updateSession| Session

    Remotes -->|provideRemoteAuthChannel| RemoteState
    Remotes -->|HTTP auth header| Interceptor
    Remotes -->|login/logout/refresh| RemoteCommands

    RemoteState -->|subscribe replay 1| StateChannel
    RemoteCommands -->|emit| CommandChannel
    Contracts --- Session
    Contracts --- Remotes
```

## Loading model

- `projects/shell/src/main.ts` creates `window.__NF_REGISTRY__` before calling `initFederation('federation.manifest.json')`.
- `projects/shell/src/app/app.routes.ts` lazy-loads remotes with `loadRemoteModule`.
- The Shell route guard protects the Shell-owned route tree before remotes are loaded.

## Auth communication model

- `auth.state` is stateful and replayed so remotes can receive the latest Shell auth projection after boot.
- `auth.command` is command-oriented and does not persist command history beyond the registry replay settings.
- The protocol library is intentionally named `equity-auth` because it represents the shared Equity authentication contract, not a Shell-private implementation detail.
