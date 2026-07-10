import { DatePipe, DecimalPipe } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { combineLatest, Observable, Subject } from 'rxjs';
import {
  debounceTime,
  filter,
  map,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs/operators';
import { AccountManagementService } from '@app/core/services/account-management/account-management.service';
import { AccountService } from '@app/core/services/account/account.service';
import { IUser } from '@app/core/services/auth/auth-model';
import { AuthService } from '@app/core/services/auth/auth.service';
import { DataStoreService } from '@app/core/services/data-store/data-store.service';
import { MoveMoneyService } from '@app/core/services/move-money/move-money.service';
import { VerifyBioDialogComponent } from '@app/shared/components/verify-bio-dialog/verify-bio-dialog.component';
import { VerifySignatoryBioDialogComponent } from '@app/shared/components/verify-signatory-bio-dialog/verify-signatory-bio-dialog.component';
import { VerifySignatoryDialogComponent } from '@app/shared/components/verify-signatory-dialog/verify-signatory-dialog.component';
import { VerifySkipBioComponent } from '@app/shared/components/verify-skip-bio/verify-skip-bio.component';
import { MessageBoxType, ToastService } from '@app/shared/modules/toast';
import { v4 as uuid } from 'uuid';
import {
  Account,
  AccountResponse,
  IAccMngtObj,
  IFundsTransferFromData,
  ITransferTypeObject,
  MoveMoneyPayload,
  TransferType,
} from './funds-transfer.model';
import { ReviewComponent } from './review/review.component';
import { MatDialog } from '@angular/material/dialog';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { CurrencyMaskModule } from 'ng2-currency-mask';
import { SupportingDocumentsComponent } from './supporting-documents/supporting-documents.component';

@Component({
  selector: 'app-funds-transfer',
  templateUrl: './funds-transfer.component.html',
  styleUrls: ['./funds-transfer.component.scss'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TranslatePipe,
    DecimalPipe,
    DatePipe,
    MatToolbarModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    CurrencyMaskModule,
    SupportingDocumentsComponent,
  ],
})
export class FundsTransferComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  viewType = 'Maker';
  currentUser!: IUser;
  currentCustomer: IAccMngtObj = JSON.parse(
    <string>localStorage.getItem('accMgntObj')
  );
  remittanceAccounts: Account[] = [];
  beneficiaryAccounts: Account[] = [];

  remittanceAccount: Account = {};
  beneficiaryAccount: Account = {};

  panelOpenState = true;
  isVerified = false;
  isDebit = false;

  filteredOwnAccounts: any;
  transferType: ITransferTypeObject[] = [];
  beneficiaryVerified = false;
  paymentDetailsVerified = false;
  instrumentVerified = false;
  sendToOwnAccount = false;
  sendToOtherAccount = false;
  beneficiaryAccountLoading = false;
  supportDocumentsRequired = false;
  availableBalance = '';
  availableBalanceCurrency = '';
  currencies = ['KES'];
  maxDate: Date;
  minDate: Date;
  instrumentTypes = [
    // { id: 'Passport', value: 'MOVE-MONEY.PASSPORT' },
    // { id: 'ID', value: 'MOVE-MONEY.ID' },
    { id: 'CHQ', value: 'MOVE-MONEY.CHQ' },
    { id: 'ICH', value: 'MOVE-MONEY.ICH' },
  ];

  showSupportDocuments = false;
  ownAccounts: any = [];
  parentForm!: UntypedFormGroup;
  documents: any;
  private fingerprintAccepted = false;
  private ticket: any;
  private isReturned = false;
  private countryCode = '';
  private countryCodes: { bankId: string; countryCode: string }[] = [
    { bankId: '11', countryCode: 'SS' },
    { bankId: '43', countryCode: 'CD' },
    { bankId: '50', countryCode: 'RW' },
    { bankId: '54', countryCode: 'KE' },
    { bankId: '55', countryCode: 'TZ' },
    { bankId: '56', countryCode: 'UG' },
  ];
  private destroy$ = new Subject();
  private isActiveWithSelfMandate = (v: any) =>
    v.accountStatus === 'A' && v.mandate === 'SELF';
  treasuryRate: any = '';
  activeAccounts: any;
  customerData: any = JSON.parse(
    <string>localStorage.getItem('customerDetails')
  );
  ticketId: any;

  constructor(
    private authService: AuthService,
    private formBuilder: UntypedFormBuilder,
    private dialog: MatDialog,
    private router: Router,
    private accountManagementService: AccountManagementService,
    private accountService: AccountService,
    private toastService: ToastService,
    private moveMoneyService: MoveMoneyService,
    private datePipe: DatePipe,
    private decimalPipe: DecimalPipe,
    private translate: TranslateService,
    private dataStoreService: DataStoreService
  ) {
    this.currentUser = this.authService.currentUser;
    this.minDate = new Date(2000, 0, 1);
    this.maxDate = new Date();
  }

  public ngOnInit(): void {
    this.parentForm = this.formBuilder.group({
      transactionDetailsForm: this.formBuilder.group({
        associatedId: [uuid(), [Validators.required]],
        transactionType: ['MoveMoney', Validators.required],
        transferType: [null, Validators.required],
        account: [null, Validators.required],
        fee: [''],
        sms: [''],
        email: [''],
        skipBio: [false],
      }),
      beneficiaryDetailsForm: this.formBuilder.group({
        beneficiaryAccount: [
          null,
          [Validators.required, Validators.minLength(10)],
        ],
        recepientName: ['', [Validators.required]],
      }),
      paymentDetailsForm: this.formBuilder.group({
        amountToSend: ['', Validators.required],
        paymentReason: [null, [Validators.required, Validators.minLength(4)]],
        paymentCurrency: [null, Validators.required],
      }),
      exchangeRateForm: this.formBuilder.group({
        rateCode: null,
        exchangeRate: null,
        baseExchangeRate: null,
        convertedCurrency: null,
        convertedAmount: null,
        ticketNumber: [{ value: null, disabled: true }],
      }),
      instrumentForm: this.formBuilder.group({
        instrumentType: null,
        instrumentNumber: null,
        instrumentDate: null,
      }),
    });
    this.transferType = [
      { value: TransferType.OWNACCOUNT, name: 'MOVE-MONEY.OWNACCOUNT' },
      {
        value: TransferType.EQUITYACCOUNT,
        name: 'MOVE-MONEY.EQUITYACCOUNT',
      },
      { value: TransferType.OTHERBANK, name: 'MOVE-MONEY.OTHERBANK' },
    ];
    this.activeAccounts =
      this.accountManagementService.getCustomerAccountsWhere(
        this.isActiveWithSelfMandate
      );
    if (this.dataStoreService.getData('ticket-details')) {
      this.ticket = this.dataStoreService.getData('ticket-details');
      this.isReturned = true;
      this.activeAccounts =
        this.accountManagementService.getCustomerAccountsWhere(
          this.isActiveWithSelfMandate
        );
    }
  }

  ngAfterViewInit() {
    this.countryCode = <string>(
      this.countryCodes.find(
        code => +code.bankId === +this.currentCustomer.bankID
      )?.countryCode
    );

    const paymentChanges = combineLatest([
      this.paymentDetailsForm.controls['paymentCurrency'].valueChanges,
      this.paymentDetailsForm.controls['amountToSend'].valueChanges.pipe(
        debounceTime(500)
      ),
      this.beneficiaryDetailsForm.controls['beneficiaryAccount'].valueChanges,
    ])
      .pipe(
        filter(data => {
          const [paymentCurrency, amountToSend, beneficiaryAccount] = data;
          // only emit when i have the 3 values
          return paymentCurrency && amountToSend && beneficiaryAccount;
        }),

        takeUntil(this.destroy$)
      )
      .subscribe(([paymentCurrency, amountToSend, beneficiaryAccount]) => {
        this.getExchangeRates();
      });

    const instrumentChanges = combineLatest([
      this.instrumentForm.controls['instrumentNumber'].valueChanges.pipe(
        debounceTime(2500)
      ),
      this.instrumentForm.controls['instrumentDate'].valueChanges,
      this.instrumentForm.controls['instrumentType'].valueChanges,
    ])
      .pipe(
        filter(data => {
          const [instrumentNumber, instrumentDate, instrumentType] = data;
          // only emit when i have the 3 values
          return instrumentNumber && instrumentDate && instrumentType;
        }),

        takeUntil(this.destroy$)
      )
      .subscribe(values => this.validateInstrumentNumber(values));

    const applySpecialRate = combineLatest([
      this.transactionDetailsForm.controls['account'].valueChanges,
      this.paymentDetailsForm.controls['paymentCurrency'].valueChanges,
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.canApplySpecialRate());
  }

  // CREATE INSTANCES OF FORMS
  get transactionDetailsForm() {
    return this.parentForm.get('transactionDetailsForm') as UntypedFormGroup;
  }

  get paymentDetailsForm() {
    return this.parentForm.get('paymentDetailsForm') as UntypedFormGroup;
  }

  get beneficiaryDetailsForm() {
    return this.parentForm.get('beneficiaryDetailsForm') as UntypedFormGroup;
  }

  get exchangeRateForm() {
    return this.parentForm.get('exchangeRateForm') as UntypedFormGroup;
  }

  get instrumentForm() {
    return this.parentForm.get('instrumentForm') as UntypedFormGroup;
  }

  onTransferTypeChange(val: any) {
    this.availableBalance = '';
    this.paymentDetailsForm.reset();
    this.beneficiaryDetailsForm.reset();
    this.exchangeRateForm.reset();
    this.transactionDetailsForm.get('account')?.setValue('');

    this.remittanceAccounts =
      this.accountManagementService.getCustomerAccountsWhere(
        this.isActiveWithSelfMandate
      );

    if (val === TransferType.OWNACCOUNT) {
      this.sendToOwnAccount = true;
      this.sendToOtherAccount = false;

      this.setCurrencies();
    } else if (val == TransferType.EQUITYACCOUNT) {
      this.sendToOtherAccount = true;
      this.sendToOwnAccount = false;
      this.validateBeneficiaryAccountNumber();
    } else if (val === TransferType.OTHERBANK) {
      // this.account = [
      //     { number: '6728219043(KES)' },
      //     { number: '6748193403(KES)' }];
    }
  }

  validateBeneficiaryAccountNumber() {
    const beneficiaryAccount = this.beneficiaryDetailsForm.get(
      'beneficiaryAccount'
    ) as UntypedFormControl;

    beneficiaryAccount.valueChanges
      .pipe(
        debounceTime(1000),
        filter(
          (accoutNumber: string) =>
            !!accoutNumber && !!accoutNumber.length && accoutNumber.length >= 13
        ),
        takeUntil(this.destroy$)
      )
      .subscribe(accountNumber => {
        const type: TransferType =
          this.transactionDetailsForm.get('transferType')?.value;

        if (accountNumber) {
          switch (type) {
            case TransferType.OWNACCOUNT:
              this.setDestinationAccountData(accountNumber);
              break;
            case TransferType.EQUITYACCOUNT:
              this.searchCustomerByAccNo(accountNumber);
              break;
            default:
              break;
          }
        }
      });
  }

  public validateOwnAccount(account: any): void {
    const beneficiary = this.remittanceAccounts.find(
      accout => accout.accountNumber === account
    );
    if (beneficiary) {
      this.beneficiaryAccount = beneficiary;
    }

    this.beneficiaryDetailsForm.controls['recepientName'].setValue(
      beneficiary?.accountName
    );
    this.setCurrencies();
    this.beneficiaryVerified = true;
  }

  fetchBeneficiaryAccount() {
    if (this.parentForm.controls['beneficiaryDetailsForm'].valid) {
      this.beneficiaryVerified = true;
      return;
    }
  }

  checkAmountToSend = () => {
    this.exchangeRateForm.patchValue({
      ticketNumber: '',
    });
    const amountToSend = this.paymentDetailsForm.get('amountToSend')?.value;
    const paymentCurrency =
      this.paymentDetailsForm.get('paymentCurrency')?.value;

    if (
      (amountToSend >= 1000000 && paymentCurrency === 'KES') ||
      (amountToSend >= 10000 && paymentCurrency === 'USD') ||
      (amountToSend >= 10000 && paymentCurrency === 'GBP') ||
      (amountToSend >= 10000 && paymentCurrency === 'EUR') ||
      (amountToSend >= 10000 && paymentCurrency === 'GB')
    ) {
      this.supportDocumentsRequired = true;
    } else {
      this.supportDocumentsRequired = false;
    }
  };

  updateAmountToSend = () => {
    this.paymentDetailsForm.patchValue({
      amountToSend: '',
      paymentReason: '',
    });
  };

  verifyAccount(sourceAcc: any): void {
    if (sourceAcc) {
      const accountObj: any =
        this.remittanceAccounts.find(
          (account: any) => account.accountNumber === sourceAcc
        ) || {};
      this.availableBalance = accountObj.availableBalance;
      this.availableBalanceCurrency = accountObj.accountCurrency;
      this.isVerified = true;
      this.remittanceAccount =
        this.remittanceAccounts.find(
          (account: any) => account.accountNumber === sourceAcc
        ) || {};
      this.filteredOwnAccounts = this.remittanceAccounts.filter(
        (account: any) => account.accountNumber !== sourceAcc
      );
      this.beneficiaryDetailsForm.get('beneficiaryAccount')?.setValue('');
      this.setCurrencies();
    }
  }

  private setReview() {
    const dialogRef = this.dialog.open(ReviewComponent, {
      data: {
        currentCustomer: this.currentCustomer,
        senderCurrency: this.availableBalanceCurrency,
        ...this.parentForm.value,
      },
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result && result.stop === true) {
          return;
        }

        this.transactionDetailsForm.controls['sms'].setValue(result.sms);
        this.transactionDetailsForm.controls['email'].setValue(result.email);

        const fee = this.transactionDetailsForm.controls['fee'].value;
        if (this.checkCustomersAccAvailableBalance(fee)) {
          this.checkAmountAndCreateTicket();
        }
      });
  }

  checkNextStep = () => {
    this.getTransferFees().subscribe(
      res => {
        this.transactionDetailsForm.controls['fee'].setValue(res.responseObject);

                if (!this.supportDocumentsRequired) {
                    this.setReview();
                } else {
                    if (this.showSupportDocuments) {
                        this.setReview();
                    }
                    this.showSupportDocuments = true;
                }
            },
            (err) => {
                this.toastService.show('Info', err, MessageBoxType.DANGER,
                    5000, undefined, undefined, false
                );
            }
        );
    };

  goBack = () => {
    this.showSupportDocuments = false;
  };

  goToOverview = () => {
    this.router.navigateByUrl('/services/customer-360');
  };

  uploadsDocuments(documents: any) {
    this.documents = documents;
  }

  private uploadAndSubmitDocs(ticketId: string) {
    const data = {
      CIF: this.currentCustomer.cif,
      AccountNumber: this.remittanceAccount.accountNumber,
      Country: this.countryCode,
      ticketNumber: '' + ticketId,
      idType: 'CustomerId',
      Service: 'NewGenSwift',
      documents: this.documents,
    };

    this.moveMoneyService.uploadTransactionDocuments(data).subscribe(
      docRes => {
        if (docRes.successful && docRes.responseObject) {
          const docs = docRes.responseObject;
          const isErrorFile = docs.some((doc: any) => !doc.success);

                    if (isErrorFile) {
                        docs.forEach((doc: any) => {
                            if (!doc.success) {
                                this.toastService.show(
                                    'Error',
                                    `Failed to upload ${doc.filename}. Reason: ${doc.message}`,
                                    MessageBoxType.DANGER,
                                    5000, undefined, undefined, false
                                );
                            }
                        });

            return;
          }

          if (this.documents.length > 0) {
            //   this.toastService.show(
            //     `Documents uploaded successfully!`,
            //     `Documents uploaded successfully!`  ,
            //     MessageBoxType.SUCCESS
            // )
            this.completeTicketDocuments(ticketId);
          }
        }
      },
      docErr => console.log(docErr)
    );
  }

    private completeTicketDocuments(ticketId: any) {
        this.moveMoneyService
            .submitTransactionDocuments(ticketId, {})
            .subscribe(
                (res) => {
                    if (res.successful) {
                        this.toastService.show(
                            `Documents submitted to ticket successfully!`,
                            `Documents submitted to ticket successfully!`,
                            MessageBoxType.SUCCESS,
                            5000, undefined, undefined, false
                        );

          this.submitTicketData(ticketId, this.parentForm.value);
          //this.checkAndVeribyBioModal(ticketId);
        }
      },
      err => {}
    );
  }

  private setDestinationAccountData = (accountNumber: string) => {
    const destinationAccount = this.beneficiaryAccounts.find(
      (account: any) => account.accountNumber === accountNumber
    );

    this.beneficiaryDetailsForm.patchValue(
      {
        recepientName: destinationAccount ? destinationAccount.accountName : '',
      },
      { emitEvent: false }
    );
    this.setCurrencies();
  };

  private getCustomerAccounts(cif: string): Observable<any> {
    const query = `?Id=${cif}&bankId=${this.currentUser.bankId}&idType=customerid`;
    return this.accountService.getAccount(query);
  }

    private getActiveAccounts(cif: string) {
        const query = `?Id=${cif}&bankId=${this.currentUser.bankId}&idType=customerid`;
        this.accountService.getAccount(query).subscribe(
            (res: any) => {
                if (res.successful && res.responseObject) {
                    const customer = res.responseObject;
                    this.activeAccounts = customer.accounts?.filter(
                        this.isActiveWithSelfMandate
                    );
                }
            },
            (err) => {
                this.toastService.show('Error', err, MessageBoxType.DANGER,
                    5000, undefined, undefined, false
                );
            }
        );
    }

  private searchCustomerByAccNo(accountNumber: string) {
    this.toastService.dismissed();
    this.beneficiaryDetailsForm
      .get('recepientName')
      ?.setValue('', { emitEvent: false, onlySelf: true });

    const query = `?Id=${accountNumber}&bankId=${this.currentUser.bankId}&idType=accountid`;

        this.accountService
            .getAccount(query)
            .pipe(
                tap((beneficiaryAccountResponse: AccountResponse) => {
                    //if user not found
                    if (
                        beneficiaryAccountResponse.successful &&
                        beneficiaryAccountResponse.responseObject === null
                    ) {
                        this.toastService.show(
                            'Info',
                            'Beneficiary account not found',
                            MessageBoxType.DANGER,
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
                            (beneficiaryAccountResponse: AccountResponse) =>
                                beneficiaryAccountResponse
                        )
                    );
                }),

        takeUntil(this.destroy$)
      )
      .subscribe(
        res => {
          if (res.successful && res.responseObject) {
            const beneficiary = res.responseObject;

            this.beneficiaryAccount =
              beneficiary.accounts.find(
                v =>
                  v.accountStatus === 'A' && v.accountNumber === accountNumber
              ) || {};
            if (this.beneficiaryAccount) {
              this.setCurrencies();

                            this.beneficiaryDetailsForm.patchValue(
                                {
                                    recepientName: `${beneficiary.firstName} ${beneficiary.lastName}`,
                                },
                                { emitEvent: false }
                            );
                        } else {
                            this.beneficiaryDetailsForm
                                .get('recepientName')
                                ?.setValue('', {
                                    emitEvent: false,
                                    onlySelf: true,
                                });
                        }
                    }
                },
                (err) => {
                    this.toastService.show('Error', err, MessageBoxType.DANGER,
                        5000, undefined, undefined, false
                    );
                }
            );
    }

  private setCurrencies(): void {
    this.paymentDetailsForm.get('paymentCurrency')?.setValue('');

    const currencies = [
      <string>this.remittanceAccount?.accountCurrency,
      <string>this.beneficiaryAccount?.accountCurrency,
    ];

    this.currencies = [...new Set(currencies)];
  }

  getExchangeRates(): void {
    const transferCurrency =
      this.paymentDetailsForm.get('paymentCurrency')?.value;
    const type: TransferType =
      this.transactionDetailsForm.get('transferType')?.value;
    const remittanceAccount = this.remittanceAccount as Account;

    const data = {
      accountNumber: this.transactionDetailsForm.get('account')?.value,
      toCurrency:
        type === TransferType.OTHERBANK
          ? transferCurrency
          : this.beneficiaryAccount.accountCurrency,
      fromCurrency: this.remittanceAccount.accountCurrency,
      fromAmount: +this.paymentDetailsForm.get('amountToSend')?.value,
    };

    if (
      data.toCurrency === transferCurrency &&
      data.fromCurrency !== transferCurrency
    ) {
      this.isDebit = true;
    } else if (
      data.fromCurrency === transferCurrency &&
      data.toCurrency !== transferCurrency
    ) {
      this.isDebit = false;
    }

    if (data.fromCurrency === data.toCurrency) {
      this.exchangeRateForm.patchValue(
        {
          rateCode: 'TTS',
          exchangeRate: '1',
          baseExchangeRate: '1',
          convertedCurrency: data.fromCurrency,
          convertedAmount: data.fromAmount.toFixed(2),
        },
        { emitEvent: false }
      );

      return;
    }

    if (data.toCurrency && data.fromAmount && data.fromCurrency) {
      this.moveMoneyService
        .getExchangeRates(data)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          res => {
            if (res.successful && res.responseObject) {
              let convertedAmount;
              let convertedCurrency;

              if (this.isDebit) {
                convertedCurrency = data.fromCurrency;
                if (res.responseObject.rateCode.endsWith('S')) {
                  convertedAmount =
                    +res.responseObject.fromAmount * +res.responseObject.rate;
                }
                if (res.responseObject.rateCode.endsWith('B')) {
                  convertedAmount =
                    +res.responseObject.fromAmount / +res.responseObject.rate;
                }
              }

              if (!this.isDebit) {
                convertedCurrency = data.toCurrency;
                if (res.responseObject.rateCode.endsWith('S')) {
                  convertedAmount =
                    +res.responseObject.fromAmount / +res.responseObject.rate;
                }
                if (res.responseObject.rateCode.endsWith('B')) {
                  convertedAmount =
                    +res.responseObject.fromAmount * +res.responseObject.rate;
                }
              }

                            this.paymentDetailsVerified = true;
                            this.exchangeRateForm.patchValue(
                                {
                                    rateCode: res.responseObject.rateCode,
                                    exchangeRate:
                                        res.responseObject.rate.toString(),
                                    baseExchangeRate:
                                        res.responseObject.rate.toString(),
                                    convertedCurrency: convertedCurrency,
                                    convertedAmount: +(
                                        convertedAmount || 0
                                    ).toFixed(2),
                                },
                                { emitEvent: false }
                            );
                        } else {
                            this.paymentDetailsVerified = false;
                            this.toastService.show(
                                'Error',
                                res.statusMessage,
                                MessageBoxType.DANGER,
                                5000, undefined, undefined, false
                            );

                            this.exchangeRateForm.patchValue({
                                rateCode: '',
                                exchangeRate: '',
                                baseExchangeRate: '',
                                //TreasuryRate: '',
                                //TicketNumber: '',
                                //SearchByCif: '',
                                convertedAmount: '',
                            });
                        }
                    },
                    (err) => {
                        this.toastService.show(
                            'Error',
                            err,
                            MessageBoxType.DANGER,
                            5000, undefined, undefined, false
                        );
                    }
                );
        }
    }

  getTransferFees(): Observable<any> {
    const transferCurrency =
      this.paymentDetailsForm.get('paymentCurrency')?.value;
    const type = this.transactionDetailsForm.get('transferType')?.value;

    const data = {
      customerId: this.currentCustomer.cif,
      currency:
        type === 'TransferToLocalBankAccount'
          ? this.paymentDetailsForm.get('paymentCurrency')?.value
          : this.remittanceAccount.accountCurrency,
      amount: +this.paymentDetailsForm.get('amountToSend')?.value,
      transactionType: type,
      destinationBankCode: '', //TODO => /*this.form.controls['BeneficiaryDetails'].get('BIC').value*/,
      sourceAccount: this.remittanceAccount.accountNumber,
      destinationAccount: this.beneficiaryAccount.accountNumber,
      countryCode: this.isReturned
        ? this.countryCode
        : <string>(
            this.countryCodes.find(
              code => code.bankId === this.currentCustomer.bankID
            )?.countryCode
          ),
    };

    return this.moveMoneyService
      .getTransferCharges(data)
      .pipe(takeUntil(this.destroy$));
  }

  getSpecialExchangeRates = (): void => {
    const data = {
      BankID: this.currentUser.bankId,
      Cif: this.currentCustomer.cif,
      RefNo: this.exchangeRateForm.controls['ticketNumber'].value,
    };

    this.moveMoneyService.getSpecialExchangeRates(data).subscribe(
      res => {
        if (res.successful && res.responseObject) {
          const rateCode = this.exchangeRateForm.controls['rateCode'].value;
          const transactingAmount =
            +this.paymentDetailsForm.controls['amountToSend'].value;
          const transactingCurrency =
            this.paymentDetailsForm.controls['paymentCurrency'].value;
          const transactingCurrencyTo = this.remittanceAccount.accountCurrency;
          const dealAmount = +res.responseObject.dealAmmount;
          const dealCurrency = res.responseObject.dealCurrency;
          const dealCurrencyTo = res.responseObject.dealCurrencyTo;
          this.treasuryRate = res.responseObject.treasuryRate;

          const datesAreOnSameDay = (currentDate: any, dealDate: any) =>
            currentDate.getFullYear() === dealDate.getFullYear() &&
            currentDate.getMonth() === dealDate.getMonth() &&
            currentDate.getDate() === dealDate.getDate();

                    if (
                        !datesAreOnSameDay(
                            new Date(),
                            new Date(res.responseObject.dealDate)
                        )
                    ) {
                        this.toastService.show(
                            'Info',
                            'Requested special rate ticket expired',
                            MessageBoxType.DANGER,
                            5000, undefined, undefined, false
                        );

            this.exchangeRateForm.controls['ticketNumber'].value.setValue('');
            return;
          }

          if (
            transactingAmount !== dealAmount ||
            transactingCurrency !== dealCurrency ||
            transactingCurrencyTo !== dealCurrencyTo
          ) {
            this.toastService.show(
              'Requested Amount is not the same as Deal Amount,or transacting currencies are not matching!',
              `Deal amount: ${this.decimalPipe.transform(+dealAmount, '1.2-2')}
             Deal currency: ${dealCurrency}
             Convert to currency: ${dealCurrencyTo}
            `,
                            MessageBoxType.DANGER,
                            5000, undefined, undefined, false
                        );

            this.exchangeRateForm.patchValue({
              ticketNumber: '',
            });
            return;
          }

          let convertedAmount;

          if (rateCode.endsWith('S')) {
            convertedAmount =
              +res.responseObject.dealAmmount * +res.responseObject.dealRate;
          }

          if (rateCode.endsWith('B')) {
            convertedAmount =
              +res.responseObject.dealAmmount / +res.responseObject.dealRate;
          }

                    this.exchangeRateForm.patchValue(
                        {
                            exchangeRate: res.responseObject.dealRate,
                            convertedAmount: convertedAmount,
                        },
                        { emitEvent: false }
                    );
                } else {
                    this.toastService.show(
                        res.statusMessage,
                        '',
                        MessageBoxType.DANGER,
                        5000, undefined, undefined, false
                    );

                    this.exchangeRateForm.controls['ticketNumber'].value.setValue(
                        ''
                    );
                }
            },
            (err: any) => {
                this.toastService.show(
                    'error',
                    err.statusMessage,
                    MessageBoxType.DANGER,
                    5000, undefined, undefined, false
                );
            }
        );
    };

    private checkCustomersAccAvailableBalance(fee: number): boolean {
        const amount = this.isDebit
            ? this.exchangeRateForm.controls['convertedAmount'].value
            : this.paymentDetailsForm.controls['amountToSend'].value;
        const sourceAcc = this.remittanceAccount.accountNumber;
        const availableBalance = +this.activeAccounts.find(
            (account: any) => account.accountNumber === sourceAcc
        ).availableBalance;
        const summedAmountAndFee = +amount + +fee;
        if (availableBalance < summedAmountAndFee) {
            this.toastService.show(
                'Info',
                this.translate.instant('MOVE-MONEY.INSUFFICIENT-FUNDS-MESSAGE'),
                MessageBoxType.DANGER,
                5000, undefined, undefined, true
            );

      return false;
    }

    return true;
  }

  private validateInstrumentNumber(value: any[]): void {
    const [instrumentNumber, instrumentDate, instrumentType] = value;

    const formattedDate = this.datePipe.transform(instrumentDate, 'yyyy-MM-dd');
    const data = {
      bankId: this.currentCustomer.bankID, //this.isReturned ? this.taskData?.SenderDetails.BankId : this.customer?.bankID,
      instrumentDate: formattedDate,
      instrumentType,
      instrumentnum: instrumentNumber,
      accountNumber: this.remittanceAccount.accountNumber,
    };

        this.moveMoneyService
            .validateInstrumentNumber(data)
            .pipe(takeUntil(this.destroy$))
            .subscribe(
                (res) => {
                    if (res.successful && res.responseObject) {
                        const status = res.responseObject.status;
                        if (status.toLowerCase() === 'unused') {
                            this.toastService.show(
                                `Cheque is "${status}" !`,
                                '',
                                MessageBoxType.SUCCESS,
                                5000, undefined, undefined, false
                            );
                        } else {
                            this.toastService.show(
                                `Cheque is "${status}" !`,
                                '',
                                MessageBoxType.WARNING,
                                5000, undefined, undefined, false
                            );

                            this.instrumentForm.controls['instrumentNumber'].setValue(
                                ''
                            );
                            this.instrumentForm.controls['instrumentNumber'].updateValueAndValidity();
                        }
                    }
                },
                (err) => {
                    this.toastService.show('Error', err, MessageBoxType.DANGER,
                        5000, undefined, undefined, false
                    );
                    this.instrumentForm.controls['instrumentNumber'].setValue('');
                    this.instrumentForm.controls['instrumentNumber'].updateValueAndValidity();
                }
            );
    }

  private checkAmountAndCreateTicket() {
    const checkAmountData = {
      amount: this.paymentDetailsForm.controls['amountToSend'].value,
      currency: this.paymentDetailsForm.controls['paymentCurrency'].value,
      sourceAccount: this.transactionDetailsForm.controls['account'].value,
    };

    this.moveMoneyService
      .checkMoveMoneyAmount(checkAmountData)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        checkRes => {
          if (checkRes.successful && checkRes.responseObject) {
            const { lowestLimit, documentNeeded } = checkRes.responseObject;

                        if (checkAmountData.amount < lowestLimit) {
                            this.toastService.show(
                                'Error',
                                `${this.translate.instant(
                                    'AMOUNT-BELOW-MESSAGE'
                                )}: ${this.decimalPipe.transform(
                                    +lowestLimit,
                                    '1.2-2'
                                )} ${checkAmountData.currency}`,
                                MessageBoxType.DANGER,
                                5000, undefined, undefined, true
                            );
                            return;
                        }

            // skip create ticket when 'Returned'
            if (this.isReturned) {
              if (documentNeeded) {
                this.dataStoreService.setData(
                  'move-money-formdata',
                  this.parentForm
                );
                this.router.navigate([
                  '/account-management/customer-360/funds-transfer',
                  this.ticket?.id,
                  'upload-docs',
                ]);
                return;
              }
              //this.checkAndVeribyBioModal(this.ticket?.id);
            } else {
              // else call create ticket

              const transferType =
                this.transactionDetailsForm.controls['transferType'].value ===
                'IntraBank'
                  ? 'TransferToOtherEquityBankAccount'
                  : 'TransferToOwnAccount';
              const data = {
                AssociatedId:
                  this.transactionDetailsForm.controls['associatedId'].value,
                CustomerName: this.remittanceAccount.accountName,
                CustomerId: this.currentCustomer.cif,
                BankId: this.currentCustomer.bankID,
                TransactionType:
                  this.transactionDetailsForm.controls['transactionType'].value,
                TransferType: transferType,
              };

              this.moveMoneyService
                .createMoveMoneyTicket(data)
                .pipe(takeUntil(this.destroy$))
                .subscribe(
                  res => {
                    if (documentNeeded) {
                      this.dataStoreService.setData(
                        'move-money-formdata',
                        this.parentForm.value
                      );
                      // this.router.navigate(['/account-management/customer-360/funds-transfer', res.responseObject.id, 'upload-docs']);
                      // return;
                    }
                    this.ticketId = res.responseObject.id;
                    this.launchBio();
                    // this.checkAndVeribyBioModal(res.responseObject.id);
                  },
                  err => {}
                );
            }
          }
        },
        checkErr => {}
      );
  }

  private checkAndVeribyBioModal(ticketId: string) {
    const verifyBioData: any = {
      accepted: this.fingerprintAccepted,
      fundsTransfer: true,
      callBack: true,
      cardLimit: false,
      firstName: this.currentCustomer.firstName,
      lastName: this.currentCustomer.lastName,
    };

    if (this.supportDocumentsRequired) {
      this.uploadAndSubmitDocs(ticketId);
    } else {
      this.submitTicketData(ticketId, this.parentForm.value);
    }
  }

  openVerifySignatoryBioDialog(signatories: any) {
    const user = this.customerData;
    const dialogRef = this.dialog.open(VerifySignatoryBioDialogComponent, {
      data: {
        accepted: this.fingerprintAccepted,
        user: user,
        hideSkipBio: true,
        signatories: signatories,
        fundsTransfer: true,
        inProcess: true,
        ticketId: this.ticketId,
      },
    });

        dialogRef.afterClosed().subscribe((result:any) => {
            if (result) {
                this.fingerprintAccepted = result.data;
                if (this.supportDocumentsRequired) {
                    this.uploadAndSubmitDocs(this.ticketId);
                } else {
                    this.submitTicketData(this.ticketId, this.parentForm.value);
                }
                this.toastService.show(
                    'Success',
                    'Action submitted successfully',
                    MessageBoxType.SUCCESS,
                    5000, undefined, undefined, false
                );
            }
        });
    }

  openSkipBioDialog(event?: string) {
    const user = this.customerData;
    const dialogRef = this.dialog.open(VerifySkipBioComponent, {
      data: {
        user: event ? user : '',
        headerText: event ? 'Known agent verification' : 'Skip Biometric',
        subHeaderText: event
          ? 'Requirements for known agent verification'
          : 'Requirements for bio-override',
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      // if (!result) {
      //   const dialogRef = this.dialog.open(VerifySignatoryDialogComponent, {
      //     width: '50%',
      //     height: 'auto',
      //     data: {
      //       searchFlow: false,
      //       user: user,
      //     },
      //   })
      // }
    });
  }

  openVerifyBioDialog(event?: any): void {
    const user = this.customerData;

    const dialogRef = this.dialog.open(VerifyBioDialogComponent, {
      width: '50%',
      data: {
        searchFlow: false,
        accepted: this.fingerprintAccepted,
        user: user,
        hideSkipBio: true,
        fundsTransfer: true,
        ticketId: this.ticketId,
        inProcess: true,
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.fingerprintAccepted = result.data;
        if (this.supportDocumentsRequired) {
          this.uploadAndSubmitDocs(this.ticketId);
        } else {
          this.submitTicketData(this.ticketId, this.parentForm.value);
        }
      }
    });
  }

  launchBio(): void {
    const result = 'canVerify';
    const filteredAccount = this.remittanceAccounts.filter(
      (account: any) =>
        account.accountNumber ===
        this.parentForm.value.transactionDetailsForm.account
    );
    this.customerData.accounts = filteredAccount;
    if (filteredAccount[0].mandate !== 'SELF') {
      this.openSignatoriesDialog(result);
    } else {
      this.openVerifyBioDialog();
    }
  }

  openSignatoriesDialog(data: any) {
    const user = this.customerData;
    const dialogRef = this.dialog.open(VerifySignatoryDialogComponent, {
      width: '50%',
      height: 'auto',
      data: {
        searchFlow: false,
        accepted: this.fingerprintAccepted,
        user: user,
        hideSkipBio: true,
        inProcess: true,
        fundsTransfer: true,
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (data === 'canVerify' && result.data && result.status === data)
        return this.openVerifySignatoryBioDialog(result.data);
      if (data === 'canNotVerify' && result.status === data) {
        return this.openSkipBioDialog();
      }
      if (data === 'knownCannotVerify' && result.status === data) {
        return this.openSkipBioDialog(data);
      }
    });
  }

  private submitTicketData(ticketId: string, formData: IFundsTransferFromData) {
    // case 'TransferToOwnAccount':
    // case 'TransferToOtherEquityBankAccount':
    // case 'TransferToLocalBankAccount':

    const transferType =
      formData.transactionDetailsForm.transferType === 'IntraBank'
        ? 'TransferToOtherEquityBankAccount'
        : 'TransferToOwnAccount';

    const moveMoneyPayload: MoveMoneyPayload = {
      SenderDetails: {
        AssociatedId: formData.transactionDetailsForm.associatedId,
        CustomerName:
          this.currentCustomer.firstName + ' ' + this.currentCustomer.lastName,
        CustomerId: this.currentCustomer.cif,
        BankId: this.currentCustomer.bankID,
        TransactionType: formData.transactionDetailsForm.transactionType,
        TransferType: transferType,
        SourceAccount: formData.transactionDetailsForm.account,
        SourceAccountCurrency: this.remittanceAccount.accountCurrency || '',
        CurrencyCode: formData.paymentDetailsForm.paymentCurrency,
        Amount: +formData.paymentDetailsForm.amountToSend,
        PaymentReason: formData.paymentDetailsForm.paymentReason,
        SkipBio: formData.transactionDetailsForm.skipBio,
      },
      BeneficiaryDetails: {
        Address: '',
        BIC: '',
        BankName: '',
        DestinationAccount: formData.beneficiaryDetailsForm.beneficiaryAccount,
        DestinationAccountCurrency:
          this.beneficiaryAccount.accountCurrency || '',
        DestinationAccountType: '',
        Email: '',
        Favorited: false,
        FullName: formData.beneficiaryDetailsForm.recepientName,
        Phone: '',
      },
      TransactionDetails: {
        InstrumentType: formData.instrumentForm.instrumentType,
        InstrumentDate: formData.instrumentForm.instrumentDate,
        InstrumentNumber: formData.instrumentForm.instrumentNumber,
      },
      ExchangeDetails: {
        RateCode: formData.exchangeRateForm.rateCode,
        ExchangeRate: formData.exchangeRateForm.exchangeRate,
        BaseExchangeRate: formData.exchangeRateForm.baseExchangeRate,
        TreasuryRate: this.treasuryRate,
        SearchByCif: '',
        ConvertedCurrency: formData.exchangeRateForm.convertedCurrency,
        ConvertedAmount: formData.exchangeRateForm.convertedAmount,
        TicketNumber: this.exchangeRateForm.controls['ticketNumber'].value,
      },
      NotificationDetails: {
        Sms: formData.transactionDetailsForm.sms,
        Email: formData.transactionDetailsForm.email,
      },
      Fee: formData.transactionDetailsForm.fee,
    };

        this.moveMoneyService
            .submitMoveMoneyTicket(ticketId, moveMoneyPayload)
            .pipe(takeUntil(this.destroy$))
            .subscribe(
                (res) => {
                    if (res.successful) {
                        this.toastService.show(
                            'Ticket submitted for processing',
                            '',
                            MessageBoxType.SUCCESS,
                            5000, undefined, undefined, false
                        );
                        this.router.navigateByUrl('/dashboard');
                    }

                    if (!res.successful) {
                        this.toastService.show(
                            'Error',
                            res.statusMessage,
                            MessageBoxType.DANGER,
                            5000, undefined, undefined, false
                        );
                    }
                },
                (err) => {
                    this.toastService.show('Error', err, MessageBoxType.DANGER,
                        5000, undefined, undefined, false
                    );
                }
            );
    }

  private canApplySpecialRate(): void {
    const sourceAccountCurrency = this.remittanceAccount.accountCurrency;
    const selectedCurrency =
      this.paymentDetailsForm.controls['paymentCurrency'].value;

    const ticketControl = this.exchangeRateForm.controls['ticketNumber'];
    ticketControl.setValue('');
    ticketControl.updateValueAndValidity();
    ticketControl.disable();

    if (
      sourceAccountCurrency !== selectedCurrency &&
      selectedCurrency &&
      sourceAccountCurrency
    ) {
      ticketControl.setValue('');
      ticketControl.updateValueAndValidity();
      ticketControl.enable();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next('');
    this.destroy$.complete();
  }
}
