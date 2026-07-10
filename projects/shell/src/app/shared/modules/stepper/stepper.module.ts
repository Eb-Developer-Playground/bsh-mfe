import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { StepperComponent } from './stepper.component';
import { StepperChildComponent } from './stepper-child.component';
import { StepperParentComponent } from './stepper-parent.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    StepperComponent,
    StepperChildComponent,
    StepperParentComponent,
  ],
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    CdkStepperModule,
    TranslateModule,
  ],
  exports: [StepperComponent, StepperChildComponent, StepperParentComponent],
})
export class StepperModule {}
