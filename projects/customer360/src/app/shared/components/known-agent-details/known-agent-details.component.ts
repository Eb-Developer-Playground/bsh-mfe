import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafeUrl } from '@angular/platform-browser';
import { IknownAgentDetails } from '@app/shared/models/common/knownAgent.model';

@Component({
  selector: 'app-known-agent-details',
  template: '<ng-content></ng-content>',
  imports: [CommonModule],
})
export class KnownAgentDetailsComponent {
  @Input() editKraPin = false;
  @Input() editAgentNames = false;
  @Input() knownAgentDetails!: IknownAgentDetails;
  @Input() agentDetails: any = {};
  @Input() photoUrl?: SafeUrl;
  @Input() signatureUrl?: SafeUrl;
  @Output() isDetailsFormValid = new EventEmitter<any>();
}
