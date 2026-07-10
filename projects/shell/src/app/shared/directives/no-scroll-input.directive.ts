import { Directive, HostListener, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Directive({
  selector: '[appNoScrollInput]',
})

export class NoScrollInputDirective {
  @HostListener('wheel', ['$event'])
  onWheel(event: WheelEvent): void {
    event.preventDefault();
  }
}
