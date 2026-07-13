import { Feature, FeatureFlagsConfig } from "../app/core/feature-flags/feature-flags.model";

export const environment = {
  production: false,
  ngrxLogs: true,
  enableRouterTracing: true,
  apiUrl: 'https://api-uat.equitygroupholdings.com',
  appUrl: 'https://servicehub-customer-360-uat.equitygroupholdings.com',
  adminPortalUrl: 'https://servicehub-admin-portal-uat.equitygroupholdings.com',
  customerOnboardingUrl: 'https://servicehub-customer-onboarding-uat.equitygroupholdings.com',
  swiftUrl: 'https://servicehub-swift-uat.equitygroupholdings.com',
  bioExtPage: 'https://10.1.9.54:58379/compas-web',
  secugenApi: 'https://localhost:8443',
  secugenLicenseUAT: '5aQfTiuSoBOfhoiN/RuOiwFWba1E9FBBNoHz4mx5b1dYNb9/OwvSiGXPfjj++FvFU1/bdqyJQpzinDuHgMZvSg==',
  encryptionKey: 'S3cr3etKey$123',
  PAGE_SIZE: 20,
  useMockServiceWorker: true,
  showAllMenuItems: true,
  featureFlags: {
    globalDefaults: {
      [Feature.StandingOrder]: true
    },
    bySubsidiary: {
      KE: {},
      UG: { [Feature.StandingOrder]: false },
      TZ: { [Feature.StandingOrder]: false },
      CD: {},
      RW: { [Feature.StandingOrder]: false },
      SS: { [Feature.StandingOrder]: false }
    },
    actionFlowNames: {
      KE: { [Feature.StandingOrder]: 'StandingOrder' },
      UG: {},
      TZ: {},
      CD: { [Feature.StandingOrder]: 'StandingOrder' },
      RW: {},
      SS: {}
    },
  } satisfies FeatureFlagsConfig,
  // datadogRumId: '49feee3d-e9a9-48df-9ec8-8cc7dc89d15e',
  // datadogRumToken: 'pub5be53aef7ad705e72bc7182eaa6552a4',
};
