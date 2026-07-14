import {
  Component,
  DestroyRef,
  EventEmitter,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatRadioChange, MatRadioModule } from '@angular/material/radio';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { Router, RouterModule } from '@angular/router';
import { DialogStatementComponent } from '@app/shared/components/dialog/dialog-statement/dialog-statement.component';
import { VerifyBioDialogComponent } from '@app/shared/components/verify-bio-dialog/verify-bio-dialog.component';
import { MessageBoxType, ToastService } from '@app/shared/modules/toast';
import { AccountStatementService } from '@app/shared/services/account-statement';
import {
  AccountStatementV2,
  Balance,
  Bio,
  PhoneDetails,
} from '../models/account-statement';
import { Observable, Subscription } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { PdfDialogComponent } from '@app/shared/components/pdf-dialog/pdf-dialog.component';
import { VerifySignatoryDialogComponent } from '@app/shared/components/verify-signatory-dialog/verify-signatory-dialog.component';
import { VerifySignatoryBioDialogComponent } from '@app/shared/components/verify-signatory-bio-dialog/verify-signatory-bio-dialog.component';
import { VerifySkipBioComponent } from '@app/shared/components/verify-skip-bio/verify-skip-bio.component';
import { ChangeOfSignatureSkipBioComponent } from '@app/shared/components/change-of-signature/change-of-signature-skip-bio/change-of-signature-skip-bio.component';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SessionService } from '@app/shared/services';
import { ISubsidiary } from '@app/shared/services/session/session.service';
import { getStatementChargeDetails, ChargeCalculationContext } from './statement-charge.helper';
import { CurrencyService } from './currency.service';
import { NumberDirective } from '@app/shared/directives';
import { NotificationsComponent } from '@app/shared/modules/notifications';

@Component({
  selector: 'app-statement-details',
  templateUrl: './statement-details.component.html',
  styleUrls: ['./statement-details.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatDividerModule,
    MatRadioModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    TranslatePipe,
    RouterModule,
    NumberDirective,
    NotificationsComponent,
  ],
})
export class StatementDetailsComponent implements OnInit, OnDestroy {
  @Input() userInfo!: any;
  @Output() accountIdChange = new EventEmitter<string>();

  hasSufficientFunds$!: Observable<boolean>;

  submitIndividual$!: Observable<any>;

  sharedValue$!: Observable<any>;
  emailForm!: UntypedFormGroup;
  accountForm!: UntypedFormGroup;
  generateAccountForm!: UntypedFormGroup;
  periodForm!: UntypedFormGroup;
  waiverForm!: UntypedFormGroup;
  maxDate: Date;
  delivery!: string;
  isFormValid = false;
  isPrinting!: boolean;
  statementType!: any;
  isBothRecipient!: boolean;
  formValidation!: UntypedFormGroup;

  validPeriod = false;
  validStatement = false;
  validDelivery = false;
  customerData: any = JSON.parse(
    <string>localStorage.getItem('customerDetails')
  );
  accMgntObj: any = JSON.parse(<string>localStorage.getItem('accMgntObj'));
  customerNotPresentFlow = false;

  balanceData: Balance = {
    accountId: '',
    date: new Date(),
    bankId: '',
  };
  taskId!: string;

  statement: AccountStatementV2 = {

    bankId: '',
    branchId: '',
    actionName: '',
    fromDate: '',
    toDate: '',
    statementType: 0,
    parentTaskId: '',
    alternateAccountId: '',
    chargeOption: '0',
    customerDetails: {
      firstName: '',
      lastName: '',
      accountId: '',
      customerId: '',
      emailAddress: '',
      phoneDetails: {
        id: '',
        code: '',
        number: '',
        phoneType: '',
        preferred: false,
      },
    },
    calculateCharge: {
      noOfPages: 0,
      commFlag: 'Y',
      certify: '',
    }

  };

  bioModel: Bio = {
    bioModels: [
      {
        cif: '',
        skipBio: false,
        fingerprints: [
          {
            value: '',
          },
          {
            value: '',
          },
        ],
      },
      {
        cif: '',
        skipBio: false,
        fingerprints: [
          {
            value: '',
          },
          {
            value: '',
          },
        ],
      },
    ],
  };
  cifData = JSON.parse(<string>localStorage.getItem('customerCifData'));
  accountNumbers = JSON.parse(<string>localStorage.getItem('accounts'));
  selectedAccount = JSON.parse(<string>localStorage.getItem('selectedAccount'));

  buttonText = [
    { title: 'CUSTOMER.ACCOUNT-SERVICES.STATEMENT.CURRENT-MONTH', key: '1' },
    { title: 'CUSTOMER.ACCOUNT-SERVICES.STATEMENT.LAST-3-MONTHS', key: '3' },
    { title: 'CUSTOMER.ACCOUNT-SERVICES.STATEMENT.LAST-6-MONTHS', key: '6' },
    { title: 'CUSTOMER.ACCOUNT-SERVICES.STATEMENT.LAST-12-MONTHS', key: '12' },
    {
      title: 'CUSTOMER.ACCOUNT-SERVICES.STATEMENT.CUSTOM-DATE-RANGE',
      key: '0',
    },
  ];

  buttonValue!: string;
  selectedIndex!: number;
  disableGenerateButton = false;
  customerCanVerify = '';
  fingerprintAccepted = false;
  statementDetails: any;
  reasonForViewingProfile = '';
  insufficient = false;
  delivery_Mode!: string;
  period!: string;
  disabledEmail = false;
  accountCharged!: string;
  maxStartDate!: Date;
  minStartDate!: Date;
  data = {};

  pdfData = {
    data: {},
    base64: '',
    delivery: '',
  };

