import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule, DecimalPipe } from "@angular/common";
import {
    FormsModule,
    ReactiveFormsModule,
    UntypedFormBuilder,
    UntypedFormGroup,
    Validators,
} from "@angular/forms";
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from "@angular/material/button";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatNativeDateModule } from "@angular/material/core";
import { MatSelectModule } from "@angular/material/select";
import { MatToolbarModule } from "@angular/material/toolbar";
import { Router } from "@angular/router";
import { TranslatePipe, TranslateService } from "@ngx-translate/core";
import { Subject } from "rxjs";
import { delay, distinctUntilChanged, takeUntil } from "rxjs/operators";
import { AccountService } from "@app/core/services/account/account.service";
import { BicSearchDialog } from "@app/shared/components/bic-search-dialog/bic-search-dialog";
import { VerifyBioDialogComponent } from "@app/shared/components/verify-bio-dialog/verify-bio-dialog.component";
import { MessageBoxType, ToastService } from "@app/shared/modules/toast";
import { StandingOrderService } from "@app/core/services/standing-order/standing-order.service";
import { ReviewDetailComponent } from "../review-detail/review-detail.component";
import { VerifySkipBioComponent } from "@app/shared/components/verify-skip-bio/verify-skip-bio.component";
import { StandingOrderDocumentsComponent } from "../standing-order-documents/standing-order-documents.component";
import { WhiteSpaceValidator } from "@app/shared/directives/whitespace-validator";
import { VerifySignatoryDialogComponent } from "@app/shared/components/verify-signatory-dialog/verify-signatory-dialog.component";
import { VerifySignatoryBioDialogComponent } from "@app/shared/components/verify-signatory-bio-dialog/verify-signatory-bio-dialog.component";
import { CurrencyMaskConfig, CurrencyMaskModule } from "ng2-currency-mask";
import { AccountDetailsComponent } from "../../account-details/account-details.component";

@Component({
    selector: "app-create-standing-order",
    templateUrl: "./create-standing-order.component.html",
    styleUrls: ["./create-standing-order.component.scss"],
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
        DecimalPipe,
        AccountDetailsComponent,
        StandingOrderDocumentsComponent,
    ],
})
export class CreateStandingRequestComponent implements OnInit, AfterViewInit {
    type = "create";
    ticketPayload: any = {};
    @ViewChild(StandingOrderDocumentsComponent)
    standingOrderDocuments!: StandingOrderDocumentsComponent;
    executionTimes: any;
    datesOfMonth = Array.from(Array(31).keys()).map((d) => `${d + 1}`);
    // @ts-ignore
    parentForm: any;
    panelOpenState = true;
    documentVerified: boolean = false;
    PaymentFrequencies: any;
    documents: any;
    customer: any;
    isCustomerPresent: any;
    currentCustomer: any;
    remittanceCurrencies: any;
    minStartDate: any;
    minEndDate: any;

