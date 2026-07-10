import { ChannelsService } from 'src/app/core/services/channels/channels.service';
import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ReviewAccountRestrictionComponent } from '../review-account-restriction/review-account-restriction.component';
import { MessageBoxType, ToastService } from 'src/app/shared/modules/toast';
import { SessionService } from 'src/app/shared/services';
import { VerifyBioDialogComponent } from 'src/app/shared/components/verify-bio-dialog/verify-bio-dialog.component';
import { VerifySignatoryBioDialogComponent } from 'src/app/shared/components/verify-signatory-bio-dialog/verify-signatory-bio-dialog.component';
import { VerifySignatoryDialogComponent } from 'src/app/shared/components/verify-signatory-dialog/verify-signatory-dialog.component';
import { AccountManagementService } from 'src/app/core/services';
import { MatDialog } from '@angular/material/dialog';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-restrict-channel-account',
  templateUrl: './restrict-channel-account.component.html',
  styleUrls: ['./restrict-channel-account.component.scss'],
  imports: [
    MatToolbarModule,
    MatExpansionModule,
    MatCardModule,
    MatTableModule,
    MatSortModule,
    MatCheckboxModule,
    MatButtonModule,
    ReactiveFormsModule,
    TranslatePipe,
    RouterModule,
  ],
})
export class RestrictChannelAccountComponent implements OnInit {
  selectedAccChannel: any = JSON.parse(
    <string>localStorage.getItem('selectedAccChannel')
  );
  accounts = this.selectedAccChannel.accountPermissions;

  accountsLS: any = JSON.parse(<string>localStorage.getItem('accounts'));
  currentCustomer: any = JSON.parse(<string>localStorage.getItem('accMgntObj'));
  customerData: any = JSON.parse(
    <string>localStorage.getItem('customerDetails')
  );
  fingerprintAccepted = false;

  accountForm!: FormGroup;

  displayedColumns: string[] = ['linkedAccount', 'canView', 'canTransact'];

  customerInformationPayload: any;

  cifInquiryObj: any;
  isCustomerPresent: boolean = JSON.parse(
    <string>localStorage.getItem('show-bio-captured')
  );

  constructor(
    private ChannelsService: ChannelsService,
    public router: Router,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private toast: ToastService,
    private session: SessionService,
    private accountManagementService: AccountManagementService
  ) {}

  skipBio = (): boolean =>
    this.session.hasFeatureRole('AccountManagement.ViewWithReason') &&
    this.session.hasRole('AccountManagement.EfrontUser');

  ngOnInit(): void {
    // Initialize the form with sample data
    this.accountForm = this.fb.group({
      accounts: this.fb.array([]),
    });

    const accountArray = this.accountForm.get('accounts') as FormArray;
    this.accounts.forEach((account: any) => {
      accountArray.push(this.createAccountFormGroup(account));
    });

    this.cifInquiryObj = this.accountManagementService.getCustomerCifData();
  }

  get accountsFormControls() {
    return (this.accountForm.get('accounts') as FormArray).controls;
  }

  createAccountFormGroup(data: any = {}) {
    return this.fb.group({
      channelId: [this.selectedAccChannel.channel.id],
      accountId: [data.account.id, Validators.required],
      channelAccountPermissionId: [
        data.channelAccountPermissionId,
        Validators.required,
      ],
      canView: [{ value: data.canView, disabled: true }, [Validators.required]],
      canTransact: [data.canTransact, Validators.required],
      accountName: [data.account.AccountName, Validators.required],
      accountNumber: [data.account.accountNumber, Validators.required],
      accountType: [data.account.accountType, Validators.required],
    });
  }

  enableCanViewControls() {
    const accountArray = this.accountForm.get('accounts') as FormArray;
    accountArray.controls.forEach(
      (value: AbstractControl<any>, index: number) => {
        const accountGroup = value as FormGroup;
        accountGroup.get('canView')?.enable();
      }
    );
  }

  disableCanViewControls() {
    const accountArray = this.accountForm.get('accounts') as FormArray;
    accountArray.controls.forEach(
      (value: AbstractControl<any>, index: number) => {
        const accountGroup = value as FormGroup;
        accountGroup.get('canView')?.disable();
      }
    );
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

  openResctrictAccountReviewModal(formData: any[]) {
    const dialogRef = this.dialog.open(ReviewAccountRestrictionComponent, {
      width: '70rem',
      data: formData,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (this.isCustomerPresent) {
          this.launchBio();
        } else if (this.skipBio()) {
          this.restrictAccount(result);
        }
      } else {
        this.disableCanViewControls();
      }
    });
  }

    private restrictAccount(result: any) {
        this.ChannelsService.restrictChannelAccount(
            this.customerInformationPayload
        ).subscribe(
            (res) => {
                if (res.successful) {
                    // this.toast.show(res.statusMessage, "", MessageBoxType.SUCCESS);
                    this.toast.show(
                        "Account restrictions forwarded for approval.",
                        "",
                        MessageBoxType.SUCCESS,
                        5000, undefined, undefined, false
                    );
                    this.router.navigate(["/services/customer-360/channels"]);
                } else {
                    this.disableCanViewControls();
                }
            },
            (err) => {
                this.disableCanViewControls();
                this.toast.show(
                    err.error.statusMessage,
                    "",
                    MessageBoxType.DANGER,
                    5000, undefined, undefined, false
                );
            }
        );
    }

  onSubmit() {
    this.enableCanViewControls();
    const formData = this.accountForm.value;
    const newAccs = formData?.accounts?.map((acc: any) => {
      return {
        ChannelAccountPermissionId: acc.channelAccountPermissionId,
        AccountId: acc.accountId,
        AccountNumber: acc.accountNumber,
        CanTransact: acc.canTransact,
        TransactPermissions: null,
        CanView: acc.canView,
        ViewPermissions: null,
        ChannelId: acc.channelId,
        Channel: this.selectedAccChannel.channel.channel,
        Delete: false,
      };
    });
    this.customerInformationPayload = {
      customerId: this.customerData.cif,
      phoneNumber: this.preferredPhoneNumber,
      customerName:
        this.customerData.firstName + ' ' + this.customerData.lastName,
      requestedBy: this.session.user.username,
      comment: this.session.user.username,
      ChannelAccountPermissionModels: newAccs,
      ProfileSearch: {
        SearchParameter: 'CustomerId',
        SearchValue: this.customerData.cif,
      },
    };
    this.openResctrictAccountReviewModal(formData);
  }

  launchBio(): void {
    const result = 'canVerify';
    let filteredAccount = this.accountsLS.filter(
      (account: any) =>
        account.accountNumber === this.currentCustomer.accountsId
    );
    this.customerData.accounts = filteredAccount;
    if (filteredAccount[0].mandate !== 'SELF') {
      this.openSignatoriesDialog(result);
    } else {
      this.openVerifyBioDialog();
    }
  }

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
        restrictAccount: true,
        customerInformation: this.customerInformationPayload,
        inProcess: true,
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.fingerprintAccepted = result.data;
        this.router.navigateByUrl('/dashboard');
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
        restrictAccount: true,
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
        restrictAccount: true,
        customerInformation: this.customerInformationPayload,
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.fingerprintAccepted = result.data;
        this.router.navigateByUrl('/dashboard');
      }
    });
  }
}
