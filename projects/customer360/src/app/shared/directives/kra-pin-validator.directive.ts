import { Directive, ElementRef, HostListener } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[kraPinInput]',
})
export class KraPinValidatorDirective {
  constructor(private _el: ElementRef) {}

  @HostListener('input', ['$event']) onInputChange(event: any) {
    // console.log(event);
    const initalValue = this._el.nativeElement.value;
    this._el.nativeElement.value = initalValue.replace(
      /\b[A-Z]{1}[0-9]{9}[A-Z]{1}\b/g,
      ''
    );
    if (initalValue !== this._el.nativeElement.value) {
      event.stopPropagation();
    }
  }
}

export function validateKraPin(
  control: AbstractControl
): { [key: string]: any } | null {
  const val = control.value;
  if (!val) return null;
  if (val === null || val === '') {
    return null;
  } else {
    if (!val.toString().match(/\b[A-Z]{1}[0-9]{9}[A-Z]{1}\b/g))
      return { invalidKraPin: true };
  }

  return null; // return null if validation is passed.
}
