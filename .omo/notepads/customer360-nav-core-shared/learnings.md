# Learnings

## Wave 1 T4 — Final layout wiring pattern (2026-07-10)

### customer360 App Shell Layout Wiring

**`app.ts`** — import `NavigationComponent` + `RouterOutlet`, list both in `imports`:
```typescript
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavigationComponent } from './home/navigation/navigation.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavigationComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('customer360');
}
```

**`app.html`** — flex layout: nav sidebar + main content area with router outlet:
```html
<div class="app-layout">
  <app-navigation></app-navigation>
  <main class="main-content">
    <router-outlet></router-outlet>
  </main>
</div>
```

**`app.css`** — minimal layout CSS only (flex row, full viewport height):
```css
.app-layout {
  display: flex;
  height: 100vh;
}

.main-content {
  flex: 1;
  overflow: auto;
}
```

### Notes
- Do NOT set `standalone: true` — it is the default in Angular v22+.
- Do NOT set explicit `ChangeDetectionStrategy.OnPush` — it is the default in Angular v22+.
- `federation.config.mjs` `skip` must contain only rxjs secondaries (`rxjs/ajax`, `rxjs/fetch`, `rxjs/testing`, `rxjs/webSocket`) plus the existing comment. Do not add app-internal module paths to skip.
- Always build customer360 with **Node 22** (`nvm use 22`). Node v20 triggers a version-detection warning and may cause toolchain incompatibilities.
