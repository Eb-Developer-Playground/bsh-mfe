import { IFormFieldState } from '../fieldstates';
import { IEmailAddressFieldStates, IPhoneNumberFieldStates } from './shared';

export interface IIdTypeFieldStates {
  idType: IFormFieldState;
  idNumber?: IFormFieldState;
  serialNumber?: IFormFieldState;
  nationality?: IFormFieldState;
  documentIssueDate?: IFormFieldState;
  countryOfResidence?: IFormFieldState;
  [key: string]: any;
}

export interface IndividualCIFFieldStates {
  identificationDetails: IdentificationDetailFieldStates[];
  personalDetails: IPersonalDetailsFieldStates;
  contactDetails: {
    phoneNumbers: IPhoneNumberFieldStates[];
    emailAddresses: IEmailAddressFieldStates[];
    addresses: IResidentialFieldStates[];
  };
  sourceOfIncome: ISourceOfIncomeFieldStates;
  depositProtectionFund?: IDepositProtectionFund;
  accountDetails?: IAccountFieldStates;
  nextOfKin?: INextOfKinFieldStates[];
  eddDetails?: IEDDDetails;
  additionalInformation?: IAdditionalInformationFieldStates;
}

export interface IdentificationDetailFieldStates {
  documentId?: IFormFieldState;
  idType?: IFormFieldState;
  countryOfIssue?: IFormFieldState;
  placeOfIssue?: IFormFieldState;
  docCode?: IFormFieldState;
  docDescr?: IFormFieldState;
  docTypeCode?: IFormFieldState;
  docTypeDesc?: IFormFieldState;
  docIssueDt?: IFormFieldState;
  expDt?: IFormFieldState;
  refNum?: IFormFieldState;
  serialNumber?: IFormFieldState;
  isMandatory?: IFormFieldState;
  isDocumentVerified?: IFormFieldState;
  preferredUniqueId?: IFormFieldState;
  idIssuedOrganisation?: IFormFieldState;
  docIssueDtSpecified?: IFormFieldState;
  employerId?: IFormFieldState;
  staffId?: IFormFieldState;
}

export interface IPersonalDetailsFieldStates {
  salutation?: IFormFieldState;
  idType?: IFormFieldState;
  customerId?: IFormFieldState;
  nationality?: IFormFieldState;
  countryOfResidence?: IFormFieldState;
  idNumber?: IFormFieldState;
  firstName?: IFormFieldState;
  middleName?: IFormFieldState;
  lastName?: IFormFieldState;
  birthDate?: IFormFieldState;
  gender?: IFormFieldState;
  taxId?: IFormFieldState;
  religion?: IFormFieldState;
  krapInNumber?: IFormFieldState;
  maritalStatus?: IFormFieldState;
  idSerialNumber?: IFormFieldState;
  nre?: IFormFieldState;
  language?: IFormFieldState;
  originRegion?: IFormFieldState;
  city?: IFormFieldState;
  placeOfBirth?: IFormFieldState;
  employerId?: IFormFieldState;
  staffId?: IFormFieldState;
}

export interface IContactDetailsFieldStates {
  addresses?: Array<IResidentialFieldStates>;
  emailAddresses?: Array<IEmailAddressFieldStates>;
  phoneNumbers?: Array<IPhoneNumberFieldStates>;
}

export interface IResidentialFieldStates {
  addressId?: IFormFieldState;
  addressType?: IFormFieldState;
  addressText?: IFormFieldState;
  state?: IFormFieldState;
  province?: IFormFieldState;
  region?: IFormFieldState;
  district?: IFormFieldState;
  country?: IFormFieldState;
  county?: IFormFieldState;
  cell?: IFormFieldState;
  sector?: IFormFieldState;
  subCounty?: IFormFieldState;
  constituency?: IFormFieldState;
  division?: IFormFieldState;
  location?: IFormFieldState;
  subLocation?: IFormFieldState;
  ward?: IFormFieldState;
  city?: IFormFieldState;
  parish?: IFormFieldState;
  village?: IFormFieldState;
  houseNumber?: IFormFieldState;
  estate?: IFormFieldState;
  poBox?: IFormFieldState;
  streetName?: IFormFieldState;
  streetNumber?: IFormFieldState;
  streetNumber2?: IFormFieldState;
  buildingName?: IFormFieldState;
  floorNumber?: IFormFieldState;
  postalCode?: IFormFieldState;
  isPreferred?: IFormFieldState;
  preferredFormat?: IFormFieldState;
  isMandatory?: IFormFieldState;
}

