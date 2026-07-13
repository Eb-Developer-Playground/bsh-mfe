import {
    Component,
    Input,
    OnDestroy,
    OnChanges,
    OnInit,
    SimpleChanges,
    ViewChild,
    Output,
    EventEmitter,
} from '@angular/core';
import {NgIf, NgFor, DecimalPipe} from '@angular/common';
import { ManualEntryComponent } from '../manual-entry/manual-entry.component';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
    ContextManager,
    OnActive, OnSave,
    StepperChildComponent
} from '@app/shared/modules/stepper';
import {MessageBoxType} from '@app/shared/modules/toast';
import {ToastService} from '@app/shared/modules/toast/toast.service';
import {Account} from '../../funds-transfer/funds-transfer.model';
import {AccountManagementService} from '@app/core/services/account-management/account-management.service';
import {BulkPaymentService} from '@app/core/services/bulk-payment/bulk-payment.service';
import {v4 as uuid} from 'uuid';
import {
    CreateTicketPayload,
    PaymentTransactions,
    UploadDoc,
    BulkCharges,
} from '@app/core/services/bulk-payment/model/bulk.model';
import {UpdateTransactionComponent} from '../update-transaction/update-transaction.component';
import {RemoveTransactionComponent} from '../remove-transaction/remove-transaction.component';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {ReactiveFormsModule} from '@angular/forms';
import {ConfirmPaymentComponent} from '../confirm-payment/confirm-payment.component';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
// import { ItemsControl } from '@ngu/carousel/lib/ngu-carousel/ngu-carousel';
import {ChangeAccountComponent} from '../change-account/change-account.component';
import {DialogConfirmComponent} from '@app/shared/components/dialog/dialog-confirm/dialog-confirm.component';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatTableModule} from '@angular/material/table';
import {MatSortModule} from '@angular/material/sort';
import {MatDividerModule} from '@angular/material/divider';
import {TransactionSummaryComponent} from './transaction-summary/transaction-summary.component';
import {DragDropDocumentsDirective} from '@app/shared/modules/upload-docs/drag-drop-documents.directive';

@Component({
    selector: 'app-transaction-entries',
    templateUrl: './transaction-entries.component.html',
    styleUrls: ['./transaction-entries.component.scss'],
    imports: [
        NgIf,
        NgFor,
        DecimalPipe,
        TranslatePipe,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatIconModule,
        MatMenuModule,
        MatTooltipModule,
        MatPaginatorModule,
        MatTableModule,
        MatDividerModule,
        MatSortModule,
        TransactionSummaryComponent,
        DragDropDocumentsDirective,
    ],
})
export class TransactionEntriesComponent extends StepperChildComponent implements OnInit, OnActive, OnSave, OnChanges {
    @ViewChild('xlsxReader') xlsxReader: any;
    @ViewChild(MatSort) sort!: MatSort;
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @Output() onDocumentError = new EventEmitter<boolean>(true);
    @Output() onAmount = new EventEmitter();
    @Input() paymentOptions!: any;
    @Output() onTransactionError = new EventEmitter<boolean>();
    transactionError = false;
    dataSource: any = new MatTableDataSource();
    displayedColumns: string[] = [
        'validation',
        'beneficiaryName',
        'bank_Operator',
        'account_Phone',
        'debitAccount',
        'currency',
        'amount',
        'paymentReason',
        'naration',
        'actions',
    ];

    accountForm!: UntypedFormGroup;
    isFileUploaded: Boolean = false;
    xlsxFile: any = null;
    pageSizeOptions = [5, 10, 20, 30, 50, 100, 300];
    pageSize = 5;
    actionName!: string;
    destroy$: Subject<any> = new Subject<any>();
    bulkSalary: DataSource[] = [];
    accounts!: Account[];
    customerDetails!: any;
    bulkdata: any = [];
    totalAmount: any = [];
    transactionDetails: any = {};
    paymentType!: string;
    payloadCharges: BulkCharges = {
        SuspenseAccount: '',
        Currency: '',
        BeneficiaryAccounts: [],
        PaySystem: 'InternalTransfer',
    };

    userAccounts = JSON.parse(<string>localStorage.getItem('accounts'));
    accountBalance!: string;
    accountNumbers = this.userAccounts.filter(function getRecent(res: any) {
        if (res.accountCurrency == 'KES' && res.accountStatus == 'A')
            return res;
    });

    selectedAccount!: string;

    singleDebitAccount!: any;
    filteredAccount!: Account[];
    customerAccount!: Account[];
    chargePayload: any = {};
    charge!: string;
    suspenseAccount!: SuspenseAccount;
    parentTaskId!: string;
    insufficientObj: any = [];
    transactionPayload: any = [];
    enableSubmit: Boolean = true;
    transactionData: any = [];

