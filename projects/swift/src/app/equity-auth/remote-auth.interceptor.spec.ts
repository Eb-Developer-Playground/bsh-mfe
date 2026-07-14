import { HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { AuthState, remoteAuthInterceptor } from 'equity-auth';
import type { NFEventRegistry } from '@softarc/native-federation-orchestrator/registry';

type RegistryWindow = Window & { __NF_REGISTRY__?: NFEventRegistry };

describe('remoteAuthInterceptor', () => {
  const registryWindow = window as RegistryWindow;
  const originalRegistry = registryWindow.__NF_REGISTRY__;

  afterEach(() => {
    registryWindow.__NF_REGISTRY__ = originalRegistry;
    TestBed.resetTestingModule();
  });

  it('attaches the latest shell access token to API requests', () => {
    registryWindow.__NF_REGISTRY__ = registryWithAuthState({
      status: 'authenticated',
      accessToken: 'token-123',
      tokenType: 'Bearer',
      expiresAt: 12345,
      user: null,
      bankId: '54',
      language: 'en-GB',
    });
    const request = new HttpRequest('GET', '/api/swift/messages');
    let forwardedRequest: HttpRequest<unknown> | undefined;
    const next: HttpHandlerFn = req => {
      forwardedRequest = req;
      return undefined as never;
    };

    TestBed.runInInjectionContext(() => remoteAuthInterceptor(request, next));

    expect(forwardedRequest?.headers.get('Authorization')).toBe('Bearer token-123');
  });

  it('does not attach tokens to federation metadata requests', () => {
    registryWindow.__NF_REGISTRY__ = registryWithAuthState({
      status: 'authenticated',
      accessToken: 'token-123',
      tokenType: 'Bearer',
      expiresAt: 12345,
      user: null,
      bankId: '54',
      language: 'en-GB',
    });
    const request = new HttpRequest('GET', '/remoteEntry.json');
    let forwardedRequest: HttpRequest<unknown> | undefined;
    const next: HttpHandlerFn = req => {
      forwardedRequest = req;
      return undefined as never;
    };

    TestBed.runInInjectionContext(() => remoteAuthInterceptor(request, next));

    expect(forwardedRequest?.headers.has('Authorization')).toBe(false);
  });
});

function registryWithAuthState(authState: AuthState): NFEventRegistry {
  return {
    register: async () => undefined,
    onReady: () => () => undefined,
    emit: () => undefined,
    update: () => undefined,
    on: <T>(_type: string, callback: (resource: { data: T; timestamp: number }) => void) => {
      callback({ data: authState as T, timestamp: 1 });
      return () => undefined;
    },
    clear: () => undefined,
  };
}
