export interface CardDetails {
  id?: string;
  cardType: string;
  cardStatus: string;
  cardContractStatus: string;
  availableBalance: string;
  rbsNumber: string;
  currency: string;
  cardProduct: string;
  cardName: string;
  cardScheme: string;
  maskPan: string;
  cardExpiry: string;
  creditLimit: string;
  cardLimits: CardLimit[];
  firstName?: string;
  lastName?: string;
  middleName?: string;
}

export interface CardLimit {
  name: string;
  type: string;
  amount: number;
  currency: string;
  applicableUsageCode: TypeOfCardLimit[];
}

export interface TypeOfCardLimit {
  code: string;
  maxAmount: number;
}
