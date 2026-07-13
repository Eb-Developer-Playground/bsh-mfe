import { SearchableItem } from '../form-controls';

export interface ICountryInfo {
  countryCode: string;
  countryCode3Chars: string;
  countryName: string;
  currency: string;
  currencySymbol: string;
  dialCode: string;
  flagPath: string;
  nationality: string;
  operatingCountry: boolean;
}

export class CountryInfo implements SearchableItem {
  countryCode: string;
  countryCode3Chars: string;
  countryName: string;
  currency: string;
  currencySymbol: string;
  dialCode: string;
  flagPath: string;
  nationality: string;
  operatingCountry: boolean;

  constructor(data: ICountryInfo) {
    this.countryCode = data.countryCode;
    this.countryName = data.countryName;
    this.countryCode3Chars = data.countryCode3Chars;
    this.currency = data.currency;
    this.currencySymbol = data.currencySymbol;
    this.dialCode = data.dialCode;
    this.flagPath = data.flagPath;
    this.nationality = data.nationality;
    this.operatingCountry = data.operatingCountry;
  }

  toInternal(): string {
    return this.countryCode;
  }

  toString(): string {
    return this.countryName;
  }
}
