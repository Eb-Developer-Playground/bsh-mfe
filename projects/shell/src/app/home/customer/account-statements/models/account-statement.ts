export enum ChargeAccountStatementPayloadChargeOption {
  WaiveCharges = 'WaiveCharges',
  Account = 'Account',
  AlternateAccount = 'AlternateAccount',
}

export interface ChargeAccountStatementPayload {
  bankId: string;
  certify: boolean;
  commFlag: string;
  noOfPages: number;
  accountId: string;
  taskId: string;
  selectedAccountId: string;
  waiveCharges: boolean;
  waiveReason: string;
  subsidiary: string;
}

export interface Bio {
  bioModels: Array<{
    cif: string;
    skipBio: boolean;
    fingerprints: unknown[];
  }>;
}
