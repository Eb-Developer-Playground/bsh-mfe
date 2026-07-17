import { AfterViewInit, Component, DestroyRef, ElementRef, inject, signal, viewChild } from '@angular/core';
import { loadRemoteModule } from '@angular-architects/native-federation';

import { PlaceholderComponent, placeholderDisplayName } from '../placeholder.component';
import {
  BreadcrumbBridgeService,
  BreadcrumbState,
} from '../home/breadcrumb/breadcrumb-bridge.service';
import { MessageBoxType } from '@shared/modules/toast';
import { ToastService } from '@shared/modules/toast';

type ReactRemoteMountModule = {
  mount: (
    element: HTMLElement,
    options?: {
      basename?: string;
      onBreadcrumbChange?: (state: BreadcrumbState) => void;
    },
  ) => () => void;
};

@Component({
  selector: 'app-react-remote-host',
  imports: [PlaceholderComponent],
  template: `
    @if (loadFailed()) {
      <app-remote-placeholder />
    } @else {
      <div #container class="react-remote-host"></div>
    }
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: 100%;
        min-width: 100%;
      }

      .react-remote-host {
        min-height: 100%;
        min-width: 100%;
      }
    `,
  ],
})
export class ReactRemoteHostComponent implements AfterViewInit {
  private readonly container = viewChild.required<ElementRef<HTMLElement>>('container');
  private readonly breadcrumbBridge = inject(BreadcrumbBridgeService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly toast = inject(ToastService);
  protected readonly loadFailed = signal(false);

  async ngAfterViewInit(): Promise<void> {
    try {
      this.loadFailed.set(false);
      placeholderDisplayName.set('');
      const module = (await loadRemoteModule('reactRemote', './main')) as ReactRemoteMountModule;
      const unmount = module.mount(this.container().nativeElement, {
        basename: '/react-remote',
        onBreadcrumbChange: (state) => this.breadcrumbBridge.set(state),
      });

      this.destroyRef.onDestroy(() => {
        unmount();
        this.breadcrumbBridge.clear();
      });
    } catch (error) {
      this.breadcrumbBridge.clear();
      console.error('Failed to load remote "reactRemote":', error);
      this.loadFailed.set(true);
      placeholderDisplayName.set('React Remote');
      this.toast.show(
        'Error',
        'Failed to load React Remote',
        MessageBoxType.DANGER,
        5000,
        undefined,
        undefined,
        false,
      );
    }
  }
}
