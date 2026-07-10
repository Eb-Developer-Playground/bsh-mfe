import { SearchableItem } from '../form-controls';

export interface IMaritalStatus {
  code: string;
  codeDesc: string;
}

export class MaritalStatus implements SearchableItem {
  code: string;
  codeDesc: string;

  constructor(data: IMaritalStatus) {
    this.code = data.code;
    this.codeDesc = data.codeDesc;
  }

  toInternal(): string {
    return this.code;
  }

  toString(): string {
    return this.codeDesc;
  }
}