    private destroy$ = new Subject();
    accountNumber: any;
    ticketId: any;
    ticketResponse: any;
    customerData: any = JSON.parse(
        <string>localStorage.getItem("customerDetails"),
    );
    notifcationForm: any;
    bankCode: any;
    isBusiness: boolean = JSON.parse(
        <string>localStorage.getItem("isBusiness"),
    );
    fingerprintAccepted: boolean = false;
    options!: CurrencyMaskConfig;
    constructor(
        private formBuilder: UntypedFormBuilder,
        private router: Router,
        public dialog: MatDialog,
        public standingOrderService: StandingOrderService,
        private toastService: ToastService,
        private translate: TranslateService,
        private accountService: AccountService,
        private decimalPipe: DecimalPipe,
    ) {
        this.executionTimes = this.standingOrderService.getExecutionTimes();
        this.parentForm = this.formBuilder.group({
            beneficiaryDetailsForm: this.formBuilder.group({
                standingOrderType: ["WithinEquity", Validators.required],
                beneficiaryBank: [null, Validators.required],
                mobileNumber: [
                    null,
                    [
                        Validators.pattern("^[0-9]*$"),
                        Validators.maxLength(12),
                        Validators.minLength(9),
                    ],
                ],
                email: [null, Validators.email],
                physicalAddress: [null],
                recipientReferanceNumber: [null],
                remitterDetail: [null],
                branchCode: [null],
                branchCityCode: [null],
                branchCityCodeName: [null],
                branchCodeName: [null],
                bic: [null],
                accountNumber: [
                    null,
                    [
                        Validators.required,
                        Validators.maxLength(13),
                        Validators.minLength(13),
                    ],
                ],
                beneficiaryName: [
                    null,
                    [Validators.required, Validators.minLength(3)],
                ],
            }),
            paymentDetailsForm: this.formBuilder.group({
                amountToSend: [0, [Validators.required, Validators.min(1)]],
                paymentReason: [
                    "",
                    [
                        Validators.required,
                        WhiteSpaceValidator.containsOnlySpaces,
                        Validators.maxLength(50),
                    ],
                ],
                paymentCurrency: [null, Validators.required],
                executionTime: ["A", Validators.required],
                dayOfExecution: ["", Validators.required],
                startDate: ["", Validators.required],
                endDate: [""],
                PaymentFrequency: [null, Validators.required],
            }),
        });
        this.PaymentFrequencies = this.standingOrderService.getPaymentFrequencies();
        this.remittanceCurrencies = this.standingOrderService.getRemittanceCurrencies();
    }
    ngAfterViewInit(): void {
        this.beneficiaryDetailsForm
            .get("standingOrderType")
            ?.patchValue("WithinEquity");
        this.checkStandingOrderType("WithinEquity");
        this.paymentDetailsForm.get("executionTime")?.setValue("A");
        this.paymentDetailsForm
            .get("PaymentFrequency")
            ?.valueChanges.pipe(distinctUntilChanged())
            .subscribe((frequency) => {
                if (["Daily", "Weekly"].includes(frequency)) {
                    this.paymentDetailsForm.controls["dayOfExecution"].setValue(
                        "",
                    );
                    this.paymentDetailsForm.controls[
                        "dayOfExecution"
                    ].setValidators(null);
                } else {
                    this.paymentDetailsForm.controls[
                        "dayOfExecution"
                    ].setValidators(Validators.required);
                }
                this.paymentDetailsForm.controls[
                    "dayOfExecution"
                ].updateValueAndValidity();
            });
        this.paymentDetailsForm
            .get("amountToSend")
            ?.valueChanges.pipe(distinctUntilChanged())
            .subscribe((value) => {
                this.paymentDetailsForm
                    .get("amountToSend")
                    ?.patchValue(
                        // this.standingOrderService.getAmountPrecision(value),
                        value
                    );
            });
    }

    get paymentDetailsForm() {
        return this.parentForm.get("paymentDetailsForm") as UntypedFormGroup;
    }

    get beneficiaryDetailsForm() {
        return this.parentForm.get(
            "beneficiaryDetailsForm",
        ) as UntypedFormGroup;
    }

    get isOtherBank() {
        return (
            this.parentForm
                .get("beneficiaryDetailsForm")
                ?.get("standingOrderType")?.value == "OtherLocalBanks"
        );
    }

    ngOnInit(): void {
        this.customer = JSON.parse(<string>localStorage.getItem("accMgntObj"));
        this.isCustomerPresent = this.customer?.isPresent;
        if (!this.standingOrderService.getAccountNumber()) {
            this.goBack();
        }
        this.setMinDate();
    }

    setMinDate() {
        let current = new Date();
        this.minStartDate = new Date(
            current.getFullYear(),
            current.getMonth(),
            current.getDate() + 1,
        );
        this.minEndDate = new Date(
            current.getFullYear(),
            current.getMonth() + 1,
            current.getDate() + 1,
        );
    }

    isRequired(name: string): boolean {
        return (
            this.beneficiaryDetailsForm
                .get(name)
                ?.hasValidator(Validators.required) ?? false
        );
    }

