import {IFormFieldState} from "../fieldstates";

export interface IPhoneNumberFieldStates {
    id?: IFormFieldState;
    cityCode?: IFormFieldState;
    comment?: IFormFieldState;
    countryCode?: IFormFieldState;
    number?: IFormFieldState;
    phoneType?: IFormFieldState;
    isPreferred?: IFormFieldState;
    toBeDeleted?: IFormFieldState;
    isMandatory?: IFormFieldState;
}

export interface PhoneNumber {
    id?: any;
    phoneType?: string;
    cityCode?: string;
    comment?: string;
    countryCode?: string;
    number?: string;
    isPreferred?: boolean;
    toBeDeleted?: boolean;
    isMandatory?: boolean;
}

export interface IEmailAddressFieldStates {
    id?: IFormFieldState;
    comment?: IFormFieldState;
    emailAddress?: IFormFieldState;
    emailType?: IFormFieldState;
    isPreferred?: IFormFieldState;
    toBeDeleted?: IFormFieldState;
    isMandatory?: IFormFieldState;
}

export interface EmailAddress {
    id?: any;
    emailType?: string;
    emailAddress?: string;
    comment?: any;
    isPreferred?: boolean;
    toBeDeleted?: boolean;
    isMandatory?: boolean;
}
