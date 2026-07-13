import { Feature, FeatureFlagsConfig } from "../app/core/feature-flags/feature-flags.model";

export const environment = {
  production: false,
  ngrxLogs: true,
  enableRouterTracing: true,
  apiUrl: 'https://api-dev.equitygroupholdings.com',
  adminPortalUrl: 'https://branchservicehub-admin-portal-dev.azurewebsites.net',
  appUrl: 'https://branchservicehub-customer-360-dev.azurewebsites.net',
  customerOnboardingUrl:
    'https://branchservicehub-customer-onboarding-dev.azurewebsites.net',
  swiftUrl: 'https://branchservicehub-swift-dev.azurewebsites.net',
  bioExtPage: 'https://10.1.9.54:58379/compas-web',
  secugenApi: 'https://localhost:8443',
  secugenLicenseUAT:
    '5aQfTiuSoBOfhoiN/RuOiwFWba1E9FBBNoHz4mx5b1dYNb9/OwvSiGXPfjj++FvFU1/bdqyJQpzinDuHgMZvSg==',
  clientId: '44FEC6A5E3F5454',
  PAGE_SIZE: 20,
  showAllMenuItems: true,
  useMockServiceWorker: false,
  encryptionKey: 'S3cr3etKey$123',
  datadogRumId: '',
  datadogRumToken: '',
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
};
