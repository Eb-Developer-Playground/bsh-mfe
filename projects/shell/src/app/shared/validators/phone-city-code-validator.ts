import { AbstractControl } from '@angular/forms';

export function validatePhoneCityCode(c: AbstractControl) {
  if (!c.value) return null;
  return c.value?.length <= 3 ? null : { invalidPhoneCityCode: true };
}