  printObject!: Array<{}>;
  emailObj!: Array<{}>;
  totalCharge = 0;
  balance = 0;
  NofPages = 0;
  printingChargePerPageText = '';
  printCertifyChargeText = '';
  startDateIsMore = false;
  newSelectedAccount!: {
    accountCurrency: string;
    availableBalance: string;
  };
  waiveCharges = false;
  statementRequestSubscription$!: Subscription;
  private latestStatementRequest: any;

  readonly destroyRef = inject(DestroyRef);
  private rwfConversionRates: { [key: string]: number } = {};
  private kesConversionRates: { [key: string]: number } = {};
  private ugxConversionRates: { [key: string]: number } = {};
  private sspConversionRates: { [key: string]: number } = {};

  subsidiary!: ISubsidiary;

  constructor(
    private fb: UntypedFormBuilder,
    public dialog: MatDialog,
    private router: Router,
    private toast: ToastService,
    private accountStatementService: AccountStatementService,
    private translateService: TranslateService,
    public session: SessionService,
    private currencyService: CurrencyService,

  ) {
    this.maxDate = new Date();
    this.maxStartDate = this.maxDate;
    this.taskId = this.router.getCurrentNavigation()?.extras.state?.['taskId'];
  }

  get warningText() {
    if (this.delivery === 'PrintStatement') {
      return this.printingChargePerPageText;
    } else {
      return (
        this.printCertifyChargeText +
        '. Select the account to be debited below.'
      );
    }
  }

  get warningTitle() {
    if (this.delivery === 'PrintStatement') {
      return 'Charges associated with printing';
    } else {
      return 'Charges associated with printing and certifying';
    }
  }

  get accountCurrency(): string {
    return this.selectedAccount?.accountCurrency || this.selectedAccount?.currency || '';
  }

