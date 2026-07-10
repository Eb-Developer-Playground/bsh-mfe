import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { COMPAT_IMPORTS } from '../../../compat-barrel';
import { AccountService } from '@app/core/services/account/account.service';
import { IAccMgntObj } from '@app/shared/models/common';
import { IknownAgentDetails } from '@app/shared/models/common/knownAgent.model';
import { IKnownAgent } from 'src/app/home/customer/known-agent/models/known-agent.models';
import { AccountSelectionService } from 'src/app/core/services/account-selection/account-selection.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-known-agent-success',
  templateUrl: './known-agent-success.component.html',
  styleUrls: ['./known-agent-success.component.scss'],
  imports: [COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
export class KnownAgentSuccessComponent implements OnInit {
  successData: any;
  public accMgntObj!: IAccMgntObj;
  knownAgentDetails!: IknownAgentDetails;
  agentData!: IKnownAgent;
  accountType: string = '';
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private accountService: AccountService,
    private accountSelectionService: AccountSelectionService
  ) {}

  ngOnInit(): void {
    const successData = <string>localStorage.getItem('successData');
    this.successData = JSON.parse(successData);

    const selectedAccount =
      this.accountSelectionService['getSelectedAccountWithFallbacks']();

    let accountToFetch: string | null = null;

    if (this.successData?.agentData?.acctNum) {
      accountToFetch = this.successData.agentData.acctNum;
    } else if (selectedAccount?.accountNumber) {
      accountToFetch = selectedAccount.accountNumber;
    }

    if (accountToFetch) {
      this.fetchAccountType(accountToFetch);
    }

    const accMgntObj = localStorage.getItem('accMgntObj');
    if (accMgntObj) {
      this.accMgntObj = <IAccMgntObj>JSON.parse(accMgntObj);
    } else if (selectedAccount) {
      this.accMgntObj = {
        accountsId: selectedAccount.accountNumber,
        cif: selectedAccount.cif,
        accountType: selectedAccount.accountType,
        bankID: selectedAccount.bankId || '43',
        isPresent: true,
      } as IAccMgntObj;
    }
  }

  fetchAccountType(accountNumber: string): void {
    this.isLoading = true;

    const bankId = this.accMgntObj?.bankID || '43';

    const queryString = `?Id=${accountNumber}&bankId=${bankId}&idType=accountno`;

    this.accountService
      ['getAccount'](queryString)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (response: any) => {
          if (response.successful && response.responseObject) {
            const accountData = response.responseObject;

            if (accountData.accounts && accountData.accounts.length > 0) {
              const account = accountData.accounts.find(
                (acc: any) => acc.accountNumber === accountNumber
              );

              if (account) {
                this.accountType = account.schemeType || account.accountType;
                if (this.accMgntObj) {
                  this.accMgntObj.accountType = this.accountType;
                  localStorage.setItem(
                    'accMgntObj',
                    JSON.stringify(this.accMgntObj)
                  );
                }
              }
            }
          }
        },
        error: (error: any) => {
          console.error('Error fetching account details:', error);
        },
      });
  }

  onClick() {
    localStorage.removeItem('successData');
    this.router.navigate(['/dashboard']);
  }
}
