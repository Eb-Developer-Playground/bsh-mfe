import { Directive, ElementRef, HostListener, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Directive({
  selector: '[appNumbersOnlyInput]',
})

export class NumbersOnlyInputDirective {
  constructor(private el: ElementRef) {}

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    // Allow: backspace, tab, enter, and other special keys
    if (
      event.key === 'Backspace' ||
      event.key === 'Tab' ||
      event.key === 'Enter' ||
      event.key === 'Escape' ||
      (event.key >= '0' && event.key <= '9')
    ) {
      return;
    }

    // Prevent default behavior for other keys
    event.preventDefault();
  }
}
