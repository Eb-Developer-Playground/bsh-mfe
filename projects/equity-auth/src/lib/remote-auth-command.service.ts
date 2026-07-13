import { Injectable } from '@angular/core';

import { AuthCommand } from './auth-command.model';
import { AUTH_COMMAND_CHANNEL, getNativeFederationRegistry } from './auth-event-registry';

@Injectable({ providedIn: 'root' })
export class RemoteAuthCommandService {
  login(command: Omit<AuthCommand, 'type'> = {}): void {
    this.emit({ ...command, type: 'login' });
  }

  logout(): void {
    this.emit({ type: 'logout' });
  }

  refresh(bankId?: string): void {
    this.emit({ type: 'refresh', bankId });
  }

  private emit(command: AuthCommand): void {
    getNativeFederationRegistry()?.emit<AuthCommand>(AUTH_COMMAND_CHANNEL, command);
  }
}
