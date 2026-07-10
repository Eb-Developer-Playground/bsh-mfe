# Customer360 Legacy App → MFE Remote Migration Plan

## Overview

**Source**: `/Users/owen_adirah/WebstormProjects/Customer360Web` (Angular 17, NgModule-based)
**Target**: `/Users/owen_adirah/WebstormProjects/bsh-mfe/projects/customer360` (Angular 22, Native Federation MFE)

The goal is to migrate the legacy Customer360Web app into the existing `bsh-mfe` monorepo as a remote micro-frontend, with the **shell project** serving as the orchestrator that hosts the sidenav, topbar, and breadcrumb - while Customer360 becomes a lazy-loaded remote module.

---

## Current Architecture Analysis

### Legacy App (Customer360Web)
```
┌─────────────────────────────────────────────────────────┐
│  AppComponent (root)                                     │
│  └─► AppModule → AppRoutingModule                       │
│       ├─► /auth → AuthModule (lazy)                      │
│       ├─► /guides → GuidesModule (lazy)                  │
│       ├─► /v2 → Version2Module (lazy)                    │
│       └─► /* → HomeModule (lazy, guarded)                │
│            └─► HomeComponent (SHELL LAYOUT)              │
│                 ├─► mat-sidenav → NavigationComponent    │
│                 ├─► mat-toolbar → TopBar                 │
│                 └─► <router-outlet> → Features          │
│                      ├─► /dashboard → DashboardModule    │
│                      ├─► /services → SearchModule        │
│                      └─► /tickets → TicketsModule        │
└─────────────────────────────────────────────────────────┘
```

**Key observations:**
- `HomeComponent` IS the shell - contains sidenav + topbar + router-outlet
- Navigation is role-based via `BSHServices.MENU_ITEMS`
- Heavy use of NgRx, Angular Material, ngx-translate
- 200+ routing modules across features
- Uses `@angular/flex-layout` (deprecated, needs replacement)

### Host App (bsh-mfe shell)
```
┌─────────────────────────────────────────────────────────┐
│  App (root)                                              │
│  └─► Routes:                                             │
│       ├─► /* → Home (shell layout)                       │
│       ├─► /customer360 → loadRemoteModule('customer360') │
│       ├─► /onboarding → loadRemoteModule('onboarding')   │
│       └─► /swift → loadRemoteModule('swift')             │
└─────────────────────────────────────────────────────────┘
```

**Current shell already has:**
- `HomeComponent` with sidenav + topbar (matches legacy layout)
- `NavigationComponent` with menu items
- SessionService, BSHServices
- Shared services, directives, interceptors

---

## Migration Strategy

### Phase 1: Extract Shell Layout to Shell Project (Week 1-2)

**Goal**: The shell project already has the sidenav/topbar. Enhance it to be the unified entry point.

#### 1.1 Enhance Shell's Home Component
```
projects/shell/src/app/home/
├── home.ts                    # Already exists - enhance with legacy features
├── home.html                  # Already exists - merge legacy features
├── navigation/
│   └── navigation.component.ts  # Already exists - sync menu items
├── breadcrumb/                # NEW - extract from legacy
├── topbar/                    # NEW - extract from legacy
└── material.module.ts         # NEW - Angular Material imports
```

**Action Items:**
- [ ] Port the legacy `BreadcrumbComponent` to shell
- [ ] Port the legacy `NetworkSpeedComponent` to shell
- [ ] Sync `BSHServices.MENU_ITEMS` with legacy menu structure
- [ ] Add locale/language selector to topbar
- [ ] Add user profile menu to topbar

#### 1.2 Shared Services Migration
```
projects/shell/src/app/shared/
├── services/
│   ├── session/           # ✅ Already exists
│   ├── bsh-services.ts    # ✅ Already exists - sync with legacy
│   ├── localization/      # ⚠️  Merge legacy localization module
│   └── customer/          # ✅ Already exists
├── interceptors/          # ✅ Already exists
├── directives/            # ✅ Already exists
└── models/                # ⚠️  Add missing models from legacy
```

---

### Phase 2: Migrate Customer360 Feature Modules (Week 3-6)