    checkStandingOrderType(type: string) {
        let withInEquityNotRequired = [
            "recipientReferanceNumber",
            "remitterDetail",
            "branchCityCodeName",
            "branchCodeName",
        ];
        Object.keys(this.beneficiaryDetailsForm.controls)
            .filter((x) => x != "standingOrderType")
            .forEach((key) => {
                this.beneficiaryDetailsForm.controls[key].setValue("");
            });

        Object.keys(this.paymentDetailsForm.controls).forEach((key) => {
            this.paymentDetailsForm.controls[key].setValue("");
        });
        this.documents = [];
        this.documentVerified = false;
        this.standingOrderDocuments.reset();
        if (type === "WithinEquity") {
            withInEquityNotRequired.forEach((key) => {
                this.beneficiaryDetailsForm.controls[key].clearValidators();
                this.beneficiaryDetailsForm.controls[
                    key
                ].updateValueAndValidity();
            });
            this.parentForm
                .get("beneficiaryDetailsForm")
                ?.patchValue({ beneficiaryBank: "Equity" });
            this.parentForm
                .get("beneficiaryDetailsForm")
                ?.get("beneficiaryBank")
                ?.disable();
            this.parentForm
                .get("beneficiaryDetailsForm")
                ?.get("beneficiaryName")
                ?.disable();
            this.parentForm
                .get("beneficiaryDetailsForm")
                ?.get("beneficiaryName")
                ?.disable();
        } else {
            withInEquityNotRequired.forEach((key) => {
                this.beneficiaryDetailsForm.controls[key].setValidators(
                    Validators.required,
                );
                this.beneficiaryDetailsForm.controls[
                    key
                ].updateValueAndValidity();
            });
            this.parentForm
                .get("beneficiaryDetailsForm")
                ?.patchValue({ beneficiaryBank: "" });
            this.parentForm
                .get("beneficiaryDetailsForm")
                ?.get("beneficiaryBank")
                ?.enable();
            this.parentForm
                .get("beneficiaryDetailsForm")
                ?.get("branchCityCodeName")
                ?.disable();
            this.parentForm
                .get("beneficiaryDetailsForm")
                ?.get("branchCodeName")
                ?.disable();

            this.parentForm
                .get("beneficiaryDetailsForm")
                ?.get("accountNumber")
                ?.clearValidators();
            this.parentForm
                .get("beneficiaryDetailsForm")
                ?.get("accountNumber")
                ?.addValidators(Validators.required);
            this.parentForm
                .get("beneficiaryDetailsForm")
                ?.get("beneficiaryName")
                ?.enable();
            this.paymentDetailsForm.get("paymentCurrency")?.setValue("KES");
            this.paymentDetailsForm.get("paymentCurrency")?.disable();
            this.options = {
                prefix: "KES",
                suffix: "",
                thousands: "",
                decimal: "",
                allowNegative: false,
                align: "right",
                precision: 0,
            };
        }
        this.paymentDetailsForm.get("executionTime")?.setValue("A");
    }

    comparisonEnddateValidator(): any {
        let ldStartDate = this.paymentDetailsForm.value["startDate"];
        let ldEndDate: any;

        this.paymentDetailsForm.valueChanges.subscribe((res: any) => {
            ldEndDate = res.endDate;
        });

        let startnew = new Date(ldStartDate);
        let endnew = new Date(ldEndDate);
        if (startnew > endnew) {
            return this.paymentDetailsForm.controls["endDate"].setErrors({
                invaliddaterange: true,
            });
        }
        this.paymentDetailsForm.controls["startDate"].reset();
        this.paymentDetailsForm.controls["startDate"].patchValue(startnew);
    }

    comparisonStartdateValidator(): any {
        let ldStartDate = this.paymentDetailsForm.value["startDate"];
        let ldEndDate: any;

        this.paymentDetailsForm.valueChanges.subscribe((res: any) => {
            ldEndDate = res.endDate;
        });
        if (this.paymentDetailsForm.controls["endDate"].touched) {
            let startnew = new Date(ldStartDate);
            let endnew = new Date(ldEndDate);
            if (startnew > endnew) {
                return this.paymentDetailsForm.controls["startDate"].setErrors({
                    invaliddaterange: true,
                });
            }
            this.paymentDetailsForm.controls["endDate"].reset();
            this.paymentDetailsForm.controls["endDate"].patchValue(endnew);
        }
    }

