import { Component, Input, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { COMPAT_IMPORTS } from '../../../compat-barrel';

@Component({
  selector: 'app-customer-profile-status',
  templateUrl: './customer-profile-status.component.html',
  styleUrls: ['./customer-profile-status.component.scss'],
  imports: [COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
export class CustomerProfileStatusComponent {
  @Input() customerStatus: any;
}
