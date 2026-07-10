import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[toUpperCase]',
})
export class ToUpperCaseDirective {
  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event']) onInputChange(event: any) {
    const start = event.target.selectionStart;
    const end = event.target.selectionEnd;
    const value = event.target.value.toUpperCase();
    event.target.value = value;
    event.target.setSelectionRange(start, end);
  }
}