export interface ISourceOfIncomeFieldStates {
  numberOfEmployees?: IFormFieldState;
  annualTurnover?: IFormFieldState;
  employmentStatus?: IFormFieldState;
  income_source?: IFormFieldState;
  natureOfBusiness?: IFormFieldState;
  natureOfIncome?: IFormFieldState;
  centralBankCategory?: IFormFieldState;
  occupation?: IFormFieldState;
  industry?: IFormFieldState;
  sector?: IFormFieldState;
  jobTitle?: IFormFieldState;
  monthlyIncome?: IFormFieldState;
  incomeFrom?: IFormFieldState;
  businessDetails?: ISourceOfIncomeBusinessDetails;
  employerDetails?: ISourceOfIncomeEmployerDetails;
  incomeTo?: IFormFieldState;
  employed?: IFormFieldState;
  selfEmployed?: IFormFieldState;
  student?: IFormFieldState;
  employerId?: IFormFieldState;
  employerName?: IFormFieldState;
  employerContactNumber?: IPhoneNumberFieldStates;
  environmentalCategory?: IFormFieldState;
  climateCategory?: IFormFieldState;
  ecosystemCategory?: IFormFieldState;
  vertical1?: IFormFieldState;
  vertical2?: IFormFieldState;
  isicLevel1?: IFormFieldState;
  isicLevel2?: IFormFieldState;
  isicLevel3?: IFormFieldState;
  isicLevel4?: IFormFieldState;
  demandISIC1?: IFormFieldState;
  demandISIC2?: IFormFieldState;
  secondaryLevel?: IFormFieldState;
  secondaryISICLevel1?: IFormFieldState;
  secondaryISICLevel2?: IFormFieldState;
  secondaryISICLevel3?: IFormFieldState;
  secondaryISICLevel4?: IFormFieldState;
  secondaryDemandISIC1?: IFormFieldState;
  secondaryDemandISIC2?: IFormFieldState;
}

export interface ISourceOfIncomeBusinessDetails {
  businessName?: IFormFieldState;
  businessRegistrationDate?: IFormFieldState;
  businessEstablishmentDate?: IFormFieldState;
  businessLicenseNumber?: IFormFieldState;
  businessLicenseExpiryDate?: IFormFieldState;
}

export interface ISourceOfIncomeEmployerDetails {
  employerId?: IFormFieldState;
  employerName?: IFormFieldState;
  employerCountry?: IFormFieldState;
  employerRegion?: IFormFieldState;
  employerDistrict?: IFormFieldState;
  employerWard?: IFormFieldState;
  employerStreet?: IFormFieldState;
  employerPostalCode?: IFormFieldState;
  employerHouseNumber?: IFormFieldState;
  employerContactNumber?: IPhoneNumberFieldStates;
}

export interface IDepositProtectionFund {
  preferredOption?: IFormFieldState;
  dpfDescription?: IFormFieldState;
  bankName?: IFormFieldState;
  accountNumber?: IFormFieldState;
  mobileNumber?: IPhoneNumberFieldStates;
}

export interface IAccountFieldStates {
  bankId?: IFormFieldState;
  branchId?: IFormFieldState;
  accountId?: IFormFieldState;
  schemeCode?: IFormFieldState;
  schemeType?: IFormFieldState;
  currency?: IFormFieldState;
  dispatchMode?: IFormFieldState;
  statementFrequency?: IFormFieldState;
  statementStartDate?: IFormFieldState;
  statementMode?: IFormFieldState;
  modeOfOperation?: IFormFieldState;
  accountManager?: IFormFieldState;
  purposeOfAccount?: IFormFieldState;
  sourceOfFunds?: IFormFieldState;
  isFrozen?: IFormFieldState;
  isSuspended?: IFormFieldState;
}

export interface INextOfKinFieldStates {
  idType?: IFormFieldState;
  idNumber?: IFormFieldState;
  firstName?: IFormFieldState;
  lastName?: IFormFieldState;
  middleName?: IFormFieldState;
  phoneNumber?: IPhoneNumberFieldStates;
  email?: IEmailAddressFieldStates;
  relation?: IFormFieldState;
}

export interface IEDDDetails {
  typeOfReview?: IFormFieldState;
  dateOfReview?: IFormFieldState;
  nextReviewDate?: IFormFieldState;
  riskScorePercentage?: IFormFieldState;
  riskScoreLevel?: IFormFieldState;
  highRiskCustomerDescription?: IFormFieldState;
  referredToCompliance?: IFormFieldState;
  eddRequired?: IFormFieldState;
}

export interface IAdditionalInformationFieldStates {
  politicallyExposed?: IFormFieldState;
  staffMember?: IFormFieldState;
  minor?: IFormFieldState;
  pepDesc?: IFormFieldState;
  staffEmployeeId?: IFormFieldState;
  employeeId?: IFormFieldState;
  referralId?: IFormFieldState;
  relationshipManager?: IFormFieldState;
}