    searchCustomerByAccNo(accountNumber: string) {
        const otherBankRequired = [
            "remitterDetail",
            "branchCityCode",
            "branchCode",
            "recipientReferanceNumber",
        ];

        const standingOrderType =
            this.beneficiaryDetailsForm?.value["standingOrderType"];
        this.accountNumber = accountNumber;
        otherBankRequired.map((item) => {
            this.beneficiaryDetailsForm.get(item)?.clearValidators();
            this.beneficiaryDetailsForm.get(item)?.updateValueAndValidity();
        });
        this.beneficiaryDetailsForm.controls["beneficiaryName"].setValue("");

        if (standingOrderType === "WithinEquity") {
            this.paymentDetailsForm.controls["endDate"].clearValidators();

            if (accountNumber.length < 13) return;
            this.toastService.dismissed();

            let currentCustomer =
                this.standingOrderService.getCustomerCifData();

            const query = `?Id=${accountNumber}&bankId=${currentCustomer?.bankID}&idType=accountid`;

            this.accountService.getAccount(query).subscribe(
                (res) => {
                    if (res.statusMessage != "User found.") {
                        this.beneficiaryDetailsForm.controls[
                            "beneficiaryName"
                        ].setValue("");
                        this.beneficiaryDetailsForm.setErrors({
                            invalid: true,
                        });
                        this.toastService.show(
                            "Error",
                            res.statusMessage,
                            MessageBoxType.DANGER,
                            5000, undefined, undefined, false
                        );

                        return;
                    } else {
                        const beneficiary = res.responseObject;

                        let accounts =
                            beneficiary.accounts.find(
                                (v: any) => v.accountNumber === accountNumber,
                            ) || {};

                        this.beneficiaryDetailsForm.patchValue(
                            {
                                beneficiaryName:
                                    beneficiary.firstName +
                                    " " +
                                    beneficiary.lastName,
                            },
                            { emitEvent: false },
                        );
                        this.paymentDetailsForm.patchValue(
                            { paymentCurrency: accounts.accountCurrency },
                            { emitEvent: false },
                        );

                        // this.options = {
                        //     prefix: accounts.accountCurrency + " ",
                        //     suffix: "",
                        //     thousands: "",
                        //     decimal: ".",
                        //     allowNegative: false,
                        //     align: "right",
                        //     precision: 2,
                        // };
                        this.parentForm
                            .get("paymentDetailsForm")
                            ?.get("paymentCurrency")
                            ?.disable();
                    }
                },
                (err) => {
                    this.toastService.show("Error", err, MessageBoxType.DANGER,
                        5000, undefined, undefined, false
                    );
                },
            );
        } else {
            otherBankRequired.map((item) => {
                this.beneficiaryDetailsForm
                    .get(item)
                    ?.setValidators(Validators.required);
                this.beneficiaryDetailsForm.get(item)?.updateValueAndValidity();
            });
        }
    }

