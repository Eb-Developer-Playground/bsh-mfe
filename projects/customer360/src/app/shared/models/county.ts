import { SearchableItem } from '../form-controls';

export interface ICounty {
  ref_Code: string;
  ref_Desc: string;
  isDeleted: boolean;
}

export class County implements SearchableItem {
  ref_Code: string;
  ref_Desc: string;
  isDeleted: boolean;

  constructor(data: ICounty) {
    this.ref_Code = data.ref_Code;
    this.ref_Desc = data.ref_Desc;
    this.isDeleted = data.isDeleted;
  }

  toInternal(): string {
    return this.ref_Code;
  }

  toString(): string {
    return this.ref_Desc;
  }
}
