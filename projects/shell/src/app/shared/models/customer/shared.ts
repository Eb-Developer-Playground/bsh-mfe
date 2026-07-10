import { SafeResourceUrl } from '@angular/platform-browser';
import { IFormFieldState } from '../fieldstates';
import { IFileParams } from '@app/shared/modules/upload-docs/models';
import { IndividualCIFModel } from './individual-formstate';

export interface IPhoneNumberFieldStates {
  id?: IFormFieldState;
  cityCode?: IFormFieldState;
  comment?: IFormFieldState;
  countryCode?: IFormFieldState;
  number?: IFormFieldState;
  phoneType?: IFormFieldState;
  isPreferred?: IFormFieldState;
  toBeDeleted?: IFormFieldState;
  isMandatory?: IFormFieldState;
}

export interface PhoneNumber {
  id?: any;
  phoneType?: string;
  cityCode?: string;
  comment?: string;
  countryCode?: string;
  number?: string;
  isPreferred?: boolean;
  toBeDeleted?: boolean;
  isMandatory?: boolean;
}

export interface IEmailAddressFieldStates {
  id?: IFormFieldState;
  comment?: IFormFieldState;
  emailAddress?: IFormFieldState;
  emailType?: IFormFieldState;
  isPreferred?: IFormFieldState;
  toBeDeleted?: IFormFieldState;
  isMandatory?: IFormFieldState;
}

export interface EmailAddress {
  id?: any;
  emailType?: string;
  emailAddress?: string;
  comment?: any;
  isPreferred?: boolean;
  toBeDeleted?: boolean;
  isMandatory?: boolean;
}
export interface EntityLocalModel {
  companyDetails: {
    customerId?: string;
    companyName?: string;
    registrationNumber?: string;
    taxId?: string;
    krapInNumber?: string;
    registrationDate?: string;
    financialYearEndMonth?: string;
    entityClass?: string;
    sourceOfFunds?: string;
    businessType?: any;
    businessCategory?: any;
    legalEntityType?: any;
    contactPerson?: any;
    language?: string;
    countryOfResidence?: string;
    highRiskCategory?: string;
    highRiskCustomer?: boolean;
    natureOfBusiness?: any;
    numberOfEmployees?: string;
    annualTurnover?: string;
    politicallyExposed?: boolean;
    pepDesc?: string;
  };
  contactDetails: {
    phoneNumbers: {
      id?: any;
      phoneType?: string;
      type?: string;
      countryCode?: string;
      cityCode?: string;
      number?: string;
      comment?: string;
      isPreferred?: boolean;
      toBeDeleted?: boolean;
    }[];
    emailAddresses: {
      id?: string;
      emailType?: string;
      type?: string;
      emailAddress?: string;
      comment?: string;
      isPreferred?: boolean;
      toBeDeleted?: boolean;
    }[];
    addresses: {
      id?: string;
      addressType?: string;
      buildingName?: string;
      preferredFormat?: string;
      country?: string;
      region?: string;
      state?: string;
      streetName?: string;
      streetNumber?: string;
      floorNumber?: string;
      poBox?: string;
      postalCode?: string;
      cityCode?: string;
      city?: string;
      isPreferred?: boolean;
      toBeDeleted?: boolean;
    }[];
  };
  sourceOfIncome: {
    vertical1?: string;
    vertical2?: string;
    isicLevel1?: string;
    isicLevel2?: string;
    isicLevel3?: string;
    isicLevel4?: string;
    demandISIC1?: string;
    demandISIC2?: string;
    secondaryLevel?: boolean;
    secondaryISICLevel1?: string;
    secondaryISICLevel2?: string;
    secondaryISICLevel3?: string;
    secondaryISICLevel4?: string;
    secondaryDemandISIC1?: string;
    secondaryDemandISIC2?: string;
    climateCategory?: string;
    ecosystemCategory?: string;
    environmentalCategory?: string;
  };
  shareHolders: {
    amount26?: any;
    title?: any;
    customerId?: any;
    firstName?: any;
    lastName?: any;
    gender?: any;
    idType?: any;
    idNumber?: any;
    nationality?: any;
    countryOfResidence?: any;
    totalEquityPercentage?: any;
    totalLiabilityPercentage?: any;
    cifType?: any;
    entityType?: any;
    financiaType?: any;
    role?: any;
    type?: any;
    entityKey?: any;
    deleteFlag?: 'Y' | null;
    financialDetailsId?: string;
    phoneNumber?: string;
    primaryPhoneNumber?: string;
    primaryEmailAddress?: string;
    politicallyExposed?: boolean;
    pepDesc?: string;
    pepDescription?: string;
    emailAddress?: string;
    signatureAndPhoto?: any;
  }[];
  accountDetails: {
    bankId?: string;
    branchId?: string;
    accountName?: string;
    accountShortName?: string;
    schemeCode?: string;
    schemeDesc?: string;
    schemeType?: string;
    currency?: string;
    dispatchMode?: string;
    statementFrequency?: string;
    statementStartDate?: string;
    statementMode?: string;
    modeOfOperation?: string;
    accountManager?: string;
    frequencyType?: string;
    frequencyCal?: string;
    frequencyStartDt?: string;
    accountMandate?: string;
    purposeOfAccount?: string;
    sourceOfFunds?: string;
    soldId?: string;
  };
}

