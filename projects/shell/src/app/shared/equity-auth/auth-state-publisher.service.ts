import { Injectable } from '@angular/core';
import { AUTH_STATE_CHANNEL, AuthState, getNativeFederationRegistry } from 'equity-auth';


@Injectable({ providedIn: 'root' })
export class AuthStatePublisherService {
  publish(state: AuthState): void {
    getNativeFederationRegistry()?.update<AuthState>(AUTH_STATE_CHANNEL, () => state);
  }
}
