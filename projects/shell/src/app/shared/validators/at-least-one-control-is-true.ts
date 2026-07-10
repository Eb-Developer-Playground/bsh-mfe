import { AbstractControl, ValidatorFn } from '@angular/forms';

export function atLeastOneTrueValidator(controlNames: string[]): ValidatorFn {
  return (formGroup: AbstractControl) => {
    const isValid = controlNames.some(
      controlName => formGroup.get(controlName)?.value === true
    );

    return isValid ? null : { atLeastOneRequired: true };
  };
}
