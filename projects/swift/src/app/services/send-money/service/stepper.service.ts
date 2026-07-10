import { Input } from '@angular/core';
import { AbstractControl, FormControl, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { IStepEvent, IStepFlags } from '../models/step.model';
import { Service } from '@angular/core';

@Service()
export class StepperService {
  @Input() accountDetailsControl: AbstractControl = new FormControl(true, [Validators.required]);
  @Input() documentsControl: AbstractControl = new FormControl(true, [Validators.required]);
  private stepperEvent = new BehaviorSubject<IStepEvent>({
    event: undefined,
    step: undefined,
  });
  stepperEvent$ = this.stepperEvent.asObservable();
  private stepperFlagSubject = new BehaviorSubject<IStepFlags>(IStepFlags.NOOP);
  stepperFlagsSubject$ = this.stepperFlagSubject.asObservable();

  setStepStatus(stepStatus: IStepFlags) {
    this.stepperFlagSubject.next(stepStatus);
  }

  setStepperEvent(ev: IStepEvent) {
    this.stepperEvent.next(ev);
  }
}
