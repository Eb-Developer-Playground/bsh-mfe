import {Component, Input, OnInit} from '@angular/core';
import {NgIf, DecimalPipe} from '@angular/common';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {BulkPaymentService} from '@app/core/services/bulk-payment/bulk-payment.service';
import {ContextManager, OnActive, OnSave, StepperChildComponent,} from '@app/shared/modules/stepper';
import {ToastService} from '@app/shared/modules/toast/toast.service';
import {MessageBoxType} from '@app/shared/modules/toast';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {MatCardModule} from '@angular/material/card';
import {MatDividerModule} from '@angular/material/divider';
import {NotificationsComponent, NotificationsContentDirective} from '@app/shared/modules/notifications';

@Component({
    selector: 'app-transaction-details-review',
    templateUrl: './transaction-details-review.component.html',
    styleUrls: ['./transaction-details-review.component.scss'],
    imports: [
        NgIf,
        DecimalPipe,
        TranslatePipe,
        MatCardModule,
        MatDividerModule,
        NotificationsComponent,
        NotificationsContentDirective,
    ],
})
export class TransactionDetailsReviewComponent extends StepperChildComponent implements OnInit, OnActive, OnSave {
    @Input() transactionDetails!: any
    destroy$: Subject<any> = new Subject<any>();
    paymentOption!: string;
    isInsufficient = false;
    // accountNumbers = JSON.parse(<string>localStorage.getItem('accounts'));
    // totalAmount = JSON.parse(<string>localStorage.getItem('totalAmount'));

    constructor(public translateService: TranslateService,
                private ctxManager: ContextManager,
                private bulkPaymentService: BulkPaymentService,
                private toast: ToastService) {
        super();
    }

    ngOnInit(): void {
        this.paymentOption = this.ctxManager.currentContextData.paymentOption?.paymentType;
    }

    onActive(): void {
    }

    onSave(): void {
        const ticketId = this.ctxManager.currentContextData.ticket.id;
        const transactionPayload = this.ctxManager.currentContextData?.transactionPayload;

        const actionName = this.ctxManager.currentContextData.actionName;
        if (actionName == "fileUpload") {
            this.submitBulk(ticketId)
        } else {
            this.bulkPaymentService
                .addTransaction(transactionPayload, ticketId)
                .pipe(takeUntil(this.destroy$))
                .subscribe(
                    (response) => {
                        if (!response.successful) {
                            return
                        } else {
                            this.toast.show(
                                this.translateService.instant('BULK-TRANFER.SUCCESS'),
                                this.translateService.instant(
                                    'BULK-TRANFER.TRANSACTION-ADDED'
                                ),
                                MessageBoxType.SUCCESS,
                                5000, undefined, undefined, true
                            );
                            this.submitBulk(ticketId)
                        }
                    },
                    (err: any) => {
                        let errorMessage = err;

                        if (
                            (errorMessage.error?.statusMessage &&
                                errorMessage.error?.statusCode == '99') || errorMessage.statusMessage
                        )
                            errorMessage = err.error?.statusMessage || errorMessage.statusMessage;
                        this.toast.show(
                            this.translateService.instant('BULK-TRANFER.ERROR'),
                            errorMessage,
                            MessageBoxType.DANGER,
                            5000, undefined, undefined, false
                        );
                    }
                );
        }
    }

    submitBulk(ticketId: string) {
        this.bulkPaymentService.submitTransaction(ticketId).pipe(
            takeUntil(this.destroy$)
        ).subscribe(res => {
            this.gotoNext();
        }, (error) => {
            // this.toast.show(
            //     error,
            //     this.translateService.instant('BULK-TRANFER.ERROR'),
            //     MessageBoxType.DANGER
            // );
        })
    }

    ngOnDestroy(): void {
        this.destroy$.next('');
        this.destroy$.complete();
    }
}
