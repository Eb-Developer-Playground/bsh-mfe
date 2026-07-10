import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'input[lettersOnly]',
})
export class LettersDirective {
  constructor(private _el: ElementRef) {}

  @HostListener('input', ['$event']) onInputChange(event: {
    stopPropagation: () => void;
  }) {
    // console.log(event);
    const initialValue = this._el.nativeElement.value;
    this._el.nativeElement.value = initialValue.replace(/[^A-Za-z\s]*/g, '');
    if (initialValue !== this._el.nativeElement.value) {
      event.stopPropagation();
    }
  }
}
