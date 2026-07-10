import { Component } from '@angular/core';
import { Subject } from 'rxjs';
import { SessionService } from '@app/shared/services';
import { Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-paypal-account-details',
  templateUrl: './paypal-account-details.component.html',
  styleUrls: ['./paypal-account-details.component.scss'],
  imports: [
    MatToolbarModule,
    MatCardModule,
    MatDividerModule,
    MatButtonModule,
    RouterModule,
    TranslatePipe,
  ],
})
export class PaypalAccountDetailsComponent {
  constructor(
    public session: SessionService,
    private router: Router
  ) {}
  destroy$: Subject<any> = new Subject<any>();
  account = JSON.parse(<string>localStorage.getItem('delinkedPayPalAccount'));
  linkedCustomerDetails = JSON.parse(
    <string>localStorage.getItem('linkedCustomerDetails')
  );
  accounts = JSON.parse(<string>localStorage.getItem('accounts'));
  activeChannel: any = JSON.parse(
    <string>localStorage.getItem('activeChannel')
  );
  permanent: string = 'permanent';
  provisional: string = 'provisional';
  delinkAccount() {
    localStorage.setItem('delinkedPayPalAccount', JSON.stringify(this.account));
    this.router.navigate([
      '/services/customer-360/channels/delink-paypal-account',
    ]);
  }
  quit() {
    this.router.navigateByUrl('/services/customer-360/channels');
  }
  submit() {}
}
