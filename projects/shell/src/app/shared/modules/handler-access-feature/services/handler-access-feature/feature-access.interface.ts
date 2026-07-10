export interface FeatureAccess {
  name: string;
  subsidiary: FeatureAccessSubsidiary[];
}

interface FeatureAccessSubsidiary {
  name: string;
  enabled: FeatureAccessEnabled[];
}

interface FeatureAccessEnabled {
  dev: boolean;
  uat: boolean;
  pilot: boolean;
  prod: boolean;
}
