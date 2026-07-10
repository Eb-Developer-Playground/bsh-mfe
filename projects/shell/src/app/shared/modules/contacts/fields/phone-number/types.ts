export class PhoneNumber {
  constructor(
    public countryCode: string,
    public cityCode: string,
    public number: string
  ) {}
}

export interface IPhoneNumber {
  countryCode: string;
  cityCode: string;
  number: string;
}

export interface ICountry {
  dialCode: string;
  countryName: string;
  countryCode: string;
  flagPath: string;
  [key: string]: any;
}

export interface IContactDedupeItem {
  firstName: string;
  lastName: string;
  cifId: string;
}
