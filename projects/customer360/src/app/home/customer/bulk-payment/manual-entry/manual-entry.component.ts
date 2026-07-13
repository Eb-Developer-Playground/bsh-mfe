import {Component, OnInit, Input, Inject, Output, EventEmitter, OnChanges, SimpleChanges} from '@angular/core';
import {DecimalPipe, NgIf, NgFor} from '@angular/common';
import {UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators, ReactiveFormsModule, FormsModule} from '@angular/forms';
import {Router} from '@angular/router';
import {ToastService, MessageBoxType} from '@app/shared/modules/toast';
import {BulkPaymentService} from '@app/core/services/bulk-payment/bulk-payment.service';
import {ContextManager} from '@app/shared/modules/stepper';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {TranslateService, TranslatePipe} from '@ngx-translate/core';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import {CurrencyMaskModule} from 'ng2-currency-mask';
import {
    debounceTime,
    filter,
    distinctUntilChanged,
    takeUntil,
    map,
    tap,
    switchMap,
} from 'rxjs/operators';
import {Account} from '../../funds-transfer/funds-transfer.model';
import {IUser} from '@app/core/services/auth/auth-model';
import {AuthService} from '@app/core/services/auth/auth.service';
import {AccountService} from '@app/core/services/account/account.service';

@Component({
    selector: 'app-manual-entry',
    templateUrl: './manual-entry.component.html',
    styleUrls: ['./manual-entry.component.scss'],
    imports: [
        NgIf,
        NgFor,
        ReactiveFormsModule,
        FormsModule,
        MatExpansionModule,
        MatFormFieldModule,
        MatSelectModule,
        MatInputModule,
        MatIconModule,
        CurrencyMaskModule,
        TranslatePipe,
    ],
})
export class ManualEntryComponent implements OnInit, OnChanges {
    @Input() editable: boolean = false;
    @Input() filteredAccount: any;
    currentUser!: IUser;
    itemsForm!: UntypedFormGroup;
    form!: UntypedFormGroup;

    isValid = false;
    isNotValid = true;
    isExpanded = true;
    isSubmit = true;

    hide!: string;
    toCurrency!: string;
    selectedAccount!: any;
    selectedCurrency = 'KES';
    amountValue!: string;
    bulkPayload!: any;
    exchRates: any;

    payMode = [];
    countries = ['UK', 'USA', 'KE'];
    currencies = ['KES'];
    // , 'USD', 'EUR', 'GBP'  Addd them back whn multi debit is available
    paymentReason = ['Salary payment', 'Merchant payment'];

    paymentMode!: string;
    customerDetails = JSON.parse(
        <string>localStorage.getItem('customerDetails')
    );
    account: any;

    verifiedSubmission: Array<boolean> = [];
    ListBanks: any = {};
    subjectKeyUp = new Subject<any>();
    destroy$: Subject<any> = new Subject<any>();
    beneficiaryAccount: any = {};
    beneficiaryAccounts: Account[] = [];
    subjectAccount = new BehaviorSubject<any>('');
    sendToOwnAccount: boolean = false;
    sendToOtherAccount: boolean = false;
    disableBank: boolean = false;
    equityBank!: string;
    disable = false;
    accountNumber: any = [];

    @Output() onTransaction = new EventEmitter();
    data: any = "single";

    constructor(
        private authService: AuthService,
        private accountService: AccountService,
        private fb: UntypedFormBuilder,
        private router: Router,
        private toast: ToastService,
        private decimalPipe: DecimalPipe,
        private ctxManager: ContextManager,
        private bulkPaymentService: BulkPaymentService,
        public translateService: TranslateService
    ) {

        this.currentUser = this.authService.currentUser;
        this.account = this.data.account;

        this.itemsForm = this.fb.group({
            items: this.fb.array([]),
        });

        this.form = this.fb.group({
            query: [''],
        });
    }

    get items() {
        return this.itemsForm.controls['items'] as UntypedFormArray;
    }

