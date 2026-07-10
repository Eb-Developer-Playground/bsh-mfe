import { Injectable, isDevMode } from '@angular/core';

import { environment } from '../../../environments/environment';
import {
  CountryCode,
  Feature,
  FeatureFlagsConfig,
  FEATURE_FLOWS,
  FeatureFlowName,
} from './feature-flags.model';

/**
 * Service to manage feature flags.
 * This service provides methods to check the status of feature flags
 * for different subsidiaries and environments.
 */
@Injectable({ providedIn: 'root' })
export class FeatureFlagService {
  private readonly cfg: FeatureFlagsConfig = environment.featureFlags;

  // We can add api calls here once BE is ready to manage feature flags

  /** Feature enabled for subsidiary? (override → global → false) */
  isEnabled(country: CountryCode, feature: Feature): boolean {
    const sub = this.cfg.bySubsidiary?.[country];
    return sub?.[feature] ?? this.cfg.globalDefaults?.[feature] ?? false;
  }

  /** Return the exact configured action flow name for (country, feature) or undefined if not configured. */
  getConfiguredFlow<F extends Feature>(
    country: CountryCode,
    feature: F
  ): FeatureFlowName<F> | undefined {
    const flow = this.cfg.actionFlowNames?.[country]?.[feature] as
      | FeatureFlowName<F>
      | undefined;
    if (!flow) return undefined;

    // Validate against allowed set to catch typos at runtime (compile-time helps too)
    const allowed = FEATURE_FLOWS[feature] as readonly string[];
    if (!allowed.includes(flow)) {
      if (isDevMode()) {
        console.error(
          `[FeatureFlags] Invalid flow "${flow}" for ${feature} in ${country}. Allowed: ${allowed.join(', ')}`
        );
      }
      return undefined;
    }
    return flow;
  }

  /**
   * Strict: Feature must be enabled AND configured flow must exactly match `flow`.
   * No fallback. If no action flow name is configured for that subsidiary, returns false.
   */
  isActionFlowNameEnabled<F extends Feature>(
    country: CountryCode,
    feature: F,
    flow: FeatureFlowName<F>
  ): boolean {
    if (!this.isEnabled(country, feature)) return false;
    const configured = this.getConfiguredFlow(country, feature);
    return configured === flow;
  }

  /**
   * Assertive version: throws in dev if misconfigured (useful for guards/bootstrap).
   * In prod, fails closed (returns false) without throwing.
   */
  assertFlowEnabled<F extends Feature>(
    country: CountryCode,
    feature: F,
    flow: FeatureFlowName<F>
  ): boolean {
    const ok = this.isActionFlowNameEnabled(country, feature, flow);
    if (!ok && isDevMode()) {
      const configured = this.getConfiguredFlow(country, feature);
      throw new Error(
        `[FeatureFlags] Flow mismatch for ${feature} in ${country}. ` +
          `Requested: ${flow}. Configured: ${configured ?? 'NONE'}.`
      );
    }
    return ok;
  }
}
