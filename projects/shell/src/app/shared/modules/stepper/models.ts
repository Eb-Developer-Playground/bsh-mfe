import { CdkStep } from '@angular/cdk/stepper';

export declare interface OnActive {
  onActive(): void;
}

export declare interface OnBack {
  onBack(): void;
}

export declare interface OnFinish {
  onFinish(): void;
}

export declare interface OnQuit {
  onQuit(): void;
}

export declare interface OnSave {
  onSave(): void;
}

export declare interface OnSubmit {
  onSubmit(): void;
}

export declare interface SubmitDisabled {
  submitDisabled(): boolean;
  submitDisabled(): boolean;
}

export declare interface OnActive {
  onActive(): void;
}

export declare interface OnBack {
  onBack(): void;
}

export declare interface OnFinish {
  onFinish(): void;
}

export declare interface OnQuit {
  onQuit(): void;
}

export declare interface OnSave {
  onSave(): void;
}

export declare interface OnSubmit {
  onSubmit(): void;
}

export declare interface SubmitDisabled {
  submitDisabled(): boolean;
}

export enum IStepFlags {
  SKIP_BIOMETRICS,
  BIOMETRICS_COMPLETE,
  SKIP_BIOMETRICS_COMPLETE,
  BIOMETRICS_COMPLETE_CANCEL,
  NON_TRANSACTING_TRUE,
  NON_TRANSACTING_FALSE,
  HIGH_RISK,
  NEXT,
  NOOP,
}

export enum StepperEventName {
  ACTIVE,
  SAVE,
  QUIT,
}

export interface IStepEvent {
  event?: StepperEventName;
  step?: CdkStep;
}