    ngOnInit(): void {
        this.createItem();
        this.bulkPaymentService.getPaymentOptions().subscribe((response) => {
            if (response && response.responseObject) {
                this.payMode = response.responseObject;
            } else {
                this.toast.show(
                    this.translateService.instant('BULK-TRANFER.ERROR'),
                    this.translateService.instant('BULK-TRANFER.UNABLE-FETCH'),
                    MessageBoxType.DANGER,
                    5000, undefined, undefined, true
                );
            }
        });

        this.subjectKeyUp
            .pipe(debounceTime(1000), distinctUntilChanged())
            .subscribe((d) => {
                this.getBankList(d);
            });
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['filteredAccount']) {
            this.accountNumber = changes['filteredAccount'].currentValue;
            this.selectedAccount = this.accountNumber[0];
        }
    }

    removeTransaction(account: String, index: number) {
        let ticketId = this.ctxManager.currentContextData.ticket.id;

        if (this.items.controls[index].status == 'INVALID') {
            this.items.removeAt(index);
        } else {
            this.bulkPaymentService
                .removeTransaction(account, ticketId)
                .subscribe(
                    (response) => {
                        this.items.removeAt(index);

                        this.toast.show(
                            this.translateService.instant(
                                'BULK-TRANFER.SUCCESS'
                            ),
                            this.translateService.instant(
                                'BULK-TRANFER.TRANSACTION-REMOVED'
                            ),
                            MessageBoxType.SUCCESS,
                            5000, undefined, undefined, true
                        );
                    },
                    (err: any) => {
                        this.toast.show(
                            this.translateService.instant('BULK-TRANFER.ERROR'),
                            err,
                            MessageBoxType.DANGER,
                            5000, undefined, undefined, false
                        );
                    }
                );
        }
    }

    createItem() {
        const bulkForm = this.fb.group({
            beneficiary: [{value: '', disabled: false}, Validators.required],
            banknetwork: ['', Validators.required],
            accountphoneNo: ['', Validators.required],
            debitAccount: [this.accountNumber[0].accountNumber, Validators.required],
            currency: [this.currencies[0], Validators.required],
            rate: [this.exchRates],
            amount: ['', Validators.required],
            paymentMode: ['', Validators.required],
            paymentReason: ['', Validators.required],
            naration: ['', Validators.required],
            destinationCountry: [''],
            swiftCode: [''],
            sectorCode: [''],
        });


        this.items.push(bulkForm);


        this.getBankList('equity bank');
    }

    ngAfterViewInit(): void {
        this.getBankList('equity bank');
    }

    onClearSearch() {
        this.form.controls['query'].setValue('');
    }

    modeOfPayment($event: any) {

        this.paymentMode = $event.value;

        if (this.paymentMode === 'INTERNAL_TRANSFER') {
            this.disableBank = true
            this.sendToOwnAccount = false;
            this.sendToOtherAccount = true;
        } else {
            this.sendToOwnAccount = true;
            this.sendToOtherAccount = false;
            this.disableBank = false
        }
    }

    onSearch($event: any): void {
        const value = $event.target.value;
        this.subjectKeyUp.next(value);
    }

    validateBeneficiaryAccountNumber(account: any, index: number) {

        if (account == null)
            return;

        if (account.length >= 13) {
            // const myForm = (<FormArray>this.itemsForm.get("items")).at(index).get('account') as FormControl;

            this.subjectAccount.next(account);

            this.subjectAccount
                .pipe(
                    debounceTime(1000),
                    filter(
                        (accoutNumber: string) =>
                            !!accoutNumber &&
                            !!accoutNumber.length &&
                            accoutNumber.length >= 13
                    ),
                    takeUntil(this.destroy$)
                )
                .subscribe((accountNumber: any) => {
                    if (accountNumber) {
                        this.searchCustomerByAccNo(accountNumber, index);
                    }
                });
        } else {
            const myForm = (<UntypedFormArray>this.itemsForm.get("items")).at(index);
            myForm.get('beneficiary')?.enable();
        }

    }

    getBankList(value: string) {
        this.bulkPaymentService
            .searchBICs(
                value,
                this.customerDetails.preferredAddress.countryCode
            )
            .subscribe((res) => {
                const transaction = res.responseObject;
                const myForm = (<UntypedFormArray>this.itemsForm.get("items")).controls;

                for (let index = 0; index < myForm.length; index++) {
                    const myForm = (<UntypedFormArray>this.itemsForm.get("items")).at(index);

                    myForm.patchValue(
                        {
                            banknetwork: res.responseObject[0].bankName,
                        },
                        {emitEvent: false}
                    );

                }

                this.equityBank = res.responseObject[0].bankName;

                this.ListBanks = {
                    ...this.ListBanks,
                    [`transaction-${this.items.length}`]: transaction,
                };
            });
    }

    getCurrency($event: any) {
        this.selectedCurrency = $event.value;
    }

    onTyping($event: any) {
        this.amountValue = $event.target.value;

        let dataArray = this.itemsForm.value.items;
        let lastElement = dataArray[dataArray.length - 1];

        this.selectedCurrency = lastElement.currency;

        if (this.amountValue == '') return;

        if (this.selectedAccount == undefined) {
            this.toast.show(
                this.translateService.instant('BULK-TRANFER.ERROR'),
                this.translateService.instant('BULK-TRANFER.SELECT-DEBIT'),
                MessageBoxType.DANGER,
                5000, undefined, undefined, true
            );

            return;
        }

        if (this.selectedAccount.accountCurrency === this.selectedCurrency)
            this.exchRates = 0;
        else this.getExcRate();
    }

    getExcRate() {
        let data = {
            fromCurrency: this.selectedAccount.accountCurrency,
            toCurrency: this.selectedCurrency,
            accountNumber: this.selectedAccount.accountNumber,
            amount: this.amountValue,
        };

        this.bulkPaymentService.getExRates(data).subscribe(
            (res) => {
                if (res.responseObject === null || res.successful === false) {
                    this.toast.show(
                        this.translateService.instant('BULK-TRANFER.ERROR'),
                        res.statusMessage,
                        MessageBoxType.DANGER,
                        5000, undefined, undefined, false
                    );
                    return;
                }

                this.exchRates = res.responseObject.rate;
            },
            (err: any) => {
                this.toast.show(
                    this.translateService.instant('BULK-TRANFER.ERROR'),
                    err,
                    MessageBoxType.DANGER,
                    5000, undefined, undefined, false
                );
            }
        );
    }

    addTransaction(): void {


        if (Number(this.itemsForm.getRawValue().items[0].amount) <= Number(0.00)) {
            this.toast.show(
                this.translateService.instant('BULK-TRANFER.ERROR'),
                "The amount should be greater than 0",
                MessageBoxType.DANGER,
                5000, undefined, undefined, true
            );

            return;
        } else if (Number(this.itemsForm.getRawValue().items[0].amount) > Number(this.selectedAccount.availableBalance)) {
            this.toast.show(
                this.translateService.instant('BULK-TRANFER.ERROR'),
                "The amount is greater than the available balance",
                MessageBoxType.DANGER,
                5000, undefined, undefined, false
            );

            return;
        }

        if (this.itemsForm.invalid) {
            this.isNotValid = false;
            this.toast.show(
                this.translateService.instant('BULK-TRANFER.ERROR'),
                this.translateService.instant('BULK-TRANFER.INVALID-FORM'),
                MessageBoxType.DANGER,
                5000, undefined, undefined, true
            );

            return;
        }

        let dataArray = this.itemsForm.getRawValue().items;

        let newData = dataArray[dataArray.length - 1];

        this.bulkPayload = {
            beneficiaryName: newData.beneficiary,
            bank_Operator: newData.banknetwork === '' ? this.equityBank : newData.banknetwork,
            account_Phone: newData.accountphoneNo,
            amount: newData.amount,
            currency: newData.currency,
            debitAccount: newData.debitAccount,
            modeofPayment: newData.paymentMode,
            paymentReason: newData.paymentReason,
            naration: newData.naration,
            validation: true,
            validationErrors: '',
            debitAccountDetails: {
                accountName: this.selectedAccount.accountName,
                accountNumber: this.selectedAccount.accountNumber,
                accountCurrency: this.selectedAccount.accountCurrency,
                accountStatus: this.selectedAccount.accountStatus,
                availableBalance: this.selectedAccount.availableBalance,
                effectiveBalance: this.selectedAccount.effectiveBalance,
            },
        };


        this.setTransactionDetials(this.bulkPayload);
        this.verifiedSubmission.push(true);

    }

    setTransactionDetials(payload: any) {
        let transactionDetails = {
            payload,
            actionName: "ManualEntry"
        }

        this.onTransaction.emit(transactionDetails);

        this.items.controls[0].get('beneficiary')?.reset('');
        this.items.controls[0].get('beneficiary')?.enable();
        this.items.controls[0].get('beneficiary')?.invalid;
        this.items.controls[0].get('accountphoneNo')?.reset('');
        this.items.controls[0].get('accountphoneNo')?.invalid;
        this.items.controls[0].get('amount')?.reset('0.00');
        this.items.controls[0].get('amount')?.invalid;
        this.items.controls[0].get('paymentReason')?.reset('');
        this.items.controls[0].get('paymentReason')?.invalid;


    }

    quit() {
        this.router.navigateByUrl('/services/customer-360');
    }

    private isActiveWithSelfMandate = (v: any) =>
        v.accountStatus === 'A' && v.mandate === 'SELF';

    private searchCustomerByAccNo(accountNumber: string, index: number) {

        this.toast.dismissed();
        const myForm = (<UntypedFormArray>this.itemsForm.get("items")).at(index);

        myForm.patchValue(
            {
                beneficiary: '',
            },
            {emitEvent: false}
        );


        const query = `?Id=${accountNumber}&bankId=${this.currentUser.bankId}&idType=accountid`;

        this.accountService
            .getAccount(query)
            .pipe(
                tap((beneficiaryAccountResponse: any) => {
                    //if user not found
                    if (
                        beneficiaryAccountResponse.successful &&
                        beneficiaryAccountResponse.responseObject === null
                    ) {
                        this.toast.show(
                            'Info',
                            'Beneficiary account not found',
                            MessageBoxType.WARNING,
                            5000, undefined, undefined, false
                        );
                    }
                }),
                //if user found
                filter(
                    (beneficiaryAccountResponse) =>
                        !!beneficiaryAccountResponse.responseObject
                ),
                switchMap((beneficiaryAccountResponse) => {
                    return this.getCustomerAccounts(
                        beneficiaryAccountResponse.responseObject.cif
                    ).pipe(
                        tap((beneficiaryAccountResponse) => {
                            this.beneficiaryAccounts =
                                beneficiaryAccountResponse.accounts?.filter(
                                    this.isActiveWithSelfMandate
                                );
                        }),
                        map(
                            (beneficiaryAccountResponse: any) =>
                                beneficiaryAccountResponse
                        )
                    );
                }),

                takeUntil(this.destroy$)
            )
            .subscribe(
                (res: any) => {
                    if (res.successful && res.responseObject) {
                        const beneficiary = res.responseObject;

                        this.beneficiaryAccount =
                            beneficiary.accounts.find(
                                (v: any) =>
                                    v.accountStatus === 'A' &&
                                    v.accountNumber === accountNumber
                            ) || {};
                        if (this.beneficiaryAccount) {

                            //For single debit
                            if (this.beneficiaryAccount.accountCurrency !== 'KES') {
                                this.toast.show('Info', 'Please select KES account', MessageBoxType.WARNING, 5000, undefined, undefined, false);
                                myForm.patchValue(
                                    {
                                        accountphoneNo: '',
                                    },
                                    {emitEvent: false}
                                );
                                return
                            }

                            myForm.patchValue(
                                {
                                    beneficiary: `${beneficiary.firstName} ${beneficiary.lastName}`,
                                },
                                {emitEvent: false}
                            );

                            myForm.get('beneficiary')?.disable();
                        } else {
                            myForm.patchValue(
                                {
                                    beneficiary: '',
                                },
                                {emitEvent: false}
                            );
                        }
                    }
                },
                (err: any) => {
                    this.toast.show('Error', err, MessageBoxType.DANGER, 5000, undefined, undefined, false);
                }
            );
    }

    private getCustomerAccounts(cif: string): Observable<any> {
        const query = `?Id=${cif}&bankId=${this.currentUser.bankId}&idType=customerid`;
        return this.accountService.getAccount(query);
    }


}
