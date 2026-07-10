import { SearchableItem } from '../form-controls';

export interface IRelation {
  bank_Id: string;
  categoryType: string;
  value: string;
  relationship: string;
}

export class Relation implements SearchableItem {
  bank_Id: string;
  categoryType: string;
  value: string;
  relationship: string;

  constructor(data: IRelation) {
    this.bank_Id = data.bank_Id;
    this.categoryType = data.categoryType;
    this.value = data.value;
    this.relationship = data.relationship;
  }

  toInternal(): string {
    return this.value;
  }

  toString(): string {
    return '';
  }
}
