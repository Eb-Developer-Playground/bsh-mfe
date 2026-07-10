import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { AccountStatementService } from '@app/shared/services/account-statement';
import { ChargeAccountStatementPayloadChargeOption } from '@app/home/customer/account-statements/models/account-statement';

@Component({
  selector: 'app-dialog-statement',
  templateUrl: './dialog-statement.component.html',
  styleUrls: ['./dialog-statement.component.scss'],
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    TranslatePipe,
  ],
})
export class DialogStatementComponent implements OnInit {
  dataObject!: any;

  constructor(
    public dialogRef: MatDialogRef<DialogStatementComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private accountStatmentService: AccountStatementService
  ) {}

  ngOnInit(): void {
    this.data;
  }

  closeDialog(confirm: boolean): void {
    this.dialogRef.close(confirm);
  }

  onConfrm() {
    if (this.data.isErrorDialog) {
      this.closeDialog(true);
      return;
    }
    ChargeAccountStatementPayloadChargeOption;
    const {
      bankId, certify, commFlag, noOfPages, accountId, taskId,
      selectedAccountId, waiveCharges, waiveReason, subsidiary,
    } = this.data.payload;
    let chargeOption;
    if (waiveCharges) {
      chargeOption = ChargeAccountStatementPayloadChargeOption.WaiveCharges;
    } else {
      chargeOption = selectedAccountId === accountId
        ? ChargeAccountStatementPayloadChargeOption.Account
        : ChargeAccountStatementPayloadChargeOption.AlternateAccount;
    }
    this.accountStatmentService
      .chargeAccountStatement({
        AlternateAccountId: accountId, BankId: bankId, Certify: certify,
        CommFlag: commFlag, NoofPages: noOfPages, ChargeOption: chargeOption,
        WaiveReason: waiveCharges && subsidiary?.countryCode === 'UG' ? waiveReason : undefined,
      }, taskId)
      .subscribe(result => { this.closeDialog(true); });
  }
}
