export interface IssuanceCustomerDataT {
  accounts: CustomerAccountT[];
  alienIdExpDate: any;
  bankID: string;
  cif: string;
  dateOfBirth: string;
  email: string;
  firstName: string;
  gender: string;
  identifications: string;
  kraPin: any;
  lastName: string;
  maritalStatus: string;
  phoneNumber1: string;
  phoneNumber2: string;
  prefDocumentID: string;
  preferredAddress: {
    address1: string;
    address2: string;
    cityCode: string;
    cityCodeDesc: string;
    countryCode: string;
    pinCode: string;
    stateCode: string;
  };
  preferredDocDesc: string;
  preferredDocExpDate: string;
  shortName: string;
  title: string;
}

export interface CustomerAccountT {
  accountCurrency: string;
  accountName: string;
  accountNumber: string;
  accountOpeningDate: string;
  accountStatus: string;
  availableBalance: string;
  effectiveBalance: string;
  lienAmmount: string;
  mandate: string;
  scheduleNo: null;
  schemeCode: string;
  schemeType: string;
}

export interface IssuanceActiveAccountT {
  accountsId: string;
  bankID: string;
  cif: string;
  dateOfBirth: string;
  firstName: string;
  idType: string;
  isPresent: boolean;
  lastName: string;
}
export interface CardProductTypesResponse extends ApiResponse {
  responseObject: CardProductTypesData[];
}

export interface CardProductTypesData {
  categoryId: number;
  categoryName: string;
  countryCode: string;
  group: string;
  fullName: string;
  id: string;
  name: string;
}
export interface ApiResponse {
  statusCode: string;
  statusMessage: string;
  successful: boolean;
}

export interface CardTypeT {
  countryCode: string;
  group: string;
  categoryId: string;
  name: string;
  id: string;
}

export interface CreateIssuanceTicketPayloadT {
  associatedId: string;
  actionFlow: 'InstantCardIssuance';
  taskType: 'CardIssuance';
  branchId: string;
  userId: string;
  bankId: string;
  CustomerId: string;
  CustomerName: string;
}

export interface InstantCardIssuanceDataSubmitPayloadT {
  AccountDetails: {
    AccountNumber: string;
    AccountName: string;
    AccountCurrency: string;
    FirstName: string;
    LastName: string;
    IdNumber: string;
    PhoneNumber: string;
    RegNumber: string;
    Cif: string;
  };
  CardDetails: {
    EmbossingName: string;
    ProductTypeId: string;
    CardType: string;
    CardCurrency: string;
    DailyCashWithdrawalLimit: string;
    DailyEcommerceTransactionLimit: string;
    Pan: string;
  };
  Charges: {
    AccountToDebit: string;
    Currency: string;
    ChargeAmount: string;
    TaxAmount: string;
    WaiveCharges: boolean;
  };
}

export interface PremiumCardIssuanceDataSubmitPayloadT {
  AccountDetails: {
    AccountNumber: string;
    AccountName: string;
    AccountCurrency: string;
    FirstName: string;
    LastName: string;
    IdNumber: string;
    PhoneNumber: string;
    Cif: string;
    RegNumber: string;
  };
  CardDetails: {
    EmbossingName: string;
    ProductTypeId: string;
    CardType: string;
    CardCurrency: string;
    DailyCashWithdrawalLimit: string;
    DailyEcommerceTransactionLimit: string;
    Pan: string;
  };
  Charges: {
    AccountToDebit: string;
    Currency: string;
    ChargeAmount: string;
    TaxAmount: string;
    WaiveCharges: boolean;
  };
  Info: {
    CollectionBranch: string;
    PhysicalPinRequired: boolean;
    City: string;
    PostalCode: string;
    AddressLine1: string;
    BirthName: string;
    BirthDate: string;
    ShortName: string;
    Country: string;
    Gender: string;
    Language: string;
    MaritalStatus: string;
  };
}

export interface CardTypeChargesResponseT extends ApiResponse {
  responseObject: {
    chargeAmount: string;
    countryCode: string;
    createdOnUtc: string;
    currency: string;
    dailyCashWithdrawalLimit: string;
    dailyEcommerceTransactionLimit: string;
    exciseAmount: string;
    id: string;
    isDeleted: boolean;
    productTypeId: string;
    taxAmount: string;
  }[];
}

