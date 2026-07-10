// Stub for @shared/documents-upload-drc/models — Phase 2 will replace with real implementation
export interface BankDetails {
  bankCode: string;
  bankName: string;
}

export interface BranchDetails {
  branchCode: string;
  branchName: string;
  name?: string;
  shortName?: string;
  bankCode?: string;
}

export interface DrcBranchDetails {
  branchCode: string;
  branchName: string;
}

export interface TransactionDocValidators {
  required: boolean;
  maxSize: number;
  allowedTypes: string[];
  fileName?: string;
  formName?: string;
  format?: string;
  name?: string;
  docCode?: string;
}

export interface LicensePurposeCode {
  code: string;
  value: string;
  text: string;
  label?: string;
}

export interface PurposeCode {
  code: string;
  value: string;
}