    constructor(
        public translateService: TranslateService,
        private dialog: MatDialog,
        private fb: UntypedFormBuilder,
        private toast: ToastService,
        private ctxManager: ContextManager,
        private accountManagementService: AccountManagementService,
        private bulkPaymentService: BulkPaymentService
    ) {
        super();

        const accounts = localStorage.getItem('accounts');
        if (accounts) {
            this.accounts = JSON.parse(accounts);
        } else {
            this.toast.show(
                this.translateService.instant('BULK-TRANFER.ERROR'),
                this.translateService.instant('BULK-TRANFER.FAILED-ACCOUNTS'),
                MessageBoxType.DANGER,
                5000, undefined, undefined, true
            );
        }

        const customerDetails = localStorage.getItem('customerDetails');
        if (customerDetails) {
            this.customerDetails = JSON.parse(customerDetails);
        } else {
            this.toast.show(
                this.translateService.instant('BULK-TRANFER.ERROR'),
                this.translateService.instant('BULK-TRANFER.FAILED-CIF'),
                MessageBoxType.DANGER,
                5000, undefined, undefined, true
            );
        }
    }

    ngOnInit(): void {
        this.isFileUploaded = false;
        this.paymentType =
            this.ctxManager.currentContextData.paymentOption?.paymentType ||
            'single';

        this.parentTaskId = <string>localStorage.getItem('ticketId');
        this.paymentType =
            this.ctxManager.currentContextData.paymentOption?.paymentType;

        this.accountForm = this.fb.group({
            account: [' ', Validators.required],
            suspenseAccount: [this.suspenseAccount, Validators.required],
        });

        this.accountForm.valueChanges
            .pipe(takeUntil(this.destroy$))
            .subscribe((res) => {
                this.singleDebitAccount = res.account;
            });

        this.getSuspenseAccount();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['paymentOptions']) {
            this.paymentType = changes['paymentOptions'].currentValue?.paymentType;
        }
    }

    onActive() {
    }

    getSuspenseAccount() {
        this.bulkPaymentService
            .getSuspenseAccount()
            .pipe(takeUntil(this.destroy$))
            .subscribe((result: any) => {
                this.suspenseAccount = result.responseObject.responseObject;
            });
    }

    getTableData(bulkPayment: any) {
        let isArray = Array.isArray(bulkPayment);

        if (!isArray) {
            this.bulkSalary.push({
                beneficiaryName: bulkPayment?.beneficiaryName,
                bank_Operator: bulkPayment?.bank_Operator,
                account_Phone: bulkPayment?.account_Phone,
                debitAccount: bulkPayment?.debitAccount,
                currency: bulkPayment?.currency,
                amount: bulkPayment?.amount,
                paymentReason: bulkPayment?.paymentReason,
                naration: bulkPayment?.naration,
                validation: bulkPayment?.validation,
                validationErrors: bulkPayment?.validationErrors,
            });
        } else {
            for (let index = 0; index < bulkPayment.length; index++) {
                this.bulkSalary.push({
                    beneficiaryName: bulkPayment[index]?.beneficiaryName,
                    bank_Operator: bulkPayment[index]?.bank_Operator,
                    account_Phone: bulkPayment[index]?.account_Phone,
                    debitAccount: bulkPayment[index]?.debitAccount,
                    currency: bulkPayment[index]?.currency,
                    amount: bulkPayment[index]?.amount,
                    paymentReason: bulkPayment[index]?.paymentReason,
                    naration: bulkPayment[index]?.narration,
                    validation: bulkPayment[index]?.isValid,
                    validationErrors: bulkPayment[index]?.errors
                        .trim()
                        .split('. ')
                        .map((error: any) => ({
                            title: `${error.trim().split(' ')[0]} ${error.trim().split(' ')[1]
                            }`,
                            description: error,
                        })),
                });
            }
        }

        if (this.insufficientObj.length > 0) {
            this.ctxManager.patchCurrentContextData({
                insufficientObj: this.insufficientObj,
            });
        }

        this.transactionError = this.bulkSalary.some(account => !account.validation)
        this.onTransactionError.emit(this.transactionError);

        this.setTableData(this.bulkSalary);
    }

    getTransactonList() {
        let ticketId = this.ctxManager.currentContextData.ticket?.id;
        this.actionName = this.ctxManager.currentContextData.actionName;
        this.bulkPaymentService.getTransactions(ticketId)
            .pipe(takeUntil(this.destroy$))
            .subscribe((res) => {
                this.chargePayload.Currency =
                    this.filteredAccount?.length === 0
                        ? this.accounts[0].accountCurrency
                        : this.filteredAccount[0]?.accountCurrency;
                this.chargePayload.SenderAccount =
                    this.filteredAccount?.length === 0
                        ? this.accounts[0].accountNumber
                        : this.filteredAccount[0]?.accountNumber;
                this.chargePayload.NoOfTrans =
                    res.responseObject.paymentTransactions.length;
                this.chargePayload.ChargePerTransaction = false;
                this.chargePayload.Amount =
                    res.responseObject.totalTransanctionAmount;

                if (res.responseObject.paymentTransactions.length > 0) {

                    this.transactionData = res.responseObject.paymentTransactions;

                    this.transactionDetails.paymentOption =
                        res.responseObject.paymentOption;
                    this.transactionDetails.totalTransanctionAmount =
                        res.responseObject.totalTransanctionAmount;
                    this.transactionDetails.totalChargeAmount =
                        res.responseObject.totalChargeAmount;

                    this.checkErrors(res.responseObject.paymentTransactions);
                    this.getTableData(res.responseObject.paymentTransactions);
                    this.bulkdata = res.responseObject.paymentTransactions;
                } else {
                    this.toast.show(
                        this.translateService.instant(
                            'Failed to fetch transaction list'
                        ),
                        '',
                        MessageBoxType.DANGER,
                        5000, undefined, undefined, false
                    );

                    return;
                }
            });
    }

    getBulkCharges() {
        if (this.transactionData.length > 0) {
            for (let index = 0; index < this.transactionData.length; index++) {
                if (!this.payloadCharges.BeneficiaryAccounts.includes(this.transactionData[index].account_Phone)) {
                    this.payloadCharges.BeneficiaryAccounts.push(this.transactionData[index].account_Phone)
                }
            }
            this.payloadCharges.SuspenseAccount = this.suspenseAccount.suspenseAccount;
            this.payloadCharges.Currency = 'KES';
        } else {
            for (let index = 0; index < this.transactionPayload.length; index++) {
                if (!this.payloadCharges.BeneficiaryAccounts.includes(this.transactionPayload[index].account_Phone)) {
                    this.payloadCharges.BeneficiaryAccounts.push(this.transactionPayload[index].account_Phone
                    );
                }
            }


            this.payloadCharges.SuspenseAccount = this.transactionPayload[0].suspenseAccount;
            this.payloadCharges.Currency = this.transactionPayload[0].currency;
        }


        const errorAccounts = this.bulkSalary.filter(account => account.validation);

        const chargesAccounts = this.payloadCharges.BeneficiaryAccounts.filter((account: any) =>
            errorAccounts.map(_mapAccount => _mapAccount.account_Phone)!.includes(account)
        );

        if (errorAccounts.length !== 0) {
            this.toast.show(
                'Message',
                `${chargesAccounts.length}/${this.bulkSalary.length}
                ${this.translateService.instant('BULK-TRANFER.WILL-BE-CHARGED')}`,
                MessageBoxType.WARNING,
                5000, undefined, undefined, true
            );
        }
        if (chargesAccounts.length === 0) {
            this.toast.show(
                'Message',
                `${chargesAccounts.length}/${this.bulkSalary.length}
                ${this.translateService.instant('BULK-TRANFER.NO-CHARGES-ACCOUNTS')}`,
                MessageBoxType.DANGER,
                5000, undefined, undefined, true
            );
            return;
        }

        //only accounts without errors

        this.payloadCharges.BeneficiaryAccounts = chargesAccounts;

        this.bulkPaymentService.getCharges(this.payloadCharges)
            .pipe(takeUntil(this.destroy$))
            .subscribe((res) => {

                this.charge = res.responseObject;
                this.transactionDetails.totalChargeAmount = res.responseObject.bulkFee;
                this.gotoNext();
            });
    }

    getSelectedAccount($event: any) {
        this.selectedAccount = $event.value;
        this.filteredAccount = this.accounts.filter(
            (account) => account.accountNumber === this.selectedAccount
        );

        if (Number(this.filteredAccount[0].availableBalance) <= 0) {
            this.toast.show(
                this.translateService.instant(
                    'The selected account has insufficient funds, please select another account'
                ),
                '',
                MessageBoxType.DANGER,
                5000, undefined, undefined, false
            );

            this.accountForm.patchValue({account: undefined});
            return;
        }

        this.customerAccount = this.filteredAccount;

        if (this.bulkdata.length > 0 && !this.isFileUploaded) {
            this.confirmChangeAccount($event.value);
        }
    }

    createTicket() {
        const existingTicket = this.ctxManager.currentContextData.ticket;

        if (!existingTicket) {
            this.bulkPaymentService
                .createTicket(this.getCreateTicketPayload())
                .pipe(takeUntil(this.destroy$))
                .subscribe(
                    (response) => {
                        if (response && response.responseObject) {
                            this.ctxManager.patchCurrentContextData({
                                ticket: response.responseObject,
                            });
                        }
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

    getCreateTicketPayload(): CreateTicketPayload {
        return {
            associatedId: uuid(),
            customerId: this.customerDetails?.cif || '',
            customerName: `${this.customerDetails?.firstName} ${this.customerDetails?.lastName}`,
            actionName: this.ctxManager.currentContextData.actionName,
            // this.ctxManager.currentContextData.paymentOption
            // ?.paymentType
            paymentOption: 'singledebit',
            sendersAccountDetails: [
                {
                    accountName: this.accounts[0].accountName || '',
                    accountNumber: this.accounts[0].accountNumber || '',
                    accountCurrency: this.accounts[0].accountCurrency || '',
                    accountStatus: this.accounts[0].accountStatus || '',
                    availableBalance:
                        Number(this.accounts[0].availableBalance) || 0,
                    effectiveBalance: String(this.accounts[0].effectiveBalance || ''),
                },
            ],
        };

        // availableBalance: Number(account.availableBalance || '0'),
        // effectiveBalance: account.effectiveBalance || '',
    }

    getTransactions($event: any) {
        this.accountBalance =
            $event.payload.debitAccountDetails.availableBalance;

        if (this.isFileUploaded) {
            this.toast.show(
                'Info',
                'Please clear transactions first',
                MessageBoxType.WARNING,
                5000, undefined, undefined, false
            );

            return;
        } else {
            this.isFileUploaded = false;
        }

        for (let index = 0; index < this.bulkdata.length; index++) {
            if (
                this.bulkdata[index].account_Phone ==
                $event.payload.account_Phone
            ) {
                this.toast.show(
                    'Info',
                    'This account is already added',
                    MessageBoxType.WARNING,
                    5000, undefined, undefined, false
                );

                return;
            }
        }

        $event.payload.suspenseAccount = this.suspenseAccount.suspenseAccount;
        this.transactionPayload.push($event.payload);
        this.actionName = 'ManualEntry';
        this.addTrans($event.payload);
    }

    confirmChangeAccount(selectedAccount: string): void {
        const dialogRef = this.dialog.open(ChangeAccountComponent, {
            data: {paymentType: 'single', account: this.selectedAccount},
            width: '600px',
            autoFocus: false,
            height: 'auto',
        });

        //updating debit account

        dialogRef.afterClosed()
            .pipe(takeUntil(this.destroy$))
            .subscribe((_result) => {

                if (_result) {
                    for (let index = 0; index < this.bulkdata.length; index++) {
                        this.bulkdata[index].debitAccount = selectedAccount;
                    }

                    this.setTableData(this.bulkdata);
                }
            });
    }

    confirmPayment(): void {
        const dialogRef = this.dialog.open(ConfirmPaymentComponent, {
            data: {paymentType: 'single', account: this.selectedAccount},
            width: '600px',
            autoFocus: false,
            height: 'auto',
        });

        //updating transaction accounts

        dialogRef.afterClosed()
            .pipe(takeUntil(this.destroy$))
            .subscribe((_result) => {

                if (_result) {
                    for (let index = 0; index < this.bulkdata.length; index++) {
                        this.bulkdata[index].account_Phone == this.selectedAccount;
                    }

                    this.setTableData(this.bulkdata);
                }
            });
    }

    addTrans(tableData: []) {
        const existingTicket = this.ctxManager.currentContextData.ticket;

        if (
            (!existingTicket || existingTicket === null) &&
            (this.bulkSalary?.length === 0 ||
                this.bulkSalary?.length === undefined)
        ) {
            this.ctxManager.patchCurrentContextData({
                actionName: 'ManualEntry',
            });

            this.bulkPaymentService
                .createTicket(this.getCreateTicketPayload())
                .pipe(takeUntil(this.destroy$))
                .subscribe(
                    (response) => {
                        if (response && response.responseObject) {
                            if (response.successful) {
                                this.ctxManager.patchCurrentContextData({
                                    ticket: response.responseObject,
                                });

                                this.getTableData(tableData);
                                this.bulkdata.push(tableData);
                            } else {
                                this.toast.show(
                                    this.translateService.instant(
                                        'BULK-TRANFER.ERROR'
                                    ),
                                    'Error occured',
                                    MessageBoxType.DANGER,
                                    5000, undefined, undefined, false
                                );
                            }
                        }
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
        } else if (existingTicket && this.bulkSalary?.length === 0) {
            if (
                this.ctxManager.currentContextData?.actionName ===
                'fileUpload'
            ) {
                this.ctxManager.patchCurrentContextData({
                    actionName: 'ManualEntry',
                });

                this.bulkPaymentService
                    .createTicket(this.getCreateTicketPayload())
                    .pipe(takeUntil(this.destroy$))
                    .subscribe(
                        (response) => {
                            if (response.successful) {
                                this.ctxManager.patchCurrentContextData({
                                    ticket: response.responseObject,
                                });

                                this.getTableData(tableData);
                                this.bulkdata.push(tableData);
                            } else {
                                this.toast.show(
                                    this.translateService.instant(
                                        'BULK-TRANFER.ERROR'
                                    ),
                                    'Error occured',
                                    MessageBoxType.DANGER,
                                    5000, undefined, undefined, false
                                );
                            }
                        },
                        (err: any) => {
                            this.toast.show(
                                this.translateService.instant(
                                    'BULK-TRANFER.ERROR'
                                ),
                                err,
                                MessageBoxType.DANGER,
                                5000, undefined, undefined, false
                            );
                        }
                    );
            } else {
                this.getTableData(tableData);
                this.bulkdata.push(tableData);
            }
        } else if (existingTicket && this.bulkSalary?.length > 0) {
            this.getTableData(tableData);
            this.bulkdata.push(tableData);
        }
    }

    setTableData(tableData: DataSource[]) {
        if (tableData.length > 0) {
            this.enableSubmit = false;
            const sum = tableData.filter(item => item.validation)
                .reduce(function (accum, item) {
                    return accum + Number(item.amount);
                }, 0);

            this.setAmount(sum);
            this.totalAmount[0] = {
                ...{
                    total: sum,
                    currency: 'KES',
                    icon: 'ic-shilling',
                    charge: 0,
                },
            };
        } else {
            this.enableSubmit = true;
            this.totalAmount = [];
        }

        setTimeout(() => {
            this.dataSource = new MatTableDataSource(tableData);
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
        }, 0);
    }

    setAmount(totalData: number) {
        this.transactionDetails.paymentOption = 'single';
        this.transactionDetails.totalTransanctionAmount = totalData;
        this.transactionDetails.totalChargeAmount = 0;
        this.transactionDetails.accountCurrency =
            this.accountNumbers[0].accountCurrency;
        this.onAmount.emit(this.transactionDetails);
    }

    updateTransaction(value: any, action: Boolean) {
        let element;
        for (let index = 0; index < this.bulkdata.length; index++) {
            if (this.bulkdata[index].account_Phone == value.account_Phone) {
                element = this.bulkdata[index];
                break;
            }
        }

        const dialogRef = this.dialog.open(UpdateTransactionComponent, {
            data: {element, action},
            width: '1080px',
            autoFocus: false,
            height: 'auto',
        });

        dialogRef.afterClosed()
            .pipe(takeUntil(this.destroy$))
            .subscribe((_result) => {
                if (_result.value) {

                    for (let index = 0; index < this.bulkdata.length; index++) {
                        if (
                            this.bulkdata[index].account_Phone ==
                            _result.account_Phone
                        ) {
                            this.bulkdata[index] = _result;
                        }
                    }

                    this.setTableData(this.bulkdata);
                }
            });
    }

    removeTransaction(value: any, action: Boolean) {

        let element;
        for (let index = 0; index < this.bulkdata.length; index++) {
            if (this.bulkdata[index].account_Phone == value.account_Phone) {
                element = this.bulkdata[index];
                break;
            }
        }

        const dialogRef = this.dialog.open(RemoveTransactionComponent, {
            data: {element, action},
            width: '1080px',
            autoFocus: false,
            height: 'auto',
        });

        dialogRef.afterClosed()
            .pipe(takeUntil(this.destroy$))
            .subscribe((_result) => {

                if (_result.value) {

                    for (let index = 0; index < this.bulkdata.length; index++) {
                        if (
                            this.bulkdata[index].account_Phone ==
                            _result.account_Phone
                        ) {
                            this.bulkdata.splice(index, 1);
                        }
                    }

                    for (
                        let index = 0;
                        index < this.transactionPayload.length;
                        index++
                    ) {
                        if (
                            this.transactionPayload[index].account_Phone ==
                            _result.account_Phone
                        ) {
                            this.transactionPayload.splice(index, 1);
                        }
                    }

                    if (this.bulkdata.length > 0) this.setTableData(this.bulkdata);
                    else {
                        this.bulkSalary = [];
                        this.setTableData([]);
                        this.transactionPayload = [];
                    }

                    this.toast.show(
                        this.translateService.instant('BULK-TRANFER.SUCCESS'),
                        this.translateService.instant(
                            'BULK-TRANFER.TRANSACTION-REMOVED'
                        ),
                        MessageBoxType.SUCCESS,
                        5000, undefined, undefined, true
                    );
                }
            });
    }

    uploadDoc(event: any) {
        if (
            this.filteredAccount === undefined &&
            this.paymentType === 'single'
        ) {
            this.toast.show(
                this.translateService.instant('Please select the account'),
                '',
                MessageBoxType.DANGER,
                5000, undefined, undefined, false
            );

            return;
        }
        const existingTicket = this.ctxManager.currentContextData.ticket;

        if (
            (!existingTicket || existingTicket === null) &&
            (this.bulkSalary?.length === 0 ||
                this.bulkSalary?.length === undefined)
        ) {
            this.ctxManager.patchCurrentContextData({
                actionName: 'fileUpload',
            });

            this.bulkPaymentService
                .createTicket(this.getCreateTicketPayload())
                .pipe(takeUntil(this.destroy$))
                .subscribe(
                    (response) => {
                        if (response && response.responseObject) {
                            this.ctxManager.patchCurrentContextData({
                                ticket: response.responseObject,
                            });
                        }

                        this.uploadListener(event);
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
        } else if (existingTicket && this.bulkSalary?.length === 0) {
            if (
                this.ctxManager.currentContextData?.actionName ===
                'ManualEntry'
            ) {
                this.ctxManager.patchCurrentContextData({
                    actionName: 'fileUpload',
                });

                this.bulkPaymentService
                    .createTicket(this.getCreateTicketPayload())
                    .pipe(takeUntil(this.destroy$))
                    .subscribe(
                        (response) => {
                            if (response && response.responseObject) {
                                this.ctxManager.patchCurrentContextData({
                                    ticket: response.responseObject,
                                });
                            }

                            this.uploadListener(event);
                        },
                        (err: any) => {
                            this.toast.show(
                                this.translateService.instant(
                                    'BULK-TRANFER.ERROR'
                                ),
                                err,
                                MessageBoxType.DANGER,
                                5000, undefined, undefined, false
                            );
                        }
                    );
            } else {
                this.uploadListener(event);
            }
        }
    }

    filesDropped(files: any) {
        const existingTicket = this.ctxManager.currentContextData.ticket;

        if (
            this.filteredAccount === undefined &&
            this.paymentType === 'single'
        ) {
            this.toast.show(
                this.translateService.instant('Please select the account'),
                '',
                MessageBoxType.DANGER,
                5000, undefined, undefined, false
            );

            return;
        }

        if (this.filteredAccount.length > 0)
            this.ctxManager.patchCurrentContextData({
                actionName: 'fileUpload',
            });

        if (!existingTicket) {
            this.bulkPaymentService
                .createTicket(this.getCreateTicketPayload())
                .pipe(takeUntil(this.destroy$))
                .subscribe(
                    (response) => {
                        if (response && response.responseObject) {
                            this.ctxManager.patchCurrentContextData({
                                ticket: response.responseObject,
                            });
                        }

                        if (files[0].size > 1024000) {
                            return;
                        }

                        if (
                            files[0].type ===
                            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                        ) {
                            this.uploadListener({
                                target: {
                                    files,
                                },
                            });
                        } else {
                            this.toast.show(
                                this.translateService.instant(
                                    'BULK-TRANFER.ERROR'
                                ),
                                this.translateService.instant(
                                    'BULK-TRANFER.DRAG-XLSX'
                                ),

                                MessageBoxType.DANGER,
                                5000, undefined, undefined, true
                            );
                        }
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

    toBase64 = (file: any) =>
        new Promise<any>((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result?.toString());
            reader.onerror = (error) => reject(error);
        });

    async uploadListener(event: any) {
        this.xlsxFile = event.target.files[0] ?? null;
        let ticketId = this.ctxManager.currentContextData.ticket?.id;
        if (ticketId) {
            if (this.xlsxFile) {
                const base64 = await this.toBase64(this.xlsxFile);
                const payload: UploadDoc = {
                    file: base64.replace(
                        'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,',
                        ''
                    ),
                    sendersDetails: {
                        accountName: this.filteredAccount[0].accountName || '',
                        accountNumber:
                            this.filteredAccount[0].accountNumber || '',
                        accountCurrency:
                            this.filteredAccount[0].accountCurrency || '',
                        accountStatus:
                            this.filteredAccount[0].accountStatus || '',
                        availableBalance:
                            Number(this.filteredAccount[0].availableBalance) ||
                            0,
                        effectiveBalance:
                            String(this.filteredAccount[0].effectiveBalance || ''),
                    },
                };

                this.bulkPaymentService
                    .uploadDocuments(payload, ticketId)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe(
                        (res) => {
                            if (
                                res.responseObject !== '' &&
                                res.successful !== false
                            ) {
                                this.getTransactonList();
                                this.isFileUploaded = true;
                            } else {
                                this.toast.show(
                                    this.translateService.instant(
                                        'BULK-TRANFER.ERROR'
                                    ),
                                    res.statusMessage,
                                    MessageBoxType.DANGER,
                                    5000, undefined, undefined, false
                                );
                            }
                        },
                        (err: any) => {
                            // this.toast.show(
                            //     this.translateService.instant(
                            //         'BULK-TRANFER.ERROR'
                            //     ),
                            //     err,
                            //     MessageBoxType.DANGER
                            // );
                        }
                    );
            } else {
                this.toast.show(
                    this.translateService.instant('BULK-TRANFER.ERROR'),
                    this.translateService.instant('BULK-TRANFER.UPLOAD-XLSX'),
                    MessageBoxType.DANGER,
                    5000, undefined, undefined, true
                );
            }
        }
    }

    getHeaderArray(xlsxRecordsArr: string[]) {
        let headers = (<string>xlsxRecordsArr[0]).match(/(".*?"|[^,])+/g) || [];
        let headerArray = [];
        for (let j = 0; j < headers.length; j++) {
            headerArray.push(headers[j]);
        }
        return headerArray;
    }

    getDataRecordsArrayFromxlsxFile(xlsxRecordsArray: any, headerLength: any) {
        let xlsxArr = [];

        for (let i = 1; i < xlsxRecordsArray.length; i++) {
            let currentRow =
                (<string>xlsxRecordsArray[i]).match(/(".*?"|[^,])+/g) || [];

            // demo purpose, to be removed during integration
            const dummyValidation = this.validateRow(currentRow);
            if (currentRow.length == headerLength) {
                const recordsForView: Omit<DataSource, 'validationErrors'> = {
                    beneficiaryName: currentRow[1].trim(),
                    bank_Operator: currentRow[2].trim(),
                    account_Phone: currentRow[3].trim(),
                    debitAccount: currentRow[4].trim(),
                    currency: currentRow[5].trim(),
                    amount: this.cleanUpAmount(currentRow[6].trim()),
                    paymentReason: currentRow[7].trim(),
                    naration: dummyValidation ? 'Naration' : '',
                    validation: dummyValidation,
                };

                const xlsxRecord: DataSource = {
                    ...recordsForView,
                    validationErrors: this.getValidationErrors(recordsForView),
                };
                xlsxArr.push(xlsxRecord);
            }
        }

        return xlsxArr;
    }

    onMatSortChange(event: any) {
    }

    clearTransactions() {
        this.bulkSalary = [];
        this.bulkdata = [];
        this.totalAmount = [];
        this.setTableData([]);
        this.isFileUploaded = false;

        if (this.actionName === 'fileUpload') {
            let ticketId = this.ctxManager.currentContextData.ticket?.id;

            this.bulkPaymentService
                .clearTransactions(ticketId)
                .pipe(takeUntil(this.destroy$))
                .subscribe((res) => {
                    this.ctxManager.patchCurrentContextData({
                        ticket: null,
                    });
                });
        }
    }

    cleanUpAmount(amount: string) {
        if (amount.startsWith(`"`) && amount.endsWith(`"`)) {
            return amount.substring(1, amount.length - 1);
        }

        return amount;
    }

    validateRow(row: any): boolean {
        const sample = (arr: any) =>
            arr[Math.floor(Math.random() * arr.length)];
        return sample([true, false]);
    }

    getValidationErrors(
        row: Omit<DataSource, 'validationErrors'>
    ): ValidationError[] {
        if (!row.naration) {
            return [
                {
                    title: this.translateService.instant(
                        'BULK-TRANFER.MISSING-NARATION'
                    ),
                    description: this.translateService.instant(
                        'BULK-TRANFER.MISSING-NARATION-DESCR'
                    ),
                },
            ];
        }

        if (!row.beneficiaryName) {
            return [
                {
                    title: this.translateService.instant(
                        'BULK-TRANFER.MISSING-BENEFICIARY'
                    ),
                    description: this.translateService.instant(
                        'BULK-TRANFER.MISSING-BENEFICIARY-DESCR'
                    ),
                },
            ];
        }

        if (!row.bank_Operator) {
            return [
                {
                    title: this.translateService.instant(
                        'BULK-TRANFER.MISSING-BANK'
                    ),
                    description: this.translateService.instant(
                        'BULK-TRANFER.MISSING-BANK-DESCR'
                    ),
                },
            ];
        }

        if (!row.account_Phone) {
            return [
                {
                    title: this.translateService.instant(
                        'BULK-TRANFER.MISSING-ACCOUNT'
                    ),
                    description: this.translateService.instant(
                        'BULK-TRANFER.MISSING-ACCOUNT-DESCR'
                    ),
                },
            ];
        }

        if (!row.debitAccount) {
            return [
                {
                    title: this.translateService.instant(
                        'BULK-TRANFER.MISSING-DEBIT'
                    ),
                    description: this.translateService.instant(
                        'BULK-TRANFER.MISSING-DEBIT-DESCR'
                    ),
                },
            ];
        }

        if (!row.currency) {
            return [
                {
                    title: this.translateService.instant(
                        'BULK-TRANFER.MISSING-CURRENCY'
                    ),
                    description: this.translateService.instant(
                        'BULK-TRANFER.MISSING-CURRENCY-DESCR'
                    ),
                },
            ];
        }

        if (!row.amount) {
            return [
                {
                    title: this.translateService.instant(
                        'BULK-TRANFER.MISSING-AMOUNT'
                    ),
                    description: this.translateService.instant(
                        'BULK-TRANFER.MISSING-AMOUNT-DESCR'
                    ),
                },
            ];
        }

        if (!row.paymentReason) {
            return [
                {
                    title: this.translateService.instant(
                        'BULK-TRANFER.MISSING-PAYMENT'
                    ),
                    description: this.translateService.instant(
                        'BULK-TRANFER.MISSING-PAYMENT-DESCR'
                    ),
                },
            ];
        }

        return [];
    }

    checkErrors(bulkPayment: PaymentTransactions) {
        this.onDocumentError.emit(
            !!bulkPayment.find((transaction) => transaction.isValid === false)
        );
    }

    onSave(): void {
        if (Number(this.totalAmount[0].total) > Number(this.accountBalance)) {
            this.toast.show(
                this.translateService.instant(
                    'The account has insufficient funds for this transaction, please select another account'
                ),
                '',
                MessageBoxType.DANGER,
                5000, undefined, undefined, false
            );
            return;
        }

        if (this.transactionError) {
            this.openConfirmDialogWhenTransactionHasErrors();
            return;
        }

        this.finishStepAction();
        // if (this.actionName === 'fileUpload') this.getBulkCharges();
        // else {
        //     if (!this.enableSubmit) {
        //         const ticketId =
        //             this.ctxManager.currentContextData?.ticket?.id;

        //         this.ctxManager.patchCurrentContextData({
        //             transactionPayload: this.transactionPayload,
        //         });
        //         this.getBulkCharges();
        //     } else return;
        //     // this.confirmPayment();
        // }
    }

    ngOnDestroy(): void {
        localStorage.removeItem('context');
        this.destroy$.next('');
        this.destroy$.complete();
    }

    private openConfirmDialogWhenTransactionHasErrors() {


        const dialogRef = this.dialog.open(DialogConfirmComponent, {
            width: '600px',
            height: 'auto',
            data: {
                title: 'BULK-TRANFER.SUBMIT-PAYMENTS',
                pillText: "BULK-TRANFER.PAYMENTS-ERRORS",
                bodyDescription: `${this.translateService.instant('BULK-TRANFER.PAYMENTS-ERRORS-TITLE')}`,
                cancelButtonLabel: 'COMMON.CANCEL',
                confirmButtonLabel: 'COMMON.CONFIRM'
            }
        });

        dialogRef.afterClosed()
            .pipe(takeUntil(this.destroy$))
            .subscribe((option: boolean) => {
                if (option) {
                    this.finishStepAction();
                }
            });
    }

    private finishStepAction() {
        if (this.actionName === 'fileUpload') this.getBulkCharges();
        else {
            if (!this.enableSubmit) {
                const ticketId = this.ctxManager.currentContextData?.ticket?.id;
                this.ctxManager.patchCurrentContextData({
                    transactionPayload: this.transactionPayload
                });
                this.getBulkCharges();
            } else return;
            // this.confirmPayment();
        }
    }
}

interface DataSource {
    beneficiaryName: string;
    bank_Operator: string;
    account_Phone: string;
    debitAccount: string;
    currency: string;
    amount: string;
    paymentReason: string;
    naration: string;
    validation: boolean;
    validationErrors: ValidationError[];
}

interface ValidationError {
    title: string;
    description: string;
}

interface SuspenseAccount {
    suspenseAccount: string;
}