**Goal**: Move feature modules from legacy app into the `customer360` remote project.

#### 2.1 Module Extraction Order (by dependency)

| Priority | Module | Route | Dependencies |
|----------|--------|-------|--------------|
| 1 | SearchModule | /services | Core services only |
| 2 | DashboardModule | /dashboard | NgRx store |
| 3 | TicketsModule | /tickets | NgRx store |
| 4 | CustomerModule | /customer/* | All shared services |
| 5 | OverviewModule | /overview | Customer data |
| 6 | TransactionsModule | /transactions | Customer data |
| 7 | AccountsModule | /accounts | Customer data |
| 8 | CardsModule | /cards | Customer data |
| 9 | LoansModule | /loans | Customer data |
| 10 | MoveMoneyModule | /move-money | Customer data |

#### 2.2 Migration Pattern per Module

For each feature module:

```
1. COPY module directory from legacy to projects/customer360/src/app/features/
2. CONVERT NgModule → Standalone Components (Angular 22)
3. UPDATE imports to use shell's shared services
4. ADD route to customer360's app.routes.ts
5. UPDATE federation.config.mjs to expose new components
6. TEST in isolation, then test loaded in shell
```

**Example - SearchModule migration:**
```typescript
// BEFORE (legacy - NgModule)
@NgModule({
  declarations: [SearchComponent],
  imports: [SearchRoutingModule, MaterialModule, ...]
})
export class SearchModule {}

// AFTER (MFE - Standalone)
@Component({
  selector: 'app-search',
  imports: [MaterialModule, TranslatePipe, ...],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export default class SearchComponent {}
```

---

### Phase 3: Update Routing Configuration (Week 4-5)

#### 3.1 Shell Routes (projects/shell/src/app/app.routes.ts)
```typescript
export const routes: Routes = [
  {
    path: '',
    component: App,
    resolve: { lang: () => preferenceResolver() },
    children: [
      {
        path: '',
        loadChildren: () => import('./home/home').then(m => m.Home),
      },
      {
        path: 'customer360',
        loadChildren: () =>
          loadRemoteModule('customer360', './Routes')
            .then(m => m.routes),
      },
      {
        path: 'onboarding',
        loadComponent: () =>
          loadRemoteModule('onboarding', './Component')
            .then(m => m.App),
      },
      {
        path: 'swift',
        loadComponent: () =>
          loadRemoteModule('swift', './Component')
            .then(m => m.App),
      },
    ],
  },
];
```

#### 3.2 Customer360 Remote Routes (projects/customer360/src/app/app.routes.ts)
```typescript
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'services',
        loadChildren: () =>
          import('./features/search/search.routes')
            .then(m => m.SEARCH_ROUTES),
      },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes')
            .then(m => m.DASHBOARD_ROUTES),
      },
      {
        path: 'tickets',
        loadChildren: () =>
          import('./features/tickets/tickets.routes')
            .then(m => m.TICKETS_ROUTES),
      },
      {
        path: '**',
        redirectTo: 'services',
      },
    ],
  },
];

export default routes;
```

#### 3.3 Federation Config Update (projects/customer360/federation.config.mjs)
```javascript
export default withNativeFederation({
  name: 'customer360',
  exposes: {
    './Component': './projects/customer360/src/app/app.ts',
    './Routes': './projects/customer360/src/app/app.routes.ts',
  },
  // ... rest unchanged
});
```

---

### Phase 4: Shared State Management (Week 5-6)

#### 4.1 NgRx Store Migration

The legacy app uses NgRx extensively. For the MFE migration:

```
Option A: Shell holds NgRx store (RECOMMENDED)
├── Shell provides StoreModule.forRoot()
├── Customer360 remote imports StoreModule.forFeature()
├── Feature selectors shared via barrel exports
└── Effects registered in feature modules

Option B: Each MFE has independent store
├── Shell provides base store (auth, session)
├── Each remote has own StoreModule.forRoot()
└── Communication via custom events / URL params
```

**Recommendation**: Option A (shared store in shell) for:
- Single source of truth
- Easier debugging
- Consistent auth state
- Shared customer context

#### 4.2 Session/Auth State Sharing

```typescript
// Shell provides
@Injectable({ providedIn: 'root' })
export class SessionService {
  // Already exists in shell
  // Customer360 remote injects this same instance
}

// Customer360 remote consumes
@Component({ ... })
export class SearchComponent {
  private session = inject(SessionService); // Shell's instance
}
```

---

### Phase 5: Styling & Assets Migration (Week 6-7)

#### 5.1 Styles Structure
```
projects/customer360/src/
├── styles/
│   ├── _variables.scss         # Extract from legacy
│   ├── _mixins.scss            # Extract from legacy
│   ├── _typography.scss        # Extract from legacy
│   └── _animations.scss        # Extract from legacy
├── styles.css                  # Import shared styles
└── assets/
    ├── logos/                   # Copy from legacy
    ├── icons/                   # Copy from legacy
    └── i18n/                    # Translation files
```

#### 5.2 Asset Configuration
```json
// angular.json - customer360 project
{
  "assets": [
    {
      "glob": "**/*",
      "input": "projects/customer360/public"
    }
  ]
}
```

---

### Phase 6: Testing & Validation (Week 7-8)

#### 6.1 Testing Matrix

| Test Type | Tool | Scope |
|-----------|------|-------|
| Unit Tests | Vitest | Individual components |
| Integration | Vitest | Module interactions |
| E2E | Playwright | Full MFE flow |
| Visual Regression | Playwright screenshot | UI consistency |

#### 6.2 Validation Checklist

- [ ] Shell loads with sidenav and topbar
- [ ] Navigation menu items are correct
- [ ] Customer360 loads when clicking "Customer Services"
- [ ] All routes work within Customer360
- [ ] NgRx state persists across navigation
- [ ] Session/auth works correctly
- [ ] Translations load properly
- [ ] Responsive design works
- [ ] No console errors
- [ ] Performance < 3s initial load

---

## File Structure Target

```
bsh-mfe/
├── projects/
│   ├── shell/                          # HOST (orchestrator)
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── home/
│   │   │   │   │   ├── home.ts
│   │   │   │   │   ├── home.html
│   │   │   │   │   ├── navigation/
│   │   │   │   │   ├── breadcrumb/
│   │   │   │   │   └── topbar/
│   │   │   │   ├── shared/
│   │   │   │   │   ├── services/
│   │   │   │   │   ├── interceptors/
│   │   │   │   │   └── models/
│   │   │   │   ├── app.ts
│   │   │   │   └── app.routes.ts
│   │   │   └── styles/
│   │   └── federation.config.mjs
│   │
│   ├── customer360/                    # REMOTE (feature)
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── features/
│   │   │   │   │   ├── search/
│   │   │   │   │   ├── dashboard/
│   │   │   │   │   ├── tickets/
│   │   │   │   │   ├── customer/
│   │   │   │   │   └── ...
│   │   │   │   ├── shared/
│   │   │   │   │   ├── components/
│   │   │   │   │   └── services/
│   │   │   │   ├── app.ts
│   │   │   │   └── app.routes.ts
│   │   │   └── styles/
│   │   └── federation.config.mjs
│   │
│   ├── onboarding/                     # REMOTE (existing)
│   └── swift/                          # REMOTE (existing)
│
├── angular.json
├── package.json
└── pnpm-lock.yaml
```

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Angular version mismatch (17→22) | High | Incremental migration, test each module |
| NgRx compatibility | Medium | Upgrade to latest NgRx, test store hydration |
| Shared dependencies version conflicts | High | Use `shareAll()` with strict versioning |
| Breaking changes in Angular Material 17→22 | Medium | Update components incrementally |
| Lost state during navigation | High | Implement state persistence strategy |
| Translation file conflicts | Low | Use separate i18n files per MFE |

---

## Success Criteria

1. ✅ Shell project hosts sidenav, topbar, and breadcrumb
2. ✅ Customer360 loads as a remote MFE
3. ✅ All existing features work in the new architecture
4. ✅ Performance is equal or better than legacy
5. ✅ No regression in user experience
6. ✅ Team can develop features independently per MFE
