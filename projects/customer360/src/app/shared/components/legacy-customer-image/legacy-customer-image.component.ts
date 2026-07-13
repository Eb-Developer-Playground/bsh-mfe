import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-legacy-customer-image',
  template: '<ng-content></ng-content>',
  imports: [CommonModule],
})
export class LegacyCustomerImageComponent {
  @Input() acc: any;
  @Input() cif: any;
}
