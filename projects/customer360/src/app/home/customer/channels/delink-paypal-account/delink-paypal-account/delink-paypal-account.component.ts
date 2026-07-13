import { Component } from '@angular/core';
import { takeUntil, Subject } from 'rxjs';
import { AccountService } from '@app/core/services';
import { SessionService } from '@app/shared/services';
import { Router } from '@angular/router';
import { ToastService, MessageBoxType } from '@app/shared/modules/toast';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { WhiteSpaceValidator } from '@app/shared/directives/whitespace-validator';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-delink-paypal-account',
  templateUrl: './delink-paypal-account.component.html',
  styleUrls: ['./delink-paypal-account.component.scss'],
  imports: [
    MatToolbarModule,
    MatCardModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    ReactiveFormsModule,
    TranslatePipe,
  ],
})
export class DelinkPaypalAccountComponent {
    constructor(
        private accountService: AccountService,
        public session: SessionService,
        private router: Router,
        private toast: ToastService,
        private fb: FormBuilder
    ) {
        this.commentForm = this.fb.group({
            comments: ['', [WhiteSpaceValidator.containsOnlySpaces]],
            additionalComment: ["", [WhiteSpaceValidator.containsOnlySpaces]],
        });
    }
    destroy$: Subject<any> = new Subject<any>();
    account = JSON.parse(<string>localStorage.getItem('delinkedPayPalAccount'));
    linkedCustomerDetails = JSON.parse(
        <string>localStorage.getItem('linkedCustomerDetails')
    );
    accounts = JSON.parse(<string>localStorage.getItem('accounts'));
    activeChannel: any = JSON.parse(
        <string>localStorage.getItem('activeChannel')
    );
    permanent: string = 'permanent';
    provisional: string = 'provisional';

    commentForm!: FormGroup;

    delinkReasons = [
        'New PayPal account',
        'To link a USD account',
        'PayPal no longer in Use',
    ];

    public getAvatarName(name: string): string {
        let avatarArray: string;
        const nameArray = name?.split(' ');
        switch (nameArray?.length) {
            case 3:
                avatarArray = nameArray
                    .splice(0, 2)
                    ?.map(v => v.charAt(0).toUpperCase())
                    ?.join(' ');
                break;
            case 4:
                avatarArray = nameArray
                    .splice(0, 3)
                    ?.map(v => v.charAt(0).toUpperCase())
                    ?.join(' ');
                break;
            default:
                avatarArray = nameArray?.map(v => v.charAt(0).toUpperCase())?.join(' ');
                break;
        }

        return avatarArray;
    }
    delinkAccount() {
        const body = {
            customerId: this.linkedCustomerDetails?.cif,
            phoneNumber: this.linkedCustomerDetails?.phoneNumber,
            customerName: this.account.preferredName,
            requestedBy: this.session.user?.username,
            comment: this.commentForm.value.comments,
            additionalComment : this.commentForm.value.additionalComment,
            accountNumber: this.account?.linkedAccountNumber,
            primaryEmail: this.account?.primaryEmail
        };
        this.accountService
            .delinkPayPalAccount(body)
            .pipe(takeUntil(this.destroy$))
            .subscribe((res: any) => {
                if (res?.successful)
                    this.router
                        .navigateByUrl("/services/customer-360/channels")
                        .then(() =>
                            this.toast.show(
                                "",
                                "Delinking request sent to approver.",
                                MessageBoxType.SUCCESS,
                                5000, undefined, undefined, false
                            ),
                        );
                else
                    this.toast.show(
                        "",
                        "Delinking request not sent to approver",
                        MessageBoxType.DANGER,
                        5000, undefined, undefined, false
                    );
            });
    }
    quit() {
        this.router.navigateByUrl("/services/customer-360/channels");
    }
    submit() {
    }
}
