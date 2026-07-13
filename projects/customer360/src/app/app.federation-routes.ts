import { Routes } from '@angular/router';
import { DashboardComponent } from './home/dashboard/dashboard.component';
import { SearchComponent } from './home/search/search.component';
import { App } from './app';

/**
 * Federation-specific routes for customer360.
 * Only includes routes that work in the federated context.
 * The full route tree (services/save-and-invest, etc.) is in app.routes.ts
 * and is used when running customer360 standalone.
 */
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
        path: 'services',
        component: SearchComponent,
        data: { title: 'Customer Services', breadcrumb: 'MENU.CUSTOMER-SERVICES' },
      },
      { path: '**', redirectTo: 'dashboard' },
    ],
  },
];
