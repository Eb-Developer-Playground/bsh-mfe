import { Component, OnInit } from '@angular/core';
import { map, takeUntil } from 'rxjs/operators';
import { AccountService } from '@app/core/services/account/account.service';

import { Subject } from 'rxjs';
import { IKnownAgent } from '../models/known-agent.models';
import { CurrentFlowsOptions } from '@app/shared/models/common/accMgntObj.model';
import { SessionService } from '@app/shared/services';
import { ISubsidiary } from '@app/shared/services/session/session.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MessageBoxType, ToastService } from '@app/shared/modules/toast';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { KnownAgentListComponent } from '../known-agent-list/known-agent-list.component';

@Component({
  selector: 'app-known-agent-overview',
  templateUrl: './known-agent-overview.component.html',
  styleUrls: ['./known-agent-overview.component.scss'],
  imports: [
    CommonModule,
    RouterLink,
    TranslatePipe,
    MatToolbarModule,
    MatButtonModule,
    MatExpansionModule,
    MatIconModule,
    KnownAgentListComponent,
  ],
})
export class KnownAgentOverviewComponent implements OnInit {

  agents!: IKnownAgent[];
  previousAgents!: IKnownAgent[];
  subsidiary: ISubsidiary;

  recentlyRestoredAgentId: string | null = null

  hideWhenAmendFunctions = false;

  private destroy$ = new Subject();

  constructor(
    private accountService: AccountService, 
    private session: SessionService, 
    private route: ActivatedRoute,
    private toastService: ToastService,
    private translateService: TranslateService
  ) { 
    this.subsidiary = this.session.subsidiary;
  }

  hideAddButton = false;
  hideRemoveButton = false;

  ngOnInit(): void {
    const customer: any = JSON.parse(<string>localStorage.getItem('accMgntObj'));
    this.hideWhenAmendFunctions = customer.currentFlow === CurrentFlowsOptions.CUSTOMERNOTPRESENT;
    if (customer.currentFlow === CurrentFlowsOptions.CUSTOMERNOTPRESENT) {
      if (customer.action === 'RemoveKnownAgent') {
        this.hideAddButton = true;
        this.hideRemoveButton = false;
      } else if (customer.action === 'AddKnownAgent') {
        this.hideAddButton = false;
        this.hideRemoveButton = true;
      }
    }

    this.route.queryParams.subscribe(params => {
      if (params['restored'] === 'true' && params['agentId']) {
        this.recentlyRestoredAgentId = params['agentId'];
        localStorage.removeItem('restoreAgentData');  
        this.toastService.show(
          this.translateService.instant('TOAST.TITLE'),
          this.translateService.instant('KNOWN-AGENT.AGENT-RESTORED-SUCCESS'),
          MessageBoxType.SUCCESS,
          5000, undefined, undefined, false
        );
      }
    });

    this.getAgents(customer.accountsId);
  }

  private getAgents(accountNumber: string) {
    this.accountService.getKnownAgents(accountNumber)
      .pipe(takeUntil(this.destroy$),
        map((agents) => {
          return {
            ...agents,
            data: agents.responseObject.map(agent => {
              let accountType = 'Individual'; 
              if (agent.acctType === 'J' || agent.accountType === 'Joint') {
                accountType = 'Joint';
              } else if (agent.acctType === 'C' || agent.accountType === 'Corporate' || 
                         agent.accountType === 'Company' || agent.accountType === 'Entity') {
                accountType = 'Entity';
              }
              
              return {
                ...agent,
                avatarName: `${agent.agentName?.split(' ')[0]?.charAt(0)} ${agent.agentName?.split(' ')[1]?.charAt(0)}`,
                accountType: accountType
              }
            })
          }
        }))
      .subscribe((agents: { data: IKnownAgent[] }) => {
        const agentMap = new Map<string, IKnownAgent>();
        agents.data.forEach(agent => {
          agentMap.set(agent.custId, agent);
        });
        agents.data.forEach(agent => {
          if (agent.deleted !== "Y") {
            agentMap.set(agent.custId, agent);
          }
        });
        
        if (this.recentlyRestoredAgentId) {
          const restoredAgent = agents.data.find(a => a.custId === this.recentlyRestoredAgentId);
          if (restoredAgent) {
            restoredAgent.deleted = "N";
            agentMap.set(restoredAgent.custId, restoredAgent);
          }
        }
        
        const allAgents = Array.from(agentMap.values());
        
        this.agents = allAgents
          .filter(agent => agent.deleted !== "Y")
          .map(agent => {
            let funstionArray = agent.functions;
            let agentLimit: string | undefined;

            if (agent.isBshFunction) {
              agentLimit = this.session.subsidiary.countryCode === 'CD'
                ? funstionArray?.find((_f: { name: string, limit: string }) => 
                    _f.name === "encashmentOfChequesToDefinedLimit")?.limit
                : funstionArray?.find((_f: { name: string, limit: string }) => 
                    _f.name === "collectCashFromCompanyCheques")?.limit;
            }

            return {
              ...agent,
              agentLimit: agentLimit,
              functions: funstionArray
            };
          });

        this.previousAgents = allAgents
          .filter(agent => {
            if (this.recentlyRestoredAgentId && agent.custId === this.recentlyRestoredAgentId) {
              return false;
            }
            return agent.deleted === "Y";
          });

      }, err => {
        this.agents = [];
        console.log(err);
        const _err = err.error ? err.error : 'error';
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next('');
    this.destroy$.complete();
  }
}
