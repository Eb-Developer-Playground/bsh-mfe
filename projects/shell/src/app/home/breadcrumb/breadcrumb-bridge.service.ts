import { Injectable, signal } from '@angular/core';

export type BreadcrumbItem = Readonly<{
  label: string;
  path: string;
}>;

export type BreadcrumbState = Readonly<{
  title: string;
  items: readonly BreadcrumbItem[];
}>;

@Injectable({ providedIn: 'root' })
export class BreadcrumbBridgeService {
  private readonly remoteState = signal<BreadcrumbState | null>(null);

  readonly state = this.remoteState.asReadonly();

  set(state: BreadcrumbState): void {
    const current = this.remoteState();
    const isUnchanged =
      current?.title === state.title &&
      current.items.length === state.items.length &&
      current.items.every(
        (item, index) =>
          item.label === state.items[index]?.label && item.path === state.items[index]?.path,
      );

    if (isUnchanged) {
      return;
    }

    this.remoteState.set({
      title: state.title,
      items: state.items.map((item) => ({ ...item })),
    });
  }

  clear(): void {
    this.remoteState.set(null);
  }
}
