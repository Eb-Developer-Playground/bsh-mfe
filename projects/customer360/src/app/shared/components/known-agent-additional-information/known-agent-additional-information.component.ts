import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactDetails } from '@app/shared/models/common/cifinquiry.model';

@Component({
  selector: 'app-known-agent-additional-information',
  template: '<ng-content></ng-content>',
  imports: [CommonModule],
})
export class KnownAgentAdditionalInformationComponent {
  @Input() contactDetails!: ContactDetails;
  @Output() isInformationFormValid = new EventEmitter<any>();
}
