import { shareAll, withNativeFederation } from '@softarc/native-federation/config';

export default withNativeFederation({
  name: 'reactRemote',
  exposes: {
    './main': './src/main.tsx',
    './Routes': './src/federation.routes.ts',
  },
  shared:  {   ...shareAll(
    { singleton: true, strictVersion: true, requiredVersion: 'auto', build: 'package' }
  ),},
  skip: ['react-dom/server', 'react-dom/server.browser', 'react-dom/server.node', 'react-dom/test-utils'],
  features: {
    denseChunking: true,
  },
});
