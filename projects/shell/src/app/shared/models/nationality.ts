import { SearchableItem } from '../form-controls';

export interface INationality {
  nationalityCode: string;
  nationalityName: string;
}

export class Nationality implements SearchableItem {
  nationalityCode: string;
  nationalityName: string;

  constructor(data: INationality) {
    this.nationalityCode = data.nationalityCode;
    this.nationalityName = data.nationalityName;
  }

  toInternal(): string {
    return this.nationalityCode;
  }

  toString(): string {
    return this.nationalityName;
  }
}
