import { SearchableItem } from '../form-controls';

export interface IProfession {
  prof: string;
  numCode: string;
}

export class Profession implements SearchableItem {
  prof: string;
  numCode: string;

  constructor(data: IProfession) {
    this.prof = data.prof;
    this.numCode = data.numCode;
  }

  toInternal(): string {
    return this.numCode;
  }

  toString(): string {
    return this.prof;
  }
}
