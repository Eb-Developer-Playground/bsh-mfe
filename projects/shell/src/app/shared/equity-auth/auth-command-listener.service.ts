import { Injectable, inject } from '@angular/core';
import { AUTH_COMMAND_CHANNEL, AuthCommand, getNativeFederationRegistry } from 'equity-auth';
import type { NFEventUnsubscribe } from '@softarc/native-federation-orchestrator/registry';

import { SessionService } from '../services/session/session.service';

@Injectable({ providedIn: 'root' })
export class AuthCommandListenerService {
  private readonly session = inject(SessionService);
  private readonly unsubscribe: NFEventUnsubscribe | undefined;

  constructor() {
    this.unsubscribe = getNativeFederationRegistry()?.on<AuthCommand>(
      AUTH_COMMAND_CHANNEL,
      ({ data }) => this.handleCommand(data),
      { replay: 0 }
    );
  }

  dispose(): void {
    this.unsubscribe?.();
  }

  private handleCommand(command: AuthCommand): void {
    if (command.type === 'login') {
      this.session.login(command.returnUrl, command.reAuth, command.bankId);
      return;
    }

    if (command.type === 'logout') {
      this.session.logout().subscribe();
      return;
    }

    this.session.updateSession(undefined, command.bankId).subscribe();
  }
}
