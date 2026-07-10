import { CdkStep } from '@angular/cdk/stepper';

export enum IStepFlags {
  SKIP_BIOMETRICS,
  BIOMETRICS_COMPLETE,
  SKIP_BIOMETRICS_COMPLETE,
  BIOMETRICS_COMPLETE_CANCEL,
  NEXT,
  NOOP,
}

export enum StepperEventName {
  SAVE,
  QUIT,
}

export interface IStepEvent {
  event?: StepperEventName;
  step?: CdkStep;
}
