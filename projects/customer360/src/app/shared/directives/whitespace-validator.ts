import { AbstractControl, ValidationErrors } from '@angular/forms';

export class WhiteSpaceValidator {
  static containsOnlySpaces(control: AbstractControl): ValidationErrors | null {
    if (((control.value || '').trim() as string) === '') {
      return { containsOnlySpaces: true };
    }
    return null;
  }
}

export function ValidateShortPhone(
  control: AbstractControl
): { [key: string]: any } | null {
  const val = control.value;

  if (val === null || val === '') {
    return null;
  } else {
    // if (!control.value.startsWith('7')) return { 'invalidCountryCode': true };
    if (!val.toString().match(/^[0-9]+(\.?[0-9]+)?$/))
      return { invalidNumber: true };
    if (
      control.value &&
      (control.value.length < 9 || control.value.length > 9)
    ) {
      return { phoneNumberInvalid: true }; // return object if the validation is not passed.
    }
  }

  return null; // return null if validation is passed.
}

export function ValidateFieldToNumbersOnly(
  control: AbstractControl
): { [key: string]: any } | null {
  const val = control.value;

  if (val === null || val === '') {
    return null;
  } else {
    if (!val.toString().match(/^[0-9]+(\.?[0-9]+)?$/))
      return { invalidNumber: true };
  }

  return null; // return null if validation is passed.
}

export function ValidateFieldToLettersOnly(
  control: AbstractControl
): { [key: string]: any } | null {
  const val = control.value;

  if (val === null || val === '') {
    return null;
  } else {
    if (!val.toString().match(/^[a-zA-Z\s]*$/)) return { invalidLetter: true };
  }

  return null; // return null if validation is passed.
}