  ngOnInit(): void {
    this.customerNotPresentFlow =
      this.accMgntObj.currentFlow === 'customerNotPresent';

    if (!this.selectedAccount || this.customerNotPresentFlow) {
      this.selectedAccount = this.accountNumbers[0];
    }

    // Fetch conversion rates on init
    this.currencyService.getRwfConversionRates()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((rates: { [key: string]: number }) => this.rwfConversionRates = rates);
    this.currencyService.getKesConversionRates()
      .pipe(takeUntilDestroyed(this.destroyRef))
       .subscribe((rates: { [key: string]: number }) => this.kesConversionRates = rates);
    this.currencyService.getUgxConversionRates()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((rates: { [key: string]: number }) => this.ugxConversionRates = rates);
    this.currencyService.getSspConversionRates()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((rates: { [key: string]: number }) => this.sspConversionRates = rates);

    this.minStartDate = new Date(this.selectedAccount.accountOpeningDate);
    this.accountIdChange.emit(this.selectedAccount.accountNumber);
    this.statementRequestSubscription$ = this.accountStatementService
      .getStatementRequest({
        account: this.selectedAccount.accountNumber,
        certification: 'Y',
        currency: this.accountCurrency,
        numberOfPages: 1,
        ticketId: 0,
        transType: 'STMT',
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(statementRequest => {
        this.latestStatementRequest = statementRequest;
        const currency = this.newSelectedAccount?.accountCurrency || this.accountCurrency;
        const scheme = this.selectedAccount?.schemeCode || '';
        const baseCharge = (this.latestStatementRequest?.responseObject?.statementFee || 0) + (this.latestStatementRequest?.responseObject?.statementDuty || 0);

        const context: ChargeCalculationContext = {
          subsidiary: this.subsidiary,
          currency: this.newSelectedAccount?.accountCurrency || currency,
          scheme: scheme,
          delivery: this.delivery as 'PrintStatement' | 'CertifyPrintStatement' | 'EmailStatement',
          baseCharge: baseCharge,
          getUgUsage: this.getUgUsage.bind(this),
          getRwUsage: this.getRwUsage.bind(this),
          getUgQuarterKey: this.getUgQuarterKey.bind(this),
          getRwYearKey: this.getRwYearKey.bind(this),
          accountNumber: this.selectedAccount?.accountNumber || '',
          toDate: this.statement?.toDate,
          currencyService: this.currencyService,
          rwfConversionRates: this.rwfConversionRates,
          kesConversionRates: this.kesConversionRates,
          ugxConversionRates: this.ugxConversionRates,
          sspConversionRates: this.sspConversionRates,
        };

        const chargeDetails = getStatementChargeDetails(context);
        this.printingChargePerPageText = this.printCertifyChargeText = chargeDetails.message;

      });
    this.initialize();
    this.userInfo = JSON.parse(<string>localStorage.getItem('accMgntObj'));

    this.accountCharged = this.accountForm.value.accountNo;

    try {
      this.setStatementValues();
      this.bioModel.bioModels[0].cif = this.selectedAccount.cif;
      this.bioModel.bioModels[0].skipBio = true;
      this.bioModel.bioModels[1].cif = this.selectedAccount.cif;
      this.bioModel.bioModels[1].skipBio = true;

      if (this.statement.customerDetails.emailAddress == undefined) {
        this.disabledEmail = true;

        this.balanceData.accountId = this.statement.customerDetails.accountId;
        this.balanceData.bankId = this.statement.bankId;

        this.accountStatementService
          .getAccountBalance(this.balanceData)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(res => {
            this.balance = Number(res.responseObject.balance);
          });
      }
    } catch (error) {
      console.log('error', error);
    }
    this.subsidiary = this.session.subsidiary;

    // UG: default delivery mode to Email for specific work classes
    this.setDefaultDeliveryForUganda();

  }
  private setDefaultDeliveryForUganda() {
    try {
      const bankId = String(this.userInfo?.bankID || '');
      const isUganda = this.subsidiary?.countryCode === 'UG' || bankId === '56' || this.accountCurrency === 'UGX';
      const workClass = String(this.session.userWorkClass || '').trim();
      const emailAvailable = !!this.statement?.customerDetails?.emailAddress;
      const shouldDefaultEmail = ['50', '55', '65'].includes(workClass);

      if (isUganda && shouldDefaultEmail && emailAvailable) {
        this.delivery = 'EmailStatement';
        this.validDelivery = true;
        this.delivery_Mode = this.translateService.instant(
          'CUSTOMER.ACCOUNT-SERVICES.STATEMENT.EMAIL-ADDRESS'
        );
        this.isPrinting = false;
        this.statement.actionName = this.delivery;
      }
    } catch (e) {
    }
  }

  isCertifyDisabled(): boolean {
     return this.subsidiary?.countryCode === 'RW' || 
     this.subsidiary?.countryCode=== 'UG';
  }

  setStatementValues() {
    const { id, countryCode, number, phoneType, preferred } = this.cifData
      .contactDetails.phoneNumbers[0] as PhoneDetails;
    const phoneDetails = {
      id,
      code: countryCode || '',
      number: number || '',
      phoneType,
      preferred,
    };

    this.statement.customerDetails.accountId =
      this.selectedAccount.accountNumber;
    this.statement.customerDetails.firstName = this.userInfo.firstName;
    this.statement.customerDetails.lastName = this.userInfo.lastName;
    this.statement.bankId = this.userInfo.bankID;
    this.statement.branchId = this.cifData.accountDetails.branchId;
    this.statement.chargeOption = 0;
    this.statement.customerDetails.customerId = this.selectedAccount.cif;
    this.statement.customerDetails.emailAddress =
      this.cifData.contactDetails?.emailAddresses[0]?.emailAddress ||
      'none@mail.com';
    this.statement.customerDetails.phoneDetails = phoneDetails;
    this.statement.alternateAccountId = this.accountCharged;

    if (this.customerNotPresentFlow) {
      this.statement.parentTaskId = this.accMgntObj?.accessProfileTicket?.id;
    }

    // UG: allow closed/court accounts for privileged makers (150/200)
    try {
      const workClass = String(this.session.userWorkClass || '').trim();
      const bankId = String(this.userInfo?.bankID || '');
      const isUganda = this.subsidiary?.countryCode === 'UG' || bankId === '56' || this.accountCurrency === 'UGX';
      const canOverrideClosed = isUganda && ['150', '200'].includes(workClass);
      const status = String(this.selectedAccount?.accountStatus || '').toUpperCase();
      const freezeCode = String(this.selectedAccount?.freezeCode || '').toUpperCase();
      // Define closed/court heuristics: status 'C' or freezeCode non-empty (e.g., court)
      const isClosedOrCourt = status === 'C' || !!freezeCode;

      if (isClosedOrCourt && !canOverrideClosed) {
        // Prevent proceeding by invalidating delivery selection
        this.validDelivery = false;
        this.toast.show(
          this.translateService.instant('TOAST.GENERATE-STATEMENT'),
          this.translateService.instant('CUSTOMER.ACCOUNT-SERVICES.STATEMENT.CLOSED-OR-COURT-NOT-ALLOWED'),
          MessageBoxType.WARNING,
          5000, undefined, undefined, false
        );
      }
    } catch {}
  }

   accountStatementV2() {
       this.statement = {
           ...this.statement,
           customerDetails: {
               ...this.statement.customerDetails,
               accountId: this.accountCharged
           },
           calculateCharge: {
               ...this.statement.calculateCharge,
               certify: this.delivery === 'PrintStatement' ? 'N' : 'Y'
           }
        }

        switch (this.delivery) {
            case 'CertifyPrintStatement':
            case 'PrintStatement':
                this.printFlow()
                break;
            case 'EmailStatement':
                this.emailflow()
                break;

            default:
                break;
        }
    }

    private emailflow() {

        this.accountStatementService.submitIndividual(this.statement)
            .pipe(
                // 1) GetAccountStatementPageCount
                switchMap(results => {
                    this.taskId = results.responseObject.id;
                    const taskData = JSON.parse(results.responseObject.taskData);
                    return this.accountStatementService.invokeActions('GetAccountStatementPageCount', +this.taskId).pipe(
                        map((response: {
                            statusMessage: string,
                            statusCode: string,
                            successful: boolean,
                            responseObject: {
                                item1: boolean,
                                item2: string,
                                item3: number }
                        }) => ({
                                taskData,
                                NofPages: response.responseObject.item3
                            }
                        ))
                    )
                }),
                // 2) GetAccountStatementCharge (advance to next action in flow)
                switchMap(({ NofPages, taskData }) =>
                    this.accountStatementService
                        .invokeActions('GetAccountStatementCharge', +this.taskId)
                        .pipe(map(() => ({ NofPages, taskData })))
                ),
                // 3) GetAccountBalance (required before VerifyBio in flow order)
                switchMap(({ NofPages, taskData }) =>
                    this.accountStatementService
                        .invokeActions('GetAccountBalance', +this.taskId)
                        .pipe(map(() => ({ NofPages, taskData })))
                ),
                takeUntilDestroyed(this.destroyRef)
            ).subscribe({
                next: ({ NofPages }) => {
                    this.NofPages = NofPages;
                    this.showDialog();
                }, error: (res) => {
                    this.handleValidationError(res);
                }
            })
    }

    private printFlow() {
            this.accountStatementService.submitIndividual(this.statement)
            .pipe(
                //GetAccountStatementPageCount
                switchMap(results => {
                    this.taskId = results.responseObject.id;
                    const taskData = JSON.parse(results.responseObject.taskData);
                    return this.accountStatementService.invokeActions('GetAccountStatementPageCount', +this.taskId).pipe(
                        map((response: {
                            statusMessage: string,
                            statusCode: string,
                            successful: boolean,
                            responseObject: {
                                item1: boolean,
                                item2: string,
                                item3: number }
                        }) => ({
                                taskData,
                                NofPages: response.responseObject.item3
                            }
                        ))
                    )
                }),

               //GetAccountStatementCharge
                switchMap( results => {
                    const bankId = String(this.userInfo.bankID);
                    // The V2 charge calculation is now handled by the helper, so we can simplify this.
                    // We still invoke the action to advance the workflow state on the backend.
                    return this.accountStatementService.invokeActions('GetAccountStatementCharge', +this.taskId).pipe(map(() => results));
                }),

                //GetAccountBalance
                switchMap( results => {
                    return this.accountStatementService.invokeActions('GetAccountBalance', +this.taskId).pipe(
                        map( (response:  {
                            responseObject: {
                            item3: {
                                balance: string;
                            }
                        }}) => {

                            const { item3: balance } = response?.responseObject
                            return { ...results, balance }
                        }  )
                    )
                }),
                takeUntilDestroyed(this.destroyRef)
            ).subscribe({
                next: ({NofPages, balance}) => {
                const context: ChargeCalculationContext = {
                  subsidiary: this.subsidiary,
                  currency: this.newSelectedAccount?.accountCurrency || this.accountCurrency, // Use the selected charge account's currency
                  scheme: this.selectedAccount?.schemeCode || '',
                  delivery: this.delivery as 'PrintStatement' | 'CertifyPrintStatement' | 'EmailStatement',
                  baseCharge: (this.latestStatementRequest?.responseObject?.statementFee || 0) + (this.latestStatementRequest?.responseObject?.statementDuty || 0),
                  getUgUsage: this.getUgUsage.bind(this),
                  getRwUsage: this.getRwUsage.bind(this),
                  getUgQuarterKey: this.getUgQuarterKey.bind(this),
                  getRwYearKey: this.getRwYearKey.bind(this),
                  accountNumber: this.selectedAccount?.accountNumber || '',
                  toDate: this.statement?.toDate,
                  currencyService: this.currencyService,
                  rwfConversionRates: this.rwfConversionRates,
                  kesConversionRates: this.kesConversionRates,
                  ugxConversionRates: this.ugxConversionRates,
                  sspConversionRates: this.sspConversionRates,
                };

                const chargeDetails = getStatementChargeDetails(context);

                const perPageCharge = chargeDetails.perPage;
                this.printingChargePerPageText = this.printCertifyChargeText = chargeDetails.message;

                // Calculate total charge including per-page, flat fees, and VAT
                const baseTotal = (perPageCharge * Number(NofPages ?? 0)) + chargeDetails.flatFee;
                this.totalCharge = Math.round(baseTotal * (1 + (chargeDetails.vatRate / 100)));

                this.balance = Number(balance.balance);
                this.NofPages = NofPages;

                    if ((this.totalCharge > this.balance) && !this.waiveCharges) {
                        // Insufficient Funds
                        // user selects alternate account
                        // starts the process all over
                        this.insufficient = true;
                        return;
                    } else {
                        // show confirmation Dialog
                        this.showDialog();
                        return;
                    }

                }, error: (res) => {
                    this.handleValidationError(res);
                }
            })
    }

  checkValidity() {
    if (
      this.statement.fromDate &&
      this.statement.toDate &&
      this.statement.actionName &&
      this.statement.statementType
    )
      this.isFormValid = true;
    //  if(this.accountForm.valid && this.periodForm.valid)
  }

  showDialog(): void {
    let dataObj;

    if (this.waiveCharges) {
      this.printObject = [
        {
          title: 'CUSTOMER.ACCOUNT-SERVICES.STATEMENT.ACCOUNT-NAME',
          value: this.selectedAccount?.accountName,
        },
        {
          title: 'CUSTOMER.ACCOUNT-SERVICES.STATEMENT.ACCOUNT-NUMBER',
          value: this.selectedAccount?.accountNumber,
        },
        {
          title: 'CUSTOMER.ACCOUNT-SERVICES.STATEMENT.STATEMENT-DURATION',
          value: this.period,
        },
        {
          title: 'CUSTOMER.ACCOUNT-SERVICES.STATEMENT.START-DATE',
          value: this.statement.fromDate,
        },
        {
          title: 'CUSTOMER.ACCOUNT-SERVICES.STATEMENT.END-DATE',
          value: this.statement.toDate,
        },
        {
          title: 'CUSTOMER.ACCOUNT-SERVICES.STATEMENT.DELIVERY-MODE',
          value: this.delivery_Mode,
        },
        {
          title: 'CUSTOMER.ACCOUNT-SERVICES.STATEMENT.MODE-OF-PAYMENT',
          value: this.translateService.instant(
            'CUSTOMER.ACCOUNT-SERVICES.STATEMENT.WAIVE-CHARGES'
          ),
        },
        {
          title: 'CUSTOMER.ACCOUNT-SERVICES.STATEMENT.NO-OF-PAGES',
          value: this.NofPages,
        },
      ];
    } else {
      this.printObject = [
        {
          title: 'CUSTOMER.ACCOUNT-SERVICES.STATEMENT.ACCOUNT-NAME',
          value: this.selectedAccount?.accountName,
        },
        {
          title: 'CUSTOMER.ACCOUNT-SERVICES.STATEMENT.ACCOUNT-NUMBER',
          value: this.selectedAccount?.accountNumber,
        },
        {
          title: 'CUSTOMER.ACCOUNT-SERVICES.STATEMENT.STATEMENT-DURATION',
          value: this.period,
        },
        {
          title: 'CUSTOMER.ACCOUNT-SERVICES.STATEMENT.START-DATE',
          value: this.statement.fromDate,
        },
        {
          title: 'CUSTOMER.ACCOUNT-SERVICES.STATEMENT.END-DATE',
          value: this.statement.toDate,
        },
        {
          title: 'CUSTOMER.ACCOUNT-SERVICES.STATEMENT.DELIVERY-MODE',
          value: this.delivery_Mode,
        },
        {
          title: 'CUSTOMER.ACCOUNT-SERVICES.STATEMENT.CHARGES',
          value: `${this.newSelectedAccount?.accountCurrency || this.accountCurrency} ${this.totalCharge}`,
        },
        {
          title: 'CUSTOMER.ACCOUNT-SERVICES.STATEMENT.CHARGE-ACCOUNT',
          value: this.accountCharged,
        },
        {
          title: 'CUSTOMER.ACCOUNT-SERVICES.STATEMENT.AVAILABLE-BALANCE',
          value: `${this.newSelectedAccount?.accountCurrency || this.accountCurrency} ${this.balance}`,
        },
        {
          title: 'CUSTOMER.ACCOUNT-SERVICES.STATEMENT.REMAINING-BALANCE',
          value: `${this.newSelectedAccount?.accountCurrency || this.accountCurrency} ${this.balance - this.totalCharge}`,
        },
        {
          title: 'CUSTOMER.ACCOUNT-SERVICES.STATEMENT.NO-OF-PAGES',
          value: this.NofPages,
        },
      ];
    }

    this.emailObj = [
      {
        title: 'CUSTOMER.ACCOUNT-SERVICES.STATEMENT.ACCOUNT-NAME',
        value: this.selectedAccount?.accountName,
      },
      {
        title: 'CUSTOMER.ACCOUNT-SERVICES.STATEMENT.ACCOUNT-NUMBER',
        value: this.selectedAccount?.accountNumber,
      },
      {
        title: 'CUSTOMER.ACCOUNT-SERVICES.STATEMENT.STATEMENT-DURATION',
        value: this.period,
      },
      {
        title: 'CUSTOMER.ACCOUNT-SERVICES.STATEMENT.START-DATE',
        value: this.statement.fromDate,
      },
      {
        title: 'CUSTOMER.ACCOUNT-SERVICES.STATEMENT.END-DATE',
        value: this.statement.toDate,
      },
      {
        title: 'CUSTOMER.ACCOUNT-SERVICES.STATEMENT.DELIVERY-MODE',
        value: this.delivery_Mode,
      },
      {
        title: 'CUSTOMER.ACCOUNT-SERVICES.STATEMENT.EMAIL-ADDRESS',
        value: this.statement.customerDetails.emailAddress,
      },
      {
        title: 'CUSTOMER.ACCOUNT-SERVICES.STATEMENT.NO-OF-PAGES',
        value: this.NofPages,
      },
    ];

    if (this.delivery == 'EmailStatement') dataObj = this.emailObj;
    else dataObj = this.printObject;

    const dialogRef = this.dialog.open(DialogStatementComponent, {
      width: '800px',
      height: 'auto',
      data: {
        itemsForDisplay: dataObj,
        payload: {
          accountId: this.accountCharged,
          bankId: this.statement.bankId,
          certify: this.delivery == 'PrintStatement' ? 'N' : 'Y',
          commFlag: 'Y',
          noOfPages: this.NofPages,
          taskId: this.taskId,
          selectedAccountId: this.selectedAccount?.accountNumber,
          waiveCharges: this.waiveCharges,
          waiveReason: this.waiveCharges ? (this.waiverForm?.get('reason')?.value || '').trim() : undefined,
          subsidiary: this.subsidiary,
        },
      },
    });

        dialogRef.afterClosed()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((results: any) => {

            if (results) {
                const bankId = String(this.userInfo?.bankID || JSON.parse(<string>(localStorage.getItem('accMgntObj') || '{}'))?.bankID || '');
                const isRwUg = bankId === '50' || bankId === '56' || this.subsidiary?.countryCode === 'RW' || this.subsidiary?.countryCode === 'UG';
          const workClass = String(this.session.userWorkClass || '').trim();
          const isPrivilegedUgMaker = isRwUg && ['50', '65'].includes(workClass);

          if (this.customerNotPresentFlow) {
            if (isPrivilegedUgMaker) {
              // UG: workclass 50 or 65, customer not present -> skip bio override checker
              this.onVerifyGenerateStatement();
            } else if (!isRwUg) {
                    this.verifyBio();
            }
                } else {
                    this.verifyBio();
                }
            }
        });
    }

  verifyBio(): void {
        const result = 'canVerify';
    this.customerData.accounts = this.accountNumbers.filter(
      (account: any) =>
        account.accountNumber === this.selectedAccount?.accountNumber
    );
    if (this.selectedAccount && this.selectedAccount.mandate !== 'SELF') {
      this.openSignatoriesDialog(result);
    } else {
      this.openVerifyBioDialog();
    }
  }

  openSignatoriesDialog(data: string) {
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
        generateStatement: true,
      },
    });


