import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, tap, filter } from 'rxjs';
import { AccountService } from '@app/core/services';

import { AccountMgt } from '@app/shared/models/common/account.model';
import { distinctUntilChanged } from 'rxjs/operators';
import { TranslatePipe } from '@ngx-translate/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-mm-equity-beneficiary',
  templateUrl: './mm-equity-beneficiary.component.html',
  styleUrl: './mm-equity-beneficiary.component.scss',
  imports: [TranslatePipe, ReactiveFormsModule, MatFormFieldModule, MatInputModule],
})
export class MmEquityBeneficiaryComponent implements OnDestroy, OnInit {
  @Input() form!: FormGroup;
  @Input() bankID!: string;
  @Input() selectedDebitAccount!: AccountMgt.Account;
  @Output() accountSelelected: EventEmitter<AccountMgt.Account> =
    new EventEmitter<AccountMgt.Account>();

  invalidAccountMessage: string = '';

  destroy$: Subject<any> = new Subject<any>();

  constructor(
    private accountService: AccountService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next('');
    this.destroy$.complete();
  }

  ngOnInit() {
    this.setSubscriptions();
  }

  setSubscriptions() {
    let creditAcc = this.form as FormGroup;

    creditAcc.controls['accountNumber'].valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(2000),
        distinctUntilChanged(),
        filter((accNumber: string) => {
          return this.validateBeneficiaryAccount(accNumber);
        })
      )
      .subscribe((accNumber: string) => {
        const cleanAccNumber = this.cleanAccountNumber(accNumber);
        const query = `?Id=${cleanAccNumber}&bankId=${this.bankID}&idType=accountid`;

        this.accountService
          .getAccount(query, true)
          .pipe(takeUntil(this.destroy$))
          .subscribe(resp => {
            if (resp.successful === false) {
              this.form.controls['accountNumber'].setErrors({
                invalidAccountNumber: true,
              });
            } else {
              this.form.controls['accountNumber'].setErrors(null);

              this.setAccountDetails(resp.responseObject.accounts[0]);
              this.accountSelelected.emit(resp.responseObject.accounts[0]);
            }

            this.changeDetectorRef.detectChanges();
          });
      });
  }

  private setAccountDetails(data: AccountMgt.Account) {
    this.form.controls['accountCurrency'].patchValue(data.accountCurrency);
    this.form.controls['accountholderName'].patchValue(data.accountName);
    this.form.controls['accountNumber'].patchValue(data.accountNumber);
    this.form.updateValueAndValidity();
  }

  private cleanAccountNumber(accNumber: string) {
    return String(accNumber).trim().replace(/\s+/g, '');
  }

  private validateBeneficiaryAccount(accNumber: string) {
    let isValid = true;
    isValid = this.checkIdenticalAccounts(accNumber);
    if (isValid) {
      isValid = this.checkAccountNumberIsNumeric(accNumber);
    }
    return isValid;
  }
  private checkIdenticalAccounts(accNumber: string) {
    const cleanAcc = this.cleanAccountNumber(accNumber);
    if (cleanAcc === this.selectedDebitAccount.accountNumber) {
      this.form.controls['accountNumber'].setErrors({
        matchesDebitAccount: true,
      });
      return false;
    } else {
      this.form.controls['accountNumber'].setErrors(null);
      return true;
    }
  }

  private checkAccountNumberIsNumeric(accNumber: string) {
    const cleanAcc = this.cleanAccountNumber(accNumber);
    if (!accNumber) return false;
    const isDigit = /^\d+$/.test(cleanAcc);
    if (!isDigit) {
      this.form.controls['accountNumber'].setErrors({
        invalidAccountNumber: true,
      });
      return false;
    }
    this.form.controls['accountNumber'].setErrors(null);
    return true;
  }
}
