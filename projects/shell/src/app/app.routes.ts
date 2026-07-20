// projects/shell/src/app/app.routes.ts
import { Routes } from '@angular/router';
import { Home } from './home/home';
import { ServicePortal } from './home/service-portal/service-portal';
import { AuthCallbackComponent } from './auth-callback/auth-callback.component';
import { authGuard } from './shared/guards/auth.guard';
import { safeLoadRemoteRoutes, safeLoadRemoteComponent, safeLoadRemoteExposed } from './remote-loader';

export const routes: Routes = [
  {
    path: 'auth',
    component: AuthCallbackComponent,
  },
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
        path: 'search',
        loadComponent: () => safeLoadRemoteExposed('customer360', './SearchComponent', 'SearchComponent'),
        data: {
          title: 'EQUITY.BSH',
          breadcrumb: 'MENU.CUSTOMER-SERVICES',
        },
      },
      {
        path: 'customer360',
        loadChildren: () => safeLoadRemoteRoutes('customer360'),
        data: {
          title: 'EQUITY.BSH',
          breadcrumb: 'MENU.CUSTOMER-360',
        }, },
      {
        path: 'onboarding',
        loadComponent: () => safeLoadRemoteComponent('onboarding'),
        data: {
          title: 'EQUITY.BSH',
          breadcrumb: 'MENU.CUSTOMER-ONBOARDING',
        }, },
      {
        path: 'swift',
        loadChildren: () => safeLoadRemoteRoutes('swift'),
        data: {
          title: 'EQUITY.BSH',
          breadcrumb: 'MENU.SWIFT',
        },
      },
    ],
  },
  { path: '**', redirectTo: '' },
];

