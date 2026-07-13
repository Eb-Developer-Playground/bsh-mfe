export enum CurrentFlowsOptions {
  CUSTOMERNOTPRESENT = 'customerNotPresent',
  CONTACTCENTER = 'contactCenter',
  DIGITALSUPPORT = 'digitalSupport',
  BIOSYSTEMDOWN = 'bioSystemDown',
  BIOSUNREADABLE = 'bioUnreadable',
  SIGNATORIESNOTPRESENT = 'signatoriesNotPresent',
}

export interface IAccMgntObj {
  cif: string;
  bankID: string;
  idNumber: string;
  accountsId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  idType: string;
  currentFlow?: CurrentFlowsOptions;
  mandate?: string;
  accountType?: string;
  isPresent: boolean;
}
