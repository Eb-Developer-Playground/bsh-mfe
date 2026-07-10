import { Directive } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, Validator } from '@angular/forms';

export function ValidateNationalId(
  control: AbstractControl
): { [key: string]: any } | undefined {
  const val = control.value;

  if (val === null || val === '') return;

  if (!val.toString().match(/^[0-9]+(\.?[0-9]+)?$/))
    return { invalidNumber: true };
  if (control.value && control.value.length > 8) {
    return { nationalIdInvalid: true }; // return object if the validation is not passed.
  }
  return;
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

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[nationalIdValidateDirective]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: AppNationalIdValidateDirective,
      multi: true,
    },
  ],
})
export class AppNationalIdValidateDirective implements Validator {
  validate(control: AbstractControl): { [key: string]: any } | null {
    if (control.value && control.value.length != 8) {
      return { nationalIdInvalid: true }; // return object if the validation is not passed.
    }
    return null; // return null if validation is passed.
  }
}
