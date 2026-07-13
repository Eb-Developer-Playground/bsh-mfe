import { Component, OnInit, Input, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IKnownAgent } from '../models/known-agent.models';
import { KnownAgentService } from '../services/known.agent.service';
import { CurrentFlowsOptions } from '@app/shared/models/common/accMgntObj.model';
import { ISubsidiary, SessionService } from '@app/shared/services/session/session.service';
import { AccountManagementService } from '@app/core/services/account-management/account-management.service';
import { AccountService } from '@app/core/services/account/account.service';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { PillsComponent } from '@app/shared/components/pills/pills.component';

@Component({
  selector: 'app-known-agent-list',
  templateUrl: './known-agent-list.component.html',
  styleUrls: ['./known-agent-list.component.scss'],
  imports: [
    CommonModule,
    RouterLink,
    TranslatePipe,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    MatDividerModule,
    PillsComponent,
  ],
})
export class KnownAgentListComponent implements OnInit, OnDestroy {
  @Input() agents!: IKnownAgent[];
  @Input() showMenu = true;
  @Input() active = true;
  @Input() hideRemoveOption = false;

  hideWhenAmendFunctions = false;
  public countryCode = "";
  private destroy$ = new Subject<void>();
  subsidiary: ISubsidiary;
  accountTypes: {[key: string]: string} = {};
  defaultAccountType = 'Individual';

  constructor(
    private router: Router,
    private knownAgentService: KnownAgentService,
    private sessionService: SessionService,
    private accountManagementService: AccountManagementService,
    private accountService: AccountService,
    private session: SessionService,
    private cdr: ChangeDetectorRef) { 
      this.subsidiary = this.session.subsidiary;
    }

    ngOnInit(): void {
      this.countryCode = this.sessionService.subsidiary.countryCode;
      const customer: any = JSON.parse(
        <string>localStorage.getItem('accMgntObj')
      );
      this.hideWhenAmendFunctions =
      customer.currentFlow === CurrentFlowsOptions.CUSTOMERNOTPRESENT;
      
      this.loadAccountTypes();
      this.processAgentDates();
    }
    
  private processAgentDates(): void {
    if (this.agents && this.agents.length > 0) {
      this.agents.forEach(agent => {
        if (!this.active && !agent.endDate) {
        }
      });
    }
  }

  ngOnChanges() {
    this.loadAccountTypes();
    this.processAgentDates();
  }
  

  private loadAccountTypes() {
    if (!this.agents || this.agents.length === 0) return;
    
    this.agents.forEach(agent => {
      if (!agent.acctNum) return;
      if (this.accountTypes[agent.acctNum]) return;
      this.accountTypes[agent.acctNum] = this.defaultAccountType;
      const queryParams = `?Id=${agent.acctNum}&bankId=${this.sessionService.userBank}&idType=accountid`;
      
      this.accountService.getAccount(queryParams, true)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => this.cdr.detectChanges())
        )
        .subscribe({
          next: (response) => {
            
            if (response && response.responseObject) {
              const account = response.responseObject.accounts?.[0];
              if (!account) return;
              
              let accountType = this.defaultAccountType;
              if (account.accountName && account.accountName.includes(' AND ')) {
                accountType = 'Joint';
              }
              else if (account.mandate === 'ALL' || account.mandate === 'ANY') {
                accountType = 'Joint';
              }
              else if (response.responseObject.retCorpFlg === 'Corporate') {
                accountType = 'Entity';
              }
              this.accountTypes[agent.acctNum] = accountType;
              this.cdr.detectChanges(); 
            }
          },
          error: (err) => {
          }
        });
    });
  }

  getAccountType(agent: IKnownAgent): string {
    if (!agent || !agent.acctNum) return this.defaultAccountType;
    
    const type = this.accountTypes[agent.acctNum] || this.defaultAccountType;
    return type;
  }
 
  restoreAgent(agent: IKnownAgent) {
    const restoreData = {
      ...agent,
      deleted: "N" 
    };
    
    localStorage.setItem('restoreAgentData', JSON.stringify(restoreData));
    this.router.navigate(['/services/known-agent/add-agent'], {
      queryParams: { 
        restore: 'true',
        cifId: agent.custId
      }
    });
  }
  
  
  
  showAgentDetails(agent: IKnownAgent) {
    this.knownAgentService.setAgent(agent);
    this.router.navigate([
      `/services/known-agent/view-agent-detail/${+agent.custId}`,
    ]);
  }

  showAmendFunctions(agent: IKnownAgent) {
    this.knownAgentService.setAgent(agent);
    this.router.navigate([
      `/services/known-agent/view-agent-detail/${+agent.custId}/amend`,
    ]);
  }

  getCashLimit(agent: IKnownAgent): string {
    if (this.active) {
      if (!agent?.functions) return '-';
  
      const functionName = this.session.subsidiary.countryCode === 'CD'
        ? 'encashmentOfChequesToDefinedLimit'
        : 'collectCashFromCompanyCheques';
  
      const cashFunction = agent.functions.find(f => f.name === functionName);
      return cashFunction?.limit || '-';
    } 
    else {
      return agent.agentLimit || 'Not Available';
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
