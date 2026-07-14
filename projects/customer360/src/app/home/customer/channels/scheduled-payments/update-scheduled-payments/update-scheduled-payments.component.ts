import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CustomerProfileService } from '@app/core/services/customer-profile/customer-profile.service';
import { MessageBoxType, ToastService } from '@app/shared/modules/toast';
import { IUploadedDocument } from '@app/shared/modules/upload-docs';
import { SessionService } from '@app/shared/services';
import { SchedulePaymentService } from '@app/core/services/schedule-payment/schedule-payment.service';
import { AccountManagementService } from '@app/core/services';

import { CifInquiryObject } from '@app/shared/models/common/cifinquiry.model';
import { VerifyBioDialogComponent } from '@app/shared/components/verify-bio-dialog/verify-bio-dialog.component';
import { VerifySignatoryBioDialogComponent } from '@app/shared/components/verify-signatory-bio-dialog/verify-signatory-bio-dialog.component';
import { VerifySignatoryDialogComponent } from '@app/shared/components/verify-signatory-dialog/verify-signatory-dialog.component';

import { MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { DocumentsUploadComponent } from '@shared/modules/upload-docs';

export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'YYYY-MM-DD',
  },
  display: {
    dateInput: 'YYYY-MM-DD',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'YYYY-MM-DD',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};
@Component({
  selector: 'app-update-scheduled-payments',
  templateUrl: './update-scheduled-payments.component.html',
  styleUrls: ['./update-scheduled-payments.component.scss'],
  providers: [
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
  ],
  imports: [
    ReactiveFormsModule,
    FormsModule,
    TranslatePipe,
    DatePipe,
    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatExpansionModule,
    MatDividerModule,
    MatButtonModule,
    MatCardModule,
    DocumentsUploadComponent,
  ],
})
export class UpdateScheduledPaymentsComponent implements OnInit, OnDestroy {
  attachedDocs!: IUploadedDocument[];
  schedule = JSON.parse(<string>localStorage.getItem('scheduleDetailss'));
  scheduleObj = this.schedule?.data;

  form!: FormGroup;

  cifInquiryObj!: CifInquiryObject;

  accMgntObj: any = JSON.parse(<string>localStorage.getItem('accMgntObj'));

  accounts: any = JSON.parse(<string>localStorage.getItem('accounts')) || [];
  relatedAccounts: any =
    JSON.parse(<string>localStorage.getItem('relatedAccounts')) || [];
  customerData: any = JSON.parse(
    <string>localStorage.getItem('customerDetails')
  );
  filteredAccounts: any = [];
  combinedAccounts: any = [];
  isBusiness: boolean = JSON.parse(<string>localStorage.getItem('isBusiness'));
  fingerprintAccepted = false;

  customerInformationPayload: any;

  customerDetails: any = JSON.parse(
    <string>localStorage.getItem('customerDetails')
  );

  frequency: any[] = [];
  frequencyOfReminder: any[] = [];
  notificationOfReminder = [
    {
      label: '1 day before payment',
      frequencyOfReminder: 1,
      notificationReminder: 'DailyReminder',
    },
    {
      label: '2 days before payment',
      frequencyOfReminder: 2,
      notificationReminder: 'DailyReminder',
    },
    {
      label: '3 days before payment',
      frequencyOfReminder: 3,
      notificationReminder: 'DailyReminder',
    },
    {
      label: '5 days before payment',
      frequencyOfReminder: 5,
      notificationReminder: 'DailyReminder',
    },
    {
      label: '1 week before payment',
      frequencyOfReminder: 1,
      notificationReminder: 'WeeklyReminder',
    },
    {
      label: "Don't remind me",
      frequencyOfReminder: 0,
      notificationReminder: 'DontRemindMe',
    },
  ];

  preselectedOption: any;

  tomorrow = new Date();
  minEndDate = new Date();

  linkedAccounts: any[] = JSON.parse(
    <string>localStorage.getItem('linkedProfileAccounts')
  );

  constructor(
    public router: Router,
    public dialog: MatDialog,
    private fb: FormBuilder,
    private SchedulePaymentService: SchedulePaymentService,
    private accountManagementService: AccountManagementService,
    private toastService: ToastService,
    private customerProfileService: CustomerProfileService,
    private session: SessionService
  ) {
    this.preselectNotificationReminder();
    this.tomorrow.setDate(this.tomorrow.getDate() + 1); // Set tomorrow's date
  }

