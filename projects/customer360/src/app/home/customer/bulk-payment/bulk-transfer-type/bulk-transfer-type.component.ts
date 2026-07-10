import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';
import {
  ContextManager,
  OnActive,
  OnSave,
  StepperChildComponent,
} from '@app/shared/modules/stepper';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { MatCardModule } from '@angular/material/card';
import { MatRadioModule } from '@angular/material/radio';

@Component({
  selector: 'app-bulk-transfer-type',
  templateUrl: './bulk-transfer-type.component.html',
  styleUrls: ['./bulk-transfer-type.component.scss'],
  imports: [
    MatCardModule,
    MatRadioModule,
    TranslatePipe,
  ],
})
export class BulkTransferTypeComponent
  extends StepperChildComponent
  implements OnInit, OnActive, OnSave
{
  @Output() payOption = new EventEmitter();
  destroy$: Subject<any> = new Subject<any>();
  paymentType!: string;
  paymentReason!: string;

  constructor(
    private ctxManager: ContextManager,
    private translate: TranslateService
  ) {
    super();
  }

  ngOnInit(): void {}

  onActive() {}

  onSave() {
    this.ctxManager.patchCurrentContextData({
      paymentOption: {
        paymentType: this.paymentType,
        paymentReason: this.paymentReason,
      },
    });

    let paymentOption = {
      paymentType: this.paymentType,
      paymentReason: this.paymentReason,
    };
    this.payOption.emit(paymentOption);
    this.gotoNext();
  }

  bulkType(event: any) {
    this.paymentType = event.value;
  }

  bulkReason(event: any) {
    this.paymentReason = event.value;
  }
}
