import {
  computed,
  ENVIRONMENT_INITIALIZER,
  EnvironmentProviders,
  inject,
  Injectable,
  makeEnvironmentProviders,
  signal,
} from '@angular/core';
import type { NFEventUnsubscribe } from '@softarc/native-federation-orchestrator/registry';

import { AUTH_STATE_CHANNEL, getNativeFederationRegistry } from './auth-event-registry';
import { AuthState, UNKNOWN_AUTH_STATE } from './auth-state.model';

@Injectable({ providedIn: 'root' })
export class RemoteAuthStateService {
  private readonly state = signal<AuthState>(UNKNOWN_AUTH_STATE);
  private readonly unsubscribe: NFEventUnsubscribe | undefined;

  readonly authState = this.state.asReadonly();
  readonly isAuthenticated = computed(
    () => this.state().status === 'authenticated' && !!this.state().accessToken
  );

  constructor() {
    this.unsubscribe = getNativeFederationRegistry()?.on<AuthState>(
      AUTH_STATE_CHANNEL,
      ({ data }) => {
        console.log({DAZOTIZO: data})
        return this.state.set(data);
      },
      { replay: 1 }
    );
  }

  get accessToken(): string | null {
    return this.state().accessToken;
  }

  dispose(): void {
    this.unsubscribe?.();
  }
}

export function provideRemoteAuthChannel(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: ENVIRONMENT_INITIALIZER,
      multi: true,
      useValue: () => {
        inject(RemoteAuthStateService);
      },
    },
  ]);
}
