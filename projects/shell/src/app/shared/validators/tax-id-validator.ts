import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ISubsidiary } from '../services/session/session.service';
import CONST from '@shared/utils/constants';

const { COUNTRY_CODE } = CONST;

export function validateTaxID(args?: {
  isIndividualOrJoint?: boolean;
  subsidiary?: ISubsidiary;
}): ValidatorFn {
  let regex: RegExp = /\b[A-Z]{1}[0-9]{9}[A-Z]{1}\b/g;
  if (args?.subsidiary?.countryCode === 'KE') {
    if (args?.isIndividualOrJoint) regex = /\bA{1}[0-9]{9}[A-Z]{1}\b/g;
    else regex = /\b[AP]{1}[0-9]{9}[A-Z]{1}\b/g;
  }
  if (args?.subsidiary?.countryCode === 'UG') {
    regex = /\b[0-9]{10}\b/g;
  }
  if (args?.subsidiary?.countryCode === 'RW') {
    regex = /\b[0-9]{9}\b/g;
  }
  if (args?.subsidiary?.countryCode === 'SS') {
    regex = /\b[0-9A-Z]{15}\b/g;
  }
  if (args?.subsidiary?.countryCode === 'TZ') {
    regex = /\b[0-9]{3}-[0-9]{3}-[0-9]{3}\b/g;
  }
  if (args?.subsidiary?.countryCode === COUNTRY_CODE.CD) {
    regex = /\b[0-9]{10}\b/g;
  }
  return (control: AbstractControl): ValidationErrors | null => {
    const val = control.value;
    if (!val) return null;
    return !val.toString().match(regex) ? { invalidTaxID: true } : null;
  };
}
