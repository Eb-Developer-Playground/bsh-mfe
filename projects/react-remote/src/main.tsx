import { StrictMode } from 'react';
import { createRoot, type Root } from 'react-dom/client';

import App from './App.tsx';
import type { BreadcrumbChangeHandler } from './breadcrumb.types';
import globalStyles from './index.css?inline';
import tailwindStyles from './tailwind.generated.css?inline';

export type ReactRemoteMountOptions = {
  basename?: string;
  onBreadcrumbChange?: BreadcrumbChangeHandler;
};

type MountedRoot = {
  root: Root;
  detachStyles: () => void;
};

const rootClassName = 'bsh-react-remote-root';
const roots = new WeakMap<HTMLElement, MountedRoot>();
let mountedRootCount = 0;
let styleElement: HTMLStyleElement | null = null;

function attachStyles(): () => void {
  if (!styleElement?.isConnected) {
    styleElement = document.createElement('style');
    styleElement.setAttribute('data-bsh-react-remote-styles', '');
    styleElement.textContent = `${tailwindStyles}\n${globalStyles}`;
    document.head.appendChild(styleElement);
  }

  mountedRootCount += 1;
  let detached = false;

  return () => {
    if (detached) {
      return;
    }

    detached = true;
    mountedRootCount = Math.max(0, mountedRootCount - 1);

    if (mountedRootCount === 0) {
      styleElement?.remove();
      styleElement = null;
    }
  };
}

export function mount(element: HTMLElement, options: ReactRemoteMountOptions = {}): () => void {
  const existingMount = roots.get(element);

  if (existingMount) {
    existingMount.root.unmount();
    existingMount.detachStyles();
    roots.delete(element);
  }

  element.classList.add(rootClassName);
  const detachStyles = attachStyles();
  let root: Root;

  try {
    root = createRoot(element);
    root.render(
      <StrictMode>
        <App
          basename={options.basename ?? '/'}
          onBreadcrumbChange={options.onBreadcrumbChange}
        />
      </StrictMode>,
    );
  } catch (error) {
    detachStyles();
    element.classList.remove(rootClassName);
    throw error;
  }

  roots.set(element, { root, detachStyles });

  return () => {
    const activeMount = roots.get(element);

    if (!activeMount || activeMount.root !== root) {
      return;
    }

    activeMount.root.unmount();
    activeMount.detachStyles();
    element.classList.remove(rootClassName);
    roots.delete(element);
  };
}

const bootstrapElement = document.getElementById('root');
let bootstrapCleanup: (() => void) | undefined;

if (bootstrapElement) {
  bootstrapCleanup = mount(bootstrapElement);
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    bootstrapCleanup?.();
  });
}
