import { inject, Type } from '@angular/core';
import { loadRemoteModule } from '@angular-architects/native-federation';
import { Route, Routes } from '@angular/router';

import { PlaceholderComponent, placeholderDisplayName } from '../placeholder.component';
import { MessageBoxType } from '../shared/modules/toast/models';
import { ToastService } from '../shared/modules/toast/toast.service';
import { ReactRemoteHostComponent } from './react-remote-host.component';

type FederatedReactRoute = Readonly<{
  path: string;
  pathMatch?: 'full';
}>;

type FederatedReactRoutesModule = Readonly<{
  routes: readonly FederatedReactRoute[];
}>;

function isFederatedReactRoute(value: unknown): value is FederatedReactRoute {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate['path'] === 'string' &&
    (candidate['pathMatch'] === undefined || candidate['pathMatch'] === 'full')
  );
}

function isFederatedReactRoutesModule(value: unknown): value is FederatedReactRoutesModule {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const routes = (value as Record<string, unknown>)['routes'];
  return Array.isArray(routes) && routes.every(isFederatedReactRoute);
}

export function mapReactRemoteRoutes(
  definitions: readonly FederatedReactRoute[],
  component: Type<unknown> = ReactRemoteHostComponent,
): Routes {
  return definitions.map((definition): Route => ({
    ...definition,
    component,
  }));
}

export function safeLoadReactRemoteRoutes(): Promise<Routes> {
  const toast = inject(ToastService);

  return loadRemoteModule('reactRemote', './Routes')
    .then((module: unknown) => {
      if (!isFederatedReactRoutesModule(module)) {
        throw new Error('reactRemote/./Routes did not export a valid routes array');
      }

      return mapReactRemoteRoutes(module.routes);
    })
    .catch((error: unknown) => {
      console.error('Failed to load remote "reactRemote" routes:', error);
      toast.show(
        'Error',
        'Failed to load React Remote',
        MessageBoxType.DANGER,
        5000,
        undefined,
        undefined,
        false,
      );
      placeholderDisplayName.set('React Remote');
      return [{ path: '', component: PlaceholderComponent }];
    });
}
