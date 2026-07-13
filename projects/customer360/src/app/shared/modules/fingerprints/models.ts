export interface Finger {
  id: number | null;
  name: string | null;
  img: string | null;
  fingerPosition: string | null;
  state: FingerPrintState;
}

export enum FingerPrintState {
  CAPTURED,
  NOTCAPTURED,
  INPROGRESS,
}

export interface BioVerifyResult {
  success: boolean;
  skipBio: boolean;
  documents?: any;
  skipBioForm?: any;
  bioModel: { [key: string]: any };
}

export type BioVerifyCustomerType = 'Individual' | 'Entity';

export interface BioVerifyInput {
  customerType: BioVerifyCustomerType;
  fullName: string;
  customerId?: string;
  account: IAccount;
  inProcess: boolean;
  skipBio: boolean;
  bankId?: string;
  signatories?: AccountSignatory[];
}

export interface IAccount {
  accountName: string;
  accountNumber: string;
  schemeType: string;
  mandate: string;
  schemeCode: string;

  [key: string]: any;
}

export interface AccountSignatory {
  name: string;
  cif: string;
  deleted: boolean;
  signatoryType: string;
  checked?: boolean; // Additional
  captured?: boolean; // Additional
  active?: boolean; // Additional
}