export interface ISignature {
  passport: string;
  signature: string;
}

export interface IStakeholder {
  ticketId?: string;
  dedupe?: {
    idType: string;
    idNumber: string;
    nationality: string;
    countryOfResidence: string;
  };
  onboardingTicket?: any;
  type: string;
  typeName: string;
  customerId: string;
  fullName: string;
  firstName: string;
  lastName: string;
  isAdded: boolean;
  signatureAndPhoto?: {
    signature: IFileParams;
    passport: IFileParams;
  };
  uboDetails?: {
    isUbo: boolean;
    percentageBenefited: number;
    votingRights: boolean;
    controllingInterest: string;
    isPEP: string;
    pepDescription: string;
  };
  isPepDetails?: {
    isPEP: boolean;
    pepDescription: string;
  };
  mappedCif: IndividualCIFModel;
  additionaStakeholderlDetails?: {
    typeName?: string;
    isUbo?: boolean;
    percentageBenefited?: number;
    votingRights?: boolean;
    controllingInterest?: string;
    isPep?: boolean;
    pepDescription?: string;
  };
}

export interface UboDetails {
  IsUbo: boolean;
  PercentageBenefited: number | null;
  TotalEquityPercentage: number | null;
  TotalLiabilityPercentage: number | null;
  IsPep: boolean;
  PepDescription: string | null;
  ControllingInterest: number | null;
  VotingRights: number | null;
  Relationship: string | null;
  DesignationCode: string | null;
  RelationType: string | null;
  RelationCode: string | null;
}

export interface Stakeholder {
  cif?: string;
  nationality?: string;
  countryOfResidence?: string;
  identificationType?: string;
  documentNumber: string;
  documentSerialNumber: string;
  salutation: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string;
  kraPin: string;
  gender: string;
  religion?: string;
  maritalStatus: string;
  signatureAndPhoto?: {
    signature: IFileParams;
    passport: IFileParams;
  };
}
export interface Account {
  accountName: string;
  accountNumber: string;
  cif: string;
  accountCurrency: string;
  accountStatus: string;
}

export interface SelectedDataItem {
  name: 'Passport' | 'Signature';
  data: SafeResourceUrl | null;
}


export interface AdditionalEntityAccountDetails {
  entityAccountName: string;
  accountShortName: string;
  currency: string;
  statementMode: string,
  registeredNumber: string;
  kraPinNumber: string;
  schemeCode: string;
  cif: string;
  emailAddress: string;
  phoneNumber: string;
  accountType: string;
  schemeType: string;
  accountMandate: string;
  statementFrequency: string;
  statementStartDate: string;
  dispatchMode: string;
  accountManager: string;
  AccountManager: string;
  purposeOfAccount: string;
}
