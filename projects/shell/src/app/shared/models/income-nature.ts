import { SearchableItem } from '../form-controls';

export interface IIncomeNature {
  categoryType: 'INCOME_NATURE';
  value: 'Stable';
  incomeNatur: 'Stable';
  bankId: '54';
}

export class IncomeNature implements SearchableItem {
  categoryType: string;
  value: string;
  incomeNatur: string;
  bankId: string;

  constructor(data: IIncomeNature) {
    this.categoryType = data.categoryType;
    this.value = data.value;
    this.incomeNatur = data.incomeNatur;
    this.bankId = data.bankId;
  }

  toInternal(): string {
    return this.value;
  }

  toString(): string {
    return this.incomeNatur;
  }
}