    openBICDialog(): void {
        const dialogRef = this.dialog.open(BicSearchDialog, {
            data: { localBank: true },
            width: "450px",
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.parentForm.get("beneficiaryDetailsForm")?.patchValue({
                    beneficiaryBank: result.data?.bankName,
                    bic: result.data?.code,
                });
                this.bankCode = result.data?.code;
                this.parentForm
                    .get("beneficiaryDetailsForm")
                    ?.get("branchCityCodeName")
                    ?.enable();
                this.parentForm
                    .get("beneficiaryDetailsForm")
                    ?.get("branchCodeName")
                    ?.disable();
                this.parentForm
                    .get("beneficiaryDetailsForm")
                    ?.get("branchCityCodeName")
                    ?.setValue("");
                this.parentForm
                    .get("beneficiaryDetailsForm")
                    ?.get("branchCodeName")
                    ?.setValue("");
            }
        });
    }

    openCityDialog(): void {
        const dialogRef = this.dialog.open(BicSearchDialog, {
            data: { cities: true },
            width: "450px",
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.parentForm.get("beneficiaryDetailsForm")?.patchValue({
                    branchCityCode: result.data?.code,
                    branchCityCodeName: `${result.data?.code}-${result.data?.description}`,
                });

                this.parentForm
                    .get("beneficiaryDetailsForm")
                    ?.get("branchCodeName")
                    ?.enable();
                this.parentForm
                    .get("beneficiaryDetailsForm")
                    ?.get("branchCodeName")
                    ?.setValue("");
            }
        });
    }

    openBranchCodeDialog(): void {
        const dialogRef = this.dialog.open(BicSearchDialog, {
            data: {
                branchCityCode: true,
                bankCode: this.bankCode,
                cityCode:
                    this.beneficiaryDetailsForm.get("branchCityCode")?.value,
            },
            width: "450px",
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.parentForm.get("beneficiaryDetailsForm")?.patchValue({
                    branchCode: result.data?.branchCode,
                    branchCodeName: `${result.data?.branchCode}-${result.data?.name}`,
                });
            }
        });
    }

    reviewStandingOrder = () => {
        this.currentCustomer = this.standingOrderService.getCustomerDetail();

        const dialogRef = this.dialog.open(ReviewDetailComponent, {
            data: {
                payment: this.paymentDetailsForm,
                beneficiary: this.beneficiaryDetailsForm,
                documents: this.documents,
                stop: false,
                methodType: "Create",
            },
            width: "1000px",
            height: "95%",
        });
        dialogRef.afterClosed().subscribe((r) => {
            if (!r.confirm) {
                return;
            }
            this.notifcationForm = r;
            this.createTicket(null);
        });
    };

    createTicket(bioResult: any | null) {
        this.ticketPayload = this.standingOrderService.getCreateTicket(
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
                        "Error",
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

    verifyBio() {
        const accounts: any = JSON.parse(
            <string>localStorage.getItem("accounts"),
        );
        const filteredAccount = accounts.filter(
            (account: any) =>
                account.accountNumber ===
                this.standingOrderService?.accountNumber,
        );

        if (filteredAccount[0]?.mandate !== "SELF" || this.isBusiness) {
            this.openSignatoriesDialog("canVerify");
        } else {
            this.openVerifyBioDialog();
        }
    }

    submitStandingOrder(notificationDetails: any) {
        let data = this.standingOrderService.getSubmitData(
            {
                payment: this.paymentDetailsForm.getRawValue(),
                beneficiary: this.beneficiaryDetailsForm.getRawValue(),
                NotificationDetails: notificationDetails.form.value,
                SkipBio: this.isCustomerPresent,
            },
            this.ticketResponse,
        );

        this.standingOrderService
            .submitTicket(data, this.ticketId)
            .subscribe((res) => {
                if (!res.successful) {
                    this.toastService.show(
                        "Error",
                        res.statusMessage,
                        MessageBoxType.DANGER,
                        5000, undefined, undefined, false
                    );
                    return;
                }
                const msg = this.isCustomerPresent
                    ? "Standing Order Request Created Successfully"
                    : "Standing Order Request submitted to checker successfully";
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
        upload$.subscribe((res) => {
            if (!res.successful) {
                this.toastService.show(
                    "Error",
                    res.statusMessage,
                    MessageBoxType.DANGER,
                    5000, undefined, undefined, false
                );
                return;
            }
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
    if (documents.length === 0 || this.standingOrderDocuments.isValid()) {
      this.documentVerified = false;
      return;
    }
    this.documentVerified = true;
  }

  goBack = () => {
    this.router.navigateByUrl('/services/standing-order');
  };

  openVerifyBioDialog(): void {
    const user = this.customerData;

    const dialogRef = this.dialog.open(VerifyBioDialogComponent, {
      width: '50%',
      data: {
        searchFlow: false,
        accepted: this.fingerprintAccepted,
        user: user,
        hideSkipBio: true,
        dontNavigate: true,
        doNotOpenSkipModal: true,
        inProcess: true,
        standingOrder: true,
        ticketId: this.ticketId,
      },
    });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.submitStandingOrder(this.notifcationForm);
            }
        });
    }

    openSignatoriesDialog(data: any) {
        const user = this.customerData;
        const dialogRef = this.dialog.open(VerifySignatoryDialogComponent, {
            width: "50%",
            height: "auto",
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

        dialogRef.afterClosed().subscribe((result) => {
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

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.submitStandingOrder(this.notifcationForm);
      }
    });
  }
}
