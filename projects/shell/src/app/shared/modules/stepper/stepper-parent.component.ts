import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CdkStepper } from '@angular/cdk/stepper';
import { Subject } from 'rxjs';
import { OnFinish, OnQuit } from './models';

@Component({ template: `` })
export class StepperParentComponent
  implements OnInit, OnDestroy, AfterViewInit, OnQuit, OnFinish
{
  @ViewChild('stepper') stepperComp!: CdkStepper;
  @ViewChildren('components') stepComponents!: QueryList<any>;
  destroy$ = new Subject();

  constructor(
    protected router: Router,
    protected route: ActivatedRoute,
    protected fb: UntypedFormBuilder
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.stepComponents.first?.onActive(); // Activate first component by default
    this.route.queryParams.subscribe(params => {
      const step = params?.step || null;
      if (step) {
        try {
          this.stepperComp.linear = false;
          this.stepperComp.selected = this.stepperComp.steps.find(
            st => st.label === step
          );
          const component = this.stepComponents.find(
            (cmp: any) => cmp.label === step
          );
          component.onActive();
        } catch (e) {}
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next('');
    this.destroy$.complete();
  }

  onActive(lbl: string, isReturn = false): void {
    const component = this.stepComponents.find((cmp: any) => cmp.label === lbl);

    if (component) {
      this.router
        .navigate([], {
          relativeTo: this.route,
          queryParams: { step: lbl },
          queryParamsHandling: 'merge',
        })
        .then(r => {});
      if (!isReturn) {
        try {
          component.onActive();
        } catch (e) {
          console.error(e);
          console.warn(
            `Unable to successfully call onActive callback on Step ${lbl}.`
          );
        }
      } else {
        try {
          component.onBack();
        } catch (e) {
          console.error(e);
          console.warn(
            `Unable to successfully call onBack callback on Step ${lbl}.`
          );
        }
      }
    }
  }

  onSave(lbl: string): void {
    const component = this.stepComponents.find((cmp: any) => cmp.label === lbl);

    if (component)
      try {
        component.onSave();
      } catch (e) {
        console.error(e);
        console.warn(
          `Unable to successfully call onSave callback on Step ${lbl}.`
        );
      }
  }

  onFinish() {
    throw new Error('OnFinish callback not implemented!');
  }

  onQuit() {
    throw new Error('OnQuit callback not implemented!');
  }
}
