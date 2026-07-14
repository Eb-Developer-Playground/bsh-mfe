import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ContextManager, StepperParentComponent, StepperComponent} from '@app/shared/modules/stepper';
import {TranslateService, TranslatePipe} from '@ngx-translate/core';
import {UntypedFormBuilder} from "@angular/forms";
import {CdkStepperModule} from '@angular/cdk/stepper';
import {NgIf} from '@angular/common';
import {BulkTransferTypeComponent} from './bulk-transfer-type/bulk-transfer-type.component';
import {NotificationsComponent} from '@app/shared/modules/notifications';
import {TransactionEntriesComponent} from './transaction-entries/transaction-entries.component';
import {TransactionDetailsReviewComponent} from './transaction-details-review/transaction-details-review.component';
import {UploadDocumentComponent} from './upload-document/upload-document.component';

@Component({
    selector: 'app-bulk-payment',
    templateUrl: './bulk-payment.component.html',
    styleUrls: ['./bulk-payment.component.scss'],
    imports: [
        NgIf,
        TranslatePipe,
        CdkStepperModule,
        StepperComponent,
        BulkTransferTypeComponent,
        NotificationsComponent,
        TransactionEntriesComponent,
        TransactionDetailsReviewComponent,
        UploadDocumentComponent,
    ],
})
export class BulkPaymentComponent extends StepperParentComponent implements OnInit, OnDestroy {
    paymentOption!: string;
    public enableBack = true;
    public disableSave = false;
    public enableFinish = false;
    public totalAmount = 0;
    public transactionDetails: any;
    public BASE_AMOUNT = 1000000;
    public documentUploaded = false;
    public paymentOptions!: any;
    public transactionError = false;

    constructor(protected override router: Router,
                protected override route: ActivatedRoute,
                protected override fb: UntypedFormBuilder,
                public ctxManager: ContextManager,
                private translate: TranslateService,) {
        super(router, route, fb);
    }


    override ngOnInit(): void {
        this.ctxManager.context = 'bulk-payment';
        this.paymentOption = this.router.getCurrentNavigation()?.extras.state?.['paymentOption'];
        if (this.paymentOption) {
            this.ctxManager.patchCurrentContextData({paymentOption: this.paymentOption});
        }
        localStorage.removeItem('context');
    }

    override onFinish(): void {
        this.router.navigate(['/services/transfer']).then(() => {
        });
    }

    enableBackEvent(event: boolean) {
        this.enableBack = event;
    }

    getTotalAmount($event: any) {
        this.transactionDetails = $event
        this.totalAmount = $event.totalTransanctionAmount
    }

    getPaymentOptions($event: any) {
        this.paymentOptions = $event
    }

    override onQuit(): void {
        this.router.navigate(['/services/transfer']).then(() => {
        });
    }

    getTransactionError(event: boolean) {
        this.transactionError = event;
    }

    override ngOnDestroy(): void {
        localStorage.removeItem('context');
    }
}
