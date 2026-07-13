import type { Mocked as VitestMocked, vi } from 'vitest';

declare global {
  const jest: typeof vi;

  namespace jest {
    type Mocked<T> = VitestMocked<T>;
  }
}

export {};
