import {AbstractControl, ValidationErrors, ValidatorFn} from "@angular/forms";

export function selectionWithinArray(array: Array<any>, objectKey: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const selection: any = control.value;
        const found = array.find((element: any) => element[objectKey] === selection);
        return found || !control.value ? null : {requireWithinArray: true};
    };
}
