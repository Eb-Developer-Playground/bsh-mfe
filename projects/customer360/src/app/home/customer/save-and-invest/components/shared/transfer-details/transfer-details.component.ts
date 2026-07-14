import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { SaveAndInvestDataStoreService } from 'src/app/core/services/save-and-invest/save-and-invest-data-store.service';
import { SaveAndInvestService } from 'src/app/core/services/save-and-invest/save-and-invest.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslatePipe } from '@ngx-translate/core';
import { GenericErrorStateMatcher } from 'src/app/shared/utils/genericErrorStateMatcher';

@Component({
  selector: 'app-transfer-details',
  templateUrl: './transfer-details.component.html',
  styleUrls: ['./transfer-details.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    TranslatePipe,
  ],
})
export class TransferDetailsComponent implements OnInit {
  @Input() form!: UntypedFormGroup;
  @Input() mainLabel!: string;

  public accounts: Array<any> = [];
  public matcher = new GenericErrorStateMatcher();

  constructor(
    private saveAndInvestService: SaveAndInvestService,
    private saveAndInvestDataStoreService: SaveAndInvestDataStoreService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.getSourceAccount();
  }

  initForm = () => {
    // temp
    const accountInfo =
      this.saveAndInvestDataStoreService.getSelectedDepositAccount();
    const transferAmountValue = this.isFixedDepositAccount
      ? accountInfo.availableBalance
      : '';
    this.form = this.form || new UntypedFormGroup({});
    this.form.addControl(
      'creditAccount',
      new UntypedFormControl({ value: '', disabled: true }, Validators.required)
    );
    this.form.addControl(
      'transferAmount',
      new UntypedFormControl(
        { value: transferAmountValue, disabled: this.isFixedDepositAccount },
        Validators.required
      )
    );
  };

  getSourceAccount = () => {
    const accountInfo =
      this.saveAndInvestDataStoreService.getSelectedDepositAccount();
    this.saveAndInvestService
      .getBreakAccounts(accountInfo.accountNumber)
      .subscribe(res => {
        if (!res.successful) return;
        this.accounts.push({ accountNumber: res.responseObject });
        this.form.patchValue({
          creditAccount: res.responseObject,
        });
      });
  };

  get isFixedDepositAccount(): boolean {
    const accountInfo =
      this.saveAndInvestDataStoreService.getSelectedDepositAccount();
    return accountInfo.accountType === 'TD410';
  }
}
