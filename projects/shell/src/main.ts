import { initFederation } from '@softarc/native-federation-orchestrator';
import {
  useShimImportMap,
  consoleLogger,
  globalThisStorageEntry,
} from '@softarc/native-federation-orchestrator/options';

//
// initFederation('federation.manifest.json')
//   .catch((err) => console.error(err))
//   .then((_) => import('./bootstrap'))
//
//   .catch((err) => console.error(err));


initFederation('federation.manifest.json', {
  ...useShimImportMap({ shimMode: true }),
  logLevel: 'debug',
  logger: consoleLogger,
  storage: globalThisStorageEntry,
  hostRemoteEntry: './remoteEntry.json'
})
  .catch(err => console.error(err))
  .then(_ => import('./bootstrap'))
  .catch(err => console.error(err));