  ngOnInit() {
    this.getfrequency();

    //this.getfrequencyOfReminder();
    this.cifInquiryObj = this.accountManagementService.getCustomerCifData();
    // let unfilteredAccounts: any = this.accounts.filter(
    //     (account: any) => account.schemeType !== "LAA"
    // );
    // this.combinedAccounts = [...unfilteredAccounts, ...this.relatedAccounts];
    // this.filteredAccounts = this.combinedAccounts.filter(
    //     (account: any) => account.accountStatus === "A"
    // );

    this.filteredAccounts = this.linkedAccounts?.filter(
      (account: any) =>
        account.accountAuthorization === 0 && account.status === 'Active'
    );

    this.form = this.fb.group({
      amount: [this.scheduleObj?.amount, [Validators.required]],
      amountCurrency: [this.scheduleObj?.amountCurrency],
      frequency: [this.scheduleObj?.frequency, [Validators.required]],
      startDate: [this.scheduleObj?.startDate, [Validators.required]],
      endDate: [this.scheduleObj?.endDate, [Validators.required]],
      nextDueDate: [this.scheduleObj?.nextDueDate],
      comments: ['', [Validators.required, this.noWhitespaceValidator]],
      notificationReminder: [this.scheduleObj?.notificationReminder],
      degreeOfFrequency: [this.scheduleObj?.degreeOfFrequency],
      frequencyOfReminder: [this.scheduleObj?.frequencyOfReminder],
      sourceAccount: [this.scheduleObj?.sourceAccount, [Validators.required]],
      reference: [this.scheduleObj?.transaction?.reference],
      signature: [this.scheduleObj?.transaction?.signature],
      documents: [this.scheduleObj?.transaction?.documents],
      destinationAccount: [this.scheduleObj?.transaction?.destinationAccount],
      destinationBankCode: [this.scheduleObj?.transaction?.destinationBankCode],
      destinationCountry: [this.scheduleObj?.transaction?.destinationCountry],
      destinationName: [this.scheduleObj?.transaction?.destinationName],
      billerCode: [this.scheduleObj?.transaction?.billerCode],
      billName: [this.scheduleObj?.transaction?.billName],
      billAccountNumber: [this.scheduleObj?.transaction?.billAccountNumber],
      phoneNumber: [this.scheduleObj?.transaction?.phoneNumber],
      telco: [this.scheduleObj?.transaction?.telco],
      customField: [this.preselectedOption],
    });

    this.form
      .get('frequency')
      ?.valueChanges.subscribe(value => this.onFrequencyChange());
    this.form
      .get('startDate')
      ?.valueChanges.subscribe(value => this.onStartDateChange(value));
    this.form
      .get('endDate')
      ?.valueChanges.subscribe(value => this.onEndDateChange(value));
  }

  preselectNotificationReminder() {
    const notificationReminder = this.scheduleObj?.notificationReminder;
    const frequencyOfReminder = this.scheduleObj?.frequencyOfReminder;
    this.preselectedOption = this.notificationOfReminder.find(
      option =>
        option.notificationReminder === notificationReminder &&
        option.frequencyOfReminder === frequencyOfReminder
    );
  }

  onNotificationReminderChange(event: any) {
    const selectedOption = this.notificationOfReminder.find(
      option => option === event.value
    );
    if (selectedOption) {
      this.form.patchValue({
        customField: selectedOption,
        notificationReminder: selectedOption.notificationReminder,
        frequencyOfReminder: selectedOption.frequencyOfReminder,
      });
    }
  }

  onFrequencyChange() {
    const frequency = this.form.get('frequency')?.value;
    const startDate = this.form.get('startDate')?.value;

    if (frequency === 'OneOff') {
      this.form.get('endDate')?.setValue(startDate);
      this.minEndDate = startDate;
    } else if (frequency === 'Daily') {
      this.minEndDate = new Date(new Date(startDate).getTime() + 1 * 86400000);
    } else if (frequency === 'Weekly') {
      this.minEndDate = new Date(new Date(startDate).getTime() + 7 * 86400000);
    } else if (frequency === 'BiWeekly') {
      this.minEndDate = new Date(new Date(startDate).getTime() + 14 * 86400000);
    } else if (frequency === 'Monthly') {
      this.minEndDate = this.addMonths(new Date(startDate), 1);
    } else if (frequency === 'Quarterly') {
      this.minEndDate = this.addMonths(new Date(startDate), 3);
    } else if (frequency === 'HalfYearly') {
      this.minEndDate = this.addMonths(new Date(startDate), 6);
    } else if (frequency === 'Yearly') {
      this.minEndDate = this.addYears(new Date(startDate), 1);
    }

    this.validateDates();
  }

  onEndDateChange(event: any) {
    this.validateDates();
  }

