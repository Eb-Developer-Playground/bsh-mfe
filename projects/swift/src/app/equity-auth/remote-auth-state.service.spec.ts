import { TestBed } from '@angular/core/testing';
import {
  AUTH_STATE_CHANNEL,
  AuthState,
  RemoteAuthStateService,
} from 'equity-auth';
import type { NFEventConsumer, NFEventData, NFEventRegistry } from '@softarc/native-federation-orchestrator/registry';

type RegistryWindow = Window & { __NF_REGISTRY__?: NFEventRegistry };

describe('RemoteAuthStateService', () => {
  const registryWindow = window as RegistryWindow;
  const originalRegistry = registryWindow.__NF_REGISTRY__;

  afterEach(() => {
    registryWindow.__NF_REGISTRY__ = originalRegistry;
    TestBed.resetTestingModule();
  });

  it('starts as unknown when the shell registry is unavailable', () => {
    registryWindow.__NF_REGISTRY__ = undefined;

    const service = TestBed.inject(RemoteAuthStateService);

    expect(service.authState().status).toBe('unknown');
    expect(service.isAuthenticated()).toBe(false);
  });

  it('subscribes to replayed auth state from the shell', () => {
    const authState: AuthState = {
      status: 'authenticated',
      accessToken: 'token-123',
      tokenType: 'Bearer',
      expiresAt: 12345,
      user: {
        sub: 'user-1',
        username: 'user@example.com',
        displayName: 'User Example',
        bankId: '54',
        roles: ['Maker'],
      },
      bankId: '54',
      language: 'en-GB',
    };
    let subscribedType = '';
    let replayOptions: { replay?: number } | undefined;
    registryWindow.__NF_REGISTRY__ = {
      register: async () => undefined,
      onReady: () => () => undefined,
      emit: () => undefined,
      update: () => undefined,
      on: <T>(
        type: string,
        callback: NFEventConsumer<NFEventData<T>>,
        opts?: { replay?: number }
      ) => {
        subscribedType = type;
        replayOptions = opts;
        callback({ data: authState as T, timestamp: 1 });
        return () => undefined;
      },
      clear: () => undefined,
    };

    const service = TestBed.inject(RemoteAuthStateService);

    expect(subscribedType).toBe(AUTH_STATE_CHANNEL);
    expect(replayOptions).toEqual({ replay: 1 });
    expect(service.authState()).toEqual(authState);
    expect(service.accessToken).toBe('token-123');
    expect(service.isAuthenticated()).toBe(true);
  });
});
