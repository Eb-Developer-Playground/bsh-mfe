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

export type TAccountDetails = {
    cif: string;
    accountCurrency: string;
    accountName: string;
    accountNumber: string;
    accountOpeningDate: string;
    accountStatus: string;
    availableBalance: string;
    disbursedAmount: string | null;
    disbursementAmountSpecified: boolean;
    ecoCode: string | null;
    effectiveBalance: string;
    flowAmmount: string | null;
    freezeCode: string;
    freezeReasonCode: string | null;
    lienAmmount: string;
    mandate: string;
    nextDueDate: string | null;
    nextPaymentDueInNumOfDays: number;
    percentCompleted: number;
    remainingNumberOfInstalments: number | null;
    sanctionLimit: string;
    scheduleNo: string | null;
    schemeCode: string;
    schemeType: string;
    shortName: string | null;
    iban: string | null;
};
