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

  @HostListener('input', ['$event'])
  onInput(event: Event) {
    const originalValue = (event.target as HTMLInputElement).value;
    const processedValue = parseFloat(originalValue.replace(/[^0-9]\.[^0-9]/g, '')).toFixed(2);
    if (processedValue == 'NaN') {
      this.el.control?.patchValue(this.default);
      return;
    }
    this.el.control?.patchValue(processedValue);
  }
}
