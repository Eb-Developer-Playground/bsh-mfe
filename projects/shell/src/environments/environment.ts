import {
  Feature,
  FeatureFlagsConfig,
} from '@app/core/feature-flags/feature-flags.model';

export const environment = {
  production: false,
  ngrxLogs: true,
  enableRouterTracing: true,
  apiUrl: 'https://api-dev.equitygroupholdings.com',
  appUrl: 'https://branchservicehub-admin-portal-dev.azurewebsites.net',
  customerOnboardingUrl:
    'https://servicehub-customer-onboarding-uat.equitygroupholdings.com',
  swiftUrl: 'https://servicehub-swift-uat.equitygroupholdings.com',
  adminPortalUrl: 'https://branchservicehub-admin-portal-dev.azurewebsites.net',
  cardsPortalUrl: 'https://servicehub-cards-uat.equitygroupholdings.com',
  bioExtPage: 'https://10.1.9.54:58379/compas-web',
  secugenApi: 'https://localhost:8443',
  secugenLicenseUAT:
    '5aQfTiuSoBOfhoiN/RuOiwFWba1E9FBBNoHz4mx5b1dYNb9/OwvSiGXPfjj++FvFU1/bdqyJQpzinDuHgMZvSg==',
  encryptionKey: 'S3cr3etKey$123',
  bypassAuth: true,
  PAGE_SIZE: 20,
  useMockServiceWorker: false,
  showAllMenuItems: true,
  featureFlags: {
    globalDefaults: {
      [Feature.StandingOrder]: true,
      [Feature.ChangeOfSignatories]: true,
      [Feature.KnownAgent]: true,
      [Feature.ChangeofMandate]: true,
      [Feature.ChangeOfSignature]: true,
    },
    bySubsidiary: {
      KE: {[Feature.UpdateCifPopUp]: false},
      UG: {
        [Feature.StandingOrder]: false,
        [Feature.KnownAgent]: false,
        [Feature.ChangeOfSignatories]: false,
        [Feature.ChangeOfSignature]: false,
      },
      TZ: {
        [Feature.StandingOrder]: false,
        [Feature.KnownAgent]: false,
        [Feature.ChangeOfSignatories]: false,
        [Feature.ChangeofMandate]: false,
        [Feature.ChangeOfSignature]: false,
      },
      CD: {},
      RW: {
        [Feature.StandingOrder]: false,
        [Feature.KnownAgent]: false,
        [Feature.ChangeOfSignatories]: false,
        [Feature.ChangeOfSignature]: false,
      },
      SS: {
        [Feature.StandingOrder]: false,
        [Feature.KnownAgent]: false,
        [Feature.ChangeOfSignatories]: false,
        [Feature.ChangeOfSignature]: false,
      },
    },
    actionFlowNames: {
      KE: {
        [Feature.StandingOrder]: 'StandingOrder',
        [Feature.KnownAgent]: 'KnownAgentFlow',
        [Feature.ChangeOfSignatories]: 'ChangeOfSignatories',
        [Feature.ChangeofMandate]: 'ChangeOfMandate',
        [Feature.ChangeOfSignature]: 'ChangeOfSignature',
      },
      UG: { [Feature.ChangeofMandate]: 'ChangeOfMandate' },
      TZ: {},
      CD: {
        [Feature.StandingOrder]: 'StandingOrder',
        [Feature.ChangeofMandate]: 'ChangeOfMandate',
        [Feature.ChangeOfSignature]: 'ChangeOfSignature',
        [Feature.ChangeOfSignatories]: 'ChangeOfSignatories',
      },
      RW: { [Feature.ChangeofMandate]: 'ChangeOfMandate' },
      SS: { [Feature.ChangeofMandate]: 'ChangeOfMandate' },
    },
  } satisfies FeatureFlagsConfig,
  // datadogRumId: '49feee3d-e9a9-48df-9ec8-8cc7dc89d15e',
  // datadogRumToken: 'pub5be53aef7ad705e72bc7182eaa6552a4',
};
