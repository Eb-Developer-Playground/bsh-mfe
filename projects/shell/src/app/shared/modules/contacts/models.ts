import { IFormFieldState } from '../../models/fieldstates';

export declare interface EmailType {
  value: string;
  localetext: string;
  disabled?: boolean;
}

export declare interface PhoneType {
  value: string;
  localetext: string;
  disabled?: boolean;
}

export interface PhoneNumberFieldStates {
  id?: IFormFieldState;
  type?: IFormFieldState;
  cityCode?: IFormFieldState;
  countryCode?: IFormFieldState;
  number?: IFormFieldState;
  comment?: IFormFieldState;
  isPreferred?: IFormFieldState;
  toBeDeleted?: IFormFieldState;
  isMandatory?: IFormFieldState;
}

export interface EmailAddressFieldStates {
  id?: IFormFieldState;
  type?: IFormFieldState;
  emailAddress?: IFormFieldState;
  comment?: IFormFieldState;
  isPreferred?: IFormFieldState;
  toBeDeleted?: IFormFieldState;
  isMandatory?: IFormFieldState;
}
