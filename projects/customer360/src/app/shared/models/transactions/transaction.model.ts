export namespace Transactions {
  export interface TransactionDetail {
    pstdDate: Date;
    transactionBalance: number;
    transactionCategory: string;
    transactionId: string;
    transactionSerialNo: string;
    valueDate: Date;
    instrumentId?: any;
    transactionAmt: string;
    transactionDate: Date;
    transactionDescription: string;
    transactiontype: string;
    addtnlData?: any;
    transactionRemarks: string;
    transactionReference: string;
  }

  export interface Transaction {
    accountNumber: string;
    availableBalance: string;
    branchId: string;
    ffdBalance: string;
    currencyCode: string;
    floatingBalance: string;
    ledgerBalance: string;
    userDefinedBalance: string;
    field125?: any;
    field126?: any;
    field127?: any;
    hasMoreData: string;
    solId?: any;
    thb?: any;
    balanceBroughtForward?: any;
    backendReferenceNumber: string;
    transactionDetails: TransactionDetail[];
  }

  export interface Response {
    statusMessage: string;
    statusCode: string;
    successful: boolean;
    responseObject: Transaction;
  }

  export interface TransactionHistory {
    createdBy: string;
    action: string;
    description: string;
    message: string;
    customerId: string;
    source: string;
    channel: string;
    status: string;
    ipAddress: string;
    reference: string;
    deviceOS?: any;
    buildVersion?: any;
  }

  export interface TransactionHistoryResponse {
    responseObject: TransactionHistory[];
    statusCode: string;
    statusMessage: string;
    successful: boolean;
  }

  export interface Account {
    cif: string;
    accountName: string;
    accountNumber: string;
    accountCurrency: string;
    schemeType: string;
    accountStatus: string;
    schemeCode: string;
    availableBalance: string;
    effectiveBalance: string;
    scheduleNo?: any;
    sanctionLimit: string;
    flowAmmount: string;
    mandate: string;
    accountOpeningDate: Date;
    freezeCode: string;
    freezeReasonCode: string;
    lienAmmount: string;
    remainingNumberOfInstalments?: any;
    percentCompleted: number;
    nextPaymentDueInNumOfDays: number;
    nextDueDate?: any;
    disbursedAmount: string;
    disbursementAmountSpecified: boolean;
    ecoCode?: any;
  }
}
