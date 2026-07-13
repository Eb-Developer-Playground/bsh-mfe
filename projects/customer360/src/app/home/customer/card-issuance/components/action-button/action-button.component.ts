import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { LoadingSectionComponent } from '@app/home/customer/card-issuance/components/loading-section/loading-section.component';

@Component({
  selector: 'app-action-button',
  imports: [
    MatIcon,
    MatButton,
    MatProgressSpinner,
    LoadingSectionComponent,
  ],
  templateUrl: './action-button.component.html',
  styleUrls: [
    '../../card-issuance.component.scss',
    './action-button.component.scss',
  ],
})
export class ActionButtonComponent {
  @Input() buttonText: string = 'Action';
  @Input() disabled: boolean = false;
  @Input() isLoading: boolean = false;
  @Input() status: 'loading' | 'success' | 'normal' = 'normal';
  @Input() type: 'button' | 'submit' = 'button';
  @Output() triggerAction = new EventEmitter();
}
