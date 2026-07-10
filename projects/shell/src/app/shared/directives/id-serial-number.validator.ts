import { AbstractControl } from '@angular/forms';

export function ValidateIdSerialNumber(
  control: AbstractControl
): { [key: string]: any } | undefined {
  const val = control.value;

  if (!val) return;

  if (!val.toString().match(/^[0-9]+(\.?[0-9]+)?$/))
    return { invalidNumber: true };
  // if (control.value && control.value.length <= 6 || control.value.length > 20) {
  //   return { 'idSerialNumberInvalid': true }; // return object if the validation is not passed.
  // }
  return;
}
