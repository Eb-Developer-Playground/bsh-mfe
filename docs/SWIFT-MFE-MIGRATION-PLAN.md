# BSHSwiftWeb → Swift MFE Migration Plan (Refined)

## Overview

**Source**: `/Users/owen_adirah/WebstormProjects/BSHSwiftWeb` (Angular 17, NgModule)
**Target**: `/Users/owen_adirah/WebstormProjects/bsh-mfe/projects/swift` (Angular 22, Native Federation MFE)

**Architecture Decision**: Shell owns the layout (sidenav + topbar). Swift exposes ONLY feature components — no layout duplication.

---

## Current State Analysis

### Legacy Swift App (BSHSwiftWeb)

```
┌────────────────────────────────────────────────────────────┐
│  AppComponent (root)                                       │
│  └─► AppModule → AppRoutingModule                         │
│       ├─► /auth → AuthModule (lazy)                       │
│       ├─► /guides → GuidesModule (lazy)                   │
│       └─► /* → HomeModule (auth-guarded, lazy)            │
│            └─► HomeComponent (SHELL LAYOUT)               │
│                 ├─► mat-sidenav → NavigationComponent     │
│                 ├─► mat-toolbar → TopBar + Breadcrumb     │
│                 └─► <router-outlet>                       │
│                      ├─► /dashboard → DashboardModule     │
│                      │    ├─► Dashboard (ticket listing)  │
│                      │    └─► TicketDetail                │
│                      └─► /services → ServicesModule       │
│                           ├─► Services (landing page)     │
│                           ├─► send-money/                 │
│                           ├─► transactions/               │
│                           │    ├─► fund-transfer-mt103/   │
│                           │    ├─► bulk-upload/           │
│                           │    ├─► cash-request-*/        │
│                           │    ├─► normal-mt299/          │
│                           │    ├─► statement/             │
│                           │    └─► statement-cancellation/│
│                           └─► checker/                    │
│                                ├─► fund-transfer-mt103/   │
│                                ├─► cash-request-*/        │
│                                └─► normal-mt299/          │
└────────────────────────────────────────────────────────────┘
```

**Key facts**:
- Angular 17.3, NgModule-based
- ~10 NgModules total (App, Home, Dashboard, Services, Auth, Guides + sub-modules)
- ~150+ component files across features
- Uses: `@angular/material`, `@angular/flex-layout` (deprecated), `@ngx-translate/core`
- **No NgRx** — simpler state management (BehaviorSubject-based SessionService)
- No lazy loading beyond Dashboard and Services modules

### Target Shell (bsh-mfe/projects/shell)

```
┌────────────────────────────────────────────────────────────┐
│  App (standalone, v22)                                     │
│  └─► Routes:                                               │
│       ├─► '' → Home (BROKEN — needs fixing)               │
│       │    ├─► mat-sidenav + NavigationComponent          │
│       │    ├─► mat-toolbar + Breadcrumb                   │
│       │    └─► <router-outlet>                            │
│       ├─► /customer360 → loadRemoteModule                 │
│       ├─► /swift → loadRemoteModule('swift', './Component')│
│       └─► /onboarding → loadRemoteModule                  │
└────────────────────────────────────────────────────────────┘
```

**Current state of shell**: The `HomeComponent` template is a copy of the legacy layout BUT:
- `imports: []` is empty — no Material, FormsModule, TranslateModule, etc.
- `.ts` has `class Home {}` with no members — template references `session`, `isHandset$`, `toggleSidenav()`, etc.
- **Does not compile** — this is the first thing to fix.

---

## Migration Phases

### Phase 0: Fix Shell Foundation (CRITICAL—blocking)

Before any Swift migration work, the shell must be a functioning host.

#### 0.1 Install Missing Dependencies

```bash
pnpm add @angular/material @angular/cdk @angular/animations
pnpm add @ngx-translate/core @ngx-translate/http-loader
pnpm add jwt-decode moment hammerjs
pnpm add -D @types/uuid
```

#### 0.2 Fix Shell HomeComponent

The shell's `home.ts` needs to import ALL dependencies the template uses:

