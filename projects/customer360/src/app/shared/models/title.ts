import { SearchableItem } from '../form-controls';

export interface ITitle {
  bank_Id: string;
  categoryType: string;
  value: string;
  titleDesc: string;
}

export class Title implements SearchableItem {
  bank_Id: string;
  categoryType: string;
  value: string;
  titleDesc: string;

  constructor(data: ITitle) {
    this.bank_Id = data.bank_Id;
    this.categoryType = data.categoryType;
    this.value = data.value;
    this.titleDesc = data.titleDesc;
  }

  toInternal(): string {
    return this.value;
  }

  toString(): string {
    return this.titleDesc;
  }
}
