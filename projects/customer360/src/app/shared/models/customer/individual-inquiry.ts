export interface IndividualCIFInquiry {
    branchId: any;
    identificationDetails: IdentificationDetail[];
    personalDetails: PersonalDetails;
    contactDetails: ContactDetails;
    sourceOfIncome: SourceOfIncome;
    accountDetails: AccountDetails;
    nextOfKin: NextOfKin;
    currencyDetails: CurrencyDetail[];
    additionalInformation: AdditionalInformation;
    depositProtectionFund?: DepositProtectionFund;
}

export interface IdentificationDetail {
    IdType?: string;
    idType?: string;
    docCode: string;
    docType: string;
    countryOfIssue: string;
    desc: string;
    expiryDt: any;
    idIssuedOrganisation: any;
    issueDt: string;
    placeOfIssue: string;
    preferredUniqueId: boolean;
    prefUniqueId: boolean;
    referenceNum: string;
    typeCode: any;
    typeDesc: any;
}

export interface PersonalDetails {
    salutation?: string;
    birthDate: string;
    countryOfResidence: string;
    customerId: string;
    firstName: string;
    gender: string;
    idNumber: string;
    idSerialNumber: any;
    idType: string;
    krapInNumber: string;
    lastName: string;
    maritalStatus: string;
    middleName: string;
    nationality: string;
    nre: boolean;
    religion: string;
    staffEmployeeId: any;
    language?: string;
    originRegion?: string;
    city?: string;
    placeOfBirth?: string;
}

export interface ContactDetails {
    addresses: Address[];
    emailAddresses: EmailAddress[];
    phoneNumbers: PhoneNumber[];
}

export interface SourceOfIncome {
    climateCategory: string;
    demandISIC1: string;
    demandISIC2: string;
    ecosystemCategory: string;
    employed: any;
    employerContactNumber: any;
    employerName: string;
    employmentStatus: string;
    environmentalCategory: string;
    industry: string;
    isicLevel1: string;
    isicLevel2: string;
    isicLevel3: string;
    isicLevel4: string;
    jobTitle: string;
    miscellaneousId: string;
    monthlyIncome: string;
    natureOfBusiness: any;
    occupation: string;
    profession: any;
    secondaryDemandISIC1: string;
    secondaryDemandISIC2: string;
    secondaryISICLevel1: string;
    secondaryISICLevel2: string;
    secondaryISICLevel3: string;
    secondaryISICLevel4: string;
    secondaryLevel: boolean;
    sector: string;
    selfEmployed: any;
    vertical1: string;
    vertical2: string;
}

export interface AccountDetails {
    accountId: any;
    accountManager: string;
    bankId: string;
    branchId: string;
    isSuspended: boolean;
}

export interface NextOfKin {
    firstName: any;
    idNumber: any;
    idType: any;
    lastName: any;
    middleName: any;
    phoneNumber: any;
    relation: any;
}

export interface CurrencyDetail {
    currencyCode: string;
    dbFloat1: string;
    dbFloat2: string;
    dbFloat3: string;
    dbFloat4: string;
    dbFloat5: string;
    dtDate1: string;
    miscellaneousID: string;
    type: string;
}

export interface AdditionalInformation {
    eddCompletionDate: any;
    highRiskCategory: any;
    kycDate: any;
    kycReviewDate: any;
    minor: boolean;
    nextReviewDate: any;
    pepDescription: any;
    politicallyExposed: boolean;
    riskProfileScore: string;
    riskRating: string;
    secondaryRMId: any;
    staffEmployeeId: string;
    staffMember: boolean;
    submitForKYC: string;
}

interface DepositProtectionFund {
    preferredOption?: string;
    dpfDescription?: string;
    bankName?: string;
    bankCode?: string;
    accountNumber?: string;
    mobileNumber?: PhoneNumber;
    telco?: string;
}

export interface Address {
    addressId: string;
    addressStartDate: string;
    addressType: string;
    building: any;
    city: string;
    cityCode: string;
    comment: any;
    constituency: string;
    country: string;
    county: string;
    currentPlaceOfResidence: any;
    district: any;
    division: any;
    estate: any;
    location: string;
    poBox: any;
    postalAddress: string;
    postalCode: string;
    preferred: boolean;
    stateProvince: any;
    subLocation: any;
    toBeDeleted: boolean;
    village: string;
    parish: string;
    subCounty: string;
    region: string;
}

export interface EmailAddress {
    id: string;
    comment: any;
    emailType: string;
    emailAddress: string;
    preferred: boolean;
    toBeDeleted: boolean;
}

export interface PhoneNumber {
    id: string;
    phoneType: string;
    cityCode: string;
    countryCode: string;
    comment: any;
    number: string;
    preferred: boolean;
    toBeDeleted: boolean;
}
