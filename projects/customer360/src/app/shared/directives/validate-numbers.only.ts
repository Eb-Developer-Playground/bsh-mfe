import { AbstractControl } from '@angular/forms';

export function validateNumbersOnly(
  control: AbstractControl
): { [key: string]: any } | null {
  const val = control.value;

  if (val === null || val === '') {
    return null;
  } else {
    if (!val.toString().match(/^\d+$/)) return { invalidNumbersOnly: true };
  }

  return null; // return null if validation is passed.
}
