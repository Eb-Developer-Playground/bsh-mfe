import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { CdkStepper, CdkStepperModule } from '@angular/cdk/stepper';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-stepper',
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.scss'],
  providers: [{ provide: CdkStepper, useExisting: StepperComponent }],
  imports: [
    CommonModule,
    TranslatePipe,
    CdkStepperModule,
    MatCardModule,
    MatButtonModule,
  ],
})
export class StepperComponent
  extends CdkStepper
  implements OnInit, AfterViewInit
{
  @Input() stepperLabel!: string;
  @Input() hideNavControls!: boolean;
  @Input() isProcessing?: boolean = false;
  @Input() showBackButton = false;
  @Input() submitButtonDisabled = false;
  @Input() disableHeaderNavigation = false;
  @Input() lastStepButtonOveride: string = '';
  @Output() onActive: EventEmitter<string> = new EventEmitter<string>();
  @Output() onBack: EventEmitter<any> = new EventEmitter<string>();
  @Output() onSave: EventEmitter<any> = new EventEmitter<string>();
  @Output() onFinish: EventEmitter<any> = new EventEmitter<string>();
  @Output() onQuit: EventEmitter<any> = new EventEmitter<string>();
  @Output() emitEvent: EventEmitter<any> = new EventEmitter<string>();

  selectStepByIndex(index: number): void {
    if (this.disableHeaderNavigation) return;
    if (this.selected?.hasError) return;
    this.selectedIndex = index;
    this.onActive.emit(this.selected?.label);
  }

  ngOnInit(): void {}

  previousStep() {
    this.previous();
    this.onBack.emit(this.selected?.label);
  }

  nextStep() {
    if (this.selectedIndex === this.steps.length - 1) {
      this.onFinish.emit();
    } else {
      this.next();
      this.onActive.emit(this.selected?.label);
    }
  }

  get submitDisabled(): boolean {
    return (
      this.isProcessing ||
      this.submitButtonDisabled ||
      !!this.selected?.stepControl?.invalid
    );
  }
}
