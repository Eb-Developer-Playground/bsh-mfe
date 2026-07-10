import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-customer-dedupe-and-identification-details',
  template: '<ng-content></ng-content>',
  imports: [CommonModule],
})
export class CustomerDedupeAndIdentificationDetailsComponent {
  @Input() parentForm!: FormGroup;
  @Input() parentFormControlName!: string;
  @Input() doNotRedirectToLandingOnCancel?: boolean;
  @Input() sharedRequestId?: string;
  @Input() redirectExistingToStaticData?: boolean;
  @Output() onDedupeChecked = new EventEmitter<any>();
  @Output() onIPRSChecked = new EventEmitter<any>();
  @Output() onKRAChecked = new EventEmitter<any>();
  @Output() onIPRSCheckFailed = new EventEmitter<void>();
  @Output() onDedupeFormIsValid = new EventEmitter<boolean>();
}
