import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { delay, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { AccountService } from '@app/core/services/account/account.service';
import { StandingOrderService } from '@app/core/services/standing-order/standing-order.service';
import { VerifyBioDialogComponent } from '@app/shared/components/verify-bio-dialog/verify-bio-dialog.component';
import { VerifySkipBioComponent } from '@app/shared/components/verify-skip-bio/verify-skip-bio.component';
import { WhiteSpaceValidator } from '@app/shared/directives/whitespace-validator';
import { MessageBoxType, ToastService } from '@app/shared/modules/toast';
import { environment } from '@env/environment';
import { ReviewDetailComponent } from '../review-detail/review-detail.component';
import { CurrencyMaskConfig, CurrencyMaskModule } from 'ng2-currency-mask';
import { VerifySignatoryDialogComponent } from '@app/shared/components/verify-signatory-dialog/verify-signatory-dialog.component';
import { VerifySignatoryBioDialogComponent } from '@app/shared/components/verify-signatory-bio-dialog/verify-signatory-bio-dialog.component';
import { AccountDetailsComponent } from '../../account-details/account-details.component';
import { StandingOrderDocumentsComponent } from '../standing-order-documents/standing-order-documents.component';

@Component({
  selector: 'app-amend-standing-order',
  templateUrl: './amend-standing-order.component.html',
  styleUrls: ['./amend-standing-order.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslatePipe,
    MatToolbarModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    CurrencyMaskModule,
    AccountDetailsComponent,
    StandingOrderDocumentsComponent,
  ],
})
export class AmendStandingOrderComponent implements OnInit, AfterViewInit {
  // @ts-ignore
  type = 'amend';
  fingerprintAccepted = false;
  executionTimes: any;
  datesOfMonth = Array.from(Array(31).keys()).map(d => `${d + 1}`);
  parentForm: any;
  panelOpenState = true;
  documentVerified = false;
  PaymentFrequencies: any;
  documents: any = [];
  ticketPayload: any = {};
  customer: any;
  currentCustomer: any;
  isCustomerPresent: any;
  private destroy$ = new Subject();
  standingOrder: any;
  remittanceCurrencies: any;
  minStartDate: any;
  minEndDate: any;
  ticketId: any;
  customerData: any = JSON.parse(
    <string>localStorage.getItem('customerDetails')
  );
  isBusiness: boolean = JSON.parse(<string>localStorage.getItem('isBusiness'));
  notifcationForm: any;
  ticketResponse: any;
  currencyCode!: any;

  options!: CurrencyMaskConfig;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    public standingOrderService: StandingOrderService,
    public dialog: MatDialog,
    private toastService: ToastService,
    private accountService: AccountService,
    private translate: TranslateService
  ) {
    this.executionTimes = this.standingOrderService.getExecutionTimes();
    this.parentForm = this.formBuilder.group({
      beneficiaryDetailsForm: this.formBuilder.group({
        standingOrderType: [{ value: null, disabled: true }, Validators.required],
        beneficiaryBank: [{ value: null, disabled: true }, Validators.required],
        accountNumber: [{ value: null, disabled: true }, Validators.required],
        beneficiaryName: [{ value: null, disabled: true }, Validators.required],
        mobileNumber: [null, [Validators.pattern('[0-9 ]{12}')]],
        email: [null, Validators.email],
        physicalAddress: [null],
        recipientReferanceNumber: [null],
        remitterDetail: [null],
        branchCode: [null],
        branchCityCode: [null],
        branchCityCodeName: [null],
        branchCodeName: [null],
        bic: [null],
      }),
      paymentDetailsForm: this.formBuilder.group({
        amountToSend: [0, [Validators.required, Validators.min(1)]],
        paymentCurrency: [null, Validators.required],
        executionTime: [''],
        startDate: [null, Validators.required],
        endDate: [null],
        PaymentFrequency: [null, Validators.required],
        dayOfExecution: ['', Validators.required],
        paymentReason: [
          '',
          [Validators.required, WhiteSpaceValidator.containsOnlySpaces],
        ],
      }),
    });
    this.PaymentFrequencies = this.standingOrderService.getPaymentFrequencies();
    this.remittanceCurrencies = this.standingOrderService.getRemittanceCurrencies();
  }

  get paymentDetailsForm() {
    return this.parentForm.get('paymentDetailsForm') as UntypedFormGroup;
  }
  get beneficiaryDetailsForm() {
    return this.parentForm.get('beneficiaryDetailsForm') as UntypedFormGroup;
  }

  ngOnInit(): void {
    this.customer = JSON.parse(<string>localStorage.getItem('accMgntObj'));
    this.isCustomerPresent = this.customer?.isPresent;

    this.standingOrder = this.standingOrderService.standingOrder;
    if (!this.standingOrder) {
      this.goBack();
    }
    this.standingOrderService.getStandingOrder().subscribe(result => {
      let standingOrder = result.responseObject;
      this.currencyCode = standingOrder.senderDetails?.currencyCode;
      this.options = {
        prefix: `${this.currencyCode} `,
        suffix: '',
        thousands: '',
        decimal: '',
        allowNegative: false,
        align: 'right',
        precision: 0,
      };
      const startDate = new Date(standingOrder.senderDetails?.startDate);
      let endDate = null;
      if (standingOrder.senderDetails?.endDate !== null) {
        endDate = new Date(standingOrder.senderDetails?.endDate);
      }
      const today = Date.now();
      const todayDate = new Date(today);
      this.minStartDate = new Date(
        todayDate.getFullYear(),
        todayDate.getMonth(),
        todayDate.getDate() + 1
      );
      this.minEndDate = new Date(
        startDate.getFullYear(),
        startDate.getMonth() + 1,
        startDate.getDate() + 1
      );

      this.beneficiaryDetailsForm.patchValue(
        {
          standingOrderType: standingOrder.senderDetails?.standingOrderType,
          accountNumber: standingOrder.beneficiaryDetails?.destinationAccount,
          beneficiaryBank: standingOrder.beneficiaryDetails?.bankName,
          beneficiaryName: standingOrder.beneficiaryDetails?.fullName,
          remitterDetail: standingOrder.beneficiaryDetails?.remitterDetails,
          bic: standingOrder.beneficiaryDetails?.bic,
          recipientReferanceNumber:
            standingOrder.beneficiaryDetails?.recipientReferenceNumber,
          branchCityCode: standingOrder.beneficiaryDetails?.branchCityCode,
          branchCode: standingOrder.beneficiaryDetails?.branchCode,
          branchCityCodeName:
            standingOrder.beneficiaryDetails?.branchCityCodeName,
          branchCodeName: standingOrder.beneficiaryDetails?.branchCodeName,
          email: standingOrder.beneficiaryDetails?.email,
          mobileNumber: standingOrder.beneficiaryDetails?.phone,
          physicalAddress: standingOrder.beneficiaryDetails?.address,
        },
        { emitEvent: false }
      );
      this.paymentDetailsForm.patchValue(
        {
          paymentReason: standingOrder.senderDetails?.paymentReason,
          executionTime: standingOrder.senderDetails?.executionTime,
          dayOfExecution: standingOrder.senderDetails?.dayOfExecution,
          paymentCurrency: standingOrder.senderDetails?.currencyCode,
          PaymentFrequency: standingOrder.senderDetails?.frequency,
          amountToSend: standingOrder.senderDetails?.amount,
          startDate: startDate.toISOString(),
          endDate: endDate?.toISOString(),
        },
        { emitEvent: false }
      );
      if (standingOrder.senderDetails?.standingOrderType === 'WithinEquity') {
        this.beneficiaryDetailsForm.patchValue(
          { beneficiaryBank: 'Equity' },
          { emitEvent: false }
        );
      }
      this.paymentDetailsForm.controls['paymentCurrency'].disable();
      this.paymentDetailsForm.controls['executionTime'].disable();
      Object.keys(this.beneficiaryDetailsForm.controls).forEach(key => {
        this.beneficiaryDetailsForm.controls[key].disable();
      });
    });
  }
  ngAfterViewInit(): void {
    this.paymentDetailsForm
      .get('amountToSend')
      ?.valueChanges.pipe(distinctUntilChanged())
      .subscribe(value => {
        this.paymentDetailsForm
          .get('amountToSend')
          ?.patchValue(this.standingOrderService.getAmountPrecision(value));
      });
  }
  get isOtherBank() {
    return (
      this.parentForm.get('beneficiaryDetailsForm')?.get('standingOrderType')
        ?.value == 'OtherLocalBanks'
    );
  }
  comparisonEnddateValidator(): any {
    let ldStartDate = this.paymentDetailsForm.value['startDate'];
    let ldEndDate = this.paymentDetailsForm.value['endDate'];

    let startnew = new Date(ldStartDate);
    let endnew = new Date(ldEndDate);
    if (ldEndDate && startnew > endnew) {
      return this.paymentDetailsForm.controls['endDate'].setErrors({
        invaliddaterange: true,
      });
    }
    this.paymentDetailsForm.controls['startDate'].reset();
    this.paymentDetailsForm.controls['startDate'].patchValue(startnew);
  }

  comparisonStartdateValidator(): any {
    let ldStartDate = this.paymentDetailsForm.value['startDate'];
    let ldEndDate = this.paymentDetailsForm.value['endDate'];
    if (this.paymentDetailsForm.controls['endDate'].touched || ldEndDate) {
      let startnew = new Date(ldStartDate);
      let endnew = new Date(ldEndDate);

      if (ldEndDate && startnew > endnew) {
        return this.paymentDetailsForm.controls['startDate'].setErrors({
          invaliddaterange: true,
        });
      }

      if (ldEndDate) {
        this.paymentDetailsForm.controls['endDate'].reset();
        this.paymentDetailsForm.controls['endDate'].patchValue(endnew);
      }
    }
  }
  searchCustomerByAccNo(accountNumber: string) {
    const standingOrderType =
      this.beneficiaryDetailsForm?.value['standingOrderType'];

    if (standingOrderType === 'WithinEquity') {
      if (accountNumber.length < 13) return;
      this.toastService.dismissed();
      this.beneficiaryDetailsForm
        .get('beneficiaryName')
        ?.setValue('', { emitEvent: false, onlySelf: true });
      let currentCustomer = this.standingOrderService.getCustomerDetail();

      const query = `?Id=${accountNumber}&bankId=${currentCustomer?.accountDetails.bankId}&idType=accountid`;

      this.accountService.getAccount(query).subscribe(
        res => {
          if (res.successful && res.responseObject) {
            const beneficiary = res.responseObject;

                        let accounts =
                            beneficiary.accounts.find(
                                (v: any) =>
                                    v.accountStatus === "A" &&
                                    v.accountNumber === accountNumber,
                            ) || {};
                        if (accounts) {
                            this.beneficiaryDetailsForm.patchValue(
                                {
                                    beneficiaryName: `${beneficiary.firstName} ${beneficiary.lastName}`,
                                },
                                { emitEvent: false },
                            );
                            this.paymentDetailsForm.patchValue(
                                {
                                    paymentCurrency: accounts.accountCurrency,
                                },
                                { emitEvent: false },
                            );
                            this.parentForm
                                .get("paymentDetailsForm")
                                ?.get("paymentCurrency")
                                ?.disable();
                        } else {
                            this.beneficiaryDetailsForm
                                .get("beneficiaryName")
                                ?.setValue("", {
                                    emitEvent: false,
                                    onlySelf: true,
                                });
                        }
                    }
                },
                (err) => {
                    this.toastService.show("Error", err, MessageBoxType.DANGER,
                        5000, undefined, undefined, false
                    );
                },
            );
        }
    }

  amendStandingOrder = () => {
    this.currentCustomer = this.standingOrderService.getCustomerDetail();

    const dialogRef = this.dialog.open(ReviewDetailComponent, {
      data: {
        payment: this.paymentDetailsForm,
        beneficiary: this.beneficiaryDetailsForm,
        documents: this.documents,
        stop: false,
        methodType: 'Update',
      },
      width: '1000px',
      height: '95%',
    });
    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(r => {
        if (!r.confirm) {
          return;
        }
        this.notifcationForm = r;
        this.createTicket();
      });
  };

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
        doNotRedirectOnSuccess: false,
        dontNavigate: true,
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (data === 'canVerify' && result.data && result.status === data)
        return this.openVerifySignatoryBioDialog(result.data);
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
        dontNavigate: true,
        softDelete: true,
        ticketId: this.ticketId,
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.submitStandingOrder(this.notifcationForm);
      }
    });
  }

  openVerifyBioDialog = () => {
    // const customer: any = JSON.parse(
    //     <string>localStorage.getItem('accMgntObj')
    // );
    const accounts: any = JSON.parse(<string>localStorage.getItem('accounts'));
    const filteredAccount = accounts.filter(
      (account: any) =>
        account.accountNumber === this.standingOrderService?.accountNumber
    );

    const verifyBioData: any = {
      hideSkipBio: true,
      inProcess: true,
      accepted: this.isCustomerPresent,
      callback: true,
      dontNavigate: true,
      doNotOpenSkipModal: true,
      doNotRedirectOnSuccess: true,
      cif: this.customer.cif,
      standingOrder: true,
      ticketId: this.ticketId,
      searchFlow: false,
      user: {
        firstName: this.customer.firstName,
        lastName: this.customer.lastName,
        accounts: filteredAccount,
        cif: this.customer.cif,
      },
    };

    const dialogRef = this.dialog.open(VerifyBioDialogComponent, {
      width: '45%',
      height: 'auto',
      panelClass: 'mandate-dialog',
      data: verifyBioData,
    });

    dialogRef.afterClosed().subscribe(result => {
      this.submitStandingOrder(this.notifcationForm);
    });
  };

  verifyBio() {
    const accounts: any = JSON.parse(<string>localStorage.getItem('accounts'));
    const filteredAccount = accounts.filter(
      (account: any) =>
        account.accountNumber === this.standingOrderService?.accountNumber
    );

    if (filteredAccount[0]?.mandate !== 'SELF' || this.isBusiness) {
      this.openSignatoriesDialog('canVerify');
    } else {
      this.openVerifyBioDialog();
    }
  }

    createTicket() {
        this.ticketPayload = this.standingOrderService.getAmendTicket(
            this.isCustomerPresent,
        );
        // If customer is not present, pass the view/access profile ticket id.
        if (!this.isCustomerPresent) {
            Object.assign(this.ticketPayload, {
                ViewProfileTicketId:
                    this.customer?.accessProfileTicket.id.toString(),
            });
        }
        this.standingOrderService
            .createTicket(this.ticketPayload)
            .subscribe(async (res) => {
                if (!res.successful) {
                    this.toastService.show(
                        "error",
                        res.statusMessage,
                        MessageBoxType.DANGER,
                        5000, undefined, undefined, false
                    );
                    return;
                }
                this.ticketId = res.responseObject.id;
                this.ticketResponse = res;
                this.uploadAndSubmitDoc();
            });
    }
    uploadAndSubmitDoc() {
        this.standingOrderService
            .getUploadDocumentTicket(this.ticketId, this.documents)
            .subscribe((uploadTicket) => {
                this.standingOrderService
                    .uploadStandingOrderDocuments(uploadTicket)
                    .subscribe((res) => {
                        if (!res.successful) {
                            this.toastService.show(
                                "error",
                                res.statusMessage,
                                MessageBoxType.DANGER,
                                5000, undefined, undefined, false
                            );
                            return;
                        }
                        this.submitDoc();
                    });
            });
    }

  submitStandingOrder(notificationDetails: any) {
    let data = this.standingOrderService.getAmendSubmitData(
      {
        payment: this.paymentDetailsForm.getRawValue(),
        beneficiary: this.beneficiaryDetailsForm.getRawValue(),
        NotificationDetails: notificationDetails.form.value,
        SkipBio: this.isCustomerPresent,
      },
      this.ticketResponse
    );

        this.standingOrderService
            .submitTicket(data, this.ticketId)
            .subscribe((res) => {
                if (!res.successful) {
                    this.toastService.show(
                        "error",
                        res.statusMessage,
                        MessageBoxType.DANGER,
                        5000, undefined, undefined, false
                    );
                    return;
                }
                const msg = this.isCustomerPresent
                    ? "Amend Standing Order Request Is Successful"
                    : "Amend Standing Order Request submitted to checker successfully";
                this.toastService.show(null, `${msg}`, MessageBoxType.SUCCESS,
                    5000, undefined, undefined, false
                );
                this.router.navigateByUrl("services/standing-order/success");
            });
    }
    submitDoc() {
        const upload$ = this.standingOrderService.submitStandingOrderDocuments(
            this.ticketId,
            {},
        );
        upload$.pipe(delay(2000));
        upload$.subscribe(() => {
            if (!this.isCustomerPresent) {
                this.submitStandingOrder(this.notifcationForm);
            } else {
                this.verifyBio();
            }
        });
    }
    openSkipBioDialog(notificationDetails?: any) {
        const user = this.customerData;
        const dialogRef = this.dialog.open(VerifySkipBioComponent, {
            data: {
                user: event ? user : "",
                headerText: event
                    ? "Standing Order verification"
                    : "Skip Biometric",
                subHeaderText: event
                    ? "Requirements for Standing Order verification"
                    : "Requirements for bio-override",
            },
        });

    dialogRef.afterClosed().subscribe(result => {
      this.submitStandingOrder(notificationDetails);
    });
  }
  uploadsDocuments(documents: any) {
    this.documents = documents;
    if (documents.length === 0) {
      this.documentVerified = false;
      return;
    }
    this.documentVerified = true;
  }
  goBack = () => {
    this.router.navigateByUrl('/services/standing-order');
  };
}
