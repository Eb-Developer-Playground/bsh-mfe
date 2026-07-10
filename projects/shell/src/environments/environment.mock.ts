// @ts-ignore
import { worker } from '../mocks/browser';
worker.start();

export const environment = {
  production: false,
  ngrxLogs: true,
  enableRouterTracing: true,

  apiUrl: 'https://partners-dev.equitygroupholdings.com',
  appUrl: 'https://branchservicehub-customer-360-dev.azurewebsites.net',
  adminPortalUrl: 'https://branchservicehub-admin-portal-dev.azurewebsites.net',
  customerOnboardingUrl:
    'https://branchservicehub-customer-onboarding-dev.azurewebsites.net',
  swiftUrl: 'https://branchservicehub-swift-dev.azurewebsites.net/',
  cardsPortalUrl: 'https://servicehub-cards-dev.equitygroupholdings.com',
  secugenApi: 'https://localhost:8443',
  clientId: '44FEC6A5E3F5454',
  encryptionKey: 'S3cr3etKey$123',
  PAGE_SIZE: 20,
  showAllMenuItems: true,
};
