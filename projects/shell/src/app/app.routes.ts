// projects/shell/src/app/app.routes.ts
import { Routes } from '@angular/router';
import { loadRemoteModule } from '@angular-architects/native-federation';

export const routes: Routes = [
  {
    path: 'customer360',
    loadComponent: () =>
      loadRemoteModule('customer360', './Component').then(m => m.App),
  },
  {
    path: 'onboarding',
    loadComponent: () =>
      loadRemoteModule('onboarding', './Component').then(m => m.App),
  },
  {
    path: 'swift',
    loadComponent: () =>
      loadRemoteModule('swift', './Component').then(m => m.App),
  },
];