        dialogRef.afterClosed().
        pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((result: any) => {
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

  openVerifySignatoryBioDialog(signatories: any) {
    const user = this.customerData;
    const dialogRef = this.dialog.open(VerifySignatoryBioDialogComponent, {
      data: {
        accepted: this.fingerprintAccepted,
        user: user,
        hideSkipBio: true,
        signatories: signatories,
        inProcess: true,
        ticketId: this.taskId,
        generateStatement: true,
      },
    });

        dialogRef.afterClosed()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((result: any) => {
            if (result) {
                const data = {
                    cif: this.customerData.cif,
                    ticketId: this.taskId,
                    stakeholderName: this.accountForm.value.stakeholder,
                    nationalId: this.getNationlID().id,
                    accountNo: this.accountForm.value.account,
                    accountType: 'Joint Account',
                }
                this.fingerprintAccepted = typeof result.data === 'boolean' && result.data;
                if (this.fingerprintAccepted) {
                    this.generateStatement();
                };

        if (result.data.accepted) {
          this.reasonBioSkip(data);
        }
      } else {
      }
    });
  }

  reasonBioSkip(data: any) {
    const dialogRef = this.dialog.open(ChangeOfSignatureSkipBioComponent, {
      width: '580px',
      data: {
        ...data,
        approvalRequired: true,
      },
      disableClose: true,
    });
    dialogRef.afterClosed()
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe((result: any) => {
      if (result) {
      } else {
      }
    });
  }

  openSkipBioDialog(event?: string) {
    const user = this.customerData;
    const dialogRef = this.dialog.open(VerifySkipBioComponent, {
      data: {
        user: event ? user : '',
        headerText: event
          ? this.translateService.instant(
              'CUSTOMER.ACCOUNT-SERVICES.STATEMENT.GENERATE-STATEMENT-VERIFICATION'
            )
          : this.translateService.instant('BIOMETRICS.SKIP-BIOMETRIC'),
        subHeaderText: event
          ? this.translateService.instant(
              'CUSTOMER.ACCOUNT-SERVICES.STATEMENT.REQUIREMENTS-GENERATE-STATEMENT-VERIFICATION'
            )
          : this.translateService.instant('BIOMETRICS.REQUIREMENTS-OVERRIDE'),
      },
    });

    dialogRef.afterClosed()
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe(() => {});
  }

  openVerifyBioDialog() {
    const user = this.customerData;
    const dialogRef = this.dialog.open(VerifyBioDialogComponent, {
      width: '50%',
      data: {
        searchFlow: false,
        accepted: this.fingerprintAccepted,
        user: user,
        ticketId: this.taskId,
        hideSkipBio: true,
        generateStatement: true,
      },
    });

        dialogRef.afterClosed().pipe(
            takeUntilDestroyed(this.destroyRef)
        ).subscribe((result: any) => {
            if (result) {
                this.fingerprintAccepted = result.data;
                this.generateStatement();
            }
        });
    }

  openPreviewDocument(documentId: number): void {
    let dialogRef = this.dialog.open(PdfDialogComponent, {
      width: '831px',
      height: 'auto',
      data: '',
    });

        dialogRef.afterClosed()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {});
    }

  quit(): void {
    this.router.navigate(['/services/customer-360']);
  }

  generateStatement() {
      this.accountStatementService.invokeActions('GeneratePdf', +this.taskId)
          .subscribe((result: {
              statusMessage: string;
              statusCode: string;
              successful: boolean;
              responseObject: string;
          }) => { // Removed takeUntilDestroyed to avoid premature unscubscribe

              this.pdfData.base64 = result.responseObject;
              const bankId = String(this.userInfo?.bankID);
              const currency = this.newSelectedAccount?.accountCurrency || this.accountCurrency;
              let baseCharge = this.totalCharge;
              let vatAmount = 0;

              const context: ChargeCalculationContext = {
                subsidiary: this.subsidiary,
                currency: this.newSelectedAccount?.accountCurrency || this.accountCurrency,
                scheme: this.selectedAccount?.schemeCode || '',
                delivery: this.delivery as 'PrintStatement' | 'CertifyPrintStatement' | 'EmailStatement',
                baseCharge: 0, // Not needed for final breakdown
                getUgUsage: this.getUgUsage.bind(this),
                getRwUsage: this.getRwUsage.bind(this),
                getUgQuarterKey: this.getUgQuarterKey.bind(this),
                getRwYearKey: this.getRwYearKey.bind(this),
                accountNumber: this.selectedAccount?.accountNumber || '',
                toDate: this.statement?.toDate,
                currencyService: this.currencyService,
                rwfConversionRates: this.rwfConversionRates,
                kesConversionRates: this.kesConversionRates,
                ugxConversionRates: this.ugxConversionRates,
                sspConversionRates: this.sspConversionRates,
              };
              const chargeDetails = getStatementChargeDetails(context);

              baseCharge = (chargeDetails.perPage * Number(this.NofPages ?? 0)) + chargeDetails.flatFee;
              vatAmount = Math.round(baseCharge * (chargeDetails.vatRate / 100));

              this.data = {
                  accountName: this.selectedAccount.accountName,
                  accountNumber: this.selectedAccount.accountNumber,
                  statementDuration: this.period,
                  startDate: this.statement.fromDate,
                  endDate: this.statement.toDate,
                  deliveryMode: this.delivery_Mode,
                  emailAddress: this.statement.customerDetails.emailAddress,
                  noPages: this.NofPages,
                  charges: this.totalCharge, // total (includes VAT for RW only)
                  waiveCharges: this.waiveCharges,
                  currency,
                  bankId,
                  baseCharge,
                  vatAmount,
                  countryCode: this.subsidiary?.countryCode,
              };

              this.pdfData.data = this.data;
              this.pdfData.delivery = this.delivery_Mode;

              localStorage.setItem('pdfInfo', JSON.stringify(this.pdfData));

              // If UG and scheme is CA232/CA214, increment usage after generation
              try {
                const bankIdStr = String(this.userInfo?.bankID);
                const scheme = this.selectedAccount?.schemeCode || '';
                if ((bankIdStr === '56' || this.accountCurrency === 'UGX') && ['CA232', 'CA214'].includes(scheme)) {
                  const quarterKey = this.getUgQuarterKey(this.statement?.toDate);
                  this.incrementUgUsage(this.selectedAccount?.accountNumber || '', quarterKey);
                }
                // If RW, increment yearly usage after generation
                if (bankIdStr === '50' || this.accountCurrency === 'RWF' || this.accountCurrency === 'FRW') {
                  const yearKey = this.getRwYearKey(this.statement?.toDate);
                  this.incrementRwUsage(this.selectedAccount?.accountNumber || '', yearKey);
                }
              } catch {}

              this.router.navigate(['/services/account-statements/success']);

          });


  }

  // Helpers: track UG quarterly free usage for CA232/CA214 by account
  private getUgQuarterKey(dateStr?: string): string {
    const d = dateStr ? new Date(dateStr) : new Date();
    const y = d.getFullYear();
    const q = Math.floor(d.getMonth() / 3) + 1; // 1..4
    return `${y}-Q${q}`;
  }
  private getUgUsage(accountNumber: string, quarterKey: string): number {
    try {
      const key = `UG_STMT_QTR_USAGE_${accountNumber}_${quarterKey}`;
      const raw = localStorage.getItem(key);
      const n = raw ? parseInt(raw, 10) : 0;
      return isNaN(n) ? 0 : n;
    } catch {
      return 0;
    }
  }
  private incrementUgUsage(accountNumber: string, quarterKey: string): void {
    try {
      const key = `UG_STMT_QTR_USAGE_${accountNumber}_${quarterKey}`;
      const current = this.getUgUsage(accountNumber, quarterKey);
      localStorage.setItem(key, String(current + 1));
    } catch {}
  }

  // Helpers: track RW yearly free usage by account
  private getRwYearKey(dateStr?: string): string {
    const d = dateStr ? new Date(dateStr) : new Date();
    const y = d.getFullYear();
    return `${y}`;
  }
  private getRwUsage(accountNumber: string, yearKey: string): number {
    try {
      const key = `RW_STMT_YEAR_USAGE_${accountNumber}_${yearKey}`;
      const raw = localStorage.getItem(key);
      const n = raw ? parseInt(raw, 10) : 0;
      return isNaN(n) ? 0 : n;
    } catch {
      return 0;
    }
  }
  private incrementRwUsage(accountNumber: string, yearKey: string): void {
    try {
      const key = `RW_STMT_YEAR_USAGE_${accountNumber}_${yearKey}`;
      const current = this.getRwUsage(accountNumber, yearKey);
      localStorage.setItem(key, String(current + 1));
    } catch {}
  }

  getPeriod(value: string, index: number) {
    this.selectedIndex = index;
    this.buttonValue = value;

    this.validPeriod = value !== '0';
    switch (value) {
      case '0':
        this.period = this.translateService.instant(
          'CUSTOMER.ACCOUNT-SERVICES.STATEMENT.CUSTOM'
        );
        break;
      case '1':
        this.period = this.translateService.instant(
          'CUSTOMER.ACCOUNT-SERVICES.STATEMENT.CURRENT-MONTH'
        );
        break;
      case '3':
        this.period = this.translateService.instant(
          'CUSTOMER.ACCOUNT-SERVICES.STATEMENT.LAST-3-MONTHS'
        );
        break;
      case '6':
        this.period = this.translateService.instant(
          'CUSTOMER.ACCOUNT-SERVICES.STATEMENT.LAST-6-MONTHS'
        );
        break;
      case '12':
        this.period = this.translateService.instant(
          'CUSTOMER.ACCOUNT-SERVICES.STATEMENT.LAST-12-MONTHS'
        );
        break;
      default:
        break;
    }

    if (value == '0') {
      this.periodForm.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(date => {
        this.startDateIsMore = false;
        this.maxStartDate = date.endDate;

        this.statement.fromDate = this.formatDate(new Date(date.startDate));
        this.statement.toDate = this.formatDate(new Date(date.endDate));

        if (date.startDate && date.endDate) {
          this.startDateIsMore =
            new Date(date.startDate).getTime() >
            new Date(date.endDate).getTime();
        }
      });
    } else if (value == '1') {
      const currentDate = new Date();
      const firstDayOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );
      this.statement.fromDate = this.formatDate(firstDayOfMonth);
      this.statement.toDate = this.formatDate(currentDate);
    } else {
      const d = new Date();
      d.setMonth(d.getMonth() - parseInt(value));
      this.statement.fromDate = this.formatDate(d);
      this.statement.toDate = this.formatDate(this.maxDate);
    }
  }

