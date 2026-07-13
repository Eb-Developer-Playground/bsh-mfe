import { Routes } from '@angular/router';
import { routes as saveAndInvestRoutes } from './home/customer/save-and-invest/save-and-invest.routes';
import { ACCOUNT_STATEMENTS_ROUTES } from './home/customer/account-statements/account-statements.routes';
import { KNOWN_AGENT_ROUTES } from './home/customer/known-agent/known-agent.routes';
import { CHANGE_OF_MANDATE_ROUTES } from './home/customer/change-of-mandate/change-of-mandate.routes';
import { BULK_PAYMENT_ROUTES } from './home/customer/bulk-payment/bulk-payment.routes';
import { standingOrderRoutes } from './home/customer/standing-order/standing-order.routes';
import { CARD_ISSUANCE_ROUTES } from './home/customer/card-issuance/card-issuance.routes';
import { FUNDS_TRANSFER_ROUTES } from './home/customer/funds-transfer/funds-transfer.routes';
import { CHANNELS_ROUTES } from './home/customer/channels/channels.routes';
import { MOVE_MONEY_ROUTES } from './home/customer/move-money/move-money.routes';
import { DashboardComponent } from './home/dashboard/dashboard.component';
import { App } from './app';

export const routes: Routes = [
  {
    path: '',
    component: App,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        component: DashboardComponent,
        data: { title: 'Dashboard', breadcrumb: 'MENU.MY-DASHBOARD' },
      },
      {
        path: 'services/customer-360/save-and-invest',
        children: saveAndInvestRoutes,
      },
      {
        path: 'services/account-statements',
        children: ACCOUNT_STATEMENTS_ROUTES,
      },
      {
        path: 'services/known-agent',
        children: KNOWN_AGENT_ROUTES,
      },
      {
        path: 'services/change-of-mandate',
        children: CHANGE_OF_MANDATE_ROUTES,
      },
      {
        path: 'services/bulk-payment',
        children: BULK_PAYMENT_ROUTES,
      },
      {
        path: 'services/standing-order',
        children: standingOrderRoutes,
      },
      {
        path: 'services/card-issuance',
        children: CARD_ISSUANCE_ROUTES,
      },
      {
        path: 'services/funds-transfer',
        children: FUNDS_TRANSFER_ROUTES,
      },
      {
        path: 'services/customer-360/channels',
        children: CHANNELS_ROUTES,
      },
      {
        path: 'services/customer-360/move-money',
        children: MOVE_MONEY_ROUTES,
      },
      { path: '**', redirectTo: 'dashboard' },
    ],
  },
];
