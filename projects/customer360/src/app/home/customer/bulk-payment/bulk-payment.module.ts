import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { TranslateModule } from '@ngx-translate/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CurrencyMaskModule } from 'ng2-currency-mask';
import { StepperModule } from '../../../shared/modules/stepper';

import { BulkPaymentRoutingModule } from './bulk-payment-routing.module';
import { NotificationsModule } from '../../../shared/modules/notifications';
import { MaterialModule } from './material.module';

import { BulkPaymentComponent } from './bulk-payment.component';
import { TransactionEntriesComponent } from './transaction-entries/transaction-entries.component';
import { ManualEntryComponent } from './manual-entry/manual-entry.component';
import { UploadDocumentComponent } from './upload-document/upload-document.component';
import { TransactionDetailsReviewComponent } from './transaction-details-review/transaction-details-review.component';
import { UpdateTransactionComponent } from './update-transaction/update-transaction.component';
import { RemoveTransactionComponent } from './remove-transaction/remove-transaction.component';
import { BulkTransferTypeComponent } from './bulk-transfer-type/bulk-transfer-type.component';
import { TransactionSummaryComponent } from './transaction-entries/transaction-summary/transaction-summary.component';
import { ConfirmPaymentComponent } from './confirm-payment/confirm-payment.component';
import { ChangeAccountComponent } from './change-account/change-account.component';
import { SuccessComponent } from './success/success.component';
import { MatSortModule } from '@angular/material/sort';

@NgModule({
  declarations: [
    BulkTransferTypeComponent,
    UpdateTransactionComponent,
    RemoveTransactionComponent,
    TransactionSummaryComponent,
    ConfirmPaymentComponent,
    BulkPaymentComponent,
    TransactionEntriesComponent,
    TransactionDetailsReviewComponent,
    ManualEntryComponent,
    UploadDocumentComponent,
    ChangeAccountComponent,
    SuccessComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CdkStepperModule,
    BulkPaymentRoutingModule,
    FlexLayoutModule,
    CurrencyMaskModule,
    StepperModule,
    TranslateModule,
    MaterialModule,
    NotificationsModule,
    MatSortModule,
  ],
})
export class BulkPaymentModule {}
