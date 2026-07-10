import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CdkStepper, CdkStepperModule } from '@angular/cdk/stepper';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-stepper',
  templateUrl: './stepper.component.html',
  styleUrl: './stepper.component.scss',
  providers: [{ provide: CdkStepper, useExisting: StepperComponent }],
  imports: [CdkStepperModule, MatCardModule, MatButtonModule, CommonModule, TranslatePipe],
})
export class StepperComponent extends CdkStepper implements OnInit {
  @Output() onSubmit: EventEmitter<any> = new EventEmitter();
  @Output() onQuit: EventEmitter<any> = new EventEmitter();
  @Output() showDialog = new EventEmitter();

  selectStepByIndex(index: number): void {
    this.selectedIndex = index;
  }

  ngOnInit(): void {}
}
