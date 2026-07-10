// @ts-ignore
import { worker } from '../mocks/browser';
worker.start();

export const environment = {
  production: false,
  enableRouterTracing: true,
  apiUrl: 'https://api-dev.equitygroupholdings.com',
  appUrl: 'https://branchservicehub-swift-dev.azurewebsites.net',
  adminPortalUrl: 'https://branchservicehub-admin-portal-dev.azurewebsites.net',
  customerOnboardingUrl: 'https://branchservicehub-customer-onboarding-dev.azurewebsites.net',
  customer360Url: 'https://customer360-dev.equitybankgroup.com/',
  cardsPortalUrl: 'https://servicehub-cards-uat.equitygroupholdings.com',
  secugenApi: 'https://localhost:8443',
  clientId: '44FEC6A5E3F5454',
  PAGE_SIZE: 20,
};
