import {AbstractControl} from "@angular/forms";

export function validateMaritalStatus(c: AbstractControl) {
    if (!c.value) return null;
    return ["001", "002", "003", "004", "005", "006", "007"].includes(c.value)
        ? null
        : {invalid: true};
}
