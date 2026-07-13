import { Component, Inject, Input, OnInit } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { BulkPaymentService } from '@app/core/services/bulk-payment/bulk-payment.service';
import { AddTransaction } from '@app/core/services/bulk-payment/model/bulk.model';
import { MessageBoxType, ToastService } from '@app/shared/modules/toast';
import { ContextManager } from '@app/shared/modules/stepper';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { DecimalPipe } from '@angular/common';
import { NgIf, NgFor } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { CurrencyMaskModule } from 'ng2-currency-mask';

interface BANKS {
    name: string;
}

@Component({
    selector: 'app-update-transaction',
    templateUrl: './update-transaction.component.html',
    styleUrls: ['./update-transaction.component.scss'],
    imports: [
        NgIf,
        NgFor,
        TranslatePipe,
        ReactiveFormsModule,
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatDialogModule,
        CurrencyMaskModule,
    ],
})
export class UpdateTransactionComponent implements OnInit {
    public transactionForm!: UntypedFormGroup;
    form!: UntypedFormGroup;

    // updateText = 'Update transaction ';
    // removeText = 'Remove transaction';

    selectedAccount!: any;
    bulkPayload!: AddTransaction;
    isDisbled = false;
    exchRates: any;
    @Input() editable: boolean = false;
    submitted = false;
    selectedCurrency = 'KES';
    banks: BANKS[] = [
        {name: 'ABC Bank'},
        {name: 'Absa Bank'},
        {name: 'Access Bank Kenya'},
        {name: 'Bank of Africa'},
    ];
    payMode = ['EFT', 'Internal transfer', 'Pesalink', 'SWIFT/RTGS', 'Wallet'];
    currencies = ['KES'];
    paymentReason = ['Salary payment', 'Merchant payment'];
    ListBanks: BANKS[] = [];

    userAccounts = JSON.parse(<string>localStorage.getItem('accounts'));

    bulkDetails = JSON.parse(<string>localStorage.getItem('context'));
    bankNetwork!: string;
    modeOfPay!: string;
    debitAccount!: string;
    modifiedData: any = {};
    accountNumbers: any = [];
    disable = true;

    constructor(
        private fb: UntypedFormBuilder,
        private toast: ToastService,
        private decimalPipe: DecimalPipe,
        private ctxManager: ContextManager,
        public dialogRef: MatDialogRef<UpdateTransactionComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private bulkPaymentService: BulkPaymentService,
        public translateService: TranslateService,
    ) {
        this.form = this.fb.group({
            query: [''],
        });
    }

    ngOnInit(): void {

        this.transactionForm = this.fb.group({
            beneficiaryName: [this.data.element.beneficiaryName, Validators.required],
            bank_Operator: [this.data.element.bank_Operator, Validators.required],
            account_Phone: [this.data.element.account_Phone, Validators.required],
            debitAccount: [this.data.element.debitAccount, Validators.required],
            currency: [this.data.element.currency, Validators.required],
            rate: [this.data.element.rate],
            amount: [this.data.element.amount, Validators.required],
            paymentMode: [this.data.element.modeofPayment, Validators.required],
            paymentReason: [this.data.element.paymentReason, Validators.required],
            naration: [this.data.element.naration],
        });


        this.bankNetwork = this.transactionForm.get('bank_Operator')?.value;
        this.modeOfPay = this.transactionForm.get('paymentMode')?.value;
        this.debitAccount = this.transactionForm.get('debitAccount')?.value;

        this.accountNumbers = this.userAccounts.filter((res: any) => {
            if (this.debitAccount == res.accountNumber)
                return res
        })

        this.transactionForm.valueChanges.subscribe((value) => {


            this.isDisbled = this.transactionForm.invalid;

            for (let index = 0; index < this.userAccounts.length; index++) {
                if (
                    this.userAccounts[index].accountNumber === value.debitAccount
                ) {

                    this.selectedAccount = this.userAccounts[index];
                }
            }


            this.bulkPayload = {
                beneficiaryName: value.beneficiaryName,
                bank_Operator: value.bank,
                account_Phone: value.account,
                amount: value.amount,
                currency: value.currency,
                debitAccount: value.debitAccount,
                modeofPayment: value.paymentMode,
                paymentReason: value.reason,
                narration: value.narration,
                isValid: true,
                errors: '',
                debitAccountDetails: {
                    accountName: this.selectedAccount.accountName,
                    accountNumber: this.selectedAccount.accountNumber,
                    accountCurrency: this.selectedAccount.accountCurrency,
                    accountStatus: this.selectedAccount.accountStatus,
                    availableBalance: 0,
                    effectiveBalance: '0',
                },
            };
        });

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

    onReset(): void {
        this.submitted = false;
        this.form.reset();
    }


    getCurrency($event: any) {
    }

    onTyping($event: any) {
    }

    updateTransaction() {

        this.modifiedData.beneficiaryName = this.transactionForm.get('beneficiaryName')?.value;
        this.modifiedData.bank_Operator = this.transactionForm.get('bank_Operator')?.value;
        this.modifiedData.account_Phone = this.transactionForm.get('account_Phone')?.value;
        this.modifiedData.debitAccount = this.transactionForm.get('debitAccount')?.value;
        this.modifiedData.currency = this.transactionForm.get('currency')?.value;
        this.modifiedData.rate = this.transactionForm.get('rate')?.value;
        this.modifiedData.amount = this.transactionForm.get('amount')?.value;
        this.modifiedData.modeofPayment = this.transactionForm.get('paymentMode')?.value;
        this.modifiedData.paymentReason = this.transactionForm.get('paymentReason')?.value;
        this.modifiedData.naration = this.transactionForm.get('naration')?.value;


        this.toast.show(
            this.translateService.instant('BULK-TRANFER.SUCCESS'),
            this.translateService.instant('BULK-TRANFER.TRANSACTION-UPDATED'),
            MessageBoxType.SUCCESS,
            5000, undefined, undefined, true
        );

        this.closeDialog(true)

        // let ticketId = this.ctxManager.currentContextData.ticket.id;


        // this.bulkPaymentService
        //     .updateTransaction(this.bulkPayload, ticketId)
        //     .subscribe(
        //         (response) => {

        //             this.toast.show(
        //                 this.translateService.instant('BULK-TRANFER.SUCCESS'),
        //                 this.translateService.instant('BULK-TRANFER.TRANSACTION-UPDATED') ,
        //                 MessageBoxType.SUCCESS
        //             );

        //             this.closeDialog(true)

        //         },
        //         (err: any) => {
        //             this.toast.show(this.translateService.instant('BULK-TRANFER.ERROR'), err, MessageBoxType.DANGER);
        //         }
        //     );
    }


    onClearSearch() {
        this.form.controls['query'].setValue('');
    }

    search(value: string): void {
        this.ListBanks = this.banks.filter((val) =>
            val.name.toLowerCase().includes(value)
        );
    }
}
