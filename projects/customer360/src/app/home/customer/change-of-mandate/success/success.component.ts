import { Component, OnDestroy, OnInit } from '@angular/core';
import { ContextManager } from '@app/shared/modules/stepper';
import { Account } from '../../funds-transfer/funds-transfer.model';
import { ApiService, SessionService } from '@app/shared/services';
import { Router } from '@angular/router';
import { ChangeMandateService } from '@app/core/services/change-mandate/change-mandate.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-success',
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.scss'],
  imports: [
    MatCardModule,
    MatButtonModule,
    TranslatePipe,
  ],
})
export class SuccessComponent implements OnInit, OnDestroy {
  public selectedAccount!: Account;
  customer: any;
  isPresent!: boolean;

  useChangeMandateFlowV2!: boolean;

  constructor(
    private api: ApiService,
    private router: Router,
    private session: SessionService,
    private ctxManager: ContextManager,
    private changeMandateService: ChangeMandateService
  ) {
    this.useChangeMandateFlowV2 = this.changeMandateService.useChangeMandateFlowV2(this.session.subsidiary.countryCode);
  }

  ngOnInit(): void {
    this.ctxManager.context = 'mandate';
    const customer: any = localStorage.getItem('accMgntObj');
    this.customer = JSON.parse(customer) || {};

    this.isPresent = this.customer.isPresent;
    this.getSelectedAccount();
  }

  ngOnDestroy(): void {
    this.resetState();
  }

  onSubmit() {
    this.resetState();
    this.router.navigate(['/services/customer-360']).then(() => {});
  }

  private getSelectedAccount() {
    const customerDetails = JSON.parse(
      <string>localStorage.getItem('customerDetails')
    );
    const customerAccounts = JSON.parse(
      <string>localStorage.getItem('accounts')
    );
    const selectedAccountNumber = JSON.parse(
      <string>localStorage.getItem('selectedAccount')
    );
    const selectedAccountData = JSON.parse(
      <string>localStorage.getItem('selectedAccountData')
    );
    const relatedAccounts = JSON.parse(
      <string>localStorage.getItem('relatedAccounts')
    );
    const combinedAccounts = [...customerAccounts, ...relatedAccounts];

    if (this.useChangeMandateFlowV2) {
      this.selectedAccount = selectedAccountData;
    } else {
      this.selectedAccount = combinedAccounts.find(
        account => account.accountNumber === selectedAccountNumber.accountNumber
      );
    }
  }

  resetState() {
    localStorage.removeItem('ticketId');
    localStorage.removeItem('selectedAccount');
    localStorage.removeItem('selectedAccountData');
    localStorage.removeItem('selectedAccountNumber');
    localStorage.removeItem('uploadedDocuments');
    localStorage.removeItem('effectiveDate');
    localStorage.removeItem('runningActionFlow');
    localStorage.removeItem('runningTaskId');
    localStorage.removeItem('selectedAccountNumber');
    localStorage.removeItem('selectedSignatory');
    this.ctxManager.patchContextData({ mandate: null });
  }
}
