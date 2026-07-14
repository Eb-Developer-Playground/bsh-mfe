export declare namespace AmendStandingOrder {
  export interface SenderDetails {
    StandingOrderType: string;
    AssociatedId: any;
    CustomerName: any;
    CustomerId: string;
    BankId: any;
    SourceAccount: string;
    SourceAccountCurrency: any;
    CurrencyCode: string;
    Amount: string;
    Frequency: string;
    StartDate: string | null;
    EndDate?: any;
    ExecutionTime: string;
    DayOfExecution?: any;
    PaymentReason: string;
    SkipBio: any;
    Charge: any;
  }

  export interface BeneficiaryDetails {
    FullName: string;
    DestinationAccount: string;
    BIC: any;
    BankName: any;
    Address: any;
    Phone: any;
    Email: any;
    CityState: any;
    BranchCityCode: any;
    BranchCityCodeName: any;
    BranchCode: any;
    BranchCodeName: any;
    RecipientReferenceNumber: any;
    RemitterDetails: any;
  }

  export interface NotificationDetails {
    Sms: boolean;
    Email: boolean;
  }

  export interface RootObject {
    SenderDetails: SenderDetails;
    BeneficiaryDetails: BeneficiaryDetails;
    NotificationDetails: NotificationDetails;
    CustomerPresent: boolean;
    StandingOrderId: any;
  }
}
