export interface ServiceOptions {
  title: string;
  text: string;
  icon: string;
  url: string;
  display?: boolean;
}

export interface exchangeRates {
  fromCountry: string;
  fromCurrency: string;
  rate: number;
  rateCode: string;
  toCountry: string;
  toCurrency: string;
  previousRate: number;
  fromCurrencyName: string;
  toCurrencyName: string;
}

export interface ExchangeDetailsT {
  RateCode: string;
  ExchangeRate: string;
  BaseExchangeRate: string;
  TreasuryRate: string;
  SearchByCif: string;
  ConvertedCurrency: string;
  ConvertedAmount: string;
  ticketNumber: string;
  isSpecial: string;
}

export enum specialCodeState {
  undefined = 'undefined',
  accepted = 'accepted',
  declined = 'declined',
}

export interface specialRate {
  dealAmount: string;
  dealAmountTo: number;
  dealDateAsDate?: string;
  cif: string;
  dealAmmount: string;
  dealCurrency: string;
  dealCurrencyTo: string;
  dealDate: string;
  dealRate: string;
  dealRateCode: string;
  fromCurrency: string;
  refNo: string;
  toCurrency: string;
  treasuryRate: string;
}

export interface TicketInformationT {
  status: string;
  user: string;
  ticketID: number;
  comments: string;
  createdOnUtc: string;
}

export interface CustomerAccountDataT {
  accountCurrency: string;
  accountName: string;
  accountNumber: string;
  accountOpeningDate: string;
  accountStatus: string;
  availableBalance: string;
  disbursedAmount: any;
  disbursementAmountSpecified: any;
  ecoCode: any;
  effectiveBalance: string;
  flowAmmount: any;
  freezeCode: string;
  freezeReasonCode: any;
  iban: any;
  lienAmmount: string;
  mandate: string;
  nextDueDate: any;
  nextPaymentDueInNumOfDays: any;
  percentCompleted: any;
  remainingNumberOfInstalments: any;
  sanctionLimit: string;
  scheduleNo: any;
  schemeCode: string;
  schemeType: string;
  shortName: any;
}

export interface SpecialRateObjT {
  dealAmount: string;
  dealAmountTo: string;
  dealDateAsDate: string;
  cif: string;
  dealAmmount: string;
  dealCurrency: string;
  dealCurrencyTo: string;
  dealDate: string;
  dealRate: string;
  dealRateCode: string;
  fromCurrency: string;
  refNo: string;
  toCurrency: string;
  treasuryRate: string;
}

export interface MoveMoneyDocInfoT {
  responseObject: {
    service: string;
    processName: string;
    documents: {
      fileName: string;
      fileExtensions: string[];
      service: any;
      status: any;
      createdAt: any;
      createdBy: any;
      id: any;
      fileNameWithExtension: any;
      description: any;
      documentCode: string;
      mapsTo: any;
      processName: any;
      required: false;
    }[];
  };

  statusCode: string;
  statusMessage: string;
  successful: boolean;
}

export interface MoveMoneyDocRequestPayloadT {
  SenderDetails: {
    AssociatedId: string;
    CustomerName: string;
    CustomerId: string;
    BankId: string;
    TransactionType: string;
    TransferType: string;
    SourceAccount: string;
    SourceAccountCurrency: string;
    CurrencyCode: string;
    Amount: number;
    PaymentReason: string;
    SkipBio: boolean;
  };
  BeneficiaryDetails: {
    Address: string;
    BIC: string;
    BankName: string;
    DestinationAccount: string;
    DestinationAccountCurrency: string;
    DestinationAccountType: string;
    Email: string;
    Favorited: boolean;
    FullName: string;
    Phone: string;
  };
  TransactionDetails: {
    InstrumentType: any;
    InstrumentDate: any;
    InstrumentNumber: any;
  };
  ExchangeDetails: {
    RateCode: string;
    ExchangeRate: string;
    BaseExchangeRate: string;
    TreasuryRate: string;
    SearchByCif: string;
    ConvertedCurrency: string;
    ConvertedAmount: number;
    TicketNumber: string;
  };
  NotificationDetails: {
    Sms: boolean;
    Email: boolean;
  };
  Fee: string;
}

export interface MoveMoneyDocsRequestedT {
  createdAt: any;
  createdBy: any;
  description: any;
  documentCode: string;
  fileExtensions: string[];
  fileName: string;
  fileNameWithExtension: any;
  id: any;
  mapsTo: any;
  processName: any; // is always null
  required: boolean;
  service: any;
  status: any;
}

export interface MoveMoneyDocValidators {
  formName: string;
  fileName: string;
  required: boolean;
  value?: string;
  format?: string;
}
