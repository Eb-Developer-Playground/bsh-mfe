# Features

In `bsh-mfe`, the most important feature-level mechanism is the **Shell-owned feature flag and feature-flow system**. It controls whether workflows are available for a given subsidiary and whether a route or template surface should render at all.

## What “feature” means in this repo

Feature flags are defined in:

- `projects/shell/src/app/core/feature-flags/feature-flags.model.ts`

Current typed features are:

- `StandingOrder`
- `ChangeOfSignatories`
- `KnownAgentFlow`
- `ChangeOfMandate`
- `ChangeOfSignature`
- `UpdateCifPopUp`

The key project-specific point is that these are **Shell-owned workflow capabilities**, not generic UI toggles.

## Source of truth

The runtime source of truth is:

- `projects/shell/src/environments/environment*.ts`

Each environment exports `featureFlags` that satisfy `FeatureFlagsConfig`.

That config has three layers:

1. `globalDefaults`
   - broad default enablement by feature
2. `bySubsidiary`
   - per-country overrides
3. `actionFlowNames`
   - strict per-subsidiary mapping from feature → allowed flow name

This means a feature in this repo is not simply “on” or “off”. It can be:

- globally enabled
- disabled for a specific subsidiary
- enabled only when a specific action-flow name matches

## The typed model

The shell feature model is strongly typed around:

- `CountryCode`
- `Feature`
- `FeatureFlowName`
- `FeatureFlagsConfig`

Important behavior from `feature-flags.model.ts`:

- `FEATURE_FLOWS` defines the only allowed action-flow names per feature
- `FeatureFlowName<F>` narrows valid flow names for a given feature
- `FeatureFlowSelectionBySubsidiary` is strict: there is **no global fallback flow name**

That “no global flow fallback” rule is important because it means flow-gated behavior fails closed unless the subsidiary is explicitly configured.

## Evaluation service

The central evaluator is:

- `projects/shell/src/app/core/feature-flags/feature-flag.service.ts`

It provides three distinct checks:

### 1. `isEnabled(country, feature)`

Use this when you only care whether the feature is available for the subsidiary.

Resolution order:

- subsidiary override
- global default
- false

### 2. `getConfiguredFlow(country, feature)`

Use this when you need the exact configured flow name for a feature.

Important behavior:

- validates configured values against `FEATURE_FLOWS`
- logs errors in dev mode for invalid flow names
- returns `undefined` when configuration is missing or invalid

### 3. `isActionFlowNameEnabled(country, feature, flow)`

Use this when a workflow should only be available if:

- the feature is enabled, **and**
- the configured subsidiary flow exactly matches the requested flow

This is the strictest feature check in the repo.

## Where feature gating happens

Feature gating is shell-owned and appears in two places:

### Route-level gating

Files:

- `projects/shell/src/app/core/feature-flags/feature-flag.guard.ts`
- `projects/shell/src/app/core/feature-flags/feature-flow.guard.ts`

These guards:

- inject `SessionService`
- derive the current subsidiary from `SessionService.subsidiary`
- evaluate the feature config through `FeatureFlagService`

Behavior split:

- `featureFlagGuard`
  - route allowed when feature is enabled for subsidiary
- `featureFlowGuard`
  - route allowed only when feature is enabled and configured flow exactly matches

So route access depends on **session-derived subsidiary context**, not just static environment flags.

### Template-level gating

Files:

- `projects/shell/src/app/core/feature-flags/feature.directive.ts`
- `projects/shell/src/app/core/feature-flags/feature-flow.directive.ts`

Directives:

- `appIsFeatureEnabled`
- `appIsFeatureFlow`

These are structural directives that show/hide UI based on the same shell-owned policy model used by the guards.

That keeps route gating and template gating aligned around one evaluator instead of duplicating feature rules in components.

## Architectural boundary

The real model is:

- Shell owns the feature policy
- environment files own the configuration
- session/subsidiary context selects the effective policy
- remotes participate indirectly by being mounted through shell routes or by depending on shell-auth state

## Relationship to navigation

Feature flags and navigation are coupled, but they are not the same thing.

Navigation answers:

- where the user can go
- which remote is mounted at a route
- whether auth redirect/login flow is needed

Feature flags answer:

- whether a workflow should be visible or routable for a subsidiary
- whether a specific action flow is valid for that feature

That means a route can exist in the shell and still be unavailable because feature policy blocks it.

## Current feature ownership boundaries

### Shell owns

- feature flag types and config model
- route guards
- template directives
- subsidiary-aware evaluation
- environment-based enablement rules

### Remotes own

- their internal UI once mounted
- remote auth subscription via `equity-auth`
- any local workflow implementation details behind shell-mounted routes

### Equity Auth owns

- shared auth-state and auth-command transport
- not feature policy

## Practical rules for future edits

- Add new feature names in `feature-flags.model.ts`
- Add new environment configuration in every relevant `environment*.ts`
- If a route should be feature-gated, use the shell guards instead of ad hoc component checks
- If UI visibility should match route visibility, prefer the feature directives instead of duplicating conditionals
- Preserve the strict flow-validation behavior unless you intentionally want open-ended flow names
- If feature rules change, verify the shell build at minimum:
  - `pnpm ng build shell --configuration development`

Feature architecture in this repo is anchored in the shell’s `core/feature-flags/` folder plus the environment configuration, not in remote-specific registries or fragment manifests.