  onStartDateChange(event: any) {
    const startDate = event.value;
    const frequency = this.form.get('frequency')?.value;

    if (frequency === 'OneOff') {
      this.form.get('endDate')?.setValue(startDate);
      this.minEndDate = startDate;
    } else if (frequency === 'Daily') {
      this.minEndDate = new Date(new Date(startDate).getTime() + 1 * 86400000);
    } else if (frequency === 'Weekly') {
      this.minEndDate = new Date(new Date(startDate).getTime() + 7 * 86400000);
    } else if (frequency === 'BiWeekly') {
      this.minEndDate = new Date(new Date(startDate).getTime() + 14 * 86400000);
    } else if (frequency === 'Monthly') {
      this.minEndDate = this.addMonths(new Date(startDate), 1);
    } else if (frequency === 'Quarterly') {
      this.minEndDate = this.addMonths(new Date(startDate), 3);
    } else if (frequency === 'HalfYearly') {
      this.minEndDate = this.addMonths(new Date(startDate), 6);
    } else if (frequency === 'Yearly') {
      this.minEndDate = this.addYears(new Date(startDate), 1);
    }

    this.validateDates();
  }

  validateDates() {
    const startDate = this.form.get('startDate')?.value;
    const endDate = this.form.get('endDate')?.value;

    if (startDate && endDate) {
      if (new Date(startDate).getTime() > new Date(endDate).getTime()) {
        this.form.get('endDate')?.setErrors({ invalid: true });
        this.form.get('startDate')?.setErrors({ invalid: true });
      } else {
        this.form.get('endDate')?.setErrors(null);
        this.form.get('startDate')?.setErrors(null);
      }

      if (new Date(endDate).getTime() < new Date(this.minEndDate).getTime()) {
        this.form.get('endDate')?.setErrors({ minDate: true });
        this.form.get('endDate')?.markAsTouched();
      } else {
        this.form.get('endDate')?.setErrors(null);
      }
    }
  }

  startDateFilter = (d: Date | null): boolean => {
    if (!d) return false;
    return d >= new Date();
  };

  // Custom validator function to check for whitespace
  noWhitespaceValidator(control: FormControl) {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { whitespace: true };
  }

  getfrequencyOfReminder() {
    this.SchedulePaymentService.fetchReminders().subscribe((res: any) => {
      this.frequencyOfReminder = res;
    });
  }

  getfrequency() {
    this.SchedulePaymentService.fetchFrequency().subscribe((res: any) => {
      this.frequency = res;
    });
  }

  skipBio = (): boolean =>
    this.session.hasFeatureRole('AccountManagement.ViewWithReason') &&
    this.session.hasRole('AccountManagement.EfrontUser');
  submit(): void {
    const result = 'canVerify';
    let filteredAccount = this.accounts.filter(
      (account: any) => account.accountNumber === this.accMgntObj.accountsId
    );
    this.customerData.accounts = filteredAccount;

    this.customerInformationPayload = {
      CustomerId: this.accMgntObj.cif,
      PhoneNumber: this.preferredPhoneNumber,
      CustomerName:
        this.customerDetails.firstName + ' ' + this.customerDetails.lastName,
      RequestedBy: this.session.user.username,
      Comment: this.form.value.comments.trim(),
      UpdateSchedule: {
        RequestId: this.scheduleObj?.scheduleId,
        Schedule: {
          Frequency: this.form.value.frequency,
          DegreeOfFrequency: this.form.value.degreeOfFrequency,
          FrequencyOfReminder: this.form.value.frequencyOfReminder,
          NotificationReminder: this.form.value.notificationReminder,
          NextDueDate: this.formatDate(this.form.value.nextDueDate),
          StartDate: this.formatDate(this.form.value.startDate),
          EndDate: this.formatDate(this.form.value.endDate),
        },
        Transaction: {
          AmountCurrency: this.form.value.amountCurrency,
          Amount: this.form.value.amount,
          FrequencyOfReminder: this.form.value.frequencyOfReminder,
          SourceAccount: this.form.value.sourceAccount,
          Signature: this.form.value.signature,
          Reference: this.form.value.reference,
          //Documents: this.attachedDocs?.map((d) => d.document),
          Documents: this.form.value.documents,
        },
      },
    };

        if (this.skipBio()) {
            this.SchedulePaymentService
                .updateSchedulePayment(this.customerInformationPayload)
                .subscribe((res) => {
                    if (!res.successful) return;
                    this.toastService.show(
                        "Update request sent for approval successfully!",
                        "",
                        MessageBoxType.SUCCESS,
                        5000, undefined, undefined, false
                    );

        if (this.attachedDocs?.length > 0) {
          this.uploadAndSubmitDocs(res.responseObject.id);
        } else {
          this.router.navigateByUrl(
            '/services/customer-360/channels/scheduled-payments'
          );
        }
      });
    } else {
      if (filteredAccount[0]?.mandate !== 'SELF' || this.isBusiness) {
        this.openSignatoriesDialog(result);
      } else {
        this.openVerifyBioDialog();
      }
    }
  }