```typescript
// projects/shell/src/app/home/home.ts — FIXED
import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule } from '@angular/forms';
import { AsyncPipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { NavigationComponent } from './navigation/navigation.component';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { NetworkSpeedComponent } from '../shared/components/network-speed/network-speed.component';
import { LoaderComponent } from '../shared/modules/loader/loader.component';
import { TransformSubsidiaryPipe } from '../shared/pipes/transform-subsidiary.pipe';
import { SessionService } from '../shared/services';
import { LocalizationService } from '../shared/modules/localization';
import { Observable, Subject } from 'rxjs';
import { map, shareReplay, takeUntil } from 'rxjs/operators';
import { ILocale, ISubsidiary, User, LOCALES } from '../shared/models';
// ... add all class members from legacy HomeComponent
```

#### 0.3 Verify Build

```bash
pnpm ng build shell
# Must pass with zero errors before proceeding
```

#### 0.4 Verify Shell HomeComponent Renders

```bash
pnpm start:all
# Navigate to http://localhost:4200
# Verify: sidenav visible, toolbar visible, navigation menu items render
```

---

### Phase 1: Routing Architecture (Week 1)

#### 1.1 Update Shell Routes — Swift Exposes Routes, Not Component

```typescript
// projects/shell/src/app/app.routes.ts
{
  path: 'swift',
  loadChildren: () =>
    loadRemoteModule('swift', './Routes').then(m => m.swiftRoutes),
}
```

#### 1.2 Update Swift Federation Config

```javascript
// projects/swift/federation.config.mjs
exposes: {
  './Component': './projects/swift/src/app/app.ts',
  './Routes': './projects/swift/src/app/app.routes.ts',
},
```

#### 1.3 Create Swift Routes Structure

```typescript
// projects/swift/src/app/app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'services',
        loadComponent: () =>
          import('./features/services/services.component').then(m => m.ServicesComponent),
        children: [
          {
            path: 'send-money',
            loadComponent: () =>
              import('./features/services/send-money/send-money.component').then(m => m.SendMoneyComponent),
          },
          {
            path: 'transactions',
            loadChildren: () =>
              import('./features/services/transactions/transactions.routes').then(m => m.transactionRoutes),
          },
          {
            path: 'checker',
            loadChildren: () =>
              import('./features/services/checker/checker.routes').then(m => m.checkerRoutes),
          },
          {
            path: '',
            pathMatch: 'full',
            redirectTo: 'send-money',
          },
        ],
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
    ],
  },
];

export default routes;
```

---

### Phase 2: Shared Services & Infrastructure (Week 1-2)

#### 2.1 Service Migration Strategy

```
┌────────────────────────────────────────────────────────────────┐
│ Service                  │ Origin    │ Action                   │
├──────────────────────────┼───────────┼──────────────────────────┤
│ SessionService           │ Both      │ USE SHELL's              │
│ BSHServices/MENU_ITEMS   │ Shell     │ Add Swift-specific items │
│ ApiService               │ Shell     │ USE SHELL's              │
│ UIService                │ Shell     │ USE SHELL's              │
│ StaticDataService        │ Swift     │ COPY to Swift static/    │
│ TicketRoutingService     │ Both      │ MERGE into shell         │
│ CustomerService          │ Shell     │ USE SHELL's              │
│ TimeoutService           │ Shell     │ USE SHELL's              │
│ LocalizationModule       │ Both      │ USE SHELL's              │
│──────────────────────────┼───────────┼──────────────────────────┤
│ DynamicFormModule        │ Swift ONLY│ COPY to Swift/shared     │
│ DocumentsUploadModule    │ Swift ONLY│ Evaluate: use or adapt   │
│ ToastModule              │ Shell     │ Add to shell if missing  │
└────────────────────────────────────────────────────────────────┘
```

#### 2.2 Copy Core Swift-Only Shared Modules

```bash
# These don't exist in shell, copy to Swift's own shared/
projects/swift/src/app/shared/
├── dynamic-form/          # COPY — form rendering engine
├── documents-upload/      # COPY — document upload with camera
├── documents-preview/     # COPY — document preview
├── gl-account-details/    # COPY — GL account lookups
├── account-details/       # COPY — account details
├── typography/            # COPY — typography styles
├── modules/
│   └── toast/             # COPY — toast notifications
└── static/
    ├── services.ts        # COPY — Swift-specific service codes
    ├── menu.ts            # COPY — Swift-specific menu items
    └── transfer.ts        # COPY — transfer type codes
```

#### 2.3 Configure AppConfig for Swift

