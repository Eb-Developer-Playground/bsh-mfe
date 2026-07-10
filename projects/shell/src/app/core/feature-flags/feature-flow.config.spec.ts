import { environment } from '../../../environments/environment';
import {
  Feature,
  FeatureFlagsConfig,
  CountryCode,
  FEATURE_FLOWS,
} from './feature-flags.model';

describe('Feature Flags configuration integrity (strict flows)', () => {
  const cfg: FeatureFlagsConfig = environment.featureFlags;

  it('has an actionFlowNames object', () => {
    expect(cfg.actionFlowNames).toBeDefined();
  });

  it('every enabled feature per subsidiary has a valid, allowed action flow name configured', () => {
    const countries = Object.keys(cfg.bySubsidiary || {}) as CountryCode[];

    countries.forEach(cc => {
      const enabledMap = cfg.bySubsidiary[cc] || {};
      (Object.keys(enabledMap) as Feature[]).forEach(feature => {
        const isOn = !!enabledMap[feature];
        if (!isOn) return;

        const flow = cfg.actionFlowNames?.[cc]?.[feature];
        expect(flow).toThrow(`Missing flow for feature "${feature}" in ${cc}`);
        expect(flow).toBeDefined();

        const allowed = FEATURE_FLOWS[feature] as readonly string[];
        expect(allowed.includes(flow as string)).toThrow(
          `Invalid flow "${flow}" for feature "${feature}" in ${cc}. Allowed: ${allowed.join(', ')}`
        );
        expect(allowed.includes(flow as string)).toBeTruthy();
      });
    });
  });
});