  get preferredPhoneNumber(): any {
    const phoneNumbers = this.cifInquiryObj.contactDetails?.phoneNumbers || [];
    const preferredPhoneNumberObj = phoneNumbers.find(
      (phoneNumber: any) => !!phoneNumber.preferred
    );

    let preferredPhoneNumber;
    if (
      !preferredPhoneNumberObj?.countryCode &&
      !preferredPhoneNumberObj?.cityCode
    ) {
      preferredPhoneNumber = preferredPhoneNumberObj?.number;
    } else if (!preferredPhoneNumberObj?.countryCode) {
      preferredPhoneNumber =
        preferredPhoneNumberObj?.cityCode + preferredPhoneNumberObj?.number;
    } else if (!preferredPhoneNumberObj?.cityCode) {
      preferredPhoneNumber =
        preferredPhoneNumberObj?.countryCode + preferredPhoneNumberObj?.number;
    } else {
      preferredPhoneNumber =
        preferredPhoneNumberObj?.countryCode +
        preferredPhoneNumberObj?.cityCode +
        preferredPhoneNumberObj?.number;
    }
    return preferredPhoneNumber;
  }

  uploadAndSubmitDocs(ticketNumber: string) {
    const newgenDocs = this.attachedDocs
      .filter(d => !d.success)
      .map(d => d.document);
    newgenDocs.forEach(d => (d.data = d.data.split(',')[1]));
    const data = {
      CIF: this.accMgntObj.cif,
      AccountNumber: this.accMgntObj.accountsId,
      Country: this.session.userCountryCode,
      ticketNumber: ticketNumber.toString(),
      idType: 'CustomerId',
      Service: 'NewGen',
      documents: newgenDocs,
    };

        this.customerProfileService.uploadSoftDeleteDocuments(data).subscribe(
            (docRes) => {
                if (docRes.successful && docRes.responseObject) {
                    const docs = docRes.responseObject;
                    const isErrorFile = docs.some((doc: any) => !doc.success);
                    if (isErrorFile) {
                        docs.forEach((doc: any) => {
                            if (!doc.success) {
                                this.toastService.show(
                                    "Error",
                                    `Failed to upload ${doc.filename}. Reason: ${doc.message}`,
                                    MessageBoxType.DANGER,
                                    5000, undefined, undefined, false
                                );
                            }
                        });
                        return;
                    } else {
                        this.toastService.show(
                            "",
                            `Update request sent for approval and Documents uploaded successfully!`,
                            MessageBoxType.SUCCESS,
                            5000, undefined, undefined, false
                        );
                        this.router.navigateByUrl(
                            "/services/customer-360/channels/scheduled-payments"
                        );
                    }
                }
            },
            (docErr) => console.log(docErr)
        );
    }

  back() {
    window.history.back();
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
        dontNavigate: true,
        doNotOpenSkipModal: true,
        schedulePayment: true,
        schedulePaymentAction: 'update',
        customerInformation: this.customerInformationPayload,
        inProcess: true,
      },
    });

        dialogRef.afterClosed().subscribe((result: any) => {
            if (result.response) {
                if (this.attachedDocs?.length > 0) {
                    this.uploadAndSubmitDocs(result.response.responseObject.id);
                } else {
                    this.router.navigateByUrl(
                        "/services/customer-360/channels/scheduled-payments"
                    );
                }
            } else {
                this.router.navigateByUrl(
                    "/services/customer-360/channels/update-scheduled-payments"
                );
            }
        });
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
        schedulePayment: true,
        schedulePaymentAction: 'update',
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
        schedulePayment: true,
        schedulePaymentAction: 'update',
        customerInformation: this.customerInformationPayload,
      },
    });

        dialogRef.afterClosed().subscribe((result: any) => {
            if (result.response) {
                if (this.attachedDocs?.length > 0) {
                    this.uploadAndSubmitDocs(result.response.responseObject.id);
                } else {
                    this.router.navigateByUrl(
                        "/services/customer-360/channels/scheduled-payments"
                    );
                }
            } else {
                this.router.navigateByUrl(
                    "/services/customer-360/channels/update-scheduled-payments"
                );
            }
        });
    }

  ngOnDestroy(): void {
    if (this.schedule) {
      localStorage.removeItem('scheduleDetailss');
    }
  }

  private addMonths(date: Date, months: number): Date {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
  }

  private addYears(date: Date, years: number): Date {
    const d = new Date(date);
    d.setFullYear(d.getFullYear() + years);
    return d;
  }

  private formatDate(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