```typescript
// projects/swift/src/app/app.config.ts
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideTranslateService } from '@ngx-translate/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    provideAnimations(),
    provideTranslateService({
      defaultLanguage: 'en',
    }),
  ],
};
```

---

### Phase 3: Migrate Feature Modules (Week 2-4)

#### 3.1 Dashboard Module (SMALL — priority high)

```
Legacy: BSHSwiftWeb/src/app/home/dashboard/
├── dashboard.module.ts           → DELETE (convert to standalone)
├── dashboard-routing.module.ts   → DELETE (routes in Swift routes)
├── dashboard.component.ts        → CONVERT to standalone
├── dashboard.component.html      → MIGRATE control flow + FlexLayout→Tailwind
├── dashboard.component.scss      → COPY
├── ticket-detail/                → CONVERT each to standalone
├── material/                     → DELETE (use shell's Material)
└── tickets-datasource.ts         → COPY

Target: projects/swift/src/app/features/dashboard/
├── dashboard.component.ts        (standalone)
├── dashboard.component.html
├── dashboard.component.scss
├── ticket-detail/
│   ├── ticket-detail.component.ts
│   ├── ticket-detail.component.html
│   └── ticket-detail.component.scss
└── tickets-datasource.ts
```

**Estimated**: 5 files, ~2-3 days

#### 3.2 Services Module (LARGE — break into sub-phases)

**Sub-phase 3.2a: Core Layout**
```
Legacy: BSHSwiftWeb/src/app/home/services/
├── services.module.ts           → DELETE
├── services-routing.module.ts   → DELETE
├── services.component.ts        → CONVERT to standalone
├── services.component.html      → MIGRATE control flow
├── services.component.scss      → COPY
├── AGENTS.md                    → COPY
├── dialogs/                     → CONVERT to standalone
└── material/                    → DELETE

Target: projects/swift/src/app/features/services/
├── services.component.ts
├── services.component.html
├── services.component.scss
├── dialogs/
└── AGENTS.md
```

**Sub-phase 3.2b: send-money**
```
Legacy: services/send-money/     → Target: features/services/send-money/
├── send-money.component.ts      → CONVERT to standalone
├── send-money-stepper.service.ts→ COPY
├── send-money.module.ts         → DELETE
├── send-money-routing.module.ts → DELETE
└── ...                          → Additional helper files
```

**Sub-phase 3.2c: transactions (LARGEST)**
```
Legacy: services/transactions/
├── ~50+ files across:
│   ├── fund-transfer-mt103/     → MASSIVE (~30 files)
│   ├── bulk-upload/
│   ├── cash-request-*/          → 7 sub-types
│   ├── normal-mt299/
│   ├── statement/
│   └── statement-cancellation/
└── transactions.module.ts       → DELETE
```

**Sub-phase 3.2d: checker**
```
Legacy: services/checker/
├── ~30+ files (mirrors transactions)
│   ├── fund-transfer-mt103/
│   ├── cash-request-*/          → 7 sub-types
│   └── normal-mt299/
└── checker.module.ts            → DELETE
```

**Estimated**: ~100+ files, ~2-3 weeks

---

### Phase 4: FlexLayout → Tailwind Migration (Alongside Phase 3)

#### 4.1 Migration Pattern

Replace `@angular/flex-layout` directives with Tailwind utilities:

| FlexLayout Directive | Tailwind Equivalent |
|---|---|
| `fxLayout="row"` | `class="flex flex-row"` |
| `fxLayout="column"` | `class="flex flex-col"` |
| `fxLayoutAlign="center center"` | `class="flex items-center justify-center"` |
| `fxLayoutAlign="space-between center"` | `class="flex items-center justify-between"` |
| `fxFlex="50"` | `class="w-1/2"` |
| `fxFlex="auto"` | `class="flex-1"` |
| `fxLayoutGap="16px"` | `class="gap-4"` |
| `fxHide.xs` | `class="hidden sm:block"` |

#### 4.2 Execute Migration Per Component

1. Open component HTML
2. Replace all `fxLayout*`, `fxFlex*`, `fxHide*`, `fxLayoutGap` attributes
3. Remove `FlexLayoutModule` from imports
4. Verify visual fidelity

---

### Phase 5: NgModule → Standalone Conversion (Alongside Phases 3-4)

#### 5.1 Conversion Pattern

