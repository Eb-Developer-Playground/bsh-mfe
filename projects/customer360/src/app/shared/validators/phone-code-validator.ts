import {AbstractControl} from "@angular/forms";

export function validateCountryCode(c: AbstractControl) {
    if (!c.value) return null;
    const countryInfoArray = JSON.parse(localStorage.getItem("countryInfo") as string) || [];
    if (!countryInfoArray.length) return null;
    const validCodes = countryInfoArray.map((countryInfo: any) => countryInfo.dialCode);
    return validCodes.indexOf(c.value) > -1 || validCodes.length === 6
        ? null
        : {invalidPhoneCountryCode: true};
}
