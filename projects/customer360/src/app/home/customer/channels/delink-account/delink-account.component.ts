import {Component} from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { takeUntil, Subject } from "rxjs";
import { AccountService } from "@app/core/services";
import { WhiteSpaceValidator } from "@app/shared/directives/whitespace-validator";
import { DelinkPrimaryComponent } from "../dialogs/delink-primary/delink-primary.component";
import { SessionService } from "@app/shared/services";
import { MatDialog } from '@angular/material/dialog';
import { Router } from "@angular/router";
import { ToastService, MessageBoxType } from "@app/shared/modules/toast";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatCardModule } from "@angular/material/card";
import { MatDividerModule } from "@angular/material/divider";
import { MatRadioModule } from "@angular/material/radio";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatButtonModule } from "@angular/material/button";
import { ReactiveFormsModule } from "@angular/forms";
import { DecimalPipe } from "@angular/common";
import { TranslatePipe } from "@ngx-translate/core";

@Component({
    selector: "app-delink-account",
    templateUrl: "./delink-account.component.html",
    styleUrls: ["./delink-account.component.scss"],
    imports: [
        MatToolbarModule,
        MatCardModule,
        MatDividerModule,
        MatRadioModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        ReactiveFormsModule,
        DecimalPipe,
        TranslatePipe,
    ],
})
export class DelinkAccountComponent {
    constructor(
        private accountService: AccountService,
        private formBuilder: FormBuilder,
        private dialog: MatDialog,
        public session: SessionService,
        private router: Router,
        private toast: ToastService,
    ) {
        this.delinkAccountForm = this.formBuilder.group({
            comments: ["", [WhiteSpaceValidator.containsOnlySpaces, Validators.required]],
            isPermanent: ["", [Validators.required]]
        });
    }
    destroy$: Subject<any> = new Subject<any>();
    account = JSON.parse(<string>localStorage.getItem("delinkedAccount"));
    linkedCustomerDetails = JSON.parse(
        <string>localStorage.getItem("linkedCustomerDetails"),
    );
    linkedAccounts = JSON.parse(
        <string>localStorage.getItem("linkedProfileAccounts"),
    );
    relatedAccounts = JSON.parse(
        <string>localStorage.getItem("relatedAccounts"),
    )
    accounts = JSON.parse(<string>localStorage.getItem("accounts"));
    activeChannel: any = JSON.parse(
        <string>localStorage.getItem("activeChannel"),
    );
    isPrimary: boolean = false;
    delinkAccountForm!: FormGroup;


    delinkReasons = [
        'Suspicious Activity',
        'Compromised Credentials',
        'Privacy Concerns',
        'Technical Challenges'
    ]


    public getAvatarName(name: string): string {
        let avatarArray: string;
        const nameArray = name?.split(" ");
        switch (nameArray?.length) {
            case 3:
                avatarArray = nameArray
                    .splice(0, 2)
                    ?.map((v) => v.charAt(0).toUpperCase())
                    ?.join(" ");
                break;
            case 4:
                avatarArray = nameArray
                    .splice(0, 3)
                    ?.map((v) => v.charAt(0).toUpperCase())
                    ?.join(" ");
                break;
            default:
                avatarArray = nameArray
                    ?.map((v) => v.charAt(0).toUpperCase())
                    ?.join(" ");
                break;
        }

        return avatarArray;
    }
    delinkAccount(isPrimary: boolean) {
        if (isPrimary) {
            this.openDialog();
        } else {
            const body = {
                customerId: this.linkedCustomerDetails?.cif,
                phoneNumber: this.linkedCustomerDetails?.phoneNumber,
                customerName: this.account.accountName,
                requestedBy: this.session.user?.username,
                comment: this.delinkAccountForm.value.comments,
                accounts: [
                    {
                        accountNumber: this.account.accountNumber,
                        isPermanent: this.delinkAccountForm.value.isPermanent
                    },
                ],
            };

            this.accountService
                .delinkAccount(body)
                .pipe(takeUntil(this.destroy$))
                .subscribe((res: any) => {
                    if (res?.successful) {
                        this.router
                            .navigateByUrl("/services/customer-360/channels")
                            .then((r: any) =>
                                this.toast.show(
                                    "",
                                    res.statusMessage,
                                    MessageBoxType.SUCCESS,
                                    5000, undefined, undefined, false
                                ),
                            );
                    } else
                        this.toast.show(
                            "",
                            res.statusMessage ?? "Delinking request not sent to approver",
                            MessageBoxType.DANGER,
                            5000, undefined, undefined, false
                        );
                });
        }
    }
    getBalance(accountNumber: any) {
        const acc = this.getAccount(accountNumber)[0];
        const found = this.getAccount(accountNumber)[1];
        const related = this.getAccount(accountNumber)[2];
        if (acc || found || related) return acc?.availableBalance || found?.accountBalance || related?.availableBalance;
        else return 0;
    }
    getRole(mandate: string, accountNumber: any) {
        let role = "";
        const acc = this.getAccount(accountNumber)[0];
        const found = this.getAccount(accountNumber)[1];
        const related = this.getAccount(accountNumber)[2];
        if (mandate) {
            if (mandate === "SELF") role = "Main signatory";
            else role = "Related/Joint signatory";
        } else {
            mandate = acc?.mandate || found?.mandate || related?.mandate ;
            if (mandate) {
                if (mandate === "SELF") role = "Main signatory";
                else role = "Related/Joint signatory";
            } else role = "Known Agent";
        }
        return role;
    }
    getAccount(accountNumber: any) {
        const acc = this.accounts?.find(
            (acc: any) => acc.accountNumber == accountNumber,
        );
        const found = this.linkedAccounts?.find(
            (acc: any) => acc.accountNumber == accountNumber,
        );
        const related = this.relatedAccounts?.find(
            (acc: any) => acc.accountNumber == accountNumber,
        );
        // console.log('RelatedAccount', related);
        return [acc, found, related];
    }
    openDialog(): void {
        const dialogRef = this.dialog.open(DelinkPrimaryComponent, {
            data: {
                accounts: this.linkedAccounts?.filter(
                    (acc: any) =>
                        acc.accountNumber !== this.account.accountNumber,
                ),
            },
            width: "540px",
        });

        dialogRef.afterClosed().subscribe((result) => {});
    }
    quit() {
        this.router.navigateByUrl("/services/customer-360/channels");
    }

}
