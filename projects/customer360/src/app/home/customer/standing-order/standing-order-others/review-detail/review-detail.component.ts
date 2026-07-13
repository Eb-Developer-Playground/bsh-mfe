import { CommonModule, DatePipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { StandingOrderService } from '@app/core/services/standing-order/standing-order.service';
import { MessageBoxType, ToastService } from '@app/shared/modules/toast';
@Component({
    selector: 'app-review-detail',
    templateUrl: './review-detail.component.html',
    styleUrls: ['./review-detail.component.scss'],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        TranslatePipe,
        MatDialogModule,
        MatButtonModule,
        MatIconModule,
        MatCardModule,
        MatDividerModule,
        DatePipe,
    ],
})
export class ReviewDetailComponent implements OnInit {
    public form!: UntypedFormGroup;
    isCustomerPresent: boolean = false;
    fee: any;
    account: any;
    isValid: boolean = false;
    constructor(
        public dialog: MatDialog,
        public formBuilder: UntypedFormBuilder,
        public dialogRef: MatDialogRef<ReviewDetailComponent>,
        public standingOrderService: StandingOrderService,
        private toastService: ToastService,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {}
    numOr0 = (n: any) => (isNaN(n) ? 0 : n);
    ngOnInit() {
        this.form = this.formBuilder.group({
            Sms: [true],
            Email: [true],
        });
        this.account = this.standingOrderService.getAccountDetail();
        this.data = {
            beneficiary: this.data.beneficiary.getRawValue(),
            payment: this.data.payment.getRawValue(),
            documents: this.data.documents,
            stop: this.data.stop,
            methodType: this.data.methodType,
        };
        this.standingOrderService
            .getStandingOrderCharges(
                this.data?.methodType,
                this.data?.beneficiary?.standingOrderType
            )
            .subscribe((feeRes) => {
                if (feeRes.successful) {
                    this.fee = feeRes.responseObject;
                }
            });
    }

    goBack = () => {
        this.dialogRef.close({ confirm: false });
    };
    onSubmit() {
        localStorage.setItem(
            'standing-order-details',
            JSON.stringify({ ...this.data, ...this.account })
        );
        this.dialogRef.close({ confirm: true, form: this.form });
    }
}
