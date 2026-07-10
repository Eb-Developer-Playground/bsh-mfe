import { Directive } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Directive({
  selector: '[appPassport]',
})
export class PassportDirective {
  constructor() {}
}

export function validatePassport(
  control: AbstractControl
): { [key: string]: any } | undefined {
  const val = control.value;

  if (val === null || val === '') {
    return undefined;
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

  return; // return null if validation is passed.
}

export function validateLicense(
  control: AbstractControl
): { [key: string]: any } | undefined {
  const val = control.value;

  if (val === null || val === '') {
    return undefined;
  } else {
    if (!val.toString().match(/[A-Z]{3}[0-9]{3}/g)) {
      return { invalidLicense: true };
    }

    if (
      (control.value && control.value.length < 6) ||
      (control.value && control.value.length > 6)
    ) {
      return { invalidLicenseNumber: true }; // return object if the validation is not passed.
    }
  }

  return; // return null if validation is passed.
}

export function validateMilitaryNumber(
  control: AbstractControl
): { [key: string]: any } | undefined {
  const val = control.value;

  if (val === null || val === '') {
    return undefined;
  } else {
    if (!val.toString().match(/[0-9]{5}/g)) {
      return { invalidMilitaryDigits: true };
    }

    if (
      (control.value && control.value.length < 5) ||
      (control.value && control.value.length > 6)
    ) {
      return { invalidLicenseNumber: true }; // return object if the validation is not passed.
    }
  }

  return; // return null if validation is passed.
}

export function validateRefugeeIDNumber(
  control: AbstractControl
): { [key: string]: any } | undefined {
  const val = control.value;

  if (val === null || val === '') {
    return undefined;
  } else {
    if (!val.toString().match(/[0-9]{8}/g)) {
      return { invalidRefugeeIDDigits: true };
    }

    if (
      (control.value && control.value.length < 8) ||
      (control.value && control.value.length > 8)
    ) {
      return { invalidRefugeeID: true }; // return object if the validation is not passed.
    }
  }

  return; // return null if validation is passed.
}
