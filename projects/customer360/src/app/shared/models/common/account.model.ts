export namespace AccountMgt {
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
    flowAmmount?: any;
    mandate: string;
    accountOpeningDate: string;
    freezeCode: string;
    freezeReasonCode: string;
    lienAmmount: string;
    remainingNumberOfInstalments?: any;
    percentCompleted: number;
    nextPaymentDueInNumOfDays: number;
    nextDueDate?: any;
    disbursedAmount?: any;
    disbursementAmountSpecified: boolean;
    ecoCode?: any;
  }
}
