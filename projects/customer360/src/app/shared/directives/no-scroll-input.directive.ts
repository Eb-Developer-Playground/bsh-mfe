import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appNoScrollInput]',
})
export class NoScrollInputDirective {
  @HostListener('wheel', ['$event'])
  onWheel(event: WheelEvent): void {
    event.preventDefault();
  }
}
