import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function validValue(array: Array<any>): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const searchString: any = control.value;
    if (!searchString) return null;
    return !array.some((el: any) => el.toString() === searchString)
      ? { invalid: true }
      : null;
  };
}
