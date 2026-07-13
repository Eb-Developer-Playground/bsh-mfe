import { TestBed } from '@angular/core/testing';
import {
  AUTH_COMMAND_CHANNEL,
  AuthCommand,
  RemoteAuthCommandService,
} from 'equity-auth';
import type { NFEventRegistry } from '@softarc/native-federation-orchestrator/registry';

type RegistryWindow = Window & { __NF_REGISTRY__?: NFEventRegistry };

describe('RemoteAuthCommandService', () => {
  const registryWindow = window as RegistryWindow;
  const originalRegistry = registryWindow.__NF_REGISTRY__;

  afterEach(() => {
    registryWindow.__NF_REGISTRY__ = originalRegistry;
    TestBed.resetTestingModule();
  });

  it('emits shell-owned auth commands', () => {
    const emittedCommands: AuthCommand[] = [];
    const registry: NFEventRegistry = {
      register: async () => undefined,
      onReady: () => () => undefined,
      emit: <T>(type: string, data: T) => {
        expect(type).toBe(AUTH_COMMAND_CHANNEL);
        emittedCommands.push(data as AuthCommand);
      },
      update: () => undefined,
      on: () => () => undefined,
      clear: () => undefined,
    };
    registryWindow.__NF_REGISTRY__ = registry;

    const service = TestBed.inject(RemoteAuthCommandService);

    service.login({ returnUrl: '/swift', reAuth: '1', bankId: '54' });
    service.refresh('54');
    service.logout();

    expect(emittedCommands).toEqual([
      { type: 'login', returnUrl: '/swift', reAuth: '1', bankId: '54' },
      { type: 'refresh', bankId: '54' },
      { type: 'logout' },
    ]);
  });

  it('does not fail when the shell registry is unavailable', () => {
    registryWindow.__NF_REGISTRY__ = undefined;

    const service = TestBed.inject(RemoteAuthCommandService);

    expect(() => service.logout()).not.toThrow();
  });
});
