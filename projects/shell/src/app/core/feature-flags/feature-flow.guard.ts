import { inject, isDevMode } from '@angular/core';
import { CanMatchFn, Route } from '@angular/router';

import { SessionService } from '@app/shared/services/session/session.service';
import { FeatureFlagService } from './feature-flag.service';
import { CountryCode, Feature, FeatureFlowName } from './feature-flags.model';

/**
 * Feature flow guard to control access to routes based on feature flags.
 * @param route The route to check for feature flags. Pass the feature name in the route
 * @returns A boolean indicating whether the route can be activated.
 */
export const featureFlowGuard: CanMatchFn = (route: Route) => {
  const flags = inject(FeatureFlagService);
  const sessionService = inject(SessionService);
  const subsidiary = sessionService.subsidiary;

  const data = route.data as
    | {
        title: string;
        breadcrumb: string;
        feature: Feature;
        flow: FeatureFlowName;
      }
    | undefined;
  if (!data) return true;

  const ok = flags.isActionFlowNameEnabled(
    subsidiary.countryCode as CountryCode,
    data.feature,
    data.flow
  );
  if (!ok && isDevMode()) {
    const configured = flags.getConfiguredFlow(
      subsidiary.countryCode as CountryCode,
      data.feature
    );
    console.error(
      `[FeatureFlags] Route blocked. ${data.feature} in ${subsidiary.countryCode} requires flow "${data.flow}". ` +
        `Configured: ${configured ?? 'NONE'}.`
    );
  }

  return ok;
};
