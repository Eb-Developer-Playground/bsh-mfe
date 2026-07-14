import { initFederation } from '@angular-architects/native-federation';
import { createRegistry } from '@softarc/native-federation-orchestrator/registry';

window.__NF_REGISTRY__ = Object.freeze(
  createRegistry({ maxStreams: 20, maxEvents: 3, removePercentage: 0.5 })()
);

initFederation('federation.manifest.json')
  .catch(err => console.error(err))
  .then(_ => import('./bootstrap'))
  .catch(err => console.error(err));
