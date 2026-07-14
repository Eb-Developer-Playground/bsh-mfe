import {AbstractControl} from "@angular/forms";

export function validateEmail(control: AbstractControl): {[key: string]: any} | null {
    const emailRegEx =
        /* eslint-disable */
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i;
    const valid = emailRegEx.test(control.value);
    return control.value < 1 || valid ? null : {isEmail: true};
}