  getStatementType(event: MatRadioChange) {
    this.validStatement = true;

    if (event.value == 'full') this.statementType = 0;
    else if (event.value == 'debit') this.statementType = 1;
    else if (event.value == 'credit') this.statementType = 2;

    this.statement.statementType = this.statementType;
  }

  deliveryMode(event: any) {
    this.delivery = event.value;
    this.validDelivery = true;

    this.delivery_Mode =
      this.delivery == 'EmailStatement'
        ? this.translateService.instant(
            'CUSTOMER.ACCOUNT-SERVICES.STATEMENT.EMAIL'
          )
        : this.delivery == 'PrintStatement'
          ? this.translateService.instant(
              'CUSTOMER.ACCOUNT-SERVICES.STATEMENT.PRINT-ONLY'
            )
          : this.translateService.instant(
              'CUSTOMER.ACCOUNT-SERVICES.STATEMENT.PRINT-CERTIFY-STATEMENT'
            );

    this.statement.actionName = this.delivery;

    if (this.delivery !== 'EmailStatement') {
      this.isPrinting = true;
    } else this.isPrinting = false;
  }

  paymentMode(event: MatRadioChange) {
    this.waiveCharges = event.value === 'WaiveCharges';
    // If waiver selected, ensure UG + role gating and rely on reactive waiverForm for reason
    if (this.waiveCharges) {
      const workClass = String(this.session.userWorkClass || '').trim();
      const bankId = String(this.userInfo?.bankID || '');
      const isUganda = this.subsidiary?.countryCode === 'UG' || bankId === '56' || this.accountCurrency === 'UGX';
      const canWaive = isUganda && ['150', '200'].includes(workClass);
      if (!canWaive) {
        this.toast.show(
          this.translateService.instant('TOAST.GENERATE-STATEMENT'),
          this.translateService.instant('COMMON.UNAUTHORIZED'),
          MessageBoxType.DANGER,
          5000, undefined, undefined, false
        );
        this.waiveCharges = false;
        return;
      }
      this.waiverForm?.get('reason')?.markAsTouched();
    }
  }

