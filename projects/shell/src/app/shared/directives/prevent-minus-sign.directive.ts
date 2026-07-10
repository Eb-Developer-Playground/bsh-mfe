import { Directive, HostListener, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Directive({
  selector: '[appPreventMinusSign]',
  standalone: true,
})

export class PreventMinusSignDirective {
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    // Prevent minus sign
    if (event.key === '-') {
      event.preventDefault();
    }
  }
}
