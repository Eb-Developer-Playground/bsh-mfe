import {EmailAddress, PhoneNumber} from "./shared";

export interface IndividualCIFModel {
    identificationDetails: IdentificationDetail[];
    personalDetails: PersonalDetails;
    additionalPersonalDetails?: AdditionalPersonalDetails;
    contactDetails: {
        phoneNumbers: PhoneNumber[];
        emailAddresses: EmailAddress[];
        addresses: Address[];
    };
    sourceOfIncome: SourceOfIncome;
    depositProtectionFund?: DepositProtectionFund;
    accountDetails?: AccountDetails;
    nextOfKin?: NextOfKin[];
    eddDetails?: EddDetails;
    additionalInformation?: AdditionalInformation;
}

export interface AdditionalPersonalDetails {
    language?: string;
    dependants?: string;
    qualification?: string;
    institutionName?: string;
    rentalStatus?: string;
    socialStatus?: string;
    spouseName?: string;
    socialEconomicLevel?: string;
    averageMonthlyExpenditure?: string;
    spouses?: {
        spousesFullName?: string;
        spouseIdentificationNumber?: string;
        spouseIdentificationType?: string;
        maidenName?: string;
    }[];
    smrCode?: string;
    fateStatus?: string;
    disability?: string;
    numberOfSpouses?: string;
    negativeClientStatus?: string;
}

export interface IdentificationDetail {
    documentId?: string;
    idType?: string;
    countryOfIssue?: string;
    placeOfIssue?: string;
    docCode?: string;
    docDescr?: string;
    docTypeCode?: string;
    docTypeDesc?: string;
    docIssueDt?: string;
    expDt?: string;
    refNum?: string;
    serialNumber?: string;
    isMandatory?: boolean;
    isDocumentVerified?: boolean;
    preferredUniqueId?: boolean;
    idIssuedOrganisation?: string;
}

export interface PersonalDetails {
    salutation?: string;
    idType?: string;
    customerId?: any;
    nationality?: string;
    countryOfResidence?: string;
    idNumber?: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    birthDate?: string | Date;
    gender?: string;
    taxId?: string;
    religion?: string;
    krapInNumber?: string;
    maritalStatus?: string;
    idSerialNumber?: string;
    nre?: boolean;
    // RW
    language?: any;
    dependants?: any;
    spouseName?: any;
    socialEconomicLevel?: any;
    rentalStatus?: any;
    qualification?: string;
    institutionName?: string;
    // DRC
    originRegion?: any;
    city?: any;
    placeOfBirth?: any;
    preferredLanguageCode?: string;
}

export interface Address {
    addressId?: any;
    addressType?: string;
    addressText?: string;
    province?: string;
    region?: string;
    district?: string;
    country?: string;
    county?: string;
    subCounty?: string;
    constituency?: string;
    division?: string;
    location?: string;
    subLocation?: string;
    state?: string;
    sector?: string;
    cell?: string;
    ward?: string;
    city?: string;
    parish?: string;
    village?: string;
    houseNumber?: string;
    estate?: string;
    poBox?: string;
    streetName?: string;
    streetNumber?: string;
    streetNumber2?: string;
    buildingName?: string;
    floorNumber?: string;
    postalCode?: string;
    isPreferred?: boolean;
    preferredFormat?: string;
    isMandatory?: boolean;
}

export interface SourceOfIncome {
    numberOfEmployees?: string;
    annualTurnover?: string;
    employmentStatus?: string;
    income_source?: any;
    natureOfBusiness?: any;
    occupation?: string;
    industry?: any;
    sector?: any;
    jobTitle?: string;
    monthlyIncome?: string;
    incomeFrom?: any;
    incomeTo?: any;
    employed?: boolean;
    selfEmployed?: boolean;
    student?: boolean;
    employerId?: string;
    employerName?: string;
    employerContactNumber?: PhoneNumber;
    businessDetails?: {
        businessName: any;
        businessRegistrationDate: any;
        businessEstablishmentDate: any;
        businessLicenseNumber: any;
        businessLicenseExpiryDate: any;
    };
    employerDetails?: {
        employerName?: string;
        employerCountry?: string;
        employerRegion?: string;
        employerDistrict?: string;
        employerWard?: string;
        employerStreet?: string;
        employerPostalCode?: string;
        employerHouserNumber?: any;
        employerPhoneNumber: PhoneNumber;
    };
    environmentalCategory?: string;
    climateCategory?: string;
    ecosystemCategory?: string;
    vertical1?: string;
    vertical2?: string;
    isicLevel1?: string;
    isicLevel2?: string;
    isicLevel3?: string;
    isicLevel4?: string;
    centralBankCategory?: string;
    demandISIC1?: string;
    demandISIC2?: string;
    secondaryLevel?: boolean;
    secondaryISICLevel1?: string;
    secondaryISICLevel2?: string;
    secondaryISICLevel3?: string;
    secondaryISICLevel4?: string;
    secondaryDemandISIC1?: string;
    secondaryDemandISIC2?: string;
}

export interface DepositProtectionFund {
    preferredOption?: string;
    dpfDescription?: string;
    bankName?: string;
    bankCode?: string;
    accountNumber?: string;
    mobileNumber?: PhoneNumber;
    telco?: string;
}

export interface AccountDetails {
    bankId?: any;
    branchId?: any;
    accountId?: any;
    schemeCode?: string;
    schemeDesc?: string;
    schemeType?: string;
    currency?: string;
    dispatchMode?: string;
    accountName?: string;
    accountShortName?: string;
    statementFrequency?: string;
    statementStartDate?: string;
    statementMode?: string;
    modeOfOperation?: string;
    accountManager?: string;
    purposeOfAccount?: string;
    sourceOfFunds?: string;
    isFrozen?: boolean;
    isSuspended?: boolean;
}

export interface NextOfKin {
    idType?: any;
    idNumber?: any;
    firstName?: string;
    lastName?: string;
    middleName?: any;
    phoneNumber?: PhoneNumber;
    email?: EmailAddress;
    relation?: string;
}

export interface EddDetails {
    typeOfReview?: string;
    dateOfReview?: string;
    nextReviewDate?: string;
    riskScorePercentage?: string;
    riskScoreLevel?: string;
    highRiskCustomerDescription?: any;
    referredToCompliance?: boolean;
    eddRequired?: boolean;
}

export interface AdditionalInformation {
    politicallyExposed?: boolean;
    staffMember?: boolean;
    pepDesc?: string;
    minor?: boolean;
    employeeId?: string;
    referralId?: any;
}
