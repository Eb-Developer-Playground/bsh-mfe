import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { TranslatePipe } from '@ngx-translate/core';
import { IAccMgntObj } from '@app/shared/models/common';
import { IknownAgentDetails } from '@app/shared/models/common/knownAgent.model';
import { AccountSelectionService } from '@app/core/services/account-selection/account-selection.service';

@Component({
  selector: 'app-success',
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.scss'],
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    RouterLink,
    TranslatePipe,
  ],
})
export class SuccessComponent implements OnInit {
  public knownAgentDetails!: IknownAgentDetails;
  public accMgntObj!: IAccMgntObj;
  public message = 'KNOWN-AGENT.INTRODUCED-SUCCESS';
  
  constructor(
    private router: Router,
    private accountSelectionService: AccountSelectionService
  ) {}

  ngOnInit(): void {
    this.message =
      this.router.url === '/services/known-agent/successful/remove'
        ? 'KNOWN-AGENT.REMOVED-SUCCESS'
        : this.message;

    const selectedAccount = this.accountSelectionService.getSelectedAccountWithFallbacks();
    
    const accMgntObj = localStorage.getItem('accMgntObj');
    if (accMgntObj) {
      this.accMgntObj = <IAccMgntObj>JSON.parse(accMgntObj);
    }
    
    if (selectedAccount) {
      this.accMgntObj = {
        ...this.accMgntObj,
        accountsId: selectedAccount.accountNumber,
        cif: selectedAccount.cif,
        accountType: selectedAccount.accountType || this.accMgntObj?.accountType,
        bankID: selectedAccount.bankId || this.accMgntObj?.bankID || '43'
      } as IAccMgntObj;
    }

    const knownAgentDetails = localStorage.getItem('knownAgentDetails');
    if (knownAgentDetails) {
      this.knownAgentDetails = <IknownAgentDetails>(
        JSON.parse(knownAgentDetails)
      );
      if (this.knownAgentDetails.action === 'amend') {
        this.message = 'KNOWN-AGENT.AMEND-SUCCESS';
      }
    }
  }
}
