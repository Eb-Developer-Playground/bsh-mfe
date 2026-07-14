import type { NFEventRegistry } from '@softarc/native-federation-orchestrator/registry';

declare global {
  interface Window {
    __NF_REGISTRY__?: NFEventRegistry;
  }
}

export {};
