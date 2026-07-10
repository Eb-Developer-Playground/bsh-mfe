import { Component, CUSTOM_ELEMENTS_SCHEMA, Input } from '@angular/core';
import { COMPAT_IMPORTS } from '../../../compat-barrel';

@Component({
  selector: 'app-active-special-forex-rates',
  imports: [COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './active-special-forex-rates.component.html',
  styleUrls: ['./active-special-forex-rates.component.scss'],
})
export class ActiveSpecialForexRatesComponent {
  @Input() activeRates: any[] = [];
  @Input() showHeading?: boolean = false;
}
