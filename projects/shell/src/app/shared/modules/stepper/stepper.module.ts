import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { StepperComponent } from './stepper.component';
import { StepperChildComponent } from './stepper-child.component';
import { StepperParentComponent } from './stepper-parent.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
@NgModule({

  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    CdkStepperModule,
    StepperComponent,
    StepperChildComponent,
    StepperParentComponent,
  ],
  exports: [StepperComponent, StepperChildComponent, StepperParentComponent],
schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class StepperModule {}