  shouldDisableWaiveCharges(): boolean {
    return this.subsidiary?.countryCode === 'RW';
  }

  private handleChargeAccountChange(): void {
    this.accountCharged = this.accountForm?.value?.accountNo;
  }

  initialize(): void {
    this.generateAccountForm = this.fb.group({
      generateAccountNo: [
        this.accountNumbers[0].accountNumber,
        Validators.required,
      ],
    });

    this.accountForm = this.fb.group({
      accountNo: [this.accountNumbers[0].accountNumber, Validators.required],
    });
    this.newSelectedAccount = this.accountNumbers[0];

    this.generateAccountForm.valueChanges
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe(res => {
      this.selectedAccount = this.accountNumbers.find(
        (account: any) => account.accountNumber === res.generateAccountNo
      );
      this.accountIdChange.emit(this.selectedAccount.accountNumber);
      this.minStartDate = new Date(this.selectedAccount.accountOpeningDate);
      this.handleChargeAccountChange();
    });

    this.accountForm.valueChanges
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe(res => {
      this.newSelectedAccount = this.accountNumbers.find(
        (account: any) => account.accountNumber === res.accountNo
      );
      this.handleChargeAccountChange();
    });
    
    // Re-evaluate charge text when the account to be charged changes
    this.accountForm.get('accountNo')?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.updateChargeText());

