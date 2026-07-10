import { Component, Inject, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AccountStatementService } from 'src/app/core/services/account-statement/account-statement.service';
import {
  ChargeAccountStatementPayload,
  ChargeAccountStatementPayloadChargeOption,
} from 'src/app/home/customer/account-statements/models/account-statement';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { COMPAT_IMPORTS } from '../../../compat-barrel';

@Component({
  selector: 'app-dialog-statement',
  templateUrl: './dialog-statement.component.html',
  styleUrls: ['./dialog-statement.component.scss'],
  imports: [COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
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
    // For error dialog, confirm just closes it to allow amendment.
    if (this.data.isErrorDialog) {
      this.closeDialog(true);
      return;
    }
    ChargeAccountStatementPayloadChargeOption;
    const {
      bankId,
      certify,
      commFlag,
      noOfPages,
      accountId,
      taskId,
      selectedAccountId,
      waiveCharges,
      waiveReason,
      subsidiary,
    } = this.data.payload;
    let chargeOption;
    if (waiveCharges) {
      chargeOption = ChargeAccountStatementPayloadChargeOption.WaiveCharges;
    } else {
      chargeOption =
        selectedAccountId === accountId
          ? ChargeAccountStatementPayloadChargeOption.Account
          : ChargeAccountStatementPayloadChargeOption.AlternateAccount;
    }

    const chargeCountries = ['UG', 'SS', 'RW', 'TZ', 'KE'];
    if (chargeCountries.includes(subsidiary?.countryCode)) {
      this.closeDialog(true);
    } else {
      this.accountStatmentService // @ts-ignore
        .chargeAccountStatement(
          {
            AlternateAccountId: accountId,
            BankId: bankId,
            Certify: certify,
            CommFlag: commFlag,
            NoofPages: noOfPages,
            ChargeOption: chargeOption,
            // Include waive reason if charges are being waived
            // @ts-ignore
            WaiveReason: waiveCharges ? waiveReason : undefined,
          },
          taskId
        )
        .subscribe((result: any) => {
          this.closeDialog(true);
        });
    }
  }
}