```typescript
// BEFORE (NgModule)
@NgModule({
  declarations: [SendMoneyComponent],
  imports: [CommonModule, MaterialModule, ReactiveFormsModule, TranslateModule],
})
export class SendMoneyModule {}

// AFTER (Standalone)
@Component({
  selector: 'app-send-money',
  standalone: true,                    // default in v20+, explicit for clarity
  imports: [CommonModule, MaterialModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './send-money.component.html',
  styleUrls: ['./send-money.component.scss'],
})
export class SendMoneyComponent {}
```

#### 5.2 Template Conversions

| Legacy | Angular 22 |
|---|---|
| `*ngIf="condition"` | `@if (condition)` |
| `*ngFor="let item of items"` | `@for (item of items; track item.id)` |
| `*ngSwitch` | `@switch` |
| `(click)="handler()"` | `(click)="handler()"` (no change) |
| `[(ngModel)]` | Signal Forms or Reactive Forms |
| `| async` | `@if (obs$ | async; as val)` (still works) |

---

### Phase 6: Environment & Assets (Week 3)

#### 6.1 Environments

```bash
projects/swift/src/environments/
├── environment.ts            # COPY default
├── environment.dev.ts        # COPY
├── environment.uat.ts        # COPY
├── environment.prod.ts       # COPY
└── environment.mock.ts       # COPY
```

#### 6.2 Assets

```bash
projects/swift/public/
├── assets/
│   ├── i18n/                 # COPY translation JSON files
│   ├── images/               # COPY images/logos
│   ├── icons/                # COPY SVG icons
│   └── logos/                # COPY bank logos
```

#### 6.3 Styles

```bash
projects/swift/src/
├── styles.css                # Swift-specific styles (minimal)
```

Global styles shared with shell go into shell's styles.

---

### Phase 7: Auth Integration (Week 2-3)

#### 7.1 Auth Flow for MFEs

The shell's AuthGuard (currently commented out) needs to be re-enabled:

```typescript
// projects/shell/src/app/app.routes.ts
{
  path: 'swift',
  canActivate: [AuthGuard],  // RE-ENABLE
  loadChildren: () =>
    loadRemoteModule('swift', './Routes').then(m => m.swiftRoutes),
}
```

#### 7.2 Token Reissue Flow

The legacy app passes `?rt=<reissue_token>&bankId=<id>` via URL params. For MFE:
- Shell handles auth at top-level route
- Swift remote reads token from shell's SessionService (shared singleton)
- No URL param passing needed between shell and Swift

---

## File Manifest

```
bsh-mfe/
├── projects/
│   ├── shell/                              # HOST (already exists, needs fixes)
│   │   └── src/
│   │       └── app/
│   │           ├── home/
│   │           │   ├── home.ts             # FIX imports + class members
│   │           │   ├── home.html           # Already has layout template
│   │           │   ├── home.css            # Add styles
│   │           │   ├── navigation/         # Already exists
│   │           │   └── breadcrumb/         # ADD from legacy
│   │           ├── app.routes.ts           # UPDATE swift route
│   │           └── app.config.ts           # ADD Material, Translate providers
│   │
│   └── swift/                              # REMOTE (target)
│       └── src/
│           └── app/
│               ├── app.ts                  # Update
│               ├── app.routes.ts           # ADD all Swift routes
│               ├── app.config.ts           # ADD providers
│               ├── features/
│               │   ├── dashboard/          # MIGRATE from legacy
│               │   │   ├── dashboard.component.ts
│               │   │   ├── dashboard.component.html
│               │   │   ├── dashboard.component.scss
│               │   │   ├── ticket-detail/
│               │   │   │   ├── ticket-detail.component.ts
│               │   │   │   ├── ticket-detail.component.html
│               │   │   │   └── ticket-detail.component.scss
│               │   │   └── tickets-datasource.ts
│               │   └── services/           # MIGRATE from legacy
│               │       ├── services.component.ts
│               │       ├── services.component.html
│               │       ├── services.component.scss
│               │       ├── send-money/
│               │       ├── transactions/
│               │       │   ├── transactions.routes.ts
│               │       │   ├── fund-transfer-mt103/
│               │       │   ├── bulk-upload/
│               │       │   ├── cash-request-*/       (7 sub-types)
│               │       │   ├── normal-mt299/
│               │       │   ├── statement/
│               │       │   └── statement-cancellation/
│               │       └── checker/
│               │           ├── checker.routes.ts
│               │           ├── fund-transfer-mt103/
│               │           ├── cash-request-*/       (7 sub-types)
│               │           └── normal-mt299/
│               └── shared/                 # COPY from legacy
│                   ├── dynamic-form/
│                   ├── documents-upload/
│                   ├── documents-preview/
│                   ├── gl-account-details/
│                   ├── account-details/
│                   ├── typography/
│                   ├── modules/toast/
│                   └── static/
│                       ├── services.ts
│                       ├── menu.ts
│                       └── transfer.ts
```

