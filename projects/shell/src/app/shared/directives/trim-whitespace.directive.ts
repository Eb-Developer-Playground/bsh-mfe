import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appTrimWhitespace]',
})
export class TrimWhitespaceDirective {
  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event']) onInput(event: any) {
    const value = event.target.value;
    const trimmedValue = value.trim();
    if (value !== trimmedValue) {
      event.target.value = trimmedValue;
    }
  }
}
