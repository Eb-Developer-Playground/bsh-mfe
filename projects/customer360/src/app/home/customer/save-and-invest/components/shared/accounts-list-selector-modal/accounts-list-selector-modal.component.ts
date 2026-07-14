import { DecimalPipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountService } from 'src/app/core/services/account/account.service';
import { SaveAndInvest } from 'src/app/shared/models/save-and-invest/save-and-invest.model';
import { ToastService } from 'src/app/shared/modules/toast';
import { MessageBoxType } from 'src/app/shared/modules/toast/models';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { InfoBoxComponent } from 'src/app/shared/components/info-box/info-box.component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-accounts-list-selector-modal',
  templateUrl: './accounts-list-selector-modal.component.html',
  styleUrls: ['./accounts-list-selector-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatIconModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatButtonModule,
    MatMenuModule,
    InfoBoxComponent,
    DecimalPipe,
    TranslatePipe,
  ],
})
export class AccountsListSelectorModalComponent implements OnInit {
  selectedAccount!: string;
  messageAccountType = {
    messageTitle: 'SAVE-INVEST.CALL-DEPOSIT.INFO-REQUIREMENTS',
    messageDetail: 'SAVE-INVEST.CALL-DEPOSIT.INFO-REQUIREMENTS-DETAILS-01',
  };

  constructor(
    public dialogRef: MatDialogRef<AccountsListSelectorModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialog: MatDialog,
    public toast: ToastService,
    private accountService: AccountService
  ) {}

  ngOnInit(): void {
    if (this.data?.selectedType) {
      switch (this.data?.selectedType) {
        case 'fixed':
          this.messageAccountType = {
            messageTitle: 'SAVE-INVEST.FIXED-DEPOSIT.INFO-REQUIREMENTS',
            messageDetail:
              'SAVE-INVEST.FIXED-DEPOSIT.INFO-REQUIREMENTS-DETAILS',
          };

          break;

        default:
          break;
      }

    }

  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  onSelectedAccount(option: any): void {
    this.selectedAccount = option.value;
  }

  getStarted(): void {
    this.dialogRef.close(this.selectedAccount);
  }

  checkBalance(account: SaveAndInvest.CustomerAccountsResponseArray) {

    const decimalPipe = new DecimalPipe('en-US');
    this.toast.show(
      `Available balance:`,
      `${account.accountCurreny} ${decimalPipe.transform(account.availableBalance, '1.2-2')}`,
      MessageBoxType.SUCCESS,
      5000, undefined, undefined, false
    );
  }
  activateAccount(accountNumber: string) {
    this.accountService.activateDormantAccount(accountNumber).subscribe((res) => {
      const accounts = res.responseObject.accounts;
      for (let i = 0; i < accounts.length; i++) {
        const accountActivated = accounts[i].activated;
        if (accountActivated) {
          this.toast.show(
            'Account activated successfully',
            '',
            MessageBoxType.SUCCESS,
            5000, undefined, undefined, false
          );
          setTimeout(() => {
            location.reload();
          }, 100);
        } else {
          this.toast.show(
            'Error activating account',
            res.responseObject.accounts[i].message,
            MessageBoxType.DANGER,
            5000, undefined, undefined, false
          );
        }
      }
      this.dialogRef.close();
    }, (error) => {
      this.dialogRef.close();
    });
  }

}
