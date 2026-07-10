import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

export interface ServiceCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  route: string;
}

const CARDS: ServiceCard[] = [
  {
    id: 'onboarding',
    title: 'Customer Onboarding',
    description: 'Onboard a new customer and help them open an account',
    icon: 'person_add',
    route: '/onboarding',
  },
  {
    id: 'customer360',
    title: 'Customer 360\u00B0',
    description: 'Assist an existing customer with transactions by viewing their profile and account details',
    icon: '360',
    route: '/customer360',
  },
  {
    id: 'swift',
    title: 'SWIFT',
    description: 'Help non-Equity members complete a transaction',
    icon: 'swap_horiz',
    route: '/swift',
  },
  {
    id: 'teller',
    title: 'Teller Services',
    description: 'Find additional information to help customers with their queries',
    icon: 'account_balance',
    route: '#',
  },
  {
    id: 'merchant-whitelist',
    title: 'Merchant whitelisting and delisting',
    description: 'Allow merchants to receive payments for specific loan products',
    icon: 'checklist',
    route: '#',
  },
  {
    id: 'branch-services',
    title: 'Branch Services',
    description: 'Help customers who visit the branch',
    icon: 'business',
    route: '#',
  },
  {
    id: 'customer-requests',
    title: 'Customer service requests',
    description: 'Help non-Equity members complete a transaction',
    icon: 'support_agent',
    route: '#',
  },
  {
    id: 'merchant-portal',
    title: 'Merchant Portal',
    description: 'Configure and expose Equity APIs to customers',
    icon: 'storefront',
    route: '#',
  },
  {
    id: 'bank-insights',
    title: 'Bank Insights',
    description: 'Access bank insights portal that supports partners who have the ecosystem model, search for transactions and confirm payments',
    icon: 'insights',
    route: '#',
  },
  {
    id: 'cards',
    title: 'Cards',
    description: 'Centralized access to card operations, inventory',
    icon: 'credit_card',
    route: '#',
  },
];

@Component({
  selector: 'app-service-portal',
  templateUrl: './service-portal.html',
  styleUrl: './service-portal.css',
  imports: [RouterLink, MatIconModule],
  host: {
    class: 'service-portal-component',
  },
})
export class ServicePortal {
  readonly cards = CARDS;
}
