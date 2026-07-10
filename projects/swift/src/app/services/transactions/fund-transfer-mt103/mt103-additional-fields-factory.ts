import { ADDITIONAL_FIELDS } from './mt103-field-definitions';

export function createAdditionalFields(remittanceInfoMaxLength: number): any[] {
  return ADDITIONAL_FIELDS.map(field => ({
    ...field,
    ...(field.key === 'RemittanceInfo1' ? { required: true } : {}),
    maximum: remittanceInfoMaxLength,
  }));
}
