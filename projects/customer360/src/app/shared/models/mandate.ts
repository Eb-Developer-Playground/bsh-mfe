import { SearchableItem } from '../form-controls';

export interface IMandate {
  bank_Id: string;
  ref_Code: string;
  ref_Desc: string;
}

export class Mandate implements SearchableItem {
  bank_Id: string;
  ref_Code: string;
  ref_Desc: string;

  constructor(data: IMandate) {
    this.bank_Id = data.bank_Id;
    this.ref_Code = data.ref_Code;
    this.ref_Desc = data.ref_Desc;
  }

  toInternal(): string {
    return this.ref_Code;
  }

  toString(): string {
    return this.ref_Desc;
  }
}
