import { Component, Input } from '@angular/core';
import { AccountService } from 'src/app/core/services/account/account.service';
import { IKnownAgent } from 'src/app/home/customer/known-agent/models/known-agent.models';
@Component({
  selector: 'app-known-agent-ticket-details',
  templateUrl: './known-agent-ticket-details.component.html',
  styleUrls: ['./known-agent-ticket-details.component.scss'],
})
export class KnownAgentTicketDetailsComponent {
  @Input() knownAgentDetails: any;
  //when try to remove agent the ticket dowst have the agent data
  agentData!: IKnownAgent;

  constructor(private accountService: AccountService) {}

  getAgent(accountNumber: string, agentId: string) {
    this.accountService.getKnownAgents(accountNumber).subscribe(res => {
      const agentDataArray: IKnownAgent[] = res.responseObject;
      this.agentData = <IKnownAgent>(
        agentDataArray.find(agent => agent.custId === agentId)
      );
      if (!this.agentData) {
      }
    });
  }
}
