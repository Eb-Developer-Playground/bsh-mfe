import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { WhiteSpaceValidator } from '@app/shared/directives/whitespace-validator';
import { IUploadedDocument } from '@app/shared/modules/upload-docs';
import { SchedulePaymentService } from '@app/core/services/schedule-payment/schedule-payment.service';
import { AccountManagementService } from '@app/core/services';
import { CustomerProfileService } from '@app/core/services/customer-profile/customer-profile.service';
import { MessageBoxType, ToastService } from '@app/shared/modules/toast';
import { Router } from '@angular/router';

import { CifInquiryObject } from '@app/shared/models/common/cifinquiry.model';
import { VerifyBioDialogComponent } from '@app/shared/components/verify-bio-dialog/verify-bio-dialog.component';
import { VerifySignatoryBioDialogComponent } from '@app/shared/components/verify-signatory-bio-dialog/verify-signatory-bio-dialog.component';
import { VerifySignatoryDialogComponent } from '@app/shared/components/verify-signatory-dialog/verify-signatory-dialog.component';
import { SessionService } from '@app/shared/services/session/session.service';
import { MatDialog } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { DocumentsUploadComponent } from '@shared/modules/upload-docs';

@Component({
  selector: 'app-cancel-scheduled-payments',
  templateUrl: './cancel-scheduled-payments.component.html',
  styleUrls: ['./cancel-scheduled-payments.component.scss'],
  imports: [
    ReactiveFormsModule,
    TranslatePipe,
    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    DocumentsUploadComponent,
  ],
})
export class CancelScheduledPaymentsComponent implements OnInit, OnDestroy {
  attachedDocs!: IUploadedDocument[];
  schedule = JSON.parse(<string>localStorage.getItem('scheduleDetailss'));
  scheduleObj = this.schedule?.data;

  commentForm!: FormGroup;

  cifInquiryObj!: CifInquiryObject;

  accMgntObj: any = JSON.parse(<string>localStorage.getItem('accMgntObj'));

  accounts: any[] = JSON.parse(<string>localStorage.getItem('accounts')) || [];
  relatedAccounts: any[] =
    JSON.parse(<string>localStorage.getItem('relatedAccounts')) || [];
  customerData: any = JSON.parse(
    <string>localStorage.getItem('customerDetails')
  );
  filteredAccounts: any = [];
  isBusiness: boolean = JSON.parse(<string>localStorage.getItem('isBusiness'));
  fingerprintAccepted = false;

  customerInformationPayload: any;

  customerDetails: any = JSON.parse(
    <string>localStorage.getItem('customerDetails')
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
    this.commentForm = this.fb.group({
      comments: [
        '',
        [Validators.required, WhiteSpaceValidator.containsOnlySpaces],
      ],
    });
  }

  ngOnInit() {
    this.cifInquiryObj = this.accountManagementService.getCustomerCifData();
    let unfilteredAccounts: any[] = this.accounts.filter(
      (account: any) => account.schemeType !== 'LAA'
    );
    let combinedAccounts = [...unfilteredAccounts, ...this.relatedAccounts];
    this.filteredAccounts = combinedAccounts.filter(
      (account: any) => account.accountStatus === 'A'
    );
  }

  back() {
    window.history.back();
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
                            `Cancellation Request sent for approval and Documents uploaded successfully!`,
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
      Comment: this.commentForm.value.comments.trim(),
      CancelScheduled: {
        ScheduleId: this.scheduleObj.scheduleId,
        Reason: this.commentForm.value.comments.trim(),
      },
    };

        if (this.skipBio()) {
            this.SchedulePaymentService
                .cancelSchedulePayment(this.customerInformationPayload)
                .subscribe((res) => {
                    if (!res.successful) return;
                    this.toastService.show(
                        "Cancellation Request sent for approval successfully!",
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
        schedulePaymentAction: 'cancel',
        customerInformation: this.customerInformationPayload,
        inProcess: true,
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.reaponse) {
        if (this.attachedDocs?.length > 0) {
          this.uploadAndSubmitDocs(result.response.responseObject.id);
        } else {
          this.router.navigateByUrl(
            '/services/customer-360/channels/scheduled-payments'
          );
        }
      } else {
        this.router.navigateByUrl(
          '/services/customer-360/channels/cancel-scheduled-payments'
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
        schedulePaymentAction: 'cancel',
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
        schedulePayment: true,
        schedulePaymentAction: 'cancel',
        customerInformation: this.customerInformationPayload,
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.reaponse) {
        if (this.attachedDocs?.length > 0) {
          this.uploadAndSubmitDocs(result.response.responseObject.id);
        } else {
          this.router.navigateByUrl(
            '/services/customer-360/channels/scheduled-payments'
          );
        }
      } else {
        this.router.navigateByUrl(
          '/services/customer-360/channels/cancel-scheduled-payments'
        );
      }
    });
  }

  ngOnDestroy(): void {
    if (this.schedule) {
      localStorage.removeItem('scheduleDetailss');
    }
  }
}
