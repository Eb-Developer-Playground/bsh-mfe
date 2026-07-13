import {Component, Inject, OnDestroy} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {Subject, takeUntil} from 'rxjs';
import {CustomerService} from '@app/core/services/customer/customer.service';
import {VerifyBioDialogComponent} from '@app/shared/components/verify-bio-dialog/verify-bio-dialog.component';
import {
    VerifySignatoryBioDialogComponent
} from '@app/shared/components/verify-signatory-bio-dialog/verify-signatory-bio-dialog.component';
import {
    VerifySignatoryDialogComponent
} from '@app/shared/components/verify-signatory-dialog/verify-signatory-dialog.component';
import {VerifySkipBioComponent} from '@app/shared/components/verify-skip-bio/verify-skip-bio.component';
import {WhiteSpaceValidator} from '@app/shared/directives/whitespace-validator';
import {MessageBoxType, ToastService} from '@app/shared/modules/toast';
import {SessionService} from '@app/shared/services';
import {CustomerProfileData} from '../channels.model';
import {MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef,} from '@angular/material/dialog';
import {isDev, isUat} from '@app/shared/utils';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatRadioModule} from '@angular/material/radio';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
    selector: 'app-channel-comment-dialog',
    templateUrl: './channel-comment-dialog.component.html',
    styleUrls: ['./channel-comment-dialog.component.scss'],
    imports: [
        ReactiveFormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatRadioModule,
        MatButtonModule,
        MatIconModule,
        TranslatePipe,
    ],
})
export class ChannelCommentDialogComponent implements OnDestroy {
    commentForm!: FormGroup;
    customerData: any = JSON.parse(
        <string>localStorage.getItem('customerDetails')
    );
    accounts: any = JSON.parse(<string>localStorage.getItem('accounts'));
    fingerprintAccepted: boolean = false;
    currentCustomer: any = JSON.parse(<string>localStorage.getItem('accMgntObj'));
    private destroy$: Subject<boolean> = new Subject();

