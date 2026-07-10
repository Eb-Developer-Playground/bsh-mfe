import { SearchableItem } from '../form-controls';

export interface ITownCity {
  code: string;
  refCode: string;
  refDesc: string;
  townOrCity: string;
}

export class TownCity implements SearchableItem {
  code: string;
  refCode: string;
  refDesc: string;
  townOrCity: string;

  constructor(data: ITownCity) {
    this.code = data.code;
    this.refCode = data.refCode;
    this.refDesc = data.refDesc;
    this.townOrCity = data.townOrCity;
  }

  toInternal(): string {
    return this.refCode;
  }

  toString(): string {
    return this.refDesc;
  }
}
