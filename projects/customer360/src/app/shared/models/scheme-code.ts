import { SearchableItem } from '../form-controls';

export interface ISchemeCode {
  bank_Id: number;
  schm_Code: string;
  schm_Desc: string;
  schm_Type: string;
}

export class SchemeCode implements SearchableItem {
  bank_Id!: number;
  schm_Code!: string;
  schm_Desc!: string;
  schm_Type!: string;

  constructor(data: ISchemeCode) {
    this.bank_Id = data.bank_Id;
    this.schm_Code = data.schm_Code;
    this.schm_Desc = data.schm_Desc;
    this.schm_Type = data.schm_Type;
  }

  toInternal(): string {
    return this.schm_Code;
  }

  toString(): string {
    return this.schm_Code;
  }
}
