import { AbstractControl } from '@angular/forms';

export function validateKenyanPhoneNumber(c: AbstractControl) {
  if (!c.value) return null;
  const regex = /^[0-9]+(\.?[0-9]+)?$/;
  return c.value?.length < 10 && c.value?.length > 5 && regex.test(c.value)
    ? null
    : { invalidKenyanPhoneNumber: true };
}
