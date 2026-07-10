import { Directive } from '@angular/core';
import { Validator, AbstractControl, NG_VALIDATORS } from '@angular/forms';

export function ValidateNationalId(
  control: AbstractControl
): { [key: string]: any } | null {
  const val = control.value;

  if (val === null || val === '') return null;

  if (!val.toString().match(/^[0-9]+(\.?[0-9]+)?$/))
    return { invalidNumber: true };
  if (
    (control.value && control.value.length <= 6) ||
    control.value.length > 20
  ) {
    return { nationalIdInvalid: true }; // return object if the validation is not passed.
  }
  return null;
}

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[nationalidValidator]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: NationalidValidatorDirective,
      multi: true,
    },
  ],
})
export class NationalidValidatorDirective implements Validator {
  validate(control: AbstractControl): { [key: string]: any } | null {
    if (control.value && control.value.length != 8) {
      return { nationalIdInvalid: true }; // return object if the validation is not passed.
    }
    return null; // return null if validation is passed.
  }
}
