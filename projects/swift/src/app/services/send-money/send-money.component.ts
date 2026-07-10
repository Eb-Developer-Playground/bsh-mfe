import { Component } from '@angular/core';
import { CdkStep, CdkStepperModule } from '@angular/cdk/stepper';
import { MatCardModule } from '@angular/material/card';
import { TranslatePipe } from '@ngx-translate/core';
import { StepperComponent } from './stepper/stepper.component';
import { AccountDetailsComponent } from './account-details/account-details.component';

@Component({
  selector: 'app-send-money',
  imports: [CdkStepperModule, MatCardModule, TranslatePipe, StepperComponent, AccountDetailsComponent],
  template: `
    <app-stepper #stepper (onQuit)="onQuit($event)" (onSubmit)="onFinish($event)">
      <cdk-step [label]="'STEPPER.ACCOUNT-DETAILS' | translate">
        <app-account-details></app-account-details>
      </cdk-step>
      <cdk-step [label]="'STEPPER.DOCUMENTS-UPLOAD' | translate">
        <div class="p-8 text-center text-gray-400">
          {{ 'STEPPER.DOCUMENTS-UPLOAD' | translate }} — coming soon
        </div>
      </cdk-step>
    </app-stepper>
  `,
})
export class SendMoneyComponent {
  onQuit(event: any): void {}

  onFinish(event: any): void {}
}

