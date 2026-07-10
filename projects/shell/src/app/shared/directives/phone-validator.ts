import { Directive } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, Validator } from '@angular/forms';

export function ValidatePhone(
  control: AbstractControl
): { [key: string]: any } | null {
  const val = control.value;

  if (val === null || val === '') return null;
  if (!control.value.startsWith('254')) return { invalidCountryCode: true };
  if (!val.toString().match(/^[0-9]+(\.?[0-9]+)?$/))
    return { invalidNumber: true };
  if (control.value && control.value.length !== 12) {
    return { phoneNumberInvalid: true }; // return object if the validation is not passed.
  }
  return null; // return null if validation is passed.
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
      (control.value.length < 9 || control.value.length > 12)
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

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[phoneValidateDirective]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: AppPhoneValidateDirective,
      multi: true,
    },
  ],
})
export class AppPhoneValidateDirective implements Validator {
  validate(control: AbstractControl): { [key: string]: any } | null {
    if (control.value && control.value.length != 10) {
      return { phoneNumberInvalid: true }; // return object if the validation is not passed.
    }
    return null; // return null if validation is passed.
  }
}
