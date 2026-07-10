import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadChildren: () => import('./dashboard/dashboard.routes').then(m => m.dashboardRoutes),
    data: {
      title: 'EQUITY.BSH',
      breadcrumb: 'MENU.MY-DASHBOARD',
    },},
  {
    path: 'services',
    loadChildren: () => import('./services/services.routes').then(m => m.servicesRoutes),
    data: {
      title: 'EQUITY.BSH',
      breadcrumb: 'MENU.SERVICES',
    }, },
  { path: '**', redirectTo: 'dashboard' },
];
