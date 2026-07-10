import { Component, Input } from '@angular/core';
import {
  AbstractControl,
  UntypedFormArray,
  UntypedFormControl,
  UntypedFormGroup,
} from '@angular/forms';
import { StepperComponent } from './stepper.component';

@Component({ template: `` })
export class StepperChildComponent {
  @Input() label!: string;
  @Input() stepperComponent!: StepperComponent;
  @Input() stepControl!:
    | AbstractControl
    | UntypedFormControl
    | UntypedFormGroup
    | UntypedFormArray;

  gotoNext(): void {
    this.stepperComponent.nextStep();
  }
}
