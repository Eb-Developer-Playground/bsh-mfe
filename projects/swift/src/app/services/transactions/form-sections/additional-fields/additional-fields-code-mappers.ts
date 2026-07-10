import { BankDetails, BranchDetails, PurposeCode } from '@shared/documents-upload-drc/models';

import { AdditionalFieldBranchOption, AdditionalFieldCodeOption } from './additional-fields-code-filters';

export interface AdditionalFieldLicensePurposeOption {
  value: string;
  text: string;
  label: string;
}

export function mapPurposeCodeOptions(codes: PurposeCode[]): AdditionalFieldCodeOption[] {
  return codes.map(code => ({
    value: code.value,
    code: code.code,
    label: `${code.code} - ${code.value}`,
  }));
}

export function mapRtgsPurposeCodeOptions(
  codes: Array<{ code: string; description?: string; value?: string }>
): AdditionalFieldCodeOption[] {
  return codes.map(code => ({
    value: code.description || code.value || '',
    code: code.code,
    label: `${code.code} - ${code.description || code.value || ''}`,
    disabled: code.code === 'OTHR',
  }));
}

export function mapBankCodeOptions(codes: BankDetails[]): AdditionalFieldCodeOption[] {
  return codes.map(code => ({
    value: code.bankCode,
    code: code.bankCode,
    label: `${code.bankCode} - ${code.bankName}`,
  }));
}

export function mapBranchCodeOptions(codes: BranchDetails[]): AdditionalFieldBranchOption[] {
  return codes.map(code => ({
    value: code.branchCode,
    code: code.branchCode,
    label: `${code.branchCode} - ${code.name || code.shortName}`,
    bankCode: code.bankCode,
    shortName: code.shortName,
    name: code.name,
  }));
}

export function mapLicensePurposeCodeOptions(
  codes: Array<{ value: string; text: string }>
): AdditionalFieldLicensePurposeOption[] {
  return codes.map(code => ({
    value: code.value,
    text: code.text,
    label: `${code.value} - ${code.text}`,
  }));
}

export function resolveIbanLength(userCountryCode: string, transactionType?: string): number | null {
  switch (userCountryCode.toLowerCase()) {
    case 'cd':
      return transactionType === 'RTGS' || transactionType === 'LOCALSWIFT' || transactionType === 'SWIFT LOCAL'
        ? 23
        : null;
    default:
      return null;
  }
}
