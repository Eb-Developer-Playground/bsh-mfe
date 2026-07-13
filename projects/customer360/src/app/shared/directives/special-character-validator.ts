import { AbstractControl, ValidationErrors } from '@angular/forms';

export class SpecialCharacterValidator {
  static containsSpecialCharacters(
    control: AbstractControl
  ): ValidationErrors | null {
    if (!control.value) return null;
    if (control.value.match(/[!@#$£%^&*()_+\-=[\]{};:"\\~|<>/?]/)) {
      return { containsSpecialCharacters: true };
    }
    return null;
  }
}
