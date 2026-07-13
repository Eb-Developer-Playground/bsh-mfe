import { Component, inject } from '@angular/core';
import { loadRemoteModule } from '@angular-architects/native-federation';
import { Routes } from '@angular/router';
import { ToastService } from './shared/modules/toast/toast.service';
import { MessageBoxType } from './shared/modules/toast/models';

@Component({
  selector: 'app-remote-placeholder',
  template: '',
  standalone: true,
})
class PlaceholderComponent {}

const REMOTE_DISPLAY_NAMES: Record<string, string> = {
  customer360: 'Customer 360',
  onboarding: 'Customer Onboarding',
  swift: 'SWIFT',
};

function getDisplayName(remoteName: string): string {
  return REMOTE_DISPLAY_NAMES[remoteName] || remoteName;
}

export function safeLoadRemoteRoutes(remoteName: string): Promise<Routes> {
  const toast = inject(ToastService);
  const displayName = getDisplayName(remoteName);

  return loadRemoteModule(remoteName, './Routes')
    .then((m: any) => m.routes)
    .catch((err) => {
      console.error(`Failed to load remote "${remoteName}":`, err);
      toast.show(
        'Error',
        `Failed to load ${displayName}`,
        MessageBoxType.DANGER,
        5000,
        undefined,
        undefined,
        false,
      );
      return [];
    });
}

export function safeLoadRemoteComponent(remoteName: string): Promise<any> {
  const toast = inject(ToastService);
  const displayName = getDisplayName(remoteName);

  return loadRemoteModule(remoteName, './Component')
    .then((m: any) => m.App)
    .catch((err) => {
      console.error(`Failed to load remote "${remoteName}":`, err);
      toast.show(
        'Error',
        `Failed to load ${displayName}`,
        MessageBoxType.DANGER,
        5000,
        undefined,
        undefined,
        false,
      );
      return PlaceholderComponent;
    });
}
