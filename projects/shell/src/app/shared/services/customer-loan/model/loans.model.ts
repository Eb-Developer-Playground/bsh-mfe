export interface Loans {
  accountCurrency: string;
  accountName: string;
  accountNumber: string;
  accountOpeningDate: Date;
  accountStatus: string;
  availableBalance: number;
  disbursedAmount: number;
  disbursementAmountSpecified: boolean;
  ecoCode: string;
  effectiveBalance: number;
  flowAmmount: number;
  freezeCode: number;
  freezeReasonCode: string;
  lienAmmount: number;
  mandate: string;
  nextDueDate: string;
  nextPaymentDueInNumOfDays: number;
  percentCompleted: number;
  remainingNumberOfInstalments: number;
  sanctionLimit: number;
  scheduleNo: number;
  schemeCode: string;
}
