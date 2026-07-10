import { SearchableItem } from '../form-controls';

export interface IRegion {
  bank_Id: string;
  categoryType: string;
  regionLocation: string;
  value: string;
}

export class Region implements SearchableItem {
  bank_Id: string;
  categoryType: string;
  regionLocation: string;
  value: string;

  constructor(data: IRegion) {
    this.bank_Id = data.bank_Id;
    this.categoryType = data.categoryType;
    this.regionLocation = data.regionLocation;
    this.value = data.value;
  }

  toInternal(): string {
    return this.value;
  }

  toString(): string {
    return this.regionLocation;
  }
}
