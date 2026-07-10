import { FeatureFlagService } from './feature-flag.service';
import { environment } from '../../../environments/environment';
import {
  Feature,
  FeatureFlagsConfig,
  CountryCode,
} from './feature-flags.model';

describe('FeatureFlagService (strict flows)', () => {
  const originalCfg: FeatureFlagsConfig = environment.featureFlags;

  afterAll(() => {
    // restore original env after all tests
    (environment as any).featureFlags = originalCfg;
  });

  function setCfg(cfg: FeatureFlagsConfig) {
    (environment as any).featureFlags = cfg;
  }

  function createService() {
    // Service reads environment.featureFlags
    return new FeatureFlagService();
  }

  const KE: CountryCode = 'KE';
  const UG: CountryCode = 'UG';
  const TZ: CountryCode = 'TZ';
  const CD: CountryCode = 'CD';
  const RW: CountryCode = 'RW';
  const SS: CountryCode = 'SS';

  it('returns false when feature disabled and no global default', () => {
    const cfg: FeatureFlagsConfig = {
      globalDefaults: {}, // no defaults
      bySubsidiary: {
        KE: {},
        UG: {},
        TZ: {},
        CD: {},
        RW: {},
        SS: {},
      },
      actionFlowNames: {},
    };
    setCfg(cfg);
    const svc = createService();

    expect(svc.isEnabled(KE, Feature.StandingOrder)).toBeFalsy();
    expect(
      svc.isActionFlowNameEnabled(
        KE,
        Feature.StandingOrder,
        'StandingOrder' as any
      )
    ).toBeFalsy();
  });

  it('uses subsidiary override over global default for enablement', () => {
    const cfg: FeatureFlagsConfig = {
      globalDefaults: { [Feature.StandingOrder]: true }, // global ON
      bySubsidiary: {
        KE: { [Feature.StandingOrder]: false }, // KE OFF
        UG: {}, // UG ON
        TZ: { [Feature.StandingOrder]: false }, // TZ OFF
        CD: {},
        RW: { [Feature.StandingOrder]: false }, // RW OFF
        SS: {}, // SS ON
      },
      actionFlowNames: {
        KE: { [Feature.StandingOrder]: 'StandingOrder' },
        UG: { [Feature.StandingOrder]: 'StandingOrder' },
        TZ: { [Feature.StandingOrder]: 'StandingOrder' },
        CD: { [Feature.StandingOrder]: 'StandingOrder' },
        RW: { [Feature.StandingOrder]: 'StandingOrder' },
        SS: { [Feature.StandingOrder]: 'StandingOrder' },
      },
    };
    setCfg(cfg);
    const svc = createService();

    expect(svc.isEnabled(KE, Feature.StandingOrder)).toBeFalsy();
    expect(svc.isEnabled(UG, Feature.StandingOrder)).toBeTruthy();
    expect(svc.isEnabled(TZ, Feature.StandingOrder)).toBeFalsy();
    expect(svc.isEnabled(CD, Feature.StandingOrder)).toBeTruthy();
    expect(svc.isEnabled(RW, Feature.StandingOrder)).toBeFalsy();
    expect(svc.isEnabled(SS, Feature.StandingOrder)).toBeTruthy();
  });

  it('strict flow: enabled + correct flow ⇒ true', () => {
    const cfg: FeatureFlagsConfig = {
      globalDefaults: {},
      bySubsidiary: {
        KE: { [Feature.StandingOrder]: true },
        UG: { [Feature.StandingOrder]: true },
        TZ: { [Feature.StandingOrder]: true },
        CD: { [Feature.StandingOrder]: true },
        RW: { [Feature.StandingOrder]: true },
        SS: { [Feature.StandingOrder]: true },
      },
      actionFlowNames: {
        KE: { [Feature.StandingOrder]: 'StandingOrder' },
        UG: { [Feature.StandingOrder]: 'StandingOrder' },
        TZ: { [Feature.StandingOrder]: 'StandingOrder' },
        CD: { [Feature.StandingOrder]: 'StandingOrder' },
        RW: { [Feature.StandingOrder]: 'StandingOrder' },
        SS: { [Feature.StandingOrder]: 'StandingOrder' },
      },
    };
    setCfg(cfg);
    const svc = createService();

    expect(
      svc.isActionFlowNameEnabled(KE, Feature.StandingOrder, 'StandingOrder')
    ).toBeTruthy();
    expect(
      svc.isActionFlowNameEnabled(UG, Feature.StandingOrder, 'StandingOrder')
    ).toBeTruthy();
    expect(
      svc.isActionFlowNameEnabled(TZ, Feature.StandingOrder, 'StandingOrder')
    ).toBeTruthy();
    expect(
      svc.isActionFlowNameEnabled(CD, Feature.StandingOrder, 'StandingOrder')
    ).toBeTruthy();
    expect(
      svc.isActionFlowNameEnabled(RW, Feature.StandingOrder, 'StandingOrder')
    ).toBeTruthy();
    expect(
      svc.isActionFlowNameEnabled(SS, Feature.StandingOrder, 'StandingOrder')
    ).toBeTruthy();
  });

  it('strict flow: enabled + WRONG flow ⇒ false', () => {
    const cfg: FeatureFlagsConfig = {
      globalDefaults: {},
      bySubsidiary: {
        KE: { [Feature.StandingOrder]: true },
        UG: { [Feature.StandingOrder]: true },
        TZ: { [Feature.StandingOrder]: true },
        CD: { [Feature.StandingOrder]: true },
        RW: { [Feature.StandingOrder]: true },
        SS: { [Feature.StandingOrder]: true },
      },
      actionFlowNames: {
        KE: { [Feature.StandingOrder]: 'StandingOrder' },
        UG: { [Feature.StandingOrder]: 'StandingOrder' },
        TZ: { [Feature.StandingOrder]: 'StandingOrder' },
        CD: { [Feature.StandingOrder]: 'StandingOrder' },
        RW: { [Feature.StandingOrder]: 'StandingOrder' },
        SS: { [Feature.StandingOrder]: 'StandingOrder' },
      },
    };
    setCfg(cfg);
    const svc = createService();

    expect(
      svc.isActionFlowNameEnabled(
        KE,
        Feature.StandingOrder,
        'StandingOrderV3KE' as any
      )
    ).toBeFalsy();
    expect(
      svc.isActionFlowNameEnabled(
        UG,
        Feature.StandingOrder,
        'StandingOrderV3UG' as any
      )
    ).toBeFalsy();
    expect(
      svc.isActionFlowNameEnabled(
        TZ,
        Feature.StandingOrder,
        'StandingOrderV3TZ' as any
      )
    ).toBeFalsy();
    expect(
      svc.isActionFlowNameEnabled(
        CD,
        Feature.StandingOrder,
        'StandingOrderV3CD' as any
      )
    ).toBeFalsy();
    expect(
      svc.isActionFlowNameEnabled(
        RW,
        Feature.StandingOrder,
        'StandingOrderV3RW' as any
      )
    ).toBeFalsy();
    expect(
      svc.isActionFlowNameEnabled(
        SS,
        Feature.StandingOrder,
        'StandingOrderV3SS' as any
      )
    ).toBeFalsy();
  });

  it('strict flow: enabled + NO configured flow ⇒ false', () => {
    const cfg: FeatureFlagsConfig = {
      globalDefaults: {},
      bySubsidiary: {
        KE: { [Feature.StandingOrder]: true },
        UG: { [Feature.StandingOrder]: true },
        TZ: { [Feature.StandingOrder]: true },
        CD: { [Feature.StandingOrder]: true },
        RW: { [Feature.StandingOrder]: true },
        SS: { [Feature.StandingOrder]: true },
      },
      actionFlowNames: {}, // missing flow config intentionally
    };
    setCfg(cfg);
    const svc = createService();

    expect(
      svc.isActionFlowNameEnabled(
        KE,
        Feature.StandingOrder,
        'StandingOrder' as any
      )
    ).toBeFalsy();
    expect(
      svc.isActionFlowNameEnabled(
        UG,
        Feature.StandingOrder,
        'StandingOrder' as any
      )
    ).toBeFalsy();
    expect(
      svc.isActionFlowNameEnabled(
        TZ,
        Feature.StandingOrder,
        'StandingOrder' as any
      )
    ).toBeFalsy();
    expect(
      svc.isActionFlowNameEnabled(
        CD,
        Feature.StandingOrder,
        'StandingOrder' as any
      )
    ).toBeFalsy();
    expect(
      svc.isActionFlowNameEnabled(
        RW,
        Feature.StandingOrder,
        'StandingOrder' as any
      )
    ).toBeFalsy();
    expect(
      svc.isActionFlowNameEnabled(
        SS,
        Feature.StandingOrder,
        'StandingOrder' as any
      )
    ).toBeFalsy();
  });

  it('assertFlowEnabled: returns true if available', () => {
    const cfg: FeatureFlagsConfig = {
      globalDefaults: {},
      bySubsidiary: {
        KE: { [Feature.StandingOrder]: true },
        UG: { [Feature.StandingOrder]: true },
        TZ: { [Feature.StandingOrder]: true },
        CD: { [Feature.StandingOrder]: true },
        RW: { [Feature.StandingOrder]: true },
        SS: { [Feature.StandingOrder]: true },
      },
      actionFlowNames: {
        KE: { [Feature.StandingOrder]: 'StandingOrder' },
        UG: { [Feature.StandingOrder]: 'StandingOrder' },
        TZ: { [Feature.StandingOrder]: 'StandingOrder' },
        CD: { [Feature.StandingOrder]: 'StandingOrder' },
        RW: { [Feature.StandingOrder]: 'StandingOrder' },
        SS: { [Feature.StandingOrder]: 'StandingOrder' },
      },
    };
    setCfg(cfg);
    const svc = createService();

    expect(
      svc.isActionFlowNameEnabled(
        KE,
        Feature.StandingOrder,
        'StandingOrder' as any
      )
    ).toBeTruthy();
    expect(
      svc.isActionFlowNameEnabled(
        UG,
        Feature.StandingOrder,
        'StandingOrder' as any
      )
    ).toBeTruthy();
    expect(
      svc.isActionFlowNameEnabled(
        TZ,
        Feature.StandingOrder,
        'StandingOrder' as any
      )
    ).toBeTruthy();
    expect(
      svc.isActionFlowNameEnabled(
        CD,
        Feature.StandingOrder,
        'StandingOrder' as any
      )
    ).toBeTruthy();
    expect(
      svc.isActionFlowNameEnabled(
        RW,
        Feature.StandingOrder,
        'StandingOrder' as any
      )
    ).toBeTruthy();
    expect(
      svc.isActionFlowNameEnabled(
        SS,
        Feature.StandingOrder,
        'StandingOrder' as any
      )
    ).toBeTruthy();
  });

  it('feature disabled ⇒ strict flow check is false even if flow configured', () => {
    const cfg: FeatureFlagsConfig = {
      globalDefaults: {},
      bySubsidiary: {
        KE: { [Feature.StandingOrder]: false }, // disabled
        UG: { [Feature.StandingOrder]: false }, // disabled
        TZ: { [Feature.StandingOrder]: false }, // disabled
        CD: { [Feature.StandingOrder]: false }, // disabled
        RW: { [Feature.StandingOrder]: false }, // disabled
        SS: { [Feature.StandingOrder]: false }, // disabled
      },
      actionFlowNames: {
        KE: { [Feature.StandingOrder]: 'StandingOrder' },
        UG: { [Feature.StandingOrder]: 'StandingOrder' },
        TZ: { [Feature.StandingOrder]: 'StandingOrder' },
        CD: { [Feature.StandingOrder]: 'StandingOrder' },
        RW: { [Feature.StandingOrder]: 'StandingOrder' },
        SS: { [Feature.StandingOrder]: 'StandingOrder' },
      },
    };
    setCfg(cfg);
    const svc = createService();

    expect(
      svc.isActionFlowNameEnabled(KE, Feature.StandingOrder, 'StandingOrder')
    ).toBeFalsy();
    expect(
      svc.isActionFlowNameEnabled(UG, Feature.StandingOrder, 'StandingOrder')
    ).toBeFalsy();
    expect(
      svc.isActionFlowNameEnabled(TZ, Feature.StandingOrder, 'StandingOrder')
    ).toBeFalsy();
    expect(
      svc.isActionFlowNameEnabled(CD, Feature.StandingOrder, 'StandingOrder')
    ).toBeFalsy();
    expect(
      svc.isActionFlowNameEnabled(RW, Feature.StandingOrder, 'StandingOrder')
    ).toBeFalsy();
    expect(
      svc.isActionFlowNameEnabled(SS, Feature.StandingOrder, 'StandingOrder')
    ).toBeFalsy();
  });
});
