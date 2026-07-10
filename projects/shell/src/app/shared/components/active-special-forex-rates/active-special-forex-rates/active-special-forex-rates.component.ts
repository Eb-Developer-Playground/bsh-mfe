import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-active-special-forex-rates',
  templateUrl: './active-special-forex-rates.component.html',
  styleUrls: ['./active-special-forex-rates.component.scss'],
})
export class ActiveSpecialForexRatesComponent {
  @Input() activeRates: any[] = [];
  @Input() showHeading?: boolean = false;
}
