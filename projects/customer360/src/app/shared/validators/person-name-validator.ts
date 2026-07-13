import {AbstractControl} from "@angular/forms";

export function validatePersonName(c: AbstractControl) {
    // const regex = /^[a-zA-Z\s]*$/;
    const regex = /^[a-zA-ZÀ-ÿ'-\s]*$/;
    if (!c.value) return null;

    return regex.test(c.value) ? null : {invalidPersonalName: true};
}
