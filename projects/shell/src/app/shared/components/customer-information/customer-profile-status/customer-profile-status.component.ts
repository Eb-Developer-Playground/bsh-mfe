import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-customer-profile-status',
  templateUrl: './customer-profile-status.component.html',
  styleUrls: ['./customer-profile-status.component.scss'],
})
export class CustomerProfileStatusComponent {
  @Input() customerStatus: any;
}