export interface StaffInventoryResponseT extends ApiResponse {
  responseObject: {
    responseObject: {
      page: number;
      totalCount: number;
      pageSize: number;
      items: StaffInventoryT[];
    };
  };
}

export interface StaffInventoryT {
  id: string;
  stock: string;
  branchId: string;
  branchName: string;
  countryCode: string;
  createdOnUtc: string;
  modifiedOnUtc: string;
  userId: string;
  staffNo: string;
  username: string;
  productTypeId: any;
  productTypeName: any;
  productCategoryName: any;
  pans: InventoryPanDataT[];
}
export interface InventoryPanDataT {
  maskedPan: string;
  expiryDate: string;
  status: string;
}

export interface PanValidationPayloadT {
  accounts: string[];
  idNumber: string;
  last6Pan: string;
  Expiry: string;
  countryCode: string;
}

export interface InstantCardIssuanceFormKeysT {
  accountNumber: string;
  accountName: string;
  cardType: string;
  cardCurrency: string;
  cardEmbossingName: string;
  cardPAN: string;
  cardPANValid: boolean;
  charges: string;
  chargeableAccount: string;
  withdrawalLimit: string;
  ecommerceLimit: string;
  taxAmount: string;
  chargeAmount: string;
  physicalPin: boolean;
  collectionBranch: string;
}

export interface InstantIssuanceDocsPayloadDataT {
  Country: string;
  ticketNumber: string;
  Service: string;
  documents: {
    Filename: string;
    Format: string;
    data: string;
  }[];
}

export type CardIssuanceLocalStorageKeys =
  | 'Cards-Issuance-FormData'
  | 'Cards-Issuance-RequestData'
  | 'Card-Types'
  | 'Branches'
  | 'UserBank';

export interface InstantCardIssuanceRequestDataT {
  actionFlowName: string;
  ticketID: string;
  accountDetails: {
    accountNumber: string;
    accountName: string;
    accountCurrency: string;
    firstName: string;
    lastName: string;
    regNumber: string;
    phoneNumber: string;
    cif: string;
  };
  cardDetails: {
    cardType: string;
    cardCurrency: string;
    embossingName: string;
    dailyCashWithdrawalLimit: number;
    dailyEcommerceTransactionLimit: number;
    pan: string;
    productTypeId: number;
    productCode?: string | null;
    productTypeName?: string | null;
    productCategoryName?: string | null;
  };
  charges: {
    accountToDebit: string;
    currency: string;
    chargeAmount: number;
    taxAmount: number;
    waiveCharges: boolean;
  };
}
export interface CardIssuanceSubmitResponse extends ApiResponse {
  responseObject: {
    ticketId: number;
    requestModel: {
      accountDetails: {
        accountNumber: string;
        accountName: string;
        accountCurrency: string;
        firstName: string;
        lastName: string;
        regNumber: string;
        phoneNumber: string;
        cif: string;
      };
      cardDetails: {
        cardType: string;
        cardCurrency: string;
        embossingName: string;
        dailyCashWithdrawalLimit: number;
        dailyEcommerceTransactionLimit: number;
        pan: string;
        productTypeId: number;
        productCode?: string | null;
        productTypeName?: string | null;
        productCategoryName?: string | null;
      };
      charges: {
        accountToDebit: string;
        currency: string;
        chargeAmount: number;
        taxAmount: number;
        waiveCharges: boolean;
      };
    };
  };
}

export interface CardIssuanceDocCodeResponseT extends ApiResponse {
  responseObject: {
    DocumentData: {
      Service: string;
      Documents: {
        FileName: string;
        FileExtensions: string[];
        Description: null;
        Required: true;
        AdditionalFile: boolean;
        DocumentCode: string;
        ShortDesc: string;
      }[];
      ProcessName: string;
      DocumentFlowName: string;
      IntialDocumentUploaded: false;
      AdditionalDocumentUploaded: number;
    };
  };
}

export interface CardIssuanceDocsPayloadT {
  Country: string;
  ticketNumber: string;
  Cif: string;
  Service: string;
  documents: {
    Filename: string;
    Format: string;
    docCode: string;
    data: string;
  }[];
}
export interface DocumentsUploadResponseT extends ApiResponse {
  responseObject: {
    docCode: string;
    id: string;
    filename: string;
    success: boolean;
    message: string;
  }[];
}
