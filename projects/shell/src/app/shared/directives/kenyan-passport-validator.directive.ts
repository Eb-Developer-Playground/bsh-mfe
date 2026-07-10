import { Directive, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[kenyanPassportValidator]',
})

export class KenyanPassportValidatorDirective {
  constructor() {}
}

export function validateKenyanPassport(
  control: AbstractControl
): { [key: string]: any } | null {
  const val = control.value;

  if (val === null || val === '') {
    return null;
  } else {
    if (
      !val.toString().match(/[A-Z]{1}[0-9]{6}/g) &&
      !val.toString().match(/[A-Z]{2}[0-9]{7}/g)
    ) {
      return { invalidPassport: true };
    }

    if (
      (control.value && control.value.length < 7) ||
      (control.value && control.value.length > 9)
    ) {
      return { invalidPassportNumber: true }; // return object if the validation is not passed.
    }
  }

  return null; // return null if validation is passed.
}
