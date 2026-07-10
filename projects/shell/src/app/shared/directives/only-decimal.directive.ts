import { Directive, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: 'input[appOnlyDecimal]',
})
export class OnlyDecimalDirective {
  default = '0.00';
  private el: NgControl;

  constructor(ngControl: NgControl) {
    this.el = ngControl;
  }

  @HostListener('input', ['$event.target.value'])
  onInput(value: string) {
    value = parseFloat(value.replace(/[^0-9]\.[^0-9]/g, '')).toFixed(2);
    if (value == 'NaN') {
      this.el.control?.patchValue(this.default);
      return;
    }
    this.el.control?.patchValue(value);
  }
}
