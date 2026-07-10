import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function ValidateNationalId(
  control: AbstractControl
): { [key: string]: any } | null {
  const val = control.value;

  if (!val) return null;

  if (!val.toString().match(/^[0-9]+(\.?[0-9]+)?$/))
    return { invalidNumber: true };
  if ((control.value && control.value.length < 6) || control.value.length > 8) {
    return { nationalIdInvalid: true }; // return object if the validation is not passed.
  }

  return null;
}

export function ValidateFields(
  control: AbstractControl
): { [key: string]: any } | undefined {
  const val = control.value;
  if (val === null || val === '') return { invalidField: true };
  return;
}

export function ValidatePostal(
  control: AbstractControl
): { [key: string]: any } | undefined {
  const val = control.value;
  if (val === null || val === '') return;
  if (!val.toString().match(/^[0-9]+(\.?[0-9]+)?$/))
    return { invalidNumber: true };
  return;
}

export function ValidatePassport(
  control: AbstractControl
): { [key: string]: any } | null {
  const val = control.value;

  if (!val) return null;

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

  return null; // return null if validation is passed.
}

export function ValidateLicense(
  control: AbstractControl
): { [key: string]: any } | null {
  const val = control.value;

  if (!val) return null;

  if (!val.toString().match(/[A-Z]{2}-[0-9]{3}/g)) {
    return { invalidLicense: true };
  }
  if (
    (control.value && control.value.length < 6) ||
    (control.value && control.value.length > 11)
  ) {
    return { invalidLicenseNumber: true }; // return object if the validation is not passed.
  }

  return null; // return null if validation is passed.
}

export function ValidateUNHCRProof(
  control: AbstractControl
): { [key: string]: any } | null {
  const val = control.value.toString();

  if (!val) return null;

  if (!val.match(/\d{3}-\d{8,9}/)) {
    return { invalidUNHCRProof: true };
  }
  if (val.length < 12 || val.length > 13) {
    return { invalidUNHCRProof: true };
  }

  return null; // return null if validation is passed.
}

export function ValidateMilitaryNumber(
  control: AbstractControl
): { [key: string]: any } | null {
  const val = control.value;

  if (!val) return null;

  if (!val.toString().match(/[0-9]{5}/g)) {
    return { invalidMilitaryDigits: true };
  }
  if (
    (control.value && control.value.length < 5) ||
    (control.value && control.value.length > 6)
  ) {
    return { invalidLicenseNumber: true }; // return object if the validation is not passed.
  }

  return null; // return null if validation is passed.
}

export function ValidateRefugeeIDNumber(
  control: AbstractControl
): { [key: string]: any } | null {
  const val = control.value;

  if (!val) return null;

  if (!val.toString().match(/[0-9]{8}/g)) {
    return { invalidRefugeeIDDigits: true };
  }

  if (
    (control.value && control.value.length < 8) ||
    (control.value && control.value.length > 8)
  ) {
    return { invalidRefugeeID: true }; // return object if the validation is not passed.
  }

  return null; // return null if validation is passed.
}

export function RequireOccupationMatch(arr: any): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const selection: any = control.value;
    const found = arr.find(
      (el: { cityPlaceName: any }) => el.cityPlaceName === selection
    );
    if (arr && !found) {
      return { requireOccupationMatch: true };
    }
    return null;
  };
}
