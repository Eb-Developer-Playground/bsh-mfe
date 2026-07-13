export interface ChequeBookMisc {
  statusCode: string;
  statusMessage: string;
  successful: boolean;
  responseObject: ChequeBookMiscDetail;
}

export interface ChequeBookMiscDetail {
  allowDifferentCollectionBranch: string;
  branches?: any;
  numberOfLeaves: string[];
  charges: Charges;
}

interface Charges {
  '25': string;
  '50': string;
  '100': string;
}

export interface ReportRequestsResponse {
  id: string;
  chequeType: string;
  bookletSize: string;
  status: number;
  collectionBranch?: any;
  applicationBranch: string;
  startSeries: string;
  stopSeries: string;
  accountNumber: string;
  accountName: string;
  requestId: string;
  modifiedOnUtc?: string;
  createdOnUtc: string;
  chequeNumber?: string;
  bankName: string;
  amount: number;
  currency: string;
  beneficiaryAccountNumber: string;
  acceptedTermsAndConditions: number;
  cif: string;
}

export interface BranchLookupResponse {
  solId: string;
  branchName: string;
  county: string;
  countyCode: string;
  countyFinacleCode: string;
  country: string;
  headOffice: boolean;
  id: number;
  createdOnUtc: string;
  modifiedOnUtc: string;
}
