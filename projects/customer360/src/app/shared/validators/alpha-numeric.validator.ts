import {AbstractControl} from "@angular/forms";

export function alphaNumericValidator(c: AbstractControl) {
    const regex = new RegExp(/^[a-zA-Z0-9_\s]*$/);
    if (c.value) return regex.test(c.value) ? null : {notAlphaNumeric: true};
    return null;
}
