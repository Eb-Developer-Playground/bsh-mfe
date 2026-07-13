import { Component, Inject, OnInit } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { BulkPaymentService } from '@app/core/services/bulk-payment/bulk-payment.service';
import { ToastService } from '@app/shared/modules/toast';
import { ContextManager } from '@app/shared/modules/stepper';

@Component({
    selector: 'app-remove-transaction',
    templateUrl: './remove-transaction.component.html',
    styleUrls: ['./remove-transaction.component.scss'],
    imports: [
        NgIf,
        NgFor,
        MatDialogModule,
        MatIconModule,
        MatButtonModule,
        TranslatePipe,
    ],
})
export class RemoveTransactionComponent implements OnInit {
    transactinData!: any;
    isRemove!: Boolean
    modifiedData: any = {};

    constructor(
        private toast: ToastService,
        private ctxManager: ContextManager,
        public dialogRef: MatDialogRef<RemoveTransactionComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private bulkPaymentService: BulkPaymentService,
        public translateService: TranslateService,) {
    }

    ngOnInit(): void {
        this.transactinData = [
            {title: "Beneficiary", value: this.data.element.beneficiaryName},
            {title: "Bank", value: this.data.element.bank_Operator},
            {title: "Account/Phone no", value: this.data.element.account_Phone},
            {title: "Debit Account", value: this.data.element.debitAccount},
            {title: "Currency", value: this.data.element.currency},
            {title: "Rate", value: this.data.element.rate},
            {title: "Amount", value: this.data.element.amount},
            {title: "Payment Mode", value: this.data.element.modeofPayment},
            {title: "Reason", value: this.data.element.paymentReason},
            {title: "Narration", value: this.data.element.naration}
        ]
        this.isRemove = this.data.action;
    }

    closeDialog(value: Boolean): void {
        if (value) {
            this.modifiedData.value = value;
        } else {
            this.modifiedData.value = false;
        }
        this.modifiedData.validation = true;
        this.modifiedData.validationErrors = '';
        this.dialogRef.close(this.modifiedData);
    }

    removeTransaction() {
        this.modifiedData.account_Phone = this.data.element.account_Phone;
        this.closeDialog(true);
    }
}


// let ticketId = this.ctxManager.currentContextData.ticket.id;

// this.bulkPaymentService
//     .removeTransaction(this.data.element.account_Phone, ticketId)
//     .subscribe(
//         (response) => {

//         },
//         (err: any) => {
//             this.toast.show( this.translateService.instant('BULK-TRANFER.ERROR'), err, MessageBoxType.DANGER);
//         }
//     );
