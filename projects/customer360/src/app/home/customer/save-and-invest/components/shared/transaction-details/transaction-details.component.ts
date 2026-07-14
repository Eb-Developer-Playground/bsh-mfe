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
import { MatSelectModule } from '@angular/material/select';
import { TranslatePipe } from '@ngx-translate/core';
import { GenericErrorStateMatcher } from 'src/app/shared/utils/genericErrorStateMatcher';

@Component({
  selector: 'app-transaction-details',
  templateUrl: './transaction-details.component.html',
  styleUrls: ['./transaction-details.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    TranslatePipe,
  ],
})
export class TransactionDetailsComponent implements OnInit {
  @Input() form!: UntypedFormGroup;

  public accounts: Array<any> = [];
  public matcher = new GenericErrorStateMatcher();

  constructor(
    private saveAndInvestService: SaveAndInvestService,
    private saveAndInvestDataStoreService: SaveAndInvestDataStoreService
  ) {
    const accountInfo =
      this.saveAndInvestDataStoreService.getSelectedDepositAccount();
    this.saveAndInvestService
      .getBreakAccounts(accountInfo.accountNumber)
      .subscribe(res => {
        if (res.successful) {
          this.accounts.push({ accountNumber: res.responseObject });
        }
      });
  }

  ngOnInit(): void {
    // temp
    this.form = this.form || new UntypedFormGroup({});
    this.form.addControl(
      'debitAccount',
      new UntypedFormControl('', Validators.required)
    );
    this.form.addControl(
      'effectiveDate',
      new UntypedFormControl('', Validators.required)
    );
  }
}
