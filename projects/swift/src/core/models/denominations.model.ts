// Proxy — resolves relative ../../../../core/models/denominations.model from transactions components
export interface Denomination {
  id?: string;
  currency?: string;
  amount?: number;
  quantity?: number;
  [key: string]: any;
}

export interface DenominationFormAttributes {
  fieldName: string;
  label: string;
  required?: boolean;
  type?: string;
  defaultValue?: any;
  [key: string]: any;
}

export interface DenominationDeliveryFormAttributes {
  deliveryMethod?: string;
  currency?: string;
  amount?: number;
  name?: string;
  PFName?: string;
  [key: string]: any;
}

export const DENOMINATION_FORM_ATTRIBUTES: DenominationFormAttributes[] = [];
