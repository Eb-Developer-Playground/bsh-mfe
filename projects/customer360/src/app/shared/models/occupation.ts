import { SearchableItem } from '../form-controls';

export interface IOccupation {
  code: string;
  codeDesc: string;
}

export class Occupation implements SearchableItem {
  code: string;
  codeDesc: string;

  constructor(data: IOccupation) {
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
