// projects/shell/src/app/app.routes.ts
import { Routes } from '@angular/router';
import { loadRemoteModule } from '@angular-architects/native-federation';
import { Home } from './home/home';
import { ServicePortal } from './home/service-portal/service-portal';
import { authGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    component: Home,
    children: [
      {
        path: '',
        component: ServicePortal,
        data: {
          title: 'EQUITY.BSH',
          breadcrumb: 'MENU.CUSTOMER-SERVICES',
        },
      },
      {
        path: 'customer360',
        loadComponent: () =>
          loadRemoteModule('customer360', './Component').then(m => m.App),
        data: {
          title: 'EQUITY.BSH',
          breadcrumb: 'MENU.CUSTOMER-360',
        }, },
      {
        path: 'onboarding',
        loadComponent: () =>
          loadRemoteModule('onboarding', './Component').then(m => m.App),
        data: {
          title: 'EQUITY.BSH',
          breadcrumb: 'MENU.CUSTOMER-ONBOARDING',
        }, },
      {
        path: 'swift',
        loadChildren: () =>
          loadRemoteModule('swift', './Routes').then(m => m.routes),
        data: {
          title: 'EQUITY.BSH',
          breadcrumb: 'MENU.SWIFT',
        },
      },
    ],
  },
  { path: '**', redirectTo: '' },
];


