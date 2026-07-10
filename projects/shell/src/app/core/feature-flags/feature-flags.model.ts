export type CountryCode = 'KE' | 'UG' | 'TZ' | 'CD' | 'RW' | 'SS';

/**
 * Main Feature on 360
 */
export enum Feature {
  StandingOrder = 'StandingOrder',
  ChangeOfSignatories = 'ChangeOfSignatories',
  KnownAgent = 'KnownAgentFlow',
  ChangeofMandate = 'ChangeOfMandate',
  ChangeOfSignature = 'ChangeOfSignature',
  UpdateCifPopUp = 'UpdateCifPopUp'
  // Add more features
}

/**
 * List of allowed action flow names for each feature
 */
export const FEATURE_FLOWS = {
  [Feature.StandingOrder]: ['StandingOrder'] as const,
  [Feature.ChangeOfSignatories]: ['ChangeOfSignatories'] as const,
  [Feature.KnownAgent]: ['KnownAgentFlow'] as const,
  [Feature.ChangeofMandate]: ['ChangeOfMandate'] as const,
  [Feature.ChangeOfSignature]: ['ChangeOfSignature'] as const,
  [Feature.UpdateCifPopUp]: ['UpdateCifPopUp'] as const,
  // Add more action flow names for each feature
} as const;

export type FeatureFlowName<F extends Feature = Feature> =
  (typeof FEATURE_FLOWS)[F][number];

export type FeatureMatrix = Partial<Record<Feature, boolean>>;

/**
 * Per-subsidiary flow selection (strict: no global/default flow)
 */
export type FeatureFlowSelectionBySubsidiary = Partial<
  Record<CountryCode, Partial<{ [F in Feature]: FeatureFlowName<F> }>>
>;

export interface FeatureFlagsConfig {
  globalDefaults: FeatureMatrix;
  bySubsidiary: Record<CountryCode, FeatureMatrix>;
  actionFlowNames: FeatureFlowSelectionBySubsidiary;
}