---

## Migration Order (Dependency Graph)

```
Phase 0: Fix Shell Foundation & Install Deps
    │
    ▼
Phase 1: Routing Architecture (Swift routes, federation config)
    │
    ▼
Phase 2: Shared Services & Infrastructure ──────────────┐
    │                                                     │
    ▼                                                     ▼
Phase 3a: Dashboard Module          Phase 3b-i: Services Layout
    │                                 │
    │                                 ├── send-money
    │                                 ├── transactions (largest)
    │                                 └── checker
    │                                 │
    └───────────────┬─────────────────┘
                    ▼
         Phase 7: Auth Integration
                    │
                    ▼
         Phase 6: Environments & Assets
                    │
                    ▼
         Verification & Testing
```

---

## Risk Register

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R1 | Shell HomeComponent takes longer to fix than estimated | HIGH | HIGH | Start Phase 0 immediately; it's a hard blocker |
| R2 | Missing transitive dependencies (Material icon registry, etc.) | MED | HIGH | Iterative: build → fix → build |
| R3 | FlexLayout→Tailwind visual regressions | MED | HIGH | Review each migrated component; snapshot tests |
| R4 | Transactions module has deeply nested business logic | HIGH | MED | Migrate file-by-file; preserve logic, update syntax |
| R5 | Auth flow broken in MFE context (cookies, redirects) | MED | CRITICAL | Test end-to-end early in Phase 7 |
| R6 | Translation keys duplicated between shell and swift | MED | LOW | Use distinct namespace prefixes per MFE |
| R7 | `@angular/flex-layout` v15 incompatible with Angular 22 | CERTAIN | HIGH | Must remove entirely; no compatibility path |
| R8 | Shell and Swift have different @angular/material versions | MED | HIGH | Use `shareAll` in federation config; singleton |

---

## Acceptance Criteria

### Phase 0 (Shell Foundation)
```bash
pnpm ng build shell     # Exit code 0
pnpm ng serve shell     # Starts without errors
# Navigate to http://localhost:4200
# ✓ Sidenav renders with navigation items
# ✓ Toolbar shows breadcrumb + user info
# ✓ Responsive: sidenav collapses on mobile
```

### Phase 1-2 (Routes + Shared)
```bash
pnpm start:all                       # All 4 servers start
# Navigate to http://localhost:4200/swift/dashboard
# ✓ Dashboard loads inside shell layout (sidenav + topbar visible)
# ✓ No console errors
```

### Phase 3 (Features)
```bash
# Navigate to /swift/services
# ✓ Services page renders
# ✓ send-money form loads
# ✓ transactions page loads with data
# ✓ checker loads
# ✓ All legacy functionality preserved
```

### Phase 4-5 (Syntax Migration)
```bash
ng build swift                       # Exit code 0
# ✓ No @angular/flex-layout in imports
# ✓ No *ngIf/*ngFor/*ngSwitch in templates
# ✓ All components are standalone
```

### Phase 7 (Auth)
```bash
# Unauthenticated → navigate to /swift/dashboard
# ✓ Redirect to /auth
# ✓ After login, redirect back to /swift/dashboard
# ✓ Session persists across MFE boundaries
```

---

## Commands Reference

```bash
# Development
pnpm run start:all              # Start all 4 MFEs concurrently
pnpm ng serve swift --port 4203  # Start only Swift
pnpm ng serve shell --port 4200  # Start only Shell

# Build
pnpm ng build swift              # Build Swift MFE
pnpm ng build shell              # Build Shell
pnpm ng build                    # Build all

# Angular 22 Migration Schematics (run per migrated module)
pnpm ng generate @angular/core:control-flow-migration  # *ngIf→@if etc.
# No schematic for NgModule→Standalone — do manually

# Federation
pnpm ng build swift --configuration development  # Build with dev federation
```
