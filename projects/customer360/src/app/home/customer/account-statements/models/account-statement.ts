export interface AccountStatement {
  bankId: string;
  branchId: string;
  actionName: string;
  fromDate: string;
  toDate: string;
  statementType: number;
  customerDetails: CustomerDetails;
  chargeOption: number;
  parentTaskId?: string;
  alternateAccountId?: string;
}
export interface AccountStatementV2 {
  bankId: string;
  branchId: string;
  actionName: string;
  fromDate: string;
  toDate: string;
  statementType: number;
  parentTaskId: string;
  alternateAccountId: string;
  chargeOption: any;
  customerDetails: CustomerDetails;
  calculateCharge: CalculateCharge;
}

interface CalculateCharge {
  noOfPages: number;
  commFlag: string;
  certify: string;
}



export interface CustomerDetails {
  firstName: string;
  lastName: string;
  accountId: string;
  customerId: string;
  emailAddress: string;
  phoneDetails: PhoneDetails;
}

export interface PhoneDetails {
  id: string;
  code: string;
  number: string;
  phoneType: string;
  preferred: boolean;
  cityCode?: string;
  countryCode?: string;
}

export interface Bio {
  bioModels: BioModel[];
}

export interface BioModel {
  cif: string;
  skipBio: boolean;
  reason?: string;
  fingerprints: Fingerprint[];
}

export interface Fingerprint {
  value: string;
}

export interface Balance {
  accountId: string;
  date?: Date;
  bankId: string;
}

export interface BaseResponse {
  statusMessage: string;
  statusCode: string;
  successful: boolean;
}

export interface StatementPageCountResponse extends BaseResponse {
  responseObject: number;
}

export interface CalculateChargePayload {
  AccountId: string;
  Certify: string;
  CommFlag: string;
  NoofPages: number;
  BankId: string;
}

export interface CalculateChargeResponse extends BaseResponse {
  responseObject: {
    certificationFee: string;
    charge: string;
    commissionFee: string;
    exciseFee: string;
    totalCharge: string;
  };
}

export interface AccountBalanceResponse extends BaseResponse {
  responseObject: {
    message: string;
    date: string;
    balance: string;
  };
}

export interface ChargeAccountStatementPayload {
  AlternateAccountId: string;
  Certify: string;
  CommFlag: string;
  NoofPages: number;
  BankId: string;
  ChargeOption: ChargeAccountStatementPayloadChargeOption;
  WaiveReason?: string;
}

export interface ChargeAccountStatementResponse {}

export interface StatementRequestPayload {
  account: string;
  transType: string;
  currency: string;
  certification: string;
  numberOfPages: number;
  ticketId: number;
}

export interface StatementRequestResponse {
  statusMessage: string;
  statusCode: string;
  successful: boolean;
  responseObject: {
    status: string;
    statementFee: number;
    certificationFee: number;
    statementDuty: number;
    currency: string;
    ticketId: number;
  };
}

export enum ChargeAccountStatementPayloadChargeOption {
  Account = 0,
  AlternateAccount = 2,
  WaiveCharges = 3,
}
