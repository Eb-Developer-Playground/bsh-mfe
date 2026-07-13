import type { NFEventRegistry } from '@softarc/native-federation-orchestrator/registry';

export const AUTH_STATE_CHANNEL = 'auth.state';
export const AUTH_COMMAND_CHANNEL = 'auth.command';

type RegistryWindow = Window & { __NF_REGISTRY__?: NFEventRegistry };

export function getNativeFederationRegistry(): NFEventRegistry | undefined {
  return (window as RegistryWindow).__NF_REGISTRY__;
}
