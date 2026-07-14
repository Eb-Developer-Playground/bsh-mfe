import { SearchableItem } from '../form-controls';

export interface ICountry {
  countryCode: string;
  countryName: string;
}

export class Country implements SearchableItem {
  countryCode!: string;
  countryName!: string;

  constructor(data: ICountry) {
    this.countryCode = data.countryCode;
    this.countryName = data.countryName;
  }

  toInternal(): string {
    return this.countryCode;
  }

  toString(): string {
    return this.countryName;
  }
}