    this.handleChargeAccountChange();

    this.periodForm = this.fb.group({
      startDate: [null, Validators.required],
      endDate: [null, Validators.required],
    });

    if (!this.waiverForm) {
      this.waiverForm = this.fb.group({
        reason: ['', Validators.required],
      });
    }
  }
  
  private updateChargeText(): void {
    if (!this.latestStatementRequest) return;

    const currency = this.newSelectedAccount?.accountCurrency || this.accountCurrency;
    const scheme = this.selectedAccount?.schemeCode || '';
    const baseCharge = (this.latestStatementRequest.responseObject?.statementFee || 0) + (this.latestStatementRequest.responseObject?.statementDuty || 0);

    const context: ChargeCalculationContext = {
      subsidiary: this.subsidiary,
      currency: currency,
      scheme: scheme,
      delivery: this.delivery as 'PrintStatement' | 'CertifyPrintStatement' | 'EmailStatement',
      baseCharge: baseCharge,
      getUgUsage: this.getUgUsage.bind(this),
      getRwUsage: this.getRwUsage.bind(this),
      getUgQuarterKey: this.getUgQuarterKey.bind(this),
      getRwYearKey: this.getRwYearKey.bind(this),
      accountNumber: this.selectedAccount?.accountNumber || '',
      toDate: this.statement?.toDate,
      currencyService: this.currencyService,
      rwfConversionRates: this.rwfConversionRates,
      kesConversionRates: this.kesConversionRates,
      ugxConversionRates: this.ugxConversionRates,
      sspConversionRates: this.sspConversionRates,
    };

    const chargeDetails = getStatementChargeDetails(context);
    this.printingChargePerPageText = this.printCertifyChargeText = chargeDetails.message;
  }

  getNationlID(): { id: string; type: string } {
    return this.customerData.identifications.find(
      (identity: { id: string; type: string }) => identity.type === 'NationalID'
    );
  }

  onVerifyGenerateStatement() {
    const workClass = String(this.session.userWorkClass || '').trim();
    let reason = '';
    if (workClass === '50') {
      reason = 'customer experience staff';
    } else if (workClass === '65') {
      reason = 'Diaspora support';
    }

    let bioModels: Bio = {
      bioModels: [
        {
          cif: this.selectedAccount.cif,
          skipBio: true,
          reason: reason,
          fingerprints: [],
        },
      ],
    };

    this.accountStatementService
      .verifyBio(bioModels, this.taskId, true)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(
        (response: any) => {
          if (!response.successful) {
            this.toast.show(
              this.translateService.instant('TOAST.GENERATE-STATEMENT'),
              response.statusMessage,
              MessageBoxType.DANGER,
              5000, undefined, undefined, false
            );
            return;
          }
          if (response.successful) {
            this.router.navigateByUrl('/dashboard');
          }
        }, (err: string) => {
          this.toast.show(
            err,
            '',
            MessageBoxType.DANGER,
            5000, undefined, undefined, false
          );
        })
    }

  ngOnDestroy(): void {
    if (this.statementRequestSubscription$) {
      this.statementRequestSubscription$.unsubscribe();
    }
  }

  private formatDate(date: Date) {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  private handleValidationError(res: any) {
    const errorMessage = res?.error?.responseObject || res?.error?.statusMessage || 'An unknown error occurred.';
    const isUganda = this.subsidiary?.countryCode === 'UG';

    if (isUganda) {
      const dialogRef = this.dialog.open(DialogStatementComponent, {
        width: '500px',
        data: {
          isErrorDialog: true,
          title: 'Validation Error',
          message: errorMessage,
          confirmButtonText: 'Amend Statement',
          cancelButtonText: 'End Process',
        },
      });

      dialogRef.afterClosed()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(amend => {
          if (amend) {
            // User wants to amend, so we do nothing and they stay on the page.
          } else {
            // User clicked "End Process" or closed the dialog
            this.router.navigateByUrl('/dashboard');
          }
        });
    } else {
      // Default behavior for other countries
      this.toast.show(
        this.translateService.instant('TOAST.GENERATE-STATEMENT'),
        errorMessage,
        MessageBoxType.DANGER,
        5000, undefined, undefined, false
      );
    }
  }
}
