import { SearchableItem } from '../form-controls';

export interface IReligion {
  code: string;
  codeDesc: string;
}

export class Religion implements SearchableItem {
  code: string;
  codeDesc: string;

  constructor(data: IReligion) {
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
