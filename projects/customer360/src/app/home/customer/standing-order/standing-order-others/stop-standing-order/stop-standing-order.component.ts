import { AfterViewInit, Component, OnInit } from '@angular/core';
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
import { VerifyBioDialogComponent } from '@app/shared/components/verify-bio-dialog/verify-bio-dialog.component';
import { MessageBoxType, ToastService } from '@app/shared/modules/toast';
import { StandingOrderService } from '@app/core/services/standing-order/standing-order.service';
import { environment } from '@env/environment';
import { ReviewDetailComponent } from '../review-detail/review-detail.component';
import { CurrencyMaskModule } from 'ng2-currency-mask';
import { VerifySkipBioComponent } from '@app/shared/components/verify-skip-bio/verify-skip-bio.component';
import { VerifySignatoryDialogComponent } from '@app/shared/components/verify-signatory-dialog/verify-signatory-dialog.component';
import { VerifySignatoryBioDialogComponent } from '@app/shared/components/verify-signatory-bio-dialog/verify-signatory-bio-dialog.component';
import { AccountDetailsComponent } from '../../account-details/account-details.component';
import { StandingOrderDocumentsComponent } from '../standing-order-documents/standing-order-documents.component';

@Component({
  selector: 'app-stop-standing-order',
  templateUrl: './stop-standing-order.component.html',
  styleUrls: ['./stop-standing-order.component.scss'],
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
export class StopStandingOrderComponent implements OnInit, AfterViewInit {
  type = 'stop';
  executionTimes: any;
  datesOfMonth = Array.from(Array(31).keys()).map(d => `${d + 1}`);
  // @ts-ignore
  parentForm: any;
  isBusiness: boolean = JSON.parse(<string>localStorage.getItem('isBusiness'));
  fingerprintAccepted = false;
  panelOpenState = true;
  documentVerified = false;
  PaymentFrequencies: any;
  documents: any;
  isCustomerPresent: any;
  currentCustomer: any;
  remittanceCurrencies: any;
  minEndDate: any;
  private destroy$ = new Subject();
  ticketPayload: any = {};
  customer: any;
  ticketId: any;
  ticketResponse: any;
  customerData: any = JSON.parse(
    <string>localStorage.getItem('customerDetails')
  );
  notifcationForm: any;
  standingOrder: any;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    public dialog: MatDialog,
    public standingOrderService: StandingOrderService,
    private toastService: ToastService,
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
        amountToSend: [
          { value: 0, disabled: true },
          [Validators.required, Validators.min(1)],
        ],
        paymentCurrency: [{ value: null, disabled: true }, Validators.required],
        executionTime: [''],
        startDate: [{ value: null }, Validators.required],
        endDate: [{ value: null }, Validators.required],
        PaymentFrequency: [{ value: null, disabled: true }, Validators.required],
        dayOfExecution: ['', Validators.required],
        paymentReason: [null],
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
  get isOtherBank() {
    return (
      this.parentForm.get('beneficiaryDetailsForm')?.get('standingOrderType')
        ?.value == 'OtherLocalBanks'
    );
  }
  ngOnInit(): void {
    this.customer = JSON.parse(<string>localStorage.getItem('accMgntObj'));
    this.isCustomerPresent = this.customer?.isPresent;

    this.standingOrder = this.standingOrderService.standingOrder;
    if (!this.standingOrder) {
      this.goBack();
    }
    this.standingOrderService.getStandingOrder().subscribe(result => {
      if (!result) {
        this.goBack();
      }
      const standingOrder = result.responseObject;
      const endDate = new Date(standingOrder.senderDetails?.endDate);

      this.minEndDate = new Date(
        endDate.getFullYear(),
        endDate.getMonth(),
        endDate.getDate() + 1
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
          paymentReason: standingOrder.senderDetails?.paymentReason
            ? standingOrder.senderDetails?.paymentReason
            : 'Deleting',
          executionTime: standingOrder.senderDetails?.executionTime,
          dayOfExecution: standingOrder.senderDetails?.dayOfExecution,
          paymentCurrency: standingOrder.senderDetails?.currencyCode,
          PaymentFrequency: standingOrder.senderDetails?.frequency,
          amountToSend: standingOrder.senderDetails?.amount,
          startDate: standingOrder.senderDetails?.startDate,
          endDate: standingOrder.senderDetails?.endDate,
        },
        { emitEvent: false }
      );
      if (standingOrder.senderDetails?.standingOrderType === 'WithinEquity') {
        this.beneficiaryDetailsForm.patchValue(
          { beneficiaryBank: 'Equity' },
          { emitEvent: false }
        );
      }
      Object.keys(this.beneficiaryDetailsForm.controls).forEach(key => {
        this.beneficiaryDetailsForm.controls[key].disable();
      });
      Object.keys(this.paymentDetailsForm.controls).forEach(key => {
        this.paymentDetailsForm.controls[key].disable();
      });
    });
  }

  ngAfterViewInit() {
    this.paymentDetailsForm
      .get('PaymentFrequency')
      ?.valueChanges.pipe(distinctUntilChanged())
      .subscribe(frequency => {
        if (['Daily', 'Weekly'].includes(frequency)) {
          this.paymentDetailsForm.controls['dayOfExecution'].setValue('');
          this.paymentDetailsForm.controls['dayOfExecution'].setValidators(
            null
          );
        } else {
          this.paymentDetailsForm.controls['dayOfExecution'].setValidators(
            Validators.required
          );
        }
        this.paymentDetailsForm.controls[
          'dayOfExecution'
        ].updateValueAndValidity();
      });
  }

  stopStandingOrder = () => {
    this.currentCustomer = this.standingOrderService.getCustomerDetail();

    const dialogRef = this.dialog.open(ReviewDetailComponent, {
      data: {
        payment: this.paymentDetailsForm,
        beneficiary: this.beneficiaryDetailsForm,
        documents: this.documents,
        stop: true,
        methodType: 'Delete',
      },
      width: '1000px',
      height: '95%',
    });

        dialogRef
            .afterClosed()
            .pipe(takeUntil(this.destroy$))
            .subscribe((r: any) => {
                if (!r.confirm) {
                    return;
                }
                this.notifcationForm = r;
                this.createTicket();
            });
    };

    createTicket = () => {
        this.ticketPayload = this.standingOrderService.getStopTicket(
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
    };
    openBioModal = () => {
        // const customer: any = JSON.parse(
        //     <string>localStorage.getItem('accMgntObj')
        // );
        const accounts: any = JSON.parse(
            <string>localStorage.getItem("accounts"),
        );
        const filteredAccount = accounts.filter(
            (account: any) =>
                account.accountNumber ===
                this.standingOrderService?.accountNumber,
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

        dialogRef.afterClosed().subscribe((result: any) => {
            this.uploadAndSubmitDoc();
        });
    };
    uploadAndSubmitDoc = () => {
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
    };

  submitStandingOrder(notificationDetails: any) {
    let data = this.standingOrderService.getStopSubmitData(
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
                    ? "Stop Standing Order Request Is Successful"
                    : "Stop Standing Order Request submitted to checker successfully";
                this.toastService.show(null, `${msg}`, MessageBoxType.SUCCESS, 5000, undefined, undefined, false);
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

        dialogRef.afterClosed().subscribe((result: any) => {
            if (data === "canVerify" && result.data && result.status === data)
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

        dialogRef.afterClosed().subscribe((result: any) => {
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
            width: "45%",
            height: "auto",
            panelClass: "mandate-dialog",
            data: verifyBioData,
        });

        dialogRef.afterClosed().subscribe(() => {
            this.submitStandingOrder(this.notifcationForm);
        });
    };
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

        dialogRef.afterClosed().subscribe(() => {
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
        this.router.navigateByUrl("/services/standing-order");
    };
}
