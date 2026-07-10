import { Routes } from '@angular/router';
import { ServicesComponent } from './services.component';

export const servicesRoutes: Routes = [
  {
    path: 'send-money',
    loadChildren: () => import('./send-money/send-money.routes').then(m => m.sendMoneyRoutes),
  },
  {
    path: 'transactions',
    loadChildren: () => import('./transactions/transactions.routes').then(m => m.transactionsRoutes),
  },
  {
    path: 'checker',
    loadChildren: () => import('./checker/checker.routes').then(m => m.checkerRoutes),
  },
  {
    path: '',
    component: ServicesComponent,
  },
];
