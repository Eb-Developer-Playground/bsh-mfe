import { LicensePurposeCode, PurposeCode } from '@shared/documents-upload-drc/models';

export interface AdditionalFieldCodeOption {
  value: string;
  code: string;
  label: string;
  disabled?: boolean;
}

export interface AdditionalFieldBranchOption extends AdditionalFieldCodeOption {
  bankCode?: string;
  shortName?: string;
  name?: string;
}

export function filterPurposeCodeOptions(codes: PurposeCode[], search: string): PurposeCode[] {
  if (!codes?.length) {
    return [];
  }

  const searchTerm = search.trim().toLowerCase();

  return searchTerm ? codes.filter(code => code.value.trim().toLowerCase().includes(searchTerm)) : codes;
}

export function filterBankCodeOptions(codes: AdditionalFieldCodeOption[], search: string): AdditionalFieldCodeOption[] {
  if (!codes?.length) {
    return [];
  }

  const searchTerm = search.trim().toLowerCase();

  return searchTerm
    ? codes.filter(
        code =>
          code.value.toLowerCase().includes(searchTerm) ||
          code.code.toLowerCase().includes(searchTerm) ||
          code.label.toLowerCase().includes(searchTerm)
      )
    : codes;
}

export function filterBranchCodeOptions(
  codes: AdditionalFieldBranchOption[],
  search: string
): AdditionalFieldBranchOption[] {
  if (!codes?.length) {
    return [];
  }

  const searchTerm = search.trim().toLowerCase();

  return searchTerm
    ? codes.filter(
        code =>
          code.value.toLowerCase().includes(searchTerm) ||
          code.code.toLowerCase().includes(searchTerm) ||
          code.label.toLowerCase().includes(searchTerm) ||
          code.bankCode?.toLowerCase().includes(searchTerm) ||
          code.shortName?.toLowerCase().includes(searchTerm) ||
          code.name?.toLowerCase().includes(searchTerm)
      )
    : codes;
}

export function filterLicensePurposeCodeOptions(codes: LicensePurposeCode[], search: string): LicensePurposeCode[] {
  if (!codes?.length) {
    return [];
  }

  const searchTerm = search.trim().toLowerCase();

  return searchTerm
    ? codes.filter(
        code => code.value?.toLowerCase().includes(searchTerm) || code.text?.toLowerCase().includes(searchTerm)
      )
    : codes;
}
