import { NgModule } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';

import { MaterialModule } from '../material.module';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { FundsTransferRoutingModule } from './funds-transfer-routing.module';

import { FundsTransferComponent } from './funds-transfer.component';
import { SupportingDocumentsComponent } from './supporting-documents/supporting-documents.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SuccessComponent } from './success/success.component';
import { ReviewComponent } from './review/review.component';
import { CustomerModule } from '../customer.module';
import { TranslateModule } from '@ngx-translate/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CurrencyMaskModule } from 'ng2-currency-mask';

@NgModule({
  providers: [DatePipe, DecimalPipe],
  declarations: [
    FundsTransferComponent,
    SupportingDocumentsComponent,
    SuccessComponent,
    ReviewComponent,
  ],
  exports: [ReviewComponent],
  imports: [
    CurrencyMaskModule,
    FlexLayoutModule,
    TranslateModule,
    CommonModule,
    FundsTransferRoutingModule,
    MaterialModule,
    CdkStepperModule,
    FormsModule,
    ReactiveFormsModule,
    CustomerModule,
  ],
})
export class FundsTransferModule {}
