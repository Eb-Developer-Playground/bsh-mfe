import { Component, OnDestroy } from '@angular/core';
import { OnSave, StepperChildComponent } from '@shared/modules/stepper';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-stepper-container',
  templateUrl: './stepper-container.component.html',
  styleUrl: './stepper-container.component.scss',
})
export class StepperContainerComponent
  extends StepperChildComponent
  implements OnDestroy
{
  destroy$: Subject<any> = new Subject<any>();
  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
  onActive(): void {}
  onSave() {
    this.gotoNext();
  }
}
