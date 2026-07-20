import { withNativeFederation, shareAll } from '@angular-architects/native-federation/config';

export default withNativeFederation({
  name: 'customer360',

  exposes: {
    './Component': './projects/customer360/src/app/app.ts',
    './Routes': './projects/customer360/src/app/app.federation-routes.ts',
    './SearchComponent': './projects/customer360/src/app/home/search/search.component.ts',
  },

  shared: {
    ...shareAll(
      { singleton: true, strictVersion: true, requiredVersion: 'auto', build: 'package' },
      {
        overrides: {
          // includeSecondaries is an opt-out of ignoreUnusedDeps, so all of
          // @angular/core is shared to prevent mismatches.
          '@angular/core': {
            singleton: true,
            strictVersion: true,
            requiredVersion: 'auto',
            build: 'package',
            includeSecondaries: { keepAll: true },
          },
        },
      },
    ),
  },

  skip: [
    // CJS-only; named imports from @equity/ebk-web-components fail when
    // pre-bundled as a shared ESM chunk. Bundle it inline instead.
    'lodash',
    'rxjs/ajax',
    'rxjs/fetch',
    'rxjs/testing',
    'rxjs/webSocket',
    // Internal app paths without package metadata — not actual npm packages
    'src/app/shared/modules/localization/models',
    '@app/home/customer/account-statements/models/account-statement',
    '@shared/modules/loader/model/size-props',
    '@app/shared/models/searchable',
  ],

  // Please read our FAQ about sharing libs:
  // https://shorturl.at/jmzH0

  features: {
    // ignoreUnusedDeps is enabled by default now
    // ignoreUnusedDeps: true,

    // Opt-in: groups chunks in remoteEntry.json for smaller metadata file
    denseChunking: true,
  },
});