    isCustomerPresent: any = JSON.parse(
        <string>localStorage.getItem('show-bio-captured')
    );

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        public dialogRef: MatDialogRef<ChannelCommentDialogComponent>,
        private toast: ToastService,
        private formBuilder: FormBuilder,
        private sessionService: SessionService,
        private customerService: CustomerService,
        private router: Router,
        private dialog: MatDialog
    ) {
        this.commentForm = this.formBuilder.group({
            comments: ['', [Validators.required, WhiteSpaceValidator.containsOnlySpaces]],
            otpDestination: ['Sms', [Validators.required]]
        });
    }

    skipBio = (): boolean =>
        this.sessionService.hasFeatureRole('AccountManagement.ViewWithReason') &&
        this.sessionService.hasRole('AccountManagement.EfrontUser');

    submit() {
        this.data.comment = this.commentForm.value.comments;
        this.data.otpDestination = this.commentForm.value.otpDestination;

        // make bio pop up for uat env for users access app with customer present journey
        if ((isDev() || isUat()) && this.isCustomerPresent) {
            this.launchBio();
        } else {
            if (this.skipBio()) {
                if (this.data.action === "Register Channel") {
                    this.registerCustomer();
                }
                else this.updateProfile();
            } else {
                this.launchBio();
            }
        }
    }

    registerCustomer() {
        const customerData: any = this.data;

        let key = "action";
        delete customerData[key];
        this.customerService
            .sendCustomerRegistrationRequest(customerData)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: ((res: any) => {
                    if (!res.successful) return;
                    this.toast.show(
                        "Ticket submitted to Checker.",
                        "",
                        MessageBoxType.SUCCESS,
                        5000, undefined, undefined, false
                    );
                    this.dialogRef.close();
                    this.router.navigateByUrl("/dashboard").then(r => {});
                }),
                error: (() => {
                    // this.toast.show(
                    //     err.error.statusMessage,
                    //     "",
                    //     MessageBoxType.DANGER,
                    // );
                })
            })
    }

    isString (value: any): boolean {
        return typeof value === 'string';
    }

    updateProfile() {
        let customerData: CustomerProfileData = this.data;

        delete customerData['action'];
        this.customerService.updateCustomerProfile(customerData).subscribe({
            next: res => {
                if (!res.successful) return;
                if (customerData.actionName === 'BlockChannel') {
                    this.toast.show(
                        'Channel Blocked Successfully.',
                        '',
                        MessageBoxType.SUCCESS,
                        5000,
                        undefined,
                        undefined,
                        false
                    );
                    this.dialogRef.close();
                } else {
                    this.toast.show(
                        'Ticket submitted to Checker.',
                        '',
                        MessageBoxType.SUCCESS,
                        5000,
                        undefined,
                        undefined,
                        false
                    );
                    this.dialogRef.close();
                }
                this.router.navigateByUrl('/dashboard').then(r => {});
            },
            error: () => {
                // this.toast.show(
                //     err.error.statusMessage,
                //     "",
                //     MessageBoxType.DANGER,
                // );
            },
        });
    }

    launchBio(): void {
        this.dialogRef.close();
        const result = 'canVerify';

        this.customerData.accounts = this.accounts.filter(
            (account: any) => account.mandate === "SELF",
        );

        // check if cif is business
        let isCifBusiness = JSON.parse(
            <string>localStorage.getItem("isBusiness"),
        );

        if (isCifBusiness) {
            this.openSignatoriesDialog(result);
        } else {
            this.openVerifyBioDialog();
        }
        // if (filteredAccount[0].mandate !== "SELF") {
        //     this.openSignatoriesDialog(result);
        // } else {
        //     this.openVerifyBioDialog();
        // }
    }

    openVerifyBioDialog(): void {
        const user = this.customerData;

        const customerInformation: any = this.data;
        const key = 'action';
        const action = customerInformation[key];
        delete customerInformation[key];
        const dialogRef = this.dialog.open(VerifyBioDialogComponent, {
            width: '50%',
            data: {
                searchFlow: false,
                accepted: this.fingerprintAccepted,
                user: user,
                hideSkipBio: true,
                inProcess: true,
                customerInformation: customerInformation,
                customerRegistration: action === 'Register Channel',
                customerProfile:
                    action === 'ResetPassword' ||
                    action === 'ChangeProfileLevel' ||
                    action === 'UnblockProfile' ||
                    action === 'UnblockChannel' ||
                    action === 'BlockChannel',
                doNotRedirectOnSuccess: true,
            },
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.fingerprintAccepted = result.data;
                // this.router.navigateByUrl("/dashboard");
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
                inProcess: true,
                hideSkipBio: true,
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

    openVerifySignatoryBioDialog(signatories: any) {
        const user = this.customerData;
        const customerInformation: any = this.data;

        const key = 'action';
        const action = customerInformation[key];
        delete customerInformation[key];
        const dialogRef = this.dialog.open(VerifySignatoryBioDialogComponent, {
            data: {
                accepted: this.fingerprintAccepted,
                user: user,
                hideSkipBio: true,
                signatories: signatories,
                inProcess: true,
                customerInformation: customerInformation,
                customerRegistration: action === 'Register Channel',
                customerProfile:
                    action === 'ResetPassword' ||
                    action === 'ChangeProfileLevel' ||
                    action === 'UnblockProfile' ||
                    action === 'UnblockChannel' ||
                    action === 'BlockChannel',
            },
        });

        dialogRef.afterClosed().subscribe((result: any) => {
            if (result) {
                this.fingerprintAccepted = result.data;
                this.toast.show(
                    "Success",
                    "Action submitted successfully",
                    MessageBoxType.SUCCESS,
                    5000, undefined, undefined, false
                );

                this.router.navigateByUrl('/dashboard').then(r => {});
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

        dialogRef.afterClosed().subscribe(result => {});
    }

    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.complete();
    }
}
