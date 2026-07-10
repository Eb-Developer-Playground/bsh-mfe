import { IFormFieldState } from '../../models/fieldstates';

export enum ID_TYPES {
  MaishaCard = 'MaishaCard',
  NationalId = 'NationalId',
  Passport = 'Passport',
  MilitaryServiceCard = 'MilitaryServiceCard',
  BirthCertificate = 'BirthCertificate',
  DriversLicense = 'DriversLicense',
  KenyanPassport = 'KenyanPassport',
  ForeignPassport = 'ForeignPassport',
  ForeignId = 'ForeignId',
  WorkPermit = 'WorkPermit',
  RefugeeId = 'RefugeeId',
  UNHCRPROOF = 'UNHCRProof',
  NSSFCard = 'NSSFCard',
  ResidentId = 'ResidentId',
  VotersCard = 'VotersCard',
  EmployeeId = 'EmployeeId',
  NotificationOfBirth = 'NotificationOfBirth',
  DRCVotersCard = 'DRCVotersCard',
  DRCPassport = 'DRCPassport',
  DRCDriversLicense = 'DRCDriversLicense',
  MilitaryID = 'MilitaryID',
  DRCBirthCertificate = 'DRCBirthCertificate',
  DRCRefugeeId = 'DRCRefugeeId',
  DRCForeignPassport = 'DRCForeignPassport',
  PoliceID = 'PoliceID',
  StudentID = 'StudentID',
  GuardianshipCertificate = 'GuardianshipCertificate',
  BirthCertificateNotificationOfBirth = 'BirthCertificateNotificationOfBirth',
  DRCMinorPassport = 'DRCMinorPassport',
  NationalIdentification = 'NationalIdentification',
}

export interface IDedupeFormOutput {
  successful: boolean;
  statusMessage: string;
  result: IDedupeCIFResult[];
  formValues: {
    refNum: string;
    idType: string;
    nationality: string;
    countryOfResidence: string;
  };
}

export interface IDedupeCIFResult {
  idType?: string;
  refNum?: string;
  cifId?: string;
  fullName?: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  suspendedFlg?: 'Y' | 'N';
  isSuspended?: boolean;
  cifNumber?: string;
  documentDescription?: string;
  documentNumberFlag?: string;
  documentNumber?: string;
  phoneNumberFlag?: string;
  emailAddrsessFlag?: string;
  emailAddrsess?: string;
  preferredEmailFlag?: string;
  preferredEmail?: string;
  dateOfBirthFlag?: string;
  dateOfBirth?: string;
}

export interface IdTypeDescription {
  localeName?: string;
  name: string;
  value: ID_TYPES;
  isPrimary?: boolean;
  isVerifiable?: boolean;
  isMandatory?: boolean;
  dedupeParam?: string;
  order?: number;
}

export interface INationality {
  nationalityCode: string;
  nationalityName: string;
}

export interface ICountry {
  countryName: string;
  countryCode: string;
}

export interface IPlace {
  cityPlaceCode: string;
  cityPlaceName: string;
}

export interface IdDocumentFieldStates {
  documentId?: IFormFieldState;
  idType?: IFormFieldState;
  countryOfIssue?: IFormFieldState;
  placeOfIssue?: IFormFieldState;
  docCode?: IFormFieldState;
  docDescr?: IFormFieldState;
  docTypeCode?: IFormFieldState;
  docTypeDesc?: IFormFieldState;
  docIssueDt?: IFormFieldState;
  docIssueDtSpecified?: IFormFieldState;
  expDt?: IFormFieldState;
  refNum?: IFormFieldState;
  serialNumber?: IFormFieldState;
  isMandatory?: IFormFieldState;
  isDocumentVerified?: IFormFieldState;
  preferredUniqueId?: IFormFieldState;
  idIssuedOrganisation?: IFormFieldState;
}

export interface IdTypeSpec {
  idType: ID_TYPES;
  docCode?: string;
  docDescr?: string;
  docTypeCode?: string;
  docTypeDesc?: string;
  countryOfIssue?: string;
  hasSerialNumber?: boolean;
  requireIssuingAuthority?: boolean;
  hasIssueDate?: boolean;
  hasExpiry?: boolean;
  maxLength?: number;
  minLength?: number;
  maxIssueDate?: Date;
  minIssueDate?: Date;
  pattern?: RegExp | null;
  inputMask?: string;
  dropMaskChars?: boolean;
  hint?: string;
  countryCode?: string;
}

export interface IDedupeFieldStates {
  nationality: IFormFieldState;
  countryOfResidence: IFormFieldState;
  refNum: IFormFieldState;
  idType: IFormFieldState;
  firstName?: IFormFieldState;
  middleName?: IFormFieldState;
  lastName?: IFormFieldState;
  otherName?: IFormFieldState;
  birthDate?: IFormFieldState;
  phoneNumber?: IFormFieldState;
  emailAddress?: IFormFieldState;
  birthPlace?: IFormFieldState;
  dob?: IFormFieldState;
}
export interface InquiryDocument {
  typeCode: any;
  docType: string;
  issueDt: string;
  expiryDt: string;
  countryOfIssue: string;
  placeOfIssue: string;
  referenceNum: string;
  docCode: string;
  desc: string;
  typeDesc: any;
  preferredUniqueId: boolean;
  prefUniqueId: boolean;
  idIssuedOrganisation: any;
}

// export namespace Crb {
//   export interface CrbPayload {
//     requestId: string;
//     documentNumber: string;
//     documentType: string;
//     firstname: string;
//     lastname: string;
//   }

//   export interface CrbResponse {
//     crbResponse: {
//       status: Status;
//       customer: Customer;
//     };
//   }

export interface Customer {
  scoreInfo: ScoreInfo;
  identity: Identity;
  account: null;
  customerValidationStatus: Status;
}

export interface Identity {
  documentNumber: null;
}

export interface ScoreInfo {
  crbScore: number;
  hasFraud: boolean;
  guarantor: boolean;
  customerDelinquencyCode: null;
  nbOfBouncedCheques: NbOfBouncedCheque[];
  nbCreditApp: NbOfBouncedCheque[];
  nbEnquiryNbEnquiry: null;
  preformingLoan: null;
  nonPerformingLoan: null;
}

export interface NbOfBouncedCheque {
  count: string;
  months: number;
}

export interface Status {
  respCode: string;
  respMsg: string;
}
