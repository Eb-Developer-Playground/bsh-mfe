import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ICountry } from './types';

export function isValidCountryCode(array: Array<ICountry>): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const val: any = control.value;
    return array.some((el: any) => el.dialCode === val) || !val
      ? null
      : { invalidCountryCode: true };
  };
}
