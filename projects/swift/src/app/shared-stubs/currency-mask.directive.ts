import { Directive, Input } from '@angular/core';

@Directive({
  selector: '[currencyMask]',
})
export class CurrencyMaskDirective {
  @Input() options: any;
}
