import { Component, Input, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { COMPAT_IMPORTS } from '../../../compat-barrel';
import { AccountService } from 'src/app/core/services/account/account.service';
import { IKnownAgent } from 'src/app/home/customer/known-agent/models/known-agent.models';
@Component({
  selector: 'app-known-agent-ticket-details',
  templateUrl: './known-agent-ticket-details.component.html',
  styleUrls: ['./known-agent-ticket-details.component.scss'],
  imports: [COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
export class KnownAgentTicketDetailsComponent {
  @Input() knownAgentDetails: any;
  //when try to remove agent the ticket dowst have the agent data
  agentData!: IKnownAgent;

  constructor(private accountService: AccountService) {}

  getAgent(accountNumber: string, agentId: string) {
    this.accountService['getKnownAgents'](accountNumber).subscribe((res: any) => {
      const agentDataArray: IKnownAgent[] = res.responseObject;
      this.agentData = <IKnownAgent>(
        agentDataArray.find(agent => agent.custId === agentId)
      );
      if (!this.agentData) {
      }
    });
  }
}
