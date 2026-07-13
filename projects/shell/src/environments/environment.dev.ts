import {
  Feature,
  FeatureFlagsConfig,
} from '@app/core/feature-flags/feature-flags.model';

export const environment = {
  production: false,
  ngrxLogs: true,
  enableRouterTracing: true,
  apiUrl: 'https://api-uat.equitygroupholdings.com',
  adminPortalUrl: 'https://servicehub-admin-portal-uat.equitygroupholdings.com',
  appUrl: 'https://servicehub-customer-360-uat.equitygroupholdings.com',
  customerOnboardingUrl:
    'https://servicehub-customer-onboarding-uat.equitygroupholdings.com',
  swiftUrl: 'https://servicehub-swift-uat.equitygroupholdings.com',
  cardsPortalUrl: 'https://servicehub-cards-dev.equitygroupholdings.com',
  bioExtPage: 'https://10.1.9.54:58379/compas-web',
  secugenApi: 'https://localhost:8443',
  secugenLicenseUAT:
    '5aQfTiuSoBOfhoiN/RuOiwFWba1E9FBBNoHz4mx5b1dYNb9/OwvSiGXPfjj++FvFU1/bdqyJQpzinDuHgMZvSg==',
  clientId: '44FEC6A5E3F5454',
  PAGE_SIZE: 20,
  showAllMenuItems: true,
  useMockServiceWorker: false,
  encryptionKey: 'S3cr3etKey$123',
  bypassAuth: false,
  datadogRumId: '',
  datadogRumToken: '',
  featureFlags: {
    globalDefaults: {
      [Feature.StandingOrder]: true,
      [Feature.ChangeOfSignatories]: true,
      [Feature.KnownAgent]: true,
      [Feature.ChangeofMandate]: true,
      [Feature.ChangeOfSignature]: true,
    },
    bySubsidiary: {
      KE: {[Feature.UpdateCifPopUp]: true},
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
};
