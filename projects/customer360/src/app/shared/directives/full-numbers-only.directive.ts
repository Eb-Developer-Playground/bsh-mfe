import { Directive, HostListener } from '@angular/core';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[fullNumbersOnly]',
})
export class FullNumbersOnlyDirective {
  constructor() {}

  @HostListener('keypress', ['$event']) onInputChange(event: {
    stopPropagation: () => void;
    key: string;
  }) {
    return /[0-9]/.test(event.key);
  }
}
