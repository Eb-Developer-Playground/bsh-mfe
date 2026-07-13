import type { NFEventRegistry } from '@softarc/native-federation-orchestrator/registry';
import { TestBed } from '@angular/core/testing';

import { ANONYMOUS_AUTH_STATE, AUTH_STATE_CHANNEL, AuthState } from 'equity-auth';
import { AuthStatePublisherService } from './auth-state-publisher.service';

describe('AuthStatePublisherService', () => {
  const originalRegistry = window.__NF_REGISTRY__;

  afterEach(() => {
    window.__NF_REGISTRY__ = originalRegistry;
    TestBed.resetTestingModule();
  });

  it('publishes auth state to the Native Federation state channel', () => {
    let publishedType = '';
    let stateFactory: ((last: AuthState | undefined) => AuthState) | undefined;
    const registry: NFEventRegistry = {
      register: async <T>(_type: string, _resource: T | (() => Promise<T> | T)) => undefined,
      onReady: <T>(_type: string, _callback: (resource: T) => void) => () => undefined,
      emit: <T>(_type: string, _data: T) => undefined,
      update: <T>(type: string, callback: (last: T | undefined) => T) => {
        publishedType = type;
        stateFactory = last => callback(last as T | undefined) as AuthState;
      },
      on: <T>(_type: string, _callback: (resource: { data: T; timestamp: number }) => void) => () => undefined,
      clear: (_type?: string) => undefined,
    };
    window.__NF_REGISTRY__ = registry;

    const service = TestBed.inject(AuthStatePublisherService);

    service.publish(ANONYMOUS_AUTH_STATE);

    expect(publishedType).toBe(AUTH_STATE_CHANNEL);
    expect(stateFactory?.(undefined)).toEqual(ANONYMOUS_AUTH_STATE);
  });

  it('does not fail when the registry is unavailable', () => {
    window.__NF_REGISTRY__ = undefined;

    const service = TestBed.inject(AuthStatePublisherService);

    expect(() => service.publish(ANONYMOUS_AUTH_STATE)).not.toThrow();
  });
});
